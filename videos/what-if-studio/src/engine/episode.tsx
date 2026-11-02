import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp, lerp } from './anim';
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
};
export type ShotInfo = { id: string; size: string; key: number; len: number; first: number; line?: string; note?: string };
export type Fx = { f: number; kind: 'flash' | 'shake'; color?: string; o?: number; len?: number; amp?: number };
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
// A story Reel is drawn natively in a 1080 x 1920 world (no crop of a 16:9 frame). Its grammar, measured from the
// reference Reels: a new picture every 2-4 s, a slow steady push-in (about 3% a second) on every shot, 4-frame
// dissolves between shots, and karaoke captions (3 words at a time, the spoken word in yellow) at the same height for
// the whole video, inside the Reels safe zone.
export type StoryWord = { w: string; s: number; e: number; p?: string };
export const STORY = { w: 1080, h: 1920, capY: 1170, dissolve: 4, push: 0.028, pushMax: 0.14 };

const chunkWords = (words: StoryWord[]) => {
  const out: StoryWord[][] = [];
  let cur: StoryWord[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 3 || /[.,!?:;]/.test(w.p ?? '')) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

/** Karaoke captions: the chunk being spoken, uppercase, the current word in yellow. */
export const StoryCaptions: React.FC<{ words: StoryWord[]; fps: number }> = ({ words, fps }) => {
  const f = useCurrentFrame();
  const t = f / fps;
  const chunks = React.useMemo(() => chunkWords(words), [words]);
  const i = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && (k === chunks.length - 1 ? t <= c[c.length - 1].e + 0.6 : t < chunks[k + 1][0].s - 0.05));
  if (i < 0) return null;
  const c = chunks[i];
  const pop = clamp((t - (c[0].s - 0.05)) * fps / 3);
  return (
    <svg width={STORY.w} height={STORY.h} viewBox={`0 0 ${STORY.w} ${STORY.h}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g transform={`translate(${STORY.w / 2} ${STORY.capY}) scale(${0.92 + 0.08 * pop})`}>
        <text textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={50} letterSpacing={1.5}
          stroke="#120B18" strokeWidth={9} strokeLinejoin="round" paintOrder="stroke" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }}>
          {c.map((w, k) => (
            <tspan key={k} fill={t >= w.s - 0.03 && (k === c.length - 1 || t < c[k + 1].s - 0.03) ? '#FFD23F' : '#FFFFFF'}>{(k ? ' ' : '') + w.w.toUpperCase()}</tspan>
          ))}
        </text>
      </g>
    </svg>
  );
};

/** One shot of a story Reel at frame f of the film: its clock, with the slow push-in applied around its centre. */
const StoryShot: React.FC<{ tl: Timeline; shots: ShotMap; seg: Seg; f: number }> = ({ tl, shots, seg, f }) => {
  const Shot = shots[seg.shot];
  const info = tl.shots.find((s) => s.id === seg.shot);
  const t = clockAt(seg, f);
  const s = 1 + Math.min(STORY.pushMax, STORY.push * ((f - seg.a) / 30));
  return (
    <svg width={STORY.w} height={STORY.h} viewBox={`0 0 ${STORY.w} ${STORY.h}`} style={{ position: 'absolute', inset: 0 }}>
      <KitDefs />
      <SetDefs />
      <g transform={`translate(540 960) scale(${s}) translate(-540 -960)`}>{Shot ? <Shot t={t} len={info?.len ?? seg.b - seg.a} f={f} /> : null}</g>
    </svg>
  );
};

export const StoryEpisode: React.FC<{ timeline: Timeline; shots: ShotMap; words: StoryWord[]; bg?: string; captions?: boolean }> = ({ timeline: tl, shots, words, bg = '#0E0C1E', captions = true }) => {
  const f = useCurrentFrame();
  const idx = Math.max(0, tl.segments.findIndex((s) => f >= s.a && f < s.b));
  const seg = tl.segments[idx] ?? tl.segments[tl.segments.length - 1];
  const prev = idx > 0 ? tl.segments[idx - 1] : null;
  const k = prev ? clamp((f - seg.a) / STORY.dissolve) : 1;
  const { flash, x, y } = fxAt(tl, f);
  const A = tl.audio;
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill style={{ transform: x || y ? `translate(${x}px, ${y}px) scale(1.02)` : undefined }}>
        {prev && k < 1 ? <StoryShot tl={tl} shots={shots} seg={prev} f={prev.b - 1} /> : null}
        <AbsoluteFill style={{ opacity: k }}><StoryShot tl={tl} shots={shots} seg={seg} f={f} /></AbsoluteFill>
      </AbsoluteFill>
      <Grade f={f} grain vignette w={STORY.w} h={STORY.h} />
      {flash ? <AbsoluteFill style={{ backgroundColor: flash.color, opacity: flash.o }} /> : null}
      {captions ? <StoryCaptions words={words} fps={tl.fps} /> : null}
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

/** Bundle a story Reel: its 9:16 film is registered as <Id>Vertical (what shorts.sh renders). */
export const defineStory = (id: string, p: { timeline: Timeline; shots: ShotMap; words: StoryWord[]; bg?: string; captions?: boolean }) => ({
  id,
  total: p.timeline.total,
  shotCount: p.timeline.shots.length,
  Main: () => <StoryBoard timeline={p.timeline} shots={p.shots} />,
  Board: () => <StoryBoard timeline={p.timeline} shots={p.shots} />,
  // karaoke captions are off by default (the user asked for no captions); pass captions: true to bring them back
  Vertical: () => <StoryEpisode {...p} captions={p.captions ?? false} />,
});
