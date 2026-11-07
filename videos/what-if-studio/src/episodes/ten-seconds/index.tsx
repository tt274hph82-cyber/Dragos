import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';

// "What if your mom gave you 10 seconds of games?": a blocky-game What If Short (one-word pop captions).
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
const capColors: Record<string, string> = {
  mom: '#FFD23F', ten: '#FFD23F', games: '#4ADE6A', bed: '#FF5A5A', speedrunner: '#4ADE6A', jump: '#4ADE6A', boss: '#FF7AE0', spawns: '#FF7AE0',
  punch: '#FF4A4A', 'k.o': '#FF4A4A', billion: '#FFD23F', gems: '#5AE8F8', shop: '#FFD23F', toaster: '#FF4A4A', three: '#FF4A4A', two: '#FF4A4A',
  this: '#FFD23F', plus: '#4ADE6A', again: '#FF7AE0', loop: '#FFD23F',
};
export const tenSeconds = defineStory('TenSeconds', { timeline: timeline as Timeline, shots, words: words as StoryWord[], capStyle: 'pop', capColors });
