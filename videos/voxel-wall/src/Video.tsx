import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { Scene } from "./Scene";
import { Captions } from "./Captions";
import { VIDEO } from "./config";

/** Three.js scene (via @remotion/three) + Remotion captions and audio. */
export const Video: React.FC<{ captions: boolean }> = ({ captions }) => {
  const { durationInFrames, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#07090c" }}>
      <Scene />
      {/* cinematic vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
      {captions && <Captions />}
      {VIDEO.music && (
        <Audio
          src={staticFile(VIDEO.music)}
          volume={(f) => interpolate(f, [0, fps, durationInFrames - 2 * fps, durationInFrames], [0, VIDEO.musicVolume, VIDEO.musicVolume, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      )}
      {VIDEO.narration && <Audio src={staticFile(VIDEO.narration)} volume={VIDEO.narrationVolume} />}
    </AbsoluteFill>
  );
};
