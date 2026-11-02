#!/usr/bin/env python3
"""Assemble src/ -> dist/artifact.html (fragment publiable) et dist/test.html (page complète pour tests locaux)."""
import base64, pathlib
R = pathlib.Path(__file__).parent
FONT_DIR = pathlib.Path("/tmp/claude-0/-home-user-site-nature-et-vie/1c292eec-ae4c-5403-95f8-700ca69b69c2/scratchpad/nb-fonts/node_modules/@fontsource")
def b64(p): return base64.b64encode(pathlib.Path(p).read_bytes()).decode()
fonts_dir = R / "src" / "fonts"
def face(fam, weight, path):
    return f'@font-face {{ font-family: "{fam}"; font-weight: {weight}; font-style: normal; font-display: block; src: url(data:font/woff2;base64,{b64(path)}) format("woff2"); }}'
fonts = "\n".join([
    face("NB Lilita", 400, fonts_dir / "lilita-one-latin-400-normal.woff2"),
    face("NB Nunito", 700, fonts_dir / "nunito-latin-700-normal.woff2"),
    face("NB Nunito", 900, fonts_dir / "nunito-latin-900-normal.woff2"),
])
logo = "data:image/jpeg;base64," + b64(R / "src" / "logo-nature-et-vie.jpg")
js = "\n".join((R / "src" / f).read_text() for f in ["engine.js", "chars.js", "voice.js", "scenes.js", "ui.js"])
tpl = (R / "src" / "template.html").read_text()
out = tpl.replace("{{FONTS}}", fonts).replace("{{LOGO}}", logo).replace("{{JS}}", js)
(R / "dist").mkdir(exist_ok=True)
(R / "dist" / "artifact.html").write_text(out)
(R / "dist" / "test.html").write_text('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + out + "</body></html>")
print("OK", len(out) // 1024, "Ko")
