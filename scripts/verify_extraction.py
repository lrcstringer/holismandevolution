"""
Verify that the markdown extractions in src/content/original/chapter-XX.md
faithfully represent the source PDFs in C:\\Users\\lance\\OneDrive\\Desktop\\Holism\\Smuts\\ChapN.pdf

Run from the project root: python scripts/verify_extraction.py
"""

import subprocess
import re
import os
import difflib
import string
import sys
import io

# Force UTF-8 output on Windows so unicode in extracted text doesn't crash
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PDF_DIR = r"C:\Users\lance\OneDrive\Desktop\Holism\Smuts\OCRChapters"
MD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                      "src", "content", "original")
REPORT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "verification_report.txt")

CHAPTER_TITLES = [
    "The Reform of Fundamental Concepts",
    "The Reformed Concepts of Space and Time",
    "The Reformed Concept of Matter",
    "The Cell and the Organism",
    "General Concept of Holism",
    "Some Holistic Functions and Categories",
    "Mechanism and Holism",
    "Darwinism and Holism",
    "Mind as an Organ of Wholes",
    "Personality as a Whole",
    "Some Functions and Ideals of Personality",
    "The Holistic Universe",
]

# ---------------------------------------------------------------------------
# Copied EXACTLY from extract_chapters.py
# ---------------------------------------------------------------------------
NOISE_PATTERNS = [
    re.compile(r"^Syntax Warning:", re.IGNORECASE),
    re.compile(r"^\s*\d{1,3}\s*$"),
    re.compile(r"^\s*[A-Z]\s*$"),
    re.compile(r"^\s*(H[OQ]LISM|HOLISM)\s+AND\s+EVOLUTION(\s+CHAP\.?)?", re.IGNORECASE),
    re.compile(r"^\s*CHAPTER\s+[IVXLCDM]+\s*$", re.IGNORECASE),
    re.compile(r"^\s*'?HOLISM\s+AND\s+EVOLUTION\s*$", re.IGNORECASE),
    re.compile(r"^\s*[IVXivx]+\s*$"),
    re.compile(r"^\s*\.\s*$"),   # lone period (footnote marker)
    re.compile(r"^\s*([IVXLCDM]+[.\s]+)?[A-Z][A-Za-z\s'.,]+\d{2,3}[Il]?\s*$"),
]

SENTENCE_END = re.compile(r'[.!?]["\'"]?\s*$')


def normalise_chars(text: str) -> str:
    """Copied exactly from extract_chapters.py"""
    text = re.sub(r"([a-zA-Z])＝\s+([a-zA-Z])", r"\1\2", text)
    text = re.sub(r"([a-zA-Z])＝([a-zA-Z])", r"\1-\2", text)
    text = text.replace("＝", "")

    # U+FFFD replacement character
    text = re.sub(r"([a-zA-Z])�\s+([a-zA-Z])", r"\1\2", text)
    text = re.sub(r"([a-zA-Z])�([a-zA-Z])", r"\1-\2", text)
    text = text.replace("�", "")

    # Soft hyphen
    text = text.replace("\xad", "")

    # Typographic hyphens → standard
    text = text.replace("‐", "-").replace("‑", "-")

    # Quotes
    text = text.replace("‘", "'").replace("’", "'")
    text = text.replace("“", '"').replace("”", '"')

    # Ligatures
    for bad, good in [("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬀ", "ff"),
                      ("ﬃ", "ffi"), ("ﬄ", "ffl")]:
        text = text.replace(bad, good)

    # Form-feed
    text = text.replace("\x0c", "\n")

    return text


def is_noise(line: str) -> bool:
    """Copied exactly from extract_chapters.py"""
    return any(p.match(line.strip()) for p in NOISE_PATTERNS)


def is_running_header(line: str, title: str) -> bool:
    """Copied exactly from extract_chapters.py"""
    s = line.strip()
    if not s or len(s) > 55:
        return False
    if s == s.upper() and re.match(r"^[A-Z\s,';.\-]+$", s) and not s[0].isdigit():
        return True
    return False


# ---------------------------------------------------------------------------
# PDF text extraction helpers
# ---------------------------------------------------------------------------
def extract_raw_pdf(pdf_path: str) -> str:
    result = subprocess.run(
        ["pdftotext", pdf_path, "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return result.stdout


def pdf_clean_lines(raw: str, title: str) -> list[str]:
    """Apply the same line-level cleaning as reconstruct_paragraphs (pass 1)."""
    lines = raw.splitlines()
    kept = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if is_noise(line) or is_running_header(line, title):
            continue
        # Line-break hyphenation: trailing "word-" → strip the hyphen
        if s.endswith("-") and len(s) > 1 and s[-2].isalpha():
            kept.append(s[:-1])
        else:
            kept.append(s)
    return kept


def words_from_text(text: str) -> list[str]:
    """Split on whitespace, strip leading/trailing punctuation for comparison."""
    raw_words = text.split()
    result = []
    for w in raw_words:
        w = w.strip(string.punctuation + "—–‒‐‑")
        if w:
            result.append(w.lower())
    return result


# ---------------------------------------------------------------------------
# Markdown body extraction
# ---------------------------------------------------------------------------
def strip_frontmatter(text: str) -> str:
    """Remove YAML frontmatter delimited by --- … ---"""
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            return text[end + 4:]
    return text


def strip_markdown(text: str) -> str:
    """Strip basic markdown syntax to get plain comparable text."""
    # Blockquote markers
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)
    # Bold / italic markers
    text = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}(.*?)_{1,3}", r"\1", text)
    # Heading markers
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    # Inline code
    text = re.sub(r"`+([^`]*)`+", r"\1", text)
    # Links [text](url)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    return text


def md_plain_text(md_path: str) -> str:
    with open(md_path, "r", encoding="utf-8") as f:
        raw = f.read()
    body = strip_frontmatter(raw)
    body = strip_markdown(body)
    return body


# ---------------------------------------------------------------------------
# Tilde / double-tilde detection
# ---------------------------------------------------------------------------
def find_tilde_contexts(text: str, label: str) -> list[str]:
    """Find all occurrences of ~ or ~~ and return context strings."""
    results = []
    for m in re.finditer(r"~+", text):
        start = max(0, m.start() - 20)
        end = min(len(text), m.end() + 20)
        snippet = repr(text[start:end])
        results.append(f"  [{label}] pos={m.start()} pattern={repr(m.group())} ctx={snippet}")
    return results


# ---------------------------------------------------------------------------
# Word-level diff (sequential scan using SequenceMatcher)
# ---------------------------------------------------------------------------
def word_diff(pdf_words: list[str], md_words: list[str], limit: int = 50):
    """
    Return (missing_from_md, missing_from_pdf) — words that appear in one
    sequence but not (at that position) in the other.
    """
    matcher = difflib.SequenceMatcher(None, pdf_words, md_words, autojunk=False)
    missing_from_md = []  # in PDF but not in MD
    missing_from_pdf = []  # in MD but not in PDF

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        if tag in ("delete", "replace"):
            missing_from_md.extend(pdf_words[i1:i2])
        if tag in ("insert", "replace"):
            missing_from_pdf.extend(md_words[j1:j2])

    return missing_from_md[:limit], missing_from_pdf[:limit]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    lines_out = []

    def out(s=""):
        print(s)
        lines_out.append(s)

    out("=" * 80)
    out("EXTRACTION VERIFICATION REPORT")
    out(f"Generated: {__import__('datetime').datetime.now().isoformat(timespec='seconds')}")
    out("=" * 80)
    out()

    # Summary table header
    table_header = (
        f"{'Ch':>3}  {'PDF words':>10}  {'MD words':>10}  "
        f"{'PDF chars':>10}  {'MD chars':>10}  "
        f"{'Miss->MD':>10}  {'Miss->PDF':>10}  {'Tildes PDF':>10}  {'Tildes MD':>10}"
    )
    out(table_header)
    out("-" * len(table_header))

    summary_rows = []
    chapter_details = []

    for i in range(1, 13):
        title = CHAPTER_TITLES[i - 1]
        pdf_path = os.path.join(PDF_DIR, f"Chap{i} Copy.pdf")
        md_path = os.path.join(MD_DIR, f"chapter-{i:02d}.md")

        if not os.path.exists(pdf_path):
            out(f"  Ch {i}: MISSING PDF {pdf_path}")
            continue
        if not os.path.exists(md_path):
            out(f"  Ch {i}: MISSING MD  {md_path}")
            continue

        # --- PDF side ---
        raw_pdf = extract_raw_pdf(pdf_path)
        normed_pdf = normalise_chars(raw_pdf)
        clean_lines = pdf_clean_lines(normed_pdf, title)
        pdf_joined = " ".join(clean_lines)
        pdf_words = words_from_text(pdf_joined)
        pdf_chars = len(pdf_joined)

        # --- Markdown side ---
        md_plain = md_plain_text(md_path)
        md_words = words_from_text(md_plain)
        md_chars = len(md_plain.strip())

        # --- Tilde scan ---
        pdf_tildes = find_tilde_contexts(raw_pdf, "raw-pdf")
        md_tildes = find_tilde_contexts(md_plain, "md-plain")

        # --- Word diff ---
        missing_from_md, missing_from_pdf = word_diff(pdf_words, md_words)

        row = (
            f"{i:>3}  {len(pdf_words):>10,}  {len(md_words):>10,}  "
            f"{pdf_chars:>10,}  {md_chars:>10,}  "
            f"{len(missing_from_md):>10,}  {len(missing_from_pdf):>10,}  "
            f"{len(pdf_tildes):>10}  {len(md_tildes):>10}"
        )
        summary_rows.append(row)

        chapter_details.append({
            "i": i,
            "title": title,
            "pdf_words": len(pdf_words),
            "md_words": len(md_words),
            "pdf_chars": pdf_chars,
            "md_chars": md_chars,
            "missing_from_md": missing_from_md,
            "missing_from_pdf": missing_from_pdf,
            "pdf_tildes": pdf_tildes,
            "md_tildes": md_tildes,
        })

    # Print summary table
    for row in summary_rows:
        out(row)

    out()
    out("Column legend:")
    out("  Miss->MD  = words present in PDF sequence but absent at that position in MD")
    out("  Miss->PDF = words present in MD sequence but absent at that position in PDF")
    out("  (First 50 diffs per chapter; counts shown are what was captured, up to 50)")
    out()

    # Per-chapter detail
    out("=" * 80)
    out("CHAPTER DETAIL")
    out("=" * 80)

    for d in chapter_details:
        i = d["i"]
        out()
        out(f"--- Chapter {i}: {d['title']} ---")
        out(f"  PDF words: {d['pdf_words']:,}   MD words: {d['md_words']:,}")
        out(f"  PDF chars: {d['pdf_chars']:,}   MD chars: {d['md_chars']:,}")
        out(f"  Word delta: {d['md_words'] - d['pdf_words']:+,}")

        # Tilde report
        if d["pdf_tildes"] or d["md_tildes"]:
            out()
            out("  TILDE OCCURRENCES:")
            for ctx in d["pdf_tildes"]:
                out(ctx)
            for ctx in d["md_tildes"]:
                out(ctx)
        else:
            out("  No tilde occurrences found.")

        # Word diff
        if d["missing_from_md"]:
            out()
            out(f"  Words in PDF missing from MD [Miss->MD] (first {len(d['missing_from_md'])}):")
            # Print in groups of 10
            chunk = d["missing_from_md"]
            for start in range(0, len(chunk), 10):
                out("    " + "  ".join(chunk[start:start + 10]))
        else:
            out("  No words found in PDF that are missing from MD.")

        if d["missing_from_pdf"]:
            out()
            out(f"  Words in MD missing from PDF [Miss->PDF] (first {len(d['missing_from_pdf'])}):")
            chunk = d["missing_from_pdf"]
            for start in range(0, len(chunk), 10):
                out("    " + "  ".join(chunk[start:start + 10]))
        else:
            out("  No words found in MD that are missing from PDF.")

    out()
    out("=" * 80)
    out("END OF REPORT")
    out("=" * 80)

    # Write report file
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines_out) + "\n")

    print(f"\nReport written to: {REPORT_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
