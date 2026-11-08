import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT } from './engine';
import { Dog } from './episodes/pet-swallowed/shots';
import { Blocky, OL } from './episodes/ten-seconds/shots';

// YouTube thumbnail for "What if your PET swallowed your MOM?" (drawn at 1920x1080, export scaled to 1280x720).
// Biscuit with his mouth wide open and Mom inside it, you in shock, three big words.
const Word: React.FC<{ x: number; y: number; size: number; color: string; children: string; rot?: number }> = ({ x, y, size, color, children, rot = -5 }) => (
  <text x={x} y={y} transform={`rotate(${rot} ${x} ${y})`} fontFamily={FONT.game} fontWeight={900} fontSize={size} fill={color} stroke={OL} strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round">{children}</text>
);
export const PetThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#C81E2A' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <rect width={1920} height={1080} fill="#C81E2A" />
      <g transform="translate(1500 520)">{Array.from({ length: 20 }, (_, i) => <path key={i} d="M 0 0 L -120 -2000 L 120 -2000 Z" fill="#E8323E" transform={`rotate(${i * 18})`} />)}</g>
      <radialGradient id="pg"><stop offset="0" stopColor="#FFD23F" stopOpacity={0.55} /><stop offset="1" stopColor="#FFD23F" stopOpacity={0} /></radialGradient>
      <circle cx={1550} cy={520} r={520} fill="url(#pg)" />
      <Dog x={804} y={1449} s={1.7} t={0} mouth={1} face="hungry" />
      <Blocky x={1660} y={890} s={0.34} kind="mom" face="shock" t={0} pose={{ armL: 165, armR: 165 }} />
      <path d="M 1520 880 q 14 60 0 110 q -14 -50 0 -110 Z" fill="#AFE0FF" stroke={OL} strokeWidth={5} />
      <g transform="translate(1660 470) rotate(8)"><rect x={-130} y={-56} width={260} height={112} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={8} /><text y={24} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={64} fill="#E2262E">HELP!</text></g>
      <Blocky x={330} y={1560} s={1.0} kind="kid" face="shock" t={0} pose={{ armL: 160, armR: 160 }} />
      <Word x={60} y={190} size={150} color="#FFFFFF">MOM GOT</Word>
      <Word x={80} y={370} size={175} color="#FFD23F">EATEN?!</Word>
    </svg>
  </AbsoluteFill>
);
