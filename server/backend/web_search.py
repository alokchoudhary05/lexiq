"""
backend/web_search.py — Tavily Web Search Fallback

Handles queries that exceed the local RAG database scope by calling
Tavily's search API and synthesising an answer with the main LLM.

Both a synchronous (non-streaming) and an SSE-streaming variant are
provided.  The FastAPI layer exclusively uses the streaming variant.

Public API:
  web_search_fallback(query, act_filter, route, lang) → dict
  web_search_fallback_stream(query, act_filter, route, lang) → generator
"""

import os
import re
import logging

from tavily import TavilyClient

import backend.state as state
from .config import WEB_DOMAIN_PREFIXES
from .prompts import WEB_SEARCH_INSTRUCTIONS

logger = logging.getLogger("LexIQ.web_search")

# ── Act section reference patterns (for source extraction) ─────────────────────
_ACT_PATTERNS = [
    (
        r'(?:Bharatiya Nyaya Sanhita|\bBNS\b)[\s,]+(?:Section|S\.)\s*(\d+[A-Za-z]?)',
        'Bharatiya Nyaya Sanhita, 2023',
    ),
    (
        r'(?:Section|S\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+)?(?:the\s+)?(?:Bharatiya Nyaya Sanhita|\bBNS\b)',
        'Bharatiya Nyaya Sanhita, 2023',
    ),
    (
        r'(?:Code of Criminal Procedure|\bCrPC\b|\bCRPC\b)[\s,]+(?:Section|S\.)\s*(\d+[A-Za-z]?)',
        'Code of Criminal Procedure, 1973',
    ),
    (
        r'(?:Section|S\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+)?(?:the\s+)?(?:Code of Criminal Procedure|\bCrPC\b)',
        'Code of Criminal Procedure, 1973',
    ),
    (
        r'(?:Indian Penal Code|\bIPC\b)[\s,]+(?:Section|S\.)\s*(\d+[A-Za-z]?)',
        'Indian Penal Code, 1860',
    ),
    (
        r'(?:Section|S\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+)?(?:the\s+)?(?:Indian Penal Code|\bIPC\b)',
        'Indian Penal Code, 1860',
    ),
    (
        r'(?:Income[- ]tax Act|\bIT Act\b|\bITA\b)[\s,]+(?:Section|S\.)\s*(\d+[A-Za-z]?)',
        'Income-tax Act, 2025',
    ),
    (
        r'(?:Section|S\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+)?(?:the\s+)?(?:Income[- ]tax Act|\bIT Act\b)',
        'Income-tax Act, 2025',
    ),
    (
        r'Article\s+(\d+[A-Za-z]?)\s+(?:of\s+)?(?:the\s+)?(?:Constitution|Indian Constitution)',
        'Constitution of India',
    ),
    (
        r'(?:Constitution of India)[\s,]+Article\s+(\d+[A-Za-z]?)',
        'Constitution of India',
    ),
]


# ── Tavily client (lazy-init, cached in state) ─────────────────────────────────

def _get_tavily() -> TavilyClient:
    if state._tavily_client is None:
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY not set in environment")
        state._tavily_client = TavilyClient(api_key=api_key)
    return state._tavily_client


# ── Helpers ────────────────────────────────────────────────────────────────────

def enrich_query_for_web(query: str, act_filter: str, route: str) -> str:
    """Prepend a domain-specific prefix to the raw query for better Tavily results."""
    key     = (act_filter or "").upper() if act_filter else route
    prefix  = WEB_DOMAIN_PREFIXES.get(key, WEB_DOMAIN_PREFIXES.get(route, "Indian law"))
    enriched = f"{prefix} {query}"
    logger.info(f"[WebSearch] Enriched query: '{enriched[:90]}'")
    return enriched


def _extract_web_sources(results: list) -> list:
    """
    Scan Tavily results for explicit legal section / article mentions.
    Returns formatted source strings ONLY when a specific section is found.
    Empty list if no references detected.
    """
    found = []
    seen  = set()
    for result in results[:4]:
        text = result.get("title", "") + " " + result.get("content", "")
        for pattern, act_name in _ACT_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                sec_num = match.group(1)
                key = f"{act_name}|{sec_num}"
                if key not in seen:
                    seen.add(key)
                    found.append(f"{act_name} — Section {sec_num}")
        if len(found) >= 3:
            break
    logger.info(f"[WebSearch] Extracted {len(found)} section references from web results")
    return found[:3]


def _build_web_prompt(query: str, web_context: str, lang: str) -> str:
    lang_instruction = {
        "hi":       "Respond ONLY in Devanagari Hindi script. Do not use Roman script.",
        "hinglish": "Respond in Hinglish (Roman Hindi mixed with English legal terms).",
        "en":       "Respond in English.",
    }.get(lang, "Respond in English.")

    return (
        f"{lang_instruction}\n\n"
        "You are LexIQ, a professional Indian legal research assistant used by practicing advocates.\n"
        f"User query: {query}\n\n"
        f"Web search results:\n{web_context}\n"
        f"Instructions:\n{WEB_SEARCH_INSTRUCTIONS}"
    )


def _no_info_message(lang: str) -> str:
    if lang == "hi":
        return (
            "यह प्रश्न हमारे उपलब्ध कानूनी दस्तावेज़ों के दायरे से बाहर है। "
            "कृपया किसी योग्य विधि विशेषज्ञ से परामर्श लें।"
        )
    if lang == "hinglish":
        return (
            "Yeh query hamare verified legal documents ke bahar hai. "
            "Kisi qualified legal professional se consult karo."
        )
    return (
        "This query falls outside our verified legal documents (BNS, CRPC, IPC, IT Act, IT Rules). "
        "Please consult a qualified legal professional."
    )


def _not_law_message(lang: str) -> str:
    """Instant rejection for non-law queries. No LLM call. Language-aware."""
    if lang == "hi":
        return (
            "यह प्रश्न कानून से संबंधित नहीं है। "
            "LexIQ केवल भारतीय कानूनी प्रश्नों का उत्तर दे सकता है — "
            "जैसे BNS, CrPC, IPC, आयकर अधिनियम आदि।"
        )
    if lang == "hinglish":
        return (
            "Yeh sawaal law se related nahi hai. "
            "LexIQ sirf Indian legal queries ke liye hai — "
            "jaise criminal law, tax law, court procedure wagera."
        )
    return (
        "This question is not related to law. "
        "LexIQ is designed exclusively for Indian legal queries "
        "(BNS, CrPC, IPC, Income Tax Act, IT Rules)."
    )


def _tavily_search(enriched_query: str) -> tuple:
    """Execute Tavily search and return (results, tavily_answer)."""
    client = _get_tavily()
    response = client.search(
        query=enriched_query,
        search_depth="basic",
        max_results=4,
        include_answer=True,
    )
    results       = response.get("results", [])
    tavily_answer = response.get("answer", "")
    logger.info(
        f"[WebSearch] Tavily returned {len(results)} results, answer={bool(tavily_answer)}"
    )
    return results, tavily_answer


def _build_web_context(results: list, tavily_answer: str) -> str:
    ctx = ""
    if tavily_answer:
        ctx += f"[Tavily Summary]: {tavily_answer}\n\n"
    for i, r in enumerate(results[:3], 1):
        ctx += f"[Source {i}]: {r.get('title', '')}\n{r.get('content', '')[:350]}\n\n"
    return ctx


# ── Non-streaming fallback (used internally) ──────────────────────────────────

def web_search_fallback(query: str, act_filter: str, route: str, lang: str) -> dict:
    enriched = enrich_query_for_web(query, act_filter, route)
    try:
        results, tavily_answer = _tavily_search(enriched)
    except Exception as exc:
        logger.warning(f"[WebSearch] Tavily failed: {exc}")
        return {"answer": _no_info_message(lang), "source_type": "none", "web_results": []}

    if not results and not tavily_answer:
        return {"answer": _no_info_message(lang), "source_type": "none", "web_results": []}

    web_context = _build_web_context(results, tavily_answer)
    prompt      = _build_web_prompt(query, web_context, lang)
    response    = state.llm.invoke(prompt)
    web_sources = _extract_web_sources(results)

    return {
        "answer":      response.content,
        "source_type": "web",
        "sources":     web_sources,
        "web_results": [{"title": r.get("title", ""), "url": r.get("url", "")}
                        for r in results[:3]],
    }


# ── Streaming fallback (used by FastAPI SSE endpoint) ─────────────────────────

def web_search_fallback_stream(query: str, act_filter: str, route: str, lang: str):
    """
    Generator that yields (type, data) tuples:
      ('token',    str)  — individual LLM tokens
      ('metadata', dict) — final metadata including sources
    """
    enriched = enrich_query_for_web(query, act_filter, route)

    try:
        results, tavily_answer = _tavily_search(enriched)
    except Exception as exc:
        logger.warning(f"[WebSearch][Stream] Tavily failed: {exc}")
        yield ("metadata", {
            "answer": _no_info_message(lang),
            "source_type": "none",
            "web_results": [],
        })
        return

    if not results and not tavily_answer:
        yield ("metadata", {
            "answer": _no_info_message(lang),
            "source_type": "none",
            "web_results": [],
        })
        return

    web_context = _build_web_context(results, tavily_answer)
    prompt      = _build_web_prompt(query, web_context, lang)
    web_sources = _extract_web_sources(results)

    # Stream LLM tokens
    for chunk in state.llm.stream(prompt):
        if chunk.content:
            yield ("token", chunk.content)

    # Yield final metadata
    yield ("metadata", {
        "source_type": "web",
        "sources":     web_sources,
        "web_results": [
            {"title": r.get("title", ""), "url": r.get("url", "")}
            for r in results[:3]
        ],
    })
