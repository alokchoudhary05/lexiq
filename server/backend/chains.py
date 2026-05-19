"""
backend/chains.py — LangChain Chain Builders

Constructs the LLM chains used for QA, conversational memory,
and summarization.  All builders are called once by engine.py
and their results are stored in backend.state.

Public API:
  build_chains(llm) → None   (sets state.question_answer_chain, etc.)
"""

import logging

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever
from langchain.chains.summarize import load_summarize_chain
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
)
from langchain_core.runnables.history import RunnableWithMessageHistory

import backend.state as state
from .prompts import (
    LEGAL_SYSTEM_PROMPT,
    CONTEXTUALIZE_SYSTEM,
    MAP_PROMPT_TEMPLATE,
    COMBINE_PROMPT_TEMPLATE,
)
from .session import get_session_history

logger = logging.getLogger("LexIQ.chains")


def build_chains(llm) -> None:
    """
    Build and store all LangChain chains into backend.state.
    Must be called after build_retrievers() so state.ret_dont_know is set.
    """
    # ── QA prompt ─────────────────────────────────────────────────────────────
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", LEGAL_SYSTEM_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

    state.question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
    state.rag_chain             = create_retrieval_chain(
        state.ret_dont_know, state.question_answer_chain
    )
    logger.info("[Chains] QA chain ready")

    # ── History-aware contextualization prompt ────────────────────────────────
    state.contextualize_prompt = ChatPromptTemplate.from_messages([
        ("system", CONTEXTUALIZE_SYSTEM),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

    # ── Conversational chain (default retriever — overridden per-query in chat.py) ──
    history_retriever = create_history_aware_retriever(
        llm, state.ret_dont_know, state.contextualize_prompt
    )
    conversational_rag = create_retrieval_chain(
        history_retriever, state.question_answer_chain
    )
    state.conversational_chain = RunnableWithMessageHistory(
        conversational_rag,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )
    logger.info("[Chains] Conversational chain ready")

    # ── Summarize chain (map-reduce) ──────────────────────────────────────────
    map_prompt     = PromptTemplate(input_variables=["text"], template=MAP_PROMPT_TEMPLATE)
    combine_prompt = PromptTemplate(input_variables=["text"], template=COMBINE_PROMPT_TEMPLATE)
    state.summarize_chain = load_summarize_chain(
        llm,
        chain_type="map_reduce",
        map_prompt=map_prompt,
        combine_prompt=combine_prompt,
    )
    logger.info("[Chains] Summarize chain ready")
