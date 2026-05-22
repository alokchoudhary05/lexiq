"""
backend/chat.py — Public Chat API (Agentic Architecture)

The only two functions the FastAPI layer needs to call:
  lexiq_chat(raw_input, session_id, mode)   → dict  (non-streaming)
  lexiq_chat_stream(raw_input, session_id)  → generator of (type, data)

Architecture (Agentic Tool-Calling):
  Every message is fed to the main LLM (`gpt-4o`) along with the recent 
  conversation history and two Tools:
    - search_indian_law
    - search_web
  The LLM natively handles greetings, follow-ups, and off-topic queries, 
  and calls tools ONLY when it needs to retrieve legal information.
"""

import re
import logging
import json
from datetime import datetime

from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from langchain_core.tools import tool

import backend.state as state
import backend.security as security
from .config    import ACT_CONFIG, ACT_UNIT, MAX_DISPLAY_SOURCES, COMMAND_MAP
from .language  import get_lang_instruction, detect_language
from .retriever import retrieve
from .web_search import web_search_fallback, _not_law_message, _no_info_message
from .session  import get_session_history
from .prompts  import AGENT_SYSTEM_PROMPT

logger = logging.getLogger("LexIQ.chat")


# ── Input helpers ──────────────────────────────────────────────────────────────

def parse_user_command(raw_input: str) -> tuple:
    stripped = raw_input.strip()
    for pattern, cfg in COMMAND_MAP.items():
        m = re.match(pattern, stripped, re.IGNORECASE)
        if m:
            clean_query = stripped[m.end():].strip()
            return clean_query, cfg.get("act_filter"), cfg["label"]
    return raw_input.strip(), None, "Auto"


def format_sources(context_docs: list) -> list:
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
    pattern = r'\n*(?:\*{0,2})📚\s*\*{0,2}\s*(?:Sources|स्रोत)\*{0,2}\s*\n[-•\*].*'
    return re.sub(pattern, '', text, flags=re.DOTALL | re.IGNORECASE).rstrip()


def _strip_emojis(text: str) -> str:
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


# ── Streaming chat (used by FastAPI SSE endpoint) ──────────────────────────────

def lexiq_chat_stream(raw_input: str, session_id: str = "default", client_memory_obj=None):
    """
    Agentic streaming chat handler — yields (type, data) tuples.
    """
    query, act_filter, label = parse_user_command(raw_input)

    if not query:
        yield ("metadata", {
            "answer": "Please enter a legal question.",
            "label": label, "sources": [], "source_type": "none",
        })
        return

    logger.info(f"[Stream] session={session_id} | label={label} | query={query[:60]}")

    lang = detect_language(query)
    lang_instruction = get_lang_instruction(lang)
    
    # Grab conversation history
    history = get_session_history(session_id)
    # Feed last 10 messages (5 turns) to the LLM to preserve tokens
    recent_history = history.messages[-10:]
    verified_client_memory = ""
    if client_memory_obj:
        if security.verify_memory(client_memory_obj.data, client_memory_obj.signature):
            verified_client_memory = client_memory_obj.data
        else:
            logger.warning(f"Invalid HMAC signature for client_memory in session {session_id}")

    system_prompt = AGENT_SYSTEM_PROMPT.format(
        lang_instruction=lang_instruction,
        current_date=datetime.now().strftime("%B %d, %Y"),
        verified_client_memory=verified_client_memory
    )
    messages = [SystemMessage(content=system_prompt)] + recent_history + [HumanMessage(content=query)]

    # We use these variables to capture the output of the tools so we can return them as metadata
    used_sources = []
    source_type = "none"
    route_used = "agent"

    @tool
    def search_indian_law(search_query: str) -> str:
        """
        Search the LexIQ vector database for Indian legal documents (BNS, IPC, CRPC, Income Tax).
        Call this whenever the user asks a substantive legal question.
        """
        nonlocal used_sources, source_type, route_used
        docs, route, needs_web = retrieve(search_query, act_filter=act_filter)
        route_used = route
        
        if needs_web or not docs:
            return "NO_SUFFICIENT_DOCS_FOUND_PLEASE_CALL_search_web_INSTEAD"
            
        used_sources = format_sources(docs)
        source_type = "documents"
        
        context = ""
        for doc in docs:
            act = doc.metadata.get("act", "")
            sec = doc.metadata.get("section_number", "")
            context += f"---\nAct: {act}\nSection: {sec}\nContent:\n{doc.page_content}\n"
        return context

    @tool
    def search_web(search_query: str) -> str:
        """
        Search the internet for legal information outside our database (e.g. Constitutional law, SEBI, Family law).
        Call this ONLY if the query is outside criminal or tax law, or if search_indian_law fails.
        """
        nonlocal used_sources, source_type, route_used
        web_result = web_search_fallback(search_query, act_filter or "", "web_search", lang)
        source_type = web_result["source_type"]
        used_sources = web_result.get("sources", [])
        route_used = "web_search"
        return web_result.get("answer", "No info found.")

    @tool
    def update_personal_memory(updated_memory: str) -> str:
        """
        Overwrite the persistent user memory. 
        Provide the FULL updated memory as a concise, deduplicated bulleted list of personal facts.
        If the user shares a new fact, combine it with the existing memory and provide the updated list.
        NEVER use this for legal queries or discussion history.
        """
        nonlocal verified_client_memory
        new_sig = security.sign_memory(updated_memory)
        return json.dumps({"data": updated_memory, "signature": new_sig})

    # Bind tools to the LLM
    llm_with_tools = state.llm.bind_tools([search_indian_law, search_web, update_personal_memory])

    yield ("status", "Analyzing request...")

    # Agent Loop (Allows multiple sequential tool calls)
    max_iterations = 3
    iterations = 0
    full_answer = ""
    
    while iterations < max_iterations:
        iterations += 1
        current_pass_chunk = None
        tool_call_made = False
        
        for chunk in llm_with_tools.stream(messages):
            if chunk.content:
                full_answer += chunk.content
                yield ("token", chunk.content)
                
            if current_pass_chunk is None:
                current_pass_chunk = chunk
            else:
                current_pass_chunk += chunk
                
        if current_pass_chunk and current_pass_chunk.tool_calls:
            tool_call_made = True
            tc = current_pass_chunk.tool_calls[0]
            tool_name = tc["name"]
            
            if tool_name == "search_indian_law":
                yield ("status", "Searching legal database...")
                result = search_indian_law.invoke(tc["args"])
            elif tool_name == "search_web":
                yield ("status", "Searching the web...")
                result = search_web.invoke(tc["args"])
            elif tool_name == "update_personal_memory":
                logger.info(f"[Tool] update_personal_memory | args={tc['args']}")
                result_json = update_personal_memory.invoke(tc["args"])
                mem_data = json.loads(result_json)
                yield ("memory_update", mem_data)
                
                result = ToolMessage(
                    tool_call_id=tc["id"],
                    name="update_personal_memory",
                    content="Memory updated successfully."
                )
            else:
                result = "Unknown tool requested."
                
            messages.append(current_pass_chunk)
            if isinstance(result, ToolMessage):
                messages.append(result)
            else:
                messages.append(ToolMessage(tool_call_id=tc["id"], content=str(result)))
                
            yield ("status", "Processing retrieved information...")
            
        # If LLM didn't call any tools, it has generated its final text response
        if not tool_call_made:
            break

    if not full_answer:
        # Failsafe: If the LLM failed to generate text (e.g., tried to call a tool in the 2nd pass)
        full_answer = "I'm sorry, I encountered an issue while processing the retrieved information. Could you please try asking again or rephrasing your question?"
        yield ("token", full_answer)

    final_answer = _clean(full_answer)
    
    # Save the interaction to memory
    history.add_user_message(query)
    history.add_ai_message(final_answer)

    yield ("metadata", {
        "answer": final_answer,
        "label": label,
        "lang": lang,
        "sources": used_sources,
        "source_type": source_type,
        "route": route_used,
    })


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

    logger.info(f"[Chat] session={session_id} | label={label} | query={query[:60]}")

    if mode == "summarize":
        docs, _, _ = retrieve(query, act_filter=act_filter)
        result     = state.summarize_chain.invoke({"input_documents": docs})
        return {"answer": result["output_text"], "label": label,
                "sources": [], "source_type": "documents"}
                
    lang = detect_language(query)
    lang_instruction = get_lang_instruction(lang)
    
    history = get_session_history(session_id)
    recent_history = history.messages[-10:]

    system_prompt = AGENT_SYSTEM_PROMPT.format(
        lang_instruction=lang_instruction,
        current_date=datetime.now().strftime("%B %d, %Y")
    )
    messages = [SystemMessage(content=system_prompt)] + recent_history + [HumanMessage(content=query)]

    used_sources = []
    source_type = "none"
    route_used = "agent"

    @tool
    def search_indian_law(search_query: str) -> str:
        """Search the LexIQ vector database for Indian legal documents (BNS, IPC, CRPC, Income Tax)."""
        nonlocal used_sources, source_type, route_used
        docs, route, needs_web = retrieve(search_query, act_filter=act_filter)
        route_used = route
        if needs_web or not docs:
            return "NO_SUFFICIENT_DOCS_FOUND_PLEASE_CALL_search_web_INSTEAD"
        used_sources = format_sources(docs)
        source_type = "documents"
        context = ""
        for doc in docs:
            act = doc.metadata.get("act", "")
            sec = doc.metadata.get("section_number", "")
            context += f"---\nAct: {act}\nSection: {sec}\nContent:\n{doc.page_content}\n"
        return context

    @tool
    def search_web(search_query: str) -> str:
        """Search the internet for legal information outside our database."""
        nonlocal used_sources, source_type, route_used
        web_result = web_search_fallback(search_query, act_filter or "", "web_search", lang)
        source_type = web_result["source_type"]
        used_sources = web_result.get("sources", [])
        route_used = "web_search"
        return web_result.get("answer", "No info found.")

    llm_with_tools = state.llm.bind_tools([search_indian_law, search_web])

    # First Pass
    response = llm_with_tools.invoke(messages)
    
    if response.tool_calls:
        tc = response.tool_calls[0]
        tool_name = tc["name"]
        if tool_name == "search_indian_law":
            result = search_indian_law.invoke(tc["args"])
        elif tool_name == "search_web":
            result = search_web.invoke(tc["args"])
        else:
            result = "Unknown tool requested."
            
        messages.append(response)
        messages.append(ToolMessage(tool_call_id=tc["id"], content=str(result)))
        
        # Second Pass
        final_response = llm_with_tools.invoke(messages)
        full_answer = final_response.content
    else:
        full_answer = response.content

    final_answer = _clean(full_answer)
    
    history.add_user_message(query)
    history.add_ai_message(final_answer)

    return {
        "answer": final_answer,
        "label": label,
        "lang": lang,
        "sources": used_sources,
        "source_type": source_type,
        "route": route_used,
    }
