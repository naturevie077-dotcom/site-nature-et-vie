#!/usr/bin/env python3
"""Assemble src/ + assets/ -> dist/test.html (page de rendu : 1080x1920, window.__nb.render(t))."""
import base64, pathlib
R = pathlib.Path(__file__).parent
b64 = lambda p: base64.b64encode(pathlib.Path(p).read_bytes()).decode()
faces = "\n".join(f'@font-face {{ font-family: "Poppins"; font-weight: {w}; font-style: normal; font-display: block; src: url(data:font/woff2;base64,{b64(R/"src"/"fonts"/f"poppins-latin-{w}-normal.woff2")}) format("woff2"); }}' for w in (400, 500, 600, 700, 800))
js = "\n".join((R / "src" / f).read_text() for f in ["engine.js", "synth.js", "scenes.js"])
boot = '''
const cv = document.getElementById("stage"), g2 = cv.getContext("2d");
const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });
window.__nb = { CFG, SFX, synth, FIT_LOG, ready: false, render: (t) => { g2.setTransform(1, 0, 0, 1, 0, 0); renderFrame(g2, t); } };
Promise.all([load(document.getElementById("d").dataset.logo), load(document.getElementById("d").dataset.photo), document.fonts.load('800 40px "Poppins"'), document.fonts.load('600 40px "Poppins"'), document.fonts.load('700 40px "Poppins"'), document.fonts.load('500 40px "Poppins"')]).then(([l, p]) => { IMG.logo = l; IMG.photo = p; __nb.ready = true; __nb.render(0); });
'''
page = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Naturetvie Business</title><style>{faces}
html,body{{margin:0;background:#111}} canvas{{display:block;width:540px;height:960px}}</style></head><body><canvas id="stage" width="1080" height="1920"></canvas>
<span id="d" hidden data-logo="data:image/jpeg;base64,{b64(R/"assets"/"logo-nature-et-vie.jpg")}" data-photo="data:image/jpeg;base64,{b64(R/"assets"/"sg9-plus-advance.jpg")}"></span><script>{js}{boot}</script></body></html>'''
(R / "dist").mkdir(exist_ok=True); (R / "dist" / "test.html").write_text(page); print("OK", len(page) // 1024, "Ko")
