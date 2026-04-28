"""
Extracts modernised chapter text from .docx and .md files in the H&E Modern folder.
Writes to src/content/modernised/chapter-XX.md
Run from the project root: python scripts/extract_modernised.py
"""

import os
import re
import docx

SRC_DIR = r"C:\Users\lance\OneDrive\Desktop\Holism\New From Claude\H&E Modern"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "content", "modernised")

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

CHAPTER_FILES = {
    1: "Chapter1_Modernized.docx",
    2: "Chapter2_Modernized.docx",
    3: "Chapter3_Modernized.docx",
    4: "Chapter_4_The_Cell_and_the_Organism_Modernized.docx",
    5: "Chapter5_Modernized.docx",
    6: "Chapter6_Holism_and_Evolution_Modernised.docx",
    7: "Chapter7_Modern_English.docx",
    8: "Chapter8_Darwinism_and_Holism_Modernized.md",
    9: "Chapter9_Modern.docx",
    10: "Chapter_10_Modern.docx",
    11: "Chapter_11_Modernized.docx",
    12: "Chapter_12_The_Holistic_Universe_Modernized.docx",
}

# Summary section heading patterns (Heading 2 labels that trigger summary mode)
SUMMARY_HEADING_RE = re.compile(r"^summary\s*$", re.IGNORECASE)

# Paragraph text that begins a summary block
SUMMARY_START_RE = re.compile(r"^summary\s*[.,\-–—·*]", re.IGNORECASE)

# Chapter/book title headings to skip
CHAPTER_NUM_RE = re.compile(r"^(chapter\s+[IVXLCDM\d]+|holism\s+and\s+evolution)\s*$", re.IGNORECASE)

# All-caps short line that is a structural chapter header (not body content)
ALLCAPS_HEADER_RE = re.compile(r"^[A-Z][A-Z\s\-'&.,;:]+$")

# Separator lines
SEPARATOR_RE = re.compile(r"^\s*\*\s*\*\s*\*\s*$")

# Styles that contain the summary body text
SUMMARY_STYLES = {"summary", "summary text", "summary style"}

# Styles that are skip-candidates for structural headings
SKIP_HEADING_STYLES = {"title", "heading 1", "heading 2"}

# Body-text styles (paragraphs to include as prose)
BODY_STYLES = {"body text", "body text no indent", "first paragraph", "no_style", "normal"}


def normalise_chars(text: str) -> str:
    text = re.sub(r"([a-zA-Z])�\s+([a-zA-Z])", r"\1\2", text)
    text = re.sub(r"([a-zA-Z])�([a-zA-Z])", r"\1-\2", text)
    text = text.replace("�", "")
    text = text.replace("\xad", "")
    text = text.replace("‐", "-").replace("‑", "-")
    text = text.replace("‘", "'").replace("’", "'")
    text = text.replace("“", '"').replace("”", '"')
    for bad, good in [("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬀ", "ff"), ("ﬃ", "ffi"), ("ﬄ", "ffl")]:
        text = text.replace(bad, good)
    return text


def style_name(para) -> str:
    """Lowercased style name, 'no_style' if None."""
    if para.style is None:
        return "no_style"
    return para.style.name.lower().strip()


def is_chapter_header(text: str) -> bool:
    return bool(CHAPTER_NUM_RE.match(text.strip()))


def is_allcaps_structural(text: str) -> bool:
    s = text.strip()
    return len(s) < 90 and bool(ALLCAPS_HEADER_RE.match(s))


def strip_summary_prefix(text: str) -> str:
    return SUMMARY_START_RE.sub("", text).strip()


def extract_docx(path: str) -> str:
    doc = docx.Document(path)
    paragraphs = doc.paragraphs

    blocks: list[tuple[str, str]] = []  # (kind, text): kind = summary|body|heading|sep|skip
    heading1_count = 0
    in_summary_mode = False  # activated by Heading 2 "Summary" label
    pre_body = True  # True until first real body/summary content seen

    for para in paragraphs:
        sname = style_name(para)
        text = normalise_chars(para.text).strip()

        if not text:
            continue

        # Separator line
        if SEPARATOR_RE.match(text):
            blocks.append(("sep", ""))
            in_summary_mode = False
            continue

        # Title style → always skip
        if sname == "title":
            continue

        # Heading 1 → skip first two (chapter number + title); keep later ones as section headers
        if sname == "heading 1":
            in_summary_mode = False
            if is_chapter_header(text) or heading1_count < 2:
                heading1_count += 1
                continue
            pre_body = False
            blocks.append(("heading", text))
            continue

        # Heading 2 → "Summary" label triggers summary mode; others are section sub-headings.
        # In the pre-body zone (before any real content), a Heading 2 that is all-caps is the
        # chapter subtitle (e.g. Ch6) — skip it rather than rendering as a section heading.
        if sname == "heading 2":
            if SUMMARY_HEADING_RE.match(text):
                in_summary_mode = True
            elif pre_body and is_allcaps_structural(text):
                pass  # chapter subtitle masquerading as Heading 2 — skip
            else:
                in_summary_mode = False
                pre_body = False
                blocks.append(("heading", text))
            continue

        # In the pre-body zone, skip all-caps structural lines (chapter/section titles
        # that arrived as NO_STYLE or body styles instead of a heading style).
        if pre_body and is_allcaps_structural(text):
            continue

        # Explicit summary styles
        if sname in SUMMARY_STYLES:
            in_summary_mode = False
            pre_body = False
            content = strip_summary_prefix(text) if SUMMARY_START_RE.match(text) else text
            blocks.append(("summary", content))
            continue

        # Any paragraph whose text begins with "Summary." → summary
        if SUMMARY_START_RE.match(text):
            pre_body = False
            content = strip_summary_prefix(text)
            blocks.append(("summary", content))
            continue

        # Body text in summary mode (e.g. Ch5 pattern)
        if in_summary_mode:
            pre_body = False
            blocks.append(("summary", text))
            continue

        # Everything else is body prose
        pre_body = False
        blocks.append(("body", text))

    return render_blocks(blocks)


def render_blocks(blocks: list[tuple[str, str]]) -> str:
    parts: list[str] = []
    summary_lines: list[str] = []
    prev_kind = None

    def flush_summary():
        nonlocal summary_lines
        if summary_lines:
            joined = " ".join(summary_lines)
            parts.append(f"> **Summary:** {joined}")
            summary_lines = []

    for kind, text in blocks:
        if kind == "summary":
            if summary_lines:
                summary_lines.append(text)
            else:
                summary_lines = [text]
        else:
            flush_summary()
            if kind == "body":
                parts.append(text)
            elif kind == "heading":
                parts.append(f"## {text}")
            elif kind == "sep":
                pass  # skip visual separators
            # "skip" blocks are already excluded
        prev_kind = kind

    flush_summary()
    return "\n\n".join(parts)


def extract_md(path: str) -> str:
    """Read an already-markdown file; strip its frontmatter and return body."""
    with open(path, encoding="utf-8") as f:
        content = f.read()

    # Strip YAML frontmatter if present
    if content.startswith("---"):
        end = content.find("---", 3)
        if end != -1:
            content = content[end + 3:].lstrip()

    return normalise_chars(content).strip()


def build_markdown(chapter_num: int, title: str, body: str) -> str:
    return f"""---
title: "{title}"
chapter: {chapter_num}
edition: "Modernised"
---

{body}
"""


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    for i in range(1, 13):
        filename = CHAPTER_FILES[i]
        src_path = os.path.join(SRC_DIR, filename)
        out_path = os.path.join(OUT_DIR, f"chapter-{i:02d}.md")
        title = CHAPTER_TITLES[i - 1]

        print(f"Extracting Ch {i}: {title} ...", end=" ", flush=True)

        if not os.path.exists(src_path):
            print(f"MISSING — {src_path}")
            continue

        if filename.endswith(".md"):
            body = extract_md(src_path)
        else:
            body = extract_docx(src_path)

        body = re.sub(r"\n{3,}", "\n\n", body).strip()

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(build_markdown(i, title, body))

        print(f"done ({len(body.split()):,} words)")

    print("\nAll modernised chapters written to:", OUT_DIR)


if __name__ == "__main__":
    main()
