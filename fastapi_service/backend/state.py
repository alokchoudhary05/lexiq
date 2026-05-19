"""
backend/state.py — LexIQ Runtime Application State

Single source of truth for all singleton objects that are created during
engine initialization and shared across modules.  All variables start as
None and are populated by backend.engine.initialize_engine().

Import pattern in other modules:
    import backend.state as state
    ...
    state.llm.invoke(...)
"""

from typing import Optional, Dict, Any

# ── Embedding / ML models ──────────────────────────────────────────────────────
embeddings        = None   # OpenAIEmbeddings
multilingual_model = None  # SentenceTransformer

# ── Parsed document store ──────────────────────────────────────────────────────
all_chunks      = None   # list[Document] — all chunks across all acts
chunks_by_ns    = None   # dict[namespace → list[Document]]
all_sections    = None   # list[Document] — pre-chunking sections
sections_by_act = None   # dict[act → list[Document]]

# ── BM25 retrievers per namespace ──────────────────────────────────────────────
bm25_by_ns = None        # dict[namespace → BM25Retriever]

# ── Ensemble retrievers (Pinecone vector + BM25) ───────────────────────────────
ret_default_criminal = None
ret_bns_only         = None
ret_crpc_only        = None
ret_ipc_only         = None
ret_ipc_comparison   = None
ret_tax_all          = None
ret_ita_only         = None
ret_itr_only         = None
ret_dont_know        = None

# ── Command → retriever mapping ────────────────────────────────────────────────
COMMAND_TO_RETRIEVER: Optional[Dict[str, Any]] = None

# ── LLM instances ──────────────────────────────────────────────────────────────
llm              = None   # gpt-4o — main reasoning model
_classifier_llm  = None   # gpt-4o-mini — fast query classifier
_classifier_chain = None  # classifier_prompt | _classifier_llm
_classify_cache: Dict[str, str] = {}   # query_key → route

# ── LangChain chains ───────────────────────────────────────────────────────────
question_answer_chain = None   # stuff_documents_chain
rag_chain             = None   # retrieval_chain (non-conversational)
conversational_chain  = None   # RunnableWithMessageHistory
summarize_chain       = None   # map_reduce summarize chain
contextualize_prompt  = None   # ChatPromptTemplate for history-aware retrieval

# ── Chat session memory ────────────────────────────────────────────────────────
chat_store: Dict[str, Any] = {}   # session_id → ChatMessageHistory

# ── Tavily client (lazy-init) ──────────────────────────────────────────────────
_tavily_client = None

# ── Engine boot flag ───────────────────────────────────────────────────────────
_engine_initialized: bool = False
