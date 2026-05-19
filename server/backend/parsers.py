"""
backend/parsers.py — PDF Section Parsers

Responsible for loading raw PDF pages and converting them into
structured LangChain Document objects, one per legal section/rule.
Each parser is format-specific (IPC, BNS, CRPC, ITA, ITR).
"""

import re
import logging
from pathlib import Path

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_core.documents import Document

from .config import ACT_CONFIG, DATA_DIR

logger = logging.getLogger("LexIQ.parsers")

# ── Title validation patterns ──────────────────────────────────────────────────
JUNK_TITLE_PATTERNS = [
    r'(?i)subs\.?\s+by', r'(?i)ins\.?\s+by', r'(?i)rep\.?\s+by',
    r'(?i)omitted\s+by', r'(?i)substituted\s+by',
    r'(?i)act\s+\d+\s+of\s+\d{4}', r'w\.e\.f\.', r'^\d+$',
    r'(?i)prior to its', r'(?i)finance act',
]


def is_valid_title(title: str) -> bool:
    for p in JUNK_TITLE_PATTERNS:
        if re.search(p, title):
            return False
    return len(title.strip()) > 3


# ── Chapter detection helpers ──────────────────────────────────────────────────

def detect_chapters(text: str) -> list:
    pattern = re.compile(
        r'(?:CHAPTER|Chapter)\s+([IVXLCDM\d]+)[.\s—\-–:]*\s*(.*)',
        re.IGNORECASE,
    )
    chapters = []
    for m in pattern.finditer(text):
        chapters.append({
            "pos": m.start(),
            "number": m.group(1).strip(),
            "title": m.group(2).strip().rstrip(".").strip(),
        })
    return chapters


def get_chapter_at_position(chapters: list, pos: int) -> str:
    current = "Preliminary"
    for ch in chapters:
        if ch["pos"] <= pos:
            current = f"Chapter {ch['number']}"
            if ch["title"]:
                current += f" – {ch['title']}"
        else:
            break
    return current


def _extract_title_content(body: str):
    title_split = re.split(r'[—–\u2014\u2013]|ΓÇö|\.–', body, maxsplit=1)
    if len(title_split) == 2:
        return title_split[0].strip().rstrip("."), title_split[1].strip()
    lines = body.split("\n", 1)
    return lines[0].strip().rstrip("."), (lines[1].strip() if len(lines) > 1 else body.strip())


def _make_doc(
    sec_num: str,
    sec_title: str,
    sec_content: str,
    act: str,
    chapter: str,
    law_status: str,
    domain: str,
    namespace: str,
) -> Document:
    return Document(
        page_content=f"Section {sec_num}. {sec_title}\n\n{sec_content}",
        metadata={
            "act": act, "chapter": chapter,
            "section_number": sec_num, "section_title": sec_title,
            "law_status": law_status, "domain": domain, "namespace": namespace,
        },
    )


# ── Format-specific parsers ────────────────────────────────────────────────────

def parse_sections_ipc(pages, act, law_status, namespace):
    full_text = "\n".join(p.page_content for p in pages)
    chapters  = detect_chapters(full_text)
    section_re = re.compile(
        r'(?:^|\n)\s*(?:Section\s+)?(\d+[A-Za-z]?)\.'
        r'\s*(.*?)(?=\n\s*(?:Section\s+)?\d+[A-Za-z]?\.\s|\Z)',
        re.DOTALL | re.IGNORECASE,
    )
    sections = []
    for m in section_re.finditer(full_text):
        sec_num, body = m.group(1), m.group(2).strip()
        if not body:
            continue
        sec_title, sec_content = _extract_title_content(body)
        if not is_valid_title(sec_title):
            sec_title = f"Section {sec_num}"
        sections.append(_make_doc(
            sec_num, sec_title, sec_content, act,
            get_chapter_at_position(chapters, m.start()),
            law_status, "criminal", namespace,
        ))
    logger.info(f"[Parser] IPC: {len(sections)} sections parsed")
    return sections


def parse_sections_bns(pages, act, law_status, namespace):
    full_text = "\n".join(p.page_content for p in pages)
    chapters  = detect_chapters(full_text)
    section_re = re.compile(
        r'(?:^|\n)\s*(\d+[A-Za-z]?)\.'
        r'\s*(.*?)(?=\n\s*\d+[A-Za-z]?\.\s|\Z)',
        re.DOTALL,
    )
    sections = []
    for m in section_re.finditer(full_text):
        sec_num = m.group(1)
        try:
            if int(re.sub(r'[A-Za-z]', '', sec_num)) > 400:
                continue
        except Exception:
            continue
        body = m.group(2).strip()
        if not body or len(body) < 20:
            continue
        sec_title, sec_content = _extract_title_content(body)
        if not is_valid_title(sec_title):
            sec_title = f"Section {sec_num}"
        sections.append(_make_doc(
            sec_num, sec_title, sec_content, act,
            get_chapter_at_position(chapters, m.start()),
            law_status, "criminal", namespace,
        ))
    logger.info(f"[Parser] BNS: {len(sections)} sections parsed")
    return sections


def parse_sections_crpc(pages, act, law_status, namespace):
    full_text = "\n".join(p.page_content for p in pages)
    chapters  = detect_chapters(full_text)
    section_re = re.compile(
        r'(?:^|\n)\s*(?:Section\s+)?(\d+[A-Za-z]?)\.'
        r'\s*(.*?)(?=\n\s*(?:Section\s+)?\d+[A-Za-z]?\.\s|\Z)',
        re.DOTALL | re.IGNORECASE,
    )
    sections = []
    for m in section_re.finditer(full_text):
        sec_num, body = m.group(1), m.group(2).strip()
        if not body or len(body) < 15:
            continue
        sec_title, sec_content = _extract_title_content(body)
        if not is_valid_title(sec_title):
            sec_title = f"Section {sec_num}"
        sections.append(_make_doc(
            sec_num, sec_title, sec_content, act,
            get_chapter_at_position(chapters, m.start()),
            law_status, "criminal", namespace,
        ))
    logger.info(f"[Parser] CRPC: {len(sections)} sections parsed")
    return sections


def parse_sections_ita(pages, act, law_status, namespace):
    full_text = "\n".join(p.page_content for p in pages)
    chapters  = detect_chapters(full_text)
    section_re = re.compile(
        r'(?:^|\n)\s*(\d{1,3}[A-Z]?)\.'
        r'\s*(.*?)(?=\n\s*\d{1,3}[A-Z]?\.\s|\Z)',
        re.DOTALL,
    )
    sections = []
    seen = set()
    for m in section_re.finditer(full_text):
        sec_num, body = m.group(1), m.group(2).strip()
        if sec_num in seen or len(body) < 40:
            continue
        if re.search(r'(?i)(substituted|omitted|inserted|amended|w\.e\.f\.|prior to)', body[:120]):
            continue
        seen.add(sec_num)
        clean_body = re.sub(r'^\([0-9a-z]+\)\s*', '', body.strip())
        title_hint = clean_body.split("\n")[0].strip()[:80].rstrip(",;—")
        if not is_valid_title(title_hint):
            title_hint = f"Section {sec_num}"
        sections.append(Document(
            page_content=f"Section {sec_num}.\n\n{body}",
            metadata={
                "act": act, "chapter": get_chapter_at_position(chapters, m.start()),
                "section_number": sec_num, "section_title": title_hint,
                "law_status": law_status, "domain": "tax", "namespace": namespace,
            },
        ))
    logger.info(f"[Parser] ITA: {len(sections)} sections parsed")
    return sections


def parse_sections_itr(pages, act, law_status, namespace):
    full_text = "\n".join(p.page_content for p in pages)
    rule_re = re.compile(
        r'(?:^|\n)\s*(\d{1,3}[A-Z]?)\.'
        r'\s*(.*?)(?=\n\s*\d{1,3}[A-Z]?\.\s|\Z)',
        re.DOTALL,
    )
    sections = []
    seen = set()
    for m in rule_re.finditer(full_text):
        rule_num, body = m.group(1), m.group(2).strip()
        if rule_num in seen or len(body) < 30:
            continue
        if re.search(r'(?i)(substituted|omitted|inserted|w\.e\.f\.)', body[:100]):
            continue
        seen.add(rule_num)
        rule_title, rule_content = _extract_title_content(body)
        if not is_valid_title(rule_title):
            rule_title = f"Rule {rule_num}"
        if len(rule_content) < 20:
            continue
        sections.append(Document(
            page_content=f"Rule {rule_num}. {rule_title}\n\n{rule_content}",
            metadata={
                "act": act, "chapter": "Income-tax Rules, 2026",
                "section_number": rule_num, "section_title": rule_title,
                "law_status": law_status, "domain": "tax", "namespace": namespace,
            },
        ))
    logger.info(f"[Parser] ITR: {len(sections)} rules parsed")
    return sections


# ── Parser dispatch ────────────────────────────────────────────────────────────
PARSER_MAP = {
    "ipc":  parse_sections_ipc,
    "bns":  parse_sections_bns,
    "crpc": parse_sections_crpc,
    "ita":  parse_sections_ita,
    "itr":  parse_sections_itr,
}


# ── PDF loader ─────────────────────────────────────────────────────────────────

def load_pdf(filepath: Path, skip_pages: int = 0) -> list:
    """Load a PDF and return its pages, skipping front matter."""
    if not filepath.exists():
        raise FileNotFoundError(f"PDF not found: {filepath}")
    loader = PyMuPDFLoader(str(filepath))
    pages  = loader.load()
    return pages[skip_pages:]


def load_all_pdfs() -> dict:
    """Load all configured PDFs. Returns {act: pages}. Warns on missing files."""
    raw_pages = {}
    for fname, cfg in ACT_CONFIG.items():
        fpath = DATA_DIR / fname
        try:
            pages = load_pdf(fpath, skip_pages=cfg.get("skip_toc_pages", 0))
            raw_pages[cfg["act"]] = pages
            logger.info(f"[Loader] {cfg['act']}: {len(pages)} pages loaded")
        except FileNotFoundError as exc:
            logger.warning(str(exc))
    return raw_pages


def parse_all_sections(raw_pages: dict) -> tuple[dict, list]:
    """Parse raw PDF pages into legal sections. Returns (sections_by_act, all_sections)."""
    sections_by_act: dict = {}
    all_sections:    list  = []
    for fname, cfg in ACT_CONFIG.items():
        act = cfg["act"]
        if act not in raw_pages:
            continue
        parser_fn = PARSER_MAP[cfg["parse_format"]]
        secs = parser_fn(raw_pages[act], act, cfg["law_status"], cfg["namespace"])
        sections_by_act[act] = secs
        all_sections.extend(secs)
    logger.info(f"[Parser] Total sections parsed: {len(all_sections)}")
    return sections_by_act, all_sections
