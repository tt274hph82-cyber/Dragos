import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';
import { BurnBar } from './shots';

// "Who invented the cigarette?": a story Reel drawn in code as ink on cigarette paper.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const cigarette = defineStory('Cigarette', { timeline: timeline as Timeline, shots, words: words as StoryWord[], bg: '#1C130E', overlay: BurnBar });
