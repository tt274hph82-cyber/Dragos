import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BAR, C, sans } from "../theme";

/** Split narration into short caption chunks, timed by character count. */
export function chunk(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["”’]?|[^.!?]+$/g)?.map((s) => s.trim()) ?? [text];
  const out: string[] = [];
  for (const s of sentences) {
    if (s.length <= 74) { out.push(s); continue; }
    let cur = "";
    for (const part of s.split(/(?<=,)\s+/)) {
      if ((cur + " " + part).trim().length > 74 && cur) { out.push(cur.trim()); cur = part; }
      else cur = (cur + " " + part).trim();
    }
    if (cur) out.push(cur.trim());
  }
  // merge very short trailing pieces
  return out.reduce<string[]>((acc, p) => {
    if (acc.length && (p.length < 14 || acc[acc.length - 1].length < 14) && (acc[acc.length - 1] + " " + p).length <= 80)
      acc[acc.length - 1] += " " + p;
    else acc.push(p);
    return acc;
  }, []);
}

export const Subtitle: React.FC<{ text: string; start: number; frames: number }> = ({ text, start, frames }) => {
  const f = useCurrentFrame() - start;
  if (!text || f < 0 || f > frames + 6) return null;
  const parts = chunk(text);
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = 0;
  let idx = parts.length - 1;
  for (let i = 0; i < parts.length; i++) {
    acc += parts[i].length;
    if (f < (acc / total) * frames) { idx = i; break; }
  }
  const op = interpolate(f, [0, 6, frames, frames + 6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: BAR, display: "flex",
        alignItems: "center", justifyContent: "center", opacity: op,
      }}
    >
      <div style={{ fontFamily: sans, fontWeight: 400, fontSize: 31, color: C.paper, letterSpacing: 0.2, textAlign: "center", maxWidth: 1500, lineHeight: 1.25 }}>
        {parts[idx]}
      </div>
    </div>
  );
};
