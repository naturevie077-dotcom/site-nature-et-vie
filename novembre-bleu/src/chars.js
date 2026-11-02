/* ============================================================================
 * PERSONNAGES — origine = base du cou, torse coupé par le bas du cadre.
 * Bras à cinématique inverse (la main vise une cible), tête/expressions paramétrées.
 * ========================================================================== */
const SKIN = {
  man: { base: "#8d5b3c", hi: "#a8714d", sh: "#6c4430", lip: "#5b2b23", brow: "#26262b" },
  doc: { base: "#6b4430", hi: "#845840", sh: "#523420", lip: "#4a1f1b", brow: "#151518" },
};
const talkAmt = (t, t0, t1) => {
  if (t < t0 || t > t1) return 0;
  const e = Math.min(prog(t, t0, 0.1), 1 - prog(t, t1 - 0.1, 0.12));
  const v = Math.abs(Math.sin(t * 12.3)) * (0.6 + 0.4 * Math.sin(t * 4.1 + 1)), gap = Math.sin(t * 2.3 + 0.7) > 0.86 ? 0.15 : 1;
  return clamp(0.14 + 0.8 * v * gap) * e;
};
const blinkAmt = (t, seed) => { const p = (t + seed * 1.37) % 3.4; return p < 0.15 ? Math.sin((p / 0.15) * PI) : 0; };

function capsule(x1, y1, x2, y2, w, fill, outline, ow = 8) {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = w + ow; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  ctx.strokeStyle = fill; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function hand(kind, sk, ang, extra = 0) {
  ctx.save(); ctx.rotate(ang); ctx.scale(1.22, 1.22);
  const base = sk.base, sh = sk.sh;
  if (kind === "open") {
    rr(-40, 0, 80, 74, 30); fillStroke(base, sh, 5);
    for (let i = 0; i < 4; i++) { const a = (i - 1.5) * 0.17; ctx.save(); ctx.translate((i - 1.5) * 21, 62); ctx.rotate(-a); capsule(0, 0, 0, 52 - Math.abs(i - 1.5) * 8, 22, base, sh, 5); ctx.restore(); }
    ctx.save(); ctx.translate(-42, 24); ctx.rotate(0.9); capsule(0, 0, 0, 44, 24, base, sh, 5); ctx.restore();
  } else {
    circ(0, 26, 46); fillStroke(base, sh, 5);
    ctx.strokeStyle = sh; ctx.lineWidth = 4; ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 16 - 5, 52); ctx.quadraticCurveTo(i * 16, 40, i * 16 + 5, 52); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(-36, 18, 15, 24, 0.5, 0, TAU); ctx.fillStyle = base; ctx.fill(); ctx.strokeStyle = sh; ctx.lineWidth = 4; ctx.stroke();
    if (kind === "point") capsule(8, 44, 8, 44 + 78 + extra, 26, base, sh, 5);
    if (kind === "thumb") { ctx.beginPath(); ctx.ellipse(0, 78, 17, 36, 0, 0, TAU); ctx.fillStyle = base; ctx.fill(); ctx.strokeStyle = sh; ctx.lineWidth = 4; ctx.stroke(); }
  }
  ctx.restore();
}

/** bras : l'épaule vise la cible T=(tx,ty) (repère personnage). o = {sleeve, shade, cuff, hand, elbow} */
function arm(side, T, o, sk) {
  const L1 = o.L1 || 205, L2 = o.L2 || 200, S = [side * 192, 56];
  let dx = T[0] - S[0], dy = T[1] - S[1], dist = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 4, L1 + L2 - 2);
  const base = Math.atan2(dy, dx), A = Math.acos(clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
  const c1 = [S[0] + L1 * Math.cos(base + A), S[1] + L1 * Math.sin(base + A)], c2 = [S[0] + L1 * Math.cos(base - A), S[1] + L1 * Math.sin(base - A)];
  const sc1 = (p) => (o.elbow === "up" ? -p[1] + side * p[0] * 0.6 : o.elbow === "out" ? side * p[0] : p[1] + side * p[0] * 0.6), pick = sc1(c1) >= sc1(c2) ? c1 : c2;
  const H2 = [S[0] + (T[0] - S[0]) * (dist / Math.max(1, Math.hypot(dx, dy))), S[1] + (T[1] - S[1]) * (dist / Math.max(1, Math.hypot(dx, dy)))];
  // direction de l'avant-bras
  const fx = H2[0] - pick[0], fy = H2[1] - pick[1], fl = Math.hypot(fx, fy) || 1;
  capsule(S[0], S[1], pick[0], pick[1], 96, o.sleeve, o.shade, 10);
  capsule(pick[0], pick[1], H2[0] - (fx / fl) * 30, H2[1] - (fy / fl) * 30, 84, o.sleeve, o.shade, 10);
  // poignet / manchette
  const wx = H2[0] - (fx / fl) * 34, wy = H2[1] - (fy / fl) * 34;
  capsule(wx - (fx / fl) * 4, wy - (fy / fl) * 4, wx + (fx / fl) * 14, wy + (fy / fl) * 14, 92, o.cuff || o.sleeve, o.shade, 8);
  ctx.save(); ctx.translate(wx + (fx / fl) * 22, wy + (fy / fl) * 22); hand(o.hand || "fist", sk, Math.atan2(-fx, fy), o.fingerExtra || 0); ctx.restore();
  return { elbow: pick, hand: H2 };
}

function mouth(open, smile, sk, teeth = true) {
  const w = 64 + smile * 12 + open * 6, cy = -smile * 16, top = 2 + (smile < 0 ? -smile * 6 : 0);
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
  const botMid = 8 + open * 64 + smile * 8, ctrlB = 2 * botMid - cy, ctrlT = 2 * top - cy;
  ctx.beginPath(); ctx.moveTo(-w, cy); ctx.quadraticCurveTo(0, ctrlT, w, cy); ctx.quadraticCurveTo(0, ctrlB, -w, cy); ctx.closePath();
  if (open > 0.06 || smile > 0.5) {
    ctx.fillStyle = "#3a1118"; ctx.fill(); ctx.save(); ctx.clip();
    if (teeth) { ctx.fillStyle = "#fff"; ctx.fillRect(-w, cy - 6, w * 2, 14 + open * 8 + Math.max(0, smile) * 8); }
    ctx.fillStyle = "#d4566a"; ctx.beginPath(); ctx.ellipse(0, botMid + 10, w * 0.55, 20 + open * 22, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.strokeStyle = sk.lip; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-w, cy); ctx.quadraticCurveTo(0, ctrlT, w, cy); ctx.quadraticCurveTo(0, ctrlB, -w, cy); ctx.closePath();
  if (open <= 0.06 && smile <= 0.5) { ctx.beginPath(); ctx.moveTo(-w, cy); ctx.quadraticCurveTo(0, 2 * (3 + smile * 14) - cy, w, cy); }
  ctx.stroke();
  ctx.restore();
}

function eye(x, sk, o, side) {
  const open = o.open, rx = 31, ry = 25 * open;
  ctx.save(); ctx.translate(x, -8);
  if (ry < 3) { ctx.strokeStyle = "#1b1b20"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-rx, 0); ctx.quadraticCurveTo(0, 8, rx, 0); ctx.stroke(); ctx.restore(); return; }
  ell(0, 0, rx, ry); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = sk.sh; ctx.stroke();
  ctx.save(); ell(0, 0, rx, ry); ctx.clip();
  const gx = clamp(o.gaze[0], -1, 1) * 13, gy = clamp(o.gaze[1], -1, 1) * 9, pr2 = o.pupil || 16;
  circ(gx, gy, pr2); ctx.fillStyle = "#2a1a14"; ctx.fill(); circ(gx, gy, pr2 * 0.55); ctx.fillStyle = "#0e0807"; ctx.fill();
  circ(gx - 5, gy - 6, 5.5); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.restore();
  // paupière supérieure (fatigue / sourire)
  if (o.lid > 0) { ctx.save(); ell(0, 0, rx + 2, ry + 1); ctx.clip(); ctx.fillStyle = sk.base; ctx.fillRect(-rx - 4, -ry - 4, rx * 2 + 8, (ry * 2) * o.lid + 4); ctx.restore(); ctx.strokeStyle = sk.sh; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-rx, -ry + ry * 2 * o.lid); ctx.lineTo(rx, -ry + ry * 2 * o.lid); ctx.stroke(); }
  ctx.restore();
}

function brow(x, side, raise, tilt, sk, w = 16) {
  ctx.save(); ctx.translate(x, -66 - raise * 24); ctx.rotate(side * tilt * 0.45);
  ctx.strokeStyle = sk.brow; ctx.lineWidth = w + 6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-side * 40, 6); ctx.quadraticCurveTo(0, -14, side * 42, 8); ctx.stroke();
  ctx.restore();
}

/** P : {kind:'man'|'doc', x,y,s, flip, t, talk, smile, browL,browR,tilt, open(0..1), gaze:[x,y], lid, headRot, hdx, hdy, puff, sq, bob,
 *       aL:{T:[x,y],hand,elbow}, aR:{...}, sweat, pupil, shake} */
function drawChar(P) {
  const sk = SKIN[P.kind], man = P.kind === "man", t = P.t;
  const breathe = 1 + 0.012 * Math.sin(t * 2.4), puff = P.puff || 0, sq = P.sq ?? 1;
  ctx.save(); ctx.translate(P.x, P.y + (P.bob || 0)); ctx.scale((P.flip || 1) * P.s, P.s); ctx.scale(1 / Math.sqrt(sq), sq);
  const sleeve = man ? "#2c5bdc" : "#f6f9ff", shade = man ? "#1a3b9c" : "#c9d8ee", cuff = man ? "#f2f6ff" : "#2a63e8";
  /* ----- torse ----- */
  ctx.save(); ctx.scale(breathe + puff * 0.1, breathe + puff * 0.06);
  ctx.beginPath(); ctx.moveTo(-74, -10); ctx.bezierCurveTo(-140, 0, -206, 8, -246, 70); ctx.lineTo(-262, 560); ctx.lineTo(262, 560); ctx.lineTo(246, 70); ctx.bezierCurveTo(206, 8, 140, 0, 74, -10); ctx.closePath();
  const tg = ctx.createLinearGradient(-250, 0, 250, 0); tg.addColorStop(0, shade); tg.addColorStop(0.18, sleeve); tg.addColorStop(0.82, sleeve); tg.addColorStop(1, shade);
  ctx.fillStyle = tg; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = shade; ctx.lineJoin = "round"; ctx.stroke();
  if (man) {
    // polo/chemise : col blanc, patte de boutonnage, poche + stylo
    ctx.fillStyle = "#eaf1ff"; ctx.beginPath(); ctx.moveTo(-78, -14); ctx.lineTo(-6, 78); ctx.lineTo(-96, 64); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(78, -14); ctx.lineTo(6, 78); ctx.lineTo(96, 64); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#9db6ee"; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = "#1a3b9c"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(0, 540); ctx.stroke();
    ctx.fillStyle = "#f2f6ff"; for (let i = 0; i < 4; i++) circ(0, 150 + i * 110, 9), ctx.fill();
    rr(104, 170, 92, 96, 14); fillStroke("#2552c6", "#1a3b9c", 5); capsule(172, 150, 172, 210, 9, C.gold, null);
  } else {
    // blouse : lapels, tenue bleue dessous, badge
    ctx.fillStyle = "#2a63e8"; ctx.beginPath(); ctx.moveTo(-64, -8); ctx.lineTo(0, 150); ctx.lineTo(64, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(-76, -14); ctx.lineTo(-10, 170); ctx.lineTo(-120, 120); ctx.closePath(); ctx.fill(); ctx.strokeStyle = shade; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(76, -14); ctx.lineTo(10, 170); ctx.lineTo(120, 120); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = shade; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 170); ctx.lineTo(0, 540); ctx.stroke();
    rr(112, 200, 96, 100, 14); fillStroke("#fff", shade, 5);
    // badge (croix médicale)
    rr(-176, 214, 96, 62, 10); fillStroke("#fff", "#2a63e8", 5); ctx.fillStyle = "#2a63e8"; ctx.fillRect(-142, 224, 28, 42); ctx.fillRect(-150, 236, 44, 18);
    // stéthoscope
    ctx.strokeStyle = "#2b3340"; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-70, -2); ctx.bezierCurveTo(-130, 140, -90, 300, -10, 300); ctx.moveTo(70, -2); ctx.bezierCurveTo(130, 140, 90, 300, 10, 300); ctx.stroke();
    circ(0, 318, 34); fillStroke("#c7d0de", "#2b3340", 8); circ(0, 318, 15); ctx.fillStyle = "#8793a8"; ctx.fill();
  }
  ctx.restore();
  /* ----- cou ----- */
  ctx.fillStyle = sk.sh; rr(-56, -64, 112, 90, 30); ctx.fill();
  /* ----- tête ----- */
  ctx.save(); ctx.translate(P.hdx || 0, P.hdy || 0); ctx.rotate(P.headRot || 0); ctx.translate(0, -170);
  const squashH = 1 + (P.talk || 0) * 0.015;
  // oreilles
  [-1, 1].forEach((sd) => { ell(sd * 150, 6, 27, 42); fillStroke(sk.base, sk.sh, 5); ell(sd * 150, 8, 12, 22); ctx.fillStyle = sk.sh; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1; });
  // crâne + mâchoire
  ell(0, 0, 150, 168 * squashH); const hg = ctx.createRadialGradient(-44, -70, 20, 0, 10, 230); hg.addColorStop(0, sk.hi); hg.addColorStop(0.55, sk.base); hg.addColorStop(1, sk.sh); ctx.fillStyle = hg; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 66, 134, 104 + (P.talk || 0) * 6, 0, 0, PI); ctx.fillStyle = sk.base; ctx.fill();
  ell(0, 0, 150, 168 * squashH); ctx.lineWidth = 6; ctx.strokeStyle = sk.sh; ctx.stroke();
  // cheveux
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 150, 168, 0, 0, TAU); ctx.clip();
  ctx.beginPath(); ctx.moveTo(-160, -20); ctx.bezierCurveTo(-160, -150, -90, -190, 0, -192); ctx.bezierCurveTo(90, -190, 160, -150, 160, -20);
  ctx.bezierCurveTo(150, -60, 112, -96, 62, -100); ctx.bezierCurveTo(10, -108, -60, -108, -112, -84); ctx.bezierCurveTo(-140, -66, -152, -48, -160, -20); ctx.closePath();
  ctx.fillStyle = "#17171b"; ctx.fill();
  if (man) { ctx.fillStyle = "#c6cad3"; ctx.globalAlpha = 0.9; [-1, 1].forEach((sd) => { ctx.beginPath(); ctx.ellipse(sd * 138, -62, 18, 40, sd * 0.25, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(sd * 112, -96, 22, 18, sd * 0.5, 0, TAU); ctx.fill(); }); ctx.globalAlpha = 1; }
  ctx.restore();
  // joues (reflet) + fossettes de sourire
  ctx.globalAlpha = 0.09; [-1, 1].forEach((sd) => { ell(sd * 84, 52, 34, 22); ctx.fillStyle = "#fff"; ctx.fill(); }); ctx.globalAlpha = 1;
  // yeux, sourcils
  const bl = P.noBlink ? 0 : blinkAmt(t, man ? 0.3 : 1.9), eo = clamp((P.open ?? 1) * (1 - bl));
  const eo2 = { open: eo, gaze: P.gaze || [0, 0], lid: P.lid || 0, pupil: P.pupil };
  eye(-58, sk, eo2, -1); eye(58, sk, eo2, 1);
  if (!man) { // lunettes rondes
    ctx.strokeStyle = "#16294f"; ctx.lineWidth = 9; circ(-58, -8, 47); ctx.stroke(); circ(58, -8, 47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-12, -14); ctx.quadraticCurveTo(0, -24, 12, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-104, -16); ctx.lineTo(-146, -22); ctx.moveTo(104, -16); ctx.lineTo(146, -22); ctx.stroke();
    ctx.globalAlpha = 0.25; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(-76, -26, 10, 20, 0.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(40, -26, 10, 20, 0.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  brow(-58, -1, P.browL || 0, -(P.tilt || 0), sk, man ? 17 : 15); brow(58, 1, P.browR ?? P.browL ?? 0, (P.tilt || 0) * 1, sk, man ? 17 : 15);
  // nez
  ctx.save(); ctx.translate(0, 34); ell(0, 8, 36, 26); ctx.fillStyle = sk.sh; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1; ell(-17, 14, 8, 6); ctx.fillStyle = "#2a150f"; ctx.fill(); ell(17, 14, 8, 6); ctx.fill(); ell(-4, -6, 10, 8); ctx.fillStyle = sk.hi; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
  // moustache + barbiche (homme) / barbe courte (médecin)
  ctx.save(); ctx.translate(0, 92);
  if (man) { ctx.fillStyle = "#3c3c42"; ctx.beginPath(); ctx.moveTo(-72, 6); ctx.bezierCurveTo(-60, -22, -20, -18, 0, -6); ctx.bezierCurveTo(20, -18, 60, -22, 72, 6); ctx.bezierCurveTo(46, -2, 20, -4, 0, 2); ctx.bezierCurveTo(-20, -4, -46, -2, -72, 6); ctx.fill(); ctx.fillStyle = "#c9ccd3"; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(-34, -6, 14, 5, 0.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(34, -6, 14, 5, -0.3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.translate(0, 6); mouth(P.talk || 0, P.smile ?? 0.3, sk);
  if (man) { ctx.fillStyle = "#555a63"; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(-26, 76 + (P.talk || 0) * 30); ctx.quadraticCurveTo(0, 96 + (P.talk || 0) * 30, 26, 76 + (P.talk || 0) * 30); ctx.quadraticCurveTo(0, 82 + (P.talk || 0) * 30, -26, 76 + (P.talk || 0) * 30); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
  // sueur
  if (P.sweat > 0) { const u = P.sweat; drop(126, -90 + u * 46, 1.2 - u * 0.4, "#9fd8ff", 1 - u * 0.6); }
  ctx.restore(); // tête
  /* ----- bras ----- */
  const ao = { sleeve, shade, cuff };
  if (P.aL) arm(-1, P.aL.T, { ...ao, hand: P.aL.hand, elbow: P.aL.elbow, fingerExtra: P.aL.fx }, sk);
  if (P.aR) arm(1, P.aR.T, { ...ao, hand: P.aR.hand, elbow: P.aR.elbow, fingerExtra: P.aR.fx }, sk);
  ctx.restore();
}

/* poses prêtes à l'emploi (cibles de main dans le repère du personnage) */
const POSE = {
  rest: { L: [-250, 360], R: [250, 360] },
  hips: { L: [-190, 255], R: [190, 255] },
  chest: { L: [-120, 190], R: [120, 190] },
  point: { L: [-250, 360], R: [330, -150] },
  explain: { L: [-300, 200], R: [300, 170] },
  chin: { L: [-250, 360], R: [96, -26] },
  wave: { L: [-250, 360], R: [330, -200] },
};
function poseArms(P, a, b, k, o = {}) {
  const m = (u, v) => [lerp(u[0], v[0], k), lerp(u[1], v[1], k)];
  P.aL = { T: m(a.L, b.L), hand: o.handL || "fist", elbow: o.elL || "down" };
  P.aR = { T: m(a.R, b.R), hand: o.handR || "fist", elbow: o.elR || "down" };
}
