// motion-director for an EXISTING Remotion project (the fallback renderer).
// Copy this file and beats.json (sound/beats.json from the project) into the
// Remotion project's src/. Same rules as md.js: beat times by index, every
// line has an entrance AND an exit, safe box per format, nothing random.
import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import G from "./beats.json";

const spb = 60 / G.bpm;
export const B = (n: number) => n * spb;
export const bar = (n: number) => B(n * G.beatsPerBar);
export const t = (spec: string | number): number => {
  if (typeof spec === "number") return spec;
  const s = spec.replace(/\s+/g, "");
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  const m = s.match(/^(.+?)([+-]\d+(?:\.\d+)?)?$/)!;
  const off = m[2] ? parseFloat(m[2]) : 0;
  const h = m[1];
  if (/^B\d/.test(h)) return B(parseFloat(h.slice(1))) + off;
  if (/^bar\d/.test(h)) return bar(parseFloat(h.slice(3))) + off;
  const cues = G.cues as Record<string, number>;
  if (h in cues) return cues[h] + off;
  throw new Error(`motion-director: cannot read time "${spec}"`);
};

/** The safe box for this composition's format, in px. */
export const useSafe = () => {
  const {width: W, height: H} = useVideoConfig();
  const f = W > H ? {l: 0.06, r: 0.06, t: 0.08, b: 0.1} : W < H ? {l: 0.07, r: 0.15, t: 168 / 1920 + 0.02, b: 1 - 1330 / 1920} : {l: 0.07, r: 0.07, t: 0.07, b: 0.09};
  return {l: Math.round(W * f.l), r: Math.round(W * (1 - f.r)), t: Math.round(H * f.t), b: Math.round(H * (1 - f.b)), W, H};
};

/** Reserve the furniture's band first, then fit the picture into what is left. */
export const fitBox = (ar: number, box: {x: number; y: number; w: number; h: number}, reserve = 0) => {
  const h = Math.min(box.h - reserve, Math.round(box.w / ar));
  const w = Math.min(box.w, Math.round(h * ar));
  return {x: box.x + Math.round((box.w - w) / 2), y: box.y, w, h, below: box.y + h};
};

const out = Easing.bezier(0.16, 1, 0.3, 1);
const inn = Easing.bezier(0.55, 0, 0.75, 0.2);
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

/**
 * A text line with a deliberate entrance and exit. Throws without both, like md.js.
 *   <Line enter="words@B4" exit="blur@B12" style={...}>Real words</Line>
 */
export const Line: React.FC<{enter: string; exit: string; style?: React.CSSProperties; children: string}> = ({enter, exit, style, children}) => {
  const {fps} = useVideoConfig();
  const s = useCurrentFrame() / fps;
  if (!enter || !exit) throw new Error(`motion-director: line "${children}" needs enter AND exit`);
  const [ik, ia] = enter.split("@");
  const [ok, oa] = exit.split("@");
  const a = t(ia), b = ok === "end" ? Infinity : t(oa);
  const leave = ok === "end" ? 0 : interpolate(s, [b, b + 0.2], [0, 1], {...clamp, easing: inn});
  const words = children.split(" ");
  return (
    <div style={{...style, opacity: 1 - leave, filter: leave ? `blur(${leave * 8}px)` : undefined}}>
      {ik === "words"
        ? words.map((w, i) => {
            const p = interpolate(s, [a + i * 0.067, a + i * 0.067 + 0.16], [0, 1], {...clamp, easing: out});
            return <span key={i} style={{display: "inline-block", opacity: p, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined, marginRight: "0.26em"}}>{w}</span>;
          })
        : (() => {
            const p = interpolate(s, [a, a + (ik === "scale" ? 0.5 : 0.2)], [0, 1], {...clamp, easing: out});
            return <span style={{display: "inline-block", opacity: p, transform: ik === "scale" ? `scale(${1.18 - 0.18 * p})` : undefined, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined}}>{children}</span>;
          })()}
    </div>
  );
};

export const Scene: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg}) => (
  // an OPAQUE scene never fades its root: there is nothing under it, so a fade
  // renders as a fade to black. Let the cut be the transition.
  <AbsoluteFill style={{background: bg}}>{children}</AbsoluteFill>
);
