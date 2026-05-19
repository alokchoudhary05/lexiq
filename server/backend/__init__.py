"""
backend/ — LexIQ RAG Engine Package
Production-grade split of the monolithic lexiq_engine.py.

Module hierarchy (import order matters):
  config → parsers → chunker → language → prompts
  → state → classifier → retriever → web_search
  → session → chains → engine → chat
"""
