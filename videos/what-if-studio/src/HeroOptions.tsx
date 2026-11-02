import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, Pose, LOOKS, CastName, KitDefs, SetDefs, Study, FONT } from './engine';

// Hero candidates for the channel: each one front, three-quarter, and acting, over the dark study so contrast is
// judged where they'll live. Render: npx remotion still src/index.ts HeroOptions out/hero-options.png
const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });
const CANDS: { c: CastName; name: string; tag: string }[] = [
  { c: 'afro', name: 'STORY HOST', tag: 'afro · handlebar · velvet blazer' },
  { c: 'kit', name: 'KIT', tag: 'workshop goggles · rust jacket' },
  { c: 'juno', name: 'JUNO', tag: 'top bun + star clip · lilac hoodie' },
];

export const HeroOptions: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      <g filter="url(#blur10)"><Study t={0} id="opts" /></g>
      <rect width={1920} height={1080} fill="#0B0816" opacity={0.45} />
      {CANDS.map((k, i) => {
        const cx = 330 + i * 630;
        return (
          <g key={k.c}>
            <rect x={cx - 290} y={60} width={580} height={960} rx={28} fill="#000" opacity={0.25} />
            <Hero look={LOOKS[k.c]} pose={P({ x: cx - 120, y: 520, scale: 1, yaw: 0, expr: 'happy' })} shadow={0.7} />
            <Hero look={LOOKS[k.c]} pose={P({ x: cx + 140, y: 520, scale: 1, yaw: 0.5, look: 0.6, expr: 'smug', armR: { a: 95, b: -5 }, handR: 'point', sway: 14 })} shadow={0.7} />
            <Hero look={LOOKS[k.c]} pose={P({ x: cx - 120, y: 860, scale: 0.62, yaw: -0.3, expr: 'shock', armL: { a: 60, b: 40 }, armR: { a: 60, b: 40 } })} shadow={0.6} />
            <Hero look={LOOKS[k.c]} pose={P({ x: cx + 140, y: 860, scale: 0.62, expr: 'cool', glasses: 1, armL: { a: 135, b: 20 }, armR: { a: 135, b: 20 } })} shadow={0.6} />
            <text x={cx} y={150} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={64} fill="#F6EFE3">{k.name}</text>
            <text x={cx} y={190} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#F2B33D" letterSpacing={1.5}>{k.tag.toUpperCase()}</text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
