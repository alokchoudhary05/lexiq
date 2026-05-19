"""
LexIQ FastAPI Service — Production Entry Point

Exposes the RAG engine over HTTP with Server-Sent Events (SSE) streaming.
The backend/ package contains all AI/RAG logic — this file is intentionally
thin: routing, middleware, lifespan, and request validation only.
"""

import os
import sys
import asyncio
import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv

# ── Path setup ─────────────────────────────────────────────────────────────────
# When running from fastapi_service/, the backend/ package is a local subdir.
# When running from project root (e.g. during tests), add fastapi_service/ to path.
_THIS_DIR  = Path(__file__).resolve().parent
_ROOT_DIR  = _THIS_DIR.parent
if str(_THIS_DIR) not in sys.path:
    sys.path.insert(0, str(_THIS_DIR))
if str(_ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(_ROOT_DIR))

# Load .env (local dev — no-op on Railway where vars come from the dashboard)
load_dotenv(dotenv_path=_ROOT_DIR / ".env", override=False)

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("LexIQ.api")

# ── Engine imports (after path setup) ─────────────────────────────────────────
from backend.engine import initialize_engine
from backend.chat   import lexiq_chat_stream
import backend.state as state


# ── Lifespan (replaces deprecated @app.on_event) ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the engine once on startup; clean up on shutdown."""
    logger.info("[Startup] Booting LexIQ engine...")
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, initialize_engine)
        logger.info("[Startup] LexIQ engine ready ✓")
    except Exception as exc:
        logger.critical(f"[Startup] Engine init failed: {exc}", exc_info=True)
        raise
    yield
    # Shutdown
    logger.info("[Shutdown] LexIQ API shutting down")


# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="LexIQ API",
    description="Indian Legal RAG Assistant — BNS, CRPC, IPC, Income Tax Act & Rules",
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ──────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query:      str            = Field(..., min_length=1, max_length=2000,
                                       description="Raw user query (with optional domain prefix)")
    session_id: str            = Field(..., description="UUID — used for conversational memory")
    domain:     Optional[str]  = Field("auto", description="Domain hint (auto | criminal | tax)")


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.api_route("/health", methods=["GET", "HEAD"], tags=["System"])
async def health():
    """Liveness + readiness probe. Returns 200 when engine is initialized."""
    return {
        "status":      "ok",
        "engine":      "LexIQ v3",
        "initialized": state._engine_initialized,
        "sessions":    len(state.chat_store),
    }


@app.get("/", tags=["System"])
async def root():
    return {"message": "LexIQ API is running. POST /chat to query."}


@app.post("/chat", tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Stream an SSE response from the LexIQ RAG engine.

    SSE event format:
      data: {"type": "status",   "data": "Searching legal documents..."}
      data: {"type": "token",    "data": "According"}
      data: {"type": "metadata", "data": {"sources": [...], "lang": "en", ...}}
      data: [DONE]
    """
    if not state._engine_initialized:
        raise HTTPException(status_code=503, detail="Engine not yet initialized. Retry shortly.")

    async def generate():
        try:
            loop  = asyncio.get_event_loop()
            queue: asyncio.Queue = asyncio.Queue()

            def run_stream():
                try:
                    for event_type, data in lexiq_chat_stream(
                        request.query,
                        session_id=request.session_id,
                    ):
                        payload = json.dumps({"type": event_type, "data": data})
                        loop.call_soon_threadsafe(queue.put_nowait, payload)
                except Exception as exc:
                    err = json.dumps({"type": "error", "data": str(exc)})
                    loop.call_soon_threadsafe(queue.put_nowait, err)
                finally:
                    loop.call_soon_threadsafe(queue.put_nowait, None)  # sentinel

            loop.run_in_executor(None, run_stream)

            while True:
                item = await queue.get()
                if item is None:
                    break
                yield f"data: {item}\n\n"

        except Exception as exc:
            logger.error(f"[/chat] Stream error: {exc}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'data': str(exc)})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",
            "Connection":       "keep-alive",
        },
    )


# ── Global exception handler ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )
