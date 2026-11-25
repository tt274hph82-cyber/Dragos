// TEMPLATE light story: [start seconds, 'day' | 'golden' | 'workshop'] and an optional practical-lit interior.
import type {Tod} from '../../engine/look/look';
export const TOD: [number, Tod][] = [[0, 'day']];
export const INTERIOR = {shots: [] as string[], centre: [0, 0] as [number, number], pool: [0, 0, 0] as [number, number, number],
  lamp: [0, 2.3, 0] as [number, number, number], lampPt: [0, 2.25, 0] as [number, number, number], cool: [0, 2.2, 0] as [number, number, number], warm: [0, 2.7, 0] as [number, number, number]};
/** night mood 0..1 (0 = none) */
import {SHOT_REAL} from './timeline';
const A = SHOT_REAL.modern * 30, B = SHOT_REAL.end * 30;
export const MOOD = (f: number) => (f < A - 4 || f >= B ? 0 : Math.min(1, (f - A + 4) / 4));

/** per-location light moods (polish pass): sun direction/colour/strength, sky+ground fill, ambient, haze, bloom, exposure */
export type Mood = {sun: [number, number, number]; sunC: string; sunI: number; sky: string; gnd: string; hemiI: number; amb: string; ambI: number; fog?: [string, number, number]; bloom?: number; exp?: number};
const DAY: Mood = {sun: [7, 11, 6], sunC: '#fff0d6', sunI: 3.3, sky: '#9cc4ee', gnd: '#d8b583', hemiI: 0.85, amb: '#fff4e8', ambI: 0.18, fog: ['#f1dfba', 55, 210], bloom: 0.6, exp: 1.0};
const GOLD: Mood = {sun: [-11, 4.5, 5], sunC: '#ffb868', sunI: 3.4, sky: '#f2b878', gnd: '#c88a5a', hemiI: 0.7, amb: '#ffd8b0', ambI: 0.16, fog: ['#f4c48a', 45, 190], bloom: 0.9, exp: 1.02};
const ROOM: Mood = {sun: [5, 8, 9], sunC: '#ffe2b8', sunI: 2.4, sky: '#f4dcb8', gnd: '#5a3a26', hemiI: 0.55, amb: '#ffe8d0', ambI: 0.22, bloom: 0.9, exp: 1.0};
export const LIGHTS: Record<string, Mood> = {
  hook: {sun: [-13, 4.5, -7], sunC: '#ffb07a', sunI: 3.0, sky: '#b0607a', gnd: '#7a4a4a', hemiI: 0.75, amb: '#ffc8a8', ambI: 0.16, fog: ['#c8889a', 60, 220], bloom: 1.1, exp: 1.0},
  town: DAY, road: DAY, idea: DAY, stare: {...DAY, sun: [-6, 10, 7]},
  county: ROOM, door: {...ROOM, sun: [6, 7, 9], sunC: '#ffd8a8'}, store: ROOM,
  club: {...ROOM, sunC: '#ffe0c8', sky: '#f4d0d8'}, map: {...ROOM, sunI: 2.0, ambI: 0.18}, years: {...ROOM, sunC: '#e8f0ff', sky: '#d8e8e0', sunI: 2.2},
  brush: {...GOLD, sun: [-10, 5, 7]}, stretch: GOLD, miles: {...GOLD, sun: [14, 4.2, -3], fog: ['#f6c890', 80, 320]}, end: GOLD,
  modern: {sun: [-6, 10, -4], sunC: '#8aa4ff', sunI: 0.9, sky: '#2a3a6a', gnd: '#101018', hemiI: 0.55, amb: '#6a7ab8', ambI: 0.2, fog: ['#141a38', 30, 170], bloom: 1.6, exp: 1.05},
};
export const moodOf = (loc: string): Mood => LIGHTS[loc] ?? DAY;
