import React from 'react';
import { clamp, lerp } from './molasses/kit';

// The animated-shorts-kit camera grammar for 2D story Shorts, shared by every episode that uses it (first used in
// exploding-whale): one camera per take that travels between subjects. A key is [word | null, x, y, zoom, frames?]:
// the camera arrives at (x, y) at that zoom as the word starts (the first time it is said in the take), easing in fast
// and settling slowly (velocity peak ~40 %); between moves it creeps in and drifts so it is never still. No motion blur
// (the user asked for sharp subjects during moves). Overlays (titles, stamps) are drawn in screen space over the take.
export type CamKey = [string | null, number, number, number, number?, string?];
type Word = { w: string; s: number };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const ease = (u: number) => { u = clamp(u); const v = Math.pow(u, 0.82); return v * v * v * (v * (v * 6 - 15) + 10); };

export const makeKitCam = (words: Word[], takes: Record<string, CamKey[]>) => {
  const WF = words.map((w) => ({ n: norm(w.w), f: Math.round(w.s * 30) }));
  /** frame of the first time `word` is said at or after frame a */
  const wordAt = (word: string, a: number) => { const n = norm(word); const h = WF.find((w) => w.n === n && w.f >= a - 3); return h ? h.f : a; };
  const camAt = (id: string, f: number, t: number) => {
    const keys = takes[id], a = f - t, arr = keys.map((k) => (k[0] ? wordAt(k[0], a) : -1e9));
    let i = 0; while (i + 1 < keys.length && f >= arr[i + 1] - (keys[i + 1][4] ?? 22)) i++;
    const k = keys[i];
    if (i > 0) {
      const p = keys[i - 1], dd = k[4] ?? 22, u = (f - (arr[i] - dd)) / dd;
      if (u < 1) { const e = ease(u); return { x: lerp(p[1], k[1], e), y: lerp(p[2], k[2], e), z: Math.exp(lerp(Math.log(p[3]), Math.log(k[3]), e)) }; }
    }
    const since = Math.max(0, f - (i > 0 ? arr[i] : a));
    return { x: k[1] + Math.sin((since + i * 40) * 0.02) * 10, y: k[2] + Math.sin((since + i * 30) * 0.015) * 6, z: k[3] * (1 + Math.min(0.09, since * 0.0016)) };
  };
  const Take: React.FC<{ id: string; f: number; t: number; children: React.ReactNode; over?: React.ReactNode }> = ({ id, f, t, children, over }) => {
    const c = camAt(id, f, t);
    return <g><g transform={`translate(540 960) scale(${c.z}) translate(${-c.x} ${-c.y})`}>{children}</g>{over}</g>;
  };
  /** frames since `word` was said in this take (negative before) */
  const w = (f: number, t: number, word: string, off = 0) => f - wordAt(word, f - t) - off;
  return { Take, w, wordAt };
};
