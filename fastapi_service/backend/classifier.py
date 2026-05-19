"""
backend/classifier.py — Semantic Query Classifier

Routes user queries to the correct retrieval pipeline using a fast
gpt-4o-mini LLM call.  Results are cached in-memory to avoid redundant
API calls for repeated queries within the same process lifetime.

Public API:
  classify_query(query) → str   (route name from CATEGORY_TO_ROUTE)
"""

import logging
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

import backend.state as state
from .config import CATEGORY_TO_ROUTE
from .prompts import CLASSIFIER_SYSTEM_PROMPT

logger = logging.getLogger("LexIQ.classifier")


def build_classifier(classifier_llm: ChatOpenAI) -> None:
    """
    Called once by engine.initialize_engine().
    Builds the classifier chain and stores it in state.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", CLASSIFIER_SYSTEM_PROMPT),
        ("human", "{query}"),
    ])
    state._classifier_llm   = classifier_llm
    state._classifier_chain = prompt | classifier_llm
    state._classify_cache   = {}
    logger.info("[Classifier] Chain ready")


def classify_query(query: str) -> str:
    """
    Classify a legal query into a routing category.

    Returns a route string such as 'criminal_query', 'tax_query',
    'web_search', or 'not_law'.

    Results are cached by the first 120 chars of the normalised query.
    """
    q_key = query.strip().lower()[:120]

    # Return cached result if available
    if q_key in state._classify_cache:
        return state._classify_cache[q_key]

    try:
        result   = state._classifier_chain.invoke({"query": query})
        raw      = result.content.strip().upper()
        category = raw.split()[0] if raw else "GENERAL"
        # Unknown category → safe fallback to web_search (never reject valid legal queries)
        route = CATEGORY_TO_ROUTE.get(category, "web_search")
    except Exception as exc:
        logger.warning(f"[Classifier] Failed: {exc} — defaulting to web_search")
        route = "web_search"

    state._classify_cache[q_key] = route
    logger.info(f"[Classifier] '{query[:55]}' → {route}")
    return route
