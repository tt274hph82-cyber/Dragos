import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';

// "The Great Emu War": a short story Reel with the user's host.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const emuWar = defineStory('EmuWar', { timeline: timeline as Timeline, shots, words: words as StoryWord[] });
