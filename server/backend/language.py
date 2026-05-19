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
