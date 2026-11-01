import React, { useContext } from 'react';
import { defineEpisode, Timeline, VerticalCtx } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';
import { setVertZoom } from './shots';

// "Who invented the fountain pen?": the English version of the stilou explainer. No power look; every shot keeps its content in the
// centre column, so the 9:16 crop is centred everywhere.
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
export const fountainPen = defineEpisode('FountainPen', { timeline: timeline as Timeline, shots, vertical });
