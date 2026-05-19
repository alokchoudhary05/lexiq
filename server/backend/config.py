"""
backend/config.py — LexIQ Global Configuration & Constants

All environment loading, path resolution, constants, and lookup tables
live here. Every other module imports from this file — never from .env
or os.getenv directly.
"""

import os
import warnings
from pathlib import Path

from dotenv import load_dotenv

# ── Environment loading ────────────────────────────────────────────────────────
# Resolve root as  lexiq_pod/  (3 levels up from this file)
#   this file  : lexiq_pod/fastapi_service/backend/config.py
#   parent     : lexiq_pod/fastapi_service/backend/
#   parent×2   : lexiq_pod/fastapi_service/
#   parent×3   : lexiq_pod/               ← ROOT_DIR
ROOT_DIR = Path(__file__).resolve().parent.parent.parent

# Load .env from project root (local dev).  On Railway the vars come from
# the dashboard — load_dotenv() is a no-op when vars are already set.
load_dotenv(dotenv_path=ROOT_DIR / ".env", override=False)

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
DATA_DIR  = ROOT_DIR / "data"
CACHE_DIR = ROOT_DIR / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ── Pinecone / Embeddings ──────────────────────────────────────────────────────
INDEX_NAME      = "lexiq-v3-index"
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIM   = 1536
RETRIEVAL_K     = 6

# ── Chunking ───────────────────────────────────────────────────────────────────
MAX_LEN_CRIMINAL = 2000
MAX_LEN_TAX      = 3000
OVERLAP          = 200

# ── Source display ─────────────────────────────────────────────────────────────
MAX_DISPLAY_SOURCES = 3

# ── Act metadata ───────────────────────────────────────────────────────────────
ACT_CONFIG = {
    "IPC_rules.pdf": {
        "act": "IPC", "full_name": "Indian Penal Code, 1860",
        "law_status": "legacy", "priority": 5,
        "parse_format": "ipc", "domain": "criminal",
        "namespace": "criminal_ipc",
    },
    "BNS_rules.pdf": {
        "act": "BNS", "full_name": "Bharatiya Nyaya Sanhita, 2023",
        "law_status": "active", "priority": 1,
        "parse_format": "bns", "domain": "criminal",
        "namespace": "criminal_bns",
    },
    "the_code_of_criminal_procedure.pdf": {
        "act": "CRPC", "full_name": "Code of Criminal Procedure, 1973",
        "law_status": "active", "priority": 2,
        "parse_format": "crpc", "domain": "criminal",
        "namespace": "criminal_crpc",
        "skip_toc_pages": 20,
    },
    "Income_Tax_Act_2025_as_amended_by_FA_Act_2026.pdf": {
        "act": "ITA",
        "full_name": "Income-tax Act, 2025 (as amended by Finance Act, 2026)",
        "law_status": "active", "priority": 3,
        "parse_format": "ita", "domain": "tax",
        "namespace": "tax_ita",
    },
    "Income-tax_Rules-2026.pdf": {
        "act": "ITR", "full_name": "Income-tax Rules, 2026",
        "law_status": "active", "priority": 4,
        "parse_format": "itr", "domain": "tax",
        "namespace": "tax_itr",
    },
}

PRIORITY_MAP     = {cfg["act"]: cfg["priority"] for cfg in ACT_CONFIG.values()}
NAMESPACE_TO_ACT = {cfg["namespace"]: cfg["act"] for cfg in ACT_CONFIG.values()}
ACT_UNIT         = {
    "BNS": "Section", "CRPC": "Section",
    "IPC": "Section", "ITA": "Section", "ITR": "Rule",
}

# ── Slash-command prefixes (e.g. \bns, \tax) ──────────────────────────────────
COMMAND_MAP = {
    r"^\\bns\b":        {"act_filter": "BNS",       "label": "BNS (Bharatiya Nyaya Sanhita)"},
    r"^\\crpc\b":       {"act_filter": "CRPC",      "label": "CRPC (Criminal Procedure)"},
    r"^\\ipc\b":        {"act_filter": "IPC",       "label": "IPC (Legacy — pre-2023)"},
    r"^\\ita\b":        {"act_filter": "ITA",       "label": "IT Act 2025"},
    r"^\\itr\b":        {"act_filter": "ITR",       "label": "IT Rules 2026"},
    r"^\\tax\b":        {"act_filter": "TAX",       "label": "Tax Law (ITA + ITR)"},
    r"^\\criminal\b":   {"act_filter": "CRIMINAL",  "label": "Criminal Law (BNS + CRPC)"},
    r"^\\dont.?know\b": {"act_filter": "DONT_KNOW", "label": "All Laws"},
}

# ── Hinglish detection markers ─────────────────────────────────────────────────
HINGLISH_MARKERS = {
    "kya","hai","kaise","toh","nahi","nhi","krta","kre","uska","ydi","batao",
    "aur","bhi","se","ka","ki","ke","mein","me","ho","hoga","tha","wala","wali",
    "sab","sirf","phir","abhi","bahut","achha","theek","matlab","agar","jab",
    "kab","kyun","kuch","kaafi","bilkul","bohot","lekin","isliye","isko","usse",
    "maine","tumne","humne","apna","apni","apne","unka","unki","unke","inhe",
    "yaha","waha","idhar","udhar","chaliye","chalte","krke","krna","krni","krne",
    "padega","padegi","padenge","sakta","sakti","sakte","chahiye","hota","hoti",
    "hote","milega","milegi","milenge","bata","batao","samjho","samjhe","dekho",
    "suno","lelo","dedo","rakho","karo","karna","krna",
}

OUT_OF_SCOPE_PATTERNS = [
    r'\bpmla\b', r'\bprevention of money laundering\b',
    r'\bfema\b', r'\bcompanies act\b', r'\bsebi\b',
    r'\bconsumer protection\b', r'\bmotor vehicle\b',
    r'\bgst\b', r'\bcustoms act\b', r'\bfcra\b',
    r'\bndps\b', r'\bpocso\b', r'\binsolvency\b',
    r'\bibc\b', r'\bnegotiable instrument\b',
    r'\bcopyright\b', r'\btrademark\b', r'\bpatent\b',
    r'\barbitration\b', r'\bcompetition act\b',
]

WEB_DOMAIN_PREFIXES = {
    "BNS":              "Bharatiya Nyaya Sanhita 2023 India",
    "CRPC":             "Code of Criminal Procedure India",
    "IPC":              "Indian Penal Code India",
    "ITA":              "Income Tax Act 2025 India",
    "ITR":              "Income Tax Rules 2026 India",
    "TAX":              "Indian income tax law 2025",
    "CRIMINAL":         "Indian criminal law BNS 2023",
    "criminal_query":   "Indian criminal law BNS 2023",
    "crpc_query":       "Code of Criminal Procedure India",
    "tax_query":        "Indian income tax law 2025",
    "ipc_query":        "Indian Penal Code IPC",
    "cross_law_comparison": "BNS vs IPC India criminal law",
    "legal_explanation": "Indian law",
}

# ── Classifier routing map ─────────────────────────────────────────────────────
CATEGORY_TO_ROUTE = {
    "CRIMINAL_BNS":  "criminal_query",
    "CRIMINAL_CRPC": "crpc_query",
    "TAX":           "tax_query",
    "CRIMINAL_IPC":  "ipc_query",
    "COMPARISON":    "cross_law_comparison",
    "WEB_LAW":       "web_search",
    "NOT_LAW":       "not_law",
    "GENERAL":       "web_search",   # legacy fallback
}
