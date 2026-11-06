#!/usr/bin/env python3
"""Ліс — перевірки дизайн-системи (без залежностей): python scripts/check.py

1. контраст текстових і графічних пар токенів в обох темах (WCAG 2)
2. tokens.css збігається з tokens.json
3. index.html (blob D) збігається з tokens.json
4. bundle.css: сирі кольори, z-index, font-family мимо токенів
5. один cache-bust ?v= у всіх HTML
6. робочі файли з LF
Код виходу ≠ 0, якщо є хоч одна помилка."""
import io, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
errors = []


def read(p):
    return (ROOT / p).read_bytes().decode("utf-8")


def fail(check, msg):
    errors.append(f"[{check}] {msg}")


# ---------- tokens ----------
tokens = json.loads(read("tokens.json"))
css = read("tokens.css")
theme_ids = [t["id"] for t in tokens["color"]["themes"]]
first = theme_ids[0]


def block(theme):
    sel = r':root, \[data-theme="%s"\] \{' % theme if theme == first else r'\[data-theme="%s"\] \{' % theme
    m = re.search(sel + r"(.*?)\n\}", css, re.S)
    return dict(re.findall(r"--([\w-]+):\s*([^;]+);", m.group(1))) if m else {}


blocks = {t: block(t) for t in theme_ids}


def tok_value(tok, theme):
    v = tok["value"]
    v = v if isinstance(v, str) else v.get(theme, v[first])
    return re.sub(r"\{([\w-]+)\}", r"var(--\1)", v) if v.startswith("{") else v.lower()


# ---------- 2. tokens.css ↔ tokens.json ----------
for theme in theme_ids:
    for tok in tokens["color"]["tokens"]:
        want = tok_value(tok, theme)
        got = blocks[theme].get(tok["name"])
        if got is None and theme != first:
            got = blocks[first].get(tok["name"])  # токен без значення в темі успадковує першу
        if got is None:
            fail("tokens.css", f"немає --{tok['name']} ({theme})")
        elif got.strip().lower() != want.lower():
            fail("tokens.css", f"--{tok['name']} ({theme}): css={got.strip()} json={want}")

# ---------- 1. контраст ----------
palette = dict(blocks[first])


def resolve(v, theme):
    v = v.strip()
    while v.startswith("var("):
        k = v[4:-1].lstrip("-")
        v = blocks[theme].get(k) or palette[k]
        v = v.strip()
    return v


def rgb(h):
    h = h.lstrip("#")
    h = "".join(c * 2 for c in h) if len(h) == 3 else h
    return [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]


def lum(c):
    f = lambda x: x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4
    r, g, b = map(f, c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted((lum(rgb(a)), lum(rgb(b))), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def tk(name, theme):
    raw = blocks[theme].get("color-" + name) or blocks[theme].get(name) or palette.get("color-" + name) or palette[name]
    return resolve(raw, theme)


# (передній план, фон, мінімум). Текст ≥4.5, значущі рамки/іконки/фокус ≥3.
PAIRS = [
    ("text", "bg", 4.5), ("text", "surface", 4.5), ("text", "surface-raised", 4.5),
    ("text-muted", "bg", 4.5), ("text-muted", "surface", 4.5), ("text-muted", "surface-raised", 4.5),
    ("on-primary", "primary", 4.5), ("on-secondary", "secondary", 4.5),
    ("on-accent", "accent-strong", 4.5), ("on-danger", "danger", 4.5),
    ("accent-text", "bg", 4.5), ("accent-text", "surface", 4.5),
    ("primary", "bg", 3), ("primary", "surface", 3),
    ("border-strong", "bg", 3), ("border-strong", "surface", 3),
    ("focus", "bg", 3), ("focus", "surface", 3), ("focus", "surface-raised", 3),
    ("error", "bg", 4.5), ("error", "surface", 4.5), ("success", "bg", 4.5), ("success", "surface", 4.5),
    ("warning", "bg", 4.5), ("warning", "surface", 4.5), ("info", "bg", 4.5), ("info", "surface", 4.5),
    ("input-hover-border", "input-bg", 3), ("scrollbar", "bg", 3),
]
for theme in theme_ids:
    for fg, bg, need in PAIRS:
        try:
            r = ratio(tk(fg, theme), tk(bg, theme))
        except KeyError:
            fail("контраст", f"немає токена для пари {fg}/{bg} ({theme})")
            continue
        if r < need:
            fail("контраст", f"{theme}: {fg} на {bg} = {r:.2f}, потрібно ≥{need}")

# ---------- 3. index.html ↔ джерела ----------
html = read("index.html")
i = html.index("const D=")
j = html.index(";\n", i)
D = json.loads(html[i + 8 : j].replace("<\\/", "</"))
if D["tokens"] != tokens:
    fail("index.html", "D.tokens не збігається з tokens.json — перегенеруйте blob")

# ---------- 4. bundle.css ----------
bundle = read("components/bundle.css")
for n, line in enumerate(bundle.splitlines(), 1):
    code = re.sub(r"/\*.*?\*/", "", line)
    if re.search(r"#[0-9a-fA-F]{3,8}\b", code) and not re.search(r"#(000|fff)\b", code, re.I):
        fail("bundle.css", f"рядок {n}: сирий hex-колір — візьміть токен: {line.strip()[:90]}")
    if re.search(r"font-family:\s*(?!var\()", code) and "@font-face" not in code:
        fail("bundle.css", f"рядок {n}: font-family без var(--font-*)")
    m = re.search(r"z-index:\s*(-?\d+)", code)
    if m and not -1 <= int(m.group(1)) <= 2:
        fail("bundle.css", f"рядок {n}: z-index {m.group(1)} — шари вище 2 лише через --z-*")

# ---------- 5. cache-bust ----------
versions = {}
for p in ROOT.rglob("*.html"):
    if ".git" in p.parts:
        continue
    for v in set(re.findall(r"\?v=(\w+)", p.read_bytes().decode("utf-8"))):
        versions.setdefault(v, []).append(p.relative_to(ROOT).as_posix())
if len(versions) > 1:
    fail("cache-bust", "кілька версій ?v=: " + ", ".join(f"{v} ({len(f)} ф.)" for v, f in versions.items()))

# ---------- 6. LF ----------
for p in list(ROOT.glob("*.html")) + list(ROOT.glob("*.css")) + list(ROOT.glob("*.json")) + list(ROOT.glob("*.md")) + list(ROOT.glob("components/**/*")) + list(ROOT.glob("demo/*.html")):
    if p.is_file() and p.suffix in {".html", ".css", ".js", ".json", ".md", ".ts"} and b"\r\n" in p.read_bytes():
        fail("LF", f"{p.relative_to(ROOT).as_posix()}: CRLF — файли мають бути з LF")

if errors:
    print("\n".join(errors))
    print(f"\n✗ {len(errors)} помилок")
    sys.exit(1)
print("✓ усе гаразд")
