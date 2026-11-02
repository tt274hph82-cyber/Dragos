import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';

// "The Great Molasses Flood": the first native 9:16 story Reel (story mode in engine/episode.tsx).
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const molasses = defineStory('Molasses', { timeline: timeline as Timeline, shots, words: words as StoryWord[] });
