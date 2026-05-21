"""
backend/language.py — Language Detection & Query Translation

Detects whether a query is in English, Hindi (Devanagari), or Hinglish
(Roman-script Hindi mixed with English).  Used to route language-aware
rejection messages and to log query language for monitoring.
"""

import re
import logging

from .config import HINGLISH_MARKERS

logger = logging.getLogger("LexIQ.language")


def detect_language(text: str) -> str:
    """
    Returns one of: 'hi' (Devanagari Hindi), 'hinglish', 'en' (English).

    Detection priority:
    1. Any Devanagari Unicode character → 'hi'
    2. >= 2 Hinglish Roman markers      → 'hinglish'
    3. Default                          → 'en'
    """
    # Devanagari Unicode block: U+0900–U+097F
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    words = set(re.findall(r'\b\w+\b', text.lower()))
    if len(words & HINGLISH_MARKERS) >= 2:
        return "hinglish"
    return "en"


def translate_query_for_retrieval(query: str) -> str:
    """
    Currently a pass-through; logs Hindi/Hinglish queries for monitoring.
    Future: add transliteration or translation as needed.
    """
    lang = detect_language(query)
    if lang in ("hi", "hinglish"):
        logger.info(f"[Language] {lang.upper()} query detected: '{query[:50]}'")
    return query


def get_lang_instruction(lang: str) -> str:
    """
    Return an explicit language directive string for injection into LLM prompts.
    Ensures response language matches the user's detected input language.
    """
    if lang == "hi":
        return "Respond ENTIRELY in Devanagari Hindi script. Do NOT use Roman script."
    if lang == "hinglish":
        return (
            "Respond in Hinglish (Roman Hindi mixed with English legal terms). "
            "Use Roman script, not Devanagari."
        )
    return "Respond in English."


def add_lang_hint(query: str, lang: str) -> str:
    """
    Append a language instruction hint to the user query before sending
    to the RAG chain.  This reinforces the language rules in the system
    prompt and prevents the LLM from defaulting to English when the
    retrieval context is English-only.
    """
    if lang == "hinglish":
        return (
            f"{query}\n\n"
            "[System: The user is writing in Hinglish. "
            "You MUST respond in Hinglish — Roman Hindi mixed with English legal terms.]"
        )
    if lang == "hi":
        return (
            f"{query}\n\n"
            "[System: The user is writing in Hindi (Devanagari). "
            "You MUST respond entirely in Devanagari Hindi.]"
        )
    return query
