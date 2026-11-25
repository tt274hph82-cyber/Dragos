// Light story for "Why stop signs are red": one mood per location; the fading shot's sun sweeps across the sky (time-lapse).
import type {Tod} from '../../engine/look/look';
import {SHOT_REAL} from './timeline';
export const TOD: [number, Tod][] = [[0, 'day']];
export const INTERIOR = {shots: [] as string[], centre: [0, 0] as [number, number], pool: [0, 0, 0] as [number, number, number],
  lamp: [0, 2.3, 0] as [number, number, number], lampPt: [0, 2.25, 0] as [number, number, number], cool: [0, 2.2, 0] as [number, number, number], warm: [0, 2.7, 0] as [number, number, number]};
export const MOOD = (_f: number) => 0;
export type Mood = {sun: [number, number, number]; sunC: string; sunI: number; sky: string; gnd: string; hemiI: number; amb: string; ambI: number; fog?: [string, number, number]; bloom?: number; exp?: number};
const DAY: Mood = {sun: [7, 11, 6], sunC: '#fff0d6', sunI: 3.2, sky: '#9cc4ee', gnd: '#c8b08a', hemiI: 0.85, amb: '#fff4e8', ambI: 0.18, fog: ['#dfe6ee', 60, 230], bloom: 0.6};
const NIGHT: Mood = {sun: [-5, 10, 8], sunC: '#8aa4ff', sunI: 0.75, sky: '#2a3a6a', gnd: '#101018', hemiI: 0.5, amb: '#6a7ab8', ambI: 0.16, fog: ['#0b1028', 30, 150], bloom: 1.5};
const ROOM: Mood = {sun: [5, 8, 9], sunC: '#ffe2b8', sunI: 2.2, sky: '#f4dcb8', gnd: '#4a3a26', hemiI: 0.5, amb: '#ffe8d0', ambI: 0.2, bloom: 0.9};
const GOLD: Mood = {sun: [-11, 4.5, 5], sunC: '#ffb868', sunI: 3.3, sky: '#f2b878', gnd: '#c88a5a', hemiI: 0.7, amb: '#ffd8b0', ambI: 0.16, fog: ['#f4c48a', 50, 200], bloom: 0.9};
export const LIGHTS: Record<string, Mood> = {
  hook: NIGHT, night: {...NIGHT, sunI: 0.55, bloom: 1.2}, today: {...NIGHT, fog: ['#0a0f26', 30, 150]},
  detroit: DAY, square: {...DAY, sun: [-6, 9, 8]}, wall: {...DAY, sun: [4, 10, 9]},
  room: ROOM, board: {...ROOM, sun: [3, 12, 4], sunI: 2.0}, paint: {...ROOM, sunC: '#ffd8a8'}, works: {...ROOM, sunC: '#e8f0ff', sunI: 1.8, amb: '#e8eeff', bloom: 1.2},
  snow: {sun: [6, 7, 8], sunC: '#f4f8ff', sunI: 2.2, sky: '#c8d8ee', gnd: '#eef3fa', hemiI: 1.0, amb: '#e8f0ff', ambI: 0.3, fog: ['#c8d4e4', 18, 90], bloom: 0.5},
  montage: GOLD,
};
export const moodOf = (loc: string, f = 0): Mood => {
  if (loc !== 'fade') return LIGHTS[loc] ?? DAY;
  const a = ((f / 30 - SHOT_REAL.fade) * 30 / 26) * Math.PI, up = Math.sin(a % (2 * Math.PI));
  return {...DAY, sun: [Math.cos(a) * 12, Math.max(2, up * 12), 5], sunC: up < 0.3 ? '#ffb070' : '#fff0d6', sunI: up < 0 ? 1.4 : 3.2, fog: ['#e8dcc8', 60, 220]};
};
