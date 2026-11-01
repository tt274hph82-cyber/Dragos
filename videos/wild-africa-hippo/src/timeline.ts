import segmentsJson from "./segments.json";
import narration from "./narration.json";
import { FPS } from "./theme";

export type Visual = { type: string; [k: string]: any };
export type Segment = { id: string; text: string; say?: string; pause?: number; fixed?: number; v: Visual };

export const LEAD = 0.35; // silence before narration starts in a segment
export const XFADE = 14; // crossfade frames between segments

const segments = segmentsJson as Segment[];
const nar = narration as Record<string, number>;

export type Timed = Segment & { from: number; dur: number; audio: number | null };

export const timeline: Timed[] = (() => {
  let t = 0;
  return segments.map((s) => {
    const audio = nar[s.id] ?? null;
    const secs = s.fixed ?? LEAD + (audio ?? 0) + (s.pause ?? 0.55);
    const dur = Math.round(secs * FPS);
    const item = { ...s, from: t, dur, audio };
    t += dur;
    return item;
  });
})();

export const TOTAL = timeline.reduce((a, s) => a + s.dur, 0);
