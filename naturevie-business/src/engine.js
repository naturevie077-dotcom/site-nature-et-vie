/* NATURE & VIE — Naturetvie Business : moteur d'animation 2D (canvas). Fonctions pures du temps t (s). */
const W = 1080, H = 1920, PI = Math.PI, TAU = PI * 2;
const C = {
  emerald: "#085C40", emerald2: "#0B7A55", emeraldD: "#04382a", bordeaux: "#7B1E2E", gold: "#D4AF37", gold2: "#F2D472", white: "#FFFFFF",
  plate: "#F7F7F7", ink: "#17231f", gray: "#8b9591", gray2: "#b9c1be", gray3: "#e3e8e6", grayT: "#4a5350",
};
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, d) => clamp((t - a) / d);
const E = {
  lin: (x) => x, o2: (x) => 1 - (1 - x) * (1 - x), o3: (x) => 1 - Math.pow(1 - x, 3), o4: (x) => 1 - Math.pow(1 - x, 4),
  i2: (x) => x * x, i3: (x) => x * x * x, io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), expo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  back: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
};
const pr = (t, a, d, e = E.o3) => e(prog(t, a, d));
const tw = (t, a, b, t0, d, e = E.o3) => lerp(a, b, pr(t, t0, d, e));
function spr(t, a, w = 16, z = 0.5) { if (t <= a) return 0; const x = t - a, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x)); }
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function mixc(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
function rng(seed) { let a = seed | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let ctx = null; const useCtx = (c) => (ctx = c);
const FIT_LOG = []; // contrôle de débordement : tout texte forcé à rétrécir y est consigné

/* ---------- formes ---------- */
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
function shadowOn(c = "rgba(4,56,42,.30)", b = 28, oy = 14) { ctx.shadowColor = c; ctx.shadowBlur = b; ctx.shadowOffsetY = oy; }
function shadowOff() { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function sparkle(x, y, s, fill, rot = 0, a = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.fillStyle = fill; ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU, r = i % 2 ? s * 0.26 : s; ctx.lineTo(Math.sin(an) * r, -Math.cos(an) * r); } ctx.closePath(); ctx.fill(); ctx.restore(); }

/* ---------- texte (Poppins) ---------- */
const font = (size, w = 600) => `${w} ${size}px "Poppins", system-ui, sans-serif`;
function measure(txt, size, w) { ctx.save(); ctx.font = font(size, w); const m = ctx.measureText(txt).width; ctx.restore(); return m; }
/** réduit la taille jusqu'à ce que le texte tienne dans maxW (consigne le cas échéant) */
function fitSize(txt, maxW, w, size) { let s = size; while (s > 12 && measure(txt, s, w) > maxW) s -= 1; if (s < size) FIT_LOG.push(`${txt} ${size}->${s}`); return s; }
function wrapText(txt, size, w, maxW) {
  const words = txt.split(" "), lines = []; let cur = "";
  ctx.save(); ctx.font = font(size, w);
  for (const wd of words) { const test = cur ? cur + " " + wd : wd; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = test; }
  if (cur) lines.push(cur); ctx.restore();
  lines.forEach((l) => { if (measure(l, size, w) > maxW + 1) FIT_LOG.push("OVERFLOW " + l); }); return lines;
}
/** texte multi-lignes centré/gauche ; renvoie la hauteur */
function para(txt, x, y, size, w, color, maxW, o = {}) {
  const lines = wrapText(txt, size, w, maxW), lh = size * (o.lh || 1.22);
  ctx.save(); ctx.font = font(size, w); ctx.fillStyle = color; ctx.textAlign = o.align || "left"; ctx.textBaseline = "middle"; ctx.globalAlpha = o.alpha ?? 1;
  const y0 = y - ((lines.length - 1) * lh) / 2; lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lh)); ctx.restore(); return lines.length * lh;
}
function txt(s, x, y, size, w, color, o = {}) {
  ctx.save(); ctx.font = font(size, w); ctx.textAlign = o.align || "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = o.alpha ?? 1; ctx.lineJoin = "round";
  if (o.rot || o.sc) { ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.sc) ctx.scale(o.sc, o.sc); x = 0; y = 0; }
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur ?? 20; ctx.shadowOffsetY = o.oy ?? 8; }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.sw || 10; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
/** mots qui apparaissent un à un (pop + montée) */
function wordsIn(t, text, cx, cy, size, w, color, t0, per, maxW, o = {}) {
  const lines = wrapText(text, size, w, maxW), lh = size * (o.lh || 1.2); ctx.save(); ctx.font = font(size, w); ctx.textBaseline = "middle";
  const sp = ctx.measureText(" ").width; let gi = 0; const y0 = cy - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, li) => {
    const ws = ln.split(" "), wd = ws.map((x) => ctx.measureText(x).width), total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1); let x = cx - total / 2; const y = y0 + li * lh;
    ws.forEach((word, wi) => {
      const tw0 = t0 + gi * per, p = spr(t, tw0, 15, 0.55), a = clamp((t - tw0) / 0.12);
      if (a > 0) { ctx.save(); ctx.translate(x + wd[wi] / 2, y + (1 - p) * 30); ctx.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p); ctx.globalAlpha = a * (o.alpha ?? 1); ctx.textAlign = "center"; if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; } ctx.fillStyle = o.colorFn ? o.colorFn(gi, word) : color; ctx.fillText(word, 0, 0); ctx.restore(); }
      x += wd[wi] + sp; gi++;
    });
  });
  ctx.restore(); return gi;
}

/* ---------- silhouettes et icônes ---------- */
function person(x, y, s, fill, a = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.fillStyle = fill;
  circ(0, -s * 0.38, s * 0.27); ctx.fill(); ctx.beginPath(); ctx.roundRect(-s * 0.47, -s * 0.04, s * 0.94, s * 0.86, [s * 0.46, s * 0.46, s * 0.06, s * 0.06]); ctx.fill(); ctx.restore();
}
function iconBox(cx, cy, s, col) { // colis + étiquette de prix
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s / 64, s / 64); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(-24, -12); ctx.lineTo(0, -26); ctx.lineTo(24, -12); ctx.lineTo(24, 18); ctx.lineTo(0, 30); ctx.lineTo(-24, 18); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-24, -12); ctx.lineTo(0, 2); ctx.lineTo(24, -12); ctx.moveTo(0, 2); ctx.lineTo(0, 30); ctx.stroke();
  ctx.beginPath(); ctx.arc(22, 22, 14, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = font(18, 800); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("F", 22, 23); ctx.restore();
}
function iconCal(cx, cy, s, col) { // calendrier + flèches de répétition
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s / 64, s / 64); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.roundRect(-26, -22, 52, 48, 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, -8); ctx.lineTo(26, -8); ctx.moveTo(-12, -30); ctx.lineTo(-12, -16); ctx.moveTo(12, -30); ctx.lineTo(12, -16); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 10, 10, -2.4, 2.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(12, 5); ctx.lineTo(4, 8); ctx.stroke(); ctx.restore();
}
function iconChain(cx, cy, s, col) { // personnes reliées (recrutement)
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s / 64, s / 64); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-20, 16); ctx.moveTo(0, -14); ctx.lineTo(20, 16); ctx.stroke(); person(0, -14, 26, col); person(-20, 20, 22, col); person(20, 20, 22, col); ctx.restore();
}
function checkCircle(cx, cy, r, p, fill = C.emerald2) { // coche verte animée (tracé progressif)
  if (p <= 0.001) return; ctx.save(); ctx.translate(cx, cy); ctx.scale(p, p); circ(0, 0, r); ctx.fillStyle = fill; ctx.fill();
  const k = prog(p, 0.4, 0.6), P0 = [-0.42 * r, 0.0], P1 = [-0.1 * r, 0.34 * r], P2 = [0.46 * r, -0.3 * r], l1 = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), l2 = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]), L = (l1 + l2) * k;
  ctx.strokeStyle = "#fff"; ctx.lineWidth = r * 0.24; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(P0[0], P0[1]);
  if (L <= l1) ctx.lineTo(lerp(P0[0], P1[0], L / l1), lerp(P0[1], P1[1], L / l1)); else { ctx.lineTo(P1[0], P1[1]); const q = (L - l1) / l2; ctx.lineTo(lerp(P1[0], P2[0], q), lerp(P1[1], P2[1], q)); }
  ctx.stroke(); ctx.restore();
}
function coinIcon(cx, cy, r, a = 1, rot = 0) { ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = a; circ(0, 0, r); ctx.fillStyle = C.gold; ctx.fill(); ctx.lineWidth = r * 0.12; ctx.strokeStyle = "#b8921f"; ctx.stroke(); ctx.fillStyle = "#b8921f"; ctx.font = font(r * 1.1, 800); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("F", 0, r * 0.06); ctx.restore(); }
