import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import * as S from './shots';
import { AdminBar } from './shots';

// "What if your little sister got admin powers?": blocky-game What If Short, family twist.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const sisterAdmin = defineStory('SisterAdmin', { timeline: timeline as Timeline, shots, words: words as StoryWord[], capStyle: 'pop', capColors: (episode as any).captions.colors, snappy: true, capFont: 'Montserrat', overlay: AdminBar });
