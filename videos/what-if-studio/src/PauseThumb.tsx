import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, HERO, basePose, HEAD, KitDefs, SetDefs, Classroom, Outdoor, OUT, Dial, FONT } from './engine';

// YouTube thumbnails for the Pause episode (1280x720, drawn at 1920x1080 and scaled).
// A: Juno in full colour, cheeks puffed, against a frozen grey classroom; "PAUSE TIME?"
// B: Juno over the frozen pond splash; "HOLD YOUR BREATH"
const Splash: React.FC<{ cx: number; cy: number; s: number }> = ({ cx, cy, s }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    {Array.from({ length: 18 }).map((_, i) => {
      const a = (i / 18) * Math.PI;
      return <ellipse key={i} cx={Math.cos(a) * (110 + (i % 3) * 34)} cy={-Math.sin(a) * (90 + (i % 4) * 28)} rx={11} ry={15} fill="#CFE6F7" />;
    })}
    <path d="M -150 0 Q -100 -70 -60 -20 Q -20 -100 20 -20 Q 60 -80 100 -20 Q 135 -55 160 0 Z" fill="#A8D2EE" />
  </g>
);

const Word: React.FC<{ x: number; y: number; size: number; color: string; children: string; anchor?: 'start' | 'end' | 'middle' }> = ({ x, y, size, color, children, anchor = 'start' }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT.title} fontWeight={800} fontSize={size} fill={color} stroke="#120C18" strokeWidth={size * 0.12} paintOrder="stroke" letterSpacing={-2}>{children}</text>
);

export const PauseThumb: React.FC<{ variant: 'A' | 'B' }> = ({ variant }) => {
  const sc = 4.6;
  const head = variant === 'A' ? { x: 560, y: 560 } : { x: 600, y: 520 };
  return (
    <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        {variant === 'A' ? (
          <g style={{ filter: 'saturate(0.15) brightness(0.75) contrast(1.1)' }}>
            <g transform="translate(-200 -150) scale(1.35)"><Classroom t={300} id="thA" /></g>
          </g>
        ) : (
          <g style={{ filter: 'saturate(0.2) brightness(0.7) contrast(1.1)' }}>
            <g transform={`translate(${-OUT.pond.x * 2.2 + 1350} ${-OUT.pond.y * 2.2 + 900}) scale(2.2)`}>
              <Outdoor t={0} kind="garden" frozen id="thB" />
              <Splash cx={OUT.pond.x - 60} cy={OUT.pond.y} s={0.9} />
            </g>
          </g>
        )}
        <rect x={0} y={0} width={1920} height={1080} fill="none" stroke="#BFE3FF" strokeWidth={14} opacity={0.7} />
        <rect x={0} y={0} width={1920} height={1080} fill="url(#kitVignette)" opacity={0} />
        {/* the hero, in full colour: the one thing that isn't frozen */}
        <Hero look={HERO} pose={{ ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.25, look: 0.5, expr: 'puff', armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } }} shadow={0} rimId="rimR" />
        <g transform="translate(70 70)">
          <rect width={300} height={84} rx={42} fill="#120C18" opacity={0.85} />
          <rect x={44} y={20} width={16} height={44} rx={3} fill="#FFB15A" />
          <rect x={72} y={20} width={16} height={44} rx={3} fill="#FFB15A" />
          <text x={110} y={56} fontFamily={FONT.ui} fontSize={34} fill="#F6EFE3">PAUSED</text>
        </g>
        {variant === 'A' ? (
          <g>
            <Word x={1860} y={420} size={190} color="#FFFFFF" anchor="end">PAUSE</Word>
            <Word x={1860} y={600} size={190} color="#FFD45C" anchor="end">TIME?</Word>
            <Dial x={1560} y={820} r={150} p={0.08} readout="0:04" size={64} />
          </g>
        ) : (
          <g>
            <Word x={1860} y={330} size={150} color="#FFFFFF" anchor="end">HOLD</Word>
            <Word x={1860} y={480} size={150} color="#FFFFFF" anchor="end">YOUR</Word>
            <Word x={1860} y={630} size={150} color="#FF6A5A" anchor="end">BREATH</Word>
            <Dial x={1600} y={850} r={140} p={0.05} readout="0:02" size={60} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
