import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, mono, sans } from "./theme";

// 1280×720 YouTube thumbnail. Variant A: "BUILT FOR A REACTOR", B: "EMPTIED IN 36 HOURS".
export const Thumbnail: React.FC<{ variant: "A" | "B" }> = ({ variant }) => {
  const lines = variant === "A" ? ["BUILT FOR", "A REACTOR"] : ["EMPTIED IN", "36 HOURS"];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img
        src={staticFile(variant === "A" ? "photos/ferris1.jpg" : "photos/ghosttown.jpg")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.55) contrast(1.25) brightness(0.8)", transform: "scale(1.12) translateX(-14%)" }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0) 22%, rgba(5,6,8,0.85) 52%, rgba(5,6,8,0.97) 70%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 25% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} />

      {/* inset: the plant, 3 km away */}
      <div style={{ position: "absolute", left: 48, bottom: 48, width: 330, height: 200, border: `6px solid ${C.red}`, transform: "rotate(-3deg)", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", overflow: "hidden" }}>
        <Img src={staticFile("photos/reactor4.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.6) contrast(1.15)" }} />
        <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, background: C.red, color: "#fff", fontFamily: sans, fontWeight: 600, fontSize: 30, padding: "4px 12px", letterSpacing: 1 }}>
          {variant === "A" ? "3 KM AWAY" : "26.04.1986"}
        </div>
      </div>

      <div style={{ position: "absolute", right: 56, top: 0, bottom: 0, width: 640, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", textAlign: "right" }}>
        <div style={{ fontFamily: mono, fontWeight: 500, fontSize: 30, letterSpacing: 8, color: C.amber, marginBottom: 14 }}>PRIPYAT · USSR</div>
        {lines.map((l, i) => (
          <div key={l} style={{
            fontFamily: sans, fontWeight: 600, fontSize: 112, lineHeight: 0.98, letterSpacing: -2,
            color: i === 1 ? C.amber : "#fff", textShadow: "0 6px 24px rgba(0,0,0,0.85)",
          }}>{l}</div>
        ))}
        <div style={{ width: 220, height: 8, background: C.red, marginTop: 26 }} />
      </div>
    </AbsoluteFill>
  );
};
