import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT, LEG_LEN, HEAD } from '../../engine';
import { W, Mood, MOODS, Sky, Punch, Burst, Calendar, popIn, clamp, lerp, easeOut, Glow, INK } from '../molasses/kit';
import { Rays, Clouds, Shadow } from '../great-stink/shots';
import { Man, Txt, Speech, Crowd, Sea, scr } from '../exploding-whale/shots';
import { makeKitCam, CamKey } from '../kitcam';
import words from './words.json';
import ep from './episode.json';

// "The Cadaver Synod" (Rome, 897): Dancing Plague v2 look (flat silhouettes with glowing rims, one colour mood per scene,
// colour only on the key thing: papal gold and red), faces with expressions, candlelight and deep shadows, and the
// animated-shorts-kit long-take camera (kitcam.tsx): each take is one camera travelling between subjects on the words.

type S = React.FC<ShotProps>;
const { Take, w } = makeKitCam(words as { w: string; s: number }[], (ep as any).takes as Record<string, CamKey[]>);
const GOLD = '#E8B84A', RED = '#B8202A', BONE = '#D8D2C0', ROBE = '#F2ECDC';

// ---------------------------------------------------------------- light and people
const Candle: React.FC<{ x: number; y: number; s?: number; t: number; out?: number }> = ({ x, y, s = 1, t, out = 0 }) => {
  const fl = 1 + 0.12 * Math.sin(t * 0.9 + x) + 0.07 * Math.sin(t * 2.3 + y);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-9} y={0} width={18} height={70} rx={4} fill="#F2E6C8" stroke={INK} strokeWidth={3} />
      {out < 1 ? <g opacity={1 - out}><path d={`M 0 ${-34 * fl} Q 12 -10 0 0 Q -12 -10 0 ${-34 * fl} Z`} fill="#FFB13A" /><path d={`M 0 ${-20 * fl} Q 6 -6 0 0 Q -6 -6 0 ${-20 * fl} Z`} fill="#FFF2B0" /><Glow x={0} y={-14} r={150} kind="warm" o={0.75} /></g>
        : <path d={`M 0 -4 q 10 -30 -6 -60 q 14 -20 0 -50`} stroke="#8A8A92" strokeWidth={5} fill="none" opacity={0.6} />}
    </g>
  );
};
const Torch: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const fl = 1 + 0.14 * Math.sin(t * 0.9 + x) + 0.08 * Math.sin(t * 2.1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-6} y={0} width={12} height={150} fill={INK} />
      <path d={`M 0 ${-70 * fl} Q 30 -20 14 2 L -14 2 Q -30 -20 0 ${-70 * fl} Z`} fill="#FFB13A" /><path d={`M 0 ${-40 * fl} Q 14 -12 6 2 L -6 2 Q -14 -12 0 ${-40 * fl} Z`} fill="#FFF2B0" />
      <Glow x={0} y={-30} r={240} kind="warm" o={0.75} />
    </g>
  );
};
/** head centre and radius of a story figure (the rig's numbers) */
const headOf = (feet: number, s: number) => ({ hy: feet - LEG_LEN * s + HEAD.y * s, r: HEAD.r * s });
const Mitre: React.FC<{ x: number; y: number; r: number; c?: string; tiara?: boolean }> = ({ x, y, r, c = ROBE, tiara }) => (
  <g transform={`translate(${x} ${y - r * 0.75}) scale(${r / 60})`}>
    {tiara ? <g><path d="M -48 0 Q -54 -90 0 -120 Q 54 -90 48 0 Z" fill={ROBE} stroke={INK} strokeWidth={5} />{[-20, -55, -88].map((yy) => <rect key={yy} x={-50 + (yy < -60 ? 8 : 0)} y={yy} width={100 - (yy < -60 ? 16 : 0)} height={12} fill={GOLD} stroke={INK} strokeWidth={3} />)}<circle cx={0} cy={-126} r={9} fill={GOLD} stroke={INK} strokeWidth={3} /></g>
      : <g><path d="M -46 0 L -40 -80 L 0 -112 L 40 -80 L 46 0 Z" fill={c} stroke={INK} strokeWidth={5} /><path d="M 0 -108 L 0 0 M -42 -40 L 42 -40" stroke={GOLD} strokeWidth={8} /></g>}
  </g>
);
/** a cleric: the face figure plus a mitre (bishop) or the papal tiara with red robes and glowing eyes (Stephen VI) */
const Cleric: React.FC<{ x: number; feet: number; s: number; mood: Mood; t: number; g?: any; e?: any; flip?: boolean; pope?: boolean; ph?: number }> = ({ x, feet, s, mood, t, g = 'stand', e, flip, pope, ph }) => {
  const { hy, r } = headOf(feet, s);
  return (
    <g>
      <Man x={x} feet={feet} s={s} mood={mood} t={t} g={g} e={e} hat="none" flip={flip} ph={ph} />
      {pope ? <path d={`M ${x - r * 1.1} ${hy + r * 1.3} L ${x - r * 1.6} ${feet - r * 0.3} L ${x + r * 1.6} ${feet - r * 0.3} L ${x + r * 1.1} ${hy + r * 1.3} Z`} fill={RED} opacity={0.9} stroke={INK} strokeWidth={3} /> : null}
      <Mitre x={x + (flip ? -1 : 1) * r * 0.1} y={hy} r={r} tiara={pope} />
      {pope ? [-1, 1].map((sd) => <Glow key={sd} x={x + (flip ? -1 : 1) * r * 0.28 + sd * r * 0.18} y={hy - r * 0.05} r={r * 0.5} kind="red" o={0.7} />) : null}
    </g>
  );
};
/** the dead pope: seated on his throne in vestments and mitre, a skull face, bony hands (slump 0..1) */
const Corpse: React.FC<{ x: number; y: number; s?: number; t: number; slump?: number; fingers?: number; lying?: boolean; dressed?: number }> = ({ x, y, s = 1, t, slump = 0.3, fingers = 1, lying, dressed = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lying ? -90 : 0})`}>
    {/* vestments */}
    <path d="M -90 0 L -70 -230 Q 0 -260 70 -230 L 90 0 Z" fill={dressed > 0.5 ? ROBE : '#7A6A5A'} stroke={INK} strokeWidth={6} />
    {dressed > 0.5 ? <g><path d="M -20 -235 L -20 0 M 20 -235 L 20 0" stroke={GOLD} strokeWidth={10} /><path d="M -60 -150 L 60 -150" stroke={GOLD} strokeWidth={8} /><path d="M -80 -230 Q 0 -200 80 -230 L 70 -190 Q 0 -170 -70 -190 Z" fill={RED} stroke={INK} strokeWidth={4} /></g> : null}
    {/* arms and bony hands on the armrests */}
    {[-1, 1].map((sd) => <g key={sd}><path d={`M ${sd * 70} -210 Q ${sd * 110} -150 ${sd * 120} -100`} stroke={dressed > 0.5 ? ROBE : '#7A6A5A'} strokeWidth={34} fill="none" strokeLinecap="round" />
      <g transform={`translate(${sd * 122} -92)`}>{Array.from({ length: sd > 0 ? Math.round(2 + fingers * 3) : 5 }, (_, i) => <rect key={i} x={-14 + i * 7} y={0} width={5} height={26 - (i % 2) * 4} rx={2} fill={BONE} stroke={INK} strokeWidth={1.5} />)}<ellipse cx={0} cy={0} rx={16} ry={10} fill={BONE} stroke={INK} strokeWidth={2} /></g></g>)}
    {/* skull */}
    <g transform={`translate(0 -268) rotate(${slump * 14 + Math.sin(t * 0.05) * 1.5})`}>
      <ellipse cx={0} cy={0} rx={42} ry={50} fill={BONE} stroke={INK} strokeWidth={5} />
      {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 16} cy={-6} rx={12} ry={14} fill="#1A1014" /><circle cx={sd * 16} cy={-4} r={3} fill="#FF6A4A" opacity={0.4 + 0.3 * Math.sin(t * 0.2)} /></g>)}
      <path d="M -5 16 L 0 6 L 5 16 Z" fill="#1A1014" />
      <rect x={-20} y={26} width={40} height={14} rx={3} fill="#F2ECDC" stroke={INK} strokeWidth={2} />{[-12, -4, 4, 12].map((tx) => <path key={tx} d={`M ${tx} 26 L ${tx} 40`} stroke={INK} strokeWidth={2} />)}
      {dressed > 0.5 ? <Mitre x={0} y={-6} r={50} /> : null}
    </g>
  </g>
);
const Throne: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Shadow x={0} y={0} w={260} />
    <path d="M -130 0 L -130 -420 Q -130 -500 0 -520 Q 130 -500 130 -420 L 130 0 Z" fill="#7A1E24" stroke={INK} strokeWidth={8} />
    <path d="M -100 -40 L -100 -400 Q 0 -470 100 -400 L 100 -40 Z" fill="#9A2A30" />
    <path d="M -130 -420 Q -130 -500 0 -520 Q 130 -500 130 -420" stroke={GOLD} strokeWidth={14} fill="none" /><circle cx={0} cy={-500} r={20} fill={GOLD} stroke={INK} strokeWidth={4} />
    {[-1, 1].map((sd) => <rect key={sd} x={sd > 0 ? 110 : -170} y={-170} width={60} height={30} rx={8} fill={GOLD} stroke={INK} strokeWidth={5} />)}
    <rect x={-150} y={-40} width={300} height={40} fill="#5A1418" stroke={INK} strokeWidth={6} />
  </g>
);

// ---------------------------------------------------------------- places
/** the Lateran hall at night: arches, columns, a gold apse mosaic, moonlit windows, a floor in perspective, candles */
const Hall: React.FC<{ t: number; mood?: Mood }> = ({ t, mood = 'night' }) => {
  const m = MOODS[mood];
  return (
    <g>
      <rect x={-400} y={-400} width={W + 800} height={2800} fill="#140E1C" />
      <path d="M 240 980 L 240 560 Q 540 300 840 560 L 840 980 Z" fill="#2A1E14" />
      <path d="M 280 980 L 280 580 Q 540 350 800 580 L 800 980 Z" fill="#7A5A24" opacity={0.85} />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={300 + (i % 8) * 60} y={600 + Math.floor(i / 8) * 70} width={50} height={60} fill={GOLD} opacity={0.12 + random(`mo${i}`) * 0.25} />)}
      <g opacity={0.8}><circle cx={540} cy={620} r={70} fill={GOLD} opacity={0.5} /><path d="M 480 760 L 600 760 L 580 980 L 500 980 Z" fill="#3A2A18" /></g>
      {[-1, 1].map((sd) => Array.from({ length: 3 }, (_, i) => { const x = 540 + sd * (380 + i * 150), h = 900 - i * 60; return (
        <g key={sd + '-' + i}>
          <path d={`M ${x - sd * 75} 980 L ${x - sd * 75} ${980 - h * 0.55} Q ${x} ${980 - h * 0.75} ${x + sd * 75} ${980 - h * 0.55} L ${x + sd * 75} 980`} fill="none" stroke="#2E2238" strokeWidth={26} />
          <rect x={x - 22} y={980 - h * 0.6} width={44} height={h * 0.6} fill="#2E2238" stroke={m.rim} strokeOpacity={0.3} strokeWidth={2} />
        </g>); }))}
      {[140, 940].map((x, i) => <g key={i}><rect x={x - 40} y={300} width={80} height={160} rx={40} fill="#9FB8E8" opacity={0.7} /><Rays x={x} y={380} t={t} o={0.18} n={4} spread={30} dir={i ? 115 : 65} color="#B8CCFF" /></g>)}
      <rect x={-400} y={980} width={W + 800} height={1600} fill="#1E1626" />
      {Array.from({ length: 9 }, (_, r) => <path key={r} d={`M -400 ${990 + r * r * 14 + r * 10} L ${W + 400} ${990 + r * r * 14 + r * 10}`} stroke="#2E2238" strokeWidth={3 + r} />)}
      {Array.from({ length: 13 }, (_, k) => <path key={'v' + k} d={`M ${540 + (k - 6) * 40} 990 L ${540 + (k - 6) * 260} 2400`} stroke="#2E2238" strokeWidth={4} />)}
      {[[200, 940], [880, 940], [330, 960], [750, 960]].map(([x, y], i) => <g key={i}><rect x={x - 6} y={y} width={12} height={140} fill={INK} /><Candle x={x} y={y - 70} s={0.8} t={t + i * 9} /></g>)}
    </g>
  );
};
const Rome: React.FC<{ t: number; mood: Mood; sunY?: number; sunX?: number; moon?: boolean }> = ({ t, mood, sunY = 900, sunX = 760, moon }) => {
  const m = MOODS[mood];
  return (
    <g>
      <Sky id={`rm${mood}`} mood={mood} sunX={sunX} sunY={sunY} moon={moon} />
      <Clouds mood={mood} t={t} y={500} o={0.7} />
      {/* far hills, ruins (an arcaded amphitheatre), domes and towers */}
      <path d="M -300 980 Q 100 860 400 930 Q 700 880 1380 950 L 1380 1100 L -300 1100 Z" fill={m.layers[0]} />
      <g fill={m.layers[1]} stroke={m.rim} strokeOpacity={0.3} strokeWidth={2}>
        <path d="M 60 1000 L 60 850 Q 200 810 340 850 L 340 1000 Z" />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${80 + i * 52} 1000 L ${80 + i * 52} 920 Q ${104 + i * 52} 890 ${128 + i * 52} 920 L ${128 + i * 52} 1000 Z`} fill="#000" opacity={0.3} />)}
        <path d="M 600 1000 L 600 860 Q 680 760 760 860 L 760 1000 Z" /><rect x={676} y={730} width={8} height={40} />
        <rect x={420} y={760} width={50} height={240} /><path d="M 412 760 L 445 710 L 478 760 Z" />
        <path d="M 820 1000 L 820 900 Q 880 840 940 900 L 940 1000 Z" /><rect x={980} y={820} width={60} height={180} />
      </g>
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={40 + i * 64} y={940 + (i % 3) * 10} width={14} height={20} fill="#FFD27A" opacity={random(`rw${i}`) > 0.5 ? 0.8 : 0.15} />)}
      <Sea mood={mood} t={t} y={1010} to={1240} sunX={sunY < 1000 ? sunX : undefined} />
    </g>
  );
};

// ---------------------------------------------------------------- takes
export const S1: S = ({ t, f }) => (   // HOOK: the corpse's face under the mitre; pull back to the bishops on "trial"; push in on "corpse"
  <Take id="S1" f={f} t={t} over={<>{w(f, t, 'trial') < 8 ? <Punch t={t + 6} lines={['A POPE PUT A DEAD', 'MAN ON TRIAL']} y={300} size={92} color={GOLD} kicker="ROME, 897" /> : w(f, t, 'corpse') >= 0 ? <Punch t={w(f, t, 'corpse')} lines={['HIS ACTUAL', 'CORPSE']} y={300} size={110} color={BONE} /> : null}</>}>
    <Hall t={t} />
    <Throne x={540} y={1080} s={0.9} />
    <Corpse x={540} y={1020} s={0.95} t={t} />
    <Glow x={540} y={760} r={420} kind="warm" o={0.45} />
    {[160, 290, 790, 920].map((x, i) => <Cleric key={i} x={x} feet={1300 + (i % 2) * 40} s={0.8} mood="night" t={t + i * 7} e={(['scared', 'shock', 'shock', 'sad'] as any)[i]} flip={i > 1} ph={i} />)}
  </Take>
);
export const S2: S = ({ t, f }) => {   // the chronicle opens; tilt down to the page; push to the title
  const open = easeOut(clamp(t / 24));
  return (
    <Take id="S2" f={f} t={t} over={w(f, t, 'history') < 0 ? <><Txt x={540} y={400} s={80} c="#C9A2FF">NOT A HORROR MOVIE</Txt></> : null}>
      <rect x={-400} y={-400} width={W + 800} height={2800} fill="#1C120C" />
      <Glow x={300} y={500} r={600} kind="warm" o={0.5} />
      <Candle x={170} y={760} s={1.2} t={t} />
      <g transform="translate(540 1060)">
        <Shadow x={0} y={260} w={520} />
        <path d="M -460 240 L -460 -240 L 0 -200 L 0 280 Z" fill="#F2E6C8" stroke={INK} strokeWidth={8} />
        <g transform={`scale(${lerp(-1, 1, open)} 1)`}><path d="M 0 280 L 0 -200 L 460 -240 L 460 240 Z" fill="#EADCB8" stroke={INK} strokeWidth={8} /></g>
        {open > 0.9 ? <g>
          <text x={230} y={-110} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={46} fill={RED}>CADAVER</text>
          <text x={230} y={-58} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={46} fill={RED}>SYNOD</text>
          <text x={230} y={-20} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={24} fill="#5A4A3A">ANNO DOMINI 897</text>
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={110} y={20 + i * 34} width={240 - (i % 3) * 30} height={8} fill="#7A6A5A" />)}
          <g transform="translate(-230 0)"><rect x={-150} y={-150} width={300} height={320} fill="#E0D0A8" stroke={GOLD} strokeWidth={8} /><g transform="translate(0 150) scale(0.42)"><Throne x={0} y={0} /><Corpse x={0} y={-60} s={1} t={0} /></g></g>
        </g> : null}
        <path d="M 0 -200 L 0 280" stroke="#8A7A5A" strokeWidth={6} />
      </g>
    </Take>
  );
};
export const S3: S = ({ t, f }) => (   // Rome, dusk; push toward the Lateran
  <Take id="S3" f={f} t={t} over={<Punch t={t - 2} lines={['ROME, 897']} y={330} size={120} color={GOLD} />}>
    <Rome t={t} mood="warm" sunY={860} sunX={300} />
  </Take>
);
export const S4: S = ({ t, f }) => (   // the crypt: Formosus's tomb, nine months; pan to Stephen VI glaring with red eyes
  <Take id="S4" f={f} t={t} over={<>{w(f, t, 'nine') >= 0 && w(f, t, 'Stephen') < 0 ? <Punch t={w(f, t, 'nine')} lines={['9 MONTHS', 'DEAD']} y={330} size={110} color={BONE} /> : null}{w(f, t, 'Stephen') >= 0 ? <Punch t={w(f, t, 'Stephen')} lines={['STEPHEN VI']} y={330} size={110} color="#FF5A4A" /> : null}</>}>
    <rect x={-400} y={-400} width={W + 800} height={2800} fill="#1A1620" />
    {Array.from({ length: 12 }, (_, r) => Array.from({ length: 8 }, (_, c) => <rect key={`${r}${c}`} x={-120 + c * 170 + (r % 2) * 85} y={200 + r * 100} width={160} height={90} fill="#2A2430" stroke="#120E16" strokeWidth={6} />))}
    <rect x={-400} y={1200} width={W + 800} height={1400} fill="#120E16" />
    <g transform="translate(340 1220)"><Shadow x={0} y={0} w={330} /><rect x={-300} y={-220} width={600} height={220} fill="#6A6470" stroke={INK} strokeWidth={8} /><rect x={-320} y={-250} width={640} height={40} fill="#7A747E" stroke={INK} strokeWidth={6} />
      <text x={0} y={-110} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={56} fill="#2A2430">FORMOSUS</text><text x={0} y={-50} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={30} fill="#2A2430">† 896</text></g>
    <Candle x={90} y={1080} s={0.9} t={t} /><Candle x={590} y={1080} s={0.9} t={t + 11} />
    <Cleric x={790} feet={1420} s={1.4} mood="danger" t={t} e="angry" flip pope />
  </Take>
);
export const S5: S = ({ t, f }) => {   // night: diggers open the grave; the coffin comes up on "digs"
  const up = easeOut(clamp(w(f, t, 'digs') / 30));
  return (
    <Take id="S5" f={f} t={t} over={w(f, t, 'digs') >= 0 ? <Punch t={w(f, t, 'digs')} lines={['HE DIGS', 'HIM UP']} y={320} size={120} color="#FFB13A" /> : null}>
      <Sky id="g5" mood="night" sunX={800} sunY={420} moon />
      <path d="M -300 1000 Q 300 940 1380 1010 L 1380 2400 L -300 2400 Z" fill="#1C142A" />
      {[120, 960].map((x, i) => <g key={i}><path d={`M ${x - 30} 1000 L ${x - 30} 900 Q ${x} 860 ${x + 30} 900 L ${x + 30} 1000 Z`} fill="#3A3048" /><path d={`M ${x} 880 L ${x} 840 M ${x - 16} 856 L ${x + 16} 856`} stroke="#3A3048" strokeWidth={8} /></g>)}
      <ellipse cx={540} cy={1260} rx={300} ry={70} fill="#0A0610" />
      <path d="M 200 1240 Q 260 1150 360 1180 L 330 1260 Z" fill="#3A2A1E" />
      <g transform={`translate(540 ${1270 - up * 170}) rotate(${-4 + up * 4})`}><rect x={-230} y={-70} width={460} height={110} rx={14} fill="#5A3A22" stroke={INK} strokeWidth={8} /><path d="M -200 -20 L 200 -20" stroke="#3A2414" strokeWidth={6} /><path d="M -30 -50 L 30 -50 M 0 -66 L 0 -6" stroke={GOLD} strokeWidth={8} /></g>
      {[-160, 160].map((dx) => <path key={dx} d={`M ${540 + dx} ${1200 - up * 170} L ${540 + dx * 1.6} 860`} stroke="#8A7A5A" strokeWidth={6} />)}
      <Man x={260} feet={1300} s={1.0} mood="night" t={t} g="dig" hat="cap" e="scared" />
      <Man x={820} feet={1300} s={1.0} mood="night" t={t + 7} g="dig" hat="cap" e="disgust" flip />
      <Torch x={120} y={1060} t={t} /><Torch x={980} y={1080} t={t + 9} />
      <Cleric x={980} feet={1440} s={0.9} mood="danger" t={t} g="point" e="smug" flip pope />
    </Take>
  );
};
export const S6: S = ({ t, f }) => {   // dressing the body in robes and mitre; pan to the throne
  const dressed = clamp(w(f, t, 'robes') / 10 + 0.4);
  return (
    <Take id="S6" f={f} t={t} over={w(f, t, 'throne') >= 0 ? <Punch t={w(f, t, 'throne')} lines={['ON A THRONE']} y={330} size={110} color={GOLD} /> : <Punch t={t - 2} lines={['FULL PAPAL', 'ROBES']} y={300} size={100} color={ROBE} />}>
      <Hall t={t} mood="warm" />
      <rect x={180} y={1100} width={480} height={40} fill="#5A3A22" stroke={INK} strokeWidth={6} />
      <Corpse x={420} y={1090} s={0.75} t={t} lying dressed={dressed} />
      <Man x={300} feet={1400} s={0.95} mood="warm" t={t} g="shock" hat="none" e="disgust" />
      <Man x={560} feet={1410} s={0.95} mood="warm" t={t + 5} g="point" hat="none" e="scared" flip />
      <Throne x={800} y={1180} s={0.7} />
    </Take>
  );
};
export const S7: S = ({ t, f }) => (   // the trial: bishops, the corpse on its throne, the deacon behind it
  <Take id="S7" f={f} t={t} over={<>{w(f, t, 'lawyer') >= 0 && w(f, t, 'answered') < 0 ? <Punch t={w(f, t, 'lawyer')} lines={['A LAWYER']} y={320} size={120} color={GOLD} /> : null}{w(f, t, 'corpse') >= 0 && w(f, t, 'lawyer') < 0 ? <Txt x={540} y={360} s={92} c={BONE}>CAN'T TALK</Txt> : null}
    {w(f, t, 'answered') >= 0 ? <Speech t={w(f, t, 'answered') + 4} x={540} y={520}><text x={0} y={-20} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={64} fill={INK}>"um... not</text><text x={0} y={60} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={64} fill={INK}>guilty?"</text></Speech> : null}</>}>
    <Hall t={t} />
    <Throne x={540} y={1080} s={0.9} />
    <Corpse x={540} y={1020} s={0.95} t={t} />
    <Man x={700} feet={1000} s={0.55} mood="night" t={t} g="stand" hat="none" e={w(f, t, 'answered') >= 0 ? 'scared' : 'shock'} />
    <Glow x={540} y={760} r={400} kind="warm" o={0.4} />
    {[120, 240, 360, 720, 840, 960].map((x, i) => <Cleric key={i} x={x} feet={1360 + (i % 2) * 40} s={0.72} mood="night" t={t + i * 5} e={(['scared', 'shock', 'sad', 'disgust', 'scared', 'shock'] as any)[i]} flip={i > 2} ph={i} />)}
    <Cleric x={330} feet={1240} s={0.85} mood="danger" t={t} g="point" e="angry" pope />
  </Take>
);
export const S8: S = ({ t, f }) => (   // the charges on a scroll; GUILTY; Stephen smug
  <Take id="S8" f={f} t={t} over={w(f, t, 'Guilty') >= 0 ? <g transform={`translate(540 640) rotate(-12) scale(${lerp(1.8, 1, popIn(w(f, t, 'Guilty'), 4))})`}><rect x={-330} y={-100} width={660} height={200} fill="none" stroke={RED} strokeWidth={18} /><Txt x={0} y={44} s={140} c={RED}>GUILTY</Txt></g> : <Txt x={540} y={380} s={96} c={GOLD}>THE CHARGE</Txt>}>
    <rect x={-400} y={-400} width={W + 800} height={2800} fill="#1C120C" />
    <Glow x={540} y={700} r={600} kind="warm" o={0.45} />
    <g transform="translate(540 860)"><Shadow x={0} y={300} w={380} /><rect x={-300} y={-260} width={600} height={560} fill="#EADCB8" stroke={INK} strokeWidth={8} />
      <rect x={-330} y={-300} width={660} height={60} rx={30} fill="#C8B488" stroke={INK} strokeWidth={6} /><rect x={-330} y={270} width={660} height={60} rx={30} fill="#C8B488" stroke={INK} strokeWidth={6} />
      <text x={0} y={-180} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={40} fill={RED}>CHARGES</text>
      {['BROKE CHURCH RULES', 'TO BECOME POPE', 'PERJURY'].map((l, i) => <text key={i} x={0} y={-100 + i * 70} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#3A2A1A">{l}</text>)}
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={-220} y={130 + i * 30} width={440 - (i % 2) * 80} height={8} fill="#7A6A5A" />)}</g>
    <Cleric x={830} feet={1300} s={1.0} mood="danger" t={t} e="smug" flip pope />
  </Take>
);
export const S9: S = ({ t, f }) => {   // the three blessing fingers, cut away (no gore: they vanish in a red flash)
  const cut = w(f, t, 'blessings') + 4;
  return (
    <Take id="S9" f={f} t={t} over={<Punch t={t - 2} lines={['THREE', 'FINGERS']} y={320} size={120} color={BONE} />}>
      <rect x={-400} y={-400} width={W + 800} height={2800} fill="#140E1C" />
      <Glow x={540} y={820} r={600} kind="warm" o={0.4} />
      <g transform="translate(540 1060)">
        <path d="M -120 300 L -110 60 Q 0 20 110 60 L 120 300 Z" fill={ROBE} stroke={INK} strokeWidth={8} />
        <ellipse cx={0} cy={30} rx={110} ry={80} fill={BONE} stroke={INK} strokeWidth={6} />
        {[[-70, 0], [-25, 1], [20, 2], [65, 3]].map(([x, i]) => { const blessing = i < 3, gone = blessing && cut >= 0; return gone ? null : <g key={i}><rect x={x - 16} y={-200 + (i === 3 ? 120 : 0)} width={32} height={i === 3 ? 100 : 220} rx={16} fill={BONE} stroke={INK} strokeWidth={5} />{[0, 1].map((k) => <path key={k} d={`M ${x - 14} ${-120 + k * 70 + (i === 3 ? 120 : 0)} L ${x + 14} ${-120 + k * 70 + (i === 3 ? 120 : 0)}`} stroke={INK} strokeWidth={3} opacity={0.5} />)}</g>; })}
        <path d="M -110 60 Q -190 20 -170 -40 Q -140 -60 -110 0" fill={BONE} stroke={INK} strokeWidth={5} />
        {cut >= 0 && cut < 14 ? <g opacity={1 - cut / 14}><Glow x={-20} y={-60} r={400} kind="red" o={0.9} /><Burst t={cut} text="SNIP!" y={-260} size={90} color={RED} /></g> : null}
      </g>
    </Take>
  );
};
export const S10: S = ({ t, f }) => {   // night on a Tiber bridge: the body is thrown; splash; trash joke
  const k = clamp(t / 30), sp = w(f, t, 'Tiber');
  return (
    <Take id="S10" f={f} t={t} over={w(f, t, 'trash') >= 0 ? <g transform={`translate(540 820) scale(${popIn(w(f, t, 'trash'), 5)})`}><rect x={-90} y={-60} width={180} height={190} rx={12} fill="#6A6A72" stroke={INK} strokeWidth={8} /><rect x={-110} y={-90} width={220} height={40} rx={10} fill="#8A8A92" stroke={INK} strokeWidth={8} transform={`rotate(-18 -110 -70)`} />{[-40, 0, 40].map((x) => <path key={x} d={`M ${x} -30 L ${x} 110`} stroke={INK} strokeWidth={6} />)}</g> : <Punch t={t - 2} lines={['INTO THE', 'TIBER']} y={320} size={110} color="#9FB8E8" />}>
      <Rome t={t} mood="night" sunX={800} sunY={420} moon />
      <path d="M -300 1060 L 1380 1060 L 1380 1110 L -300 1110 Z" fill="#2A2238" />
      {[100, 540, 980].map((x) => <path key={x} d={`M ${x - 180} 1110 Q ${x} 960 ${x + 180} 1110 Z`} fill="#140E1C" />)}
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-260 + i * 110} y={1030} width={14} height={34} fill="#2A2238" />)}
      <Man x={380} feet={1060} s={0.65} mood="night" t={t} g="point" hat="cap" e="disgust" />
      <Torch x={250} y={880} t={t} s={0.6} />
      {sp < 6 ? <g transform={`translate(${460 + k * 140} ${1000 + k * k * 240}) rotate(${k * 160})`}><ellipse cx={0} cy={0} rx={70} ry={22} fill="#D8D2C0" stroke={INK} strokeWidth={5} /></g> : null}
      {sp >= 0 ? Array.from({ length: 3 }, (_, i) => <ellipse key={i} cx={600} cy={1240} rx={40 + (sp + i * 8) * 6} ry={10 + (sp + i * 8) * 1.4} fill="none" stroke="#B8CCFF" strokeWidth={4} opacity={clamp(1 - (sp + i * 8) / 40)} />) : null}
    </Take>
  );
};
export const S11: S = ({ t, f }) => (   // Rome rises: the torch-lit crowd at the palace gates; Stephen at his window
  <Take id="S11" f={f} t={t} over={w(f, t, 'people') < 0 ? <Punch t={t - 2} lines={['ROME HAD', 'SEEN ENOUGH']} y={320} size={104} color="#FF8A3D" /> : null}>
    <Sky id="r11" mood="danger" sunX={300} sunY={400} />
    <rect x={160} y={460} width={760} height={600} fill="#3A1E1E" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={210 + i * 120} y={520} width={60} height={110} rx={30} fill={i === 5 ? '#FFD27A' : '#1A0E0E'} />)}
    <Cleric x={810} feet={800} s={0.55} mood="danger" t={t} e={w(f, t, 'Stephen') >= 0 ? 'scared' : 'neutral'} flip pope />
    <rect x={380} y={820} width={320} height={240} fill="#1A0E0E" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x={390 + i * 40} y={820} width={10} height={240} fill="#5A4A3A" />)}
    <rect x={-400} y={1060} width={W + 800} height={1400} fill="#2A1012" />
    <Crowd mood="danger" t={t} n={8} x0={40} x1={1040} feet={1400} s={0.95} g="point" e="angry" seed={7} />
    {[80, 300, 560, 820, 1000].map((x, i) => <Torch key={i} x={x} y={1110 + (i % 2) * 30} t={t + i * 7} s={0.8} />)}
  </Take>
);
export const S12: S = ({ t, f }) => (   // prison: Stephen behind bars; a candle snuffed on "strangled"
  <Take id="S12" f={f} t={t} over={w(f, t, 'prison') >= 0 && w(f, t, 'strangled') < 0 ? <Punch t={w(f, t, 'prison')} lines={['PRISON']} y={330} size={120} color="#9FB8E8" /> : null}>
    <rect x={-400} y={-400} width={W + 800} height={2800} fill="#100C16" />
    {Array.from({ length: 10 }, (_, r) => Array.from({ length: 7 }, (_, c) => <rect key={`${r}${c}`} x={-100 + c * 190 + (r % 2) * 95} y={300 + r * 110} width={180} height={100} fill="#1C1824" stroke="#0A0810" strokeWidth={6} />))}
    <rect x={760} y={520} width={140} height={160} fill="#2A2A40" /><Rays x={830} y={600} t={t} o={0.2} n={4} spread={25} dir={120} color="#9FB8E8" />
    <Cleric x={480} feet={1360} s={1.1} mood="cold" t={t} g="shock" e="scared" pope />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={120 + i * 120} y={500} width={22} height={1000} fill="#3A3A44" stroke={INK} strokeWidth={4} />)}
    <rect x={100} y={500} width={900} height={24} fill="#3A3A44" stroke={INK} strokeWidth={4} />
    <Candle x={700} y={1080} s={1.1} t={t} out={clamp((w(f, t, 'strangled') + 2) / 6)} />
  </Take>
);
export const S13: S = ({ t, f }) => (   // dawn: a hooded monk pulls the shrouded body into his boat
  <Take id="S13" f={f} t={t} over={w(f, t, 'monk') >= 0 ? <Punch t={w(f, t, 'monk')} lines={['A MONK']} y={330} size={120} color="#FFD27A" /> : <Punch t={t - 2} lines={['PULLED OUT']} y={330} size={110} color="#FFD27A" />}>
    <Rome t={t} mood="warm" sunX={300} sunY={960} />
    <g transform={`translate(600 ${1150 + Math.sin(t * 0.1) * 6})`}>
      <path d="M -260 0 L 260 0 Q 230 70 0 80 Q -230 70 -260 0 Z" fill="#5A3A22" stroke={INK} strokeWidth={6} />
      <ellipse cx={-60} cy={-6} rx={120} ry={26} fill={BONE} stroke={INK} strokeWidth={4} />
    </g>
    <Man x={700} feet={1150} s={0.85} mood="warm" t={t} g="dig" hat="none" e="sad" flip />
    <path d={`M ${700 - 62} ${1150 - 245} Q ${700} ${1150 - 340} ${700 + 62} ${1150 - 245} L ${700 + 70} ${1150 - 200} L ${700 - 70} ${1150 - 200} Z`} fill="#4A3A2A" stroke={INK} strokeWidth={4} />
  </Take>
);
export const S14: S = ({ t, f }) => (   // Old Saint Peter's: the candle procession, the tomb; THAT'S REAL
  <Take id="S14" f={f} t={t} over={w(f, t, 'real') >= 0 ? <g transform={`translate(540 720) rotate(-10) scale(${popIn(w(f, t, 'real'), 5)})`}><rect x={-330} y={-100} width={660} height={200} fill="#140A12" fillOpacity={0.35} stroke="#FFD23F" strokeWidth={16} /><Txt x={0} y={44} s={124} c="#FFD23F">THAT'S REAL</Txt></g> : <Punch t={t - 2} lines={["SAINT PETER'S"]} y={320} size={104} color={GOLD} />}>
    <Sky id="p14" mood="night" sunX={800} sunY={420} moon />
    <path d="M 160 1000 L 160 620 L 540 460 L 920 620 L 920 1000 Z" fill="#3A2E48" stroke={MOODS.night.rim} strokeOpacity={0.4} strokeWidth={3} />
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={230 + i * 140} y={700} width={60} height={300} rx={30} fill="#FFD27A" opacity={0.7} />)}
    <Glow x={540} y={820} r={500} kind="warm" o={0.5} />
    <rect x={-400} y={1000} width={W + 800} height={1400} fill="#1C142A" />
    {Array.from({ length: 6 }, (_, i) => <g key={i}><Man x={140 + i * 160 + t * 0.6} feet={1300 + (i % 2) * 20} s={0.7} mood="night" t={t + i * 5} g="stand" hat="none" e="sad" ph={i} /><Candle x={175 + i * 160 + t * 0.6} y={1110} s={0.5} t={t + i * 3} /></g>)}
  </Take>
);
export const S15: S = ({ t, f }) => (   // today: the boss with a grudge; pan to the shovel by his desk
  <Take id="S15" f={f} t={t} over={w(f, t, 'digging') >= 0 ? <Punch t={w(f, t, 'digging')} lines={['NOT DIGGING', 'YOU UP']} y={320} size={100} color="#FFD23F" /> : <Txt x={540} y={380} s={96} c="#9FB8E8">A GRUDGE?</Txt>}>
    <rect x={-400} y={-400} width={W + 800} height={2800} fill="#2E3A4A" />
    {[300, 780].map((lx) => <g key={lx}><rect x={lx - 90} y={250} width={180} height={18} rx={9} fill="#E8F2FF" /><Glow x={lx} y={268} r={360} kind="cool" o={0.6} /></g>)}
    <rect x={-400} y={1150} width={W + 800} height={1400} fill="#1E242E" />
    <rect x={160} y={1040} width={560} height={40} fill="#6A4428" stroke={INK} strokeWidth={6} />
    <Man x={360} feet={1080} s={1.0} mood="cold" t={t} g="stand" hat="none" e="angry" />
    <Man x={700} feet={1500} s={1.2} mood="cold" t={t} g="stand" hat="none" e={w(f, t, 'digging') >= 0 ? 'happy' : 'scared'} flip />
    <g transform="translate(860 1150) rotate(12)"><rect x={-8} y={-300} width={16} height={260} fill="#8A5A32" stroke={INK} strokeWidth={3} /><path d="M -50 -40 L 50 -40 L 40 60 Q 0 90 -40 60 Z" fill="#8A8A92" stroke={INK} strokeWidth={5} /></g>
  </Take>
);
export const S16: S = ({ t, f }) => (   // sign-off: Rome at sunset over the Tiber
  <Take id="S16" f={f} t={t} over={w(f, t, 'Follow') < 0 ? <><Txt x={540} y={400} s={96} c="#FFD08A">THAT'S ABOUT IT,</Txt><Txt x={540} y={510} s={110}>FOLKS</Txt></> : <Punch t={w(f, t, 'Follow')} lines={['FOLLOW FOR MORE', 'STRANGE HISTORY']} y={300} size={80} color="#FFD08A" />}>
    <Rome t={t} mood="outback" sunX={540} sunY={960} />
    <Rays x={540} y={960} t={t} o={0.3} n={10} spread={140} dir={90} />
  </Take>
);
void Calendar; void scr; void lerp;
