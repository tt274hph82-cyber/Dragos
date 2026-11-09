import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import words from './words.json';

// "What if you dug straight down and never stopped?" Blocky-game What If Short in a pixel-block (voxel) look:
// textured blocks, square sun, square-pixel characters and items. Original characters and an invented game:
// no real game's characters, logo or textures.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const OL = '#1A1424';
const B = 120;          // one block
const C = B / 8;        // one texture pixel

// ---------------------------------------------------------------- block textures (8x8 pixels per block)
const SH: Record<string, string[]> = {
  dirt: ['#8A5A3A', '#7A4E32', '#966444', '#6E452C'], stone: ['#8A8A92', '#7C7C84', '#96969E', '#70707A'],
  bedrock: ['#2A2A30', '#3A3A42', '#1E1E24', '#4A4A52'], lava: ['#FF6A1A', '#FF8A1A', '#FFC21A', '#E84A0A'],
  wood: ['#6A4A2A', '#5E4024', '#765434'], leaf: ['#2E8A3A', '#3AA04A', '#267A32'], plank: ['#C89A5A', '#BC8E50', '#D4A666'],
  top: ['#5AC84A', '#4EB840', '#66D456'],
};
const pick = (a: string[], seed: string) => a[Math.floor(random(seed) * a.length)];
const cell = (type: string, i: number): string => {
  const r = Math.floor(i / 8), k = `${type}${i}`;
  if (type === 'grass') return r < 2 || (r === 2 && random(k + 'g') > 0.5) ? pick(SH.top, k) : pick(SH.dirt, k);
  if (type === 'ore') return random(k + 'o') > 0.86 ? (random(k + 'w') > 0.6 ? '#BDF8FF' : '#3AD8E8') : pick(SH.stone, k);
  if (type === 'plank') return r === 3 || r === 7 ? '#A07A40' : pick(SH.plank, k);
  return pick(SH[type], k);
};
const TYPES = ['dirt', 'stone', 'bedrock', 'lava', 'wood', 'leaf', 'plank', 'grass', 'ore'];
/** The texture patterns; put one in every shot. */
const Tex: React.FC = () => (
  <defs>{TYPES.map((ty) => (
    <pattern key={ty} id={`vx-${ty}`} patternUnits="userSpaceOnUse" width={B} height={B}>
      {Array.from({ length: 64 }, (_, i) => <rect key={i} x={(i % 8) * C} y={Math.floor(i / 8) * C} width={C + 0.6} height={C + 0.6} fill={cell(ty, i)} />)}
    </pattern>
  ))}</defs>
);
/** A wall of blocks: cols x rows, top-left at block coordinates (x, y are pixels, multiples of B keep the grid). */
const Wall: React.FC<{ type: string; x?: number; y?: number; cols?: number; rows?: number; dim?: number }> = ({ type, x = -360, y = -360, cols = 15, rows = 22, dim = 0 }) => (
  <g><rect x={x} y={y} width={cols * B} height={rows * B} fill={`url(#vx-${type})`} />{dim ? <rect x={x} y={y} width={cols * B} height={rows * B} fill="#0A0612" opacity={dim} /> : null}</g>
);
/** Pixel art from a character map. */
const Pix: React.FC<{ map: string[]; pal: Record<string, string>; c: number; x?: number; y?: number; r?: number }> = ({ map, pal, c, x = 0, y = 0, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>{map.flatMap((row, j) => row.split('').map((ch, i) => (pal[ch] ? <rect key={`${i}-${j}`} x={(i - row.length / 2) * c} y={(j - map.length / 2) * c} width={c + 0.6} height={c + 0.6} fill={pal[ch]} /> : null)))}</g>
);
const PICK = ['..GGGG..', '.G...BG.', '....B..G', '...B...G', '..B....G', '.B......', 'B.......'];
const SPOON = ['.....WW.', '....WWWW', '....WDWW', '.....WW.', '....W...', '...W....', '..W.....', '.W......'];
const GEM = ['..CCCC..', '.CWCCCC.', 'CCWCCCCD', '.CCCCCD.', '..CCDD..', '...DD...'];
const HEART = ['.RR.RR.', 'RWRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];
const IP = { G: '#B8B8C8', B: '#8A5A3A', W: '#E8E8F0', D: '#A8A8B8', C: '#3AD8E8', R: '#E2262E' };
const GP = { C: '#3AD8E8', W: '#BDF8FF', D: '#1A9AB8' };
const Pickaxe: React.FC<{ c?: number; x?: number; y?: number; r?: number }> = ({ c = 14, ...p }) => <Pix map={PICK} pal={IP} c={c} {...p} />;
const Spoon: React.FC<{ c?: number; x?: number; y?: number; r?: number }> = ({ c = 12, ...p }) => <Pix map={SPOON} pal={IP} c={c} {...p} />;
const GemPx: React.FC<{ c?: number; x?: number; y?: number; r?: number }> = ({ c = 12, ...p }) => <Pix map={GEM} pal={GP} c={c} {...p} />;

// ---------------------------------------------------------------- the pixel-block character
type VFace = 'happy' | 'shock' | 'worried' | 'angry' | 'dizzy' | 'starry' | 'yell';
type VPose = { armL?: number; armR?: number; legL?: number; legR?: number; lean?: number };
const U = 36;
const FACES: Record<VFace, string[]> = {
  happy: ['SSSSSSSS', 'SWPSSPWS', 'SMSSSSMS', 'SSMMMMSS', 'SSSSSSSS'],
  shock: ['SSSSSSSS', 'SWPSSPWS', 'SSSMMSSS', 'SSSMMSSS', 'SSSSSSSS'],
  worried: ['SSSSSSSS', 'SWPSSPWS', 'SSSSSSSS', 'SSMMMMSS', 'SMSSSSMS'],
  angry: ['SBBSSBBS', 'SWPSSPWS', 'SSSSSSSS', 'SSMMMMSS', 'SSSSSSSS'],
  dizzy: ['SSSSSSSS', 'SPPSSPPS', 'SSSSSSSS', 'SSSMMSSS', 'SSSSSSSS'],
  starry: ['SSSSSSSS', 'SGGSSGGS', 'SMSSSSMS', 'SSMMMMSS', 'SSSSSSSS'],
  yell: ['SBBSSBBS', 'SWPSSPWS', 'SSMMMMSS', 'SSMTTMSS', 'SSMMMMSS'],
};
/** Square-pixel character: 8x8 face, block body, arms and legs. kid = miner helmet + red bolt hoodie; mom = purple, bun. */
const Vox: React.FC<{ x: number; y: number; s: number; kind?: 'kid' | 'mom'; face: VFace; t: number; pose?: VPose; hold?: React.ReactNode; r?: number }> = ({ x, y, s, kind = 'kid', face, t, pose = {}, hold, r = 0 }) => {
  const kid = kind === 'kid';
  const p = kid ? { shirt: '#D8323A', dark: '#A82228', pants: '#3A5AB8', pd: '#2A428A' } : { shirt: '#9A7AD8', dark: '#7A5AB8', pants: '#7A5AB8', pd: '#5E428E' };
  const pal: Record<string, string> = { S: '#F4D2B0', H: '#7A4A2A', Y: '#FFD23F', L: '#FFFFFF', W: '#FFFFFF', P: OL, M: '#7A2A2A', B: '#5A3A1A', G: '#FFD23F', T: '#E85A6A' };
  const head = [...(kid ? ['YYYYYYYY', 'YYYLLYYY', 'HSSSSSSH'] : ['HHHHHHHH', 'HHHHHHHH', 'HHSSSSHH']), ...FACES[face]];
  const bob = Math.sin(t * 0.12) * 3;
  const limb = (px: number, py: number, a: number, col: string, dk: string, tip: string, extra?: React.ReactNode) => (
    <g transform={`translate(${px} ${py}) rotate(${a})`}>
      <rect x={-2 * U} y={-U} width={4 * U} height={12 * U} fill={col} stroke={OL} strokeWidth={6} />
      <rect x={U} y={-U} width={U} height={12 * U} fill={dk} />
      <rect x={-2 * U} y={8 * U} width={4 * U} height={3 * U} fill={tip} stroke={OL} strokeWidth={6} />
      {extra}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s}) rotate(${pose.lean ?? 0})`}>
      {limb(-2 * U, -11 * U, pose.legL ?? 0, p.pants, p.pd, '#2A2234')}
      {limb(2 * U, -11 * U, pose.legR ?? 0, p.pants, p.pd, '#2A2234')}
      {limb(-6 * U, -23 * U, pose.armL ?? 6, p.shirt, p.dark, '#F4D2B0')}
      <g transform={`translate(0 ${bob})`}>
        <rect x={-4 * U} y={-24 * U} width={8 * U} height={12 * U} fill={p.shirt} stroke={OL} strokeWidth={6} />
        <rect x={3 * U} y={-24 * U} width={U} height={12 * U} fill={p.dark} />
        {kid ? <Pix map={['..YY', '.YY.', 'YYYY', '.YY.', 'YY..']} pal={{ Y: '#FFD23F' }} c={U} x={-U * 0.5} y={-18.5 * U} /> : <rect x={-U} y={-19 * U} width={2 * U} height={2 * U} fill="#F28AB8" />}
        {!kid ? <rect x={-2 * U} y={-34 * U} width={4 * U} height={2 * U} fill="#7A4A2A" stroke={OL} strokeWidth={6} /> : null}
        <Pix map={head} pal={pal} c={U} x={0} y={-28 * U} />
        <rect x={-4 * U} y={-32 * U} width={8 * U} height={8 * U} fill="none" stroke={OL} strokeWidth={6} />
      </g>
      {limb(6 * U, -23 * U, -(pose.armR ?? 6), p.shirt, p.dark, '#F4D2B0', hold ? <g transform={`translate(0 ${10 * U})`}>{hold}</g> : null)}
    </g>
  );
};

// ---------------------------------------------------------------- sets, signs and effects
const Sky: React.FC<{ t: number; rush?: number }> = ({ t, rush = 0 }) => (
  <g>
    <rect x={-360} y={-360} width={W + 720} height={2640} fill="#8EC5FF" />
    <rect x={760} y={470} width={150} height={150} fill="#FFE27A" /><rect x={775} y={485} width={120} height={120} fill="#FFF2B0" />
    {[[160, 560], [620, 760], [300, 980], [860, 1100]].map(([cx, cy], i) => { const y = rush ? 2000 - ((t * rush + i * 520) % 2400) : cy, x = cx + (rush ? 0 : t * 0.6); return <g key={i} fill="#FFFFFF"><rect x={x - 120} y={y} width={240} height={45} /><rect x={x - 60} y={y - 45} width={150} height={45} /><rect x={x - 90} y={y + 45} width={150} height={30} fill="#E4F0FF" /></g>; })}
  </g>
);
/** The mine shaft: scrolling walls of one layer type, a dark 3-block shaft in the middle. */
const Shaft: React.FC<{ type: string; t: number; speed: number }> = ({ type, t, speed }) => (
  <g>
    <g transform={`translate(0 ${-((t * speed) % B)})`}><Wall type={type} x={-360} y={-360} cols={15} rows={24} /></g>
    <rect x={360} y={-360} width={360} height={2700} fill="#0A0612" opacity={0.62} />
    <rect x={360} y={-360} width={15} height={2700} fill="#0A0612" opacity={0.5} /><rect x={705} y={-360} width={15} height={2700} fill="#0A0612" opacity={0.5} />
  </g>
);
/** Square chips flying off a dig or a break. */
const Chips: React.FC<{ t: number; x: number; y: number; cols: string[]; n?: number; up?: boolean; seed?: string }> = ({ t, x, y, cols, n = 12, up = true, seed = 'c' }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const life = (t * 1.2 + random(`${seed}l${i}`) * 14) % 14, a = random(`${seed}a${i}`) * Math.PI;
    return <rect key={i} x={x + Math.cos(a) * life * 16 - 12} y={y - (up ? 1 : -1) * Math.sin(a) * life * 22 + life * life * 0.9 - 12} width={24} height={24} fill={cols[i % cols.length]} opacity={clamp(1 - life / 14)} />;
  })}</g>
);
/** Chunky pixel streaks rushing vertically (falling speed). */
const Streaks: React.FC<{ t: number; c?: string; o?: number; down?: boolean }> = ({ t, c = '#FFFFFF', o = 0.5, down }) => (
  <g opacity={o}>{Array.from({ length: 16 }, (_, i) => { const y0 = (t * (60 + random(`sk${i}`) * 50) + random(`sy${i}`) * 2400) % 2400; return <rect key={i} x={random(`sx${i}`) * W} y={(down ? y0 : 2400 - y0) - 300} width={12} height={150 + random(`sh${i}`) * 200} fill={c} />; })}</g>
);
/** A bevelled grey sign (retro UI panel) with dark text. */
const Sign: React.FC<{ x?: number; y: number; w: number; h: number; lines: string[]; size?: number; c?: string; t?: number }> = ({ x = 540, y, w, h, lines, size = 60, c = '#2A2A30', t = 99 }) => (
  React.useContext(CloseCtx) || t <= 0 ? null : <g transform={`translate(${x} ${y}) scale(${popIn(t, 5)})`}>
    <rect x={-w / 2 - 9} y={-h / 2 - 9} width={w + 18} height={h + 18} fill={OL} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#C6C6C6" />
    <rect x={-w / 2} y={-h / 2} width={w} height={9} fill="#FFFFFF" /><rect x={-w / 2} y={-h / 2} width={9} height={h} fill="#FFFFFF" />
    <rect x={-w / 2} y={h / 2 - 9} width={w} height={9} fill="#6A6A72" /><rect x={w / 2 - 9} y={-h / 2} width={9} height={h} fill="#6A6A72" />
    {lines.map((l, i) => <text key={i} y={-((lines.length - 1) * size * 0.58) + i * size * 1.16 + size * 0.36} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={size} fill={c}>{l}</text>)}
  </g>
);
const Big: React.FC<{ t: number; text: string; x?: number; y?: number; size?: number; c?: string; rot?: number }> = ({ t, text, x = 540, y = 620, size = 130, c = '#FFD23F', rot = -5 }) => (
  React.useContext(CloseCtx) || t <= 0 ? null : <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${popIn(t, 4)})`}>
    <text x={8} y={8} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={size} fill={OL}>{text}</text>
    <text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={size} fill={c} stroke={OL} strokeWidth={size * 0.1} paintOrder="stroke">{text}</text>
  </g>
);

// ---------------------------------------------------------------- HUD: depth and hearts (fixed overlay)
const L = [1, 2, 3, 4, 5].map((n) => at('Layer', n));
const VOID = at('bottom'), HOME = at('house'), LAVA = at('Lava');
const DEPTHS = [0, 12, 64, 128, 200, 256];
export const DepthBar: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30;
  let k = 0; L.forEach((s, i) => { if (sec >= s) k = i + 1; });
  const d = k === 0 ? 0 : Math.round(lerp(DEPTHS[k - 1], DEPTHS[k], easeOut(clamp((sec - L[k - 1]) / 0.8))));
  const label = sec >= HOME || d === 0 ? '0 m' : sec >= VOID ? '??? m' : `-${d} m`;
  const hearts = sec >= LAVA + 0.4 ? 2 : 3;
  const pop = L.some((s) => sec >= s && sec < s + 0.25) || (sec >= VOID && sec < VOID + 0.25) ? 1.1 : 1;
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-329} y={-55} width={658} height={110} fill={OL} />
      <rect x={-320} y={-46} width={640} height={92} fill="#C6C6C6" />
      <rect x={-320} y={-46} width={640} height={8} fill="#FFFFFF" /><rect x={-320} y={-46} width={8} height={92} fill="#FFFFFF" />
      <rect x={-320} y={38} width={640} height={8} fill="#6A6A72" /><rect x={312} y={-46} width={8} height={92} fill="#6A6A72" />
      <text x={-290} y={16} fontFamily={FONT.game} fontWeight={900} fontSize={40} fill="#4A4A52">DEPTH</text>
      <text x={-130} y={18} fontFamily={FONT.game} fontWeight={900} fontSize={48} fill={sec >= VOID && sec < HOME ? '#7A3AC8' : '#1A1424'}>{label}</text>
      {[0, 1, 2].map((i) => <g key={i} opacity={i < hearts ? 1 : 0.22}><Pix map={HEART} pal={{ R: i < hearts ? '#E2262E' : '#4A4A52', W: i < hearts ? '#FF9A9A' : '#4A4A52' }} c={9} x={150 + i * 62} y={0} /></g>)}
    </g>
  );
};
const LayerBadge: React.FC<{ t: number; n: string; type: string; len?: number }> = ({ t, n, type, len = 30 }) => (
  <g>
    <Tex />
    <g transform={`translate(0 ${-((t * 26) % B)})`}><Wall type={type} dim={0.35} /></g>
    <Streaks t={t} o={0.25} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.2}) rotate(${t < 5 ? lerp(-20, -3, easeOut(t / 5)) : -3})`}>
      <rect x={-279} y={-179} width={558} height={358} fill={OL} />
      <rect x={-270} y={-170} width={540} height={340} fill="#C6C6C6" />
      <rect x={-270} y={-170} width={540} height={12} fill="#FFFFFF" /><rect x={-270} y={-170} width={12} height={340} fill="#FFFFFF" />
      <rect x={-270} y={158} width={540} height={12} fill="#6A6A72" /><rect x={258} y={-170} width={12} height={340} fill="#6A6A72" />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={70} fill="#3A3A42">LAYER</text>
      <text y={120} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={170} fill="#FFD23F" stroke={OL} strokeWidth={16} paintOrder="stroke">{n}</text>
    </g>
  </g>
);
const badge = (n: string, type: string): S => ({ t, len }) => <LayerBadge t={t} n={n} type={type} len={len} />;
const Surface: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Sky t={t} />
    <Wall type="wood" x={120} y={960} cols={1} rows={3} /><Wall type="leaf" x={0} y={720} cols={3} rows={2} /><Wall type="leaf" x={120} y={600} cols={1} rows={1} />
    <Wall type="grass" x={-360} y={1320} cols={15} rows={1} /><Wall type="dirt" x={-360} y={1440} cols={15} rows={8} />
  </g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g><Tex />
    <Surface t={t} />
    <Vox x={620} y={1320} s={0.42} face="happy" t={t} pose={{ armR: 30 }} hold={<Pickaxe c={30} r={-30} />} />
  </g>
);
export const S2: S = ({ t }) => {
  const sw = Math.sin(t * 0.9);
  return (
    <g><Tex />
      <Surface t={t} />
      <rect x={600} y={1320} width={120} height={120} fill="#0A0612" opacity={clamp(t / 20) * 0.8} />
      <Vox x={440} y={1320} s={0.6} face="angry" t={t} pose={{ armR: 70 + sw * 50, lean: 6 }} hold={<Pickaxe c={30} r={-30} />} />
      <Chips t={t} x={660} y={1330} cols={['#5AC84A', '#8A5A3A', '#7A4E32']} seed="d2" />
    </g>
  );
};
const digger = (type: string, speed: number, face: VFace, chips: string[], tool: 'pick' | 'spoon' = 'pick'): S => ({ t }) => (
  <g><Tex />
    <Shaft type={type} t={t} speed={speed} />
    <Vox x={540} y={1150} s={0.28} face={face} t={t} pose={{ armR: 60 + Math.sin(t * 1.1) * 50, armL: 20 }} hold={tool === 'pick' ? <Pickaxe c={30} r={-30} /> : <Spoon c={26} r={150} />} />
    <Chips t={t} x={540} y={1160} cols={chips} seed={type} />
    <Streaks t={t} o={0.18} />
  </g>
);
export const S3 = digger('dirt', 34, 'happy', ['#8A5A3A', '#7A4E32', '#966444']);
export const S4: S = ({ t }) => (
  <g><Tex />
    <g transform={`translate(0 ${-((t * 30) % B)})`}><Wall type="dirt" dim={0.3} /></g>
    <Vox x={540} y={2110} s={1.2} face="happy" t={t} pose={{ armL: 150, armR: 20 }} />
    <Streaks t={t} o={0.2} />
  </g>
);
export const S5: S = ({ t }) => {
  const k = clamp((t - 18) / 14);
  return (
    <g><Tex />
      <Shaft type="stone" t={Math.min(t, 18)} speed={20} />
      <Vox x={540} y={1150} s={0.28} face={t > 18 ? 'shock' : 'angry'} t={t} pose={{ armR: t > 18 ? 120 : 60 + Math.sin(t * 1.1) * 50, armL: t > 18 ? 120 : 20 }} hold={t > 18 ? undefined : <Pickaxe c={30} r={-30} />} />
      {t > 18 ? <g>
        <Pix map={PICK.slice(0, 3)} pal={IP} c={12} x={640 + k * 160} y={1000 - k * 260 + k * k * 200} r={k * 300} />
        <Pix map={PICK.slice(3)} pal={IP} c={12} x={440 - k * 140} y={1040 - k * 200 + k * k * 220} r={-k * 260} />
        <Big t={t - 18} text="SNAP!" y={640} c="#FF4A4A" />
      </g> : null}
    </g>
  );
};
export const S6: S = ({ t }) => (
  <g><Tex />
    <Wall type="stone" dim={0.55} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={540 - 30} y={840 - 700} width={60} height={420} fill="#FFD23F" opacity={0.14} transform={`rotate(${i * 30 + t * 1.2} 540 840)`} />)}
    <g transform={`translate(540 860) scale(${popIn(t, 6)})`}><Spoon c={64} r={Math.sin(t * 0.2) * 6} /></g>
    <Sign y={500} w={700} h={130} lines={['NEW TOOL: SPOON']} size={62} t={t - 4} />
  </g>
);
const GemsUp: React.FC<{ t: number; n?: number; sp?: number }> = ({ t, n = 10, sp = 40 }) => (
  <g>{Array.from({ length: n }, (_, i) => <GemPx key={i} c={14} x={i % 2 ? 200 + random(`gx${i}`) * 140 : 740 + random(`gx${i}`) * 140} y={2100 - ((t * sp + random(`gy${i}`) * 2300) % 2300)} />)}</g>
);
export const S7: S = ({ t }) => (
  <g><Tex />
    <Shaft type="ore" t={t} speed={44} />
    <GemsUp t={t} />
    <Vox x={540} y={1150} s={0.28} face="starry" t={t} pose={{ armL: 110, armR: 110 }} />
    <Streaks t={t} o={0.2} />
  </g>
);
export const S8: S = ({ t }) => (
  <g><Tex />
    <g transform={`translate(0 ${-((t * 44) % B)})`}><Wall type="ore" dim={0.3} /></g>
    <GemsUp t={t} n={8} sp={60} />
    <Vox x={540} y={2110} s={1.2} face="yell" t={t} pose={{ armL: 160, armR: 160 }} />
    <Streaks t={t} o={0.25} />
  </g>
);
export const S9: S = ({ t }) => {
  const x = lerp(160, 860, clamp(t / 70)), bobY = Math.sin(t * 0.4) * 12;
  return (
    <g><Tex />
      <Wall type="stone" dim={0.6} />
      <rect x={-360} y={900} width={W + 720} height={700} fill="#FF6A1A" opacity={0.18} />
      <g transform={`translate(${-((t * 4) % B)} 0)`}><Wall type="lava" x={-360} y={1260} cols={16} rows={8} /></g>
      {Array.from({ length: 6 }, (_, i) => { const life = (t * 0.8 + i * 5) % 20; return <rect key={i} x={120 + i * 170} y={1250 - life * 12} width={30} height={30} fill="#FFC21A" opacity={clamp(1 - life / 20)} />; })}
      <g transform={`translate(${x} ${1240 + bobY})`}>
        <rect x={-190} y={-6} width={380} height={56} fill="#C89A5A" stroke={OL} strokeWidth={6} /><rect x={-190} y={32} width={380} height={18} fill="#A07A40" /><rect x={120} y={8} width={24} height={24} fill="#FFD23F" stroke={OL} strokeWidth={4} />
        <Vox x={0} y={-6} s={0.3} face="worried" t={t} pose={{ armL: 80, armR: 80, legL: 14, legR: -14, lean: 6 }} />
      </g>
      <Streaks t={t} c="#FFC21A" o={0.12} />
    </g>
  );
};
export const S10: S = ({ t }) => {
  const k = clamp(t / 40);
  return (
    <g><Tex />
      <Wall type="stone" dim={0.62} />
      <Wall type="bedrock" x={-360} y={1200} cols={15} rows={8} />
      <Vox x={430} y={1200} s={0.4} face="angry" t={t} pose={{ armR: 50 + Math.sin(t * 1.3) * 40, lean: 8 }} hold={<Spoon c={30} r={150} />} />
      <path d={`M 640 1205 l ${40 * k} ${60 * k} l ${-50 * k} ${50 * k} l ${70 * k} ${70 * k} M 640 1205 l ${-60 * k} ${40 * k} M 640 1205 l ${110 * k} ${30 * k} l ${40 * k} ${70 * k}`} stroke="#FFD23F" strokeWidth={10} fill="none" />
      <Chips t={t} x={640} y={1200} cols={['#3A3A42', '#4A4A52', '#FFD23F']} n={6} seed="bd" />
      <Sign y={560} w={640} h={130} lines={['UNBREAKABLE']} size={66} c="#B8242A" t={t - 3} />
    </g>
  );
};
export const S11: S = ({ t }) => {
  const k = clamp(t / 20);
  return (
    <g><Tex />
      <Wall type="stone" dim={0.62} />
      <Wall type="bedrock" x={-360} y={1200} cols={15} rows={8} />
      <rect x={300} y={1200} width={480} height={1000} fill="#0A0618" />
      {Array.from({ length: 10 }, (_, i) => { const a = random(`bk${i}`) * Math.PI, d = k * (300 + random(`bd${i}`) * 400); return <g key={i} transform={`translate(${540 + Math.cos(a) * d} ${1200 - Math.sin(a) * d + k * k * 500}) rotate(${k * 400 * (i % 2 ? 1 : -1)})`}><rect x={-60} y={-60} width={120} height={120} fill="url(#vx-bedrock)" stroke={OL} strokeWidth={6} /></g>; })}
      <Vox x={540} y={1150 + k * 260} s={0.34} face="shock" t={t} pose={{ armL: 150, armR: 150 }} hold={<Spoon c={30} r={150} />} />
      <Big t={t - 1} text="CRACK!" y={640} />
    </g>
  );
};
const Void: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-360} y={-360} width={W + 720} height={2640} fill="#0A0618" />
    {Array.from({ length: 40 }, (_, i) => <rect key={i} x={random(`vx${i}`) * W} y={2200 - ((t * (30 + random(`vv${i}`) * 50) + random(`vy${i}`) * 2500) % 2500)} width={12} height={12 + random(`vh${i}`) * 60} fill={['#FFFFFF', '#C8A8FF', '#7A3AC8'][i % 3]} opacity={0.8} />)}
  </g>
);
export const S12: S = ({ t }) => (
  <g><Tex />
    <Void t={t} />
    <Wall type="bedrock" x={-360} y={-360} cols={15} rows={lerp(6, 3, clamp(t / 30)) | 0} />
    <Vox x={540} y={lerp(700, 1150, clamp(t / 40))} s={0.3} face="shock" t={t} pose={{ armL: 160, armR: 160, legL: 20, legR: -20 }} r={Math.sin(t * 0.2) * 20} />
  </g>
);
export const S13: S = ({ t }) => (
  <g><Tex />
    <Void t={t * 1.6} />
    <Vox x={540} y={2110} s={1.2} face="yell" t={t} pose={{ armL: 165, armR: 165 }} />
    <Streaks t={t} c="#C8A8FF" o={0.35} />
  </g>
);
const House: React.FC<{ x: number; y: number; s?: number; hole?: boolean }> = ({ x, y, s = 1, hole }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Wall type="plank" x={-300} y={-360} cols={5} rows={3} />
    <rect x={-60} y={-240} width={120} height={240} fill="#6A4A2A" stroke={OL} strokeWidth={6} /><rect x={20} y={-130} width={20} height={20} fill="#FFD23F" />
    <rect x={-240} y={-270} width={120} height={120} fill="#BDEBFF" stroke={OL} strokeWidth={6} /><rect x={120} y={-270} width={120} height={120} fill="#BDEBFF" stroke={OL} strokeWidth={6} />
    {[0, 1, 2].map((i) => <Wall key={i} type="wood" x={-360 + i * 120} y={-480 - i * 120} cols={6 - i * 2} rows={1} />)}
    {hole ? <rect x={-60} y={-720} width={120} height={240} fill="#0A0612" /> : null}
  </g>
);
export const S14: S = ({ t }) => (
  <g><Tex />
    <Sky t={t} rush={50} />
    <g transform={`translate(0 ${lerp(900, 0, easeOut(clamp(t / 30)))})`}>
      <Wall type="grass" x={-360} y={1560} cols={15} rows={1} /><Wall type="dirt" x={-360} y={1680} cols={15} rows={6} />
      <House x={540} y={1560} s={0.9} />
    </g>
    <Vox x={540} y={lerp(700, 1000, clamp(t / 30))} s={0.26} face="yell" t={t} pose={{ armL: 165, armR: 165, legL: 20, legR: -20 }} />
    <Streaks t={t} o={0.4} />
  </g>
);
const Room: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Wall type="plank" dim={0.18} />
    <rect x={420} y={-360} width={240} height={720} fill="#8EC5FF" /><rect x={420} y={340} width={240} height={20} fill={OL} opacity={0.4} />
    <path d="M 420 360 L 660 360 L 900 1260 L 180 1260 Z" fill="#FFF2B0" opacity={0.22} />
    <Wall type="wood" x={-360} y={1260} cols={15} rows={8} />
    {[[250, 1220, 20], [820, 1235, -30], [700, 1210, 50]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-36} y={-36} width={72} height={72} fill="url(#vx-wood)" stroke={OL} strokeWidth={5} /></g>)}
  </g>
);
export const S15: S = ({ t }) => (
  <g><Tex />
    <Room t={t} />
    <Vox x={540} y={lerp(300, 1260, easeOut(clamp(t / 6)))} s={0.36} face={t > 6 ? 'dizzy' : 'yell'} t={t} pose={{ armL: t > 6 ? 100 : 165, armR: t > 6 ? 100 : 165, legL: t > 6 ? 30 : 0, legR: t > 6 ? -30 : 0 }} />
    {t > 6 ? <Chips t={t - 6} x={540} y={1250} cols={['#6A4A2A', '#C89A5A', '#FFFFFF']} seed="ld" /> : null}
    <Big t={t - 6} text="THUD!" y={620} />
  </g>
);
export const S16: S = ({ t }) => (
  <g><Tex />
    <Wall type="plank" dim={0.3} />
    <Vox x={540} y={2150} s={1.2} kind="mom" face="yell" t={t} pose={{ armL: 30, armR: 165 }} />
    <Streaks t={t} c="#FF8A8A" o={0.25} />
  </g>
);
export const S17: S = ({ t }) => (
  <g><Tex />
    <Room t={t} />
    <Vox x={380} y={1260} s={0.4} face="happy" t={t} pose={{ armR: 40 }} hold={<Spoon c={30} r={150} />} />
    <Vox x={760} y={1260} s={0.44} kind="mom" face="angry" t={t} pose={{ armL: 20, armR: 20 }} />
    <Sign y={560} w={600} h={120} lines={['COMMENT DIG']} size={62} t={t - 3} />
  </g>
);
export const S21 = badge('1', 'dirt');
export const S22 = badge('2', 'stone');
export const S23 = badge('3', 'ore');
export const S24 = badge('4', 'lava');
export const S25 = badge('5', 'bedrock');
export const S27 = digger('stone', 20, 'angry', ['#8A8A92', '#7C7C84']);
export const S26 = digger('stone', 14, 'worried', ['#8A8A92', '#7C7C84'], 'spoon');   // "dig with a spoon"

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S30 = close(S2, 540, 1050, 1.35, 12);    // "never": the first swings
export const S31 = close(S7, 540, 1000, 1.7, 20);    // "can't stop": gems rushing past
export const S32 = close(S9, 560, 1120, 1.6, 34);    // "door": surfing
export const S33 = close(S10, 560, 1150, 1.7, 20);   // "Nobody": the cracks
export const S34 = close(S11, 540, 1250, 1.5, 6);    // "With the spoon": falling through
export const S35 = close(S14, 540, 1150, 1.3, 22);   // "land": the house rushing up
export const S36 = close(S3, 540, 1000, 1.7, 20);    // "Easy": digging dirt
