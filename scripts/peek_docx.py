import docx, sys

path = sys.argv[1]
doc = docx.Document(path)
for i, para in enumerate(doc.paragraphs[:30]):
    style = para.style.name
    text = para.text.strip()
    if text:
        print(f"[{style}] {text[:120]}")
