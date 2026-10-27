import React, { useMemo } from "react";
import { W, H, CX, CY, NV, useT, ease, pr, tw, lerp, clamp, sp, shake, Cam, Chars, sweep, blur, Leaf, zig, diamond, HIDE } from "./lib";

/* ====================================================================== SCÈNE 3 — LA PUISSANCE DU MOTION (9 → 15 s)
 * Trois mots, trois décors, trois transitions différentes :
 *   NATURE   (9 s)  : zoom traversant + bascule 3D des lettres
 *   ÉNERGIE  (11 s) : balayage en dents de scie + tranches typographiques + éclairs
 *   ÉQUILIBRE(13 s) : iris en losange + disque vert/bordeaux qui s'emboîte
 */
const s3fade = (t: number) => 1 - pr(t, 14.85, 0.25, ease.i2 as any);

// --- N
const nIntro = (t: number) => { const p = pr(t, 8.98, 0.5, ease.expo); return { opacity: p, scale: lerp(0.62, 1, p) }; };
function nCam(t: number) {
  const p = pr(t, 9.0, 2.25, ease.io2), [x, y] = shake(t, 9.0, 18);
  return { s: lerp(1.02, 1.16, p), r: lerp(-2, 2, p), x, y };
}
const N_LEAVES = [{ x: 90, y: 330, s: 760, r: -25 }, { x: 1010, y: 1560, s: 840, r: 150 }, { x: 960, y: 260, s: 520, r: 60 }, { x: 80, y: 1650, s: 600, r: 215 }];

// --- E
const eWipe = (t: number) => { const p = pr(t, 10.85, 0.5, ease.io3); return t < 10.85 ? HIDE : p >= 1 ? "none" : zig(lerp(W + 240, -260, p)); };
function eCam(t: number) {
  const p = pr(t, 11.0, 2.1, ease.expo), [x, y] = shake(t, 11.0, 22);
  return { s: lerp(1.3, 1.0, p), r: lerp(7, -2, p), x, y };
}

// --- Q
const qIris = (t: number) => { const p = pr(t, 12.85, 0.55, ease.io3); return t < 12.85 ? HIDE : p >= 1 ? "none" : diamond(lerp(30, 2000, p)); };
function qCam(t: number) {
  const p = pr(t, 13.0, 1.55, ease.expo), [x, y] = shake(t, 13.0, 16);
  const s0 = lerp(1.25, 1.0, p), r0 = lerp(-6, 2, p);
  const e = pr(t, 14.58, 0.5, ease.i3);
  return { s: lerp(s0, 3.4, e), r: lerp(r0, 36, e), x, y };
}

const useBolts = () => useMemo(() => {
  const br = NV().rng(88);
  const mk = (x0: number, y0: number, ang: number, len: number) => { let d = `M${x0},${y0}`, x = x0, y = y0; const n = 11; for (let i = 0; i < n; i++) { const a = ang + (br() - 0.5) * 0.9; x += Math.cos(a) * (len / n); y += Math.sin(a) * (len / n); d += ` L${x.toFixed(0)},${y.toFixed(0)}`; } return d; };
  return [[CX, CY, -1.9, 780], [CX, CY, 0.9, 760], [CX, CY, 2.7, 700]].map((b) => mk(b[0], b[1], b[2], b[3]));
}, []);
const useSpeed = () => useMemo(() => { const er = NV().rng(5); return Array.from({ length: 16 }, () => { const w = 380 + er() * 560; const top = 80 + er() * 1760; return { w, top }; }); }, []);

export const S3Bg: React.FC = () => {
  const t = useT();
  const nc = nCam(t), ni = nIntro(t), ec = eCam(t), qc = qCam(t);
  const bolts = useBolts(), speed = useSpeed();
  const qhl = pr(t, 13.0, 1.0, ease.expo), qhr = qhl;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: s3fade(t) }}>
      {/* N */}
      <div className="sub" style={{ opacity: ni.opacity, transform: `scale(${ni.scale})` }}>
        <Cam x={nc.x} y={nc.y} r={nc.r} s={nc.s}>
          <div className="n-base" />
          <div className="rays" style={{ transform: `rotate(${tw(t, -10, 28, 9.0, 2.4)}deg)` }} />
          <div>{[0, 1, 2, 3, 4].map((i) => { const p = pr(t, 9.0 + i * 0.22, 1.5, ease.o2); return <div key={i} className="ringx" style={{ opacity: t < 9 + i * 0.22 ? 0 : 0.9 * (1 - p), transform: `scale(${lerp(0.15, 2.8 - i * 0.1, p)})` }} />; })}</div>
          <div className="fill">{N_LEAVES.map((o, i) => { const p = pr(t, 9.0 + i * 0.05, 2.3, ease.o2); return <Leaf key={i} x={o.x} y={o.y} s={o.s} rot={lerp(o.r - 40, o.r + 50, p)} sc={lerp(0.4, 1, p)} op={0.34} style={{ filter: "brightness(.55) saturate(1.1)" }} />; })}</div>
        </Cam>
      </div>
      {/* E */}
      <div className="sub" style={{ clipPath: eWipe(t) }}>
        <Cam x={ec.x} y={ec.y} r={ec.r} s={ec.s}>
          <div className="e-base" />
          <div className="rays" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,200,140,.10) 0deg 2.4deg, rgba(255,255,255,0) 2.4deg 9deg)", transform: `rotate(${tw(t, 0, -40, 11.0, 2.2)}deg)` }} />
          <div>{[0, 1, 2, 3].map((i) => { const p = pr(t, 11.0 + i * 0.5, 1.2, ease.o2); return <div key={i} className="ringx" style={{ borderColor: "rgba(255,200,150,.7)", opacity: t < 11 + i * 0.5 ? 0 : 0.9 * (1 - p), transform: `scale(${lerp(0.2, 2.6, p)})` }} />; })}</div>
          <div className="fill">{speed.map((s, i) => { const st = 11.0 + (i % 8) * 0.12, d = 0.55 + (i % 4) * 0.08, p = pr(t, st, d, ease.i2); return <div key={i} className="speed" style={{ top: s.top, width: s.w, opacity: lerp(1, 0.2, p), transform: `translateX(${lerp(-700, W + 300, p)}px)` }} />; })}</div>
          <svg className="bolt" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ filter: "drop-shadow(0 0 10px rgba(255,226,140,.95)) drop-shadow(0 0 28px rgba(255,170,90,.6))" }}>
            {bolts.map((d, i) => {
              const draw = pr(t, 11.05 + i * 0.05, 0.2, ease.o2);
              let o = 1;
              for (const w of [11.55, 11.95, 12.45]) { const u = t - (w + i * 0.03); if (u >= 0 && u < 0.2) o = Math.floor(u / 0.05) % 2 === 0 ? 1 : 0.1; }
              o *= 1 - pr(t, 12.7, 0.2);
              return <path key={i} d={d} pathLength={1000} fill="none" stroke="#fff3bd" strokeWidth={5 - i} strokeLinejoin="round" strokeLinecap="butt" strokeDasharray={1000} strokeDashoffset={1000 * (1 - draw)} opacity={t < 11.05 ? 0 : o} />;
            })}
          </svg>
        </Cam>
      </div>
      {/* Q */}
      <div className="sub" style={{ clipPath: qIris(t) }}>
        <Cam x={qc.x} y={qc.y} r={qc.r} s={qc.s}>
          <div className="q-base" />
          <svg className="fill" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ overflow: "visible", filter: "drop-shadow(0 0 12px rgba(255,214,120,.8))" }}>
            <g>
              <path d="M540,560 A400,400 0 0 0 540,1360 Z" fill="#006b4f" transform={`translate(${-700 * (1 - qhl)} 0) rotate(${-50 * (1 - qhl)} 540 960)`} />
              <path d="M540,560 A400,400 0 0 1 540,1360 Z" fill="#801e32" transform={`translate(${700 * (1 - qhr)} 0) rotate(${50 * (1 - qhr)} 540 960)`} />
              <circle cx={540} cy={960} r={400} fill="none" stroke="rgba(255,226,140,.35)" strokeWidth={2} />
            </g>
            <circle cx={540} cy={960} r={452} fill="none" stroke="url(#gGold)" strokeWidth={4} pathLength={1000} strokeDasharray={1000} strokeDashoffset={1000 * (1 - pr(t, 13.2, 1.1, ease.o3))} transform="rotate(-90 540 960)" />
            <g transform={`rotate(${tw(t, -180, 540, 13.0, 2.1, ease.io2)} 540 960)`}><circle cx={540} cy={508} r={14} fill="#ffe9a0" /></g>
            <line x1={40} y1={960} x2={1040} y2={960} stroke="url(#gGold)" strokeWidth={3} opacity={0.8 * pr(t, 13.15, 0.7, ease.expo)} transform={`rotate(${tw(t, -7, 0, 13.2, 1.2, ease.elastic)} 540 960) translate(540 960) scale(${pr(t, 13.15, 0.7, ease.expo)} 1) translate(-540 -960)`} />
          </svg>
        </Cam>
      </div>
    </div>
  );
};

export const S3Fg: React.FC = () => {
  const t = useT();
  const nc = nCam(t), ni = nIntro(t), ec = eCam(t), qc = qCam(t);
  const nOut = pr(t, 11.1, 0.2), eOut = pr(t, 13.05, 0.2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: s3fade(t) }}>
      {/* N */}
      <div className="sub" style={{ opacity: ni.opacity * (1 - nOut), transform: `scale(${ni.scale})` }}>
        <Cam x={nc.x} y={nc.y} r={nc.r} s={nc.s}>
          <div className="idx"><span>01</span><i style={{ width: tw(t, 0, 140, 9.15, 0.7, ease.expo) }} /></div>
          <div className="stack">
            <div className="w3 w3-n">
              <Chars text="NATURE" cls="shine-t" fn={(i) => {
                const p = sp(t, 9.02 + i * 0.045, { damping: 12, stiffness: 120 });
                const ex = pr(t, 10.72 + i * 0.025, 0.32, ease.i3);
                return { opacity: clamp(p * 2) * (1 - ex), transform: `translateY(${220 * (1 - p) - 240 * ex}px) perspective(1200px) rotateX(${-100 * (1 - p)}deg)`, filter: blur(14 * (1 - clamp(p)) + 12 * ex), backgroundPosition: sweep(pr(t, 9.6 + i * 0.06, 0.9, ease.io2)) };
              }} />
            </div>
          </div>
          <div className="stack" style={{ top: 560 }}><div className="rule" style={{ marginTop: 0, width: tw(t, 0, 760, 9.5, 0.8, ease.expo) }} /></div>
        </Cam>
      </div>
      {/* E */}
      <div className="sub" style={{ clipPath: eWipe(t), opacity: 1 - eOut }}>
        <Cam x={ec.x} y={ec.y} r={ec.r} s={ec.s}>
          <div className="idx"><span>02</span><i style={{ width: tw(t, 0, 140, 11.15, 0.7, ease.expo) }} /></div>
          <div className="stack">
            <div className="w3 w3-e" style={{ position: "relative", height: 440, width: 1040 }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const dir = i % 2 ? 1 : -1;
                const a = pr(t, 11.02 + i * 0.045, 0.7, ease.expo), ex = pr(t, 12.68 + i * 0.03, 0.3, ease.i3);
                const u = t - 11.9, vib = u >= 0 && u < 0.12 ? 6 * dir * (1 - Math.abs(1 - u / 0.06)) : 0;
                const x = dir * 1300 * (1 - a) + dir * 1300 * ex + vib;
                const sk = dir * -38 * (1 - a) + -dir * 36 * ex;
                return (
                  <div key={i} className="slice" style={{ clipPath: `inset(${i * 20}% 0 ${80 - i * 20}% 0)`, opacity: a, transform: `translateX(${x}px) skewX(${sk}deg)` }}>
                    <div className="w3 w3-e shine-t" style={{ fontSize: 330 }}>ÉNERGIE</div>
                  </div>
                );
              })}
              <div className="slice" style={{ mixBlendMode: "screen", opacity: 0.85 * pr(t, 11.1, 0.5, ease.expo) * (1 - pr(t, 11.65, 0.5, ease.o2)), transform: `translateX(${tw(t, 80, 0, 11.1, 0.5, ease.expo)}px)` }}>
                <div className="w3 w3-e" style={{ fontSize: 330, color: "#ffd27a" }}>ÉNERGIE</div>
              </div>
            </div>
          </div>
        </Cam>
      </div>
      {/* Q */}
      <div className="sub" style={{ clipPath: qIris(t) }}>
        <Cam x={qc.x} y={qc.y} r={qc.r} s={qc.s}>
          <div className="idx"><span>03</span><i style={{ width: tw(t, 0, 140, 13.15, 0.7, ease.expo) }} /></div>
          <div className="stack">
            <div className="w3 w3-q" style={{ perspective: 1300 }}>
              <Chars text="ÉQUILIBRE" cls="shine-t" fn={(i, n) => {
                const side = i % 2 ? 1 : -1, dl = (Math.floor(n / 2) - Math.abs(i - Math.floor(n / 2))) * 0.04;
                const a = pr(t, 13.02 + dl, 0.85, ease.expo);
                return { opacity: clamp(a * 3), transform: `translateX(${side * 620 * (1 - a)}px) rotateY(${side * 80 * (1 - a)}deg)`, filter: blur(18 * (1 - a)), backgroundPosition: sweep(pr(t, 13.7 + i * 0.05, 0.9, ease.io2)) };
              }} />
            </div>
          </div>
        </Cam>
      </div>
    </div>
  );
};
