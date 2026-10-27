import React from "react";
import { AbsoluteFill, useCurrentFrame, random } from "remotion";
import { BAR } from "../theme";

/** Film grain, vignette, gentle flicker and letterbox bars. */
export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2);
  const flicker = 0.035 + random(`fl${seed}`) * 0.03;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.72) 100%)" }}
      />
      <AbsoluteFill style={{ background: "#000", opacity: flicker }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.11, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: BAR, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BAR, background: "#000" }} />
    </AbsoluteFill>
  );
};
