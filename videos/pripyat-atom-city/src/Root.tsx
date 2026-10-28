import React from "react";
import { Composition, Still } from "remotion";
import { Thumbnail } from "./Thumbnail";
import { Documentary } from "./Documentary";
import { TOTAL } from "./timeline";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
  <Still id="ThumbnailA" component={Thumbnail} width={1280} height={720} defaultProps={{ variant: "A" as const }} />
  <Still id="ThumbnailB" component={Thumbnail} width={1280} height={720} defaultProps={{ variant: "B" as const }} />
  <Composition
    id="Documentary"
    component={Documentary}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ subtitles: true }}
  />
  </>
);
