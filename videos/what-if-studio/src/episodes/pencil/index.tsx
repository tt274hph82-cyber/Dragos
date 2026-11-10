import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';
import { PencilBar } from './shots';

// "Who invented the pencil?": a story Reel drawn in code as pencil sketches on notebook paper.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const pencil = defineStory('Pencil', { timeline: timeline as Timeline, shots, words: words as StoryWord[], bg: '#2A2A31', overlay: PencilBar });
