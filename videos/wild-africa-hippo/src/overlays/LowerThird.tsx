import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { BAR, C, mono } from "../theme";

export const LowerThird: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [18, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(f, [dur - 20, dur - 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 120, bottom: BAR + 56, opacity: out, display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 4, height: 44, background: C.amber, transform: `scaleY(${inP})` }} />
      <div style={{ overflow: "hidden" }}>
        <div style={{
          fontFamily: mono, fontSize: 26, color: C.paper, letterSpacing: 3, textTransform: "uppercase",
          transform: `translateX(${(1 - inP) * -105}%)`, textShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}>
          {text}
        </div>
      </div>
    </div>
  );
};

export const PhotoCredit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: "absolute", right: 36, top: BAR + 18, fontFamily: mono, fontSize: 15, color: "rgba(236,230,218,0.62)",
    letterSpacing: 0.5, textShadow: "0 1px 6px rgba(0,0,0,0.9)", maxWidth: 900, textAlign: "right",
  }}>
    {text}
  </div>
);
