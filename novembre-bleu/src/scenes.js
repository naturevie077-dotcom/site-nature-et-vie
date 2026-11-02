/* ============================================================================
 * SCÈNES — 45 s, 8 scènes. Chaque scène est une fonction de t (secondes absolues).
 * ========================================================================== */
const BOUND = [0, 5, 10, 19, 24, 31, 36, 41, 45];
const LAY = { manX: 270, docX: 810, y: 1500, s: 0.9, bubY: 1130, headY: 1196 };

/* ---------- données voix off / bulles (UI + rendu partagent la même source) ---------- */
const VO = [
  { id: "s1", sc: 1, t0: 0.25, t1: 4.6, who: "Homme", tag: "[confident][proud][playful]", text: "MOI, JE FAIS SOUVENT L'AMOUR ! DONC LE CANCER DE LA PROSTATE NE PEUT PAS M'ATTRAPER, NON ?" },
  { id: "s2", sc: 2, t0: 5.3, t1: 7.6, who: "Médecin", tag: "[surprised][loud][teasing]", text: "HÉ, MON FRÈRE ! QUI T'A DIT ÇA ?!" },
  { id: "s3a", sc: 3, t0: 10.2, t1: 14.4, who: "Médecin", tag: "[calm][thoughtful]", text: "Certaines études trouvent un lien entre éjaculations fréquentes et risque plus faible." },
  { id: "s3b", sc: 3, t0: 14.5, t1: 18.8, who: "Médecin", tag: "[firm][kind]", text: "Mais cela ne prouve pas que faire l'amour empêche le cancer !" },
  { id: "s4", sc: 4, t0: 19.3, t1: 23.8, who: "Médecin", tag: "[serious][low voice]", text: "Et attention ! Le cancer de la prostate peut évoluer sans symptôme au début." },
  { id: "s5", sc: 5, t0: 24.3, t1: 30.9, who: "Médecin", tag: "[urgent][rhythmic]", text: "Tu urines souvent la nuit ? Ton jet est faible ? Tu vois du sang dans tes urines ? Consulte !" },
  { id: "s6", sc: 6, t0: 31.3, t1: 35.7, who: "Médecin", tag: "[reassuring][then firm]", text: "Ces signes ne veulent pas forcément dire cancer, mais il ne faut pas les ignorer !" },
  { id: "s7", sc: 7, t0: 36.3, t1: 40.7, who: "Médecin", tag: "[warm][encouraging]", text: "Même sans symptôme, parle de tes risques et du dépistage avec ton médecin." },
  { id: "s8", sc: 8, t0: 41.3, t1: 44.4, who: "Les deux", tag: "[excited][cheerful]", text: "NOVEMBRE BLEU ! PRENDS TA SANTÉ EN MAIN !" },
];
const BUBBLES = [
  { t0: 0.35, t1: 4.55, who: "man", text: VO[0].text, w: 920, y: 940, tx: 540, ty: 1000, size: 48 },
  { t0: 5.3, t1: 7.7, who: "doc", text: VO[1].text, w: 860, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 54 },
  { t0: 10.2, t1: 14.4, who: "doc", text: VO[2].text, w: 900, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 46 },
  { t0: 14.5, t1: 18.9, who: "doc", text: VO[3].text, w: 900, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 48 },
  { t0: 19.3, t1: 23.9, who: "doc", text: VO[4].text, w: 900, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 46 },
  { t0: 24.3, t1: 26.5, who: "doc", text: "Tu urines souvent la nuit ?", w: 820, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 50 },
  { t0: 26.6, t1: 28.5, who: "doc", text: "Ton jet est faible ?", w: 760, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 50 },
  { t0: 28.6, t1: 30.4, who: "doc", text: "Tu vois du sang dans tes urines ?", w: 860, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 50 },
  { t0: 30.45, t1: 31.0, who: "doc", text: "Consulte !", w: 560, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 60 },
  { t0: 31.3, t1: 35.8, who: "doc", text: VO[6].text, w: 900, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 46 },
  { t0: 36.3, t1: 40.8, who: "doc", text: VO[7].text, w: 900, y: LAY.bubY, tx: LAY.docX, ty: LAY.headY, size: 46 },
];
const SFX = [
  [0.22, "pop"], [2.3, "pop"], [4.9, "whoosh"], [5.05, "whoosh"], [7.2, "thud"], [9.5, "whoosh"], [14.5, "blip"], [18.8, "whoosh"], [20.4, "flip"], [23.6, "whoosh"],
  [24.6, "tick"], [24.95, "tick"], [25.3, "tick"], [25.65, "tick"], [26.95, "drip"], [27.5, "drip"], [28.1, "drip"], [29.0, "drip"], [30.2, "ding"], [30.8, "whoosh"], [35.45, "whoosh"],
  [37.3, "pen"], [38.0, "pen"], [38.7, "pen"], [39.4, "pen"], [40.85, "whoosh"], [41.2, "ding"], [43.1, "ding"],
];
const speak = (t, ids) => { let m = 0; ids.forEach((id) => { const v = VO.find((x) => x.id === id); m = Math.max(m, talkAmt(t, v.t0, v.t1)); }); return m; };
const fitSize = (txt, maxW, fam, maxS) => { ctx.save(); ctx.font = fontCss(100, fam); const w = ctx.measureText(txt).width; ctx.restore(); return Math.min(maxS, (maxW / w) * 100); };

/* ---------- petites illustrations ---------- */
function neq(cx, cy, s, col, sw = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 16 * sw; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-34, -16); ctx.lineTo(34, -16); ctx.moveTo(-34, 16); ctx.lineTo(34, 16); ctx.moveTo(22, -46); ctx.lineTo(-22, 46); ctx.stroke(); ctx.restore();
}
function card(x, y, w, h, o = {}) {
  shadowOn("rgba(11,42,107,.28)", 28, 14); rr(x, y, w, h, o.r || 40); ctx.fillStyle = o.fill || "#fff"; ctx.fill(); shadowOff();
  rr(x, y, w, h, o.r || 40); ctx.strokeStyle = o.stroke || C.navy; ctx.lineWidth = o.sw || 7; ctx.stroke();
}
function label(txt, x, y, size, col = C.navy, align = "center", fam = "body") {
  ctx.save(); ctx.font = fontCss(size, fam); ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore();
}
function chip(txt, x, y, size, fill, col, a = 1) {
  ctx.save(); ctx.font = fontCss(size, "body"); const w = ctx.measureText(txt).width + size * 1.4, h = size * 1.7; ctx.globalAlpha = a;
  rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x, y + 2); ctx.restore();
}
function shieldPath(s) { ctx.beginPath(); ctx.moveTo(0, -s); ctx.bezierCurveTo(s * 0.55, -s * 0.78, s * 0.8, -s * 0.78, s * 0.86, -s * 0.74); ctx.bezierCurveTo(s * 0.9, -s * 0.1, s * 0.6, s * 0.62, 0, s); ctx.bezierCurveTo(-s * 0.6, s * 0.62, -s * 0.9, -s * 0.1, -s * 0.86, -s * 0.74); ctx.bezierCurveTo(-s * 0.8, -s * 0.78, -s * 0.55, -s * 0.78, 0, -s); ctx.closePath(); }

/** schéma simplifié vessie / prostate / urètre. o: {narrow, labels:[], glow, build} */
function anatomy(t, t0, cx, cy, sc, o = {}) {
  const b = o.build ?? pr(t, t0, 1.6, E.io2), fa = clamp((b - 0.15) / 0.5);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.lineJoin = "round"; ctx.lineCap = "round";
  // vessie
  ctx.save(); ctx.globalAlpha = fa; ctx.beginPath(); ctx.moveTo(-70, -60); ctx.bezierCurveTo(-190, -90, -190, -250, -60, -270); ctx.bezierCurveTo(10, -290, 110, -290, 160, -220); ctx.bezierCurveTo(200, -150, 160, -80, 70, -60); ctx.closePath();
  const bg = ctx.createLinearGradient(0, -290, 0, -60); bg.addColorStop(0, "#fff4c9"); bg.addColorStop(1, "#ffe08a"); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
  ctx.setLineDash([1400, 1400]); ctx.lineDashOffset = 1400 * (1 - b); ctx.strokeStyle = C.navy; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-70, -60); ctx.bezierCurveTo(-190, -90, -190, -250, -60, -270); ctx.bezierCurveTo(10, -290, 110, -290, 160, -220); ctx.bezierCurveTo(200, -150, 160, -80, 70, -60); ctx.stroke(); ctx.setLineDash([]);
  // urètre
  const nw = o.narrow ? 14 : 34; ctx.globalAlpha = fa; capsule(0, -70, 0, 330, 44, "#ffd6a8", C.navy, 8); capsule(0, -70, 0, 330, nw, "#fff1de", null);
  // prostate (forme de noix) autour de l'urètre
  ctx.beginPath(); ctx.moveTo(-18, -10); ctx.bezierCurveTo(-130, -30, -150, 90, -90, 150); ctx.bezierCurveTo(-50, 190, 50, 190, 90, 150); ctx.bezierCurveTo(150, 90, 130, -30, 18, -10); ctx.bezierCurveTo(8, 6, -8, 6, -18, -10); ctx.closePath();
  const pg = ctx.createLinearGradient(-100, 0, 100, 180); pg.addColorStop(0, "#7fb0ff"); pg.addColorStop(1, "#2f63e6"); ctx.fillStyle = pg; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-84, 20); ctx.bezierCurveTo(-110, 60, -96, 100, -70, 128); ctx.stroke();
  capsule(0, 20, 0, 190, o.narrow ? 12 : 30, "#fff1de", null);
  ctx.globalAlpha = 1;
  if (o.glow) { const g = 0.5 + 0.5 * Math.sin(t * 5); ctx.globalAlpha = 0.25 + 0.25 * g; ctx.strokeStyle = C.gold2; ctx.lineWidth = 12; ctx.beginPath(); ctx.ellipse(0, 70, 150 + g * 14, 130 + g * 12, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  if (o.narrow) { // flèches de compression
    const k = 0.5 + 0.5 * Math.sin(t * 4); ctx.strokeStyle = C.red; ctx.lineWidth = 10; [-1, 1].forEach((sd) => { ctx.beginPath(); ctx.moveTo(sd * (120 - k * 14), 40); ctx.lineTo(sd * (62 - k * 14), 40); ctx.moveTo(sd * (84 - k * 14), 18); ctx.lineTo(sd * (62 - k * 14), 40); ctx.lineTo(sd * (84 - k * 14), 62); ctx.stroke(); });
  }
  ctx.restore();
}
function leader(x1, y1, x2, y2, txt, a, size, hi) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); circ(x1, y1, 9); ctx.fillStyle = C.navy; ctx.fill();
  chip(txt, x2 + (x2 > x1 ? 0 : 0), y2, size, hi ? C.gold : "#fff", C.navy); ctx.restore();
}
function clockFace(x, y, r, hAng, mAng, ring = C.navy) {
  circ(x, y, r); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = ring; ctx.stroke();
  ctx.strokeStyle = C.navy; ctx.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.lineWidth = i % 3 ? 4 : 8; ctx.beginPath(); ctx.moveTo(x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82); ctx.lineTo(x + Math.sin(a) * r * 0.92, y - Math.cos(a) * r * 0.92); ctx.stroke(); }
  ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(hAng) * r * 0.5, y - Math.cos(hAng) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 7; ctx.strokeStyle = C.royal; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(mAng) * r * 0.76, y - Math.cos(mAng) * r * 0.76); ctx.stroke(); circ(x, y, 9); ctx.fillStyle = C.red; ctx.fill();
}
function moon(x, y, r) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = "#ffe9a0"; ctx.fill(); ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.86, 0, TAU); ctx.fill(); ctx.restore(); }

/* ---------- caméra ---------- */
function camBegin(zoom, fx, fy, rot = 0, dx = 0, dy = 0) {
  ctx.save(); ctx.translate(W / 2 + dx, H / 2 + dy); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-fx, -fy);
}
const camEnd = () => ctx.restore();
const shakeAmp = (t, t0, amp, dur = 0.5) => { const u = t - t0; if (u < 0 || u > dur) return [0, 0]; const k = (1 - u / dur) * amp; return [Math.sin(u * 90) * k, Math.cos(u * 77) * k * 0.7]; };

/* ===================================================================== SCÈNE 1 — L'ACCROCHE */
function scene1(t) {
  const tf = Math.min(t, 4.55), frz = t > 4.55;
  sky(tf); rays(tf, 540, 760, 18, C.royal, 0.09, 0.07);
  const zoom = 1 + (frz ? pr(t, 4.55, 0.5, E.o2) * 0.06 : 0.03 * pr(tf, 0, 4.5, E.lin));
  camBegin(zoom, 540, 1000);
  // homme : entrée avec rebond
  const e = spr(tf, 0.0, 13, 0.40), yOff = (1 - e) * 330, sq = 1 + (1 - e) * 0.18 - (tf > 0.28 && tf < 0.55 ? Math.sin(((tf - 0.28) / 0.27) * PI) * 0.06 : 0);
  const talk = speak(tf, ["s1"]);
  const P = { kind: "man", x: 540, y: 1420, s: 1.3, t: tf, bob: yOff, sq, talk, smile: 0.9, open: 1, gaze: [0, -0.1] };
  const w = tf > 0.9 && tf < 2.5 ? 1 : 0;
  P.browL = 0.15 + w * 0.95 * (0.5 + 0.5 * Math.sin(tf * 9.5)); P.browR = 0.1 - w * 0.2 * Math.sin(tf * 9.5); P.tilt = 0;
  if (tf > 3.7) { P.browL = 0.8; P.browR = 0.8; P.tilt = 0.35; P.smile = 0.5; }
  P.headRot = 0.05 * Math.sin(tf * 2.6) + (tf > 3.7 ? -0.1 * pr(tf, 3.7, 0.3) : 0); P.hdy = -4 * Math.abs(Math.sin(tf * 6)) * (talk > 0.1 ? 1 : 0.2);
  P.puff = spr(tf, 0.5, 14, 0.5) * (tf < 3.8 ? 1 : 0.4);
  // bras : mains aux hanches, petite tape sur le torse sur « MOI », paumes ouvertes sur « NON ? »
  const pat = pr(tf, 0.55, 0.18, E.o2) * (1 - pr(tf, 0.95, 0.2, E.o2)) + pr(tf, 1.3, 0.16, E.o2) * (1 - pr(tf, 1.62, 0.2, E.o2)), shrug = pr(tf, 3.85, 0.28, E.back) * 1;
  const kA = pr(tf, 0.25, 0.4, E.back);
  P.aL = { T: [lerp(lerp(-250, -192, kA), -330, shrug), lerp(lerp(360, 255, kA), 170, shrug)], hand: shrug > 0.3 ? "open" : "fist", elbow: "down" };
  P.aR = { T: [lerp(lerp(lerp(250, 192, kA), 120, pat), 330, shrug), lerp(lerp(lerp(360, 255, kA), 200, pat), 170, shrug)], hand: shrug > 0.3 ? "open" : "fist", elbow: "down" };
  drawChar(P);
  camEnd();
  floaters(tf, 0.7, 3.8, 540, 1000, "heart", 10, 3);
  // question qui grossit
  if (tf >= 2.3) {
    const p = spr(tf, 2.3, 11, 0.42), s = 0.2 + 0.8 * p, wob2 = Math.sin(tf * 5) * 0.012;
    ctx.save(); ctx.translate(540, 330); ctx.rotate(-0.03 + wob2); ctx.scale(s, s);
    const l1 = "FAIRE L'AMOUR", l2 = "PROTÈGE LA", l3 = "PROSTATE ?"; const sz = Math.min(fitSize(l1, 900, "disp", 150), 150);
    title(l1, 0, -150, sz, { fill: C.navy, shc: C.royal }); title(l2, -90, 0, sz, { fill: C.royal, shc: C.navy, stroke: C.white }); title(l3, -50, 150, sz, { fill: C.navy, shc: C.royal });
    // 😏 dessiné
    ctx.save(); ctx.translate(340, 150); ctx.rotate(0.15); circ(0, 0, 78); ctx.fillStyle = C.gold2; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = C.navy; ctx.stroke();
    ctx.fillStyle = C.navy; ell(-26, -14, 10, 14); ctx.fill(); ell(30, -20, 10, 14); ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = C.navy; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-30, -44); ctx.lineTo(-6, -50); ctx.moveTo(14, -52); ctx.lineTo(48, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-34, 30); ctx.quadraticCurveTo(0, 36, 44, 4); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  if (tf < 2.3) { const p = spr(tf, -0.14, 13, 0.5) * (1 - pr(tf, 1.95, 0.3, E.i2)); if (p > 0.01) { ctx.save(); ctx.translate(540, 300); ctx.rotate(-0.05); ctx.scale(p, p); const cs = fitSize("IDÉE REÇUE ?", 760, "disp", 150); title("IDÉE REÇUE ?", 0, 0, cs, { fill: C.gold2, shc: C.navy, stroke: C.navy, sw: cs * 0.18 }); ctx.restore(); } }
  BUBBLES.slice(0, 1).forEach((b) => bubble(tf, b));
  pow(tf, 0.28, "PAF !", 230, 1050, { rot: -0.2, s: 0.8 });
  if (frz) { // arrêt sur image : flash, lignes de vitesse, points d'interrogation
    const u = t - 4.55, a = Math.max(0, 1 - u / 0.2); ctx.fillStyle = `rgba(255,255,255,${a * 0.65})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.22 * pr(t, 4.55, 0.15); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; for (let i = 0; i < 36; i++) { const an = (i / 36) * TAU + 0.05; ctx.beginPath(); ctx.moveTo(540 + Math.cos(an) * 520, 1000 + Math.sin(an) * 700); ctx.lineTo(540 + Math.cos(an) * 1500, 1000 + Math.sin(an) * 1500); ctx.stroke(); } ctx.restore();
    pow(t, 4.58, "?!", 840, 1020, { rot: 0.16, size: 80, life: 0.6 });
  }
}

/* ===================================================================== SCÈNE 2 — LA SURPRISE */
function scene2(t) {
  sky(t); rays(t, 810, 1100, 16, C.royal, 0.07, 0.06);
  const u = t - 5;
  const sh = shakeAmp(t, 7.2, 16, 0.55);
  const z = 1 + 0.2 * pr(t, 7.0, 2.6, E.io2), fx = lerp(540, 540, 1), fy = lerp(1000, 1250, pr(t, 7.0, 2.6, E.io2));
  camBegin(z, fx, fy, 0.012 * pr(t, 7.2, 2.4), sh[0], sh[1]);
  // médecin
  const ed = spr(t, 5.0, 12, 0.5), dxo = (1 - ed) * 820;
  const tD = speak(t, ["s2"]);
  const D = { kind: "doc", x: LAY.docX + dxo, y: LAY.y, s: LAY.s, flip: 1, t, talk: tD, smile: 0.0, open: 1, gaze: [-0.85, 0.05], headRot: -0.08 + 0.03 * Math.sin(t * 7) * (tD > 0.1 ? 1 : 0), hdy: tD > 0.1 ? -5 * Math.abs(Math.sin(t * 6)) : 0, browL: 0.35, browR: 0.35, tilt: 0.55 };
  const pk = pr(t, 5.0, 0.4, E.back);
  D.aL = { T: [lerp(-250, -340, pk), lerp(360, -150 + 18 * Math.sin(t * 9) * (tD > 0.1 ? 1 : 0), pk)], hand: "point", elbow: "out", fx: 0 };
  D.aR = { T: [lerp(250, 200, pk), lerp(360, 250, pk)], hand: "fist", elbow: "down" };
  // homme : sourit puis se retourne, surpris
  const turn = pr(t, 5.45, 0.28, E.back), sur = pr(t, 5.55, 0.22, E.back), jolt = Math.sin(clamp((t - 5.5) / 0.35) * PI);
  const M = { kind: "man", x: LAY.manX, y: LAY.y, s: LAY.s, t, talk: sur > 0.5 ? 0.55 * (0.6 + 0.4 * Math.sin(t * 9)) * (t < 6.6 ? 1 : 0.1) : 0, smile: lerp(0.9, -0.35, sur), open: lerp(1, 1.22, sur), gaze: [lerp(0, 1, turn), lerp(-0.1, 0, turn)], headRot: lerp(0, 0.14, turn) + 0.02 * Math.sin(t * 5), hdx: lerp(0, 12, turn), bob: -34 * jolt, sq: 1 + 0.08 * jolt, browL: lerp(0.2, 1.1, sur), browR: lerp(0.2, 1.1, sur), tilt: lerp(0, 0.45, sur), sweat: t > 6.1 ? prog(t, 6.1, 1.1) % 1 : 0, pupil: lerp(16, 11, sur) };
  M.aL = { T: [lerp(-192, -230, sur), lerp(255, 175, sur)], hand: sur > 0.4 ? "open" : "fist", elbow: "down" };
  M.aR = { T: [lerp(192, 230, sur), lerp(255, 175, sur)], hand: sur > 0.4 ? "open" : "fist", elbow: "down" };
  drawChar(M); drawChar(D);
  camEnd();
  // sons et signes de surprise
  if (t > 5.55 && t < 6.9) { for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * 0.28; const r0 = 215, r1 = 275 + 20 * Math.sin(t * 20 + i); ctx.strokeStyle = C.gold; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.globalAlpha = 1 - prog(t, 6.4, 0.5); ctx.beginPath(); ctx.moveTo(LAY.manX + Math.cos(a) * r0, 1340 + Math.sin(a) * r0 * 1.1); ctx.lineTo(LAY.manX + Math.cos(a) * r1, 1340 + Math.sin(a) * r1 * 1.1); ctx.stroke(); ctx.globalAlpha = 1; } }
  pow(t, 5.5, "OH !", 250, 1000, { rot: -0.16, size: 70, life: 0.8 });
  BUBBLES.slice(1, 2).forEach((b) => bubble(t, b));
  stamp(t, 7.2, "NON PROUVÉ !", 540, 520, -0.1, 98);
  pow(t, 7.2, "BAM !", 880, 800, { rot: 0.18, size: 74, life: 0.7, fill: C.gold });
  if (t > 7.25 && t < 7.4) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - (t - 7.25) / 0.15)})`; ctx.fillRect(0, 0, W, H); }
}

/* ===================================================================== SCÈNE 3 — LA VÉRITÉ SCIENTIFIQUE */
function scene3(t) {
  sky(t); rays(t, 540, 900, 14, C.royal, 0.05, 0.04);
  const tA = speak(t, ["s3a", "s3b"]), think = pr(t, 14.55, 0.5, E.back);
  const sw = Math.sin(t * 2.2);
  const D = { kind: "doc", x: LAY.docX, y: LAY.y, s: LAY.s, t, talk: tA, smile: 0.1, gaze: [-0.7, 0.1], headRot: -0.05 + 0.03 * Math.sin(t * 3), hdy: tA > 0.1 ? -4 * Math.abs(Math.sin(t * 6)) : 0, browL: 0.2 + (t > 14.5 ? 0.3 : 0), tilt: t > 14.5 ? 0.3 : 0 };
  const ex = 0.5 + 0.5 * Math.sin(t * 2.4);
  D.aL = { T: [-262 + 16 * sw, 200 - 20 * ex], hand: "open", elbow: "down" }; D.aR = { T: [262 - 16 * sw, 185 + 24 * ex], hand: "open", elbow: "down" };
  const M = { kind: "man", x: LAY.manX, y: LAY.y, s: LAY.s, t, talk: 0, smile: lerp(0.25, -0.25, think), gaze: [lerp(1, -0.7, think), lerp(0, -0.9, think)], headRot: lerp(0.05, -0.1, think) + 0.015 * Math.sin(t * 2), browL: lerp(0.2, 1.0, think), browR: lerp(0.2, -0.2, think), tilt: lerp(0, 0.3, think) };
  M.aL = { T: [-230, 330], hand: "fist", elbow: "down" }; M.aR = { T: [lerp(230, 112, think), lerp(330, -28, think)], hand: "fist", elbow: "out" };
  drawChar(M); drawChar(D);
  // bandeau « ÉJACULATIONS FRÉQUENTES ≠ PROTECTION GARANTIE »
  if (t > 11.4) {
    words(t, "ÉJACULATIONS FRÉQUENTES", 540, 192, 900, 104, 11.4, 0.2, { colorFn: () => C.navy, shadow: C.royal, sw: 22, lh: 0.98 });
    if (t > 14.6) { const p = spr(t, 14.6, 14, 0.5); ctx.save(); ctx.translate(128, 384); ctx.scale(p, p); neq(0, 0, 1.15, C.red); ctx.restore(); words(t, "PROTECTION GARANTIE", 604, 384, 820, 68, 14.8, 0.18, { colorFn: () => C.royal, shadow: C.navy, sw: 15 }); }
  }
  // carte 1 : un lien observé (graphique stylisé, sans chiffres)
  const c1 = pr(t, 10.35, 0.5, E.back) * (1 - pr(t, 14.3, 0.2, E.i2)), c2 = pr(t, 14.6, 0.5, E.back) * (1 - pr(t, 18.7, 0.25, E.i2));
  if (c1 > 0.01) {
    ctx.save(); ctx.translate(540, 650); ctx.scale(c1, c1); ctx.translate(-540, -650); card(100, 440, 880, 420);
    label("ÉTUDES OBSERVATIONNELLES", 540, 486, 36, C.royal);
    const ox = 190, oy = 800, gw = 560, gh = 270; ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(ox, oy - gh - 10); ctx.lineTo(ox, oy); ctx.lineTo(ox + gw + 10, oy); ctx.stroke();
    label("ÉJACULATIONS", ox + gw / 2, oy + 28, 26, C.navy); ctx.save(); ctx.translate(ox - 30, oy - gh / 2); ctx.rotate(-PI / 2); label("RISQUE", 0, 0, 26, C.navy); ctx.restore();
    const r = rng(5); for (let i = 0; i < 24; i++) { const x = r(), y = clamp(0.2 + 0.6 * (1 - x) + (r() - 0.5) * 0.4, 0.05, 0.95); const p = spr(t, 10.8 + i * 0.05, 14, 0.6); circ(ox + 20 + x * (gw - 40), oy - 14 - y * (gh - 30), 11 * p); ctx.fillStyle = i % 3 ? C.royal2 : C.sky; ctx.fill(); }
    const lp = pr(t, 12.2, 1.4, E.io2); ctx.setLineDash([14, 12]); ctx.strokeStyle = C.gold; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(ox + 20, oy - 14 - 0.85 * (gh - 30)); ctx.lineTo(ox + 20 + lp * (gw - 40), oy - 14 - (0.85 - 0.7 * lp) * (gh - 30)); ctx.stroke(); ctx.setLineDash([]);
    // loupe
    const mx = ox + 120 + 300 * pr(t, 11.2, 2.6, E.io2), my = oy - 160 + 20 * Math.sin(t * 3); ctx.strokeStyle = C.navy; ctx.lineWidth = 10; circ(mx, my, 52); ctx.fillStyle = "rgba(159,208,255,.35)"; ctx.fill(); ctx.stroke(); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(mx + 38, my + 38); ctx.lineTo(mx + 80, my + 80); ctx.lineWidth = 14; ctx.stroke();
    ctx.restore();
  }
  // carte 2 : bouclier → point d'interrogation
  if (c2 > 0.01) {
    ctx.save(); ctx.translate(540, 650); ctx.scale(c2, c2); ctx.translate(-540, -650);
    const morph = pr(t, 16.0, 0.7, E.io2), wob2 = Math.sin(clamp((t - 15.8) / 0.9) * PI * 3) * 0.08 * (1 - morph);
    ctx.save(); ctx.translate(540, 668); ctx.rotate(wob2); shadowOn("rgba(11,42,107,.35)", 30, 16); shieldPath(230); ctx.fillStyle = mixc(C.royal, "#7d8fb8", morph); ctx.fill(); shadowOff(); shieldPath(230); ctx.strokeStyle = C.navy; ctx.lineWidth = 12; ctx.stroke();
    shieldPath(188); ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 6; ctx.stroke();
    ctx.globalAlpha = 1 - morph; ctx.strokeStyle = "#fff"; ctx.lineWidth = 34; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(-90, 10); ctx.lineTo(-24, 80); ctx.lineTo(96, -70); ctx.setLineDash([400, 400]); ctx.lineDashOffset = 400 * (1 - pr(t, 15.0, 0.5, E.o3)); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    if (morph > 0.01) { ctx.save(); ctx.scale(morph, morph); ctx.rotate(-0.25 * (1 - morph)); title("?", 0, 14, 300, { fill: C.white, shc: C.navy, sw: 0 }); ctx.restore(); }
    ctx.restore();
    chip("UN LIEN N'EST PAS UNE PREUVE", 540, 918, 32, C.gold, C.navy, pr(t, 16.6, 0.3));
    ctx.restore();
  }
  // pensée de l'homme
  if (think > 0.05) { for (let i = 0; i < 3; i++) { const p = pr(t, 14.7 + i * 0.18, 0.25, E.back); circ(LAY.manX + 150 + i * 36, 1140 - i * 62, (10 + i * 8) * p); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.navy; ctx.stroke(); } const p2 = pr(t, 15.1, 0.3, E.back); ctx.save(); ctx.translate(LAY.manX + 270, 1000); ctx.scale(p2, p2); title("?", 0, 0, 120, { fill: C.gold, shc: C.navy }); ctx.restore(); }
  pow(t, 14.5, "HMM…", 230, 1010, { rot: -0.14, size: 64, life: 0.9 });
  BUBBLES.slice(2, 4).forEach((b) => bubble(t, b));
}

/* ===================================================================== SCÈNE 4 — LE DANGER SILENCIEUX */
function scene4(t) {
  const night = pr(t, 19.0, 1.2, E.io2) * 0.88;
  sky(t, night); rays(t, 540, 640, 20, "#6fa3ff", 0.07 * night, 0.05);
  const tD = speak(t, ["s4"]), worry = pr(t, 21.8, 0.7, E.o2);
  const D = { kind: "doc", x: LAY.docX, y: LAY.y, s: LAY.s, t, talk: tD, smile: -0.15, gaze: [-0.7, 0.1], headRot: -0.04, browL: 0.1, tilt: 0.5, hdy: tD > 0.1 ? -3 * Math.abs(Math.sin(t * 6)) : 0 };
  D.aL = { T: [-250, 250], hand: "open", elbow: "down" }; D.aR = { T: [230, 280], hand: "fist", elbow: "down" };
  const M = { kind: "man", x: LAY.manX, y: LAY.y, s: LAY.s, t, smile: lerp(0.9, -0.3, worry), gaze: [lerp(0.9, 0.7, worry), 0], browL: lerp(0.2, 0.9, worry), browR: lerp(0.2, 0.9, worry), tilt: lerp(0, 0.5, worry), headRot: 0.04 };
  M.aL = { T: [-230, 330], hand: "fist" }; M.aR = { T: [230, 330], hand: "fist" };
  drawChar(M); drawChar(D);
  // portrait de l'homme souriant, puis retournement vers l'anatomie
  const f = t < 20.55 ? 1 - pr(t, 20.3, 0.25, E.i2) : pr(t, 20.55, 0.3, E.o2);
  if (t >= 19.3) {
    ctx.save(); ctx.translate(540, 640); const pp = pr(t, 19.3, 0.5, E.back); ctx.scale(Math.max(0.001, f) * pp, pp);
    if (t < 20.55) {
      circ(0, 0, 260); ctx.fillStyle = C.sky2; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = C.white; ctx.stroke(); ctx.save(); circ(0, 0, 254); ctx.clip();
      rays(t, 0, 0, 12, C.royal2, 0.18, 0.3);
      drawChar({ kind: "man", x: 0, y: 250, s: 0.86, t, smile: 1, talk: 0, gaze: [0, 0], browL: 0.4, headRot: 0.04 * Math.sin(t * 3), puff: 0.4, aL: { T: [-230, 330] }, aR: { T: [215, 150], hand: "thumb", elbow: "out" } }); ctx.restore();
      ctx.lineWidth = 12; ctx.strokeStyle = C.white; circ(0, 0, 260); ctx.stroke(); 
    } else {
      circ(0, 0, 330); ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = "rgba(159,208,255,.7)"; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 40; ctx.stroke(); ctx.setLineDash([]);
      anatomy(t, 20.6, 0, 10, 1.02, { glow: t > 22.0, build: pr(t, 20.7, 1.6, E.io2) });
      leader(-96, -150, -330, -250, "VESSIE", pr(t, 21.7, 0.3), 32); leader(-100, 120, -350, 60, "PROSTATE", pr(t, 22.0, 0.3), 32, true); leader(10, 260, 230, 330, "URÈTRE", pr(t, 22.3, 0.3), 32);
    }
    ctx.restore();
  }
  // texte clé
  if (t > 21.6) { const sa = fitSize("PARFOIS, AUCUN", 900, "disp", 100); words(t, "PARFOIS, AUCUN SIGNE AU DÉBUT !", 540, 235, 900, 96, 21.8, 0.2, { colorFn: (i) => (i >= 2 && i <= 3 ? C.gold2 : "#fff"), stroke: C.navy, sw: 22, shadow: C.royal }); }
  BUBBLES.slice(4, 5).forEach((b) => bubble(t, b));
}

/* ===================================================================== SCÈNE 5 — LES SIGNES À CONNAÎTRE */
function symptomPill(t, t0, idx, txt, kind) {
  const p = spr(t, t0, 14, 0.55); if (p <= 0.01) return; const y = 150 + idx * 124;
  ctx.save(); ctx.translate(540, y); ctx.scale(p, p); card(-440, -52, 880, 104, { r: 52, fill: "#fff", sw: 6 });
  ctx.save(); ctx.translate(-380, 0);
  circ(0, 0, 40); ctx.fillStyle = kind === 2 ? "#ffe3e3" : C.sky2; ctx.fill();
  if (kind === 0) { ctx.save(); ctx.scale(0.55, 0.55); clockFace(0, 0, 60, 0.4, 3.5); ctx.restore(); }
  if (kind === 1) { drop(0, 2, 1.1, C.royal2); }
  if (kind === 2) { drop(0, 2, 1.2, C.red); }
  ctx.restore();
  ctx.font = fontCss(54, "disp"); ctx.fillStyle = C.navy; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(txt, -318, 5); ctx.restore();
}
function scene5(t) {
  const night = lerp(0.8, 0.1, pr(t, 26.4, 1.0, E.io2)); sky(t, night); rays(t, 540, 700, 18, C.royal2, 0.06, 0.05);
  const tD = speak(t, ["s5"]), w3 = pr(t, 28.8, 0.6, E.o2);
  const D = { kind: "doc", x: LAY.docX, y: LAY.y, s: LAY.s, t, talk: tD, smile: 0, gaze: [-0.7, 0], headRot: -0.05, hdy: tD > 0.1 ? -4 * Math.abs(Math.sin(t * 6.5)) : 0, browL: 0.35, tilt: 0.45 };
  const em = 0.5 + 0.5 * Math.sin(t * 5);
  D.aL = { T: [-310, 150 - 20 * em], hand: "open", elbow: "down" }; D.aR = { T: [310, 150 + 20 * (1 - em)], hand: "open", elbow: "down" };
  const M = { kind: "man", x: LAY.manX, y: LAY.y, s: LAY.s, t, smile: lerp(0.1, -0.4, w3), gaze: [0.9, 0], browL: 0.6 + 0.3 * w3, browR: 0.6 + 0.3 * w3, tilt: 0.35, headRot: 0.06 + 0.02 * Math.sin(t * 3), hdy: 6 * Math.sin(t * 2) };
  M.aL = { T: [-230, 330] }; M.aR = { T: [230, 330] };
  drawChar(M); drawChar(D);
  symptomPill(t, 24.6, 0, "ENVIES FRÉQUENTES", 0); symptomPill(t, 26.8, 1, "JET FAIBLE", 1); symptomPill(t, 28.9, 2, "SANG DANS LES URINES", 2);
  // zone d'illustration (y 520–900)
  const zx = 540, zy = 720;
  const show = (a, b) => pr(t, a, 0.4, E.back) * (1 - pr(t, b, 0.25, E.i2));
  // 1 — nuit : horloge, lit, homme qui se lève
  let s1 = show(24.6, 26.65);
  if (s1 > 0.01) {
    ctx.save(); ctx.translate(zx, zy); ctx.scale(s1, s1); card(-420, -205, 840, 410, { fill: "#0f2a66", stroke: C.white });
    ctx.save(); rr(-420, -205, 840, 410, 40); ctx.clip(); const r = rng(9); for (let i = 0; i < 18; i++) { const sx = -400 + r() * 800, sy = -190 + r() * 200; sparkle(sx, sy, 8 + r() * 8, "#fff", 0, 0.4 + 0.5 * Math.sin(t * 3 + i)); } moon(70, -130, 52);
    const hh = 0 + (t - 24.6) * 2.2, mm = (t - 24.6) * 14; clockFace(-250, -60, 95, 2.9 + hh * 0.02, mm * 0.5 % TAU);
    // lit + dormeur qui se redresse
    const up = pr(t, 25.3, 0.5, E.back); ctx.fillStyle = "#5b7bd6"; rr(-120, 80, 300, 70, 16); ctx.fill(); ctx.fillStyle = "#3d5bb6"; rr(-120, 60, 70, 110, 14); ctx.fill();
    ctx.save(); ctx.translate(-30, 70); ctx.rotate(lerp(-1.45, -0.1, up)); capsule(0, 0, 0, -86, 62, "#7fb0ff", "#1a3b9c", 6); ctx.restore();
    ctx.save(); ctx.translate(-30 + 8 * up, 70 - 86 * Math.cos(lerp(-1.45, -0.1, up)) * 0.1 - 76 * up - 30 * (1 - up) + 0); circ(0, -44, 38); ctx.fillStyle = SKIN.man.base; ctx.fill(); ctx.fillStyle = "#17171b"; ctx.beginPath(); ctx.arc(0, -52, 38, PI, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = "#ffe9a0"; rr(60, 92, 120, 14, 7); ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
    // porte WC
    const dd = pr(t, 26.0, 0.4); ctx.fillStyle = "#e9f2ff"; rr(262, -40, 120, 200, 10); ctx.fill(); ctx.fillStyle = C.royal; rr(296, -80, 52, 30, 8); ctx.fill(); label("WC", 322, -64, 22, "#fff"); circ(278, 70, 7); ctx.fillStyle = C.gold; ctx.fill();
    ctx.restore(); ctx.restore();
    title("Zzz", 360, 560, 54, { fill: "#fff", shc: C.navy, sw: 0, rot: -0.2 });
  }
  // 2 — jet faible : urètre rétréci + filet + gouttes
  let s2 = show(26.75, 28.65);
  if (s2 > 0.01) {
    ctx.save(); ctx.translate(zx, zy); ctx.scale(s2, s2); card(-420, -205, 840, 410, {}); ctx.save(); ctx.translate(-190, 40); anatomy(t, 26.8, 0, 0, 0.62, { narrow: true, build: pr(t, 26.8, 0.7) }); ctx.restore();
    // filet faible, en pointillés, qui tombe dans une cuvette
    const fl = (t - 26.9) * 1.2; ctx.save(); ctx.translate(180, -150); capsule(0, 0, 0, 110, 10, C.royal2, null); for (let i = 0; i < 5; i++) { const q = (fl * 1.6 + i / 5) % 1; drop(Math.sin(i) * 6, 110 + q * 170, 0.55, C.royal2, 1 - q * 0.6); } ctx.restore();
    ctx.fillStyle = "#e6ecf7"; ctx.beginPath(); ctx.moveTo(110, 130); ctx.lineTo(250, 130); ctx.quadraticCurveTo(240, 190, 180, 190); ctx.quadraticCurveTo(120, 190, 110, 130); ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.stroke();
    chip("FAIBLE", 180, -190, 30, C.gold, C.navy);
    ctx.restore();
  }
  // 3 — sang dans les urines : éprouvette + goutte
  let s3 = show(28.9, 30.55);
  if (s3 > 0.01) {
    ctx.save(); ctx.translate(zx, zy); ctx.scale(s3, s3); card(-420, -205, 840, 410, {});
    ctx.save(); ctx.translate(0, 10);
    ctx.beginPath(); ctx.moveTo(-90, -150); ctx.lineTo(-100, 150); ctx.quadraticCurveTo(-100, 175, -75, 175); ctx.lineTo(75, 175); ctx.quadraticCurveTo(100, 175, 100, 150); ctx.lineTo(90, -150); ctx.closePath();
    ctx.fillStyle = "rgba(216,236,255,.7)"; ctx.fill(); ctx.save(); ctx.clip(); const lvl = 20; ctx.fillStyle = "#ffe08a"; ctx.fillRect(-120, lvl, 240, 200);
    const mix = pr(t, 29.5, 1.0, E.o2); ctx.globalAlpha = 0.5 * mix; ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 90, 60 * mix + 10, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.stroke(); rr(-110, -178, 220, 36, 12); fillStroke(C.royal, C.navy, 7);
    const fy = -140 + pr(t, 29.0, 0.55, E.i2) * 190; if (t < 29.6) drop(0, fy, 1.15, C.red); else { ctx.globalAlpha = 1 - prog(t, 29.6, 0.4); ctx.strokeStyle = C.red; ctx.lineWidth = 6; circ(0, 50, 20 + (t - 29.6) * 140); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.restore();
    ctx.restore();
  }
  // « CONSULTE ! »
  if (t > 30.2) { const p = spr(t, 30.2, 12, 0.45); ctx.save(); ctx.translate(540, 720); ctx.rotate(-0.06); ctx.scale(p, p); shadowOn("rgba(11,42,107,.4)", 26, 12); rr(-330, -110, 660, 220, 60); ctx.fillStyle = C.gold; ctx.fill(); shadowOff(); rr(-330, -110, 660, 220, 60); ctx.strokeStyle = C.navy; ctx.lineWidth = 10; ctx.stroke(); title("CONSULTE !", 0, 6, 128, { fill: C.navy, stroke: C.white, shc: C.royal, sw: 0, sh: false }); ctx.restore(); sparkle(250, 580, 34, C.gold2, t * 2, pr(t, 30.3, 0.2)); sparkle(850, 860, 28, "#fff", -t * 2, pr(t, 30.4, 0.2)); }
  pow(t, 24.55, "TIC-TAC", 870, 520, { rot: 0.15, size: 52, life: 0.8 });
  BUBBLES.slice(5, 9).forEach((b) => bubble(t, b));
}

/* ===================================================================== SCÈNE 6 — ATTENTION AUX IDÉES REÇUES */
function scene6(t) {
  sky(t); rays(t, 540, 650, 16, C.royal, 0.06, 0.05);
  const tD = speak(t, ["s6"]), nod = Math.sin(t * 3.1);
  const D = { kind: "doc", x: LAY.docX, y: LAY.y, s: LAY.s, t, talk: tD, smile: 0.1, gaze: [-0.7, 0.1], headRot: -0.05 + 0.03 * Math.sin(t * 2.5), hdy: tD > 0.1 ? -4 * Math.abs(Math.sin(t * 6)) : 0, browL: 0.3, tilt: 0.2 };
  const ex = 0.5 + 0.5 * Math.sin(t * 2.6); D.aL = { T: [-310, 170 - 24 * ex], hand: "open", elbow: "down" }; D.aR = { T: [t > 33.6 ? 330 : 300, t > 33.6 ? -130 : 160 + 22 * ex], hand: t > 33.6 ? "point" : "open", elbow: t > 33.6 ? "out" : "down" };
  D.aR.fx = 0;
  const M = { kind: "man", x: LAY.manX, y: LAY.y + 14, s: LAY.s, t, smile: 0.0, gaze: [1, 0], headRot: 0.1 + 0.02 * nod, hdy: 8 * nod * 0.6 + 8, browL: 0.55, browR: 0.55, tilt: 0.3, hdx: 10 };
  M.aL = { T: [-230, 330] }; M.aR = { T: [230, 330] };
  drawChar(M); drawChar(D);
  // triangle d'avertissement
  const p = spr(t, 31.5, 13, 0.5), pulse = 1 + 0.05 * Math.sin(t * 7);
  ctx.save(); ctx.translate(540, 650); ctx.scale(p * pulse, p * pulse); shadowOn("rgba(11,42,107,.4)", 30, 16);
  ctx.beginPath(); ctx.moveTo(0, -230); ctx.lineTo(250, 190); ctx.lineTo(-250, 190); ctx.closePath(); ctx.lineJoin = "round"; ctx.lineWidth = 60; ctx.strokeStyle = C.gold; ctx.stroke(); ctx.fillStyle = C.gold; ctx.fill(); shadowOff();
  ctx.beginPath(); ctx.moveTo(0, -170); ctx.lineTo(196, 150); ctx.lineTo(-196, 150); ctx.closePath(); ctx.fillStyle = C.gold2; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 12; ctx.stroke();
  ctx.fillStyle = C.navy; rr(-18, -80, 36, 130, 18); ctx.fill(); circ(0, 98, 22); ctx.fill(); ctx.restore();
  // texte
  words(t, "NE PAS IGNORER CES SIGNES !", 540, 250, 900, 104, 33.2, 0.22, { colorFn: (i) => (i === 0 || i === 1 ? C.red : C.navy), shadow: C.royal, sw: 22 });
  if (t > 31.7 && t < 33.1) { chip("PAS FORCÉMENT UN CANCER", 540, 940 - 0, 34, "#fff", C.navy, pr(t, 31.7, 0.3) * (1 - pr(t, 33.0, 0.2))); }
  BUBBLES.slice(9, 10).forEach((b) => bubble(t, b));
}

/* ===================================================================== SCÈNE 7 — LE BON RÉFLEXE (cabinet) */
function clinic(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f3f8ff"); g.addColorStop(1, "#e3efff"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#c9dcff"; ctx.fillRect(0, 1180, W, H - 1180); ctx.fillStyle = "#b3cdfc"; ctx.fillRect(0, 1170, W, 14);
  // fenêtre
  rr(60, 980, 250, 190, 14); ctx.fillStyle = C.sky; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 12; ctx.stroke(); ctx.beginPath(); ctx.moveTo(185, 980); ctx.lineTo(185, 1170); ctx.moveTo(60, 1075); ctx.lineTo(310, 1075); ctx.stroke();
  // affiche croix + plante
  rr(830, 960, 170, 200, 14); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = C.royal; ctx.fillRect(895, 1010, 40, 100); ctx.fillRect(865, 1040, 100, 40);
  ctx.fillStyle = "#2f8f5b"; [-1, 0, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(950 + k * 30, 1500 - 10 - Math.abs(k) * 20, 18, 80, k * 0.4, 0, TAU); ctx.fill(); });
  rays(t, 540, 400, 12, C.royal, 0.04, 0.03);
}
function scene7(t) {
  clinic(t);
  const tD = speak(t, ["s7"]);
  const D = { kind: "doc", x: LAY.docX, y: LAY.y + 40, s: LAY.s, t, talk: tD, smile: 0.5, gaze: [-0.7, 0.1], headRot: -0.04 + 0.025 * Math.sin(t * 2.5), hdy: tD > 0.1 ? -4 * Math.abs(Math.sin(t * 6)) : 0, browL: 0.25 };
  const ex = 0.5 + 0.5 * Math.sin(t * 2.3); D.aL = { T: [-300, 200 - 20 * ex], hand: "open", elbow: "down" }; D.aR = { T: [300, 180 + 20 * ex], hand: "open", elbow: "down" };
  // chaise + homme qui s'assoit (descend et se pose)
  const sit = spr(t, 36.2, 11, 0.6), M = { kind: "man", x: LAY.manX, y: LAY.y + 70, s: 0.88, t, smile: 0.5, gaze: [1, 0], headRot: 0.07 + 0.02 * Math.sin(t * 2.2), bob: (1 - sit) * -190, sq: 1 + (1 - sit) * 0.05, browL: 0.35, hdx: 8, browR: 0.35 };
  M.aL = { T: [-220, 330], hand: "fist" }; M.aR = { T: [t > 39.2 ? 160 : 220, t > 39.2 ? 130 : 330], hand: "fist", elbow: "down" };
  rr(70, 1470, 400, 250, 40); ctx.fillStyle = C.royal; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.stroke();
  drawChar(M); drawChar(D);
  // bureau (devant le médecin)
  rr(470, 1600, 700, 340, 24); ctx.fillStyle = "#e9c796"; ctx.fill(); ctx.strokeStyle = "#a9773f"; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = "#d8b07c"; ctx.fillRect(470, 1640, 700, 8);
  // fiche médicale
  const c = pr(t, 36.7, 0.55, E.back);
  ctx.save(); ctx.translate(540, 650); ctx.scale(c, c); ctx.rotate(0.02 * (1 - c)); ctx.translate(-540, -650);
  card(120, 400, 840, 510, { fill: "#fff" }); rr(120, 400, 840, 100, 40); ctx.fillStyle = C.royal; ctx.fill(); ctx.fillRect(120, 460, 840, 40);
  label("FICHE PATIENT", 540, 452, 48, "#fff", "center", "disp");
  const rows = ["Âge", "Antécédents familiaux", "Symptômes urinaires", "Dépistage : bénéfices et limites"];
  rows.forEach((txt, i) => {
    const y = 560 + i * 88, a = pr(t, 37.0 + i * 0.35, 0.3, E.o2); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "#cfdcf5"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(160, y + 40); ctx.lineTo(920, y + 40); ctx.stroke();
    rr(160, y - 22, 52, 52, 12); fillStroke("#fff", C.navy, 6); label(txt, 240, y + 5, i === 3 ? 38 : 40, C.ink, "left"); ctx.restore();
    const tk = pr(t, 37.3 + i * 0.7, 0.3, E.o3); if (tk > 0) { ctx.strokeStyle = i === 3 ? C.gold : C.royal2; ctx.lineWidth = 11; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(168, y + 6); ctx.lineTo(168 + 16 * tk, y + 6 + 16 * Math.min(1, tk * 1.2)); if (tk > 0.5) ctx.lineTo(168 + 16 + 38 * (tk - 0.5) * 2, y + 22 - 46 * (tk - 0.5) * 2); ctx.stroke(); }
  });
  const hl = pr(t, 39.6, 0.4, E.back); if (hl > 0) { ctx.strokeStyle = C.gold; ctx.lineWidth = 8; rr(150 - 4, 560 + 3 * 88 - 36, 780 + 8, 78, 20); ctx.globalAlpha = hl; ctx.stroke(); ctx.globalAlpha = 1; starburst(930, 560 + 3 * 88 - 30, 30, 14, 5, C.gold, C.navy, t * 2); }
  ctx.restore();
  words(t, "INFORME-TOI. CONSULTE.", 540, 220, 900, 118, 37.0, 0.45, { colorFn: (i) => (i === 0 ? C.royal : C.navy), shadow: C.royal2, sw: 24, outline: true });
  BUBBLES.slice(10, 11).forEach((b) => bubble(t, b));
}

/* ===================================================================== SCÈNE 8 — CONCLUSION */
let LOGO_IMG = null; // injecté par l'UI
function ribbon(cx, cy, s, t, a = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.globalAlpha = a; ctx.lineJoin = "round"; ctx.lineCap = "butt";
  shadowOn("rgba(11,42,107,.4)", 30, 18);
  const A = () => { ctx.beginPath(); ctx.moveTo(-150, 300); ctx.quadraticCurveTo(-40, 200, 0, 60); ctx.bezierCurveTo(40, -30, 110, -60, 105, -120); ctx.bezierCurveTo(100, -210, -100, -210, -105, -120); ctx.bezierCurveTo(-110, -60, -40, -30, 0, 60); ctx.quadraticCurveTo(40, 200, 150, 300); };
  A(); ctx.lineWidth = 78; ctx.strokeStyle = C.navy; ctx.stroke(); shadowOff();
  A(); ctx.lineWidth = 62; ctx.strokeStyle = C.royal; ctx.stroke();
  A(); ctx.lineWidth = 16; ctx.strokeStyle = "rgba(159,208,255,.75)"; ctx.translate(-14, -6); ctx.stroke();
  ctx.restore();
}
function scene8(t) {
  const g = ctx.createRadialGradient(540, 700, 80, 540, 900, 1500); g.addColorStop(0, "#4f86ff"); g.addColorStop(0.5, C.royal); g.addColorStop(1, C.navy); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  rays(t, 540, 700, 20, "#fff", 0.09, 0.12); floaters(t, 41.2, 45, 540, 1100, "star", 22, 21);
  const tt = speak(t, ["s8"]);
  const rs = spr(t, 41.1, 11, 0.45), up = pr(t, 43.0, 0.7, E.io3), wig = Math.sin(t * 3.2) * 0.04;
  const cy = lerp(620, 300, up), sc = lerp(1.85, 0.9, up);
  ribbon(540, cy, rs * sc, t); sparkle(380, cy - 180, 40 * rs, C.gold2, t, 1); sparkle(720, cy + 60, 30 * rs, "#fff", -t, 1);
  const M = { kind: "man", x: LAY.manX, y: LAY.y + 20, s: LAY.s, t, talk: tt, smile: 1, gaze: [0.5, 0], browL: 0.5, headRot: 0.05 + 0.03 * Math.sin(t * 4), hdy: -6 * Math.abs(Math.sin(t * 5)) };
  M.aL = { T: [-230, 330] }; M.aR = { T: [330, -170 + 20 * Math.sin(t * 8)], hand: "open", elbow: "out" };
  const D = { kind: "doc", x: LAY.docX, y: LAY.y + 20, s: LAY.s, t, talk: tt, smile: 1, gaze: [-0.5, 0], browL: 0.5, headRot: -0.05 - 0.03 * Math.sin(t * 4.3), hdy: -6 * Math.abs(Math.sin(t * 5.2)) };
  D.aL = { T: [-300, -20 + 10 * Math.sin(t * 6)], hand: "thumb", elbow: "out" }; D.aR = { T: [230, 330] };
  drawChar(M); drawChar(D);
  // titre
  const ty = lerp(1010, 590, up), tp = spr(t, 41.35, 12, 0.45);
  if (tp > 0.01) { ctx.save(); ctx.translate(540, ty); ctx.scale(tp, tp); const sz = fitSize("NOVEMBRE BLEU", 800, "disp", 150); title("NOVEMBRE BLEU", -20, 0, sz, { fill: "#fff", shc: C.navy, stroke: C.navy, sw: sz * 0.16, shy: sz * 0.06 }); heart(470, -sz * 0.55, 3.2 + 0.2 * Math.sin(t * 6), "#4f86ff", 0.2); ctx.restore(); }
  // carte de marque
  const bc = spr(t, 43.25, 12, 0.55);
  if (bc > 0.01) {
    ctx.save(); ctx.translate(540, 985); ctx.scale(bc, bc); card(-440, -200, 880, 400, { r: 56, fill: "#fff", stroke: C.gold, sw: 9 });
    ctx.save(); ctx.translate(-260, 0); circ(0, 0, 164); ctx.fillStyle = C.gold; ctx.fill(); circ(0, 0, 156); ctx.fillStyle = "#f7f7f7"; ctx.fill(); ctx.save(); circ(0, 0, 156); ctx.clip();
    if (LOGO_IMG) ctx.drawImage(LOGO_IMG, -156, -156, 312, 312); else { ctx.fillStyle = "#f4f7ff"; ctx.fillRect(-150, -150, 300, 300); label("LOGO", 0, -16, 44, C.royal); label("OFFICIEL", 0, 34, 36, C.royal); }
    ctx.restore(); if (!LOGO_IMG) { ctx.setLineDash([16, 12]); ctx.strokeStyle = C.royal; ctx.lineWidth = 6; circ(0, 0, 146); ctx.stroke(); ctx.setLineDash([]); } ctx.restore();
    const bs = fitSize("NATURE & VIE", 480, "disp", 90), ts = fitSize("Vivre mieux, Naturellement.", 480, "body", 42); ctx.font = fontCss(bs, "disp"); ctx.fillStyle = C.navy; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("NATURE & VIE", -60, -36);
    ctx.font = fontCss(ts, "body"); ctx.fillStyle = C.royal; ctx.fillText("Vivre mieux, Naturellement.", -60, 50);
    ctx.restore();
  }
}

/* ---------- transitions (couvrent les changements de scène) ---------- */
function transitions(t) {
  const ov = (a, m, b) => (t < a || t > b ? 0 : t < m ? E.i2(prog(t, a, m - a)) : 1 - E.o2(prog(t, m, b - m)));
  let p;
  if ((p = ov(4.85, 5.0, 5.3))) { ctx.save(); ctx.fillStyle = C.royal; ctx.beginPath(); const x = lerp(-300, W + 300, 1 - p); ctx.moveTo(x, 0); ctx.lineTo(W + 300, 0); ctx.lineTo(W + 300, H); ctx.lineTo(x - 360, H); ctx.closePath(); ctx.fill(); ctx.restore(); if (t > 4.95) { /* l'écran se découvre vers la droite */ } }
  if ((p = ov(9.65, 10.0, 10.35))) { ctx.save(); ctx.fillStyle = C.navy; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(540, 1100, lerp(1900, 0, p), 0, TAU, true); ctx.fill("evenodd"); ctx.restore(); }
  if ((p = ov(18.7, 19.0, 19.4))) { ctx.save(); ctx.fillStyle = C.navy; ctx.fillRect(0, H * (1 - p), W, H * p); ctx.restore(); }
  if ((p = ov(23.7, 24.0, 24.4))) { ctx.save(); ctx.fillStyle = C.royal; const n = 8, hh = H / n; for (let i = 0; i < n; i++) { const q = clamp(p * 1.6 - i * 0.08); ctx.fillRect(0, i * hh, W * q, hh + 1); } ctx.restore(); }
  if ((p = ov(30.75, 31.0, 31.35))) { ctx.save(); ctx.fillStyle = "#fff"; ctx.globalAlpha = p; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if ((p = ov(35.55, 36.0, 36.45))) { ctx.save(); ctx.fillStyle = C.royal; ctx.fillRect(0, 0, (W / 2) * p, H); ctx.fillRect(W - (W / 2) * p, 0, (W / 2) * p, H); ctx.fillStyle = C.gold; ctx.fillRect((W / 2) * p - 14, 0, 14, H); ctx.fillRect(W - (W / 2) * p, 0, 14, H); ctx.restore(); }
  if ((p = ov(40.8, 41.05, 41.4))) { ctx.save(); ctx.fillStyle = C.royal2; circ(540, 900, lerp(0, 1700, p)); ctx.fill(); ctx.restore(); }
}

/* ---------- rendu d'une image ---------- */
function renderFrame(c, t) {
  useCtx(c); t = clamp(t, 0, DUR - 0.0001);
  c.save(); c.clearRect(0, 0, W, H);
  if (t < BOUND[1]) scene1(t); else if (t < BOUND[2]) scene2(t); else if (t < BOUND[3]) scene3(t); else if (t < BOUND[4]) scene4(t); else if (t < BOUND[5]) scene5(t); else if (t < BOUND[6]) scene6(t); else if (t < BOUND[7]) scene7(t); else scene8(t);
  transitions(t);
  if (t > 36.2) { // mention santé, toujours lisible
    const a = pr(t, 36.3, 0.4) * 0.95; c.globalAlpha = a; rr(120, 1812, 840, 64, 32); c.fillStyle = "rgba(11,42,107,.9)"; c.fill(); c.font = fontCss(30, "body"); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Ceci ne remplace pas un avis médical.", 540, 1845); c.globalAlpha = 1;
  }
  c.restore();
}
