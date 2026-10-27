/* NATURE & VIE — « Le bien-être en mouvement »
 * Moteur FX partagé : fonctions PURES du temps t (secondes). Aucune horloge, aucun Math.random non seedé.
 * Utilisé à l'identique par la version HyperFrames et la version Remotion (canvas 1080×1920).
 *   NV.drawBack(ctx, t)  : particules, onde de lumière verte, bokeh, étincelles (sous le texte)
 *   NV.drawFront(ctx, t) : anneaux d'impact, flashs, bord du morphing, vignette, grain (au-dessus)
 *   NV.morphPolygon(p)   : polygone CSS clip-path du morphing géométrique S1 → S2
 */
(function (g) {
  const W = 1080, H = 1920, CX = 540, CY = 960, TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const range = (t, a, b) => clamp((t - a) / (b - a));
  const ease = {
    o2: (t) => 1 - (1 - t) * (1 - t),
    o3: (t) => 1 - Math.pow(1 - t, 3),
    o4: (t) => 1 - Math.pow(1 - t, 4),
    i2: (t) => t * t,
    i3: (t) => t * t * t,
    io2: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    io3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    oExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    ioSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  };
  function rng(seed) {
    let a = seed | 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- sprites (halos lumineux pré-calculés) ---------- */
  const spriteCache = {};
  function sprite(r, gch, b, hard) {
    const k = r + "," + gch + "," + b + "," + (hard || 0);
    if (spriteCache[k]) return spriteCache[k];
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `rgba(${r},${gch},${b},1)`);
    gr.addColorStop(hard ? 0.35 : 0.12, `rgba(${r},${gch},${b},${hard ? 0.85 : 0.55})`);
    gr.addColorStop(hard ? 0.7 : 0.4, `rgba(${r},${gch},${b},${hard ? 0.25 : 0.14})`);
    gr.addColorStop(1, `rgba(${r},${gch},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, 128, 128);
    return (spriteCache[k] = c);
  }
  const GOLD = [212, 175, 55], GOLD_L = [255, 226, 140], EMER = [30, 200, 150], WHITE = [255, 255, 255], BORD = [200, 50, 80];

  /* ---------- pousse (sprout) : cible du rassemblement de particules ---------- */
  function leafPoints(n, baseX, baseY, angle, len, wid, rnd) {
    const pts = [];
    const ca = Math.cos(angle), sa = Math.sin(angle);
    for (let i = 0; i < n; i++) {
      const s = rnd() * 2 - 1; // -1..1 le long de l'axe
      const half = wid * Math.pow(1 - s * s, 0.85) * (1 - 0.18 * s);
      const side = rnd() < 0.5 ? -1 : 1;
      const inside = rnd() < 0.25 ? rnd() : 1; // un quart des points remplit l'intérieur
      const lx = ((s + 1) / 2) * len, ly = side * half * inside;
      pts.push([baseX + lx * ca - ly * sa, baseY + lx * sa + ly * ca]);
    }
    return pts;
  }
  const SPR = rng(2024);
  const SPROUT = [].concat(
    leafPoints(100, 0, 0, -Math.PI / 2 - 0.72, 330, 78, SPR),
    leafPoints(100, 0, 0, -Math.PI / 2 + 0.72, 330, 78, SPR),
    Array.from({ length: 36 }, (_, i) => [0, 150 - (i / 35) * 150 + (SPR() - 0.5) * 6])
  ).map(([x, y]) => [CX + x * 1.05, 820 + y * 1.05 + 40]);

  const MOTES = (function () {
    const r = rng(77);
    return SPROUT.map((tg, i) => ({
      tg,
      sx: r() * W, sy: r() * H,
      ta: r() * 0.95, // apparition
      te: 1.05 + r() * 0.62, // arrivée
      amp: (r() - 0.5) * 240,
      size: 0.55 + r() * 1.3,
      tw: r() * TAU,
      ang: r() * TAU,
      spd: 220 + r() * 820,
      dust: r() < 0.32,
      hue: r() < 0.22 ? 1 : 0,
    }));
  })();

  function drawMotes(ctx, t) {
    if (t > 4.3) return;
    ctx.globalCompositeOperation = "lighter";
    const gold = sprite(...GOLD), goldL = sprite(...GOLD_L, 1);
    for (let i = 0; i < MOTES.length; i++) {
      const m = MOTES[i];
      let x, y, a, s = m.size;
      const fadeIn = ease.o2(range(t, m.ta, m.ta + 0.35));
      if (t < 1.7) {
        const p = ease.io3(range(t, m.ta + 0.1, m.te));
        const dx = m.tg[0] - m.sx, dy = m.tg[1] - m.sy, dl = Math.hypot(dx, dy) || 1;
        const sw = Math.sin(p * Math.PI) * m.amp;
        x = lerp(m.sx, m.tg[0], p) + (-dy / dl) * sw;
        y = lerp(m.sy, m.tg[1], p) + (dx / dl) * sw;
        const tw = 0.7 + 0.3 * Math.sin(t * 9 + m.tw);
        a = fadeIn * tw * (0.45 + 0.55 * p);
        s *= 1 + p * 0.5;
      } else {
        const u = t - 1.7;
        const cx = m.tg[0] - CX, cy = m.tg[1] - 820;
        const dl = Math.hypot(cx, cy) || 1;
        const dirx = cx / dl * 0.6 + Math.cos(m.ang) * 0.9, diry = cy / dl * 0.6 + Math.sin(m.ang) * 0.9;
        const dn = Math.hypot(dirx, diry) || 1;
        const k = (1 - Math.exp(-u * (m.dust ? 1.7 : 2.4))) / (m.dust ? 1.7 : 2.4);
        x = m.tg[0] + (dirx / dn) * m.spd * k;
        y = m.tg[1] + (diry / dn) * m.spd * k - (m.dust ? 22 * u : 60 * u * u);
        // aspiration vers le centre avant le morphing
        const pull = ease.i3(range(t, 3.45, 4.08));
        x = lerp(x, CX, pull); y = lerp(y, CY, pull);
        const life = m.dust ? 1 - range(t, 3.4, 4.1) : 1 - range(u, 0.55, 1.9);
        a = clamp(life) * (0.6 + 0.4 * Math.sin(t * 7 + m.tw)) * (m.dust ? 0.75 : 1) * fadeIn;
        s *= m.dust ? 0.9 : 1.1 - 0.4 * range(u, 0, 1.5);
        if (t < 1.8) a *= 1 + 1.5 * (1 - range(t, 1.7, 1.8)); // éclat à l'impact
      }
      if (a <= 0.003) continue;
      const r = 17 * s;
      ctx.globalAlpha = clamp(a);
      ctx.drawImage(m.hue ? goldL : gold, x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- onde de lumière verte (profondeur) ---------- */
  function drawGreenWave(ctx, t) {
    if (t < 0.9 || t > 3.4) return;
    ctx.globalCompositeOperation = "lighter";
    const layers = [
      { d: 0.0, sx: 2.4, sy: 0.32, a: 0.62, R: 760, c: [20, 190, 140] },
      { d: 0.16, sx: 3.4, sy: 0.22, a: 0.4, R: 900, c: [0, 140, 100] },
      { d: 0.3, sx: 1.7, sy: 0.4, a: 0.32, R: 600, c: [140, 245, 200] },
    ];
    for (const L of layers) {
      const p = ease.io2(range(t, 1.0 + L.d, 2.75 + L.d));
      if (p <= 0 || p >= 1) continue;
      const y = lerp(H + 520, -520, p);
      const fade = Math.sin(p * Math.PI);
      ctx.save();
      ctx.translate(CX, y);
      ctx.rotate(-0.1 + p * 0.2);
      ctx.scale(L.sx, L.sy);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, L.R);
      gr.addColorStop(0, `rgba(${L.c},${L.a * fade})`);
      gr.addColorStop(0.45, `rgba(${L.c},${L.a * fade * 0.35})`);
      gr.addColorStop(1, `rgba(${L.c},0)`);
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(0, 0, L.R, 0, TAU); ctx.fill();
      ctx.restore();
      // arête dorée du front d'onde
      if (L.d === 0) {
        ctx.save();
        ctx.translate(CX, y); ctx.rotate(-0.1 + p * 0.2); ctx.scale(1, 0.1);
        ctx.strokeStyle = `rgba(255,226,140,${0.5 * fade})`; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(0, 0, 820, 0, TAU); ctx.stroke();
        ctx.restore();
      }
    }
  }

  /* ---------- flottants : bokeh / braises / poussière ---------- */
  function floaters(ctx, t, o) {
    if (t < o.t0 || t > o.t1) return;
    const r = rng(o.seed);
    const env = ease.o2(range(t, o.t0, o.t0 + o.fade)) * (1 - ease.i2(range(t, o.t1 - o.fade, o.t1)));
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < o.n; i++) {
      const z = 0.25 + r() * 0.75;
      const x0 = r() * (W + 200) - 100, y0 = r() * (H + 300), ph = r() * TAU;
      const col = o.colors[Math.floor(r() * o.colors.length)];
      const sz = lerp(o.size[0], o.size[1], z * z), al = lerp(o.alpha[0], o.alpha[1], r());
      const tw = o.tw ? 0.55 + 0.45 * Math.sin(t * o.tw + ph) : 1;
      const yy = (((y0 - o.speed * (t - o.t0) * (0.35 + z)) % (H + 300)) + (H + 300)) % (H + 300) - 150;
      const xx = x0 + Math.sin(t * 0.7 + ph) * o.sway * z;
      const rad = sz * (o.soft ? 1 : 1);
      ctx.globalAlpha = clamp(al * env * tw);
      ctx.drawImage(sprite(col[0], col[1], col[2], o.hard), xx - rad, yy - rad, rad * 2, rad * 2);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- étincelles d'impact (traits) ---------- */
  function sparks(ctx, t, t0, o) {
    const u = t - t0;
    if (u < 0 || u > o.life) return;
    const r = rng(o.seed);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = 0; i < o.n; i++) {
      const a = r() * TAU, sp = lerp(o.v[0], o.v[1], Math.pow(r(), 0.7)), col = o.colors[Math.floor(r() * o.colors.length)];
      const lifeI = o.life * (0.55 + 0.45 * r());
      if (u > lifeI) continue;
      const k = (1 - Math.exp(-u * 3.0)) / 3.0;
      const gy = 380 * u * u * (o.gravity || 0);
      const x = o.x + Math.cos(a) * sp * k, y = o.y + Math.sin(a) * sp * k + gy;
      const vx = Math.cos(a) * sp * Math.exp(-u * 3.0), vy = Math.sin(a) * sp * Math.exp(-u * 3.0) + 760 * u * (o.gravity || 0);
      const vl = Math.hypot(vx, vy);
      const len = Math.min(120, vl * 0.045);
      const al = Math.pow(1 - u / lifeI, 1.4);
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${al})`;
      ctx.lineWidth = (1.2 + r() * 2.4) * (0.5 + al * 0.5);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (vx / (vl || 1)) * len, y - (vy / (vl || 1)) * len); ctx.stroke();
      const rr = 7 * al + 2;
      ctx.globalAlpha = al * 0.8;
      ctx.drawImage(sprite(col[0], col[1], col[2]), x - rr, y - rr, rr * 2, rr * 2);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- cadre lumineux : géométrie partagée avec le SVG de la scène 4 ---------- */
  const FR = { x: 90, y: 550, w: 900, h: 820, r: 36 };
  function framePoint(d) {
    // d = distance depuis le bas-centre, sens horaire (côté droit)
    const { x, y, w, h, r } = FR, cx = x + w / 2;
    const seg = [w / 2 - r, (Math.PI * r) / 2, h - 2 * r, (Math.PI * r) / 2, w / 2 - r];
    let k = d;
    if (k <= seg[0]) return [cx + k, y + h];
    k -= seg[0];
    if (k <= seg[1]) { const a = k / r; return [x + w - r + Math.sin(a) * r, y + h - r + Math.cos(a) * r]; }
    k -= seg[1];
    if (k <= seg[2]) return [x + w, y + h - r - k];
    k -= seg[2];
    if (k <= seg[3]) { const a = k / r; return [x + w - r + Math.cos(a) * r, y + r - Math.sin(a) * r]; }
    k -= seg[3];
    return [x + w - r - Math.min(k, seg[4]), y];
  }
  const FRAME_HALF = (FR.w / 2 - FR.r) * 2 + Math.PI * FR.r + FR.h - 2 * FR.r;

  function drawFrameHeads(ctx, t) {
    const p = ease.io2(range(t, 15.35, 17.25));
    if (p <= 0) return;
    const hide = 1 - range(t, 17.25, 17.7);
    if (hide <= 0) return;
    ctx.globalCompositeOperation = "lighter";
    const r = rng(333);
    for (const sgn of [1, -1]) {
      const d = p * FRAME_HALF;
      for (let i = 0; i < 26; i++) {
        const back = i * 26 * (0.6 + r() * 0.8);
        const dd = d - back;
        if (dd < 0) continue;
        const [px, py] = framePoint(dd);
        const X = sgn === 1 ? px : 2 * CX - px;
        const rad = (i === 0 ? 46 : 18 - i * 0.55) * (0.8 + 0.2 * Math.sin(t * 30 + i));
        ctx.globalAlpha = (i === 0 ? 1 : (1 - i / 26) * 0.6) * hide;
        ctx.drawImage(sprite(...(i === 0 ? GOLD_L : GOLD), i === 0 ? 1 : 0), X - Math.max(rad, 2), py - Math.max(rad, 2), Math.max(rad, 2) * 2, Math.max(rad, 2) * 2);
        if (i > 0 && i % 3 === 0) { // étincelles qui tombent du front
          const fall = (t * 60 + i * 13) % 40;
          ctx.globalAlpha = 0.5 * (1 - fall / 40) * hide;
          ctx.drawImage(sprite(...GOLD_L), X + (r() - 0.5) * 30 - 4, py + fall - 4, 8, 8);
        }
      }
    }
    ctx.globalAlpha = 1;
  }


  /* ---------- S4 : tourbillon d'étincelles qui orbitent autour du futur cadre ---------- */
  function drawOrbit(ctx, t) {
    if (t < 15.0 || t > 17.9) return;
    const env = ease.o2(range(t, 15.0, 15.7)) * (1 - ease.i2(range(t, 17.1, 17.9)));
    const r = rng(515);
    ctx.globalCompositeOperation = "lighter";
    const s = sprite(...GOLD_L, 1), g = sprite(...GOLD);
    for (let i = 0; i < 90; i++) {
      const rad = 230 + r() * 700, a0 = r() * TAU, sp = (0.35 + r() * 0.5) * (r() < 0.5 ? 1 : -1), sz = 5 + r() * 11, flat = 1.15 + r() * 0.35;
      const a = a0 + (t - 15.0) * sp * (1.4 - rad / 1400) * 1.6;
      const x = CX + Math.cos(a) * rad * 0.82, y = CY + Math.sin(a) * rad * flat;
      for (let k = 0; k < 5; k++) { // traînée
        const ak = a - k * 0.045 * Math.sign(sp);
        const xk = CX + Math.cos(ak) * rad * 0.82, yk = CY + Math.sin(ak) * rad * flat, rr = sz * (1 - k * 0.17);
        ctx.globalAlpha = clamp(env * (0.8 - k * 0.15) * (0.6 + 0.4 * Math.sin(t * 5 + i)));
        ctx.drawImage(k === 0 ? s : g, xk - rr, yk - rr, rr * 2, rr * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- morphing géométrique S1 → S2 ---------- */
  function morphPoints(p, n) {
    n = n || 96;
    const e = ease.io3(p), lobes = 6;
    const R = lerp(24, 2150, Math.pow(e, 1.45));
    const amp = 0.42 * Math.pow(1 - e, 1.15);
    const rot = e * 1.5 - 0.4;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const th = (i / n) * TAU;
      // pétales : lobes arrondis qui s'aplatissent en cercle
      const rr = R * (1 + amp * Math.cos(lobes * th + rot) + amp * 0.35 * Math.cos(2 * lobes * th - rot * 2));
      pts.push([CX + Math.cos(th) * rr, CY + Math.sin(th) * rr * 1.0]);
    }
    return pts;
  }
  function morphPolygon(p) {
    return "polygon(" + morphPoints(clamp(p)).map(([x, y]) => x.toFixed(1) + "px " + y.toFixed(1) + "px").join(",") + ")";
  }

  /* ---------- couche AVANT : anneaux, flashs, morphing, vignette, grain ---------- */
  const HITS = [
    { t: 1.7, col: GOLD_L, ring: 1, flash: 0.35, y: 960 },
    { t: 2.8, col: GOLD, ring: 1, flash: 0.25, y: 1130 },
    { t: 4.05, col: GOLD_L, ring: 0, flash: 0.0, y: 960 },
    { t: 9.0, col: GOLD_L, ring: 1, flash: 0.85, y: 960 },
    { t: 11.0, col: [255, 170, 120], ring: 1, flash: 0.85, y: 960 },
    { t: 13.0, col: GOLD_L, ring: 1, flash: 0.8, y: 960 },
    { t: 17.2, col: GOLD_L, ring: 1, flash: 0.6, y: 960 },
    { t: 20.4, col: GOLD_L, ring: 1, flash: 0.3, y: 960 },
  ];
  let grainTiles = null;
  function makeGrain() {
    grainTiles = [];
    for (let k = 0; k < 4; k++) {
      const c = document.createElement("canvas"); c.width = 270; c.height = 480;
      const x = c.getContext("2d"), im = x.createImageData(270, 480), r = rng(900 + k);
      for (let i = 0; i < im.data.length; i += 4) {
        const v = r();
        const w = v > 0.5;
        im.data[i] = im.data[i + 1] = im.data[i + 2] = w ? 255 : 0;
        im.data[i + 3] = Math.abs(v - 0.5) * 2 * 42;
      }
      x.putImageData(im, 0, 0); grainTiles.push(c);
    }
  }

  function drawFront(ctx, t, frame) {
    ctx.globalCompositeOperation = "lighter";
    // anneaux d'onde de choc
    for (const h of HITS) {
      const u = t - h.t;
      if (h.ring && u >= 0 && u < 1.4) {
        const p = ease.oExpo(u / 1.4);
        const a = Math.pow(1 - u / 1.4, 2);
        ctx.strokeStyle = `rgba(${h.col},${0.75 * a})`; ctx.lineWidth = 10 * (1 - p) + 1.5;
        ctx.beginPath(); ctx.arc(CX, h.y, 30 + p * 1250, 0, TAU); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.3 * a})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(CX, h.y, 10 + p * 880, 0, TAU); ctx.stroke();
      }
    }
    // bord doré du morphing
    const mp = range(t, 4.0, 4.95);
    if (mp > 0 && mp < 1) {
      const a = Math.sin(Math.min(1, mp * 1.4) * Math.PI * 0.5) * (1 - range(mp, 0.7, 1));
      for (const [off, w, al] of [[0, 14, 0.55], [0, 3, 1], [-0.07, 5, 0.35]]) {
        const pts = morphPoints(clamp(mp + off));
        ctx.strokeStyle = `rgba(255,214,120,${al * a})`; ctx.lineWidth = w;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
      }
    }
    drawFrameHeads(ctx, t);
    // flashs
    let fl = 0, fc = [255, 240, 200];
    for (const h of HITS) {
      const u = t - h.t;
      if (h.flash && u > -0.02 && u < 0.5) fl = Math.max(fl, h.flash * Math.exp(-Math.max(u, 0) * 13) * (u < 0 ? 0.5 : 1));
    }
    // couronne de lumière au morphing + fondu final
    if (fl > 0.002) { ctx.fillStyle = `rgba(${fc},${fl})`; ctx.fillRect(0, 0, W, H); }
    // vignette + grain (alpha normal)
    ctx.globalCompositeOperation = "source-over";
    const vg = ctx.createRadialGradient(CX, CY, 520, CX, CY, 1250);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    if (!grainTiles) makeGrain();
    const gi = Math.floor(t * 30 + 0.001);
    ctx.globalAlpha = 0.55;
    const ox = (gi * 53) % 40, oy = (gi * 91) % 40;
    ctx.save(); ctx.scale(4, 4);
    ctx.drawImage(grainTiles[gi % 4], -ox, -oy, 270 + 40, 480 + 40);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBack(ctx, t) {
    ctx.clearRect(0, 0, W, H);
    drawGreenWave(ctx, t);
    drawMotes(ctx, t);
    // S2 — bokeh doré / vert
    floaters(ctx, t, { t0: 4.0, t1: 9.35, fade: 0.7, n: 38, seed: 41, size: [10, 105], alpha: [0.07, 0.28], speed: 46, sway: 40, colors: [GOLD, GOLD_L, EMER, WHITE], tw: 1.4 });
    // S3 — braises et étincelles
    floaters(ctx, t, { t0: 9.0, t1: 15.3, fade: 0.4, n: 70, seed: 52, size: [4, 16], alpha: [0.35, 0.95], speed: 190, sway: 70, colors: [GOLD_L, GOLD, [255, 140, 90]], tw: 7, hard: 1 });
    sparks(ctx, t, 9.0, { x: CX, y: CY, n: 120, v: [350, 1700], life: 1.5, seed: 6, colors: [GOLD_L, WHITE, EMER] });
    sparks(ctx, t, 11.0, { x: CX, y: CY, n: 140, v: [450, 2000], life: 1.5, seed: 7, colors: [GOLD_L, [255, 120, 90], WHITE], gravity: 0.7 });
    sparks(ctx, t, 13.0, { x: CX, y: CY, n: 130, v: [350, 1800], life: 1.6, seed: 8, colors: [GOLD_L, EMER, [255, 130, 130]] });
    drawOrbit(ctx, t);
    // S4 — poussière d'or fine
    floaters(ctx, t, { t0: 15.0, t1: 20.4, fade: 0.8, n: 130, seed: 63, size: [6, 30], alpha: [0.22, 0.8], speed: 38, sway: 28, colors: [GOLD, GOLD_L], tw: 3.5 });
    sparks(ctx, t, 17.2, { x: CX, y: CY, n: 150, v: [300, 1500], life: 1.9, seed: 9, colors: [GOLD_L, GOLD, WHITE] });
    // S5 — poussière dorée de signature
    floaters(ctx, t, { t0: 20.0, t1: 24.1, fade: 0.9, n: 80, seed: 74, size: [4, 22], alpha: [0.12, 0.55], speed: 30, sway: 22, colors: [GOLD, GOLD_L], tw: 3 });
    sparks(ctx, t, 20.4, { x: CX, y: 880, n: 70, v: [200, 900], life: 1.6, seed: 10, colors: [GOLD_L, GOLD] });
    ctx.globalCompositeOperation = "source-over";
  }

  g.NV = { W, H, CX, CY, TAU, clamp, lerp, range, ease, rng, drawBack, drawFront, morphPolygon, morphPoints, FR, FRAME_HALF, framePoint, HITS };
})(typeof window !== "undefined" ? window : globalThis);
