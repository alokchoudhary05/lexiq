"""
backend/retriever.py — Document Retrieval Layer

Builds Pinecone vector + BM25 ensemble retrievers for each legal
namespace, and exposes the high-level retrieve() function used by
the chat pipeline.

Public API:
  build_retrievers(embeddings, chunks_by_ns, pc_index)  → sets state.*
  retrieve(query, act_filter) → (docs, route, needs_web)
  _select_retriever(act_filter, route, query) → retriever | None
"""

import re
import pickle
import logging
from collections import defaultdict
from pathlib import Path

from langchain_pinecone import PineconeVectorStore
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever

import backend.state as state
from .config import (
    INDEX_NAME, RETRIEVAL_K, PRIORITY_MAP, BM25_INDEX_DIR,
)
from .language import translate_query_for_retrieval, detect_language
from .classifier import classify_query

logger = logging.getLogger("LexIQ.retriever")


# ── BM25 cache helpers ─────────────────────────────────────────────────────────

def _bm25_cache_path(ns: str, chunks: list) -> Path:
    key  = f"{ns}_{len(chunks)}_{abs(hash(chunks[0].page_content[:40]))}"
    safe = re.sub(r'[^a-zA-Z0-9_]', '', key)
    return BM25_INDEX_DIR / f"bm25_{safe}.pkl"


def _load_or_build_bm25(ns: str, chunks: list, k: int = RETRIEVAL_K) -> BM25Retriever:
    """Load BM25 retriever from disk cache, or build and cache it."""
    cache_path = _bm25_cache_path(ns, chunks)
    if cache_path.exists():
        with open(cache_path, "rb") as fh:
            retriever = pickle.load(fh)
        logger.info(f"[BM25] [{ns}] loaded from bm25_indices ({cache_path.name})")
        return retriever

    retriever = BM25Retriever.from_documents(chunks, k=k)
    with open(cache_path, "wb") as fh:
        pickle.dump(retriever, fh)
    logger.info(f"[BM25] [{ns}] built and saved to bm25_indices ({cache_path.name})")
    return retriever


# ── BM25 cache loader (used by engine.py at startup) ──────────────────────────

# Known namespace prefixes (used to match pkl filenames → namespace)
_KNOWN_NAMESPACES = [
    "criminal_bns",
    "criminal_crpc",
    "criminal_ipc",
    "tax_ita",
    "tax_itr",
]


def load_bm25_from_cache() -> dict:
    """
    Load pre-built BM25 retrievers from bm25_indices/*.pkl files.

    Files are matched by namespace prefix:
      bm25_criminal_bns_474_*.pkl  →  namespace='criminal_bns'

    Returns {namespace: BM25Retriever}.
    Returns empty dict if no pkl files found (engine degrades gracefully
    to pure Pinecone for all namespaces).
    """
    bm25_by_ns = {}
    for ns in _KNOWN_NAMESPACES:
        matched = list(BM25_INDEX_DIR.glob(f"bm25_{ns}_*.pkl"))
        if matched:
            pkl_path = matched[0]  # take first match
            try:
                with open(pkl_path, "rb") as fh:
                    retriever = pickle.load(fh)
                bm25_by_ns[ns] = retriever
                logger.info(f"[BM25] [{ns}] loaded from bm25_indices: {pkl_path.name}")
            except Exception as exc:
                logger.warning(f"[BM25] [{ns}] failed to load {pkl_path.name}: {exc}")
        else:
            logger.warning(f"[BM25] [{ns}] no pkl found — will use pure Pinecone")
    return bm25_by_ns


# ── Retriever factory ──────────────────────────────────────────────────────────

def _make_pinecone_retriever(ns: str) -> object:
    return PineconeVectorStore(
        index_name=INDEX_NAME,
        embedding=state.embeddings,
        namespace=ns,
    ).as_retriever(search_type="similarity", search_kwargs={"k": RETRIEVAL_K})


def _make_ensemble(ns_list: list) -> EnsembleRetriever:
    sem_retrievers  = [_make_pinecone_retriever(ns) for ns in ns_list]
    bm25_retrievers = [state.bm25_by_ns[ns] for ns in ns_list if ns in state.bm25_by_ns]
    all_retrievers  = sem_retrievers + bm25_retrievers
    n_sem  = len(sem_retrievers)
    n_bm25 = len(bm25_retrievers)
    weights = (
        [0.6 / n_sem]  * n_sem  if n_sem  else []
    ) + (
        [0.4 / n_bm25] * n_bm25 if n_bm25 else []
    )
    return EnsembleRetriever(retrievers=all_retrievers, weights=weights)


def build_retrievers(embeddings, bm25_by_ns: dict = None) -> None:
    """
    Build all Pinecone + BM25 ensemble retrievers.
    Called once by engine.initialize_engine().

    Args:
      embeddings  — OpenAI embeddings object
      bm25_by_ns  — pre-loaded {namespace: BM25Retriever} from pkl index.
                    If empty/None, all retrievers fall back to pure Pinecone.
    """
    state.embeddings = embeddings
    state.bm25_by_ns = bm25_by_ns or {}

    has_bm25 = bool(state.bm25_by_ns)
    mode     = "Hybrid (Pinecone + BM25)" if has_bm25 else "Pure Pinecone (BM25 indices missing)"
    logger.info(f"[Retriever] Building retrievers — mode: {mode}")

    # Ensemble retrievers (BM25 automatically included if pkl was loaded)
    state.ret_default_criminal = _make_ensemble(["criminal_bns", "criminal_crpc"])
    state.ret_bns_only         = _make_ensemble(["criminal_bns"])
    state.ret_crpc_only        = _make_ensemble(["criminal_crpc"])
    state.ret_ipc_only         = _make_ensemble(["criminal_ipc"])
    state.ret_ipc_comparison   = _make_ensemble(["criminal_bns", "criminal_ipc"])
    state.ret_tax_all          = _make_ensemble(["tax_ita", "tax_itr"])
    state.ret_ita_only         = _make_ensemble(["tax_ita"])
    state.ret_itr_only         = _make_ensemble(["tax_itr"])
    state.ret_dont_know        = _make_ensemble(
        ["criminal_bns", "criminal_crpc", "tax_ita", "tax_itr"]
    )

    state.COMMAND_TO_RETRIEVER = {
        "BNS":       state.ret_bns_only,
        "CRPC":      state.ret_crpc_only,
        "IPC":       state.ret_ipc_only,
        "ITA":       state.ret_ita_only,
        "ITR":       state.ret_itr_only,
        "TAX":       state.ret_tax_all,
        "CRIMINAL":  state.ret_default_criminal,
        "DONT_KNOW": state.ret_dont_know,
    }
    logger.info(f"[Retriever] All ensemble retrievers ready ({mode})")


# ── Doc utilities ──────────────────────────────────────────────────────────────

def deduplicate_docs(docs: list) -> list:
    """Remove duplicate chunks by (act, section_number, content prefix)."""
    seen, unique = set(), []
    for doc in docs:
        key = (
            doc.metadata.get("act"),
            doc.metadata.get("section_number"),
            doc.page_content[:100],
        )
        if key not in seen:
            seen.add(key)
            unique.append(doc)
    return unique


def check_relevance(docs: list, query: str, route: str) -> bool:
    """
    Return True (needs_web=True) when the retrieved docs are not
    semantically relevant enough to answer the query.

    Acts as a safety net after classifier routing — catches edge cases
    where the right namespace was searched but docs are still off.
    """
    if not docs:
        return True
    if route in ("web_search", "not_law"):
        return True

    retrieved_acts = {d.metadata.get("act", "") for d in docs}

    criminal_routes = {"criminal_query", "crpc_query", "ipc_query"}
    tax_routes      = {"tax_query"}

    # Hard domain mismatch
    if route in criminal_routes:
        if retrieved_acts and retrieved_acts.issubset({"ITA", "ITR"}):
            logger.info("[Relevance] Domain mismatch — criminal query / only tax docs")
            return True
    if route in tax_routes:
        if retrieved_acts and retrieved_acts.issubset({"BNS", "CRPC", "IPC"}):
            logger.info("[Relevance] Domain mismatch — tax query / only criminal docs")
            return True

    # Low keyword overlap → force web fallback
    query_terms = set(re.findall(r'\b\w{4,}\b', query.lower()))
    if query_terms:
        doc_text  = " ".join(d.page_content.lower() for d in docs[:3])
        doc_terms = set(re.findall(r'\b\w{4,}\b', doc_text))
        overlap   = len(query_terms & doc_terms) / len(query_terms)
        if overlap < 0.15:
            logger.info(f"[Relevance] Low keyword overlap ({overlap:.2f}) — web fallback")
            return True

    logger.info(f"[Relevance] RAG sufficient — {len(docs)} docs from {retrieved_acts}")
    return False


# ── Primary retrieval function ─────────────────────────────────────────────────

def retrieve(query: str, act_filter: str = None, k: int = RETRIEVAL_K):
    """
    Route the query and retrieve relevant documents.

    Returns:
      docs      — list[Document]
      route     — routing decision string
      needs_web — bool: True means caller should fall back to web search
    """
    retrieval_query = translate_query_for_retrieval(query)
    route = classify_query(retrieval_query)
    logger.info(
        f"[Retrieve] route={route} | lang={detect_language(query)} | filter={act_filter}"
    )

    # Short-circuit routes that skip DB entirely
    if route in ("not_law", "web_search"):
        return [], route, (route == "web_search")

    # Select retriever
    if act_filter and act_filter.upper() in (state.COMMAND_TO_RETRIEVER or {}):
        retriever = state.COMMAND_TO_RETRIEVER[act_filter.upper()]

    elif route == "cross_law_comparison":
        has_tax_kw = any(w in retrieval_query.lower() for w in ["tax", "income", "tds"])
        if "ipc" in retrieval_query.lower():
            retriever = state.ret_ipc_comparison
        elif has_tax_kw:
            retriever = state.ret_dont_know
        else:
            retriever = state.ret_default_criminal

    elif route == "tax_query":
        retriever = state.ret_tax_all

    elif route == "crpc_query":
        retriever = state.ret_crpc_only

    elif route == "ipc_query":
        retriever = state.ret_ipc_only

    elif route == "criminal_query":
        retriever = state.ret_default_criminal

    else:
        logger.warning(f"[Retrieve] Unexpected route '{route}' — fallback to ret_dont_know")
        retriever = state.ret_dont_know

    docs = retriever.invoke(retrieval_query)
    docs = deduplicate_docs(docs)

    # Boost exact section match to top
    sec_match = re.search(
        r'(?:section|rule)\s*(\d+[A-Za-z]?)', retrieval_query, re.IGNORECASE
    )
    if sec_match:
        target = sec_match.group(1)
        exact  = [d for d in docs if d.metadata.get("section_number") == target]
        rest   = [d for d in docs if d.metadata.get("section_number") != target]
        docs   = exact + rest

    # Balance docs across acts for comparison queries
    if route == "cross_law_comparison":
        docs_by_act = defaultdict(list)
        for doc in docs:
            docs_by_act[doc.metadata.get("act", "?")].append(doc)
        if len(docs_by_act) > 1:
            balanced = []
            for act_docs in docs_by_act.values():
                balanced.extend(act_docs[:2])
            docs = balanced

    docs.sort(key=lambda d: PRIORITY_MAP.get(d.metadata.get("act", ""), 99))

    needs_web = check_relevance(docs[:k], retrieval_query, route)
    return docs[:k], route, needs_web


def _select_retriever(act_filter: str, route: str, query: str):
    """
    Select a retriever based on act_filter or classified route.
    Returns None for routes that bypass DB (web_search, not_law).
    """
    if act_filter and act_filter.upper() in (state.COMMAND_TO_RETRIEVER or {}):
        return state.COMMAND_TO_RETRIEVER[act_filter.upper()]

    if route in ("web_search", "not_law"):
        return None

    q_lower = query.lower()
    route_map = {
        "criminal_query":     state.ret_default_criminal,
        "crpc_query":         state.ret_crpc_only,
        "ipc_query":          state.ret_ipc_only,
        "tax_query":          state.ret_tax_all,
    }
    if route in route_map:
        return route_map[route]

    if route == "cross_law_comparison":
        if "ipc" in q_lower:
            return state.ret_ipc_comparison
        if any(w in q_lower for w in ["tax", "income", "tds"]):
            return state.ret_dont_know
        return state.ret_default_criminal

    logger.warning(f"[SelectRetriever] Unknown route '{route}' — fallback to ret_dont_know")
    return state.ret_dont_know
