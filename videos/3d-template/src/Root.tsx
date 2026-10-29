import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { VIDEO } from "./config";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Scene3D"
    component={Video}
    durationInFrames={VIDEO.durationSeconds * VIDEO.fps}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
    defaultProps={{ captions: true }}
  />
);
