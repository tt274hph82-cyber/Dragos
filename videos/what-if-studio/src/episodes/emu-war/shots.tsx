import React from 'react';
import { ShotProps } from '../../engine';
import { W, H, Mood, MOODS, Sky, Figure, HostCut, Punch, BigNumber, Sfx, popIn, clamp, lerp, easeOut, Glow, INK, CloseCtx } from '../molasses/kit';

// "The Great Emu War" — a short native 9:16 story Reel with the user's host (cut-outs from his model sheet).
// Outback scenes in the reference style: one mood per scene, layered mesas, rim-lit silhouettes, punch titles.

type S = React.FC<ShotProps>;

/** The outback: sky, three layers of mesas, red earth, a windmill and a fence. */
const Outback: React.FC<{ id: string; mood?: Mood; wheat?: boolean; t?: number; sunY?: number }> = ({ id, mood = 'outback', wheat, t = 0, sunY = 560 }) => {
  const m = MOODS[mood];
  return (
    <g>
      <Sky id={id} mood={mood} sunY={sunY} sunX={760} />
      <path d="M -100 980 L 120 900 L 260 900 L 340 960 L 520 950 L 600 880 L 780 880 L 860 960 L 1180 940 L 1180 1200 L -100 1200 Z" fill={m.layers[0]} />
      <path d="M -100 1060 L 200 1010 L 420 1050 L 700 1000 L 1180 1060 L 1180 1300 L -100 1300 Z" fill={m.layers[1]} />
      {/* windmill and fence posts */}
      <g fill={m.layers[2]} stroke={m.layers[2]}>
        <path d="M 900 1080 L 930 820 L 960 1080 Z" />
        <g transform={`translate(930 820) rotate(${t * 2})`}>{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <rect key={a} x={-4} y={-70} width={8} height={70} transform={`rotate(${a})`} />)}</g>
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={40 + i * 110} y={1110} width={10} height={60} />)}
        <path d="M 40 1125 L 1000 1125" strokeWidth={3} />
      </g>
      <rect x={-100} y={1160} width={W + 200} height={H} fill={m.ground} />
      {wheat ? Array.from({ length: 60 }, (_, i) => {
        const x = (i * 37) % 1120 - 20, y = 1170 + (i % 6) * 24;
        const sw = Math.sin(t * 0.08 + i) * 6;
        return <path key={i} d={`M ${x} ${y + 60} Q ${x + sw} ${y + 20} ${x + sw * 1.5} ${y}`} stroke="#E8B24A" strokeWidth={6} fill="none" strokeLinecap="round" />;
      }) : null}
    </g>
  );
};

/** An emu in silhouette with a glowing outline. run = 0 standing/pecking, 1 running; peck lowers the neck. */
const Emu: React.FC<{ x: number; y: number; s?: number; t: number; run?: number; peck?: number; flip?: boolean; mood?: Mood }> = ({ x, y, s = 1, t, run = 0, peck = 0, flip, mood = 'outback' }) => {
  const sw = Math.sin(t * 0.9) * 30 * run;
  const bob = Math.abs(Math.sin(t * 0.9)) * 8 * run;
  const neck = lerp(0, 1, peck);
  const leg = (a: number) => <path d={`M 0 0 L ${Math.sin((a * Math.PI) / 180) * 60} 70 L ${Math.sin((a * Math.PI) / 180) * 60 + 18} 140`} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${(flip ? -1 : 1) * s} ${s})`} style={{ filter: `drop-shadow(0 0 5px ${MOODS[mood].rim})` }}>
      <g transform="translate(0 -10)">{leg(sw)}{leg(-sw)}</g>
      <ellipse cx={0} cy={-60} rx={80} ry={58} fill={INK} stroke={MOODS[mood].rim} strokeWidth={3} />
      {/* shaggy feathers hanging off the body */}
      {Array.from({ length: 9 }, (_, i) => {
        const fx = -72 + i * 18;
        return <path key={`sh${i}`} d={`M ${fx} -30 q ${4 + (i % 2) * 4} ${30 + (i % 3) * 8} ${12} 4 Z`} fill={INK} stroke={MOODS[mood].rim} strokeWidth={2} />;
      })}
      {[-50, -20, 10, 40].map((fx) => <path key={fx} d={`M ${fx} -10 q 8 18 16 0`} stroke={MOODS[mood].rim} strokeWidth={2} fill="none" opacity={0.6} />)}
      <path d={`M 50 -90 Q ${70 + neck * 40} ${-170 + neck * 150} ${80 + neck * 50} ${-220 + neck * 210}`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
      <g transform={`translate(${80 + neck * 50} ${-222 + neck * 210})`}>
        <ellipse cx={0} cy={0} rx={22} ry={16} fill={INK} stroke={MOODS[mood].rim} strokeWidth={3} />
        <path d="M 18 2 L 46 8 L 18 10 Z" fill={INK} stroke={MOODS[mood].rim} strokeWidth={2} />
        <circle cx={6} cy={-3} r={3.5} fill={MOODS[mood].rim} />
      </g>
    </g>
  );
};

/** A Lewis gun on a bipod: barrel shroud, drum magazine, stock. fire flashes the muzzle. */
const Lewis: React.FC<{ x: number; y: number; s?: number; t: number; fire?: boolean; jam?: number }> = ({ x, y, s = 1, t, fire, jam = 0 }) => {
  const flash = fire && jam < 0.5 && Math.floor(t) % 3 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${fire && jam < 0.5 ? Math.sin(t * 2) * 1.5 : 0})`}>
      <rect x={-200} y={-22} width={380} height={44} rx={10} fill="#2A2420" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${-180 + i * 36} -22 L ${-180 + i * 36} 22`} stroke={INK} strokeWidth={4} />)}
      <rect x={180} y={-8} width={90} height={16} fill="#1A1614" stroke={INK} strokeWidth={4} />
      <ellipse cx={-40} cy={-46} rx={78} ry={20} fill="#3A322C" stroke={INK} strokeWidth={6} />
      <path d="M -200 0 L -330 40 L -320 70 L -190 22 Z" fill="#5A3A22" stroke={INK} strokeWidth={6} />
      <path d="M 100 20 L 60 130 M 100 20 L 150 130" stroke={INK} strokeWidth={8} />
      {flash ? <g><circle cx={300} cy={0} r={40} fill="#FFE27A" /><Glow x={300} y={0} r={160} kind="warm" o={0.9} /></g> : null}
      {jam > 0 ? [0, 1, 2].map((i) => <circle key={i} cx={-40 + i * 30} cy={-80 - jam * 60 - i * 20} r={18 + jam * 20} fill="#8A8A8A" opacity={0.6 * (1 - jam * 0.5)} />) : null}
    </g>
  );
};

/** A 1930s army truck in silhouette, bouncing. */
const Truck: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 0.8)) * -10}) scale(${s})`} style={{ filter: `drop-shadow(0 0 5px ${MOODS.outback.rim})` }}>
    <rect x={-220} y={-150} width={260} height={120} fill={INK} />
    <path d="M 40 -150 L 130 -150 L 180 -80 L 200 -30 L 40 -30 Z" fill={INK} />
    <rect x={60} y={-136} width={60} height={46} fill="#FFC46A" opacity={0.5} />
    {[-140, 120].map((wx) => <g key={wx}><circle cx={wx} cy={-20} r={42} fill={INK} /><circle cx={wx} cy={-20} r={14} fill="#5A4030" /></g>)}
    {[0, 1, 2].map((i) => <circle key={i} cx={-260 - i * 50} cy={-30 - i * 10} r={30 + i * 14} fill="#C88A5A" opacity={0.4 - i * 0.1} />)}
  </g>
);

const soldier = (x: number, feet: number, s: number, t: number, i = 0, walk = 0) => {
  const sw = Math.sin(t * 0.5 + i) * 25 * walk;
  return <Figure key={`so${i}`} x={x} feet={feet} s={s} mood="outback" hat="cap" pose={{ yaw: 0.5, legL: { a: sw, b: -Math.abs(sw) }, legR: { a: -sw, b: -Math.abs(sw) }, armR: { a: 40, b: 60 } }} />;
};
const herd = (t: number, n: number, y: number, s: number, run = 0, x0 = -60, x1 = 1140) =>
  Array.from({ length: n }, (_, i) => (
    <Emu key={i} x={lerp(x0, x1, i / Math.max(1, n - 1)) + (run ? (t * 6 * (i % 2 ? 1.1 : 0.9)) % 200 : 0)} y={y + (i % 3) * 30} s={s * (0.8 + (i % 3) * 0.12)} t={t + i * 3} run={run} peck={run ? 0 : (i % 2) * (0.5 + 0.5 * Math.sin(t * 0.1 + i))} flip={i % 4 === 3} />
  ));

// ---------------------------------------------------------------- the hook
export const S1: S = ({ t }) => (
  <g>
    <Outback id="e1" t={t} />
    {[0, 1, 2, 3, 4].map((i) => soldier(140 + i * 190, 1260, 0.62, t, i, 1))}
    <Punch t={t - 2} lines={['1932']} y={380} size={170} color="#FFD23F" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Outback id="e2" mood="danger" t={t} />
    <HostCut pose="confused" x={540} bottom={1500} height={760} t={t} />
    <Punch t={t - 4} lines={['THE ENEMY?']} y={360} size={100} />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Outback id="e3" t={t} sunY={480} />
    {herd(t, 9, 1130, 0.42)}
    {herd(t + 20, 7, 1220, 0.6)}
    <BigNumber t={t - 4} text="20,000" sub="EMUS" y={560} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Sky id="e4" mood="danger" sunY={400} />
    <Lewis x={540} y={820} s={1.3} t={t} fire />
    <Sfx t={t - 4} text="RA-TA-TA!" x={540} y={460} />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Sky id="e5" mood="danger" sunY={400} />
    {Array.from({ length: 40 }, (_, i) => (
      <g key={i} transform={`translate(${200 + (i % 10) * 76} ${980 - Math.floor(i / 10) * 60}) scale(${popIn(t - i * 0.8, 4)})`}>
        <rect x={-10} y={-30} width={20} height={44} rx={4} fill="#C9A23A" stroke={INK} strokeWidth={3} />
        <path d="M -10 -30 Q 0 -54 10 -30 Z" fill="#B8742A" stroke={INK} strokeWidth={3} />
      </g>
    ))}
    <BigNumber t={t - 4} text="10,000" sub="BULLETS" y={560} />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Outback id="e6" t={t} sunY={520} />
    <Emu x={480} y={1060} s={2.0} t={t} />
    <Punch t={t - 8} lines={['THE BIRDS', 'WON']} y={340} size={110} color="#FFD23F" />
  </g>
);

// ---------------------------------------------------------------- the host
export const S7: S = ({ t }) => (
  <g>
    <Outback id="e7" t={t} />
    {herd(t, 5, 1210, 0.4, 0, 640, 1080)}
    <HostCut pose="laugh_point" x={420} bottom={1640} height={980} t={t} />
    <Punch t={t - 3} lines={['THE GREAT', 'EMU WAR']} y={330} size={100} color="#FFD23F" />
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Outback id="e8" mood="warm" t={t} />
    <HostCut pose="smug" x={540} bottom={1500} height={880} t={t} />
    <Punch t={t - 4} lines={['YES, REALLY.']} y={360} size={96} />
  </g>
);

// ---------------------------------------------------------------- the story
export const S9: S = ({ t }) => (
  <g>
    <Outback id="e9" t={t} wheat />
    {herd(t, 6, 1250, 0.55)}
    <Punch t={t - 6} lines={['WHEAT FARMS', 'EATEN']} y={360} size={92} color="#E8B24A" />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Outback id="e10" mood="warm" t={t} wheat />
    {[260, 540, 820].map((x, i) => <Figure key={x} x={x} feet={1300} s={0.85} mood="warm" hat="bowler" pose={{ yaw: i === 1 ? 0 : i ? -0.4 : 0.4, armR: { a: 150 + Math.sin(t * 0.4 + i) * 20, b: 10 } }} />)}
    <Sfx t={t - 6} text="HELP!" x={540} y={520} size={120} />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Outback id="e11" t={t} />
    <Truck x={300} y={1270} s={0.9} t={t} />
    {soldier(700, 1280, 0.85, t, 0)}
    <Lewis x={830} y={1180} s={0.55} t={t} />
    <Punch t={t - 4} lines={['MAJOR', 'MEREDITH']} y={340} size={96} color="#FFD23F" />
  </g>
);
export const S12: S = ({ t, len }) => {
  const k = easeOut(clamp(t / len));
  return (
    <g>
      <Outback id="e12" t={t} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.3]].map(([dx, dy], i) => (
        <Emu key={i} x={540 + dx * k * 320} y={1220 + dy * k * 60} s={0.55} t={t + i * 4} run={1} flip={dx < 0} />
      ))}
      <Punch t={t - 6} lines={['THEY', 'SPLIT UP']} y={360} size={100} />
    </g>
  );
};
export const S13: S = ({ t }) => (
  <g>
    <Outback id="e13" t={t * 3} />
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${((i * 190 - t * 30) % 1400 + 1400) % 1400 - 100} ${1050 + i * 40} l 200 0`} stroke="#FFE2A8" strokeWidth={6} opacity={0.6} strokeLinecap="round" />)}
    <Emu x={520} y={1260} s={1.3} t={t * 1.4} run={1} />
    <BigNumber t={t - 8} text="50" sub="KM/H" y={520} />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <Sky id="e14" mood="noon" sunY={400} />
    <Lewis x={540} y={820} s={1.3} t={t} fire jam={clamp((t - 4) / 20)} />
    <Sfx t={t - 6} text="JAMMED!" x={540} y={470} size={120} />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Outback id="e15" t={t} />
    <Truck x={lerp(220, 360, clamp(t / 60))} y={1290} s={0.95} t={t} />
    {herd(t, 4, 1240, 0.5, 1, 640, 1200)}
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Outback id="e16" mood="night" t={t} sunY={420} />
    <BigNumber t={t - 2} text="986" sub="KILLS REPORTED" y={600} color="#FFFFFF" />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Outback id="e17" mood="night" t={t} sunY={420} />
    <BigNumber t={t - 2} text="9,860" sub="BULLETS" y={600} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Outback id="e18" mood="danger" t={t} />
    <HostCut pose="yell" x={540} bottom={1500} height={760} t={t} />
    <Punch t={t - 4} lines={['10 BULLETS', 'PER BIRD']} y={330} size={96} color="#FFD23F" />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Outback id="e19" mood="warm" t={t} />
    <HostCut pose="bust" x={540} bottom={1700} height={1180} t={t} />
    <Punch t={t - 4} lines={["THAT'S REAL."]} y={360} size={100} />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <Outback id="e20" mood="warm" t={t} sunY={760} />
    <Truck x={lerp(560, 900, clamp(t / 50))} y={1270} s={0.8} t={t} />
    {[0, 1, 2].map((i) => soldier(lerp(360, 640, clamp(t / 50)) - i * 120, 1270, 0.7, t, i, 1))}
    <Punch t={t - 4} lines={['RETREAT!']} y={360} size={110} />
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    <Outback id="e21" t={t} wheat sunY={480} />
    {herd(t, 5, 1260, 0.6)}
    <HostCut pose="sitting" x={880} bottom={1620} height={600} t={t} />
    <Punch t={t - 4} lines={['EMUS: 1', 'ARMY: 0']} y={340} size={100} color="#FFD23F" />
  </g>
);
export const S22: S = ({ t }) => (
  <g>
    <Outback id="e22" mood="night" t={t} sunY={420} />
    <HostCut pose="rock" x={540} bottom={1640} height={980} t={t} />
    <Punch t={t - 4} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={330} size={78} color="#C9A2FF" />
  </g>
);
