import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@remotion/captions";

const FONT = "CaptionFont";
if (typeof document !== "undefined" && !document.getElementById("caption-font")) {
  const st = document.createElement("style");
  st.id = "caption-font";
  st.textContent = `@font-face { font-family: '${FONT}'; font-weight: 800; src: url('${staticFile("fonts/Poppins-800.woff2")}') format('woff2'); font-display: block; }`;
  document.head.appendChild(st);
  const h = delayRender("Loading caption font");
  document.fonts.load(`800 40px '${FONT}'`).then(() => continueRender(h), () => continueRender(h));
}

/**
 * One word at a time, bold white with a thick black outline (explainer-cartoon style).
 * Reads public/captions.json in Remotion's Caption format.
 */
export const Captions: React.FC<{ file?: string }> = ({ file = "captions.json" }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    fetch(staticFile(file)).then((r) => r.json())
      .then((c: Caption[]) => { setCaptions(c); continueRender(handle); })
      .catch(() => { setCaptions([]); continueRender(handle); });
  }, [file, handle]);

  if (!captions) return null;
  const ms = (frame / fps) * 1000;
  const word = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!word) return null;
  const pop = spring({ frame: frame - Math.round((word.startMs / 1000) * fps), fps, config: { damping: 11, stiffness: 220 } });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
      <div style={{
        fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, fontSize: 88, color: "#ffffff",
        WebkitTextStroke: "14px #111", paintOrder: "stroke fill", letterSpacing: 1,
        transform: `scale(${0.7 + 0.3 * pop})`,
      }}>
        {word.text}
      </div>
    </AbsoluteFill>
  );
};
