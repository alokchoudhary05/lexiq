import os
import sys
import time
import json
import uuid
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

# Set up paths so we can import the backend package
EVAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EVAL_DIR.parent
SERVER_DIR = PROJECT_ROOT / "server"
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

# Load local .env so we have API keys
load_dotenv(dotenv_path=PROJECT_ROOT / ".env", override=False)

import backend.state as state
from backend.engine import initialize_engine
from backend.chat import lexiq_chat_stream
from backend.retriever import retrieve
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

TEST_DATASET = [
    # Tax / Financial queries
    {"query": "Tell me about Section 80C deductions.", "route": "agent", "expected_source": "documents", "expected_section": "80C", "expected_act": "ITA", "domain": "tax"},
    {"query": "What are the rules under Section 124 of the Income Tax Act?", "route": "agent", "expected_source": "documents", "expected_section": "124", "expected_act": "ITA", "domain": "tax"},
    {"query": "Explain Section 128 of the Income Tax Act.", "route": "agent", "expected_source": "documents", "expected_section": "128", "expected_act": "ITA", "domain": "tax"},

    # Criminal law queries
    {"query": "What is BNS Section 105?", "route": "agent", "expected_source": "documents", "expected_section": "105", "expected_act": "BNS", "domain": "criminal"},

    # Procedural and general legal queries
    {"query": "What are the rules regarding bail in India?", "route": "agent", "expected_source": "documents", "expected_section": None, "expected_act": "BNS", "domain": "criminal", "expected_lang": "hi"},

    # IPC / BNS Section Lookup queries
    {"query": "Explain Section 302 of the Indian Penal Code.", "route": "agent", "expected_source": "documents", "expected_section": "302", "expected_act": "IPC", "domain": "criminal"},
    {"query": "Tell me about BNS Section 212", "route": "agent", "expected_source": "documents", "expected_section": "212", "expected_act": "BNS", "domain": "criminal"},
    {"query": "Explain Section 298 of the Indian Penal Code.", "route": "agent", "expected_source": "documents", "expected_section": "298", "expected_act": "IPC", "domain": "criminal"},
    {"query": "What does BNS Section 209 say?", "route": "agent", "expected_source": "documents", "expected_section": "209", "expected_act": "BNS", "domain": "criminal"},
    {"query": "Can you retrieve Section 1 of the Indian Penal Code?", "route": "agent", "expected_source": "documents", "expected_section": "1", "expected_act": "IPC", "domain": "criminal"},
    {"query": "Provide details on BNS Section 200.", "route": "agent", "expected_source": "documents", "expected_section": "200", "expected_act": "BNS", "domain": "criminal"},
    
    # General legal definitions and conceptual queries
    {"query": "What is the punishment for theft according to the Bharatiya Nyaya Sanhita?", "route": "agent", "expected_source": "documents", "expected_section": None, "expected_act": "BNS", "domain": "criminal"},
    {"query": "What is the definition of dowry death in IPC?", "route": "agent", "expected_source": "documents", "expected_section": None, "expected_act": "IPC", "domain": "criminal"},
    {"query": "Explain Section 144 of the Code of Criminal Procedure.", "route": "agent", "expected_source": "documents", "expected_section": None, "expected_act": "CRPC", "domain": "criminal"},
    {"query": "What is the penalty for robbery in India?", "route": "agent", "expected_source": "documents", "expected_section": None, "expected_act": "BNS", "domain": "criminal"},
    {"query": "Hello, how are you?", "route": "agent", "expected_source": "none", "expected_section": None, "expected_act": None, "domain": "auto"},
    {"query": "What are SEBI regulations for IPO?", "route": "agent", "expected_source": "web", "expected_section": None, "expected_act": None, "domain": "auto"},
    {"query": "My name is Alok.", "route": "agent", "expected_source": "none", "expected_section": None, "expected_act": None, "domain": "auto", "session_id": "mem_test_ok"},
    {"query": "What is my name?", "route": "agent", "expected_source": "none", "expected_section": None, "expected_act": None, "domain": "auto", "session_id": "mem_test_ok"},
    {"query": "Give me a summary of consumer protection laws.", "route": "agent", "expected_source": "web", "expected_section": None, "expected_act": None, "domain": "auto"},
    {"query": "Good morning!", "route": "agent", "expected_source": "none", "expected_section": None, "expected_act": None, "domain": "auto"},
    {"query": "How are traffic violations handled?", "route": "agent", "expected_source": "web", "expected_section": None, "expected_act": None, "domain": "auto"},
    {"query": "Who is the prime minister of India?", "route": "agent", "expected_source": "web", "expected_section": None, "expected_act": None, "domain": "auto"},
    {"query": "What does the constitution say about freedom of speech?", "route": "agent", "expected_source": "web", "expected_section": None, "expected_act": None, "domain": "auto"},
]

def run_chat_stream(query, session_id):
    full_answer = ""
    sources = []
    source_type = "none"
    route = "agent"
    lang = "en"
    
    for ev_type, ev_data in lexiq_chat_stream(query, session_id=session_id):
        if ev_type == "token":
            full_answer += ev_data
        elif ev_type == "metadata":
            sources = ev_data.get("sources", sources)
            source_type = ev_data.get("source_type", source_type)
            route = ev_data.get("route", route)
            lang = ev_data.get("lang", lang)
            if not full_answer:
                full_answer = ev_data.get("answer", "")
                
    return {
        "answer": full_answer,
        "sources": sources,
        "source_type": source_type,
        "route": route,
        "lang": lang
    }

def evaluate():
    print("[Eval] Initializing LexIQ Engine...")
    initialize_engine()
    
    judge_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    results = {
        "retrieval": {"queries": 0, "hit_queries": 0, "hit_at_3": 0, "hit_at_6": 0, "mrr_sum": 0.0, "precision_sum": 0.0},
        "generation": {"queries": 0, "faithfulness_sum": 0.0, "relevance_sum": 0.0},
        "agent": {"queries": 0, "route_match": 0},
        "latency": {"retrieval": [], "e2e": []},
        "language": {"queries": 0, "lang_match": 0},
        "failures": []
    }

    print(f"[Eval] Running evaluation on {len(TEST_DATASET)} queries...")

    for i, test in enumerate(TEST_DATASET):
        q = test["query"]
        expected_route = test["route"]
        expected_sec = test.get("expected_section")
        expected_act = test.get("expected_act")
        session_id = test.get("session_id", f"eval_{uuid.uuid4().hex[:8]}")
        
        try:
            print(f"[{i+1}/{len(TEST_DATASET)}] Query: {q[:50]}...")
        except UnicodeEncodeError:
            print(f"[{i+1}/{len(TEST_DATASET)}] Query: [Unicode text]")
        
        # --- 1. Measure Retrieval ---
        # Only run retrieval metrics for queries that should hit the RAG DB
        expected_source = test.get("expected_source")
        if expected_source == "documents":
            t0 = time.time()
            docs, route, needs_web = retrieve(q)
            t_retrieval = time.time() - t0
            results["latency"]["retrieval"].append(t_retrieval)
            
            results["retrieval"]["queries"] += 1
            
            if expected_sec and expected_act:
                results["retrieval"]["hit_queries"] += 1
                hit_rank = -1
                
                print(f"\\n--- Retrieved Docs for query: '{q}' ---")
                for rank, doc in enumerate(docs[:6]):
                    actual_act = str(doc.metadata.get("act"))
                    actual_sec = str(doc.metadata.get("section_number"))
                    print(f"Rank {rank+1}: act='{actual_act}', section_number='{actual_sec}'")
                    
                    if actual_act == str(expected_act) and actual_sec.lower() == str(expected_sec).lower():
                        hit_rank = rank + 1
                        # Do not break immediately so we can print all top 6 docs for debugging
                print("---------------------------------------")
                
                if hit_rank > 0 and hit_rank <= 3:
                    results["retrieval"]["hit_at_3"] += 1
                if hit_rank > 0 and hit_rank <= 6:
                    results["retrieval"]["hit_at_6"] += 1
                if hit_rank > 0:
                    results["retrieval"]["mrr_sum"] += (1.0 / hit_rank)
                    
            # Precision@K: Are retrieved docs from the expected act?
            if expected_act and docs:
                relevant = sum(1 for d in docs[:3] if d.metadata.get("act") == expected_act)
                results["retrieval"]["precision_sum"] += (relevant / min(len(docs), 3))

        # --- 2. Measure End-to-End Chat ---
        t0 = time.time()
        chat_res = run_chat_stream(q, session_id=session_id)
        t_e2e = time.time() - t0
        results["latency"]["e2e"].append(t_e2e)
        
        # --- 3. Agent Metrics ---
        expected_route = test.get("route", "agent")
        expected_source = test.get("expected_source")
        
        actual_route = chat_res.get("route", "unknown")
        actual_source = chat_res.get("source_type", "none")
        
        # New matching logic based on expected_source
        if expected_source:
            if actual_source == expected_source:
                results["agent"]["route_match"] += 1
            else:
                results["failures"].append({"query": q, "reason": f"Source mismatch: expected {expected_source}, got {actual_source}"})
        else:
            if expected_route == actual_route:
                results["agent"]["route_match"] += 1
            else:
                results["failures"].append({"query": q, "reason": f"Route mismatch: expected {expected_route}, got {actual_route}"})
        results["agent"]["queries"] += 1

        # Language Match
        expected_lang = test.get("expected_lang", "en")
        results["language"]["queries"] += 1
        if chat_res.get("lang") == expected_lang:
            results["language"]["lang_match"] += 1
        
        # --- 4. Generation Metrics (LLM as Judge) ---
        # Skip generation metrics for purely greeting/small-talk if needed, but it's fine to score them
        results["generation"]["queries"] += 1
        
        # Prompt the Judge
        judge_prompt = f"""
You are an expert evaluator for an AI legal assistant.
Evaluate the following response based on the user's query.

Query: "{q}"
Answer: "{chat_res['answer']}"
Sources Used: {chat_res['sources']}

Score the answer on two metrics from 1 to 5:
1. Faithfulness: 5 means the answer doesn't hallucinate outside the sources (if any). If no sources, does it honestly say it doesn't know or gracefully handle it?
2. Relevance: 5 means the answer directly and correctly addresses the user's query.

Respond strictly in this JSON format:
{{"faithfulness": score, "relevance": score, "reason": "short explanation"}}
"""
        try:
            eval_msg = judge_llm.invoke([SystemMessage(content="You are a strict JSON evaluator."), HumanMessage(content=judge_prompt)])
            # Handle potential markdown json wrapping
            content = eval_msg.content.strip()
            if content.startswith("```json"): content = content[7:-3].strip()
            elif content.startswith("```"): content = content[3:-3].strip()
            scores = json.loads(content)
            results["generation"]["faithfulness_sum"] += float(scores.get("faithfulness", 0))
            results["generation"]["relevance_sum"] += float(scores.get("relevance", 0))
            
            if float(scores.get("relevance", 0)) < 3:
                results["failures"].append({"query": q, "reason": f"Low relevance score: {scores.get('relevance')}. Reason: {scores.get('reason')}"})
        except Exception as e:
            print(f"[Eval] LLM Judge error: {e}")

    # Generate Report
    write_report(results)

def write_report(results):
    ret_q = max(results["retrieval"]["queries"], 1)
    hit_q = max(results["retrieval"]["hit_queries"], 1)
    gen_q = max(results["generation"]["queries"], 1)
    agt_q = max(results["agent"]["queries"], 1)
    lng_q = max(results["language"]["queries"], 1)
    
    # Calculate Latencies
    r_lat = results["latency"]["retrieval"]
    e_lat = results["latency"]["e2e"]
    
    r_p50 = np.percentile(r_lat, 50) if r_lat else 0
    r_p90 = np.percentile(r_lat, 90) if r_lat else 0
    r_p99 = np.percentile(r_lat, 99) if r_lat else 0
    
    e_p50 = np.percentile(e_lat, 50) if e_lat else 0
    e_p90 = np.percentile(e_lat, 90) if e_lat else 0
    e_p99 = np.percentile(e_lat, 99) if e_lat else 0
    
    hit3 = (results["retrieval"]["hit_at_3"] / hit_q) * 100
    hit6 = (results["retrieval"]["hit_at_6"] / hit_q) * 100
    mrr  = results["retrieval"]["mrr_sum"] / hit_q
    prec = results["retrieval"]["precision_sum"] / ret_q
    
    faith = results["generation"]["faithfulness_sum"] / gen_q
    relev = results["generation"]["relevance_sum"] / gen_q
    
    route_acc = (results["agent"]["route_match"] / agt_q) * 100
    lang_acc  = (results["language"]["lang_match"] / lng_q) * 100

    print(f"\n==========================================")
    print(f"       LexIQ Raw Evaluation Results")
    print(f"==========================================")
    print(f"Hit@3: {hit3:.1f}%")
    print(f"Hit@6: {hit6:.1f}%")
    print(f"MRR: {mrr:.2f}")
    print(f"Precision@3: {prec:.2f}")
    print(f"Faithfulness: {faith:.1f}/5.0")
    print(f"Relevance: {relev:.1f}/5.0")
    print(f"Intent Routing Accuracy: {route_acc:.1f}%")
    print(f"Language Detection Match: {lang_acc:.1f}%")
    print(f"==========================================")
    print(f"Latency:")
    print(f"  Retrieval: P50={r_p50:.2f}s, P90={r_p90:.2f}s, P99={r_p99:.2f}s")
    print(f"  End-to-End Chat: P50={e_p50:.2f}s, P90={e_p90:.2f}s, P99={e_p99:.2f}s")
    print(f"==========================================\n")

if __name__ == "__main__":
    evaluate()
