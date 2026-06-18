"""
Dark-glassmorphism codemod for the v10 Registra Contratto page.

Extends the canonical light->dark mapping established in theme_patch.py /
apply_glass.py (the project's "our design" palette) to cover every color
literal present in CRM_v10_Desktop.jsx.

Strategy:
  * #fff / white -> handled PROPERTY-AWARE: only `background`/`backgroundColor`
    and border uses become translucent; `color:"#fff"` (white button text) is
    preserved.
  * Dark/gray text hexes (#000..#999, status dark-text) -> BARE replace; data
    confirms none are ever used as backgrounds, so this safely catches ternaries
    (e.g. color:cond?"#888":"#333") without creating white boxes.
  * Neutral light grays & tinted backgrounds -> BARE replace to dark glass /
    hue-matched dark tints.
  * Brand/accent hexes (#6f42c1,#dc3545,#28a745,#2e75b6,#e60000,...) untouched.
All matches are case-insensitive with a hex word-boundary so 3-char tokens
(#ccc) never corrupt a longer hex.
"""
import re

target = "src/app/(dashboard)/registra-contratto-v10/page.tsx"
with open(target, encoding="utf-8") as fh:
    s = fh.read()

stats = {}

def count(label, before, after):
    stats[label] = stats.get(label, 0) + (before - after)

# ── 1) PROPERTY-AWARE white backgrounds -> glass (keep color:"#fff") ──
def bg_white(m):
    return f'{m.group(1)}:{m.group(2)}rgba(255,255,255,0.02){m.group(2)}'
before = s.count("rgba(255,255,255,0.02)")
s = re.sub(r'(background|backgroundColor)\s*:\s*("|\')(?:#fff|#ffffff|white)\2',
           bg_white, s, flags=re.I)
stats["white-bg -> glass"] = s.count("rgba(255,255,255,0.02)") - before

# white borders -> translucent
s = re.sub(r'(solid |dashed |dotted )#fff(?![0-9a-fA-F])',
           r'\1rgba(255,255,255,0.2)', s, flags=re.I)
s = re.sub(r'(borderColor\s*:\s*("|\'))#fff\2', r'\1rgba(255,255,255,0.2)\2', s, flags=re.I)

# ── 2) BARE token maps (boundary-safe, case-insensitive) ──
BARE = {
    # neutral light backgrounds -> dark glass
    "#f0f2f5": "transparent",
    "#fafafa": "rgba(255,255,255,0.03)",
    "#fafbfc": "rgba(255,255,255,0.03)",
    "#f8f9fa": "rgba(255,255,255,0.03)",
    "#f8f8f8": "rgba(255,255,255,0.03)",
    "#f5f5f5": "rgba(255,255,255,0.03)",
    "#f0f0f0": "rgba(255,255,255,0.03)",
    "#eee": "rgba(255,255,255,0.06)",
    "#e8e8e8": "rgba(255,255,255,0.06)",
    # light borders -> translucent white
    "#e0e0e0": "rgba(255,255,255,0.1)",
    "#d0d0d0": "rgba(255,255,255,0.1)",
    "#d6d6d6": "rgba(255,255,255,0.1)",
    "#ccc": "rgba(255,255,255,0.1)",
    "#ddd": "rgba(255,255,255,0.1)",
    # blue tints
    "#f0f8ff": "rgba(0,114,198,0.10)",
    "#f0f7ff": "rgba(0,114,198,0.10)",
    "#eef6ff": "rgba(0,114,198,0.10)",
    "#b8d4f0": "rgba(0,114,198,0.18)",
    "#bdd7ee": "rgba(0,114,198,0.18)",
    # purple tints
    "#f3eefb": "rgba(111,66,193,0.12)",
    "#f0ebff": "rgba(111,66,193,0.12)",
    "#f8f4ff": "rgba(111,66,193,0.12)",
    "#ede6ff": "rgba(111,66,193,0.12)",
    # green tints
    "#d4edda": "rgba(40,167,69,0.12)",
    "#eafaf0": "rgba(40,167,69,0.12)",
    "#f0fff0": "rgba(40,167,69,0.12)",
    # red tints
    "#fff5f5": "rgba(220,53,69,0.12)",
    "#fff0f0": "rgba(220,53,69,0.12)",
    "#f8d7da": "rgba(220,53,69,0.12)",
    "#f0e0e0": "rgba(220,53,69,0.12)",
    # amber tints
    "#fff3cd": "rgba(245,158,11,0.14)",
    "#fff3e0": "rgba(245,158,11,0.14)",
    # dark text -> light
    "#000": "#f8fafc", "#111": "#f8fafc", "#222": "#f8fafc", "#333": "#f8fafc",
    "#1a1a1a": "#f8fafc", "#1a1a2e": "#f8fafc",
    "#444": "#8892b0", "#555": "#8892b0", "#666": "#8892b0", "#6b7280": "#8892b0",
    "#777": "#64748b", "#888": "#64748b", "#999": "#64748b", "#aaa": "#64748b",
    "#bbb": "#64748b",
    # status dark-text on tints -> readable light hue
    "#155724": "#28a745", "#1a7a3d": "#28a745",
    "#721c24": "#f87171",
    "#856404": "#f59e0b", "#92400e": "#f59e0b",
}
for tok, rep in BARE.items():
    pat = re.compile(re.escape(tok) + r'(?![0-9a-fA-F])', re.I)
    n = len(pat.findall(s))
    if n:
        s = pat.sub(rep, s)
        stats[tok + " -> " + rep] = n

with open(target, "w", encoding="utf-8") as fh:
    fh.write(s)

print("Applied dark-glass codemod. Replacements:")
for k, v in sorted(stats.items(), key=lambda kv: -kv[1]):
    if v:
        print(f"  {v:4d}  {k}")
print("TOTAL:", sum(stats.values()))
