import React, { createContext, useContext } from "react";
import { spring } from "remotion";
import "./fx.js";

export const W = 1080, H = 1920, CX = 540, CY = 960, FPS = 30;
export const NV = () => (window as any).NV;

/** Temps absolu (secondes) : fourni par <Main/>, indépendant des <Sequence> imbriquées. */
export const TimeCtx = createContext(0);
export const useT = () => useContext(TimeCtx);

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Courbes d'accélération (équivalents des eases GSAP utilisés dans la version HyperFrames). */
export const ease = {
  lin: (x: number) => x,
  o2: (x: number) => 1 - (1 - x) * (1 - x),
  o3: (x: number) => 1 - Math.pow(1 - x, 3),
  o4: (x: number) => 1 - Math.pow(1 - x, 4),
  o5: (x: number) => 1 - Math.pow(1 - x, 5),
  i2: (x: number) => x * x,
  i3: (x: number) => x * x * x,
  io2: (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  io3: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  sine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  expo: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  back: (s = 1.70158) => (x: number) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  elastic: (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin(((x - 0.35 / 4) * (2 * Math.PI)) / 0.35) + 1),
};

/** progression 0→1 de t0 sur d secondes, avec courbe `e` */
export const pr = (t: number, t0: number, d: number, e: (x: number) => number = ease.lin) => e(clamp((t - t0) / d));
/** interpolation a→b sur la fenêtre [t0, t0+d] */
export const tw = (t: number, a: number, b: number, t0: number, d: number, e: (x: number) => number = ease.lin) => lerp(a, b, pr(t, t0, d, e));

/** Spring Remotion : progression 0→1 (avec dépassement) depuis t0 */
export const sp = (t: number, t0: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping: 14, stiffness: 90, mass: 0.9, ...cfg } });

/** Secousse de caméra calée sur un impact. */
export function shake(t: number, at: number, amp: number): [number, number] {
  const seq = [[1, -1], [-0.8, 0.9], [0.6, -0.7], [-0.4, 0.4], [0.2, -0.2], [0, 0]];
  const u = (t - at) / 0.045, i = Math.floor(u);
  if (u < 0 || i >= seq.length) return [0, 0];
  const from = i === 0 ? [0, 0] : seq[i - 1], to = seq[i], f = u - i;
  return [lerp(from[0], to[0], f) * amp, lerp(from[1], to[1], f) * amp];
}

export const Cam: React.FC<{ x?: number; y?: number; r?: number; s?: number; ry?: number; persp?: number; style?: React.CSSProperties; children?: React.ReactNode; id?: string }> = ({ x = 0, y = 0, r = 0, s = 1, ry = 0, persp, style, children, id }) => (
  <div id={id} style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `${persp ? `perspective(${persp}px) ` : ""}translate(${x}px,${y}px) rotate(${r}deg) rotateY(${ry}deg) scale(${s})`, ...style }}>{children}</div>
);

/** Texte découpé en lettres, chaque lettre pilotée par un callback (équivalent des staggers GSAP). */
export const Chars: React.FC<{ text: string; cls?: string; fn: (i: number, n: number) => React.CSSProperties; attr?: (i: number) => Record<string, any> }> = ({ text, cls, fn, attr }) => {
  const a = Array.from(text);
  return <>{a.map((c, i) => <span key={i} className={"ch" + (cls ? " " + cls : "")} data-c={c} style={fn(i, a.length)} {...(attr ? attr(i) : {})}>{c === " " ? " " : c}</span>)}</>;
};
export const sweep = (p: number) => `${lerp(100, 0, p)}% 0`;
export const blur = (b: number) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none");

/** Feuille stylisée (symbole SVG partagé). */
export const Leaf: React.FC<{ x: number; y: number; s: number; tx?: number; ty?: number; rot?: number; sc?: number; op?: number; style?: React.CSSProperties }> = ({ x, y, s, tx = 0, ty = 0, rot = 0, sc = 1, op = 1, style }) => (
  <svg className="lf" viewBox="-100 -110 200 220" style={{ left: x - s / 2, top: y - (s * 1.1) / 2, width: s, height: s * 1.1, opacity: op, transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${sc})`, ...style }}>
    <use href="#leaf" x={-100} y={-110} width={200} height={220} />
  </svg>
);

export type LeafSpec = { x: number; y: number; s: number; rot: number; op: number; ph: number };
export function scatter(o: { n: number; seed: number; size: [number, number]; op: [number, number]; avoid?: boolean; edge?: boolean }): LeafSpec[] {
  const r = NV().rng(o.seed), out: LeafSpec[] = [];
  let guard = 0;
  while (out.length < o.n && guard++ < 4000) {
    const x = r() * (W + 240) - 120, y = r() * (H + 240) - 120;
    if (o.avoid && x > 170 && x < 910 && y > 520 && y < 1400) continue;
    if (o.edge && !(x < 150 || x > 930)) continue;
    const s = o.size[0] + r() * (o.size[1] - o.size[0]);
    const rot = r() * 360, op = o.op[0] + r() * (o.op[1] - o.op[0]);
    out.push({ x, y, s, rot, op, ph: r() });
  }
  return out;
}

export const Defs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="gLeafL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#00281e" /><stop offset="1" stopColor="#00805f" /></linearGradient>
      <linearGradient id="gLeafR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#00a47b" /><stop offset="1" stopColor="#4be3b0" /></linearGradient>
      <symbol id="leaf" viewBox="-100 -110 200 220">
        <path d="M0,-100 C58,-62 64,28 0,100 Z" fill="url(#gLeafR)" />
        <path d="M0,-100 C-58,-62 -64,28 0,100 Z" fill="url(#gLeafL)" />
        <path d="M0,-96 L0,96 M0,-62 Q20,-66 38,-80 M0,-28 Q26,-36 50,-56 M0,8 Q28,-2 54,-24 M0,44 Q24,34 44,14 M0,74 Q14,66 26,54 M0,-62 Q-20,-66 -38,-80 M0,-28 Q-26,-36 -50,-56 M0,8 Q-28,-2 -54,-24 M0,44 Q-24,34 -44,14 M0,74 Q-14,66 -26,54" fill="none" stroke="rgba(255,226,140,.5)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M0,-100 C58,-62 64,28 0,100 C-64,28 -58,-62 0,-100Z" fill="none" stroke="rgba(255,226,140,.45)" strokeWidth="1.6" />
      </symbol>
      <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8f6f12" /><stop offset=".45" stopColor="#ffe9a0" /><stop offset=".75" stopColor="#d4af37" /><stop offset="1" stopColor="#ffe9a0" /></linearGradient>
      <linearGradient id="gRib" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4be3b0" stopOpacity=".0" /><stop offset=".3" stopColor="#4be3b0" /><stop offset=".7" stopColor="#ffe9a0" /><stop offset="1" stopColor="#d4af37" stopOpacity=".1" /></linearGradient>
    </defs>
  </svg>
);

export function zig(edge: number) {
  const pts: string[] = [];
  for (let i = 0, y = 0; y <= H + 120; i++, y += 120) pts.push(`${(edge + (i % 2 ? 80 : -80)).toFixed(1)}px ${y}px`);
  return `polygon(${pts.join(",")},${W + 200}px ${H + 120}px,${W + 200}px 0px)`;
}
export const diamond = (R: number) => `polygon(${CX}px ${CY - R}px,${CX + R}px ${CY}px,${CX}px ${CY + R}px,${CX - R}px ${CY}px)`;
export const HIDE = "polygon(0px 0px,0px 0px,0px 0px)";
