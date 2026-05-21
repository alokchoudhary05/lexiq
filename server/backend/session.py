"""
backend/session.py — Chat Session Memory Management

Manages in-process per-session conversation history using LangChain's
ChatMessageHistory.  All session state lives in the module-level
chat_store dict (populated from backend.state).

In production the in-memory store is sufficient — Railway keeps the
process alive between requests.  For multi-instance deployments, swap
ChatMessageHistory for a Redis-backed implementation here without
changing any other module.
"""

import logging
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import HumanMessage

import backend.state as state

logger = logging.getLogger("LexIQ.session")


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """Return (or create) the ChatMessageHistory for a given session_id."""
    if session_id not in state.chat_store:
        state.chat_store[session_id] = ChatMessageHistory()
    return state.chat_store[session_id]


def clear_session(session_id: str) -> None:
    """Delete a session's history from the in-memory store."""
    if session_id in state.chat_store:
        del state.chat_store[session_id]
        logger.info(f"[Session] Cleared session: {session_id}")


def list_sessions() -> dict:
    """Return {session_id: message_count} for all active sessions."""
    return {sid: len(h.messages) for sid, h in state.chat_store.items()}


def has_history(session_id: str) -> bool:
    """Return True if the session has at least one prior message."""
    return (
        session_id in state.chat_store
        and len(state.chat_store[session_id].messages) > 0
    )


def get_recent_history_text(session_id: str, n: int = 6) -> str:
    """
    Return the last *n* messages formatted as a readable conversation string.

    Used by the follow-up handler to inject conversation context into
    the LLM prompt without going through the RAG pipeline.
    Returns empty string if no history exists.
    """
    if session_id not in state.chat_store:
        return ""
    messages = state.chat_store[session_id].messages[-n:]
    if not messages:
        return ""
    lines = []
    for msg in messages:
        role = "User" if isinstance(msg, HumanMessage) else "Assistant"
        lines.append(f"{role}: {msg.content}")
    return "\n\n".join(lines)


def view_chat_history(session_id: str = "default") -> None:
    """Log the full message history for a session (debugging)."""
    if session_id not in state.chat_store:
        logger.info(f"[Session] No history for: {session_id}")
        return
    for msg in state.chat_store[session_id].messages:
        role = "User" if isinstance(msg, HumanMessage) else "Assistant"
        logger.info(f"  {role}: {msg.content[:200]}")
