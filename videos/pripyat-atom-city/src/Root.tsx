import React from "react";
import { Composition } from "remotion";
import { Documentary } from "./Documentary";
import { TOTAL } from "./timeline";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Documentary"
    component={Documentary}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ subtitles: true }}
  />
);
