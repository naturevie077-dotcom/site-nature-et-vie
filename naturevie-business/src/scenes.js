/* ============================================================================
 * NATURETVIE BUSINESS — 52 s, 6 scènes. Tous les minutages sont dans CFG :
 * pour recaler sur la voix off, il suffit de modifier ces valeurs.
 * ========================================================================== */
const CFG = {
  dur: 52,
  s2: 5.0, s3: 8.0, s4: 22.0, s5: 38.0, s6: 44.0,
  logo: 6.15,
  head: 8.5, rowsL: [9.8, 14.2, 18.4],        // scène 3 : colonne gauche
  tableUp: 22.0,                               // le tableau monte, la colonne droite se remplit
  headR: 22.4, rowsR: [23.6, 26.8, 30.4],      // scène 4 : colonne droite (coches)
  photo: 30.6, bonus: 32.8, example: 34.4,
  s5words: 38.5, point: 41.7,
  s6title: 44.3, label: 45.4, number: 45.9, underline: 47.5, group: 48.6,
};
const SFX = (() => {
  const a = []; for (let k = 1; k <= 20; k++) a.push([0.25 + 3.3 * (1 - Math.pow(1 - k / 20, 1.7)), "tick"]);
  return a.concat([[4.02, "thud"], [4.95, "whoosh"], [5.05, "fall"], [CFG.logo, "pop"], [CFG.logo + 0.2, "ding"], [7.65, "whoosh"], [CFG.head, "pop"], [CFG.rowsL[0], "pop"], [CFG.rowsL[1], "pop"], [CFG.rowsL[2], "pop"],
    [CFG.tableUp - 0.1, "whoosh"], [CFG.headR, "pop"], [CFG.rowsR[0] + 0.3, "check"], [CFG.rowsR[1] + 0.3, "check"], [CFG.rowsR[2] + 0.3, "check"], [CFG.photo, "whoosh"], [CFG.bonus, "coin"],
    [CFG.s5 - 0.25, "whoosh"], [CFG.point, "thud"], [CFG.point + 0.05, "ding"], [CFG.s6 - 0.1, "whoosh"], [CFG.number, "tick"], [CFG.number + 0.18, "tick"], [CFG.number + 0.36, "tick"], [CFG.number + 0.54, "tick"], [CFG.number + 0.72, "tick"], [CFG.group + 0.1, "ding"]]);
})();
let IMG = { logo: null, photo: null };

/* ---------- fonds ---------- */
function bgGray(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#eef1f0"); g.addColorStop(1, "#cfd6d3"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(540, 900, 300, 540, 960, 1300); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(30,40,36,.18)"); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function bgLight(t, mint = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mixc("#f5f7f6", "#eef7f2", mint)); g.addColorStop(1, mixc("#e9eeec", "#dff0e8", mint)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (mint > 0) { ctx.globalAlpha = 0.6 * mint; const r = ctx.createRadialGradient(540, 1100, 20, 540, 1100, 760); r.addColorStop(0, "rgba(255,255,255,.75)"); r.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = r; ctx.fillRect(0, 500, W, 1200); ctx.globalAlpha = 1; }
}
function bgEmerald(t) {
  const g = ctx.createRadialGradient(540, 760, 80, 540, 960, 1500); g.addColorStop(0, "#0e8a60"); g.addColorStop(0.45, C.emerald); g.addColorStop(1, C.emeraldD); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; // alvéoles discrètes
  for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) { const x = c * 200 + (r % 2) * 100 - 60 + Math.sin(t * 0.3 + r) * 6, y = r * 240 - 40; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU + PI / 6; ctx.lineTo(x + Math.cos(a) * 110, y + Math.sin(a) * 110); } ctx.closePath(); ctx.stroke(); }
  ctx.restore();
  const r = rng(4); for (let i = 0; i < 18; i++) { const x = r() * W, y = ((r() * H - t * (10 + r() * 14)) % H + H) % H; ctx.globalAlpha = 0.18 + 0.14 * Math.sin(t * 1.4 + i); circ(x, y, 3 + r() * 5); ctx.fillStyle = C.gold2; ctx.fill(); } ctx.globalAlpha = 1;
}

/* ---------- pyramide ---------- */
const PYR = (() => {
  const a = []; let k = 0;
  for (let L = 0; L < 6; L++) for (let i = 0; i <= L; i++) { a.push({ k: k++, L, i, x: 540 + (i - L / 2) * 160, y: 800 + L * 150 }); }
  a.forEach((p) => { p.par = p.L === 0 ? null : a.find((q) => q.L === p.L - 1 && q.i === clamp(p.i - (p.i > p.L / 2 ? 1 : 0), 0, p.L - 1)); p.ta = 0.25 + 3.3 * (1 - Math.pow(1 - p.k / 20, 1.7)); });
  return a;
})();
function pyramid(t, fall = 0) {
  const tf = Math.min(t, 4.0), hit = t > 4.0 ? Math.exp(-(t - 4.0) * 7) * Math.sin((t - 4.0) * 40) * 0.05 : 0, cold = pr(t, 4.0, 0.5, E.o2);
  PYR.forEach((p) => {
    const sp = spr(tf, p.ta, 16, 0.55); if (sp <= 0.001) return; const par = p.par || p;
    let x = lerp(par.x, p.x, clamp(sp, 0, 1.15)), y = lerp(par.y, p.y, clamp(sp, 0, 1.15)), a = clamp((tf - p.ta) / 0.12), sc = 0.35 + 0.65 * sp, rot = 0, lineA = 1;
    if (fall > 0) { const u = Math.max(0, t - (CFG.s2 + p.L * 0.07)); y += 2400 * u * u; rot = u * (p.i % 2 ? 1.6 : -1.6); a *= 1 - prog(u, 0.35, 0.35); lineA = 1 - prog(u, 0, 0.12); x += (p.x - 540) * 0.25 * u; }
    if (p.par) { ctx.save(); ctx.globalAlpha = a * 0.55 * lineA * clamp(sp); ctx.strokeStyle = "#9aa4a0"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(par.x, par.y); ctx.lineTo(x, y); ctx.stroke(); ctx.restore(); }
    const col = p.L === 0 ? mixc("#3d4643", "#2a302e", cold) : mixc(mixc("#a2aca8", "#7d8784", p.L / 5), "#6f7976", cold * 0.6);
    person(x, y, 112 * sc * (1 + hit), col, a, rot);
  });
  // pièce d'or hors d'atteinte, au sommet
  const ca = spr(tf, 0.6, 14, 0.5); if (ca > 0.01 && !fall) { const bob = Math.sin(t * 3) * 8; coinIcon(540, 640 + bob, 50 * ca, ca, Math.sin(t * 2) * 0.1); sparkle(588, 596 + bob, 18 * ca, C.gold2, t * 2, 0.8); }
}

/* ---------- logo sur sa plaque #F7F7F7 ---------- */
function logoPlate(cx, cy, size, a = 1, sc = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.globalAlpha = a;
  shadowOn("rgba(0,0,0,.35)", 40, 18); rr(-size / 2, -size / 2, size, size, size * 0.09); ctx.fillStyle = C.plate; ctx.fill(); shadowOff();
  if (IMG.logo) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; const s = size * 0.9; ctx.drawImage(IMG.logo, -s / 2, -s / 2, s, s); }
  ctx.restore();
}

/* ---------- tableau comparatif (partagé scènes 3 et 4) ---------- */
const COL = { x1: 50, x2: 560, w: 470 };
function tableTop(t) { return lerp(640, 150, pr(t, CFG.tableUp, 0.8, E.io3)); }
function rowY(T, i) { return T + 124 + i * 177; }
const ROWS_L = [["Gains liés au recrutement", iconChain], ["Kit de départ souvent payant", iconBox], ["Achats mensuels pour rester actif", iconCal]];
const ROWS_R = ["Boîtes à prix partenaire", "Votre marge à la revente", "par boîte de SG9 Plus"];
function drawTable(t) {
  const T = tableTop(t), dim = pr(t, CFG.tableUp, 0.8, E.o2);
  // --- colonne gauche
  const hp = spr(t, CFG.head, 14, 0.6); if (hp > 0.01) {
    ctx.save(); ctx.translate(lerp(-300, 0, clamp(hp)), 0); ctx.globalAlpha = clamp(hp * 2) * lerp(1, 0.62, dim);
    rr(COL.x1, T, COL.w, 110, 26); ctx.fillStyle = C.gray; ctx.fill(); para("Beaucoup de plans MLM", COL.x1 + COL.w / 2, T + 55, 36, 700, "#fff", COL.w - 56, { align: "center", lh: 1.18 }); ctx.restore();
  }
  ROWS_L.forEach(([label, icon], i) => {
    const t0 = CFG.rowsL[i], p = spr(t, t0, 14, 0.6); if (p <= 0.01) return; const y = rowY(T, i);
    ctx.save(); ctx.translate(lerp(-340, 0, clamp(p)), 0); ctx.globalAlpha = clamp(p * 2) * lerp(1, 0.62, dim);
    shadowOn("rgba(40,50,46,.14)", 18, 8); rr(COL.x1, y, COL.w, 165, 26); ctx.fillStyle = "#fff"; ctx.fill(); shadowOff(); rr(COL.x1, y, COL.w, 165, 26); ctx.strokeStyle = "#d3dad7"; ctx.lineWidth = 3; ctx.stroke();
    icon(COL.x1 + 62, y + 82, 66, C.gray);
    para(label, COL.x1 + 112, y + 82, 38, 600, C.grayT, COL.w - 130, { lh: 1.15 }); ctx.restore();
  });
  // --- colonne droite : gabarit en pointillés (scène 3), puis remplissage (scène 4)
  const gh = pr(t, CFG.head + 0.3, 0.5) * (1 - pr(t, CFG.headR, 0.25));
  if (gh > 0) { ctx.save(); ctx.globalAlpha = gh * 0.55; ctx.setLineDash([16, 14]); ctx.strokeStyle = C.emerald; ctx.lineWidth = 4; rr(COL.x2, T, COL.w, 110, 26); ctx.stroke(); for (let i = 0; i < 3; i++) { rr(COL.x2, rowY(T, i), COL.w, 165, 26); ctx.stroke(); } ctx.setLineDash([]); ctx.restore(); }
  const rp = spr(t, CFG.headR, 13, 0.6); if (rp > 0.01) {
    ctx.save(); ctx.translate(lerp(300, 0, clamp(rp)), 0); ctx.globalAlpha = clamp(rp * 2); shadowOn("rgba(8,92,64,.35)", 22, 10); rr(COL.x2, T, COL.w, 110, 26); ctx.fillStyle = C.emerald; ctx.fill(); shadowOff();
    txt("Nature & Vie", COL.x2 + COL.w / 2, T + 55, fitSize("Nature & Vie", COL.w - 50, 800, 44), 800, "#fff"); ctx.restore();
  }
  ROWS_R.forEach((label, i) => {
    const t0 = CFG.rowsR[i], p = spr(t, t0, 14, 0.6); if (p <= 0.01) return; const y = rowY(T, i), last = i === 2;
    ctx.save(); ctx.translate(lerp(320, 0, clamp(p)), 0); ctx.globalAlpha = clamp(p * 2);
    shadowOn(last ? "rgba(212,175,55,.45)" : "rgba(8,92,64,.22)", 20, 8); rr(COL.x2, y, COL.w, 165, 26); ctx.fillStyle = last ? "#fffaf0" : "#fff"; ctx.fill(); shadowOff();
    rr(COL.x2, y, COL.w, 165, 26); ctx.strokeStyle = last ? C.gold : C.emerald2; ctx.lineWidth = last ? 5 : 3.5; ctx.stroke(); ctx.restore();
    checkCircle(COL.x2 + 62, y + 82, 32, clamp(spr(t, t0 + 0.28, 16, 0.5)));
    ctx.save(); ctx.globalAlpha = clamp((t - t0 - 0.1) / 0.3);
    if (last) { txt("+ 2 500 F", COL.x2 + 112, y + 56, 48, 800, "#8f6b00", { align: "left" }); para(label, COL.x2 + 112, y + 114, 29, 600, C.emeraldD, COL.w - 124); }
    else para(label, COL.x2 + 112, y + 82, 38, 600, C.emeraldD, COL.w - 130, { lh: 1.15 });
    ctx.restore();
  });
}

/* ---------- scènes ---------- */
function scene1(t) {
  bgGray(t); pyramid(t);
  // texte clé : peu à la fois
  const A = pr(t, 0.3, 0.4, E.back) * (1 - pr(t, 1.35, 0.3, E.i2)); if (A > 0.01) txt("Recruter,", 540, 300, 128, 800, C.ink, { sc: A, alpha: clamp(A * 2) });
  const B = spr(t, 1.4, 14, 0.5) * (1 - pr(t, 3.3, 0.3, E.i2)); if (B > 0.01) { txt("encore", 540, 250, 92, 600, "#7d8784", { sc: B, alpha: clamp(B) }); txt("recruter…", 540, 360, 128, 800, C.ink, { sc: B, alpha: clamp(B) }); }
  if (t > 3.4) { const k = spr(t, 3.4, 14, 0.5); wordsIn(t, "pour espérer gagner", 540, 250, 66, 600, "#4a5350", 3.4, 0.2, 940); txt("un jour ?", 540, 380, 118, 800, C.ink, { sc: k, alpha: clamp(k) }); }
}
function scene2(t) {
  const wr = pr(t, 5.3, 0.9, E.io2) * 1700;
  // dessous : pyramide qui s'effondre sur fond gris
  bgGray(t); pyramid(t, 1);
  if (wr > 1) { ctx.save(); circ(540, 960, wr); ctx.clip(); bgEmerald(t); ctx.restore(); }
  // logo + phrase
  const lp = spr(t, CFG.logo, 13, 0.5);
  if (lp > 0.01) { logoPlate(540, 900, 700, clamp(lp * 1.4), lerp(0.55, 1, Math.min(lp, 1.08))); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.4, rr0 = 470 + 30 * Math.sin(t * 3 + i); sparkle(540 + Math.cos(a) * rr0, 900 + Math.sin(a) * rr0 * 0.86, 20 + 8 * Math.sin(t * 5 + i), i % 2 ? C.gold2 : "#fff", t * 1.5, clamp(lp) * (0.5 + 0.5 * Math.sin(t * 4 + i * 2))); } }
  if (t > 6.4) { wordsIn(t, "Chez Nature & Vie,", 540, 1330, 68, 700, "#fff", 6.5, 0.2, 960, { shadow: "rgba(0,0,0,.35)" }); wordsIn(t, "on fait autrement.", 540, 1425, 76, 800, C.gold2, 7.0, 0.22, 960, { shadow: "rgba(0,0,0,.35)" }); }
}
function scene3(t) {
  bgLight(t, pr(t, CFG.tableUp, 0.9, E.o2));
  // repère visuel discret au-dessus du tableau (pyramide grise), qui s'efface quand le tableau monte
  const a = pr(t, CFG.head - 0.2, 0.6) * (1 - pr(t, CFG.tableUp - 0.2, 0.5));
  if (a > 0.01) { ctx.save(); ctx.globalAlpha = a * 0.5; [[0, 0], [-1, 1], [1, 1], [-2, 2], [0, 2], [2, 2]].forEach(([dx, dy]) => person(540 + dx * 96, 300 + dy * 118, 92, "#9aa4a0")); ctx.restore(); }
  drawTable(t);
}
function scene4(t) {
  scene3(t);
  // photo du SG9 Plus Advance (telle quelle) + bonus
  const pp = spr(t, CFG.photo, 12, 0.6);
  if (pp > 0.01 && IMG.photo) {
    ctx.save(); ctx.translate(lerp(1200, 0, clamp(pp)), Math.sin(t * 1.6) * 4); ctx.globalAlpha = clamp(pp * 2);
    const w = 940, h = Math.round((w * 690) / 1416), x = 70, y = 830; shadowOn("rgba(4,56,42,.38)", 36, 18); rr(x, y, w, h, 40); ctx.fillStyle = "#fff"; ctx.fill(); shadowOff();
    ctx.save(); rr(x, y, w, h, 40); ctx.clip(); ctx.imageSmoothingQuality = "high"; ctx.drawImage(IMG.photo, x, y, w, h); ctx.restore(); rr(x, y, w, h, 40); ctx.strokeStyle = "rgba(8,92,64,.35)"; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  }
  const bp = spr(t, CFG.bonus, 12, 0.34);
  if (bp > 0.01) {
    const cy = 1400; ctx.save(); ctx.translate(540, cy); const s = Math.max(0.01, bp); ctx.scale(s, s); ctx.rotate(Math.sin(t * 2.2) * 0.012);
    shadowOn("rgba(4,56,42,.5)", 34, 16); rr(-390, -100, 780, 200, 50); ctx.fillStyle = C.emerald; ctx.fill(); shadowOff(); rr(-390, -100, 780, 200, 50); ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.stroke();
    const g = ctx.createLinearGradient(0, -80, 0, 30); g.addColorStop(0, "#F7E08A"); g.addColorStop(1, C.gold); txt("+ 2 500 F", 0, -22, fitSize("+ 2 500 F", 700, 800, 128), 800, g, { shadow: "rgba(0,0,0,.35)", blur: 14, oy: 6 }); txt("par boîte de SG9 Plus", 0, 62, 34, 600, "#fff"); ctx.restore();
    if (t - CFG.bonus < 1.0) for (let i = 0; i < 9; i++) { const u = (t - CFG.bonus) / 1.0, a = (i / 9) * TAU + 0.2, r = 330 + u * 160; sparkle(540 + Math.cos(a) * r, cy + Math.sin(a) * r * 0.42, 22 * (1 - u) + 6, i % 2 ? C.gold2 : C.gold, u * 4, (1 - u) * 0.9); }
  }
  const ea = pr(t, CFG.example, 0.5, E.o2); if (ea > 0.01) { para("Exemple : 10 boîtes vendues = 25 000 F de bonus, en plus de votre marge.", 540, 1560, 31, 600, C.grayT, 940, { align: "center", alpha: ea }); para("Exemple de calcul, pas une garantie de revenus.", 540, 1658, 29, 500, "#5c6663", 940, { align: "center", alpha: ea }); }
}
function scene5(t) {
  bgEmerald(t);
  wordsIn(t, "Vous gagnez sur", 540, 790, 88, 700, "#fff", CFG.s5words, 0.28, 960, { shadow: "rgba(0,0,0,.3)" });
  wordsIn(t, "ce que vous vendez.", 540, 905, 88, 700, "#fff", CFG.s5words + 0.85, 0.26, 960, { shadow: "rgba(0,0,0,.3)" });
  const pp = spr(t, CFG.point, 12, 0.38); if (pp > 0.01) { const s = Math.max(0.01, pp); txt("Point.", 540, 1130, fitSize("Point.", 900, 800, 200), 800, C.gold2, { sc: s, shadow: "rgba(0,0,0,.4)", blur: 22, oy: 10 }); ctx.save(); ctx.fillStyle = C.gold; const w = 520 * pr(t, CFG.point + 0.2, 0.5, E.o3); rr(540 - w / 2, 1235, w, 12, 6); ctx.fill(); ctx.restore(); if (t - CFG.point < 0.9) { const u = (t - CFG.point) / 0.9; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, r = 250 + u * 200; sparkle(540 + Math.cos(a) * r, 1130 + Math.sin(a) * r * 0.5, 20 * (1 - u) + 5, C.gold2, u * 3, 1 - u); } } }
}
function phoneIcon(cx, cy, s, col, ring) {
  ctx.save(); ctx.translate(cx, cy); if (ring > 0) { ctx.globalAlpha = 1 - ring; ctx.strokeStyle = col; ctx.lineWidth = 5; circ(0, 0, s * (0.65 + ring * 0.5)); ctx.stroke(); ctx.globalAlpha = 1; }
  circ(0, 0, s * 0.62); ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.scale(s / 64, s / 64);
  ctx.beginPath(); ctx.moveTo(-14, -22); ctx.quadraticCurveTo(-24, -20, -20, -6); ctx.quadraticCurveTo(-8, 18, 18, 22); ctx.quadraticCurveTo(26, 22, 24, 12); ctx.lineTo(14, 6); ctx.quadraticCurveTo(8, 10, 4, 6); ctx.quadraticCurveTo(-4, -2, -2, -10); ctx.quadraticCurveTo(0, -14, -4, -18); ctx.closePath(); ctx.stroke(); ctx.restore();
}
function msgIcon(cx, cy, s, col, ring) {
  ctx.save(); ctx.translate(cx, cy); if (ring > 0) { ctx.globalAlpha = 1 - ring; ctx.strokeStyle = col; ctx.lineWidth = 5; circ(0, 0, s * (0.65 + ring * 0.5)); ctx.stroke(); ctx.globalAlpha = 1; }
  circ(0, 0, s * 0.62); ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.scale(s / 64, s / 64);
  ctx.beginPath(); ctx.roundRect(-24, -20, 48, 34, 10); ctx.moveTo(-8, 14); ctx.lineTo(-14, 26); ctx.lineTo(4, 14); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(12, -8); ctx.moveTo(-14, 2); ctx.lineTo(4, 2); ctx.stroke(); ctx.restore();
}
function scene6(t) {
  bgEmerald(t);
  const up = pr(t, CFG.group, 0.7, E.io3), shift = -300 * up, gs = lerp(1, 0.9, up);
  ctx.save(); ctx.translate(540, 960); ctx.scale(gs, gs); ctx.translate(-540, -960 + shift);
  wordsIn(t, "Envie d'en savoir plus ?", 540, 470, 62, 700, "#fff", CFG.s6title, 0.2, 940, { shadow: "rgba(0,0,0,.3)" });
  const la = pr(t, CFG.label, 0.5, E.o2); if (la > 0.01) txt("Appelez ou écrivez au", 540, 640, 46, 600, C.gold2, { alpha: la });
  const ip = spr(t, CFG.label + 0.2, 13, 0.5), ring = ((t - CFG.label) * 0.8) % 1;
  if (ip > 0.01) { ctx.save(); ctx.globalAlpha = clamp(ip); phoneIcon(440, 780, 88 * Math.min(ip, 1.1), C.gold2, t > CFG.label ? ring : 0); msgIcon(640, 780, 88 * Math.min(ip, 1.1), C.gold2, t > CFG.label ? (ring + 0.5) % 1 : 0); ctx.restore(); }
  const pairs = ["07", "87", "59", "24", "74"], size = fitSize("07 87 59 24 74", 940, 800, 124); ctx.save(); ctx.font = font(size, 800); const sp = ctx.measureText(" ").width, wd = pairs.map((p) => ctx.measureText(p).width), total = wd.reduce((a, b) => a + b, 0) + sp * 4; ctx.restore();
  let x = 540 - total / 2; pairs.forEach((p, i) => { const t0 = CFG.number + i * 0.18, k = spr(t, t0, 14, 0.5); if (k > 0.01) txt(p, x + wd[i] / 2, 940 + (1 - k) * 40, size, 800, "#fff", { sc: 0.7 + 0.3 * k, alpha: clamp(k * 2), shadow: "rgba(0,0,0,.35)", blur: 18, oy: 8 }); x += wd[i] + sp; });
  const uw = total * pr(t, CFG.underline, 0.6, E.o3); ctx.fillStyle = C.gold; rr(540 - total / 2, 1040, uw, 12, 6); ctx.fill(); ctx.restore();
  // logo + signature
  const lp = spr(t, CFG.group + 0.3, 12, 0.5); if (lp > 0.01) { logoPlate(540, 1300, 460, clamp(lp * 1.4), lerp(0.6, 1, Math.min(lp, 1.06))); txt("Vivre mieux, Naturellement.", 540, 1620, fitSize("Vivre mieux, Naturellement.", 940, 700, 54), 700, C.gold2, { alpha: pr(t, CFG.group + 0.9, 0.5, E.o2), shadow: "rgba(0,0,0,.35)", blur: 14, oy: 6 }); }
}

/* ---------- rendu ---------- */
function wipeUp(t, t0, d, drawOld, drawNew) {
  const p = pr(t, t0, d, E.io2); if (p <= 0) return drawOld(); if (p >= 1) return drawNew();
  drawOld(); ctx.save(); ctx.beginPath(); const y = H * (1 - p); ctx.rect(0, y, W, H - y); ctx.clip(); drawNew(); ctx.restore();
  ctx.save(); ctx.fillStyle = C.gold; ctx.fillRect(0, H * (1 - p) - 6, W, 12); ctx.restore();
}
function renderFrame(c, t) {
  useCtx(c); t = clamp(t, 0, CFG.dur - 0.0001); c.save(); c.clearRect(0, 0, W, H);
  if (t < CFG.s3 - 0.4) (t < CFG.s2 ? scene1 : scene2)(t);
  else if (t < CFG.s3) { scene3(t); const p = pr(t, 7.6, 0.4, E.io2); c.save(); c.beginPath(); c.rect(0, 0, W, H * (1 - p)); c.clip(); scene2(7.6); c.restore(); }
  else if (t < CFG.s5 - 0.45) scene4(t);
  else if (t < CFG.s6 - 0.45) wipeUp(t, CFG.s5 - 0.45, 0.45, () => scene4(t), () => scene5(t));
  else if (t < CFG.s6) { scene5(t); const p = pr(t, CFG.s6 - 0.45, 0.45, E.o2); c.save(); c.globalAlpha = p; scene6(t); c.restore(); }
  else scene6(t);
  c.restore();
}
