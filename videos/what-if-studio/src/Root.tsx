import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';
import { HeroOptions } from './HeroOptions';
import { SetCheck } from './SetCheck';
import { PauseThumb } from './PauseThumb';

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} {...common} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} {...common} />
          {e.Vertical ? <Composition id={`${e.id}Vertical`} component={e.Vertical} durationInFrames={Math.max(1, e.total)} fps={STUDIO.fps} width={1080} height={1920} /> : null}
        </React.Fragment>
      ))}
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
      <Composition id="HeroOptions" component={HeroOptions} durationInFrames={1} {...common} />
      <Composition id="PauseThumbA" component={PauseThumb} durationInFrames={1} {...common} defaultProps={{ variant: 'A' as const }} />
      <Composition id="PauseThumbB" component={PauseThumb} durationInFrames={1} {...common} defaultProps={{ variant: 'B' as const }} />
      <Composition id="SetCheck" component={SetCheck} durationInFrames={1} {...common} defaultProps={{ kind: 'street' as const }} />
    </>
  );
};
