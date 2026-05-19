"""
backend/chunker.py — Document Chunking

Splits parsed legal sections into smaller chunks suitable for embedding.
Tax sections get a larger window (3000 chars) than criminal sections (2000).
"""

import logging
from collections import defaultdict

from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import MAX_LEN_CRIMINAL, MAX_LEN_TAX, OVERLAP

logger = logging.getLogger("LexIQ.chunker")


def section_chunking(sections: list) -> list:
    """
    Split legal sections into embedding-ready chunks.

    - Short sections are kept as-is.
    - Long sections are split with RecursiveCharacterTextSplitter.
    - Sub-chunk index is stored in metadata for traceability.

    Returns a flat list of Document objects.
    """
    chunks = []
    for sec in sections:
        domain  = sec.metadata.get("domain", "criminal")
        max_len = MAX_LEN_TAX if domain == "tax" else MAX_LEN_CRIMINAL

        if len(sec.page_content) <= max_len:
            chunks.append(sec)
        else:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=max_len,
                chunk_overlap=OVERLAP,
                separators=["\n\n", "\n", ". ", " ", ""],
            )
            sub_docs = splitter.split_documents([sec])
            for i, sub in enumerate(sub_docs):
                sub.metadata = {**sec.metadata, "sub_chunk": f"{i + 1}/{len(sub_docs)}"}
            chunks.extend(sub_docs)

    logger.info(f"[Chunker] {len(sections)} sections → {len(chunks)} chunks")
    return chunks


def group_chunks_by_namespace(chunks: list) -> dict:
    """Group a flat chunk list by their Pinecone namespace."""
    by_ns = defaultdict(list)
    for c in chunks:
        by_ns[c.metadata["namespace"]].append(c)
    return dict(by_ns)
