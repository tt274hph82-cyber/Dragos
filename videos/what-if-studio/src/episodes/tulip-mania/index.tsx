import React from 'react';
import { defineStory, Timeline, StoryWord, ShotProps } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';
import { FxDefs, Atmos } from '../great-stink/shots';

// "Tulip Mania" (1637): a story Short in the Great Stink style, with the energetic narrator.
// Every shot mounts the shared blur/glow filters; Atmos lays the film look (grade, light leak, dust, grain, vignette)
// over the picture, under the captions.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k)).map(([k, Shot]) => {
  const Sh = Shot as React.FC<ShotProps>;
  const Wrapped: React.FC<ShotProps> = (p) => <g><FxDefs /><Sh {...p} /></g>;
  return [k, Wrapped];
})) as Record<string, React.FC<any>>;
export const tulipMania = defineStory('TulipMania', { timeline: timeline as Timeline, shots, words: words as StoryWord[], overlay: Atmos });
