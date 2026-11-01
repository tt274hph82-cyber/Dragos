import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

// "Cine a inventat stiloul?": a history explainer with Nea Costel. No power look; every shot keeps its content in the
// centre column, so the 9:16 crop is centred everywhere.
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
const vertical: Record<string, number | [number, number]> = Object.fromEntries(Object.keys(shots).map((k) => [k, 960]));
export const stilou = defineEpisode('Stilou', { timeline: timeline as Timeline, shots, vertical });
