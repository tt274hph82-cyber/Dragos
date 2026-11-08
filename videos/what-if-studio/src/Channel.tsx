import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT } from './engine';
import { Blocky, CubeHead, OL } from './episodes/ten-seconds/shots';
import { Dog } from './episodes/pet-swallowed/shots';

// Channel branding for "Blocky What If": the profile logo (800x800, shown as a circle) and the banner
// (2560x1440; text and logo stay inside the 1546x423 area every device shows, x 507-2053, y 508-931).
const T: React.FC<{ x: number; y: number; size: number; c: string; children: string; rot?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, size, c, children, rot = 0, anchor = 'middle' }) => (
  <text x={x} y={y} transform={`rotate(${rot} ${x} ${y})`} textAnchor={anchor} fontFamily={FONT.game} fontWeight={900} fontSize={size} fill={c} stroke={OL} strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round">{children}</text>
);
const Rays: React.FC<{ cx: number; cy: number; n?: number; c: string; len?: number; w?: number }> = ({ cx, cy, n = 20, c, len = 3000, w = 160 }) => (
  <g transform={`translate(${cx} ${cy})`}>{Array.from({ length: n }, (_, i) => <path key={i} d={`M 0 0 L ${-w} ${-len} L ${w} ${-len} Z`} fill={c} transform={`rotate(${(i * 360) / n})`} />)}</g>
);
const QBubble: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(12)`}>
    <rect x={-80} y={-90} width={160} height={180} rx={36} fill="#FFFFFF" stroke={OL} strokeWidth={12} />
    <path d="M -40 80 L -70 140 L 10 88 Z" fill="#FFFFFF" stroke={OL} strokeWidth={12} strokeLinejoin="round" />
    <rect x={-50} y={74} width={70} height={22} fill="#FFFFFF" />
    <text y={52} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={150} fill="#E2262E">?</text>
  </g>
);

export const ChannelLogo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#FFC21A' }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <rect width={800} height={800} fill="#FFC21A" />
      <Rays cx={400} cy={400} c="#FFD84A" len={800} w={70} />
      <circle cx={400} cy={400} r={330} fill="#FFE27A" opacity={0.5} />
      <g transform="translate(385 420) scale(1.25)"><CubeHead face="shock" hair="kid" t={0} /></g>
      <QBubble x={570} y={235} s={0.85} />
      <T x={400} y={700} size={92} c="#FFFFFF" rot={-4}>WHAT IF?</T>
    </svg>
  </AbsoluteFill>
);

export const ChannelBanner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#2A6AE8' }}>
    <svg width={2560} height={1440} viewBox="0 0 2560 1440">
      <rect width={2560} height={1440} fill="#2A6AE8" />
      <Rays cx={1280} cy={720} n={28} c="#3A7AF2" />
      <radialGradient id="cg"><stop offset="0" stopColor="#7ACCFF" stopOpacity={0.6} /><stop offset="1" stopColor="#7ACCFF" stopOpacity={0} /></radialGradient>
      <ellipse cx={1280} cy={720} rx={1100} ry={520} fill="url(#cg)" />
      {/* a row of blocks along the bottom of the visible band */}
      {Array.from({ length: 22 }, (_, i) => <g key={i}><rect x={i * 120} y={930} width={120} height={120} fill={i % 2 ? '#3AB84A' : '#4AC85A'} stroke={OL} strokeWidth={6} /><rect x={i * 120} y={1050} width={120} height={400} fill="#8A5A3A" stroke={OL} strokeWidth={6} /></g>)}
      {/* the cast, outside the mobile-safe middle (shown on desktop and TV) */}
      <Dog x={150} y={935} s={0.34} t={0} face="happy" />
      <Blocky x={420} y={935} s={0.42} kind="kid" face="starry" t={0} pose={{ armL: 160, armR: 160 }} />
      <Blocky x={2140} y={935} s={0.36} kind="friend" face="happy" t={0} pose={{ armL: 140, armR: 40 }} />
      <Blocky x={2300} y={935} s={0.42} kind="mom" face="happy" t={0} pose={{ armR: 120 }} />
      <Blocky x={2470} y={935} s={0.42} kind="dad" face="grin" t={0} pose={{ armL: 120 }} />
      {/* inside the safe area: logo head, the name and the promise */}
      <g transform="translate(760 720) scale(0.78)"><CubeHead face="shock" hair="kid" t={0} /></g>
      <QBubble x={880} y={575} s={0.55} />
      <T x={1000} y={680} size={150} c="#FFFFFF" anchor="start" rot={-3}>BLOCKY</T>
      <T x={1020} y={825} size={150} c="#FFD23F" anchor="start" rot={-3}>WHAT IF?</T>
      <g transform="translate(1290 880) rotate(-3)"><rect x={-330} y={-38} width={660} height={76} rx={38} fill="#1A1424" /><text y={20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF">NEW STORY EVERY WEEK</text></g>
    </svg>
  </AbsoluteFill>
);
