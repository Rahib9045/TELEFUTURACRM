"""
Convert inactive-toggle white backgrounds to dark glass, while preserving
white button text. For every remaining `"#fff"` literal, scan backward to the
controlling CSS property (the nearest `{key:` or `,key:` — rgba inner commas are
followed by digits, never `word:`, so they don't fool the scan). Only `#fff`
governed by background/backgroundColor is darkened; color/border keep white.
"""
import re

target = "src/app/(dashboard)/registra-contratto-v10/page.tsx"
with open(target, encoding="utf-8") as fh:
    s = fh.read()

KEY = re.compile(r'[,{]\s*([a-zA-Z][a-zA-Z0-9]*)\s*:')
BG = {"background", "backgroundColor"}
GLASS = '"rgba(255,255,255,0.04)"'

out = []
last = 0
conv = 0
kept = {}
for m in re.finditer(r'"#fff"', s):
    p = m.start()
    keys = KEY.findall(s[:p])
    prop = keys[-1] if keys else "?"
    out.append(s[last:p])
    if prop in BG:
        out.append(GLASS)
        conv += 1
    else:
        out.append('"#fff"')
        kept[prop] = kept.get(prop, 0) + 1
    last = m.end()
out.append(s[last:])
s = "".join(out)

with open(target, "w", encoding="utf-8") as fh:
    fh.write(s)

print(f"Darkened {conv} inactive-toggle backgrounds -> glass")
print("Kept white (by property):")
for k, v in sorted(kept.items(), key=lambda kv: -kv[1]):
    print(f"  {v:4d}  {k}")
