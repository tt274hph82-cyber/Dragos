import React from 'react';
import { defineStory, Timeline, StoryWord } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import episode from './episode.json';
import * as S from './shots';
import { GradeBar } from './shots';

// "What if your teacher joined the game?": blocky-game What If Short, school twist.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const teacherJoins = defineStory('TeacherJoins', { timeline: timeline as Timeline, shots, words: words as StoryWord[], capStyle: 'pop', capColors: (episode as any).captions.colors, snappy: true, capFont: 'Montserrat', overlay: GradeBar });
