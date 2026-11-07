import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import * as S from './shots';

// "What if your mom gave you 10 seconds of games?": a blocky-game What If Short (one-word pop captions, snappy camera).
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const tenSeconds = defineStory('TenSeconds', { timeline: timeline as Timeline, shots, words: words as StoryWord[], capStyle: 'pop', capColors: (episode as any).captions.colors, snappy: true });
