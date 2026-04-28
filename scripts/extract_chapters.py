"""
Extracts text from Chap1.pdf–Chap12.pdf and writes to src/content/original/chapter-XX.md
Run from the project root: python scripts/extract_chapters.py
"""

import subprocess
import re
import os

PDF_DIR = r"C:\Users\lance\OneDrive\Desktop\Holism\Smuts\OCRChapters"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "content", "original")

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

NOISE_PATTERNS = [
    re.compile(r"^Syntax Warning:", re.IGNORECASE),
    re.compile(r"^\s*\d{1,3}\s*$"),
    re.compile(r"^\s*[A-Z]\s*$"),
    re.compile(r"^\s*(H[OQ]LISM|HOLISM)\s+AND\s+EVOLUTION(\s+CHAP\.?)?", re.IGNORECASE),
    re.compile(r"^\s*CHAPTER\s+[IVXLCDM]+\s*$", re.IGNORECASE),
    re.compile(r"^\s*'?HOLISM\s+AND\s+EVOLUTION\s*$", re.IGNORECASE),
    re.compile(r"^\s*[IVXivx]+\s*$"),
    re.compile(r"^\s*\.\s*$"),   # lone period (footnote marker)
    # Running chapter headers: "IX MIND AS AN ORGAN OF WHOLES 221" or "MIND. AS AN ORGAN OF WHOLES 245"
    # Optional Roman numeral prefix, uppercase words (may have OCR artifacts like . in title),
    # trailing page number (may have OCR I/l instead of 1)
    re.compile(r"^\s*([IVXLCDM]+[.\s]+)?[A-Z][A-Za-z\s'.,]+\d{2,3}[Il]?\s*$"),
]

SENTENCE_END = re.compile(r'[.!?]["’”]?\s*$')


def extract_raw(pdf_path: str) -> str:
    result = subprocess.run(
        ["pdftotext", pdf_path, "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return result.stdout


def is_noise(line: str) -> bool:
    return any(p.match(line.strip()) for p in NOISE_PATTERNS)


def is_running_header(line: str, title: str) -> bool:
    """Short all-caps line that is a running page header."""
    s = line.strip()
    if not s or len(s) > 55:
        return False
    if s == s.upper() and re.match(r"^[A-Z\s,';.\-]+$", s) and not s[0].isdigit():
        return True
    return False


def normalise_chars(text: str) -> str:
    # U+FFFD (replacement char) was an undecodable hyphen in the PDF:
    #   - FFFD + space + lowercase = line-break hyphen → join without hyphen
    #   - FFFD + lowercase (no space) = compound hyphen → restore as -
    text = re.sub(r"([a-zA-Z])�\s+([a-zA-Z])", r"\1\2", text)
    text = re.sub(r"([a-zA-Z])�([a-zA-Z])", r"\1-\2", text)
    text = text.replace("�", "")

    # Soft hyphen used for typesetting line breaks
    text = text.replace("\xad", "")

    # Typographic hyphens → standard
    text = text.replace("‐", "-").replace("‑", "-")

    # Quotes
    text = text.replace("‘", "'").replace("’", "'")
    text = text.replace("“", '"').replace("”", '"')

    # Ligatures
    for bad, good in [("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬀ", "ff"), ("ﬃ", "ffi"), ("ﬄ", "ffl")]:
        text = text.replace(bad, good)

    # Form-feed (page break marker)
    text = text.replace("\x0c", "\n")

    # Mid-word asterisks from OCR dropout: letter*letter
    # Both sides ≤2 chars → spurious character, remove (e.g. ag*e → age)
    # Otherwise → missing space between words (e.g. such*curves → such curves)
    text = re.sub(r"([a-zA-Z]{1,2})\*([a-zA-Z]{1,2})\b", r"\1\2", text)
    text = re.sub(r"([a-zA-Z])\*([a-zA-Z])", r"\1 \2", text)

    return text


def reconstruct_paragraphs(lines: list[str], title: str) -> str:
    """
    Two-pass reconstruction:
    1. Group lines between blank lines into raw chunks (handle line-break hyphens).
    2. Merge adjacent chunks that are sentence continuations.
    """
    # Pass 1: collect chunks
    chunks: list[str] = []
    current: list[str] = []

    for line in lines:
        s = line.strip()

        if not s:
            if current:
                chunks.append(" ".join(current))
                current = []
            continue

        if is_noise(line) or is_running_header(line, title):
            if current:
                chunks.append(" ".join(current))
                current = []
            continue

        # Line-break hyphenation: trailing "word-" → remove hyphen, continue
        if s.endswith("-") and len(s) > 1 and s[-2].isalpha():
            current.append(s[:-1])
        else:
            current.append(s)

    if current:
        chunks.append(" ".join(current))

    # Pass 2: merge continuation chunks into proper paragraphs
    merged: list[str] = []
    acc = ""

    for chunk in chunks:
        if not chunk.strip():
            continue

        if not acc:
            acc = chunk
            continue

        prev_ends_sentence = bool(SENTENCE_END.search(acc))
        next_starts_lower = chunk[0].islower() if chunk else False

        if not prev_ends_sentence or next_starts_lower:
            acc = acc + " " + chunk
        else:
            merged.append(acc)
            acc = chunk

    if acc:
        merged.append(acc)

    return "\n\n".join(merged)


def post_clean(text: str) -> str:
    # OCR period glued mid-word: "ha.ve" → "have"
    text = re.sub(r"([a-zA-Z]{2,})\.([a-z]{2,})", r"\1\2", text)
    # Stray space before punctuation
    text = re.sub(r" ([.,;:!?])", r"\1", text)
    # Stray comma after opening quote
    text = re.sub(r'",', '",', text)
    # Double spaces
    text = re.sub(r"  +", " ", text)
    # Excess blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def format_summary(body: str) -> str:
    """Convert 'Summary.-...' paragraph to a markdown blockquote."""
    summary_re = re.compile(r"^Summary[.,\-–—]+\s*", re.IGNORECASE)
    paragraphs = body.split("\n\n")
    result = []
    for para in paragraphs:
        if summary_re.match(para):
            content = summary_re.sub("", para).strip()
            result.append(f"> **Summary:** {content}")
        else:
            result.append(para)
    return "\n\n".join(result)


def build_markdown(chapter_num: int, title: str, body: str) -> str:
    return f"""---
title: "{title}"
chapter: {chapter_num}
---

{body}
"""


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    for i in range(1, 13):
        pdf_path = os.path.join(PDF_DIR, f"Chap{i} Copy.pdf")
        out_path = os.path.join(OUT_DIR, f"chapter-{i:02d}.md")
        title = CHAPTER_TITLES[i - 1]

        print(f"Extracting Ch {i}: {title} ...", end=" ", flush=True)

        if not os.path.exists(pdf_path):
            print(f"MISSING — {pdf_path}")
            continue

        raw = extract_raw(pdf_path)
        raw = normalise_chars(raw)
        lines = raw.splitlines()
        body = reconstruct_paragraphs(lines, title)
        body = post_clean(body)
        body = format_summary(body)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(build_markdown(i, title, body))

        print(f"done ({len(body.split()):,} words)")

    print("\nAll chapters written to:", OUT_DIR)


if __name__ == "__main__":
    main()
