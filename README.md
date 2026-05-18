# LexIQ — Production Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Vercel  (lexiq_web/ — Next.js 14)    FREE ✅        │
│  • Auth (Supabase)  • Chat UI  • Sessions                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ SSE  /chat  (HTTPS)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Render  (fastapi_service/ — Python 3.11) FREE ✅    │
│  • FastAPI + Uvicorn  • backend/ RAG engine                 │
│  • data/ (PDFs bundled)  • cache/ (BM25 pkl)               │
└──────────┬───────────────────────────┬──────────────────────┘
           │                           │
           ▼                           ▼
   Pinecone (vector DB)       OpenAI + Tavily APIs
   (cloud, pre-indexed)       (paid per request)
```

### Free Tier Summary

| Service | Platform | Cost | Notes |
|---|---|---|---|
| **Backend (FastAPI)** | Render | **Free** | Sleeps after 15 min idle. 30-60s cold start. 512MB RAM. |
| **Frontend (Next.js)** | Vercel | **Free** | Always on. No sleep. Unlimited bandwidth. |
| **Auth + DB** | Supabase | **Free** | 500MB DB, 50MB storage, 50,000 MAU |
| **Vector DB** | Pinecone | **Free** | 1 index, 2M vectors — more than enough |

> **Railway** is NOT free — it's $5/month credit that expires quickly. Use **Render** instead.

---

## Quick Start — Local Development

### Backend
```bash
cd d:\lexiq_pod\fastapi_service
d:\lexiq_pod\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```
Health check: http://localhost:8000/health  
API docs: http://localhost:8000/docs

### Frontend
```bash
cd d:\lexiq_pod\lexiq_web
npm run dev
```
App: http://localhost:3000

---

## Deploy to Production

### Step 1: Push to GitHub

```bash
cd d:\lexiq_pod
git init
git add .
git commit -m "feat: production-grade LexIQ"
git remote add origin https://github.com/YOUR_USERNAME/lexiq.git
git push -u origin main
```

> `.gitignore` excludes `.env`, `venv/`, `node_modules/`, `.next/`, `__pycache__/`.  
> The `data/` PDFs and `cache/` BM25 pkl files **are committed** — they're needed on the server.

---

### Step 2: Deploy Backend → Render (Free)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` at the root — it will configure everything
4. **OR** set manually:
   - **Root Directory:** `fastapi_service`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 --log-level info`
   - **Plan:** Free

5. **Add Environment Variables** in Render Dashboard → Environment:

| Key | Value |
|---|---|
| `OPENAI_API_KEY` | `sk-proj-...` |
| `PINECONE_API_KEY` | `pcsk_...` |
| `TAVILY_API_KEY` | `tvly-dev-...` |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | `sb_secret_...` |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `FRONTEND_URL` | `https://your-app.vercel.app` *(set after Vercel deploy)* |
| `LOAD_MULTILINGUAL_MODEL` | `false` *(keep false — saves 420MB RAM on free tier)* |

6. Click **Deploy** → wait ~3-5 min for first build
7. Copy your Render URL: `https://lexiq-api.onrender.com`

**Verify:**
```bash
curl https://lexiq-api.onrender.com/health
# → {"status":"ok","engine":"LexIQ v3","initialized":true,"sessions":0}
```

> **Cold start note:** Render free tier sleeps after 15 min of no traffic.  
> First request after sleep takes ~45-60s to wake up. All subsequent requests are fast.  
> This is expected behavior on the free tier.

---

### Step 3: Deploy Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import GitHub repo
2. Set **Root Directory:** `lexiq_web`
3. Framework auto-detected as **Next.js** ✅

4. **Add Environment Variables** in Vercel Dashboard → Settings → Environment Variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `SUPABASE_SERVICE_KEY` | `sb_secret_...` |
| `FASTAPI_URL` | `https://lexiq-api.onrender.com` ← your Render URL |

5. Click **Deploy** → your app is live at `https://lexiq-web.vercel.app`

---

### Step 4: Final Wiring

1. **Update FRONTEND_URL on Render:**  
   Render Dashboard → Environment → set `FRONTEND_URL` = `https://lexiq-web.vercel.app`  
   → Click **Save** → Render auto-redeploys

2. **Update Supabase Auth:**  
   Supabase Dashboard → Auth → URL Configuration:
   - **Site URL:** `https://lexiq-web.vercel.app`
   - **Redirect URLs:** `https://lexiq-web.vercel.app/auth/callback`

3. **Test end-to-end:**  
   Open `https://lexiq-web.vercel.app` → Sign in → Ask a legal question → Confirm streaming works ✅

---

## Project Structure

```
lexiq_pod/
├── .gitignore
├── render.yaml                        ← Render deployment config
├── README.md
├── supabase_schema.sql                ← DB schema (reference)
├── supabase_security_fix.sql          ← RLS security policies
├── lexiq_engine.py                    ← Legacy (reference only — deprecated)
├── run.txt                            ← Local dev commands
│
├── data/                              ← Legal PDFs (bundled, ~18MB)
│   ├── BNS_rules.pdf
│   ├── IPC_rules.pdf
│   ├── the_code_of_criminal_procedure.pdf
│   ├── Income_Tax_Act_2025_as_amended_by_FA_Act_2026.pdf
│   └── Income-tax_Rules-2026.pdf
│
├── cache/                             ← BM25 pickle cache (committed)
│   └── bm25_*.pkl
│
├── fastapi_service/                   ← Deploy this to Render
│   ├── main.py                        # FastAPI entry point
│   ├── requirements.txt
│   ├── runtime.txt                    # python-3.11.9
│   ├── Procfile
│   ├── railway.json                   # (legacy — Render is preferred)
│   └── backend/                       # RAG engine package
│       ├── __init__.py
│       ├── config.py                  # Constants, paths, lookup tables
│       ├── state.py                   # Runtime singleton registry
│       ├── parsers.py                 # PDF → Document parsers
│       ├── chunker.py                 # Document chunking
│       ├── language.py                # Language detection (regex-based)
│       ├── prompts.py                 # All LLM prompts in one file
│       ├── classifier.py              # Query routing (gpt-4o-mini)
│       ├── retriever.py               # Pinecone + BM25 ensemble
│       ├── web_search.py              # Tavily web search fallback
│       ├── session.py                 # In-memory session management
│       ├── chains.py                  # LangChain chain builders
│       ├── engine.py                  # Startup orchestrator
│       └── chat.py                    # Public API: lexiq_chat_stream()
│
└── lexiq_web/                         ← Deploy this to Vercel
    ├── vercel.json
    ├── .env.production.example
    ├── next.config.js
    └── src/
        ├── app/                       # Next.js App Router pages
        ├── components/                # React components
        └── lib/                       # Hooks, Supabase, types
```

---

## Environment Variables Reference

### Backend (Render)
| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | GPT-4o + text-embedding-3-large |
| `PINECONE_API_KEY` | ✅ | Vector store |
| `TAVILY_API_KEY` | ✅ | Web search fallback |
| `SUPABASE_URL` | ✅ | Project URL |
| `SUPABASE_KEY` | ✅ | Service role key |
| `SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `FRONTEND_URL` | ✅ | Vercel URL (CORS allowlist) |
| `LOAD_MULTILINGUAL_MODEL` | ✅ | `false` on Render free (saves 420MB RAM) |

### Frontend (Vercel)
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_KEY` | ✅ | Server-side service key |
| `FASTAPI_URL` | ✅ | Render backend URL |

---

## Re-indexing Pinecone (only when adding new PDFs)

```bash
# Run locally once — Pinecone index persists in the cloud
cd fastapi_service
python -c "
from backend.config import DATA_DIR, INDEX_NAME, EMBEDDING_MODEL, EMBEDDING_DIM, ACT_CONFIG
from backend.parsers import load_all_pdfs, parse_all_sections
from backend.chunker import section_chunking, group_chunks_by_namespace
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

raw = load_all_pdfs()
_, sections = parse_all_sections(raw)
chunks = section_chunking(sections)
by_ns = group_chunks_by_namespace(chunks)
emb = OpenAIEmbeddings(model=EMBEDDING_MODEL, dimensions=EMBEDDING_DIM)

for ns, docs in by_ns.items():
    PineconeVectorStore.from_documents(docs, emb, index_name=INDEX_NAME, namespace=ns)
    print(f'Indexed {len(docs)} chunks → namespace={ns}')
"
```
