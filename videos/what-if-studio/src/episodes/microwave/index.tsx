import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as S from './shots';
import { Crt } from './shots';

// "I was an accident": the microwave oven tells its own story on a radar screen. Captions are the typed
// terminal line in the Crt overlay, so the engine's own captions are off.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const microwave = defineStory('Microwave', { timeline: timeline as Timeline, shots, words: words as StoryWord[], bg: '#020B07', captions: false, overlay: Crt });
