/* ============================================================================
 * NOVEMBRE BLEU — moteur d'animation 2D (canvas), fonction pure du temps t (s)
 * Aucun Math.random : tout est déterministe, la timeline peut être rejouée, scrubbée, enregistrée.
 * ========================================================================== */
const W = 1080, H = 1920, PI = Math.PI, TAU = PI * 2, DUR = 45;
const C = {
  navy: "#0b2a6b", ink: "#10204a", royal: "#1f4fd8", royal2: "#3b73ff", sky: "#9fd0ff", sky2: "#d8ecff", sky3: "#eef6ff",
  cream: "#fff6e3", gold: "#f2b632", gold2: "#ffd86b", red: "#e23d3d", white: "#ffffff",
};
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, d) => clamp((t - a) / d);
const E = {
  lin: (x) => x, o2: (x) => 1 - (1 - x) * (1 - x), o3: (x) => 1 - Math.pow(1 - x, 3), o4: (x) => 1 - Math.pow(1 - x, 4),
  i2: (x) => x * x, i3: (x) => x * x * x, io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), sine: (x) => -(Math.cos(PI * x) - 1) / 2,
  back: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  expo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
};
const pr = (t, a, d, e = E.o3) => e(prog(t, a, d));
const tw = (t, a, b, t0, d, e = E.o3) => lerp(a, b, pr(t, t0, d, e));
/** ressort amorti 0→1 (dépassement naturel) à partir de a */
function spr(t, a, w = 16, z = 0.5) {
  if (t <= a) return 0;
  const x = t - a, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
}
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function mixc(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
function rng(seed) { let a = seed | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const wob = (t, f, p = 0) => Math.sin(t * f * TAU + p);

let ctx = null; // contexte courant (fixé par la boucle de rendu)
function useCtx(c) { ctx = c; }

/* ---------- formes ---------- */
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function ell(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); }
function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
function fillStroke(fill, stroke, sw) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = sw || 6; ctx.strokeStyle = stroke; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); } }
function heart(x, y, s, fill, rot = 0, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.moveTo(0, 14); ctx.bezierCurveTo(-34, -8, -22, -34, 0, -16); ctx.bezierCurveTo(22, -34, 34, -8, 0, 14); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}
function sparkle(x, y, s, fill, rot = 0, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, r = i % 2 ? s * 0.28 : s; ctx.lineTo(Math.sin(a) * r, -Math.cos(a) * r); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function starburst(x, y, r1, r2, n, fill, stroke, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU, r = i % 2 ? r2 : r1; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); fillStroke(fill, stroke, 8); ctx.restore();
}
function drop(x, y, s, fill, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha; ctx.beginPath();
  ctx.moveTo(0, -30); ctx.bezierCurveTo(8, -12, 20, -2, 20, 12); ctx.arc(0, 12, 20, 0, PI); ctx.bezierCurveTo(-20, -2, -8, -12, 0, -30); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}
function shadowOn(c = "rgba(10,30,90,.28)", b = 24, oy = 12) { ctx.shadowColor = c; ctx.shadowBlur = b; ctx.shadowOffsetY = oy; }
function shadowOff() { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

/* ---------- texte ---------- */
const fontCss = (size, fam) => (fam === "body" ? `900 ${size}px "NB Nunito", system-ui, sans-serif` : `${size}px "NB Lilita", "Arial Black", sans-serif`);
const wrapCache = new Map();
function wrap(text, size, maxW, fam) {
  const k = text + "|" + size + "|" + maxW + "|" + fam;
  if (wrapCache.has(k)) return wrapCache.get(k);
  ctx.save(); ctx.font = fontCss(size, fam);
  const words = text.split(" "), lines = []; let cur = "";
  for (const w of words) { const test = cur ? cur + " " + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
  if (cur) lines.push(cur);
  ctx.restore(); wrapCache.set(k, lines); return lines;
}
/** texte contouré (titres) */
function title(txt, x, y, size, o = {}) {
  ctx.save(); ctx.font = fontCss(size, o.fam || "disp"); ctx.textAlign = o.align || "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); x = 0; y = 0; }
  if (o.sh !== false) { ctx.fillStyle = o.shc || C.royal; ctx.fillText(txt, x + (o.shx ?? 0), y + (o.shy ?? size * 0.07)); if (o.sw !== 0) { ctx.strokeStyle = o.shc || C.royal; ctx.lineWidth = (o.sw ?? size * 0.16); ctx.strokeText(txt, x + (o.shx ?? 0), y + (o.shy ?? size * 0.07)); } }
  if ((o.sw ?? size * 0.16) > 0 && o.stroke !== false) { ctx.strokeStyle = o.stroke || C.white; ctx.lineWidth = o.sw ?? size * 0.16; ctx.strokeText(txt, x, y); }
  ctx.fillStyle = o.fill || C.navy; ctx.fillText(txt, x, y); ctx.restore();
}
/** bloc de texte, mot à mot, chaque mot « pop » avec ressort. colorFn(i, mot) → couleur */
function words(t, text, cx, cy, maxW, size, t0, per, o = {}) {
  const fam = o.fam || "disp", lines = wrap(text, size, maxW, fam), lh = size * (o.lh || 1.08);
  ctx.save(); ctx.font = fontCss(size, fam); ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  const sp = ctx.measureText(" ").width; let gi = 0; const y0 = cy - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, li) => {
    const ws = ln.split(" "), widths = ws.map((w) => ctx.measureText(w).width), total = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = cx - total / 2; const y = y0 + li * lh;
    ws.forEach((w, wi) => {
      const tw0 = t0 + gi * per, p = spr(t, tw0, 15, 0.55), a = clamp((t - tw0) / 0.1);
      if (a > 0) {
        const mx = x + widths[wi] / 2; ctx.save(); ctx.translate(mx, y + (1 - p) * (o.rise ?? 34)); ctx.scale(0.55 + 0.45 * p, 0.55 + 0.45 * p); ctx.globalAlpha = (o.alpha ?? 1) * a; ctx.textAlign = "center";
        const col = o.colorFn ? o.colorFn(gi, w) : o.fill || C.navy;
        if (o.outline !== false) { ctx.strokeStyle = o.stroke || C.white; ctx.lineWidth = o.sw ?? size * 0.2; ctx.strokeText(w, 0, 0); }
        if (o.shadow) { ctx.fillStyle = o.shadow; ctx.fillText(w, 0, size * 0.06); }
        ctx.fillStyle = col; ctx.fillText(w, 0, 0); ctx.restore();
      }
      x += widths[wi] + sp; gi++;
    });
  });
  ctx.restore(); return gi;
}
const wordCount = (s) => s.split(" ").length;

/* ---------- bulle de dialogue ---------- */
function bubble(t, b) {
  if (t < b.t0 || t > b.t1 + 0.2) return;
  const bx = b.x ?? 540, size = b.size || 46, lines = wrap(b.text, size, b.w - 76, "body"), lh = size * 1.2, h = lines.length * lh + 58;
  const a = pr(t, b.t0, 0.32, (x) => E.back(x, 2.2)), out = 1 - prog(t, b.t1 - 0.05, 0.25);
  const fill = b.who === "doc" ? "#e6f1ff" : "#ffffff", x0 = bx - b.w / 2, y0 = b.y - h, tx = clamp(b.tx, x0 + 90, x0 + b.w - 90);
  ctx.save(); ctx.translate(bx, b.y); ctx.scale(a, a); ctx.translate(-bx, -b.y); ctx.globalAlpha = out; ctx.lineJoin = "round";
  shadowOn("rgba(11,42,107,.30)", 30, 14);
  rr(x0, y0, b.w, h, 44); ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx - 36, b.y - 6); ctx.quadraticCurveTo(tx - 4, b.y + 22, b.tx, b.ty); ctx.quadraticCurveTo(tx + 12, b.y + 20, tx + 36, b.y - 6); ctx.closePath(); ctx.fill(); shadowOff();
  rr(x0, y0, b.w, h, 44); ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx - 36, b.y - 3); ctx.quadraticCurveTo(tx - 4, b.y + 22, b.tx, b.ty); ctx.quadraticCurveTo(tx + 12, b.y + 20, tx + 36, b.y - 3); ctx.stroke();
  ctx.fillStyle = fill; ctx.fillRect(tx - 33, b.y - 8, 66, 9);
  const per = Math.max(0.05, (b.t1 - b.t0 - 0.5) / wordCount(b.text));
  words(t, b.text, bx, y0 + h / 2 - 2, b.w - 76, size, b.t0 + 0.25, per, { fam: "body", fill: C.ink, outline: false, lh: 1.2, rise: 14, colorFn: b.colorFn });
  ctx.restore();
}

/* ---------- onomatopée / tampon ---------- */
function pow(t, t0, txt, x, y, o = {}) {
  const u = t - t0; if (u < 0 || u > (o.life || 0.95)) return;
  const p = spr(t, t0, 18, 0.45), fade = 1 - prog(t, t0 + (o.life || 0.95) - 0.2, 0.2);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(p * (o.s || 1), p * (o.s || 1)); ctx.globalAlpha = fade;
  starburst(0, 0, 150, 100, 11, o.fill || C.gold2, C.navy, u * 0.8);
  title(txt, 0, 4, o.size || 64, { fill: C.navy, stroke: C.white, sw: 0, sh: false });
  ctx.restore();
}
function stamp(t, t0, txt, x, y, rot, size = 96) {
  if (t < t0) return;
  const u = t - t0, p = pr(t, t0, 0.22, E.o4), sc = lerp(3.0, 1, p), a = clamp(u / 0.08);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
  ctx.font = fontCss(size, "disp"); const w = ctx.measureText(txt).width + 80, h = size * 1.5;
  shadowOn("rgba(120,10,10,.35)", 18, 8);
  rr(-w / 2, -h / 2, w, h, 18); ctx.fillStyle = "#fff"; ctx.fill(); shadowOff();
  rr(-w / 2, -h / 2, w, h, 18); ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.stroke();
  rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = C.red; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, 0, 6);
  // éclaboussures d'encre au contact
  if (u < 0.45) { const q = u / 0.45; ctx.globalAlpha = (1 - q) * 0.9; for (let i = 0; i < 14; i++) { const an = (i / 14) * TAU + 0.3, r = w * 0.5 + q * 110 * (0.6 + 0.4 * ((i * 7) % 5) / 5); circ(Math.cos(an) * r, Math.sin(an) * r * 0.55, 8 * (1 - q) + 2); ctx.fillStyle = C.red; ctx.fill(); } }
  ctx.restore();
}

/* ---------- décor ---------- */
function rays(t, cx, cy, n, col, alpha, spin = 0.05) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * spin); ctx.fillStyle = col; ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) { const a0 = (i / n) * TAU, a1 = a0 + (TAU / n) * 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 2400, Math.sin(a0) * 2400); ctx.lineTo(Math.cos(a1) * 2400, Math.sin(a1) * 2400); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function sky(t, night = 0, o = {}) {
  const top = mixc(o.top || "#7cb8ff", "#07163f", night), mid = mixc(o.mid || "#cfe6ff", "#10307a", night), bot = mixc(o.bot || "#fff6e3", "#1a3f94", night);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // nuages doux
  ctx.save(); ctx.globalAlpha = 0.85 * (1 - night * 0.8);
  [[160, 330, 1.0, 0.012], [820, 560, 0.8, -0.015], [500, 180, 0.7, 0.01]].forEach(([x, y, s, v], i) => {
    const px = ((x + t * 40 * (v > 0 ? 1 : -1) * Math.abs(v) * 10) % (W + 500) + (W + 500)) % (W + 500) - 250;
    ctx.fillStyle = "#fff"; ctx.beginPath(); [[0, 0, 90], [80, -30, 70], [150, 6, 80], [-80, 14, 62]].forEach(([dx, dy, r]) => { ctx.moveTo(px + dx * s + r * s, y + dy * s); ctx.arc(px + dx * s, y + dy * s, r * s, 0, TAU); }); ctx.fill();
  });
  ctx.restore();
  // petits points décoratifs
  const r = rng(11); ctx.fillStyle = "#fff"; for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H, a = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.6 + i)); ctx.globalAlpha = a * (1 - night * 0.4); circ(x, y, 3 + r() * 5); ctx.fill(); }
  ctx.globalAlpha = 1;
}
/** cœurs/étoiles qui montent depuis (x,y) */
function floaters(t, t0, t1, x, y, kind = "heart", n = 9, seed = 3, col = C.royal2) {
  if (t < t0 || t > t1 + 1.6) return; const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const st = t0 + (i / n) * (t1 - t0) + r() * 0.12, u = t - st; if (u < 0 || u > 1.5) { r(); r(); continue; }
    const dx = (r() - 0.5) * 360, sp = 160 + r() * 120, px = x + dx + Math.sin(u * 4 + i) * 24, py = y - u * sp, s = 0.9 + r() * 0.9, al = clamp(u * 6) * (1 - prog(u, 1.0, 0.5));
    if (kind === "heart") heart(px, py, s, i % 3 === 0 ? C.gold : col, Math.sin(u * 3 + i) * 0.35, al); else sparkle(px, py, 22 * s, i % 2 ? C.gold2 : "#fff", u * 2, al);
  }
}
