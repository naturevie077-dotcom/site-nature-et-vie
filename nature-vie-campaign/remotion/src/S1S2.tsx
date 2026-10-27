import React, { useMemo } from "react";
import { W, H, CX, CY, NV, useT, ease, pr, tw, lerp, clamp, sp, shake, Cam, Chars, sweep, blur, Leaf, scatter, HIDE } from "./lib";

/* ====================================================================== SCÈNE 1 — L'OUVERTURE (0 → 4 s) */
function cam1(t: number, end = 1.6, dur = 0.55) {
  const b = (u: number) => pr(u, 0, 4.0, ease.io2);
  const sB = (u: number) => lerp(1.0, 1.17, b(u));
  const s = t < 3.55 ? sB(t) : lerp(sB(3.55), end, pr(t, 3.55, dur, ease.i3));
  const [ax, ay] = shake(t, 1.7, 14), [bx, by] = shake(t, 2.8, 10);
  return { s, r: lerp(-1.3, 0.8, b(t)), x: ax + bx, y: ay + by };
}

export const S1Bg: React.FC = () => {
  const t = useT();
  const c = cam1(t);
  return (
    <Cam x={c.x} y={c.y} r={c.r} s={c.s}>
      <div className="s1-base" />
      {[120, 410, 700].map((left, i) => {
        const o = pr(t, 1.0 + i * 0.16, 2.4, ease.sine) * (1 - pr(t, 3.2 + i * 0.1, 0.9, ease.i2));
        const y = tw(t, 260, -120, 1.0 + i * 0.16, 2.4, ease.sine);
        return <div key={i} className="beam" style={{ left, opacity: o, transform: `translateY(${y}px)` }} />;
      })}
    </Cam>
  );
};

export const S1Fg: React.FC = () => {
  const t = useT();
  const c = cam1(t, 1.5, 0.42);
  const out = pr(t, 3.55, 0.42, ease.i3);
  const leP = pr(t, 1.78, 1.0, ease.expo);
  const bP = pr(t, 1.7, 0.95, ease.expo);
  return (
    <Cam x={c.x} y={c.y} r={c.r} s={c.s}>
      <div className="stack" style={{ opacity: 1 - out, filter: blur(out * 18) }}>
        <div className="mask">
          <span className="le" style={{ display: "inline-block", transform: `translateY(${lerp(130, 0, leP)}%) scale(${lerp(1.25, 1, leP)})`, opacity: leP }}>LE</span>
        </div>
        <div className="mask" style={{ marginTop: 6 }}>
          <span className="big line shine-t" style={{ display: "block", transformOrigin: "50% 100%", transform: `translateY(${lerp(118, 0, bP)}%) scaleY(${lerp(1.18, 1, bP)})`, opacity: bP, backgroundPosition: sweep(pr(t, 2.15, 1.15, ease.io2)) }}>BIEN-ÊTRE</span>
        </div>
        <div className="rule" style={{ margin: "64px 0 40px", width: tw(t, 0, 760, 2.55, 0.9, ease.expo) }} />
        <div className="mask">
          <span className="sub-t line" style={{ display: "block" }}>
            <Chars text="EN MOUVEMENT" fn={(i) => {
              const a = pr(t, 2.8 + i * 0.035, 0.8, ease.expo);
              const g = pr(t, 3.2 + i * 0.02, 0.5, ease.o2);
              const strokeG = Math.round(lerp(175, 233, g)), strokeB = Math.round(lerp(55, 160, g));
              return { opacity: a, transform: `translateY(${lerp(70, 0, a)}px) scale(${lerp(1.5, 1, a)})`, filter: blur(lerp(18, 0, a)), color: `rgba(212,175,55,${lerp(0.08, 1, g)})`, WebkitTextStrokeColor: `rgb(${Math.round(lerp(212, 255, g))},${strokeG},${strokeB})` };
            }} />
          </span>
        </div>
      </div>
    </Cam>
  );
};

/* ====================================================================== SCÈNE 2 — L'UNIVERS DE LA MARQUE (4 → 9 s) */
const RIBS = [
  "M-60,1750 C240,1500 120,1250 420,1060 S860,900 1000,620 S900,240 1140,60",
  "M1140,1650 C860,1480 960,1180 700,1020 S260,880 160,560 S300,200 -60,20",
  "M-80,980 C200,900 330,1180 560,1000 S800,720 1160,860",
  "M1120,1180 C880,1260 760,1020 540,1180 S260,1500 -40,1380",
];
const useLeaves = () => useMemo(() => ({
  far: scatter({ n: 16, seed: 21, size: [120, 230], op: [0.28, 0.5], avoid: true }),
  mid: scatter({ n: 15, seed: 22, size: [190, 360], op: [0.8, 1], avoid: true }),
  near: scatter({ n: 7, seed: 23, size: [470, 700], op: [0.95, 1], edge: true }),
}), []);

function s2cam(t: number) {
  const b = (u: number) => pr(u, 4.0, 4.6, ease.sine);
  const sB = (u: number) => lerp(1.0, 1.05, b(u));
  const s = t < 8.62 ? sB(t) : lerp(sB(8.62), 2.6, pr(t, 8.62, 0.42, ease.i3));
  return { s, ry: lerp(-5, 5, b(t)) };
}
const s2clip = (t: number) => (t < 4.0 ? HIDE : t < 4.98 ? NV().morphPolygon(pr(t, 4.0, 0.95)) : "none");
const s2fade = (t: number) => 1 - pr(t, 9.0, 0.12);

const LeafLayer: React.FC<{ list: ReturnType<typeof scatter>; t0: number; spread: number; sway: number; cfg: any }> = ({ list, t0, spread, sway, cfg }) => {
  const t = useT();
  return <>{list.map((o, i) => {
    const d = Math.hypot(o.x - CX, o.y - CY) / 1500, at = t0 + d * spread;
    const p = sp(t, at, cfg);
    const sw = ease.sine(pr(t, at + 1.25, 9.2 - at - 1.25)) * sway * (o.ph > 0.5 ? 1 : -1);
    return <Leaf key={i} x={o.x} y={o.y} s={o.s} tx={(CX - o.x) * (1 - p)} ty={(CY - o.y) * (1 - p) + Math.abs(sw) * 2.2 * Math.sign(sw)} rot={o.rot + 150 * (1 - p) + sw} sc={0.05 + 0.95 * p} op={o.op * clamp(p * 3)} />;
  })}</>;
};

export const S2Bg: React.FC = () => {
  const t = useT();
  const L = useLeaves(), c = s2cam(t), k = clamp((t - 4.0) / 5.2);
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: s2clip(t), opacity: s2fade(t) }}>
      <Cam persp={1600} ry={c.ry} s={c.s}>
        <div className="s2-base" />
        <div className="blob" style={{ left: -260, top: 200, width: 760, height: 760, background: "radial-gradient(circle,rgba(75,227,176,.55),rgba(75,227,176,0) 70%)", transform: `translate(${ease.sine(k) * 260}px,${ease.sine(k) * 160}px)` }} />
        <div className="blob" style={{ left: 520, top: 1100, width: 820, height: 820, background: "radial-gradient(circle,rgba(212,175,55,.38),rgba(212,175,55,0) 70%)", transform: `translate(${-ease.sine(k) * 240}px,${-ease.sine(k) * 200}px)` }} />
        <div className="blob" style={{ left: 300, top: -200, width: 700, height: 700, background: "radial-gradient(circle,rgba(255,255,255,.26),rgba(255,255,255,0) 70%)", transform: `translate(${-ease.sine(k) * 120}px,${ease.sine(k) * 260}px)` }} />
        <div className="fill" style={{ filter: "blur(5px)", transform: `translate(${-25 * k}px,${-50 * k}px) scale(${1 + 0.04 * k})` }}>
          <LeafLayer list={L.far} t0={4.25} spread={0.7} sway={10} cfg={{ damping: 11, stiffness: 55 }} />
        </div>
        <svg className="fill" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ filter: "drop-shadow(0 0 10px rgba(255,226,140,.5))" }}>
          <g fill="none" strokeLinecap="butt">
            {RIBS.map((d, i) => <path key={i} d={d} pathLength={1000} stroke="url(#gRib)" strokeWidth={[9, 7, 5, 6][i]} strokeDasharray={1000} strokeDashoffset={1000 * (1 - pr(t, 4.35 + i * 0.22, 2.2, ease.io2))} opacity={[0.9, 0.8, 0.7, 0.75][i]} />)}
          </g>
        </svg>
        <div className="fill" style={{ filter: "drop-shadow(0 34px 38px rgba(0,20,14,.5))", transform: `translate(${-85 * k}px,${-140 * k}px) scale(${1 + 0.08 * k})` }}>
          <LeafLayer list={L.mid} t0={4.3} spread={0.8} sway={16} cfg={{ damping: 10, stiffness: 60 }} />
        </div>
        <div className="shaft" style={{ left: 150, opacity: 0.85 * pr(t, 4.2, 4.8, ease.sine) * 1, transform: `translateX(${tw(t, -500, 900, 4.2, 4.8, ease.sine)}px) rotate(18deg)` }} />
        <div className="shaft" style={{ left: 640, opacity: 0.6 * pr(t, 4.5, 4.8, ease.sine), transform: `translateX(${tw(t, -900, 600, 4.5, 4.8, ease.sine)}px) rotate(18deg)` }} />
      </Cam>
    </div>
  );
};

const exitW = (t: number, i: number) => { const e = pr(t, 8.45 + i * 0.04, 0.35, ease.i2); return { opacity: 1 - e, transform: `translateY(${-160 * e}px)`, filter: blur(14 * e) }; };

export const S2Fg: React.FC = () => {
  const t = useT();
  const L = useLeaves(), c = s2cam(t), k = clamp((t - 4.0) / 5.2);
  const laP = pr(t, 5.0, 0.85, ease.expo);
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: s2clip(t), opacity: s2fade(t) }}>
      <Cam persp={1600} ry={c.ry} s={c.s}>
        <div className="fill" style={{ filter: "blur(11px) drop-shadow(0 50px 50px rgba(0,16,11,.55))", transform: `translate(${-210 * k}px,${-300 * k}px) scale(${1 + 0.18 * k})` }}>
          <LeafLayer list={L.near} t0={4.4} spread={0.55} sway={8} cfg={{ damping: 12, stiffness: 50 }} />
        </div>
        <div className="stack s2-stack">
          <div className="mask" style={exitW(t, 0)}>
            <span className="line s2-la gold-t" style={{ display: "block", opacity: laP, transform: `translateX(${lerp(-700, 0, laP)}px) skewX(${lerp(28, 0, laP)}deg) rotate(${lerp(-9, 0, laP)}deg)`, clipPath: `inset(0 ${lerp(100, 0, laP)}% 0 0)`, backgroundPosition: sweep(pr(t, 5.2, 1.4, ease.io2)) }}>LA</span>
          </div>
          <div className="mask" style={exitW(t, 1)}>
            <span className="line s2-w" style={{ display: "block", perspective: 1100 }}>
              <Chars text="NATURE" fn={(i) => { const p = sp(t, 5.5 + i * 0.055, { damping: 11, stiffness: 95 }); return { opacity: clamp(p * 2), transform: `translateY(${330 * (1 - p)}px) rotateX(${-85 * (1 - p)}deg)`, filter: blur(16 * (1 - clamp(p))) }; }} />
            </span>
          </div>
          <div className="mask" style={exitW(t, 2)}>
            <span className="line s2-w outline-t" style={{ display: "block" }}>
              <Chars text="NOUS" fn={(i) => { const a = pr(t, 6.3 + i * 0.05, 0.85, ease.expo); return { opacity: a, transform: `scale(${lerp(3.4, 1, a)})`, filter: blur(30 * (1 - a)), ["--f" as any]: pr(t, 6.9 + i * 0.06, 0.45, ease.o2) }; }} />
            </span>
          </div>
          <div className="mask" style={exitW(t, 3)}>
            <span className="line s2-w" style={{ display: "block" }}>
              <Chars text="INSPIRE" cls="gold-t" fn={(i) => { const dl = Math.abs(i - 3) * 0.04; const a = pr(t, 7.0 + dl, 1.0, ease.o4); return { opacity: clamp(a * 4), transform: `translateX(${(i - 3) * 190 * (1 - a)}px) scale(${lerp(1.7, 1, a)}) rotate(${(i - 3) * 14 * (1 - a)}deg)`, backgroundPosition: sweep(pr(t, 7.6 + i * 0.07, 1.2, ease.io2)) }; }} />
            </span>
          </div>
        </div>
      </Cam>
    </div>
  );
};
