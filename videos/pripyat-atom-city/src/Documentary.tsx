import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { timeline, TOTAL, LEAD, XFADE, Timed } from "./timeline";
import audioJson from "./audio.json";

type Cue = { file: string; segment: string | null; until: string | null; volume: number };
type Sfx = { file: string; segment: string; offset: number; volume: number };
const audio = audioJson as { narrationExt: string; music: Cue[]; sfx: Sfx[] };
const startOf = (id: string | null) => (id === null ? 0 : timeline.find((s) => s.id === id)?.from ?? 0);

/** Music cue with fade in/out; loops if the generated track is shorter than its slot. */
const MusicCue: React.FC<{ cue: Cue }> = ({ cue }) => {
  const from = startOf(cue.segment);
  const to = cue.until === null ? TOTAL : startOf(cue.until) + 3 * FPS;
  const len = to - from;
  return (
    <Sequence from={from} durationInFrames={len} name={"music " + cue.file}>
      <Audio
        src={staticFile(cue.file)}
        loop
        volume={(f) => interpolate(f, [0, 2 * FPS, len - 3 * FPS, len], [0, cue.volume, cue.volume, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </Sequence>
  );
};
import { FPS } from "./theme";
import { Film } from "./overlays/Film";
import { Subtitle } from "./overlays/Subtitle";
import { Photo } from "./scenes/Photo";
import { MapScene } from "./scenes/MapScene";
import * as G from "./scenes/Graphics";

const Scene: React.FC<{ s: Timed; dur: number }> = ({ s, dur }) => {
  const v = s.v;
  switch (v.type) {
    case "photo": return <Photo img={v.img} move={v.move} tone={v.tone} tag={v.tag} dur={dur} />;
    case "map": return <MapScene view={v.view} highlight={v.highlight} danger={v.danger} note={v.note} dur={dur} />;
    case "title": return <G.Title dur={dur} />;
    case "chapter": return <G.Chapter num={v.num} title={v.title} dur={dur} />;
    case "stat": return <G.Stat value={v.value} label={v.label} sub={v.sub} />;
    case "date": return <G.DateCard big={v.big} sub={v.sub} />;
    case "statement": return <G.Statement text={v.text} dur={dur} />;
    case "list": return <G.ListScene title={v.title} items={v.items} dur={dur} />;
    case "companies": return <G.Companies dur={dur} />;
    case "blueprint": return <G.Blueprint dur={dur} />;
    case "employer": return <G.Employer fragile={v.fragile} label={v.label} dur={dur} />;
    case "reactors": return <G.Reactors dur={dur} />;
    case "clock": return <G.Clock time={v.time} date={v.date} label={v.label} count={v.count} dur={dur} />;
    case "buses": return <G.Buses dur={dur} />;
    case "districts": return <G.Districts dur={dur} />;
    case "end": return <G.End dur={dur} />;
    default: return null;
  }
};

const Fade: React.FC<{ children: React.ReactNode; first: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const op = first ? 1 : interpolate(f, [0, XFADE], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

export const Documentary: React.FC<{ subtitles: boolean }> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const lead = Math.round(LEAD * FPS);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {timeline.map((s, i) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur + (i === timeline.length - 1 ? 0 : XFADE)} name={s.id}>
          <Fade first={i === 0}>
            <Scene s={s} dur={s.dur + XFADE} />
          </Fade>
        </Sequence>
      ))}
      {timeline.filter((s) => s.audio).map((s) => (
        <Sequence key={"a" + s.id} from={s.from + lead} durationInFrames={Math.ceil((s.audio as number) * FPS) + 2} name={"vo " + s.id}>
          <Audio src={staticFile(`narration/${s.id}.${audio.narrationExt}`)} />
        </Sequence>
      ))}
      {audio.music.map((cue) => <MusicCue key={cue.file} cue={cue} />)}
      {audio.sfx.map((fx, i) => (
        <Sequence key={"fx" + i} from={startOf(fx.segment) + Math.round(fx.offset * FPS)} name={"sfx " + fx.file}>
          <Audio src={staticFile(fx.file)} volume={fx.volume} />
        </Sequence>
      ))}
      <Film />
      {subtitles && timeline.filter((s) => s.audio).map((s) =>
        frame >= s.from && frame < s.from + s.dur + 8 ? (
          <Subtitle key={"sub" + s.id} text={s.text} start={s.from + lead} frames={Math.round((s.audio as number) * FPS)} />
        ) : null,
      )}
    </AbsoluteFill>
  );
};
