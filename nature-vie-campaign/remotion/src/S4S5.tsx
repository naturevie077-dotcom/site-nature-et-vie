import React from "react";
import { staticFile } from "remotion";
import { useT, ease, pr, tw, lerp, clamp, sp, shake, Cam, Chars, sweep, blur } from "./lib";

/* ====================================================================== SCÈNE 4 — LA RÉVÉLATION (15 → 20 s) */
function cam4(t: number) {
  const p = pr(t, 15.0, 2.3, ease.expo);
  const s0 = lerp(1.38, 0.96, p);
  const s = t < 19.5 ? s0 : lerp(0.96, 1.7, pr(t, 19.5, 0.55, ease.i3));
  const [x, y] = shake(t, 17.2, 12);
  return { s, r: lerp(-3, 0, p), x, y };
}
const s4op = (t: number) => pr(t, 14.9, 0.4, ease.o2) * (1 - pr(t, 19.85, 0.3, ease.i2));

export const S4Bg: React.FC = () => {
  const t = useT();
  const c = cam4(t);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: s4op(t) }}>
      <Cam x={c.x} y={c.y} r={c.r} s={c.s}>
        <div className="s4-base" />
        {[40, 520, 860].map((left, i) => (
          <div key={i} className="s4-shaft" style={{ left, opacity: 0.9 * pr(t, 15.0, 4.8, ease.sine), transform: `translateX(${tw(t, -260 + i * 60, 320 - i * 80, 15.0, 4.8, ease.sine)}px) rotate(14deg)` }} />
        ))}
        <div>{[0, 1, 2, 3].map((i) => {
          const a = pr(t, 15.2 + i * 0.5, 3.4, ease.o2), f = pr(t, 17.2 + i * 0.1, 1.0, ease.i2);
          return <div key={i} className="ringx" style={{ borderWidth: 2, borderColor: "rgba(255,226,140,.38)", opacity: 0.9 * pr(t, 15.2 + i * 0.5, 0.01) * (a < 1 ? Math.min(1, a * 30) : 1) * (1 - f) * (t < 15.2 + i * 0.5 ? 0 : 1), transform: `scale(${lerp(0.5, 2.6 + i * 0.35, a)})` }} />;
        })}</div>
        <div className="blob" style={{ left: 190, top: 610, width: 700, height: 700, background: "radial-gradient(circle,rgba(255,226,140,.35),rgba(255,226,140,0) 68%)", opacity: t < 17.3 ? pr(t, 15.2, 2.0, ease.sine) : lerp(1, 0.25, pr(t, 17.3, 1.2, ease.o2)), transform: `scale(${tw(t, 0.6, 1.4, 15.2, 2.0, ease.sine)})` }} />
        <div className="frame-fill" style={{ opacity: pr(t, 17.0, 0.8, ease.o2) }} />
      </Cam>
    </div>
  );
};

export const S4Fg: React.FC = () => {
  const t = useT();
  const c = cam4(t);
  const e = ease.io2(pr(t, 15.35, 1.9)), off = 1000 * (1 - e);
  const amp = sp(t, 17.38, { damping: 10, stiffness: 80, mass: 1 });
  const bob = t < 18.4 ? 0 : -10 * (t < 19.6 ? ease.sine(pr(t, 18.4, 1.2)) : 1 - ease.sine(pr(t, 19.6, 1.2)));
  const ticks: [number, number][] = [[82, 542], [982, 542], [82, 1362], [982, 1362]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: s4op(t) }}>
      <Cam x={c.x} y={c.y} r={c.r} s={c.s}>
        <svg className="frame-svg" viewBox="0 0 1080 1920" width={1080} height={1920}>
          <path d="M540,1370 H954 A36,36 0 0 0 990,1334 V586 A36,36 0 0 0 954,550 H540" pathLength={1000} fill="none" stroke="url(#gGold)" strokeWidth={5} strokeLinecap="butt" strokeDasharray={1000} strokeDashoffset={off} />
          <path d="M540,1370 H126 A36,36 0 0 1 90,1334 V586 A36,36 0 0 1 126,550 H540" pathLength={1000} fill="none" stroke="url(#gGold)" strokeWidth={5} strokeLinecap="butt" strokeDasharray={1000} strokeDashoffset={off} />
        </svg>
        {ticks.map(([x, y], i) => { const p = ease.back(3)(pr(t, 17.2 + i * 0.05, 0.5)); return <div key={i} className="s4-tick" style={{ left: x, top: y, opacity: clamp(p * 2), transform: `rotate(45deg) scale(${p})` }} />; })}
        <div className="stack" style={{ transform: `scale(${tw(t, 0.94, 1.12, 17.2, 2.9, ease.sine)})` }}>
          <div className="mask">
            <span className="line s4-n" style={{ display: "block" }}>
              <Chars text="NATURE" cls="shine-t" fn={(i) => { const a = pr(t, 17.2 + i * 0.045, 0.9, ease.expo); return { opacity: a, transform: `translateY(${lerp(40, 0, a)}px) scale(${lerp(1.8, 1, a)})`, filter: blur(22 * (1 - a)), backgroundPosition: sweep(pr(t, 18.0 + i * 0.05, 1.0, ease.io2)) }; }} />
            </span>
          </div>
          <div className="mask" style={{ marginTop: 4 }}>
            <span className="line" style={{ display: "block" }}>
              <span className="s4-amp" style={{ opacity: clamp(amp * 2), transform: `translateY(${bob}px) rotate(${-35 * (1 - amp)}deg) scale(${lerp(2.6, 1, amp)})`, filter: blur(18 * (1 - clamp(amp))) }}>&amp;</span>
              <span className="s4-v"><Chars text="VIE" cls="shine-t" fn={(i) => { const a = pr(t, 17.45 + i * 0.07, 0.8, ease.expo); return { opacity: a, transform: `translateY(${160 * (1 - a)}px)`, filter: blur(16 * (1 - a)), backgroundPosition: sweep(pr(t, 18.15 + i * 0.05, 1.0, ease.io2)) }; }} /></span>
            </span>
          </div>
        </div>
      </Cam>
    </div>
  );
};

/* ====================================================================== SCÈNE 5 — SIGNATURE FINALE (20 → 24 s) */
const s5op = (t: number) => pr(t, 19.85, 0.45, ease.o2);

function glow(t: number) {
  if (t < 22.5) {
    if (t < 21.2) return { o: tw(t, 0, 0.7, 20.4, 0.8, ease.expo), s: tw(t, 0.5, 1.1, 20.4, 0.8, ease.expo) };
    return { o: tw(t, 0.7, 0.22, 21.2, 1.0, ease.o2), s: tw(t, 1.1, 1.0, 21.2, 1.0, ease.o2) };
  }
  if (t < 23.4) return { o: tw(t, 0.22, 0.62, 22.5, 0.9, ease.o2), s: tw(t, 1.0, 1.7, 22.5, 0.9, ease.o2) };
  return { o: tw(t, 0.62, 0, 23.4, 0.9, ease.i2), s: tw(t, 1.7, 2.1, 23.4, 0.9, ease.i2) };
}

export const S5Bg: React.FC = () => {
  const t = useT();
  const g = glow(t);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: s5op(t) }}>
      <div className="s5-base" />
      <div className="s5-rays" style={{ opacity: pr(t, 20.0, 4.0), transform: `rotate(${tw(t, -14, 16, 20.0, 4.0)}deg)` }} />
      <div className="glow5" style={{ opacity: g.o, transform: `scale(${g.s})` }} />
    </div>
  );
};

export const S5Fg: React.FC = () => {
  const t = useT();
  const lg = sp(t, 20.4, { damping: 11, stiffness: 85, mass: 1 });
  const float = tw(t, 0, -10, 21.4, 3.0, ease.sine);
  const ex = pr(t, 23.2, 0.8, ease.i2), exo = pr(t, 23.35, 0.55, ease.i2);
  const ring = pr(t, 20.4, 1.2, ease.expo);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: s5op(t) }}>
      <div className="fill" style={{ opacity: 1 - exo, transform: `translateY(${-34 * ex}px) scale(${1 + 0.04 * ex})` }}>
        <svg className="ring5" viewBox="0 0 660 660" width={660} height={660} style={{ opacity: t < 20.4 ? 0 : 1, transform: `scale(${lerp(0.8, 1, ring)})` }}>
          <circle cx={330} cy={330} r={316} fill="none" stroke="url(#gGold)" strokeWidth={4} pathLength={1000} strokeDasharray={1000} strokeDashoffset={1000 * (1 - pr(t, 20.45, 1.3, ease.o3))} transform="rotate(-90 330 330)" />
        </svg>
        <div className="logo-wrap" style={{ opacity: clamp(lg * 1.6), transform: `translateY(${float}px) scale(${lerp(0.55, 1, lg)})`, filter: blur(22 * (1 - clamp(lg))) }}>
          <img src={staticFile("logo-nature-et-vie.png")} alt="Nature et Vie" />
        </div>
        <div className="stack" style={{ top: 1130, bottom: "auto", height: 0 }}><div className="rule" style={{ marginTop: 0, width: tw(t, 0, 640, 21.55, 0.8, ease.expo) }} /></div>
        <div className="tag-wrap">
          <div className="mask"><span className="tag" style={{ display: "block" }}><Chars text="VIVRE MIEUX," cls="gold-t" fn={(i) => { const a = pr(t, 21.8 + i * 0.03, 0.85, ease.expo); return { opacity: a, transform: `translateY(${110 * (1 - a)}px)`, filter: blur(14 * (1 - a)), backgroundPosition: sweep(pr(t, 22.2 + i * 0.03, 1.4, ease.io2)) }; }} /></span></div>
          <div className="mask"><span className="tag" style={{ display: "block", color: "#fff" }}><Chars text="NATURELLEMENT." fn={(i) => { const a = pr(t, 22.0 + i * 0.026, 0.85, ease.expo); return { opacity: a, transform: `translateY(${110 * (1 - a)}px)`, filter: blur(14 * (1 - a)) }; }} /></span></div>
        </div>
      </div>
    </div>
  );
};
