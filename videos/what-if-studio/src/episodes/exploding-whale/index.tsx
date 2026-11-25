import React from 'react';
import { defineStory, Timeline, StoryWord, ShotProps } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S0 from './shots';
import * as TK from './takes';
const S = { ...S0, ...TK };
import { FxDefs, Atmos } from '../great-stink/shots';

// "The Exploding Whale" (Florence, Oregon, 1970): a story Short in the Dancing Plague v2 look; frames follow the
// narration word by word. Every shot mounts the shared blur/glow filters (the figures and rays use them).
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k)).map(([k, Shot]) => {
  const Sh = Shot as React.FC<ShotProps>;
  const Wrapped: React.FC<ShotProps> = (p) => <g><FxDefs /><Sh {...p} /></g>;
  return [k, Wrapped];
})) as Record<string, React.FC<any>>;
export const explodingWhale = defineStory('ExplodingWhale', { timeline: timeline as Timeline, shots, words: words as StoryWord[], overlay: Atmos });
