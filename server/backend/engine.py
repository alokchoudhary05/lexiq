"""
backend/engine.py — LexIQ Engine Orchestrator (Production-optimised)

Startup sequence:
  Embeddings → Load BM25 from bm25_indices → Pinecone connect →
  Ensemble Retrievers → Classifier LLM → Main LLM → Chain building

NO PDF loading at runtime — BM25 pkl files are committed to git
and load in <1 second each.  All vector data lives in Pinecone cloud.

Cold start: ~15-20 seconds (was 2-3 minutes when loading PDFs).

If a pkl file is missing, that namespace falls back to pure Pinecone
automatically — no crash, graceful degradation.

Public API:
  initialize_engine() → bool
"""

import os
import logging

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from pinecone import Pinecone

import backend.state as state
from .config import EMBEDDING_MODEL, EMBEDDING_DIM, INDEX_NAME
from .retriever  import build_retrievers, load_bm25_from_cache
from .classifier import build_classifier
from .chains     import build_chains

logger = logging.getLogger("LexIQ.engine")


def initialize_engine() -> bool:
    """
    Boot the LexIQ AI engine (production-optimised).

    BM25 pkl files are loaded from bm25_indices/ (committed to git).
    PDFs are NOT loaded at runtime — they are only needed locally
    to re-index Pinecone or rebuild BM25 indices (rare, one-time op).

    Returns True on success. Safe to call multiple times (no-op).
    """
    if state._engine_initialized:
        logger.info("[Engine] Already initialized — skipping")
        return True

    logger.info("[Engine] Initializing LexIQ engine...")

    try:
        # ── Step 1: OpenAI Embeddings ─────────────────────────────────────────
        embeddings = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
            dimensions=EMBEDDING_DIM,
        )
        logger.info(f"[Engine] Embeddings ready: {EMBEDDING_MODEL}")

        # ── Step 2: Load BM25 from pre-built indices ──────────────────────────
        # pkl files (~5 MB total) are committed to git and load in <1s each.
        # If any pkl is missing, that namespace uses pure Pinecone as fallback.
        bm25_by_ns = load_bm25_from_cache()
        if bm25_by_ns:
            logger.info(f"[Engine] BM25 loaded for namespaces: {list(bm25_by_ns.keys())}")
        else:
            logger.warning("[Engine] No BM25 indices found — using pure Pinecone for all namespaces")

        # ── Step 3: Verify Pinecone connection ────────────────────────────────
        pc    = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
        index = pc.Index(INDEX_NAME)
        logger.info(f"[Engine] Connected to Pinecone index: {INDEX_NAME}")

        # ── Step 4: Build Pinecone + BM25 ensemble retrievers ─────────────────
        build_retrievers(embeddings, bm25_by_ns)

        # ── Step 5: Classifier LLM (fast, cheap — gpt-4o-mini) ────────────────
        classifier_llm = ChatOpenAI(
            model_name="gpt-4o-mini",
            temperature=0,
            max_tokens=20,
        )
        build_classifier(classifier_llm)
        logger.info("[Engine] Classifier ready (gpt-4o-mini)")

        # ── Step 6: Main LLM (reasoning — gpt-4o) ────────────────────────────
        state.llm = ChatOpenAI(
            model_name="gpt-4o",
            temperature=0.1,
            max_tokens=2048,
        )
        logger.info("[Engine] Main LLM ready (gpt-4o)")

        # ── Step 7: Build LangChain chains ────────────────────────────────────
        build_chains(state.llm)

        # ── Step 8: Init session store ────────────────────────────────────────
        state.chat_store = {}

        state._engine_initialized = True
        logger.info("[Engine] LexIQ engine fully initialized ✓")
        return True

    except Exception as exc:
        logger.error(f"[Engine] Initialization failed: {exc}", exc_info=True)
        raise RuntimeError(f"LexIQ engine initialization failed: {exc}") from exc
