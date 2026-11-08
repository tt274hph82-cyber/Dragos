import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import * as S from './shots';
import { HackBar } from './shots';

// "What if you hacked the game?": blocky-game What If Short, YOU twist (the game hacks you back).
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const hacked = defineStory('Hacked', { timeline: timeline as Timeline, shots, words: words as StoryWord[], capStyle: 'pop', capColors: (episode as any).captions.colors, snappy: true, capFont: 'Montserrat', overlay: HackBar });
