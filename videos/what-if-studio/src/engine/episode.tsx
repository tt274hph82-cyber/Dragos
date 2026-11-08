import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp, lerp, easeInOut, easeOut, easeIn } from './anim';
import { KitDefs } from './kit';
import { SetDefs } from './light';

// The episode engine. An episode is a set of shots plus a timeline (written by scripts/plan.py from the voice's word
// timings). Each shot is a pure function of its own clock t, so the edit can cut back to a shot, hold it, or play it
// backwards: a segment just says which stretch of the shot's clock it shows.

export type Seg = {
  shot: string; // shot id (S1, S2...)
  a: number; // first global frame
  b: number; // first frame after it
  t0: number; // the shot's clock at a
  t1: number; // the shot's clock at b (smaller than t0 when the segment plays backwards)
  look?: string; // a named power look (rewind, freeze...) the episode defines: grade + overlay while it runs
  line?: string; // the words spoken over it (for the storyboard)
  cam?: string; // story Reels: the camera move (push, dive, pull, panL, panR, rise, static)
  tr?: string; // story Reels: the transition into this segment (cut, dissolve, ghost, zoom, flash, whip)
};
export type ShotInfo = { id: string; size: string; key: number; len: number; first: number; line?: string; note?: string };
export type Fx = { f: number; kind: 'flash' | 'shake' | 'punch' | 'bloom' | 'rewind' | 'iris'; x?: number; y?: number; r?: number; color?: string; o?: number; len?: number; amp?: number };
export type Timeline = {
  slug: string;
  title: string;
  fps: number;
  total: number;
  segments: Seg[];
  shots: ShotInfo[];
  fx: Fx[];
  audio: { voice?: string; sfx?: string; music?: string; voiceVol?: number; sfxVol?: number; musicVol?: number };
};

/** What every shot receives: its own clock t, how long its clock runs (len), and the global frame f. */
export type ShotProps = { t: number; len: number; f: number };
export type ShotMap = Record<string, React.FC<ShotProps>>;

/** A power look: a CSS grade on the picture and an overlay on top while segments with this look run. */
export type LookDef = {
  grade?: (lv: number) => string;
  jitter?: number; // sideways picture jitter in px at full strength
  Overlay?: React.FC<{ f: number; lv: number; p: number; n: number; w?: number; h?: number }>; // p: progress through this run, n: which run (0, 1, 2...); w, h: the frame (1080 x 1920 when vertical)
};

const segAt = (tl: Timeline, f: number) => tl.segments.find((s) => f >= s.a && f < s.b) ?? tl.segments[tl.segments.length - 1];
const clockAt = (s: Seg, f: number) => (s.t1 - s.t0 === s.b - s.a ? s.t0 + (f - s.a) : lerp(s.t0, s.t1, (f - s.a) / (s.b - s.a)));

/** Runs of neighbouring segments sharing a look, so a look spanning two shots doesn't blink at the cut. */
const lookRuns = (tl: Timeline) => {
  const runs: { look: string; a: number; b: number; n: number }[] = [];
  const count: Record<string, number> = {};
  for (const s of tl.segments) {
    if (!s.look) continue;
    const last = runs[runs.length - 1];
    if (last && last.look === s.look && last.b === s.a) last.b = s.b;
    else {
      runs.push({ look: s.look, a: s.a, b: s.b, n: count[s.look] ?? 0 });
      count[s.look] = (count[s.look] ?? 0) + 1;
    }
  }
  return runs;
};

const fxAt = (tl: Timeline, f: number) => {
  let flash: { color: string; o: number } | null = null;
  let x = 0;
  let y = 0;
  for (const e of tl.fx) {
    if (e.kind === 'flash') {
      if (f === e.f) flash = { color: e.color ?? '#FFFFFF', o: e.o ?? 0.85 };
      else if (f === e.f + 1) flash = { color: e.color ?? '#FFFFFF', o: (e.o ?? 0.85) * 0.35 };
    } else if (e.kind === 'shake') {
      const len = e.len ?? 8;
      const amp = e.amp ?? 12;
      if (f >= e.f && f < e.f + len) {
        const k = amp * (1 - (f - e.f) / len);
        x += Math.sin(f * 2.9) * k;
        y += Math.cos(f * 3.7) * k * 0.7;
      }
    }
  }
  return { flash, x, y };
};


/**
 * The virtual camera operator, applied on top of every shot (shots keep their own camera moves inside):
 * - a slow push in or pull out on every shot, alternating cut to cut, with a little sideways drift on wides;
 * - a light handheld sway (not on schematic cards and titles);
 * - a whip-pan into every third cut (a fast slide with motion blur);
 * - a punch-in when a power look starts (the frame snaps in, then settles).
 */
const cameraAt = (tl: Timeline, f: number, scale: number) => {
  const i = tl.segments.findIndex((s) => f >= s.a && f < s.b);
  const idx = i < 0 ? tl.segments.length - 1 : i;
  const seg = tl.segments[idx];
  const len = Math.max(1, seg.b - seg.a);
  const k = clamp((f - seg.a) / len);
  const ease = k * k * (3 - 2 * k);
  const size = (tl.shots.find((s) => s.id === seg.shot)?.size ?? '').toLowerCase();
  const steady = /schematic|card|title/.test(size);
  const close = /close|ecu|insert|macro/.test(size);
  const wide = /wide|two-shot|over the shoulder|ots/.test(size);
  // push in / pull out
  const amt = close ? 0.06 : wide ? 0.035 : 0.045;
  let s = 1.03 + (idx % 2 === 0 ? amt * ease : amt * (1 - ease));
  let tx = wide ? ((idx % 3) - 1) * 26 * (ease - 0.5) * scale : 0;
  let ty = close ? -8 * ease * scale : 0;
  // handheld: two slow sines, never on cards
  const hh = steady ? 0 : close ? 1.4 : 1;
  tx += hh * (Math.sin(f * 0.11) * 3.2 + Math.sin(f * 0.043 + 1.7) * 4.5) * scale;
  ty += hh * (Math.cos(f * 0.09) * 2.4 + Math.sin(f * 0.031) * 3.2) * scale;
  let r = hh * Math.sin(f * 0.037 + 0.6) * 0.22;
  // whip-pan into every third cut, alternating direction
  let blur = 0;
  const into = f - seg.a;
  if (idx > 0 && idx % 3 === 0 && len >= 24 && !steady && into < 6) {
    const w = 1 - into / 6;
    tx += (idx % 2 ? 1 : -1) * 130 * w * w * scale; // the extra zoom below keeps the frame edges covered
    blur = 14 * w;
    s += 0.14 * w;
  }
  // punch-in when a power look starts
  const prev = tl.segments[idx - 1];
  if (seg.look && (!prev || prev.look !== seg.look) && into < 8) {
    const w = 1 - into / 8;
    s += 0.09 * w * w;
    r += 0.6 * w * (idx % 2 ? 1 : -1);
  }
  return { tx, ty, s, r, blur };
};

/** Vignette and a fine grain that changes on twos, to take the vector edge off (the genre's finish). */
const Grade: React.FC<{ f: number; grain: boolean; vignette: boolean; w?: number; h?: number }> = ({ f, grain, vignette, w = 1920, h = 1080 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <defs>
      <radialGradient id="epVig" cx="50%" cy="50%" r="75%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
      </radialGradient>
      <filter id="epGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2) % 97} />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
      </filter>
    </defs>
    {vignette ? <rect width={w} height={h} fill="url(#epVig)" /> : null}
    {grain ? <rect width={w} height={h} filter="url(#epGrain)" /> : null}
  </svg>
);

/** One shot drawn in the shared defs (filters, gradients), in a 1920 x 1080 world. */
export const ShotFrame: React.FC<{ children: React.ReactNode; w?: number; h?: number; viewBox?: string }> = ({ children, w = 1920, h = 1080, viewBox = '0 0 1920 1080' }) => (
  <svg width={w} height={h} viewBox={viewBox} preserveAspectRatio="xMidYMid slice">
    <KitDefs />
    <SetDefs />
    {children}
  </svg>
);

/**
 * Vertical (9:16) framing: for each shot, the x (in the 1920-wide frame) the tall 608 x 1080 window centres on.
 * A pair [from, to] pans across the shot. Shots read `useContext(VerticalCtx)` to swap in tall layouts (titles, cards).
 */
export type VerticalFraming = Record<string, number | [number, number]>;
export const VerticalCtx = React.createContext(false);
export type EpisodeProps = { timeline: Timeline; shots: ShotMap; looks?: Record<string, LookDef>; grain?: boolean; vignette?: boolean; bg?: string; vertical?: VerticalFraming; camera?: boolean };

export const Episode: React.FC<EpisodeProps & { vert?: boolean }> = ({ timeline: tl, shots, looks = {}, grain = true, vignette = true, bg = '#0E0C1E', vertical, vert = false, camera = true }) => {
  const f = useCurrentFrame();
  const seg = segAt(tl, f);
  const Shot = shots[seg.shot];
  const info = tl.shots.find((s) => s.id === seg.shot);
  const run = lookRuns(tl).find((r) => f >= r.a && f < r.b);
  const def = run ? looks[run.look] : undefined;
  const lv = run ? Math.min(clamp((f - run.a + 1) / 2), clamp((run.b - f) / 2)) : 0;
  const jitter = def?.jitter && lv > 0 ? Math.sin(f * 13.7) * def.jitter * lv : 0;
  const { flash, x, y } = fxAt(tl, f);
  const A = tl.audio;
  const cam = camera ? cameraAt(tl, f, vert ? 0.75 : 1) : { tx: 0, ty: 0, s: 1, r: 0, blur: 0 };
  // the 9:16 crop is only 607 px of the 1920 frame: halve the operator's zoom there so nothing is pushed off the sides
  if (vert) cam.s = 1 + (cam.s - 1) * 0.5;
  const W = vert ? 1080 : 1920;
  const H = vert ? 1920 : 1080;
  let viewBox = '0 0 1920 1080';
  if (vert) {
    const len = info?.len ?? seg.b - seg.a;
    const fr = vertical?.[seg.shot] ?? 960;
    const k = clamp(clockAt(seg, f) / Math.max(1, len));
    const cx = Array.isArray(fr) ? fr[0] + (fr[1] - fr[0]) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) : fr;
    const cw = (1080 * 1080) / 1920;
    viewBox = `${Math.max(0, Math.min(1920 - cw, cx - cw / 2))} 0 ${cw} 1080`;
  }
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill style={{
        transform: `translate(${x + jitter + cam.tx}px, ${y + cam.ty}px) rotate(${cam.r}deg) scale(${cam.s * (x || y ? 1.02 : 1)})`,
        filter: [def?.grade && lv > 0 ? def.grade(lv) : '', cam.blur > 0.3 ? `blur(${cam.blur.toFixed(1)}px)` : ''].join(' ').trim() || undefined,
      }}>
        <VerticalCtx.Provider value={vert}>
          <ShotFrame w={W} h={H} viewBox={viewBox}>{Shot ? <Shot t={clockAt(seg, f)} len={info?.len ?? seg.b - seg.a} f={f} /> : null}</ShotFrame>
        </VerticalCtx.Provider>
      </AbsoluteFill>
      <Grade f={f} grain={grain} vignette={vignette} w={W} h={H} />
      {def?.Overlay && run ? (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, opacity: lv }}>
          <def.Overlay f={f} lv={lv} p={clamp((f - run.a) / (run.b - run.a))} n={run.n} w={W} h={H} />
        </svg>
      ) : null}
      {flash ? <AbsoluteFill style={{ backgroundColor: flash.color, opacity: flash.o }} /> : null}
      {A.voice ? <Audio src={staticFile(A.voice)} volume={A.voiceVol ?? 1} /> : null}
      {A.sfx ? <Audio src={staticFile(A.sfx)} volume={A.sfxVol ?? 1} /> : null}
      {A.music ? <Audio src={staticFile(A.music)} volume={A.musicVol ?? 1} /> : null}
    </AbsoluteFill>
  );
};

/** The storyboard: frame i is shot i at its key frame, no audio, no look. Render it with scripts/stills.mjs. */
export const Board: React.FC<{ timeline: Timeline; shots: ShotMap; grain?: boolean; vignette?: boolean; bg?: string }> = ({ timeline: tl, shots, grain = true, vignette = true, bg = '#0E0C1E' }) => {
  const f = useCurrentFrame();
  const info = tl.shots[Math.min(f, tl.shots.length - 1)];
  const Shot = shots[info.id];
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <ShotFrame>{Shot ? <Shot t={info.key} len={info.len} f={info.first + info.key} /> : null}</ShotFrame>
      <Grade f={info.key} grain={grain} vignette={vignette} />
    </AbsoluteFill>
  );
};

/** Bundle an episode for the registry: the main composition and its storyboard. */
export const defineEpisode = (id: string, p: EpisodeProps) => ({
  id,
  total: p.timeline.total,
  shotCount: p.timeline.shots.length,
  Main: () => <Episode {...p} />,
  Board: () => <Board timeline={p.timeline} shots={p.shots} grain={p.grain} vignette={p.vignette} bg={p.bg} />,
  Vertical: p.vertical ? () => <Episode {...p} vert /> : null,
});
export type EpisodeDef = ReturnType<typeof defineEpisode>;

// ============================================================================================ native 9:16 story Reels
// A story Reel is drawn natively in a 1080 x 1920 world (no crop of a 16:9 frame). Its grammar, measured frame by frame
// from the reference Reels (the Dancing Plague one most closely):
// - every shot moves: a camera move per segment (push, dive, pull, pan, rise), eased, alternating cut to cut;
// - cuts are transitions: a ghost dissolve with a forward push, a zoom-through with motion blur, a white flash between
//   scenes, a sideways whip, or a plain 4-frame dissolve;
// - hits: a punch zoom on key words, a bloom (glow burst and ring) on impacts, a shake, a flash;
// - karaoke captions, 2-3 words, uppercase, the spoken word in yellow, over a dark band at the bottom.
export type StoryWord = { w: string; s: number; e: number; p?: string };
export const STORY = { w: 1080, h: 1920, capY: 1200, capSize: 58, dissolve: 4 };
/** The frame a story is drawn in: 1080 x 1920 for Reels, 1920 x 1080 for long-form (defineStory `landscape`). */
export const DimCtx = React.createContext({ w: 1080, h: 1920 });
export type StoryCam = 'push' | 'dive' | 'pull' | 'panL' | 'panR' | 'rise' | 'static' | 'tiltDown' | 'zoomOut' | 'drift';
export type StoryTr = 'cut' | 'dissolve' | 'ghost' | 'zoom' | 'flash' | 'whip';
/** The automatic rotation when the edit doesn't name a move or a transition. */
const AUTO_CAM: StoryCam[] = ['push', 'panL', 'dive', 'pull', 'panR', 'push', 'rise'];
const SNAPPY_CAM: StoryCam[] = ['dive', 'panL', 'zoomOut', 'push', 'tiltDown', 'panR', 'dive', 'drift', 'rise'];
const AUTO_TR: StoryTr[] = ['ghost', 'dissolve', 'zoom', 'dissolve', 'ghost', 'whip', 'dissolve'];
const TR_LEN: Record<StoryTr, number> = { cut: 0, dissolve: 4, ghost: 7, zoom: 7, flash: 9, whip: 6 };

/** The camera on one segment at frame f: offset and scale around the frame centre. */
const camAt = (seg: Seg & { cam?: StoryCam }, idx: number, f: number, snappy = false) => {
  const cam = seg.cam ?? (snappy ? SNAPPY_CAM : AUTO_CAM)[idx % (snappy ? SNAPPY_CAM.length : AUTO_CAM.length)];
  const len = Math.max(1, seg.b - seg.a);
  const u = clamp((f - seg.a) / len, 0, 1.4);
  const e = u <= 1 ? easeInOut(u) : 1 + (u - 1) * 0.6;
  const sec = len / 30;
  const k = Math.min(1, sec / 2.2) * (snappy ? 1.7 : 1); // short shots move less, so nothing lurches; snappy moves more
  // snappy: every cut lands with a quick zoom settling in, and a slight tilt that alternates cut to cut
  const snap = snappy ? 1 + 0.12 * (1 - easeOut(clamp((f - seg.a) / 6))) : 1;
  const r = snappy && cam !== 'static' ? ((idx * 7) % 5 - 2) * 0.9 * (1 - 0.5 * e) : 0;
  let c: { s: number; x: number; y: number };
  switch (cam) {
    case 'dive': c = { s: 1 + 0.32 * k * e * e, x: 0, y: -50 * k * e }; break;
    case 'pull': c = { s: 1.2 - 0.16 * k * e, x: 0, y: 0 }; break;
    case 'zoomOut': c = { s: 1 + 0.3 * k * (1 - easeOut(u)), x: 0, y: 0 }; break;
    case 'panL': c = { s: 1.14 + 0.04 * k, x: 70 * k - 140 * k * e, y: 0 }; break;
    case 'panR': c = { s: 1.14 + 0.04 * k, x: -70 * k + 140 * k * e, y: 0 }; break;
    case 'rise': c = { s: 1.1 + 0.05 * k * e, x: 0, y: 60 * k - 120 * k * e }; break;
    case 'tiltDown': c = { s: 1.2 + 0.05 * k, x: 0, y: -110 * k + 220 * k * e }; break;
    case 'drift': c = { s: 1.1 + 0.06 * k * e, x: Math.sin(f * 0.07) * 30 * k, y: Math.cos(f * 0.05) * 20 * k }; break;
    case 'static': c = { s: 1.03, x: 0, y: 0 }; break;
    default: c = { s: 1 + 0.13 * k * e, x: 0, y: -12 * k * e };
  }
  return { s: c.s * snap, x: c.x, y: c.y, r };
};

const chunkWords = (words: StoryWord[]) => {
  const out: StoryWord[][] = [];
  let cur: StoryWord[] = [];
  for (const w of words) {
    cur.push(w);
    const long = cur.map((x) => x.w).join(' ').length > 16;
    if (cur.length >= 3 || long || /[.,!?:;]/.test(w.p ?? '')) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

/** Karaoke captions: the chunk being spoken, uppercase, the current word in yellow and a touch bigger. */
export const StoryCaptions: React.FC<{ words: StoryWord[]; fps: number }> = ({ words, fps }) => {
  const D = React.useContext(DimCtx);
  const f = useCurrentFrame();
  const t = f / fps;
  const chunks = React.useMemo(() => chunkWords(words), [words]);
  const i = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && (k === chunks.length - 1 ? t <= c[c.length - 1].e + 0.6 : t < chunks[k + 1][0].s - 0.05));
  if (i < 0) return null;
  const c = chunks[i];
  const pop = clamp((t - (c[0].s - 0.05)) * fps / 3);
  const z = STORY.capSize;
  return (
    <svg width={D.w} height={D.h} viewBox={`0 0 ${D.w} ${D.h}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g transform={`translate(${D.w / 2} ${D.h > D.w ? STORY.capY : 930}) scale(${0.9 + 0.1 * pop})`} opacity={0.4 + 0.6 * pop}>
        <text textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={z} letterSpacing={1.5}
          stroke="#120B18" strokeWidth={z * 0.2} strokeLinejoin="round" paintOrder="stroke" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))' }}>
          {c.map((w, k) => {
            const on = t >= w.s - 0.03 && (k === c.length - 1 || t < c[k + 1].s - 0.03);
            return <tspan key={k} fill={on ? '#FFD23F' : '#FFFFFF'} fontSize={on ? z * 1.08 : z}>{(k ? ' ' : '') + w.w.toUpperCase() + (w.p && /[!?]/.test(w.p) ? w.p.trim() : '')}</tspan>;
          })}
        </text>
      </g>
    </svg>
  );
};

/** Pop captions (the "What If" gaming Shorts): one word at a time (two when the first is tiny), big, bouncing in,
 *  white with a heavy outline, keywords in colour (`colors`: lower-case word -> colour). */
export const PopCaptions: React.FC<{ words: StoryWord[]; fps: number; colors?: Record<string, string>; y?: number; size?: number; font?: string }> = ({ words, fps, colors = {}, y: yIn, size: sizeIn, font = 'Bricolage Grotesque' }) => {
  const D = React.useContext(DimCtx);
  const land = D.w > D.h, y = yIn ?? (land ? 900 : 1230), size = sizeIn ?? (land ? 88 : 104);
  const f = useCurrentFrame();
  const t = f / fps;
  const groups = React.useMemo(() => {
    const out: StoryWord[][] = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i], nx = words[i + 1];
      if (nx && w.w.length <= 2 && !/[.,!?:;]/.test(w.p ?? '') && (w.w + nx.w).length <= 9) { out.push([w, nx]); i++; } else out.push([w]);
    }
    return out;
  }, [words]);
  const i = groups.findIndex((g, k) => t >= g[0].s - 0.03 && (k === groups.length - 1 ? t <= g[g.length - 1].e + 0.5 : t < groups[k + 1][0].s - 0.03));
  if (i < 0) return null;
  const g = groups[i];
  const d = (t - (g[0].s - 0.03)) * fps;
  const pop = d < 0 ? 0 : d > 6 ? 1 : 1 + 2.7 * Math.pow(d / 6 - 1, 3) + 1.7 * Math.pow(d / 6 - 1, 2);
  const text = g.map((w) => w.w.toUpperCase() === w.w && w.w.length > 1 ? w.w : w.w).join(' ') + (g[g.length - 1].p ?? '').replace(/\s/g, '');
  const key = g.map((w) => w.w.toLowerCase()).find((w) => colors[w]);
  const col = key ? colors[key] : '#FFFFFF';
  const z = key ? size * 1.12 : size;
  return (
    <svg width={D.w} height={D.h} viewBox={`0 0 ${D.w} ${D.h}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g transform={`translate(${D.w / 2} ${y}) scale(${pop})`}>
        <text textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={z} letterSpacing={0.5}
          fill={col} stroke="#0A0610" strokeWidth={z * 0.17} strokeLinejoin="round" paintOrder="stroke" style={{ filter: 'drop-shadow(0 7px 0 rgba(0,0,0,0.55))' }}>
          {key ? text.toUpperCase() : text}
        </text>
      </g>
    </svg>
  );
};

/** One shot of a story Reel at frame f: its clock, with its camera move (and any transition offset) applied. */
const StoryShot: React.FC<{ tl: Timeline; shots: ShotMap; seg: Seg; idx: number; f: number; xs?: number; blur?: number; dx?: number; snappy?: boolean }> = ({ tl, shots, seg, idx, f, xs = 1, blur = 0, dx = 0, snappy = false }) => {
  const D = React.useContext(DimCtx);
  const Shot = shots[seg.shot];
  const info = tl.shots.find((s) => s.id === seg.shot);
  const t = clockAt(seg, f);
  const c = camAt(seg as any, idx, f, snappy);
  return (
    <svg width={D.w} height={D.h} viewBox={`0 0 ${D.w} ${D.h}`} style={{ position: 'absolute', inset: 0, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <KitDefs />
      <SetDefs />
      <g transform={`translate(${D.w / 2 + c.x + dx} ${D.h / 2 + c.y}) rotate(${c.r}) scale(${c.s * xs}) translate(${-D.w / 2} ${-D.h / 2})`}>{Shot ? <Shot t={t} len={info?.len ?? seg.b - seg.a} f={f} /> : null}</g>
    </svg>
  );
};

/** Story hits: punch zooms, blooms, flashes and shakes (fx entries in the timeline). */
const storyFxAt = (tl: Timeline, f: number) => {
  const base = fxAt(tl, f);
  let punch = 1;
  const blooms: { k: number; color: string; o: number }[] = [];
  let rewind = -1;
  let iris: { k: number; x: number; y: number; r: number } | null = null;
  for (const e of tl.fx as any[]) {
    const d = f - e.f;
    if (e.kind === 'rewind' && d >= 0 && d < (e.len ?? 20)) rewind = d / (e.len ?? 20);
    if (e.kind === 'iris' && d >= 0 && d < (e.len ?? 40)) iris = { k: d / (e.len ?? 40), x: e.x ?? 540, y: e.y ?? 900, r: e.r ?? 260 };
    if (e.kind === 'punch' && d >= 0 && d < (e.len ?? 10)) punch *= 1 + (e.amp ?? 0.07) * Math.exp(-d / 3) * Math.min(1, (d + 1) / 2);
    if (e.kind === 'bloom' && d >= 0 && d < (e.len ?? 18)) blooms.push({ k: d / (e.len ?? 18), color: e.color ?? '#FFC24A', o: e.o ?? 0.8 });
  }
  return { ...base, punch, blooms, rewind, iris };
};

export const StoryEpisode: React.FC<{ timeline: Timeline; shots: ShotMap; words: StoryWord[]; bg?: string; captions?: boolean; capStyle?: 'karaoke' | 'pop'; capColors?: Record<string, string>; snappy?: boolean; capFont?: string; overlay?: React.FC<{ f: number }>; dims?: { w: number; h: number } }> = (props) => (
  <DimCtx.Provider value={props.dims ?? { w: STORY.w, h: STORY.h }}><StoryEpisodeIn {...props} /></DimCtx.Provider>
);
const StoryEpisodeIn: React.FC<React.ComponentProps<typeof StoryEpisode>> = ({ timeline: tl, shots, words, bg = '#0E0C1E', captions = true, capStyle = 'karaoke', capColors, snappy = false, capFont, overlay: Overlay }) => {
  const D = React.useContext(DimCtx);
  const f = useCurrentFrame();
  const idx = Math.max(0, tl.segments.findIndex((s) => f >= s.a && f < s.b));
  const seg = tl.segments[idx] ?? tl.segments[tl.segments.length - 1];
  const prev = idx > 0 ? tl.segments[idx - 1] : null;
  const tr: StoryTr = prev ? ((seg as any).tr ?? AUTO_TR[idx % AUTO_TR.length]) : 'cut';
  const L = Math.min(TR_LEN[tr], Math.max(1, Math.floor((seg.b - seg.a) / 2)));
  const k = L ? clamp((f - seg.a) / L) : 1;
  const fx = storyFxAt(tl, f);
  const { flash, x, y, blooms, rewind, iris } = fx;
  // snappy: every coloured caption keyword lands with its own small punch zoom
  let punch = fx.punch;
  if (snappy && capColors) for (const w of words) {
    if (!capColors[w.w.toLowerCase()]) continue;
    const d = f - Math.round(w.s * tl.fps);
    if (d >= 0 && d < 9) punch *= 1 + 0.06 * Math.exp(-d / 3) * Math.min(1, (d + 1) / 2);
  }
  const A = tl.audio;
  // the transition: how the outgoing (prev) and incoming (seg) shots are drawn while k runs 0 -> 1
  let out: React.ReactNode = null, inn: React.ReactNode;
  let white = 0;
  const P = (o: number, props: { xs?: number; blur?: number; dx?: number }) => prev ? <AbsoluteFill style={{ opacity: o }}><StoryShot tl={tl} shots={shots} seg={prev} idx={idx - 1} f={f} snappy={snappy} {...props} /></AbsoluteFill> : null;
  const N = (o: number, props: { xs?: number; blur?: number; dx?: number }) => <AbsoluteFill style={{ opacity: o }}><StoryShot tl={tl} shots={shots} seg={seg} idx={idx} f={f} snappy={snappy} {...props} /></AbsoluteFill>;
  if (k >= 1 || !prev) inn = N(1, {});
  else if (tr === 'ghost') { out = P(1, {}); inn = N(easeInOut(k), { xs: lerp(1.1, 1, easeOut(k)), blur: (1 - k) * 6 }); }
  else if (tr === 'zoom') { out = P(1 - easeIn(k), { xs: lerp(1, 1.6, easeIn(k)), blur: k * 12 }); inn = N(easeOut(k), { xs: lerp(1.3, 1, easeOut(k)), blur: (1 - k) * 9 }); }
  else if (tr === 'whip') { out = P(1, { dx: -easeIn(k) * 700, blur: k * 14 }); inn = N(k, { dx: (1 - easeOut(k)) * 700, blur: (1 - k) * 14 }); }
  else if (tr === 'flash') {
    const h = 3 / L;
    if (k < h) { out = P(1, { xs: 1 + 0.06 * (k / h) }); inn = null; white = k / h; }
    else { inn = N(1, { xs: lerp(1.06, 1, (k - h) / (1 - h)) }); white = 1 - easeOut((k - h) / (1 - h)); }
  }
  else { out = P(1, {}); inn = N(k, {}); }
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${(x || y ? 1.02 : 1) * punch})` }}>
        {out}
        {inn}
      </AbsoluteFill>
      {blooms.map((b, i) => (
        <AbsoluteFill key={i} style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${b.color} 0%, transparent ${30 + 50 * b.k}%)`, opacity: b.o * (1 - b.k) }} />
          <svg width={D.w} height={D.h} style={{ position: 'absolute', inset: 0 }}><circle cx={D.w / 2} cy={D.h * 0.45} r={120 + 900 * easeOut(b.k)} fill="none" stroke={b.color} strokeWidth={30 * (1 - b.k)} opacity={0.7 * (1 - b.k)} /></svg>
        </AbsoluteFill>
      ))}
      {/* VHS rewind: scanlines, a colour split and the ◀◀ badge (the channel's REWIND jump back in time) */}
      {rewind >= 0 ? <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <AbsoluteFill style={{ background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 3px, transparent 3px, transparent 9px)', mixBlendMode: 'screen' }} />
        <AbsoluteFill style={{ background: 'rgba(60,120,255,0.18)', mixBlendMode: 'screen', transform: `translateX(${Math.sin(f * 1.7) * 10}px)` }} />
        <svg width={D.w} height={D.h} style={{ position: 'absolute', inset: 0 }}>
          <rect x={0} y={(f * 47) % D.h} width={D.w} height={26} fill="#FFFFFF" opacity={0.25} />
          <text x={90} y={330} fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={74} fill="#FFFFFF" stroke="#120B18" strokeWidth={10} paintOrder="stroke" opacity={Math.floor(f / 6) % 2 ? 1 : 0.6}>◀◀ REWIND</text>
        </svg>
      </AbsoluteFill> : null}
      {/* iris: a spotlight ring closing around the key thing, the rest dimmed */}
      {iris ? <svg width={D.w} height={D.h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs><mask id="irisM"><rect width={D.w} height={D.h} fill="white" /><circle cx={iris.x} cy={iris.y} r={lerp(iris.r * 3, iris.r, easeOut(clamp(iris.k * 3)))} fill="black" /></mask></defs>
        <rect width={D.w} height={D.h} fill="#05030A" opacity={0.6 * Math.min(1, iris.k * 4) * (1 - clamp((iris.k - 0.85) / 0.15))} mask="url(#irisM)" />
        <circle cx={iris.x} cy={iris.y} r={lerp(iris.r * 3, iris.r, easeOut(clamp(iris.k * 3)))} fill="none" stroke="#FFD23F" strokeWidth={10} opacity={1 - clamp((iris.k - 0.85) / 0.15)} />
      </svg> : null}
      {/* a fixed HUD (timers, status pills) that the camera doesn't move */}
      {Overlay ? <svg width={D.w} height={D.h} viewBox={`0 0 ${D.w} ${D.h}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><Overlay f={f} /></svg> : null}
      <Grade f={f} grain vignette w={D.w} h={D.h} />
      {white > 0 ? <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: white }} /> : null}
      {flash ? <AbsoluteFill style={{ backgroundColor: flash.color, opacity: flash.o }} /> : null}
      {/* a dark band at the bottom, like the references, so the captions always read */}
      {captions && capStyle === 'karaoke' ? <AbsoluteFill style={{ background: 'linear-gradient(to bottom, transparent 52%, rgba(8,6,16,0.55) 66%, rgba(8,6,16,0.85) 100%)' }} /> : null}
      {captions && capStyle === 'karaoke' ? <StoryCaptions words={words} fps={tl.fps} /> : null}
      {captions && capStyle === 'pop' ? <PopCaptions words={words} fps={tl.fps} colors={capColors} font={capFont} /> : null}
      {A.voice ? <Audio src={staticFile(A.voice)} volume={A.voiceVol ?? 1} /> : null}
      {A.sfx ? <Audio src={staticFile(A.sfx)} volume={A.sfxVol ?? 1} /> : null}
      {A.music ? <Audio src={staticFile(A.music)} volume={A.musicVol ?? 1} /> : null}
    </AbsoluteFill>
  );
};

/** The storyboard of a story Reel: each 9:16 shot at its key frame, centred in the 16:9 board frame. */
const StoryBoard: React.FC<{ timeline: Timeline; shots: ShotMap }> = ({ timeline: tl, shots }) => {
  const f = useCurrentFrame();
  const info = tl.shots[Math.min(f, tl.shots.length - 1)];
  const Shot = shots[info.id];
  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <svg x={656} y={0} width={608} height={1080} viewBox={`0 0 ${STORY.w} ${STORY.h}`}>{Shot ? <Shot t={info.key} len={info.len} f={info.first + info.key} /> : null}</svg>
      </svg>
    </AbsoluteFill>
  );
};

/** The storyboard of a landscape story: each 16:9 shot at its key frame, full frame. */
const StoryBoardLand: React.FC<{ timeline: Timeline; shots: ShotMap }> = ({ timeline: tl, shots }) => {
  const f = useCurrentFrame();
  const info = tl.shots[Math.min(f, tl.shots.length - 1)];
  const Shot = shots[info.id];
  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080"><KitDefs /><SetDefs />{Shot ? <Shot t={info.key} len={info.len} f={info.first + info.key} /> : null}</svg>
    </AbsoluteFill>
  );
};

/** Bundle a story Reel: its 9:16 film is registered as <Id>Vertical (what shorts.sh renders). With `landscape`, the
 *  story is drawn in 1920 x 1080 and <Id> is the film itself (what master.py renders without --vertical). */
export const defineStory = (id: string, p: { timeline: Timeline; shots: ShotMap; words: StoryWord[]; bg?: string; captions?: boolean; capStyle?: 'karaoke' | 'pop'; capColors?: Record<string, string>; snappy?: boolean; capFont?: string; overlay?: React.FC<{ f: number }>; landscape?: boolean }) => ({
  id,
  total: p.timeline.total,
  shotCount: p.timeline.shots.length,
  Main: p.landscape ? () => <StoryEpisode {...p} captions={p.captions ?? true} dims={{ w: 1920, h: 1080 }} /> : () => <StoryBoard timeline={p.timeline} shots={p.shots} />,
  Board: p.landscape ? () => <StoryBoardLand timeline={p.timeline} shots={p.shots} /> : () => <StoryBoard timeline={p.timeline} shots={p.shots} />,
  // karaoke captions are on (the user asked for them back); pass captions: false to hide them
  Vertical: p.landscape ? null : () => <StoryEpisode {...p} captions={p.captions ?? true} />,
});
