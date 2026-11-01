import React from 'react';
import { rnd } from '../anim';
import { DuskSky, Sun, Skyline, Haze } from '../kit';
import { S3 } from '../room';
import { Glow } from '../light';

// Outdoor sets at dusk, side-on like the rooftop, so characters walk and run in profile across them.
// kind 'field'  : the school sports field: school building and bleachers behind, a 3-lane track (lanes at y 830, 900,
//                 970: feet on those lines), start line at x 300, finish line at x 1560.
// kind 'street' : one long street: bus shelter (x 150-450), lamp posts, a cafe with a warm window (x 800-1150),
//                 a bench (x 1250-1450, seat at y 800), school gates (x 1560-1900), houses across the road behind.
//                 Pavement for feet at y 860.
// kind 'garden' : the back garden: the house's back wall and lit door on the left, a wooden fence across the back,
//                 a tree and a shed, a pond at (1250, 905). Feet on the grass at y 860.
// `frozen` stops the ambient motion (birds, ripples, leaves): pass it in paused shots. `red` floods the sky for the turn.
export const OUT = {
  lanes: [830, 900, 970],
  start: 300,
  finish: 1560,
  feet: 860,
  bench: { x: 1350, seat: 800 },
  pond: { x: 1250, y: 905, rx: 300, ry: 66 },
};

const Birds: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const bx = ((200 + t * (1.1 + i * 0.15) + i * 520) % 2300) - 200;
      const by = 200 + i * 40 + Math.sin(t / 18 + i) * 10;
      const fl = Math.sin(t / 2.6 + i * 1.3) * 7;
      return <path key={i} d={`M ${bx - 13} ${by + fl * 0.4} Q ${bx - 6} ${by - 6 + fl} ${bx} ${by} Q ${bx + 6} ${by - 6 + fl} ${bx + 13} ${by + fl * 0.4}`} stroke="#2A1A30" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />;
    })}
  </g>
);

const Lamp: React.FC<{ x: number; base: number; on?: boolean }> = ({ x, base, on = true }) => (
  <g>
    <path d={`M ${x} ${base} L ${x} ${base - 360} Q ${x} ${base - 390} ${x + 40} ${base - 390}`} stroke="#1A1424" strokeWidth={10} fill="none" />
    <path d={`M ${x + 26} ${base - 392} L ${x + 64} ${base - 392} L ${x + 56} ${base - 372} L ${x + 34} ${base - 372} Z`} fill="#2A2234" />
    {on ? <><circle cx={x + 45} cy={base - 368} r={9} fill="#FFE2B0" /><Glow x={x + 45} y={base - 360} r={160} o={0.7} /></> : null}
  </g>
);

const Tree: React.FC<{ x: number; base: number; t: number; frozen?: boolean; s?: number }> = ({ x, base, t, frozen, s = 1 }) => {
  const sway = frozen ? 0 : Math.sin(t / 20) * 4;
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <path d="M -14 0 L -8 -220 L 8 -220 L 14 0 Z" fill="#2A1C22" />
      <g transform={`rotate(${sway} 0 -220)`}>
        {[[-60, -260, 110], [50, -280, 120], [0, -350, 130], [-90, -330, 90], [90, -340, 90]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? '#2E3B2E' : '#354634'} />
        ))}
        <path d="M -150 -300 Q -40 -420 120 -380" stroke={S3.warm} strokeWidth={5} opacity={0.35} fill="none" />
      </g>
    </g>
  );
};


/** A long soft shadow cast along the ground by an object of width w and height h standing at x, away from the sun. */
const LongShadow: React.FC<{ x: number; base: number; w: number; h: number; sunX: number; o?: number }> = ({ x, base, w, h, sunX, o = 0.45 }) => {
  const dir = x >= sunX ? 1 : -1;
  const len = Math.min(1.6, 0.5 + Math.abs(x - sunX) / 900) * h * 0.55;
  return (
    <path d={`M ${x - w / 2} ${base} L ${x + w / 2} ${base} L ${x + w / 2 + dir * len} ${base + h * 0.12} L ${x - w / 2 + dir * len} ${base + h * 0.12} Z`}
      fill="#0A0612" opacity={o} filter="url(#blur6)" style={{ mixBlendMode: 'multiply' }} />
  );
};
/** A warm pool of light on the ground (lamps, doorways, windows): a soft radial falloff, no hard edge. */
const Pool: React.FC<{ x: number; y: number; rx: number; ry: number; o?: number; color?: string }> = ({ x, y, rx, ry, o = 0.35, color = '#FFB070' }) => {
  const id = `pool${Math.round(x)}_${Math.round(y)}_${Math.round(rx)}`;
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={o} />
          <stop offset="55%" stopColor={color} stopOpacity={o * 0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} />
    </g>
  );
};
/** Darkens the ground toward the camera and the frame edges, so the middle distance (where people stand) reads. */
const GroundShade: React.FC<{ id: string; top: number }> = ({ id, top }) => (
  <g style={{ mixBlendMode: 'multiply' }}>
    <defs>
      <linearGradient id={`${id}gs`} x1="0" y1={top} x2="0" y2={top + 500} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
        <stop offset="100%" stopColor="#1A1028" stopOpacity={0.6} />
      </linearGradient>
    </defs>
    <rect x={-400} y={top} width={2720} height={900} fill={`url(#${id}gs)`} />
  </g>
);

export const Outdoor: React.FC<{ t: number; kind: 'field' | 'street' | 'garden'; id?: string; red?: number; frozen?: boolean; sunX?: number; sunY?: number }> = ({
  t, kind, id = 'out', red = 0, frozen = false, sunX = 1400, sunY = 560,
}) => {
  const tt = frozen ? 0 : t;
  const horizon = kind === 'field' ? 700 : 640;
  return (
    <g>
      <DuskSky id={`${id}sky`} horizonY={horizon + 60} red={red} />
      <Sun x={sunX} y={sunY} r={130} t={tt} red={red} />
      <Birds t={tt} />
      <Skyline y={horizon} seed={kind === 'street' ? 71 : 41} color={red > 0.5 ? '#3A1222' : '#4A3560'} h={170} />
      <Haze y={horizon - 120} o={0.25} />
      {kind === 'field' ? <Field t={tt} sunX={sunX} id={id} /> : null}
      {kind === 'street' ? <Street t={tt} sunX={sunX} id={id} /> : null}
      {kind === 'garden' ? <Garden t={tt} frozen={frozen} sunX={sunX} id={id} /> : null}
      {red > 0 ? <rect x={-400} y={-400} width={2720} height={1900} fill="#16000A" opacity={0.42 * red} /> : null}
    </g>
  );
};

const Field: React.FC<{ t: number; sunX: number; id: string }> = ({ t, sunX, id }) => (
  <g>
    {/* the school building behind, lit windows */}
    <rect x={240} y={450} width={900} height={260} fill="#3A2C48" />
    <path d="M 220 450 L 690 360 L 1160 450 Z" fill="#2E2240" />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={280 + (i % 6) * 140} y={490 + Math.floor(i / 6) * 100} width={70} height={56} fill={rnd(81, i) > 0.4 ? '#FFC27A' : '#2A2036'} opacity={0.8} />
    ))}
    {/* bleachers with a crowd on the right */}
    <path d="M 1260 700 L 1260 560 L 1900 520 L 1900 700 Z" fill="#2A2234" />
    {Array.from({ length: 40 }).map((_, i) => (
      <circle key={i} cx={1290 + (i % 20) * 31} cy={600 - (i % 20) * 2 + Math.floor(i / 20) * 50} r={12} fill={['#C8582E', '#3E8C86', '#8E7CC3', '#E9C46A'][i % 4]} opacity={0.75} />
    ))}
    {/* grass, then the track */}
    <rect x={-400} y={700} width={2720} height={100} fill="#3B4A33" />
    <rect x={-400} y={800} width={2720} height={260} fill="#9A4A3A" />
    {OUT.lanes.map((y, i) => <rect key={i} x={-400} y={y + 30} width={2720} height={4} fill="#F3E6D6" opacity={0.7} />)}
    <rect x={-400} y={800} width={2720} height={4} fill="#F3E6D6" opacity={0.7} />
    <rect x={OUT.start} y={800} width={8} height={240} fill="#F3E6D6" />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={OUT.finish + (i % 2) * 12} y={800 + i * 20} width={12} height={20} fill={i % 2 ? '#F3E6D6' : '#1A1424'} />
    ))}
    <rect x={-400} y={1060} width={2720} height={400} fill="#3B4A33" />
    {/* the low sun throws the building and the stands across the grass and the track */}
    <LongShadow x={690} base={712} w={900} h={260} sunX={sunX} o={0.35} />
    <LongShadow x={1580} base={712} w={640} h={180} sunX={sunX} o={0.3} />
    <Pool x={sunX} y={760} rx={700} ry={70} o={0.25} />
    <GroundShade id={id} top={760} />
  </g>
);

const Street: React.FC<{ t: number; sunX: number; id: string }> = ({ t, sunX, id }) => (
  <g>
    {/* houses across the road */}
    {[[-300, 360], [120, 400], [520, 340], [1180, 380], [1620, 350], [2000, 390]].map(([x, top], i) => (
      <g key={i}>
        <rect x={x} y={top} width={380} height={760 - top} fill={i % 2 ? '#3A2C48' : '#433252'} />
        <path d={`M ${x - 20} ${top} L ${x + 190} ${top - 90} L ${x + 400} ${top} Z`} fill="#2A2036" />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={x + 50 + (k % 2) * 180} y={top + 50 + Math.floor(k / 2) * 150} width={90} height={80} fill={rnd(91 + i, k) > 0.5 ? '#FFC27A' : '#241C30'} opacity={0.85} />
        ))}
      </g>
    ))}
    {/* the cafe: awning, warm window, a figure-free interior */}
    <rect x={800} y={470} width={350} height={290} fill="#5A3A3A" />
    <path d="M 790 470 L 1160 470 L 1140 520 L 810 520 Z" fill="#B85A4A" />
    {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M ${810 + i * 50} 470 L ${830 + i * 50} 520`} stroke="#F3E6D6" strokeWidth={10} opacity={0.5} />)}
    <rect x={830} y={540} width={290} height={190} fill="#FFB86A" opacity={0.85} />
    <Glow x={975} y={640} r={300} o={0.6} />
    <text x={975} y={505} textAnchor="middle" fontFamily="Fragment Mono" fontSize={26} fill="#F3E6D6">CAFE</text>
    {/* pavement and road */}
    <rect x={-400} y={760} width={2720} height={110} fill="#3A3444" />
    <rect x={-400} y={760} width={2720} height={4} fill={S3.warm} opacity={0.4} />
    <rect x={-400} y={870} width={2720} height={600} fill="#24202C" />
    {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-380 + i * 200} y={960} width={110} height={10} fill="#E9C46A" opacity={0.5} />)}
    {/* bus shelter */}
    <rect x={150} y={560} width={300} height={14} fill="#2A2234" />
    <rect x={160} y={574} width={10} height={290} fill="#2A2234" />
    <rect x={430} y={574} width={10} height={290} fill="#2A2234" />
    <rect x={180} y={590} width={240} height={160} fill="#9FC0FF" opacity={0.18} />
    <rect x={250} y={520} width={100} height={40} rx={8} fill="#3E8C86" />
    <text x={300} y={548} textAnchor="middle" fontFamily="Fragment Mono" fontSize={22} fill="#F3E6D6">BUS</text>
    <Lamp x={600} base={860} />
    <Lamp x={1500} base={860} />
    {/* the bench */}
    <rect x={1250} y={790} width={200} height={16} rx={4} fill="#6A4A3A" />
    <rect x={1250} y={740} width={200} height={14} rx={4} fill="#6A4A3A" />
    <path d="M 1265 806 L 1265 860 M 1435 806 L 1435 860" stroke="#2A2234" strokeWidth={8} />
    {/* school gates */}
    <path d="M 1560 860 L 1560 560 M 1900 860 L 1900 560 M 1560 600 Q 1730 470 1900 600" stroke="#1A1424" strokeWidth={14} fill="none" />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M ${1590 + i * 36} 860 L ${1590 + i * 36} ${600 - Math.sin((i / 8) * Math.PI) * 90}`} stroke="#1A1424" strokeWidth={6} />)}
    <text x={1730} y={590} textAnchor="middle" fontFamily="Fragment Mono" fontSize={24} fill="#E9C46A">SCHOOL</text>
    {/* shadows from the low sun, pools of lamp and window light on the pavement */}
    <LongShadow x={300} base={862} w={300} h={300} sunX={sunX} o={0.4} />
    <LongShadow x={600} base={862} w={14} h={390} sunX={sunX} o={0.5} />
    <LongShadow x={1500} base={862} w={14} h={390} sunX={sunX} o={0.5} />
    <LongShadow x={1350} base={862} w={200} h={70} sunX={sunX} o={0.45} />
    <LongShadow x={1730} base={862} w={340} h={300} sunX={sunX} o={0.3} />
    <Pool x={645} y={866} rx={220} ry={40} o={0.4} />
    <Pool x={1545} y={866} rx={220} ry={40} o={0.4} />
    <Pool x={975} y={850} rx={300} ry={46} o={0.35} />
    <GroundShade id={id} top={860} />
  </g>
);

const Garden: React.FC<{ t: number; frozen?: boolean; sunX: number; id: string }> = ({ t, frozen, sunX, id }) => {
  const P = OUT.pond;
  return (
    <g>
      {/* the fence across the back */}
      <rect x={-400} y={560} width={2720} height={220} fill="#5A4034" />
      {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={-400 + i * 70} y={550 - (i % 2) * 10} width={60} height={230} fill={i % 2 ? '#6A4A3A' : '#634436'} />)}
      <rect x={-400} y={600} width={2720} height={10} fill="#4A3228" />
      <rect x={-400} y={720} width={2720} height={10} fill="#4A3228" />
      <Tree x={1700} base={790} t={t} frozen={frozen} s={1.2} />
      {/* the shed */}
      <rect x={1880} y={560} width={300} height={240} fill="#3E4A3A" />
      <path d="M 1860 560 L 2030 470 L 2200 560 Z" fill="#2E3A2C" />
      {/* the house's back wall and the lit back door */}
      <rect x={-400} y={250} width={760} height={560} fill="#4A3A4E" />
      <rect x={180} y={520} width={140} height={260} fill="#FFC27A" />
      <rect x={180} y={520} width={140} height={260} fill="none" stroke="#2A2036" strokeWidth={10} />
      <Glow x={250} y={660} r={260} o={0.7} />
      <rect x={-200} y={380} width={180} height={150} fill="#FFC27A" opacity={0.8} />
      {/* grass */}
      <rect x={-400} y={780} width={2720} height={700} fill="#3B4A33" />
      {Array.from({ length: 80 }).map((_, i) => (
        <path key={i} d={`M ${-300 + rnd(95, i) * 2400} ${800 + rnd(96, i) * 260} l 4 -14 l 4 14`} stroke="#4E6044" strokeWidth={3} fill="none" />
      ))}
      {/* the fence's shadow along the grass, the tree and shed's long shadows, the back door's light spilling out */}
      <rect x={-400} y={780} width={2720} height={40} fill="#0A0612" opacity={0.3} filter="url(#blur6)" />
      <LongShadow x={1700} base={790} w={60} h={420} sunX={sunX} o={0.4} />
      <LongShadow x={2030} base={800} w={300} h={240} sunX={sunX} o={0.35} />
      <Pool x={250} y={830} rx={260} ry={70} o={0.45} />
      <GroundShade id={id} top={790} />
      {/* the pond: stones round the edge, water holding the sky, reeds; ripples stop when frozen */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <ellipse key={i} cx={P.x + Math.cos(a) * (P.rx + 14)} cy={P.y + Math.sin(a) * (P.ry + 8)} rx={30} ry={14} fill="#6A6470" />;
      })}
      <ellipse cx={P.x} cy={P.y} rx={P.rx} ry={P.ry} fill="#3A5A7A" />
      <ellipse cx={P.x - 40} cy={P.y - 14} rx={P.rx * 0.7} ry={P.ry * 0.45} fill="#E0906A" opacity={0.35} />
      {[0, 1, 2].map((k) => {
        const p = ((t / 40 + k / 3) % 1);
        return <ellipse key={k} cx={P.x + 80} cy={P.y + 4} rx={30 + p * 160} ry={(30 + p * 160) * 0.22} fill="none" stroke="#BFD8F0" strokeWidth={2} opacity={0.5 * (1 - p)} />;
      })}
      {[0, 1, 2, 3, 4].map((k) => (
        <path key={k} d={`M ${P.x + P.rx - 30 + k * 12} ${P.y} q ${-6 + k * 3} -60 ${4 + k * 2} -110`} stroke="#4E6044" strokeWidth={5} fill="none" />
      ))}
    </g>
  );
};
