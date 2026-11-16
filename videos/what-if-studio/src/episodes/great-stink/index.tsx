import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';

// "The Great Stink" (London, 1858): a story Short in the Dancing Plague v3 style, with a young energetic narrator.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const greatStink = defineStory('GreatStink', { timeline: timeline as Timeline, shots, words: words as StoryWord[] });
