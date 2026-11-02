import React, { useContext } from 'react';
import { defineEpisode, Timeline, VerticalCtx } from '../../engine';
import { setVertZoom } from '../fountain-pen/shots';
import timeline from './timeline.json';
import * as S from './shots';

// "Who invented the toothbrush?": Nea Costel's third English explainer. Every shot is framed for the centre column.
const shots = Object.fromEntries(
  Object.entries(S)
    .filter(([k]) => /^S\d+$/.test(k))
    .map(([k, Shot]) => {
      const C = Shot as React.FC<any>;
      const Wrapped: React.FC<any> = (p) => {
        setVertZoom(useContext(VerticalCtx));
        return <C {...p} />;
      };
      return [k, Wrapped];
    }),
) as Record<string, React.FC<any>>;
const vertical: Record<string, number | [number, number]> = Object.fromEntries(Object.keys(shots).map((k) => [k, 960]));
export const toothbrush = defineEpisode('Toothbrush', { timeline: timeline as Timeline, shots, vertical });
