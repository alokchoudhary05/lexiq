"""
backend/chat.py — Public Chat API

The only two functions the FastAPI layer needs to call:
  lexiq_chat(raw_input, session_id, mode)   → dict  (non-streaming)
  lexiq_chat_stream(raw_input, session_id)  → generator of (type, data)

All other logic (retrieval, web search, chain building) is delegated
to the appropriate sub-modules.
"""

import re
import logging

from langchain.chains import create_retrieval_chain
from langchain.chains import create_history_aware_retriever
from langchain_core.runnables.history import RunnableWithMessageHistory

import backend.state as state
from .config    import ACT_CONFIG, ACT_UNIT, MAX_DISPLAY_SOURCES, COMMAND_MAP
from .language  import detect_language
from .retriever import retrieve, _select_retriever
from .web_search import (
    web_search_fallback,
    web_search_fallback_stream,
    _not_law_message,
    _no_info_message,
)
from .session import get_session_history

logger = logging.getLogger("LexIQ.chat")


# ── Input helpers ──────────────────────────────────────────────────────────────

def parse_user_command(raw_input: str) -> tuple:
    """
    Detect slash-command prefixes (e.g. \\bns, \\tax) and strip them.

    Returns:
      (clean_query, act_filter_or_None, label_string)
    """
    stripped = raw_input.strip()
    for pattern, cfg in COMMAND_MAP.items():
        m = re.match(pattern, stripped, re.IGNORECASE)
        if m:
            clean_query = stripped[m.end():].strip()
            return clean_query, cfg.get("act_filter"), cfg["label"]
    return raw_input.strip(), None, "Auto"


def format_sources(context_docs: list) -> list:
    """
    Build human-readable source citations from retrieved doc metadata.
    Limited to MAX_DISPLAY_SOURCES entries.
    """
    sources = []
    for doc in context_docs:
        meta     = doc.metadata
        act      = meta.get("act", "")
        act_name = next(
            (cfg["full_name"] for cfg in ACT_CONFIG.values() if cfg["act"] == act),
            act,
        )
        unit = ACT_UNIT.get(act, "Section")
        sec  = meta.get("section_number", "")
        title = meta.get("section_title", "")[:45]
        src  = f"{act_name} — {unit} {sec}: {title}".strip(": ")
        sources.append(src)
    unique = list(dict.fromkeys(sources))
    return unique[:MAX_DISPLAY_SOURCES]


# ── Response post-processing ───────────────────────────────────────────────────

def _strip_llm_sources(text: str) -> str:
    """Remove any LLM-hallucinated '📚 Sources' section from the answer."""
    pattern = r'\n*(?:\*{0,2})📚\s*\*{0,2}\s*(?:Sources|स्रोत)\*{0,2}\s*\n[-•\*].*'
    return re.sub(pattern, '', text, flags=re.DOTALL | re.IGNORECASE).rstrip()


def _strip_emojis(text: str) -> str:
    """Strip all Unicode emoji / symbol characters while keeping markdown intact."""
    emoji_re = re.compile(
        "[\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F700-\U0001F77F"
        "\U0001F780-\U0001F7FF"
        "\U0001F800-\U0001F8FF"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF"
        "\U00002600-\U000026FF"
        "\U00002700-\U000027BF"
        "\U00002300-\U000023FF"
        "\U0001F1E0-\U0001F1FF"
        "]+",
        flags=re.UNICODE,
    )
    return emoji_re.sub('', text).strip()


def _clean(text: str) -> str:
    return _strip_emojis(_strip_llm_sources(text))


# ── Dynamic per-query chain builder ───────────────────────────────────────────

def _build_dynamic_chain(selected_retriever):
    """
    Build a fresh RunnableWithMessageHistory chain for a specific retriever.
    Called per-request so the correct domain retriever is used.
    """
    hist_ret   = create_history_aware_retriever(
        state.llm, selected_retriever, state.contextualize_prompt
    )
    dynamic_rag = create_retrieval_chain(hist_ret, state.question_answer_chain)
    return RunnableWithMessageHistory(
        dynamic_rag,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )


# ── Non-streaming chat (kept for compatibility / testing) ──────────────────────

def lexiq_chat(raw_input: str, session_id: str = "default", mode: str = "chat") -> dict:
    """
    Synchronous (non-streaming) chat handler.
    Returns a complete response dict.
    """
    query, act_filter, label = parse_user_command(raw_input)

    if not query:
        return {"answer": "Please enter a legal question.",
                "label": label, "sources": [], "source_type": "none"}

    lang = detect_language(query)
    logger.info(f"[Chat] session={session_id} | label={label} | lang={lang} | query={query[:60]}")

    # ── Summarize mode ─────────────────────────────────────────────────────────
    if mode == "summarize":
        docs, _, _ = retrieve(query, act_filter=act_filter)
        result     = state.summarize_chain.invoke({"input_documents": docs})
        return {"answer": result["output_text"], "label": label,
                "sources": [], "source_type": "documents"}

    docs, route, needs_web = retrieve(query, act_filter=act_filter)

    # ── NOT_LAW: instant rejection ─────────────────────────────────────────────
    if route == "not_law":
        logger.info(f"[Chat][NotLaw] Rejecting in lang={lang}")
        return {
            "answer": _not_law_message(lang),
            "label": label, "lang": lang,
            "sources": [], "source_type": "none", "route": "not_law",
        }

    # ── Web fallback ───────────────────────────────────────────────────────────
    if needs_web:
        logger.info(f"[Chat][WebFallback] route={route}")
        web_result = web_search_fallback(query, act_filter or "", route, lang)
        if web_result["source_type"] == "web":
            return {
                "answer": _clean(web_result["answer"]),
                "label": label, "lang": lang,
                "sources": web_result.get("sources", []),
                "source_type": "web", "route": route,
            }

    # ── RAG chain ──────────────────────────────────────────────────────────────
    selected_retriever = _select_retriever(act_filter, route, query)
    logger.info(f"[Chat][Chain] route={route}")
    dynamic_chain = _build_dynamic_chain(selected_retriever)

    response    = dynamic_chain.invoke(
        {"input": query},
        config={"configurable": {"session_id": session_id}},
    )
    answer_text = _clean(response["answer"])

    return {
        "answer": answer_text,
        "label": label, "lang": lang,
        "sources": format_sources(response.get("context", [])),
        "source_type": "documents", "route": route,
    }


# ── Streaming chat (used by FastAPI SSE endpoint) ──────────────────────────────

def lexiq_chat_stream(raw_input: str, session_id: str = "default"):
    """
    Streaming chat handler — yields (type, data) tuples.

    Event types:
      ('status',   str)   — status messages during retrieval phase
      ('token',    str)   — individual LLM output tokens
      ('metadata', dict)  — final metadata dict (sources, lang, route, etc.)
    """
    query, act_filter, label = parse_user_command(raw_input)

    if not query:
        yield ("metadata", {
            "answer": "Please enter a legal question.",
            "label": label, "sources": [], "source_type": "none",
        })
        return

    lang = detect_language(query)
    logger.info(
        f"[Stream] session={session_id} | label={label} | lang={lang} | query={query[:60]}"
    )

    # ── Phase 1: Retrieval ─────────────────────────────────────────────────────
    yield ("status", "Searching legal documents...")
    docs, route, needs_web = retrieve(query, act_filter=act_filter)

    # ── Phase 1a: NOT_LAW — instant rejection, zero LLM call ──────────────────
    if route == "not_law":
        logger.info(f"[Stream][NotLaw] Rejecting in lang={lang}")
        rejection_msg = _not_law_message(lang)
        yield ("token", rejection_msg)
        yield ("metadata", {
            "answer": rejection_msg,
            "label": label, "lang": lang,
            "sources": [], "source_type": "none", "route": "not_law",
        })
        return

    # ── Phase 2a: Web fallback ─────────────────────────────────────────────────
    if needs_web:
        logger.info(f"[Stream][WebFallback] route={route}")
        yield ("status", "Searching the web...")

        full_answer = ""
        web_meta    = {}
        for event_type, data in web_search_fallback_stream(
            query, act_filter or "", route, lang
        ):
            if event_type == "token":
                full_answer += data
                yield ("token", data)
            elif event_type == "metadata":
                web_meta = data

        if web_meta.get("source_type") == "web":
            yield ("metadata", {
                "answer":      _clean(full_answer),
                "label":       label,
                "lang":        lang,
                "sources":     web_meta.get("sources", []),
                "source_type": "web",
                "route":       route,
            })
            return

        # Web returned nothing useful
        no_info = web_meta.get("answer", _no_info_message(lang))
        yield ("token", no_info)
        yield ("metadata", {
            "answer":      no_info,
            "label":       label,
            "lang":        lang,
            "sources":     [],
            "source_type": "none",
            "route":       route,
        })
        return

    # ── Phase 2b: RAG chain streaming ──────────────────────────────────────────
    yield ("status", "Generating response...")

    selected_retriever = _select_retriever(act_filter, route, query)
    logger.info(f"[Stream][Chain] route={route}")
    dynamic_chain = _build_dynamic_chain(selected_retriever)

    full_answer  = ""
    context_docs = []

    for chunk in dynamic_chain.stream(
        {"input": query},
        config={"configurable": {"session_id": session_id}},
    ):
        if "answer" in chunk and chunk["answer"]:
            token = chunk["answer"]
            full_answer += token
            yield ("token", token)

        if "context" in chunk and chunk["context"]:
            context_docs = chunk["context"]

    yield ("metadata", {
        "answer":      _clean(full_answer),
        "label":       label,
        "lang":        lang,
        "sources":     format_sources(context_docs),
        "source_type": "documents",
        "route":       route,
    })
