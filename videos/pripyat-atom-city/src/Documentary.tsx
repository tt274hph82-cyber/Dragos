import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { timeline, TOTAL, LEAD, XFADE, Timed } from "./timeline";
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
  const musicVol = (f: number) =>
    interpolate(f, [0, 60, TOTAL - 240, TOTAL], [0, 0.32, 0.32, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
          <Audio src={staticFile(`narration/${s.id}.wav`)} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/drone.mp3")} volume={musicVol} />
      <Film />
      {subtitles && timeline.filter((s) => s.audio).map((s) =>
        frame >= s.from && frame < s.from + s.dur + 8 ? (
          <Subtitle key={"sub" + s.id} text={s.text} start={s.from + lead} frames={Math.round((s.audio as number) * FPS)} />
        ) : null,
      )}
    </AbsoluteFill>
  );
};
