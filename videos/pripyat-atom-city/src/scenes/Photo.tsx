import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import credits from "../credits.json";
import { LowerThird, PhotoCredit } from "../overlays/LowerThird";

type Credit = { key: string; artist: string; license: string };
const creditMap = Object.fromEntries((credits as Credit[]).map((c) => [c.key, c]));

const tones: Record<string, string> = {
  normal: "saturate(0.72) contrast(1.08) brightness(0.92)",
  warm: "sepia(0.35) saturate(0.85) contrast(1.05) brightness(0.95)",
  cold: "saturate(0.35) contrast(1.12) brightness(0.82)",
};

export const Photo: React.FC<{ img: string; move?: string; tone?: string; tag?: string; dur: number }> = ({ img, move = "in", tone = "normal", tag, dur }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  let scale = 1.1, x = 0, y = 0;
  if (move === "in") scale = 1.06 + 0.12 * p;
  if (move === "out") scale = 1.2 - 0.12 * p;
  if (move === "left") { scale = 1.16; x = 3 - 6 * p; }
  if (move === "right") { scale = 1.16; x = -3 + 6 * p; }
  if (move === "up") { scale = 1.16; y = 3 - 6 * p; }
  const c = creditMap[img];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img
        src={staticFile(`photos/${img}.jpg`)}
        style={{
          width: "100%", height: "100%", objectFit: "cover", filter: tones[tone] ?? tones.normal,
          transform: `scale(${scale}) translate(${x}%, ${y}%)`,
        }}
      />
      {tone === "cold" && <AbsoluteFill style={{ background: "rgba(30,50,70,0.22)", mixBlendMode: "multiply" }} />}
      {tone !== "cold" && <AbsoluteFill style={{ background: "rgba(60,40,10,0.12)", mixBlendMode: "multiply" }} />}
      {tag && <LowerThird text={tag} dur={dur} />}
      {c && <PhotoCredit text={`Photo: ${c.artist.slice(0, 60)} · ${c.license}`} />}
    </AbsoluteFill>
  );
};
