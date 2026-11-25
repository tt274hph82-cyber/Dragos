import React from 'react';
import { defineStory, Timeline, StoryWord, ShotProps } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';
import { FxDefs, Atmos } from '../great-stink/shots';

// "The Cadaver Synod" (Rome, 897): Dancing Plague v2 look, faces, candlelight, and the animated-shorts-kit long-take
// camera (16 takes). Every shot mounts the shared blur/glow filters; Atmos is the film look over the picture.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k)).map(([k, Shot]) => {
  const Sh = Shot as React.FC<ShotProps>;
  const Wrapped: React.FC<ShotProps> = (p) => <g><FxDefs /><Sh {...p} /></g>;
  return [k, Wrapped];
})) as Record<string, React.FC<any>>;
export const cadaverSynod = defineStory('CadaverSynod', { timeline: timeline as Timeline, shots, words: words as StoryWord[], overlay: Atmos });
