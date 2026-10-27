import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import "./style.css";
import { Defs, FPS, H, NV, TimeCtx, W, ease, pr } from "./lib";
import { S1Bg, S1Fg, S2Bg, S2Fg } from "./S1S2";
import { S3Bg, S3Fg } from "./S3";
import { S4Bg, S4Fg, S5Bg, S5Fg } from "./S4S5";

/** Canvas FX partagé (fx.js) : mêmes particules / anneaux / grain que la version HyperFrames. */
const FxCanvas: React.FC<{ kind: "back" | "front"; z: number }> = ({ kind, z }) => {
  const t = useCurrentFrame() / FPS;
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!.getContext("2d")!;
    if (kind === "back") NV().drawBack(c, t);
    else { c.clearRect(0, 0, W, H); NV().drawFront(c, t); }
  });
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, width: W, height: H, zIndex: z }} />;
};

const S = (from: number, to: number, name: string, el: React.ReactNode) => (
  <Sequence from={Math.round(from * FPS)} durationInFrames={Math.round((to - from) * FPS)} name={name} layout="none">{el}</Sequence>
);

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <TimeCtx.Provider value={t}>
      <AbsoluteFill className="nv-root">
        <Defs />
        <Audio src={staticFile("soundtrack-master.wav")} />
        {/* couche 1 : décors */}
        <AbsoluteFill style={{ zIndex: 1 }}>
          {S(0, 5.1, "S1 · décor", <S1Bg />)}
          {S(3.9, 9.3, "S2 · décor", <S2Bg />)}
          {S(8.9, 15.4, "S3 · décors", <S3Bg />)}
          {S(14.9, 20.35, "S4 · décor", <S4Bg />)}
          {S(19.85, 24, "S5 · décor", <S5Bg />)}
        </AbsoluteFill>
        <FxCanvas kind="back" z={2} />
        {/* couche 3 : typographie */}
        <AbsoluteFill style={{ zIndex: 3 }}>
          {S(0, 4.1, "S1 · texte", <S1Fg />)}
          {S(3.9, 9.3, "S2 · texte", <S2Fg />)}
          {S(8.9, 15.4, "S3 · texte", <S3Fg />)}
          {S(14.9, 20.35, "S4 · texte", <S4Fg />)}
          {S(19.85, 24, "S5 · signature", <S5Fg />)}
        </AbsoluteFill>
        <FxCanvas kind="front" z={4} />
        <AbsoluteFill style={{ background: "#000", opacity: pr(t, 23.4, 0.6, ease.i2), zIndex: 9 }} />
      </AbsoluteFill>
    </TimeCtx.Provider>
  );
};
