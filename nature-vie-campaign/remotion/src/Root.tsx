import React, { useEffect, useState } from "react";
import { Composition, continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Main } from "./Main";

const fonts = () => Promise.all([
  loadFont({ family: "NV Bebas", url: staticFile("fonts/bebas-neue-latin-400-normal.woff2"), weight: "400" }),
  loadFont({ family: "NV Mont", url: staticFile("fonts/montserrat-latin-500-normal.woff2"), weight: "500" }),
  loadFont({ family: "NV Mont", url: staticFile("fonts/montserrat-latin-600-normal.woff2"), weight: "600" }),
  loadFont({ family: "NV Mont", url: staticFile("fonts/montserrat-latin-700-normal.woff2"), weight: "700" }),
  loadFont({ family: "NV Serif", url: staticFile("fonts/cormorant-garamond-latin-600-italic.woff2"), weight: "600", style: "italic" }),
]);

export const RemotionRoot: React.FC = () => {
  const [handle] = useState(() => delayRender("polices"));
  useEffect(() => { fonts().then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); }); }, [handle]);
  return <Composition id="NatureVie" component={Main} durationInFrames={720} fps={30} width={1080} height={1920} />;
};
