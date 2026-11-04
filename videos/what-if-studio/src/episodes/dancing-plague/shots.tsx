import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, Mood, MOODS, Sky, Figure, HostCut, HostPose, Punch, BigNumber, Calendar, Thermometer, Sfx, popIn, clamp, lerp, easeOut, Glow, INK, CloseCtx } from '../molasses/kit';

// "The Dancing Plague" (Strasbourg, 1518): a native 9:16 story Reel in the reference style, with the user's host
// (cut-outs from his model sheet). Key content sits between y = 280 and 1250. One colour mood per scene, layered
// flat silhouettes with a glowing rim, colour only on the key object (Frau Troffea's red skirt, blood, fire, ergot).

type S = React.FC<ShotProps>;
const RED = '#C8262E';

// ---------------------------------------------------------------- the set: Strasbourg's square
/** A half-timbered house front: gable, beams, lit windows. */
const House: React.FC<{ x: number; base: number; w: number; h: number; c: string; rim: string; seed: number; lit: number }> = ({ x, base, w, h, c, rim, seed, lit }) => {
  const top = base - h, roof = w * 0.62;
  const cols = Math.max(2, Math.floor(w / 70)), rows = Math.max(2, Math.floor((h - 60) / 110));
  return (
    <g>
      <path d={`M ${x - 8} ${top} L ${x + w / 2} ${top - roof} L ${x + w + 8} ${top} Z`} fill={c} stroke={rim} strokeOpacity={0.35} strokeWidth={2} />
      <rect x={x} y={top} width={w} height={h} fill={c} />
      {/* timber framing: floor beams and crosses, a shade darker */}
      <g stroke={INK} strokeOpacity={0.45} strokeWidth={6}>
        {Array.from({ length: rows }, (_, r) => <path key={r} d={`M ${x} ${top + 20 + r * 110} L ${x + w} ${top + 20 + r * 110}`} />)}
        {Array.from({ length: cols + 1 }, (_, k) => <path key={`v${k}`} d={`M ${x + (k * w) / cols} ${top} L ${x + (k * w) / cols} ${base}`} />)}
        {Array.from({ length: cols }, (_, k) => <path key={`x${k}`} d={`M ${x + (k * w) / cols} ${top + 20} L ${x + ((k + 1) * w) / cols} ${top + 74} M ${x + ((k + 1) * w) / cols} ${top + 20} L ${x + (k * w) / cols} ${top + 74}`} strokeWidth={4} />)}
      </g>
      {Array.from({ length: cols * (rows - 1) }, (_, k) => {
        const cx = x + ((k % cols) + 0.5) * (w / cols), cy = top + 80 + Math.floor(k / cols) * 110;
        const on = random(`dw${seed}-${k}`) < lit;
        return <rect key={k} x={cx - 13} y={cy} width={26} height={38} rx={4} fill={on ? '#FFD27A' : '#000'} opacity={on ? 0.85 : 0.25} />;
      })}
      <path d={`M ${x + w / 2 - 22} ${base} L ${x + w / 2 - 22} ${base - 70} Q ${x + w / 2} ${base - 96} ${x + w / 2 + 22} ${base - 70} L ${x + w / 2 + 22} ${base} Z`} fill={INK} opacity={0.6} />
      <circle cx={x + w / 2} cy={top - roof * 0.45} r={10} fill="#FFD27A" opacity={lit > 0.3 ? 0.7 : 0.15} />
    </g>
  );
};
/** The cathedral far off: one tall openwork spire (Strasbourg's). */
const Cathedral: React.FC<{ x: number; base: number; s: number; c: string }> = ({ x, base, s, c }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`} fill={c}>
    <rect x={-160} y={-420} width={320} height={420} />
    <rect x={30} y={-640} width={110} height={230} />
    <path d="M 30 -640 L 85 -1000 L 140 -640 Z" />
    <path d="M -160 -420 L -120 -470 L -80 -420 Z" />
    <circle cx={-40} cy={-300} r={58} fill="#000" opacity={0.25} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={46 + (i % 3) * 30} y={-620 + Math.floor(i / 3) * 90} width={12} height={60} fill="#000" opacity={0.25} />)}
  </g>
);
/** The cobbled square in perspective. */
const Cobbles: React.FC<{ mood: Mood; y?: number }> = ({ mood, y = 1180 }) => {
  const m = MOODS[mood];
  return (
    <g>
      <rect x={-200} y={y} width={W + 400} height={1200} fill={m.ground} />
      {Array.from({ length: 9 }, (_, r) => {
        const yy = y + 14 + r * r * 9 + r * 12, n = 10 + r * 2, sw = (W + 400) / n, h = 8 + r * 3;
        return <g key={r}>{Array.from({ length: n + 1 }, (_, k) => <ellipse key={k} cx={-200 + (k + (r % 2) * 0.5) * sw} cy={yy} rx={sw * 0.42} ry={h} fill={m.layers[2]} opacity={0.5} />)}</g>;
      })}
    </g>
  );
};
const BACK: [number, number, number][] = [[-60, 170, 300], [110, 150, 250], [260, 170, 330], [430, 140, 270], [570, 160, 310], [730, 150, 260], [880, 180, 320]];
/** Strasbourg's square: sky, the spire, a back row of timbered houses, side houses at the edges, cobbles. */
const Square: React.FC<{ id: string; mood: Mood; t: number; sunY?: number; sunX?: number; moon?: boolean; torches?: boolean; flags?: boolean }> = ({ id, mood, t, sunY = 420, sunX = 760, moon, torches, flags }) => {
  const m = MOODS[mood];
  const lit = mood === 'night' || mood === 'danger' ? 0.65 : mood === 'warm' ? 0.4 : 0.15;
  return (
    <g>
      <Sky id={id} mood={mood} sunY={sunY} sunX={sunX} moon={moon} />
      <Cathedral x={560} base={1000} s={0.95} c={m.layers[0]} />
      {BACK.map(([x, w, h], i) => <House key={i} x={x} base={1190} w={w} h={h + 160} c={m.layers[1]} rim={m.rim} seed={i} lit={lit} />)}
      {/* side houses leaning in at the frame edges */}
      <g>
        <House x={-90} base={1500} w={230} h={980} c={m.layers[2]} rim={m.rim} seed={21} lit={lit} />
        <House x={940} base={1500} w={240} h={940} c={m.layers[2]} rim={m.rim} seed={22} lit={lit} />
      </g>
      <Cobbles mood={mood} />
      {flags ? <path d="M 140 640 Q 540 760 940 640" stroke={INK} strokeWidth={4} fill="none" /> : null}
      {flags ? Array.from({ length: 12 }, (_, i) => {
        const u = (i + 0.5) / 12, fx = lerp(140, 940, u), fy = 640 + Math.sin(u * Math.PI) * 120 * 0.83;
        return <path key={i} d={`M ${fx - 22} ${fy} L ${fx + 22} ${fy} L ${fx} ${fy + 50 + Math.sin(t * 0.2 + i) * 4} Z`} fill={['#D84A3A', '#3A7AD8', '#E8C24A', '#F4F0E8'][i % 4]} stroke={INK} strokeWidth={3} />;
      }) : null}
      {torches ? [[150, 1300], [930, 1300], [330, 1210], [760, 1210]].map(([tx, ty], i) => <Torch key={i} x={tx} y={ty} t={t + i * 7} />) : null}
    </g>
  );
};
const Torch: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const fl = 1 + 0.12 * Math.sin(t * 0.9) + 0.08 * Math.sin(t * 2.3);
  return (
    <g>
      <rect x={x - 6} y={y - 170} width={12} height={170} fill={INK} />
      <path d={`M ${x} ${y - 170 - 70 * fl} Q ${x + 30} ${y - 190} ${x + 14} ${y - 168} L ${x - 14} ${y - 168} Q ${x - 30} ${y - 190} ${x} ${y - 170 - 70 * fl} Z`} fill="#FFB13A" />
      <path d={`M ${x} ${y - 175 - 40 * fl} Q ${x + 14} ${y - 186} ${x + 6} ${y - 170} L ${x - 6} ${y - 170} Q ${x - 14} ${y - 186} ${x} ${y - 175 - 40 * fl} Z`} fill="#FFF2B0" />
      <Glow x={x} y={y - 200} r={230} kind="warm" o={0.7} />
    </g>
  );
};

// ---------------------------------------------------------------- the people
/** A woman of 1518 in silhouette with the scene's glowing rim: white coif, bodice, bell skirt. `red` = Frau Troffea.
 *  dance 0..1 swings the skirt and arms; ph is the step phase; fall 0..1 slumps her to the ground. */
const Dancer: React.FC<{ x: number; feet: number; s: number; mood: Mood; t: number; ph?: number; dance?: number; red?: boolean; arms?: number; fall?: number; flip?: boolean; cry?: boolean }> = ({ x, feet, s, mood, t, ph = 0, dance = 1, red, arms = 1, fall = 0, flip, cry }) => {
  const rim = MOODS[mood].rim;
  const p = t * 0.32 + ph;
  const hop = Math.abs(Math.sin(p)) * 26 * dance * (1 - fall);
  const sw = Math.sin(p + 0.7) * 34 * dance;
  const lean = Math.sin(p) * 8 * dance;
  const aL = lerp(20, 160, arms) + Math.sin(p * 1.3) * 25 * dance, aR = lerp(-20, -150, arms) + Math.cos(p * 1.1) * 25 * dance;
  const skirt = red ? RED : INK;
  return (
    <g transform={`translate(${x} ${feet - hop}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${lean + fall * 82} 0 ${-10})`} style={{ filter: `drop-shadow(0 0 6px ${rim})` }}>
      {/* feet kicking under the hem */}
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 26 + Math.max(0, Math.sin(p + (sd > 0 ? 0 : Math.PI))) * 30 * dance} cy={-10 - Math.max(0, Math.sin(p + (sd > 0 ? 0 : Math.PI))) * 26 * dance} rx={28} ry={12} fill={INK} />)}
      <path d={`M -44 -300 Q -90 ${-150} ${-128 - sw} -24 Q 0 0 ${128 - sw} -24 Q 90 -150 44 -300 Z`} fill={skirt} stroke={rim} strokeWidth={3} />
      {red ? <path d={`M ${-118 - sw} -40 Q 0 -14 ${118 - sw} -40`} stroke="#7A0E16" strokeWidth={10} fill="none" /> : null}
      <path d="M -40 -300 L -36 -430 Q 0 -450 36 -430 L 40 -300 Z" fill={INK} stroke={rim} strokeWidth={3} />
      {/* arms */}
      {[[-34, aL], [34, aR]].map(([sx, a], i) => (
        <g key={i} transform={`translate(${sx} -420) rotate(${a})`}>
          <path d="M 0 0 L 0 150" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <circle cx={0} cy={158} r={14} fill={INK} />
        </g>
      ))}
      <rect x={-12} y={-470} width={24} height={34} fill={INK} />
      <ellipse cx={0} cy={-505} rx={40} ry={46} fill={INK} stroke={rim} strokeWidth={3} />
      {/* the white coif and its tail */}
      <path d="M -46 -500 Q -50 -566 0 -568 Q 50 -566 48 -510 Q 30 -540 0 -540 Q -30 -540 -46 -500 Z" fill="#F2EADC" />
      <path d="M -44 -505 Q -66 -460 -60 -420 L -44 -424 Q -50 -462 -36 -496 Z" fill="#F2EADC" />
      {cry ? [0, 1].map((i) => <ellipse key={i} cx={-14 + i * 28} cy={-490 + ((t * 2 + i * 9) % 30)} rx={5} ry={8} fill="#BDE6FF" opacity={0.9} />) : null}
    </g>
  );
};
/** A crowd of dancers (women and capped men), each in its own phase. */
const dancers = (mood: Mood, t: number, n: number, x0: number, x1: number, feet: number, s: number, seed = 0, dance = 1) =>
  Array.from({ length: n }, (_, i) => {
    const x = lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)) + (random(`dx${seed}${i}`) - 0.5) * 40;
    const f = feet + (i % 3) * 16, ss = s * (0.9 + (i % 3) * 0.07), ph = i * 1.9 + seed;
    if (i % 3 === 1) {
      const p = t * 0.32 + ph, sw = Math.sin(p) * 30 * dance;
      return <Figure key={i} x={x} feet={f - Math.abs(Math.sin(p)) * 20 * dance} s={ss * 0.95} mood={mood} hat="cap" pose={{ yaw: i % 2 ? 0.4 : -0.4, legL: { a: sw, b: -Math.abs(sw) }, legR: { a: -sw, b: -Math.abs(sw) }, armL: { a: 150 + sw, b: 30 }, armR: { a: 150 - sw, b: 30 } }} />;
    }
    return <Dancer key={i} x={x} feet={f} s={ss * 0.62} mood={mood} t={t} ph={ph} dance={dance} flip={i % 2 === 0} />;
  });
const dust = (t: number, x: number, y: number, n = 6, c = '#E8D8B8') => Array.from({ length: n }, (_, i) => {
  const k = ((t * 0.04 + i / n) % 1);
  return <circle key={i} cx={x + (i - n / 2) * 30 + k * (i % 2 ? 40 : -40)} cy={y - k * 70} r={10 + k * 30} fill={c} opacity={0.35 * (1 - k)} />;
});

// ---------------------------------------------------------------- props
/** Close on two dancing feet in leg wraps and worn leather shoes on cobbles; `torn` splits them, `blood` stains. */
const Feet: React.FC<{ t: number; torn?: number; blood?: number; mood?: Mood }> = ({ t, torn = 0, blood = 0, mood = 'night' }) => {
  const m = MOODS[mood];
  const leg = (sd: number) => {
    const p = t * 0.42 + (sd > 0 ? 0 : Math.PI), lift = Math.max(0, Math.sin(p)) * 150, sw = Math.sin(p) * 40;
    const x = 540 + sd * 170 + sw;
    return (
      <g key={sd} transform={`translate(${x} ${1200 - lift}) rotate(${-sd * 4 + Math.sin(p) * 6})`}>
        <path d="M -70 -900 L -62 -60 L 62 -60 L 70 -900 Z" fill="#D8C8A8" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -64 ${-840 + i * 88} L 64 ${-790 + i * 88} M 64 ${-840 + i * 88} L -64 ${-790 + i * 88}`} stroke="#5A3A22" strokeWidth={10} />)}
        <path d={`M -80 -70 Q -90 10 -40 20 L 170 20 Q 200 0 180 -30 Q 120 -70 60 -80 Z`} fill="#8A5A32" stroke={INK} strokeWidth={8} />
        {torn > 0 ? <path d={`M 60 -10 L ${80 + torn * 30} ${-40 - torn * 10} L 110 -6 L ${130 + torn * 20} -36 L 150 0`} stroke={INK} strokeWidth={8} fill={blood > 0 ? RED : '#E8C8A8'} /> : null}
        {blood > 0 ? <ellipse cx={40} cy={22} rx={90 * blood} ry={10} fill={RED} opacity={0.85} /> : null}
      </g>
    );
  };
  return (
    <g>
      <rect x={-200} y={-200} width={W + 400} height={2400} fill={m.layers[2]} />
      <path d="M -200 -200 L 1280 -200 L 1280 120 Q 540 220 -200 120 Z" fill="#7A1420" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${-100 + i * 100} 110 l 50 60 l 50 -60`} fill="#F2EADC" />)}
      <rect x={-200} y={1180} width={W + 400} height={900} fill={m.ground} />
      {Array.from({ length: 4 }, (_, r) => <g key={r}>{Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx={(k + (r % 2) * 0.5) * 160} cy={1240 + r * 90} rx={70} ry={30} fill={m.layers[1]} opacity={0.6} />)}</g>)}
      {blood > 0 ? [0, 1, 2, 3].map((i) => <ellipse key={i} cx={300 + i * 160} cy={1260 + (i % 2) * 40} rx={40 * blood} ry={12 * blood} fill={RED} opacity={0.8} />) : null}
      {leg(-1)}{leg(1)}
      {dust(t, 540, 1220, 8)}
    </g>
  );
};
const Hourglass: React.FC<{ t: number; x?: number; y?: number; k: number }> = ({ t, x = 540, y = 760, k }) => (
  <g transform={`translate(${x} ${y}) scale(${popIn(t) * 1.5})`}>
    <rect x={-150} y={-230} width={300} height={36} rx={10} fill="#B8862A" stroke={INK} strokeWidth={8} />
    <rect x={-150} y={194} width={300} height={36} rx={10} fill="#B8862A" stroke={INK} strokeWidth={8} />
    <path d="M -110 -194 L 110 -194 Q 100 -40 12 0 Q 100 40 110 194 L -110 194 Q -100 40 -12 0 Q -100 -40 -110 -194 Z" fill="#FFF4D8" fillOpacity={0.35} stroke={INK} strokeWidth={8} />
    <path d={`M ${-90 + k * 70} ${-150 + k * 140} L ${90 - k * 70} ${-150 + k * 140} Q 40 -40 0 0 Q -40 -40 ${-90 + k * 70} ${-150 + k * 140} Z`} fill="#E8B24A" />
    <path d={`M -100 190 Q 0 ${190 - 150 * k} 100 190 Z`} fill="#E8B24A" />
    <rect x={-3} y={0} width={6} height={190 - 150 * k * 0.6} fill="#E8B24A" opacity={k < 1 ? 1 : 0} />
  </g>
);
const Book: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 820) scale(${popIn(t) * 1.25}) rotate(-3)`}>
    <path d="M -360 -230 Q -180 -270 0 -220 Q 180 -270 360 -230 L 360 230 Q 180 190 0 240 Q -180 190 -360 230 Z" fill="#F2E4C4" stroke={INK} strokeWidth={10} />
    <path d="M 0 -220 L 0 240" stroke={INK} strokeWidth={6} />
    <text x={-300} y={-140} fontFamily={FONT.title} fontWeight={800} fontSize={74} fill="#A8262E">A</text>
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${i ? -310 : -230} ${-150 + i * 46} L -40 ${-150 + i * 46}`} stroke="#8A7A60" strokeWidth={8} strokeLinecap="round" />)}
    {/* a woodcut of dancers on the right-hand page */}
    <rect x={40} y={-180} width={290} height={330} fill="#E8D6AE" stroke="#6A5A40" strokeWidth={4} />
    {[100, 180, 260].map((dx, i) => <g key={i} transform={`translate(${dx} 120) scale(0.18)`}><Dancer x={0} feet={0} s={1} mood="warm" t={t} ph={i * 2} /></g>)}
  </g>
);
const MapCard: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 800) scale(${popIn(t) * 1.02}) rotate(2)`}>
    <rect x={-380} y={-320} width={760} height={640} rx={18} fill="#EAD9B0" stroke={INK} strokeWidth={10} />
    {/* the Rhine and the Vosges, schematic */}
    <path d="M 120 -300 Q 60 -160 100 -40 Q 150 80 90 200 Q 50 260 80 310" stroke="#4A7AB0" strokeWidth={16} fill="none" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-280 + i * 50} ${-60 + (i % 2) * 40} l 40 -70 l 40 70`} fill="#B8A078" stroke="#6A5A40" strokeWidth={4} />)}
    <text x={-250} y={-200} fontFamily={FONT.title} fontWeight={800} fontSize={44} fill="#6A5A40">HOLY ROMAN EMPIRE</text>
    <g transform={`translate(70 0) scale(${popIn(t - 6)})`}>
      <path d="M 0 0 C -40 -50 -40 -100 0 -100 C 40 -100 40 -50 0 0 Z" fill={RED} stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-68} r={14} fill="#FFF" />
    </g>
    <text x={0} y={150} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={66} fill={INK}>STRASBOURG</text>
  </g>
);
const Crossed: React.FC<{ t: number; x: number; y: number; icon: 'music' | 'drum' | 'wine' }> = ({ t, x, y, icon }) => (
  <g transform={`translate(${x} ${y}) scale(${popIn(t)})`}>
    <circle r={120} fill="#FFF8EA" stroke={INK} strokeWidth={10} />
    {icon === 'music' ? <g fill={INK}><ellipse cx={-30} cy={50} rx={30} ry={22} /><ellipse cx={40} cy={30} rx={30} ry={22} /><path d="M -2 50 L -2 -70 L 68 -90 L 68 30" stroke={INK} strokeWidth={12} fill="none" /></g> : null}
    {icon === 'drum' ? <g><rect x={-70} y={-40} width={140} height={100} rx={14} fill="#B84A2A" stroke={INK} strokeWidth={8} /><ellipse cx={0} cy={-40} rx={70} ry={20} fill="#F2E4C4" stroke={INK} strokeWidth={8} /><path d="M -60 -90 L 10 -50 M 60 -100 L 0 -50" stroke={INK} strokeWidth={10} strokeLinecap="round" /></g> : null}
    {icon === 'wine' ? <g><path d="M -40 -80 L 40 -80 Q 46 0 0 20 Q -46 0 -40 -80 Z" fill="#8A1A2A" stroke={INK} strokeWidth={8} /><path d="M 0 20 L 0 80 M -36 80 L 36 80" stroke={INK} strokeWidth={10} strokeLinecap="round" /></g> : null}
    {t > 6 ? <path d="M -100 -100 L 100 100 M 100 -100 L -100 100" stroke={RED} strokeWidth={26} strokeLinecap="round" transform={`scale(${popIn(t - 6, 5)})`} /> : null}
  </g>
);
const Stage: React.FC<{ y: number; k?: number }> = ({ y, k = 1 }) => (
  <g>
    {Array.from({ length: 8 }, (_, i) => (i / 8 < k ? <rect key={i} x={230 + i * 78} y={y - 160} width={74} height={24} fill="#8A5A32" stroke={INK} strokeWidth={5} /> : null))}
    {k > 0.3 ? [240, 420, 640, 830].map((lx) => <rect key={lx} x={lx} y={y - 140} width={20} height={140} fill="#5A3A22" stroke={INK} strokeWidth={4} />) : null}
    {k > 0.6 ? <rect x={230} y={y - 136} width={624} height={70} fill="#6A4428" stroke={INK} strokeWidth={5} /> : null}
  </g>
);
const Musicians: React.FC<{ t: number; y: number; mood: Mood }> = ({ t, y, mood }) => {
  const beat = Math.abs(Math.sin(t * 0.4));
  return (
    <g>
      <Figure x={400} feet={y - 160} s={0.62} mood={mood} hat="cap" pose={{ yaw: 0.5, armR: { a: 70 + beat * 40, b: 40 }, armL: { a: 60, b: 50 } }} />
      <g transform={`translate(470 ${y - 330})`}><rect x={-50} y={-36} width={100} height={76} rx={10} fill="#B84A2A" stroke={INK} strokeWidth={6} /><ellipse cx={0} cy={-36} rx={50} ry={14} fill="#F2E4C4" stroke={INK} strokeWidth={6} /></g>
      <Figure x={680} feet={y - 160} s={0.62} mood={mood} hat="cap" pose={{ yaw: -0.5, armR: { a: 100, b: 70 }, armL: { a: 100, b: 70 } }} />
      <path d={`M 620 ${y - 470} L 520 ${y - 380}`} stroke="#5A3A22" strokeWidth={12} strokeLinecap="round" />
      {[0, 1, 2].map((i) => {
        const k = ((t * 0.03 + i / 3) % 1);
        return <text key={i} x={560 + Math.sin(k * 6 + i) * 60 + i * 30} y={y - 520 - k * 260} fontSize={70} fill="#FFE27A" opacity={1 - k} fontFamily={FONT.title}>{i % 2 ? '♪' : '♫'}</text>;
      })}
    </g>
  );
};
const Barn: React.FC<{ t: number; fire: number }> = ({ t, fire }) => (
  <g>
    <path d="M 300 1180 L 300 820 L 540 640 L 780 820 L 780 1180 Z" fill="#5A2A1A" stroke={INK} strokeWidth={8} />
    <path d="M 470 1180 L 470 980 L 610 980 L 610 1180" fill={INK} />
    {Array.from({ length: 9 }, (_, i) => {
      const fx = 300 + i * 60, fl = 1 + 0.25 * Math.sin(t * 0.7 + i * 1.9);
      const h = (240 + (i % 3) * 90) * fire * fl;
      return <g key={i}>
        <path d={`M ${fx - 40} 1000 Q ${fx - 30} ${1000 - h * 0.6} ${fx} ${1000 - h} Q ${fx + 30} ${1000 - h * 0.6} ${fx + 40} 1000 Z`} fill="#FF6A1A" />
        <path d={`M ${fx - 20} 1000 Q ${fx - 14} ${1000 - h * 0.4} ${fx} ${1000 - h * 0.6} Q ${fx + 14} ${1000 - h * 0.4} ${fx + 20} 1000 Z`} fill="#FFD23F" />
      </g>;
    })}
    <Glow x={540} y={800} r={600} kind="red" o={0.8 * fire} />
    {Array.from({ length: 5 }, (_, i) => { const k = ((t * 0.02 + i / 5) % 1); return <circle key={i} cx={500 + Math.sin(k * 5 + i) * 80} cy={600 - k * 500} r={40 + k * 70} fill="#3A2420" opacity={0.5 * (1 - k)} />; })}
  </g>
);
const Graves: React.FC<{ n: number; t: number }> = ({ n, t }) => (
  <g fill={INK}>
    {Array.from({ length: n }, (_, i) => {
      const x = 90 + i * (900 / Math.max(1, n - 1)), y = 1160 + (i % 2) * 30, k = popIn(t - i * 2, 5);
      return <g key={i} transform={`translate(${x} ${y}) scale(${k})`}><rect x={-7} y={-110} width={14} height={110} /><rect x={-40} y={-84} width={80} height={14} /></g>;
    })}
  </g>
);
const Rye: React.FC<{ t: number; ergot: number; big?: boolean }> = ({ t, ergot, big }) => {
  const ear = (x: number, y: number, s: number, i: number) => {
    const sw = Math.sin(t * 0.08 + i) * 8;
    return (
      <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${sw})`}>
        <path d="M 0 0 Q 6 -300 0 -560" stroke="#C8A050" strokeWidth={8} fill="none" />
        {Array.from({ length: 10 }, (_, k) => [-1, 1].map((sd) => <ellipse key={`${k}${sd}`} cx={sd * 16} cy={-400 - k * 18} rx={10} ry={20} fill="#E2C070" stroke="#8A6A30" strokeWidth={3} transform={`rotate(${sd * 24} ${sd * 16} ${-400 - k * 18})`} />))}
        {ergot > 0 ? [2, 5, 7].map((k) => <path key={k} d={`M ${k % 2 ? 14 : -14} ${-400 - k * 18} q ${k % 2 ? 30 : -30} -20 ${k % 2 ? 26 : -26} -66`} stroke="#3A1A44" strokeWidth={14 * ergot} strokeLinecap="round" fill="none" />) : null}
        {ergot > 0 ? <Glow x={0} y={-480} r={120} kind="cool" o={0.5 * ergot} /> : null}
      </g>
    );
  };
  return big ? <g>{ear(540, 1500, 2.2, 0)}</g> : <g>{Array.from({ length: 14 }, (_, i) => ear(40 + i * 76, 1300 + (i % 3) * 40, 0.9 + (i % 3) * 0.15, i))}</g>;
};
const Flask: React.FC<{ t: number; mol: number }> = ({ t, mol }) => (
  <g transform={`translate(540 900) scale(${popIn(t) * 1.5})`}>
    <defs><linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0">{['#FF5A5A', '#FFB13A', '#FFE27A', '#5AD87A', '#5AA8FF', '#A87AFF'].map((c, i) => <stop key={i} offset={`${i * 20}%`} stopColor={c} />)}</linearGradient></defs>
    <path d="M -40 -260 L -40 -110 L -190 160 Q -200 200 -160 200 L 160 200 Q 200 200 190 160 L 40 -110 L 40 -260 Z" fill="#FFFFFF" fillOpacity={0.18} stroke="#F4F0FF" strokeWidth={10} />
    <path d={`M -120 40 Q ${-60 + Math.sin(t * 0.2) * 20} 20 0 40 Q 60 60 120 40 L 186 160 Q 196 196 160 196 L -160 196 Q -196 196 -186 160 Z`} fill="url(#rainbow)" />
    {Array.from({ length: 5 }, (_, i) => { const k = ((t * 0.03 + i / 5) % 1); return <circle key={i} cx={-60 + i * 30} cy={160 - k * 300} r={8 + i * 2} fill="#FFFFFF" opacity={0.6 * (1 - k)} />; })}
    {mol > 0 ? <g transform={`translate(80 -420) scale(${mol})`} stroke="#F4F0FF" strokeWidth={7} fill="none">
      {[0, 1].map((r) => <path key={r} d={`M ${r * 104} 0 l 52 -30 l 52 30 l 0 60 l -52 30 l -52 -30 Z`} />)}
      <path d="M 208 30 l 60 -30 l 40 50 M 52 -30 l 0 -60" /><text x={300} y={70} fill="#F4F0FF" stroke="none" fontSize={40} fontFamily={FONT.title}>N</text>
    </g> : null}
  </g>
);
const Swirl: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={540} cy={860} r={1500 - i * 105 + ((t * 6) % 105)} fill={['#FF7A9A', '#FFC85A', '#7AE0C8', '#9A8AFF', '#FF9AE0', '#8AD8FF'][i % 6]} />)}
  </g>
);
const StainedGlass: React.FC<{ t: number; red?: number }> = ({ t, red = 0 }) => (
  <g transform="translate(540 820)">
    <path d="M -260 420 L -260 -200 Q -260 -460 0 -500 Q 260 -460 260 -200 L 260 420 Z" fill="#1A1030" stroke={INK} strokeWidth={20} />
    {Array.from({ length: 24 }, (_, i) => {
      const cx = -200 + (i % 4) * 133, cy = -330 + Math.floor(i / 4) * 130;
      return <rect key={i} x={cx - 60} y={cy - 60} width={124} height={124} fill={['#2A5AC8', '#C8302A', '#E8B23A', '#2A9A6A'][(i * 7) % 4]} opacity={0.85} stroke={INK} strokeWidth={8} />;
    })}
    {/* the saint: a robed figure with a halo, holding a palm */}
    <g>
      <circle cx={0} cy={-250} r={86} fill="#FFE27A" stroke={INK} strokeWidth={8} />
      <circle cx={0} cy={-240} r={52} fill="#F2D0A8" stroke={INK} strokeWidth={8} />
      <path d="M -110 330 L -70 -170 Q 0 -200 70 -170 L 110 330 Z" fill={red > 0 ? RED : '#C8302A'} stroke={INK} strokeWidth={10} />
      <path d="M 90 -100 Q 150 -200 120 -300" stroke="#2A9A6A" strokeWidth={18} fill="none" />
    </g>
    <Glow x={0} y={-100} r={560} kind={red > 0 ? 'red' : 'cool'} o={0.55} />
  </g>
);
const HeadBust: React.FC<{ x: number; y: number; s: number; scream?: boolean; rim: string; t: number }> = ({ x, y, s, scream, rim, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 0.6 + x) * 6}) scale(${s})`} style={{ filter: `drop-shadow(0 0 8px ${rim})` }}>
    <path d="M -150 260 Q -150 120 -60 100 L 60 100 Q 150 120 150 260 Z" fill={INK} />
    <ellipse cx={0} cy={0} rx={100} ry={120} fill={INK} />
    <path d="M -106 -10 Q -110 -136 0 -140 Q 110 -136 106 -10 Q 70 -90 0 -92 Q -70 -90 -106 -10 Z" fill="#F2EADC" />
    {scream ? <g><ellipse cx={-36} cy={-10} rx={14} ry={18} fill="#FFF" /><ellipse cx={36} cy={-10} rx={14} ry={18} fill="#FFF" /><ellipse cx={0} cy={60} rx={30} ry={42} fill="#3A0A10" stroke={rim} strokeWidth={3} />
      {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 150} 200 Q ${sd * 140} 60 ${sd * 96} 20`} stroke={INK} strokeWidth={40} strokeLinecap="round" fill="none" />)}</g> : null}
  </g>
);
const ShrineHill: React.FC<{ t: number; mood: Mood }> = ({ t, mood }) => {
  const m = MOODS[mood];
  const path: [number, number][] = [[80, 1300], [600, 1220], [360, 1060], [700, 900], [540, 760]];
  const at = (u: number) => { const n = path.length - 1, i = Math.min(n - 1, Math.floor(u * n)), f = u * n - i; return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)]; };
  return (
    <g>
      <path d="M -100 1400 Q 200 1100 420 760 Q 540 620 660 760 Q 900 1100 1200 1300 L 1200 2000 L -100 2000 Z" fill={m.layers[1]} />
      <path d={`M ${path.map((p) => p.join(' ')).join(' L ')}`} stroke={m.layers[0]} strokeWidth={22} fill="none" strokeDasharray="30 18" />
      <g transform="translate(540 740)">
        <rect x={-70} y={-110} width={140} height={110} fill={m.layers[2]} />
        <path d="M -86 -110 L 0 -190 L 86 -110 Z" fill={m.layers[2]} />
        <rect x={-6} y={-260} width={12} height={74} fill={m.layers[2]} /><rect x={-26} y={-236} width={52} height={12} fill={m.layers[2]} />
        <path d="M -18 0 L -18 -50 Q 0 -72 18 -50 L 18 0 Z" fill="#FFD27A" />
        <Glow x={0} y={-40} r={220} kind="warm" o={0.8} />
      </g>
      {Array.from({ length: 7 }, (_, i) => {
        const u = clamp(((t * 0.006) + i * 0.1) % 1);
        const [x, y] = at(u);
        return <Dancer key={i} x={x} feet={y} s={0.16 - u * 0.05} mood={mood} t={t} ph={i} dance={0.3} arms={0.2} red={i === 2} />;
      })}
    </g>
  );
};
const HeadSpread: React.FC<{ t: number; mood: Mood }> = ({ t, mood }) => {
  const rim = MOODS[mood].rim;
  const pos: [number, number, number][] = [[540, 900, 1.3], [230, 1060, 0.8], [850, 1060, 0.8], [130, 760, 0.6], [950, 760, 0.6], [360, 600, 0.5], [720, 600, 0.5]];
  return (
    <g>
      {pos.map(([x, y, s], i) => {
        const on = clamp((t - i * 5) / 6);
        return <g key={i} transform={`translate(${x} ${y}) scale(${s})`} style={{ filter: `drop-shadow(0 0 6px ${rim})` }}>
          <path d="M -120 220 Q -120 100 -40 80 L 40 80 Q 120 100 120 220 Z" fill={INK} />
          <ellipse cx={0} cy={-20} rx={90} ry={110} fill={INK} />
          <circle cx={0} cy={-40} r={60 * on} fill={RED} opacity={0.8} />
          <Glow x={0} y={-40} r={160} kind="red" o={0.6 * on} />
        </g>;
      })}
    </g>
  );
};
const Bowl: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}><path d="M -70 0 Q -70 60 0 60 Q 70 60 70 0 Z" fill="#8A5A32" stroke={INK} strokeWidth={6} /><ellipse cx={0} cy={0} rx={70} ry={16} fill="#3A2414" stroke={INK} strokeWidth={6} /></g>
);
const Hall: React.FC<{ id: string; t: number }> = ({ id, t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#3A2A22" />
    {Array.from({ length: 22 }, (_, r) => <g key={r}>{Array.from({ length: 8 }, (_, k) => <rect key={k} x={-60 + k * 160 + (r % 2) * 80} y={r * 70} width={150} height={62} fill="#4A3A30" />)}</g>)}
    <path d="M 340 760 L 340 380 Q 540 200 740 380 L 740 760 Z" fill="#2A3A6A" stroke={INK} strokeWidth={14} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={360 + (i % 3) * 124} y={420 + Math.floor(i / 3) * 170} width={110} height={150} fill={['#6A8AD8', '#C8402E', '#E8B24A'][i % 3]} opacity={0.6} />)}
    <rect x={-200} y={1180} width={W + 400} height={900} fill="#1E140E" />
    <rect x={120} y={1060} width={840} height={30} fill="#E8D6AE" stroke={INK} strokeWidth={6} />
    <rect x={150} y={1090} width={780} height={110} fill="#3A2414" />
    {[220, 400, 680, 860].map((cx, i) => { const fl = 1 + 0.15 * Math.sin(t * 0.8 + i); return <g key={i}><rect x={cx - 8} y={1010} width={16} height={50} fill="#F2EADC" /><ellipse cx={cx} cy={1000 - 6 * fl} rx={8} ry={16 * fl} fill="#FFC24A" /><Glow x={cx} y={990} r={160} kind="warm" o={0.6} /></g>; })}
  </g>
);
const Doctor: React.FC<{ x: number; feet: number; s: number; t: number; arm?: number; flip?: boolean }> = ({ x, feet, s, t, arm = 0, flip }) => (
  <g transform={`translate(${x} ${feet}) scale(${(flip ? -1 : 1) * s} ${s})`} style={{ filter: 'drop-shadow(0 0 6px #FFD27A)' }}>
    <path d="M -110 0 L -70 -520 Q 0 -560 70 -520 L 110 0 Z" fill={INK} />
    <ellipse cx={0} cy={-600} rx={54} ry={62} fill={INK} />
    <path d="M -50 -560 Q 0 -500 50 -560 L 40 -520 Q 0 -480 -40 -520 Z" fill={INK} />
    <path d="M -80 -640 L 80 -640 L 70 -660 L 50 -800 L -50 -800 L -70 -660 Z" fill={INK} />
    <g transform={`translate(60 -480) rotate(${-30 - arm * 70 + Math.sin(t * 0.3) * 6})`}><path d="M 0 0 L 0 190" stroke={INK} strokeWidth={34} strokeLinecap="round" />
      {arm > 0 ? <rect x={-40} y={180} width={80} height={110} rx={10} fill="#E8D6AE" stroke={INK} strokeWidth={5} /> : null}</g>
  </g>
);

// ---------------------------------------------------------------- shots: the hook (0-10 s)
export const S1: S = ({ t }) => (
  <g>
    <Square id="d1" mood="danger" t={t} moon sunY={360} sunX={300} torches />
    {dancers('danger', t, 9, 80, 1000, 1500, 0.95, 1)}
    <Punch t={t - 2} lines={['STRASBOURG,', '1518']} y={340} size={108} color="#FFD23F" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Square id="d2" mood="danger" t={t} torches />
    {dancers('danger', t, 7, 120, 960, 1330, 0.7, 3)}
    {dancers('danger', t, 6, 40, 1040, 1620, 1.05, 7)}
    <BigNumber t={t - 3} text="400" sub="PEOPLE DANCING" y={640} />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Square id="d3" mood="night" t={t} moon sunY={360} sunX={780} />
    <Calendar t={t - 1} day={String(14 + Math.min(30, Math.floor(t / 2)) % 31 || 1)} month="JULY" year="1518" x={540} y={760} />
    {dancers('night', t, 5, 160, 920, 1500, 0.9, 5)}
  </g>
);
export const S4: S = ({ t }) => <Feet t={t} torn={clamp((t - 10) / 10)} />;
export const S5: S = ({ t }) => <Feet t={t + 30} torn={1} blood={clamp(t / 12)} mood="danger" />;
export const S6: S = ({ t }) => (
  <g>
    <Square id="d6" mood="night" t={t} moon sunY={340} sunX={760} />
    {dancers('night', t, 6, 100, 980, 1450, 1.0, 11)}
    <Punch t={t - 4} lines={['THEY COULD', 'NOT STOP']} y={320} size={104} color="#FF5A5A" />
  </g>
);

// ---------------------------------------------------------------- the host
export const S7: S = ({ t }) => (
  <g>
    <Square id="d7" mood="warm" t={t} flags />
    {dancers('warm', t, 4, 640, 1040, 1300, 0.55, 2)}
    <HostCut pose="arms_crossed" x={360} bottom={1650} height={1000} t={t} />
    <Punch t={t - 4} lines={['NOT A', 'BEDTIME STORY']} y={320} size={92} color="#FFD23F" />
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A1A10" />
    {Array.from({ length: 6 }, (_, r) => <g key={r}><rect x={-100} y={60 + r * 190} width={1300} height={14} fill="#5A3A22" />
      {Array.from({ length: 24 }, (_, k) => <rect key={k} x={-80 + k * 54} y={60 + r * 190 - 150 + (k % 3) * 10} width={44} height={150 - (k % 3) * 10} fill={['#7A2A22', '#2A4A6A', '#6A5A2A', '#3A5A3A'][(k + r) % 4]} />)}</g>)}
    <Glow x={540} y={820} r={700} kind="warm" o={0.6} />
    <Book t={t - 1} />
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    <Sky id="d9" mood="danger" moon sunX={760} sunY={560} />
    <path d="M -100 1220 Q 540 1100 1180 1220 L 1180 2000 L -100 2000 Z" fill={INK} />
    {Array.from({ length: 6 }, (_, i) => <Dancer key={i} x={160 + i * 140} feet={1180 - Math.sin((i / 5) * Math.PI) * 50} s={0.36} mood="danger" t={t} ph={i * 1.2} red={i === 2} />)}
    <Punch t={t - 2} lines={['THE DANCING', 'PLAGUE']} y={320} size={112} color="#FF5A5A" />
  </g>
);

// ---------------------------------------------------------------- the setup
export const S10: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1C2440" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-100 + i * 50} -200 L ${-100 + i * 50} 2200`} stroke="#2A3A60" strokeWidth={2} />)}
    <MapCard t={t - 1} />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Square id="d11" mood="noon" t={t} sunY={380} />
    <Calendar t={t - 1} day="14" month="JULY" year="1518" x={540} y={760} />
  </g>
);
const troffeaOut = (t: number) => clamp((t - 8) / 30);
export const S12: S = ({ t }) => {
  const k = easeOut(troffeaOut(t));
  return (
    <g>
      <Square id="d12" mood="noon" t={t} sunY={380} />
      {/* a door swinging open on the left house, chickens scattering */}
      <rect x={60} y={1260} width={110} height={180} fill="#3A2414" />
      <rect x={60} y={1260} width={110 * (1 - k * 0.8)} height={180} fill="#6A4428" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={420 + i * 70 + k * (i + 1) * 60} cy={1330 + (i % 2) * 20} rx={24} ry={18} fill="#F2EADC" stroke={INK} strokeWidth={3} />)}
      <Dancer x={lerp(110, 360, k)} feet={1450} s={0.62} mood="noon" t={t} dance={0} arms={0} red />
    </g>
  );
};
export const S13: S = ({ t }) => (
  <g>
    <Square id="d13" mood="noon" t={t} sunY={380} />
    <Dancer x={540} feet={1560} s={1.0} mood="noon" t={t} dance={0} arms={0.05} red />
    <Punch t={t - 3} lines={['FRAU', 'TROFFEA']} y={320} size={110} color="#FF5A5A" />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <Square id="d14" mood="noon" t={t} sunY={380} />
    <Dancer x={540} feet={1340} s={0.42} mood="noon" t={t} dance={clamp((t - 30) / 10)} arms={0.3} red />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Square id="d15" mood="warm" t={t} sunY={420} />
    <Dancer x={540} feet={1500} s={0.85} mood="warm" t={t} dance={1} arms={1} red />
    {dust(t, 540, 1500, 8)}
    <Sfx t={t - 6} text="HOP!" x={820} y={720} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Square id="d16" mood="warm" t={t} />
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#140A12" opacity={0.45} />
    <Crossed t={t - 1} x={260} y={760} icon="music" />
    <Crossed t={t - 18} x={540} y={760} icon="drum" />
    <Crossed t={t - 36} x={820} y={760} icon="wine" />
    <Dancer x={540} feet={1450} s={0.5} mood="warm" t={t} red />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Square id="d17" mood="warm" t={t} />
    <Dancer x={540} feet={1560} s={1.05} mood="warm" t={t} dance={1} arms={0.9} red />
    {dust(t, 540, 1560, 10)}
    <Punch t={t - 4} lines={['JUST', 'DANCING']} y={320} size={104} color="#FFD23F" />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Sky id="d18" mood="warm" sunY={300} />
    <House x={40} base={2000} w={1000} h={1900} c={MOODS.warm.layers[1]} rim={MOODS.warm.rim} seed={40} lit={0} />
    {[[260, 620], [820, 620], [260, 1040], [820, 1040]].map(([wx, wy], i) => {
      const lean = Math.sin(t * 0.3 + i) * 6;
      return <g key={i}>
        <rect x={wx - 130} y={wy - 160} width={260} height={300} rx={10} fill="#FFD27A" stroke={INK} strokeWidth={10} />
        <g transform={`translate(${wx} ${wy + 150}) rotate(${lean})`} style={{ filter: 'drop-shadow(0 0 6px #FFD27A)' }}>
          <path d="M -100 0 Q -100 -110 -30 -120 L 30 -120 Q 100 -110 100 0 Z" fill={INK} />
          <ellipse cx={0} cy={-170} rx={56} ry={62} fill={INK} />
          {i % 2 ? <path d="M -60 -190 Q -60 -244 0 -246 Q 60 -244 60 -190 Z" fill="#F2EADC" /> : <path d="M -70 -200 Q -64 -250 0 -250 Q 64 -250 76 -204 L 96 -196 L -70 -196 Z" fill={INK} />}
          <path d="M -24 -150 Q 0 -126 24 -150" stroke="#FFD27A" strokeWidth={5} fill="none" />
        </g>
      </g>;
    })}
    <Sfx t={t - 6} text="HA HA!" x={540} y={830} rot={-6} />
  </g>
);
const react = (mood: Mood, pose: HostPose, words?: string[], color = '#FFD23F', height = 820): S => ({ t }) => (
  <g>
    <Square id={`r${mood}${pose}`} mood={mood} t={t} />
    <HostCut pose={pose} x={540} bottom={pose === 'bust' ? 1700 : 1520} height={height} t={t} />
    {words ? <Punch t={t - 4} lines={words} y={320} size={92} color={color} /> : null}
  </g>
);
export const S19 = react('warm', 'laugh_point', ['HER HUSBAND', 'LEFT?'], '#FFD23F', 980);
export const S20: S = ({ t, len }) => (
  <g>
    <Square id="d20" mood="noon" t={t} />
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#140A12" opacity={0.35} />
    <Hourglass t={t - 1} k={clamp(t / Math.max(1, len))} />
    <Punch t={t - 4} lines={['5 MINUTES?']} y={320} size={104} color="#FFD23F" />
  </g>
);
export const S21: S = ({ t, len }) => {
  const k = clamp(t / Math.max(1, len));
  const night = k > 0.5;
  return (
    <g>
      <Square id={`d21${night ? 'n' : 'd'}`} mood={night ? 'night' : 'warm'} t={t} moon={night} sunX={lerp(200, 880, (k * 2) % 1)} sunY={lerp(700, 360, Math.sin(((k * 2) % 1) * Math.PI))} />
      <Dancer x={540} feet={1450} s={0.62} mood={night ? 'night' : 'warm'} t={t} red />
      <Punch t={t - 3} lines={['DAY AND', 'NIGHT']} y={320} size={104} color="#FFD23F" />
    </g>
  );
};
export const S22: S = ({ t }) => (
  <g>
    <Square id="d22" mood="night" t={t} moon sunX={800} sunY={360} />
    <Calendar t={t - 1} day={String(14 + Math.min(6, Math.floor(t / 5)))} month="JULY" year="1518" x={540} y={760} />
    <Dancer x={540} feet={1500} s={0.5} mood="night" t={t} red />
  </g>
);
export const S23: S = ({ t }) => <Feet t={t + 12} torn={1} blood={0.4} mood="night" />;
export const S24: S = ({ t }) => (
  <g>
    <Square id="d24" mood="night" t={t} moon sunX={800} sunY={360} />
    <Dancer x={540} feet={2100} s={1.9} mood="night" t={t} dance={0.4} arms={0.75} red cry />
    <Punch t={t - 4} lines={["SHE COULDN'T", 'STOP']} y={300} size={92} color="#9FE3FF" />
  </g>
);
export const S25: S = ({ t }) => <Feet t={t + 48} torn={1} blood={1} mood="danger" />;

// ---------------------------------------------------------------- it spreads
export const S26: S = ({ t }) => (
  <g>
    <Square id="d26" mood="night" t={t} moon sunX={800} sunY={360} />
    <Dancer x={540} feet={1420} s={0.5} mood="night" t={t} red />
    {[160, 900, 330, 740, 90, 990].map((x, i) => (t > 4 + i * 5 ? <g key={i} transform={`translate(${x} 0) scale(${popIn(t - 4 - i * 5)}) translate(${-x} 0)`}><Dancer x={x} feet={1400 + (i % 2) * 60} s={0.44} mood="night" t={t} ph={i * 2} flip={x > 540} /></g> : null))}
  </g>
);
export const S27: S = ({ t }) => (
  <g>
    <Square id="d27" mood="night" t={t} moon sunX={800} sunY={360} />
    {dancers('night', t, 8, 80, 1000, 1480, 0.85, 4)}
    <BigNumber t={t - 3} text="30+" sub="IN ONE WEEK" y={660} />
  </g>
);
export const S28: S = ({ t }) => {
  const n = Math.round(lerp(30, 400, easeOut(clamp((t - 4) / 40))));
  return (
    <g>
      <Square id="d28" mood="danger" t={t} torches />
      {dancers('danger', t, 10, 60, 1020, 1300, 0.62, 9)}
      {dancers('danger', t, 8, 20, 1060, 1560, 0.95, 13)}
      <BigNumber t={t - 2} text={String(n)} sub="SOME ACCOUNTS SAY" y={640} />
    </g>
  );
};
export const S30: S = ({ t }) => (
  <g>
    <Square id="d30" mood="danger" t={t} torches />
    {dancers('danger', t, 6, 100, 980, 1650, 1.25, 17)}
    <Punch t={t - 3} lines={['NOBODY WAS', 'HAVING FUN']} y={300} size={96} color="#FF5A5A" />
  </g>
);
export const S31: S = ({ t }) => (
  <g>
    <Sky id="d31" mood="danger" sunY={1200} />
    <HeadBust x={260} y={620} s={0.9} scream rim={MOODS.danger.rim} t={t} />
    <HeadBust x={820} y={620} s={0.9} scream rim={MOODS.danger.rim} t={t + 9} />
    <HeadBust x={540} y={900} s={1.15} scream rim={MOODS.danger.rim} t={t + 4} />
    {dancers('danger', t, 7, 60, 1020, 1700, 1.0, 21)}
  </g>
);
export const S32: S = ({ t }) => (
  <g>
    <Square id="d32" mood="night" t={t} moon sunX={800} sunY={360} />
    {dancers('night', t, 5, 140, 940, 1520, 1.05, 25)}
    <Sfx t={t - 4} text="HELP!" x={540} y={620} size={140} />
  </g>
);
export const S33: S = ({ t }) => (
  <g>
    <Sky id="d33" mood="night" moon sunX={540} sunY={420} />
    {/* three dancers close up, flailing, with motion arcs around their arms */}
    {[300, 540, 780].map((x, i) => <Dancer key={x} x={x} feet={1900} s={1.15} mood="night" t={t * 1.4} ph={i * 2.1} arms={0.9} red={i === 1} cry flip={i === 2} />)}
    {[300, 540, 780].map((x, i) => <path key={`a${i}`} d={`M ${x - 200} ${900 + Math.sin(t * 0.4 + i) * 40} Q ${x} ${760 + Math.sin(t * 0.4 + i) * 40} ${x + 200} ${900 + Math.sin(t * 0.4 + i) * 40}`} stroke="#C9A2FF" strokeWidth={6} fill="none" opacity={0.6} />)}
    <Punch t={t - 3} lines={['ON THEIR', 'OWN']} y={320} size={104} color="#C9A2FF" />
  </g>
);

// ---------------------------------------------------------------- the cure
export const S34: S = ({ t }) => (
  <g>
    <Hall id="d34" t={t} />
    {[200, 400, 680, 880].map((x, i) => <Doctor key={x} x={x} feet={1250} s={0.62} t={t + i * 5} flip={x > 540} />)}
    <Punch t={t - 3} lines={['THE DOCTORS']} y={300} size={100} color="#FFD23F" />
  </g>
);
export const S35: S = ({ t }) => (
  <g>
    <Hall id="d35" t={t} />
    <Doctor x={540} feet={1700} s={1.4} t={t} arm={clamp(t / 8)} />
    <Punch t={t - 4} lines={['THE CURE?']} y={300} size={110} color="#FFD23F" />
  </g>
);
export const S36 = react('warm', 'yell', ['MORE', 'DANCING?!'], '#FF5A5A', 760);
export const S37: S = ({ t }) => (
  <g>
    <Hall id="d37" t={t} />
    {[260, 540, 820].map((x, i) => <Doctor key={x} x={x} feet={1300} s={0.7} t={t + i * 7} arm={i === 1 ? 1 : 0} flip={x > 540} />)}
    <Sfx t={t - 4} text="DANCE IT OUT!" x={540} y={560} size={96} />
  </g>
);
export const S38: S = ({ t }) => (
  <g>
    <Square id="d38" mood="warm" t={t} flags />
    <Stage y={1420} k={clamp(t / 30)} />
    {[0, 1, 2].map((i) => <Figure key={i} x={180 + i * 360} feet={1500} s={0.5} mood="warm" hat="cap" pose={{ yaw: 0.4, armR: { a: 120 + Math.abs(Math.sin(t * 0.5 + i)) * 50, b: 30 } }} />)}
    <Sfx t={t - 10} text="BANG! BANG!" x={540} y={620} size={90} />
  </g>
);
export const S39: S = ({ t }) => (
  <g>
    <Square id="d39" mood="warm" t={t} flags />
    <Stage y={1420} />
    <Musicians t={t} y={1420} mood="warm" />
    {/* a fat purse for the band */}
    <g transform={`translate(860 560) scale(${popIn(t - 6)})`}><path d="M -70 -60 Q -100 60 0 70 Q 100 60 70 -60 Z" fill="#B8862A" stroke={INK} strokeWidth={8} /><path d="M -40 -70 Q 0 -100 40 -70" stroke={INK} strokeWidth={10} fill="none" /><text y={30} textAnchor="middle" fontSize={80} fontFamily={FONT.title} fontWeight={800} fill={INK}>$</text></g>
  </g>
);
export const S40: S = ({ t }) => (
  <g>
    <Square id="d40" mood="danger" t={t} torches flags />
    <Stage y={1300} />
    <Musicians t={t} y={1300} mood="danger" />
    {dancers('danger', t, 9, 40, 1040, 1620, 1.0, 29)}
    <Punch t={t - 3} lines={['DAY AND', 'NIGHT']} y={300} size={100} color="#FFD23F" />
  </g>
);
export const S41 = react('noon', 'confused', ['THINK ABOUT', 'THAT'], '#FFD23F', 860);
export const S42: S = ({ t }) => (
  <g>
    <Sky id="d42" mood="danger" sunY={1100} />
    <rect x={-200} y={1180} width={W + 400} height={900} fill="#1C0A0C" />
    <Barn t={t} fire={0.6} />
    <Figure x={160} feet={1400} s={0.85} mood="danger" hat="cap" pose={{ yaw: 0.6, armR: { a: 120 + Math.sin(t * 0.4) * 30, b: 20 }, armL: { a: 100, b: 20 } }} />
    <rect x={230} y={940 + Math.sin(t * 0.4) * 20} width={130} height={36} rx={14} fill="#8A5A32" stroke={INK} strokeWidth={6} transform={`rotate(-20 290 ${960})`} />
  </g>
);
export const S43: S = ({ t }) => (
  <g>
    <Sky id="d43" mood="danger" sunY={1100} />
    <rect x={-200} y={1180} width={W + 400} height={900} fill="#1C0A0C" />
    <Barn t={t} fire={lerp(0.8, 1.6, clamp(t / 40))} />
    <Punch t={t - 3} lines={['BURNS OUT', 'FASTER?']} y={300} size={100} color="#FFD23F" />
  </g>
);
export const S44 = react('danger', 'angry', ['OF COURSE…'], '#FF5A5A', 760);
export const S45: S = ({ t }) => (
  <g>
    <Square id="d45" mood="outback" t={t} sunY={360} sunX={540} />
    {dancers('outback', t, 6, 100, 980, 1520, 0.95, 33, 0.5)}
    <Thermometer t={t - 3} k={clamp(0.6 + t / 60)} x={880} y={760} />
    <Punch t={t - 3} lines={['SUMMER', 'HEAT']} y={300} size={104} color="#FFD23F" />
  </g>
);
export const S46: S = ({ t }) => (
  <g>
    <Square id="d46" mood="outback" t={t} sunY={360} sunX={540} />
    {[[260, 0], [540, 18], [820, 34]].map(([x, d], i) => <Dancer key={i} x={x} feet={1500} s={0.75} mood="outback" t={t} ph={i * 2} dance={0.6} fall={easeOut(clamp((t - d) / 10))} flip={i === 1} />)}
    {dust(t, 540, 1500, 10)}
    <Sfx t={t - 12} text="THUD!" x={540} y={760} />
  </g>
);
export const S47: S = ({ t }) => (
  <g>
    <Sky id="d47" mood="danger" sunY={1050} sunX={760} />
    <path d="M -100 1180 Q 540 1110 1180 1180 L 1180 2000 L -100 2000 Z" fill={INK} />
    <Graves n={7} t={t} />
    <Dancer x={300} feet={1160} s={0.34} mood="danger" t={t} dance={0.15} arms={0.1} />
  </g>
);
export const S48: S = ({ t }) => (
  <g>
    <Sky id="d48" mood="danger" sunY={1050} sunX={760} />
    <path d="M -100 1180 Q 540 1110 1180 1180 L 1180 2000 L -100 2000 Z" fill={INK} />
    <Graves n={15} t={t - 4} />
    <BigNumber t={t - 2} text="15?" sub="A DAY, ONE CLAIMED" y={640} />
  </g>
);
export const S49: S = (p) => (
  <g>
    <S8 {...p} />
    <Punch t={p.t - 4} lines={['STILL', 'DISPUTED']} y={300} size={100} color="#FFD23F" />
  </g>
);

// ---------------------------------------------------------------- why?
export const S50: S = ({ t }) => (
  <g>
    <Square id="d50" mood="night" t={t} moon sunX={300} sunY={360} />
    <HostCut pose="confused" x={540} bottom={1520} height={860} t={t} />
    <Sfx t={t - 4} text="WHY?" x={820} y={640} size={130} />
  </g>
);
export const S51: S = ({ t }) => (
  <g>
    <Sky id="d51" mood="warm" sunY={900} sunX={540} />
    <path d="M -100 1200 L 1180 1200 L 1180 2000 L -100 2000 Z" fill="#3A2414" />
    <Rye t={t} ergot={clamp((t - 10) / 10)} />
    <Punch t={t - 3} lines={['RYE', 'BREAD']} y={300} size={104} color="#FFD23F" />
  </g>
);
export const S52: S = ({ t }) => (
  <g>
    <Sky id="d52" mood="night" sunY={900} sunX={540} />
    <Rye t={t} ergot={1} big />
    <Punch t={t - 3} lines={['ERGOT']} y={300} size={124} color="#C9A2FF" />
  </g>
);
export const S53: S = ({ t }) => (
  <g>
    <Sky id="d53" mood="night" sunY={900} sunX={540} />
    <Flask t={t - 1} mol={popIn(t - 10)} />
  </g>
);
export const S54: S = ({ t }) => (
  <g>
    <Swirl t={t} />
    <Flask t={20} mol={1} />
    <Punch t={t - 2} lines={['LSD']} y={300} size={150} color="#FFFFFF" />
  </g>
);
export const S55 = react('night', 'bust', ['BUT…'], '#FFD23F', 1150);
export const S56: S = ({ t }) => (
  <g>
    <Square id="d56" mood="cold" t={t} moon sunX={800} sunY={360} />
    {[220, 540, 860].map((x, i) => <Figure key={x} x={x} feet={1460} s={0.75} mood="cold" hat={i === 1 ? 'none' : 'cap'} pose={{ yaw: i ? -0.3 : 0.3, headTilt: 12, armR: { a: 30, b: 60 }, armL: { a: 30, b: 60 } }} />)}
    {[220, 540, 860].map((x) => <Bowl key={x} x={x + 60} y={1480} />)}
    <Punch t={t - 3} lines={['STARVING,', 'TERRIFIED']} y={300} size={96} color="#9FE3FF" />
  </g>
);
export const S57: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#120A1C" />
    <StainedGlass t={t} />
    {[160, 920].map((x) => <path key={x} d={`M ${x - 60} 1500 Q ${x} 1300 ${x + 60} 1500 Z`} fill={INK} />)}
    <Punch t={t - 3} lines={['SAINT', 'VITUS']} y={280} size={110} color="#FFD23F" />
  </g>
);
export const S58: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#120A1C" />
    <StainedGlass t={t} red={1} />
    <Punch t={t - 3} lines={['DANCE UNTIL', 'YOU DROP']} y={280} size={96} color="#FF5A5A" />
  </g>
);
export const S59: S = ({ t }) => (
  <g>
    <Sky id="d59" mood="night" sunY={1100} />
    <HeadSpread t={t} mood="night" />
  </g>
);
export const S60: S = ({ t }) => (
  <g>
    <Sky id="d60" mood="danger" sunY={1100} />
    <HeadSpread t={t + 60} mood="danger" />
    <Punch t={t - 2} lines={['MASS', 'HYSTERIA']} y={300} size={110} color="#FF5A5A" />
  </g>
);
export const S61: S = ({ t }) => (
  <g>
    <Sky id="d61" mood="night" moon sunX={250} sunY={380} />
    <ShrineHill t={t} mood="night" />
  </g>
);
export const S62: S = ({ t }) => (
  <g>
    <Sky id="d62" mood="night" moon sunX={250} sunY={380} />
    <ShrineHill t={t + 80} mood="night" />
    <Punch t={t - 3} lines={['SHRINE OF', 'ST. VITUS']} y={280} size={96} color="#FFD23F" />
  </g>
);
export const S63: S = ({ t }) => (
  <g>
    <Square id="d63" mood="warm" t={t} sunY={760} sunX={540} />
    <Dancer x={540} feet={1450} s={0.6} mood="warm" t={t} dance={lerp(0.6, 0, clamp(t / 30))} arms={lerp(0.6, 0, clamp(t / 30))} red />
    <g transform="translate(300 1470) rotate(-14)"><path d="M -60 -10 Q -64 20 -30 24 L 70 24 Q 90 10 80 -6 Q 40 -30 10 -30 Z" fill="#8A5A32" stroke={INK} strokeWidth={6} /></g>
  </g>
);

// ---------------------------------------------------------------- the end
export const S64: S = ({ t }) => (
  <g>
    <Square id="d64" mood="warm" t={t} flags />
    {dancers('warm', t, 5, 80, 1000, 1300, 0.55, 37)}
    <HostCut pose="sitting" x={540} bottom={1600} height={760} t={t} />
    <Punch t={t - 3} lines={['AFTER A', 'WEDDING?']} y={300} size={100} color="#FFD23F" />
  </g>
);
export const S65: S = ({ t }) => (
  <g>
    <Square id="d65" mood="danger" t={t} sunY={900} sunX={560} torches />
    {dancers('danger', t, 7, 80, 1000, 1420, 0.7, 49, 0.6)}
    <Punch t={t - 2} lines={['REMEMBER', 'STRASBOURG']} y={300} size={100} color="#FFD23F" />
  </g>
);
export const S66: S = ({ t }) => (
  <g>
    <Square id="d66" mood="night" t={t} moon sunX={780} sunY={360} />
    {dancers('night', t, 6, 100, 980, 1500, 0.9, 41)}
    <BigNumber t={t - 2} text="2" sub="MONTHS OF DANCING" y={660} />
  </g>
);
export const S67 = react('warm', 'bust', ["THAT'S REAL."], '#FFD23F', 1150);
export const S68: S = ({ t }) => (
  <g>
    <Square id="d68" mood="night" t={t} moon sunX={800} sunY={360} />
    {dancers('night', t, 4, 640, 1040, 1300, 0.55, 45)}
    <HostCut pose="rock" x={420} bottom={1650} height={980} t={t} />
    <Punch t={t - 3} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={300} size={76} color="#C9A2FF" />
  </g>
);

// ---------------------------------------------------------------- "wide, then close" pairs
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S29 = close(S28, 540, 1300, 1.5, 50);    // "in the square": into the crowd
export const S69 = close(S12, 300, 1250, 1.7, 30);    // "into the middle": on Troffea at the door
export const S70 = close(S39, 540, 1100, 1.5, 30);    // "drums and pipes": the band
