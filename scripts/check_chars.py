import subprocess, sys

result = subprocess.run(
    ["pdftotext", r"C:\Users\lance\OneDrive\Desktop\Holism\Smuts\Chap1.pdf", "-"],
    capture_output=True, text=True, encoding="utf-8", errors="replace"
)
text = result.stdout
unusual = {}
for ch in text:
    cp = ord(ch)
    if (cp > 127 or cp == 0xAD) and cp not in unusual:
        unusual[cp] = ch

with open("scripts/chars_found.txt", "w", encoding="utf-8") as f:
    for cp, ch in sorted(unusual.items()):
        f.write(f"U+{cp:04X}  {repr(ch)}\n")

print("Written to scripts/chars_found.txt")
