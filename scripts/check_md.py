with open("src/content/original/chapter-01.md", "rb") as f:
    data = f.read(4000)

issues = [(i, b) for i, b in enumerate(data) if b > 127]
with open("scripts/md_bytes.txt", "w", encoding="ascii", errors="replace") as out:
    for pos, byte in issues[:30]:
        ctx = data[max(0, pos - 15):pos + 15]
        try:
            ctx_str = ctx.decode("utf-8", errors="replace")
        except Exception:
            ctx_str = repr(ctx)
        out.write(f"pos {pos}: 0x{byte:02X}  |  {repr(ctx_str)}\n")

print("done")
