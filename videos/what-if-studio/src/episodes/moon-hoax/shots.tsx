import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, Mood, MOODS, Sky, Punch, Burst, Counter, BigNumber, Sfx, popIn, clamp, lerp, easeOut, Glow, INK, CloseCtx } from '../molasses/kit';
import { Rays, Clouds, Lamp, Shadow, Man, Gest } from '../great-stink/shots';

// "The Great Moon Hoax" (New York, 1835): a native 9:16 story Short in the Great Stink style, with its fidelity kit.
// Colour only on the key thing: the moon's silver-blue light, and the moon creatures (blue unicorns, purple crystals,
// glowing bat-wings); the newspaper is warm paper.

type S = React.FC<ShotProps>;
const scr = { mixBlendMode: 'screen' as const };
const MOONC = '#DDE8FF', BLUE = '#5AA8FF', PURP = '#B06AFF', PAPER = '#F2E6C8', GOLD = '#FFC93C';

// ---------------------------------------------------------------- the moon
const Moon: React.FC<{ x: number; y: number; r: number; t: number; o?: number }> = ({ x, y, r, t, o = 1 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r * 2.6} fill="#9FC0FF" opacity={0.25} filter="url(#gsB48)" style={scr} />
    <circle cx={x} cy={y} r={r * 1.3} fill="#CFE0FF" opacity={0.35} filter="url(#gsB24)" style={scr} />
    <circle cx={x} cy={y} r={r} fill={MOONC} />
    <circle cx={x + r * 0.25} cy={y + r * 0.2} r={r} fill="#9FB0D0" opacity={0.25} />
    {[[-0.35, -0.3, 0.22], [0.3, -0.1, 0.14], [0.05, 0.4, 0.18], [-0.45, 0.25, 0.1], [0.45, 0.4, 0.08], [0.1, -0.5, 0.09]].map(([dx, dy, rr], i) => <circle key={i} cx={x + dx * r} cy={y + dy * r} r={rr * r} fill="#A8B8D8" stroke="#8898B8" strokeWidth={r * 0.015} opacity={0.8} />)}
    <Rays x={x} y={y} t={t} o={0.18} n={12} len={r * 6} spread={360} dir={0} color="#CFE0FF" />
  </g>
);

// ---------------------------------------------------------------- New York, 1835
const BLD: [number, number, number][] = [[-80, 190, 420], [110, 170, 360], [280, 200, 460], [480, 160, 380], [640, 210, 440], [850, 180, 400], [1030, 170, 360]];
const Building: React.FC<{ x: number; base: number; w: number; h: number; c: string; lit: number; seed: number }> = ({ x, base, w, h, c, lit, seed }) => {
  const top = base - h, cols = Math.max(2, Math.floor(w / 55)), rows = Math.max(2, Math.floor((h - 80) / 90));
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={c} />
      <rect x={x - 8} y={top - 16} width={w + 16} height={18} fill={c} />
      <rect x={x} y={top} width={w} height={h} fill="url(#mhBrick)" opacity={0.2} />
      {[0.25, 0.75].map((f) => <g key={f}><rect x={x + w * f - 12} y={top - 60} width={24} height={46} fill={c} />{[0, 1, 2].map((k) => <circle key={k} cx={x + w * f + k * 14} cy={top - 80 - k * 40} r={10 + k * 8} fill={c} opacity={0.4 - k * 0.12} />)}</g>)}
      {Array.from({ length: cols * rows }, (_, k) => {
        const cx = x + ((k % cols) + 0.5) * (w / cols), cy = top + 30 + Math.floor(k / cols) * 90, on = random(`nb${seed}-${k}`) < lit;
        return <g key={k}>{on ? <circle cx={cx} cy={cy + 24} r={34} fill="#FFC870" opacity={0.4} filter="url(#gsB12)" /> : null}
          <rect x={cx - 13} y={cy} width={26} height={48} fill={on ? '#FFD27A' : '#000'} opacity={on ? 0.9 : 0.3} />
          <rect x={cx - 17} y={cy - 6} width={34} height={8} fill="#000" opacity={0.3} /></g>;
      })}
    </g>
  );
};
/** A New York street in 1835 under a huge moon: brick buildings with smoking chimneys and lit windows, cobbles, gas lamps. */
const NYC: React.FC<{ id: string; mood: Mood; t: number; moonX?: number; moonY?: number; moonR?: number }> = ({ id, mood, t, moonX = 760, moonY = 470, moonR = 150 }) => {
  const m = MOODS[mood], base = 1180;
  return (
    <g>
      <defs><pattern id="mhBrick" width={24} height={14} patternUnits="userSpaceOnUse"><path d="M 0 0 L 24 0 M 0 7 L 24 7 M 6 0 L 6 7 M 18 7 L 18 14" stroke="#000" strokeWidth={1.5} /></pattern></defs>
      <Sky id={id} mood={mood} sunY={-400} sunX={-400} moon />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={random(`st${i}`) * W} cy={random(`sy${i}`) * 700} r={1.5 + random(`sr${i}`) * 2} fill="#FFF" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 0.05 + i))} />)}
      <Moon x={moonX} y={moonY} r={moonR} t={t} />
      <Clouds mood={mood} t={t} y={560} o={0.5} />
      {BLD.map(([x, w, h], i) => <Building key={i} x={x} base={base} w={w} h={h} c={m.layers[1]} lit={0.55} seed={i} />)}
      <rect x={-300} y={base} width={W + 600} height={900} fill={m.ground} />
      {Array.from({ length: 7 }, (_, r) => Array.from({ length: 12 }, (_, c) => <ellipse key={`${r}-${c}`} cx={-60 + c * 100 + (r % 2) * 50} cy={base + 24 + r * r * 8 + r * 20} rx={40 + r * 4} ry={8 + r} fill={m.layers[2]} opacity={0.55} />))}
      <ellipse cx={moonX} cy={base + 160} rx={420} ry={60} fill={MOONC} opacity={0.12} filter="url(#gsB24)" style={scr} />
    </g>
  );
};

// ---------------------------------------------------------------- the newspaper
/** The Sun's front page: masthead, a headline, columns of grey lines, a woodcut of a bat-man over the moon. */
const Paper: React.FC<{ t: number; x?: number; y?: number; s?: number; rot?: number; head?: [string, string]; name?: string }> = ({ t, x = 540, y = 800, s = 1, rot = -4, head = ['LIFE FOUND', 'ON THE MOON!'], name = 'THE SUN' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot + (1 - popIn(t)) * 30}) scale(${popIn(t) * s})`}>
    <ellipse cx={30} cy={420} rx={380} ry={36} fill="#000" opacity={0.5} filter="url(#gsB12)" />
    <rect x={-360} y={-440} width={720} height={860} fill={PAPER} stroke={INK} strokeWidth={8} />
    <text x={0} y={-350} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={92} fill={INK}>{name}</text>
    <path d="M -330 -320 L 330 -320 M -330 -305 L 330 -305" stroke={INK} strokeWidth={4} />
    <text x={0} y={-240} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={66} fill="#8A1A1A">{head[0]}</text>
    <text x={0} y={-170} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={66} fill="#8A1A1A">{head[1]}</text>
    <rect x={-150} y={-130} width={300} height={260} fill="#1A1E30" stroke={INK} strokeWidth={5} />
    <circle cx={40} cy={-40} r={70} fill={MOONC} />
    <g transform="translate(-30 40) scale(0.32)"><BatPerson x={0} y={0} t={t} /></g>
    {[[-330, -130, 160], [180, -130, 150], [-330, 150, 660]].map(([cx, cy, w], k) => Array.from({ length: k === 2 ? 5 : 9 }, (_, i) => <rect key={`${k}${i}`} x={cx} y={cy + i * 30} width={(w as number) * (0.8 + 0.2 * random(`pl${k}${i}`))} height={10} fill="#8A7A60" opacity={0.6} />))}
  </g>
);
const Press: React.FC<{ t: number }> = ({ t }) => {
  const ph = (t * 0.25) % 1, up = Math.abs(Math.sin(t * 0.25 * Math.PI));
  return (
    <g>
      <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1E140C" />
      <Rays x={200} y={-100} t={t} o={0.3} n={6} spread={40} dir={60} len={2000} />
      <rect x={-200} y={1300} width={W + 400} height={800} fill="#120A06" />
      <g transform="translate(540 900)">
        <rect x={-340} y={200} width={680} height={180} fill="#3A3A42" stroke={INK} strokeWidth={8} />
        <rect x={-300} y={-400} width={40} height={620} fill="#4A4A54" stroke={INK} strokeWidth={6} /><rect x={260} y={-400} width={40} height={620} fill="#4A4A54" stroke={INK} strokeWidth={6} />
        <rect x={-320} y={-430} width={640} height={60} fill="#5A5A64" stroke={INK} strokeWidth={6} />
        <rect x={-240} y={-300 + up * 260} width={480} height={80} fill="#6A6A74" stroke={INK} strokeWidth={6} />
        <rect x={-240} y={120} width={480} height={80} fill={PAPER} stroke={INK} strokeWidth={5} />
        {[-200, 200].map((cx) => <g key={cx} transform={`translate(${cx} 290) rotate(${t * 6})`}><circle r={70} fill="#2A2A30" stroke={INK} strokeWidth={6} />{[0, 60, 120].map((a) => <path key={a} d={`M ${Math.cos(a * Math.PI / 180) * -60} ${Math.sin(a * Math.PI / 180) * -60} L ${Math.cos(a * Math.PI / 180) * 60} ${Math.sin(a * Math.PI / 180) * 60}`} stroke="#5A5A64" strokeWidth={10} />)}</g>)}
      </g>
      {Array.from({ length: 5 }, (_, i) => { const q = (ph + i / 5) % 1; return <g key={i} transform={`translate(${900 + q * 300} ${1100 - q * 100}) rotate(${-10 + q * 30})`}><rect x={-90} y={-60} width={180} height={120} fill={PAPER} stroke={INK} strokeWidth={4} opacity={1 - q * 0.5} /></g>; })}
    </g>
  );
};

// ---------------------------------------------------------------- the observatory
const TableMtn: React.FC<{ c: string }> = ({ c }) => <path d="M -200 1060 L 80 860 L 160 700 L 760 690 L 860 820 L 1280 1060 Z" fill={c} />;
const Telescope: React.FC<{ x: number; base: number; s?: number; t: number; aim?: number }> = ({ x, base, s = 1, t, aim = -38 }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <path d="M -160 0 L 0 -320 L 160 0" stroke="#3A2A1A" strokeWidth={22} fill="none" />
    <path d="M -100 0 L 0 -320 L 100 0" stroke="#5A3A22" strokeWidth={14} fill="none" />
    <g transform={`translate(0 -320) rotate(${aim + Math.sin(t * 0.05) * 1.5})`}>
      <rect x={-120} y={-46} width={620} height={92} rx={14} fill="#B8862A" stroke={INK} strokeWidth={8} />
      <rect x={-120} y={-46} width={620} height={30} rx={10} fill="#E8C060" opacity={0.6} />
      {[40, 200, 360].map((bx) => <rect key={bx} x={bx} y={-52} width={22} height={104} fill="#7A5A1A" stroke={INK} strokeWidth={5} />)}
      <ellipse cx={500} cy={0} rx={22} ry={70} fill={MOONC} stroke={INK} strokeWidth={8} />
      <circle cx={520} cy={0} r={90} fill={MOONC} opacity={0.4} filter="url(#gsB24)" style={scr} />
    </g>
    <circle cx={0} cy={-320} r={22} fill="#7A5A1A" stroke={INK} strokeWidth={6} />
  </g>
);
const Cape: React.FC<{ id: string; t: number; mood?: Mood }> = ({ id, t, mood = 'night' }) => {
  const m = MOODS[mood];
  return (
    <g>
      <Sky id={id} mood={mood} sunY={-400} sunX={-400} moon />
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={random(`cs${i}`) * W} cy={random(`cy${i}`) * 800} r={1.5 + random(`cr${i}`) * 2.5} fill="#FFF" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 0.05 + i))} />)}
      <Moon x={820} y={330} r={110} t={t} />
      <TableMtn c={m.layers[0]} />
      <rect x={-300} y={1060} width={W + 600} height={1000} fill={m.layers[2]} />
      <path d="M -300 1060 Q 300 1020 1380 1080" stroke={m.rim} strokeWidth={4} opacity={0.4} fill="none" />
    </g>
  );
};

// ---------------------------------------------------------------- the moon's "inhabitants"
const MoonLand: React.FC<{ id: string; t: number; earth?: boolean }> = ({ id, t, earth = true }) => (
  <g>
    <defs><linearGradient id={`ml${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05051A" /><stop offset="1" stopColor="#2A1A5A" /></linearGradient></defs>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill={`url(#ml${id})`} />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={random(`ms${i}`) * W} cy={random(`my${i}`) * 900} r={1.5 + random(`mr${i}`) * 2.5} fill="#FFF" opacity={0.3 + 0.6 * Math.abs(Math.sin(t * 0.06 + i))} />)}
    {earth ? <g><circle cx={240} cy={380} r={90} fill="#3A7AD8" /><path d="M 190 340 q 40 -20 60 10 q -10 40 -50 30 Z M 260 420 q 30 -10 50 20 q -20 20 -50 0 Z" fill="#4AA85A" /><circle cx={240} cy={380} r={170} fill="#5AA8FF" opacity={0.3} filter="url(#gsB24)" style={scr} /></g> : null}
    <path d="M -200 980 Q 200 860 500 940 Q 800 1020 1280 900 L 1280 2000 L -200 2000 Z" fill="#3A2A6A" />
    <path d="M -200 1100 Q 300 1040 600 1080 Q 900 1120 1280 1060 L 1280 2000 L -200 2000 Z" fill="#2A3A5A" />
    {/* the lake, catching the light */}
    <ellipse cx={540} cy={1200} rx={560} ry={90} fill="#3A6AB0" />
    <ellipse cx={540} cy={1190} rx={400} ry={30} fill="#9FD0FF" opacity={0.35} filter="url(#gsB12)" style={scr} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${300 + i * 90 + Math.sin(t * 0.1 + i) * 10} ${1170 + (i % 3) * 20} q 20 -6 40 0`} stroke="#CFE8FF" strokeWidth={3} fill="none" opacity={0.6} />)}
    <rect x={-200} y={1260} width={W + 400} height={800} fill="#1A2440" />
  </g>
);
const Crystal: React.FC<{ x: number; base: number; h: number; t: number; c?: string }> = ({ x, base, h, t, c = PURP }) => (
  <g>
    <circle cx={x} cy={base - h * 0.6} r={h * 0.5} fill={c} opacity={0.35} filter="url(#gsB24)" style={scr} />
    <path d={`M ${x - h * 0.16} ${base} L ${x - h * 0.12} ${base - h * 0.8} L ${x} ${base - h} L ${x + h * 0.12} ${base - h * 0.8} L ${x + h * 0.16} ${base} Z`} fill={c} stroke={INK} strokeWidth={6} />
    <path d={`M ${x} ${base - h} L ${x - 4} ${base}`} stroke="#F0D8FF" strokeWidth={6} opacity={0.6 + 0.3 * Math.sin(t * 0.2 + x)} />
  </g>
);
const Unicorn: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean }> = ({ x, y, s = 1, t, flip }) => {
  const g = Math.sin(t * 0.15 + x) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={10} rx={150} ry={20} fill="#000" opacity={0.4} filter="url(#gsB6)" />
      {[-70, -40, 40, 70].map((lx, i) => <rect key={lx} x={lx - 10} y={-80} width={20} height={90} fill="#3A6AC8" stroke={INK} strokeWidth={5} transform={`rotate(${i % 2 ? g : -g} ${lx} -80)`} />)}
      <ellipse cx={0} cy={-110} rx={110} ry={60} fill={BLUE} stroke={INK} strokeWidth={7} />
      <path d="M 80 -140 L 130 -230 L 170 -210 L 140 -120 Z" fill={BLUE} stroke={INK} strokeWidth={7} />
      <ellipse cx={170} cy={-220} rx={50} ry={34} fill={BLUE} stroke={INK} strokeWidth={7} />
      <path d="M 170 -250 L 200 -340 L 186 -246 Z" fill="#FFF2B0" stroke={INK} strokeWidth={5} />
      <circle cx={200} cy={-330} r={30} fill="#FFF2B0" opacity={0.6} filter="url(#gsB12)" />
      <circle cx={180} cy={-226} r={6} fill={INK} />
      <path d="M -110 -120 q -40 20 -30 70" stroke="#2A4A98" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M -60 -150 Q 0 -170 60 -150" stroke="#BFE0FF" strokeWidth={10} fill="none" opacity={0.6} strokeLinecap="round" />
    </g>
  );
};
const Beaver: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean }> = ({ x, y, s = 1, t, flip }) => {
  const p = t * 0.4 + x, st = Math.sin(p) * 14;
  return (
    <g transform={`translate(${x} ${y - Math.abs(Math.sin(p)) * 8}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={8} rx={90} ry={16} fill="#000" opacity={0.4} filter="url(#gsB6)" />
      <ellipse cx={-80} cy={-40} rx={60} ry={26} fill="#5A3A1A" stroke={INK} strokeWidth={6} transform="rotate(-30 -80 -40)" />
      <rect x={-34} y={-70} width={22} height={70} fill="#6A4422" stroke={INK} strokeWidth={5} transform={`rotate(${st} -23 -70)`} />
      <rect x={10} y={-70} width={22} height={70} fill="#6A4422" stroke={INK} strokeWidth={5} transform={`rotate(${-st} 21 -70)`} />
      <ellipse cx={0} cy={-150} rx={62} ry={95} fill="#8A5A2A" stroke={INK} strokeWidth={7} />
      <ellipse cx={0} cy={-130} rx={36} ry={60} fill="#B88A5A" />
      <circle cx={0} cy={-270} r={50} fill="#8A5A2A" stroke={INK} strokeWidth={7} />
      <circle cx={18} cy={-280} r={7} fill={INK} /><rect x={6} y={-246} width={22} height={18} fill="#FFF" stroke={INK} strokeWidth={4} />
      <path d="M 40 -170 Q 80 -190 90 -230" stroke="#8A5A2A" strokeWidth={18} strokeLinecap="round" fill="none" />
    </g>
  );
};
/** A furry little moon-person with leathery bat wings that flap. */
const BatPerson: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean }> = ({ x, y, s = 1, t, flip }) => {
  const f = Math.sin(t * 0.6 + x * 0.01);
  const wing = (sd: number) => <g transform={`scale(${sd} 1) rotate(${-f * 26})`}>
    <path d="M 20 -120 Q 140 -260 300 -200 Q 250 -160 270 -110 Q 210 -130 200 -70 Q 140 -110 100 -50 Q 70 -90 20 -60 Z" fill="#6A3A5A" stroke={INK} strokeWidth={7} />
    <path d="M 20 -120 Q 140 -260 300 -200" stroke="#FFB0E0" strokeWidth={6} fill="none" opacity={0.6} />
  </g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <circle cx={0} cy={-110} r={170} fill="#FF8AD0" opacity={0.25} filter="url(#gsB24)" style={scr} />
      {wing(1)}{wing(-1)}
      <ellipse cx={0} cy={-80} rx={46} ry={70} fill="#A86A3A" stroke={INK} strokeWidth={7} />
      <path d="M -20 -10 L -26 40 M 20 -10 L 26 40" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <circle cx={0} cy={-170} r={40} fill="#A86A3A" stroke={INK} strokeWidth={7} />
      <circle cx={-14} cy={-176} r={8} fill="#FFF" /><circle cx={14} cy={-176} r={8} fill="#FFF" /><circle cx={-14} cy={-175} r={4} fill={INK} /><circle cx={14} cy={-175} r={4} fill={INK} />
      <path d="M -30 -200 L -40 -230 L -16 -206 Z M 30 -200 L 40 -230 L 16 -206 Z" fill="#A86A3A" stroke={INK} strokeWidth={5} />
    </g>
  );
};
const Desk: React.FC<{ t: number }> = ({ t }) => {
  const fl = 1 + 0.12 * Math.sin(t * 0.9) + 0.06 * Math.sin(t * 2.2);
  return (
    <g>
      <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1C120A" />
      {Array.from({ length: 5 }, (_, r) => <g key={r}><rect x={-100} y={60 + r * 200} width={1300} height={14} fill="#3A2416" />{Array.from({ length: 20 }, (_, k) => <rect key={k} x={-80 + k * 64} y={60 + r * 200 - 150 + (k % 3) * 10} width={52} height={150 - (k % 3) * 10} fill={['#5A2A22', '#2A3A5A', '#5A4A2A', '#2A4A3A'][(k + r) % 4]} opacity={0.7} />)}</g>)}
      <path d="M -100 1150 L 1180 1150 L 1180 1260 L -100 1260 Z" fill="#5A3A20" stroke={INK} strokeWidth={6} />
      <circle cx={760} cy={960} r={480 * fl} fill="#FFB050" opacity={0.35} filter="url(#gsB48)" style={scr} />
      <rect x={740} y={1000} width={40} height={150} fill={PAPER} stroke={INK} strokeWidth={5} />
      <ellipse cx={760} cy={978 - 6 * fl} rx={14} ry={30 * fl} fill="#FFC24A" /><ellipse cx={760} cy={984 - 3 * fl} rx={6} ry={14 * fl} fill="#FFF2B0" />
      {[[300, 1120, -6], [420, 1110, 4]].map(([px, py, r], i) => <g key={i} transform={`translate(${px} ${py}) rotate(${r})`}><rect x={-130} y={-40} width={260} height={60} fill={PAPER} stroke={INK} strokeWidth={4} />{[0, 1, 2].map((k) => <rect key={k} x={-110} y={-30 + k * 16} width={200} height={6} fill="#8A7A60" />)}</g>)}
      <path d={`M 560 1100 L ${620 + Math.sin(t * 0.8) * 10} 900`} stroke="#F2EADC" strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${620 + Math.sin(t * 0.8) * 10} 900 q 30 -40 10 -110 q -40 50 -10 110`} fill="#F2EADC" stroke={INK} strokeWidth={4} />
    </g>
  );
};
const Phone: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 860) scale(${popIn(t)}) rotate(-5)`}>
    <rect x={-250} y={-470} width={500} height={940} rx={60} fill="#111" stroke="#555" strokeWidth={10} />
    <circle cx={0} cy={0} r={480} fill="#5AA8FF" opacity={0.25} filter="url(#gsB48)" style={scr} />
    <rect x={-220} y={-430} width={440} height={860} rx={36} fill="#0E1426" />
    <rect x={-190} y={-380} width={380} height={300} rx={20} fill="#1A2440" />
    <circle cx={60} cy={-250} r={90} fill={MOONC} />
    <g transform="translate(-60 -150) scale(0.3)"><BatPerson x={0} y={0} t={t} /></g>
    <text x={0} y={-20} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={42} fill="#FF5A5A">BREAKING!!!</text>
    <text x={0} y={36} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#FFF">BAT-PEOPLE</text>
    <text x={0} y={80} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#FFF">FOUND ON MOON</text>
    {[140, 180, 220, 260].map((ly) => <rect key={ly} x={-180} y={ly} width={360 - (ly % 3) * 40} height={14} rx={7} fill="#3A4A6A" />)}
    <g transform="translate(0 340)"><rect x={-150} y={-36} width={300} height={72} rx={36} fill="#3A6AFF" /><text y={14} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={36} fill="#FFF">SHARE</text></g>
  </g>
);
const Herschel: React.FC<{ x: number; feet: number; s: number; t: number; g?: Gest }> = ({ x, feet, s, t, g = 'point' }) => <Man x={x} feet={feet} s={s} mood="night" t={t} g={g} hat="none" />;

// ---------------------------------------------------------------- the hook
export const S1: S = ({ t }) => (
  <g>
    <NYC id="m1" mood="night" t={t} moonR={170} />
    <Lamp x={110} base={1720} s={1.1} t={t} /><Lamp x={970} base={1720} s={1.1} t={t + 7} />
    <Punch t={t - 2} lines={['NEW YORK,', '1835']} y={300} size={116} color={MOONC} kicker="A TRUE STORY" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#05051A" />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={random(`s2${i}`) * W} cy={random(`y2${i}`) * 1900} r={1.5 + random(`r2${i}`) * 2} fill="#FFF" opacity={0.6} />)}
    <Moon x={540} y={860} r={380} t={t} />
    {[[260, 700, 0.55], [800, 980, 0.45], [600, 560, 0.35]].map(([bx, by, bs], i) => <BatPerson key={i} x={bx + Math.sin(t * 0.05 + i) * 40} y={by - t * 1.2} s={bs} t={t + i * 13} flip={i === 1} />)}
    <Punch t={t - 2} lines={['BAT-PEOPLE', 'ON THE MOON?!']} y={290} size={98} color="#FF8AD0" />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <NYC id="m3" mood="night" t={t} moonX={300} moonY={420} moonR={120} />
    {Array.from({ length: 4 }, (_, i) => { const x = 160 + i * 250; return <g key={i}><Man x={x} feet={1500 + (i % 2) * 20} s={0.95} mood="night" t={t} g="shock" hat={i % 2 ? 'cap' : 'bowler'} flip={i % 2 === 0} ph={i * 2} /><g transform={`translate(${x + (i % 2 ? -60 : 60)} 1210) rotate(${i % 2 ? 8 : -8}) scale(0.16)`}><Paper t={30} rot={0} /></g></g>; })}
    <Sfx t={t - 4} text="WOW!" x={540} y={640} rot={-6} size={120} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A1C10" />
    <Rays x={540} y={-100} t={t} o={0.3} n={6} spread={50} dir={90} />
    <Paper t={t - 1} y={860} s={1.1} />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <NYC id="m6" mood="cold" t={t} moonX={540} moonY={560} moonR={230} />
    <Punch t={t - 2} lines={['THE GREAT', 'MOON HOAX']} y={290} size={120} color={MOONC} />
  </g>
);
// ---------------------------------------------------------------- the setup
export const S7: S = ({ t }) => (
  <g>
    <Press t={t} />
    <Punch t={t - 2} lines={['THE NEW YORK', 'SUN']} y={290} size={106} color={GOLD} kicker="A REAL NEWSPAPER" />
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Cape id="m8" t={t} />
    <Telescope x={640} base={1340} s={1.05} t={t} />
    <Herschel x={300} feet={1480} s={1.5} t={t} />
    <Punch t={t - 2} lines={['SIR JOHN', 'HERSCHEL']} y={290} size={106} color={MOONC} kicker="A REAL ASTRONOMER" />
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    <Cape id="m9" t={t} />
    <Telescope x={420} base={1500} s={1.9} t={t} aim={-34} />
    <Punch t={t - 2} lines={['GIANT', 'TELESCOPE']} y={290} size={110} color={GOLD} kicker="IN SOUTH AFRICA" />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#0A0E1E" />
    <circle cx={540} cy={860} r={420 * popIn(t - 1)} fill="#9FC0FF" opacity={0.3} filter="url(#gsB48)" style={scr} />
    <circle cx={540} cy={860} r={360 * popIn(t - 1)} fill="#CFE0FF" opacity={0.35} stroke="#B8862A" strokeWidth={40} />
    <path d="M 340 680 Q 440 620 560 640" stroke="#FFF" strokeWidth={24} strokeLinecap="round" fill="none" opacity={0.6 * popIn(t - 1)} />
    <BigNumber t={t - 6} text="24 FT" sub="WIDE LENS, THEY SAID" y={900} color="#FFFFFF" />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <MoonLand id="m11" t={t} />
    {[[420, 1130, 380], [560, 1100, 500], [700, 1130, 340]].map(([cx, b, h], i) => <Crystal key={i} x={cx} base={b} h={h} t={t} />)}
    <Unicorn x={360} y={1220} s={0.8} t={t} />
    <BatPerson x={700} y={760} s={0.45} t={t} />
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#000" mask="url(#mhScope)" />
    <defs><mask id="mhScope"><rect x={-200} y={-200} width={W + 400} height={2400} fill="#FFF" /><circle cx={540} cy={860} r={460} fill="#000" /></mask></defs>
    <circle cx={540} cy={860} r={460} fill="none" stroke="#B8862A" strokeWidth={24} />
    <path d="M 540 400 L 540 1320 M 80 860 L 1000 860" stroke="#FFF" strokeWidth={2} opacity={0.3} />
  </g>
);
// ---------------------------------------------------------------- the moon
export const S12: S = ({ t }) => (
  <g>
    <MoonLand id="m12" t={t} />
    <Sfx t={t - 3} text="?" x={540} y={700} size={260} rot={6} />
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <MoonLand id="m13" t={t} />
    <Unicorn x={760} y={1150} s={1.0} t={t + 20} flip />
    <Unicorn x={330} y={1240} s={1.7} t={t} />
    <Punch t={t - 2} lines={['BLUE', 'UNICORNS']} y={290} size={112} color={BLUE} />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <MoonLand id="m14" t={t} />
    <Beaver x={lerp(660, 860, clamp(t / 60))} y={1150} s={1.1} t={t + 9} />
    <Beaver x={lerp(240, 460, clamp(t / 60))} y={1260} s={1.9} t={t} />
    <Punch t={t - 2} lines={['WALKING', 'BEAVERS']} y={290} size={110} color={GOLD} />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <MoonLand id="m15" t={t} earth={false} />
    {[[160, 1130, 420], [330, 1100, 560], [560, 1080, 700], [780, 1110, 520], [940, 1130, 380]].map(([cx, b, h], i) => <Crystal key={i} x={cx} base={b} h={h} t={t} />)}
    <Punch t={t - 2} lines={['GIANT PURPLE', 'CRYSTALS']} y={290} size={96} color={PURP} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <MoonLand id="m16" t={t} />
    <Sfx t={t - 3} text="AND THEN..." x={540} y={700} size={110} rot={-4} />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <MoonLand id="m17" t={t} />
    {[[300, 800, 0.85], [760, 640, 0.65], [560, 980, 0.5], [880, 900, 0.4]].map(([bx, by, bs], i) => <BatPerson key={i} x={bx + Math.sin(t * 0.04 + i * 2) * 50} y={by + Math.cos(t * 0.05 + i) * 30} s={bs} t={t + i * 11} flip={i % 2 === 1} />)}
    <Punch t={t - 2} lines={['BAT-PEOPLE']} y={290} size={124} color="#FF8AD0" kicker="THE BIG ONE" />
  </g>
);
// ---------------------------------------------------------------- the boom
export const S19: S = ({ t }) => (
  <g>
    <NYC id="m19" mood="night" t={t} moonX={820} moonY={420} moonR={130} />
    {Array.from({ length: 5 }, (_, i) => { const x = 120 + i * 210; return <g key={i}><Man x={x} feet={1500 + (i % 2) * 20} s={0.92} mood="night" t={t} g={i % 2 ? 'vote' : 'shock'} hat={i % 2 ? 'cap' : 'bowler'} flip={i % 2 === 0} ph={i * 2} /></g>; })}
    {Array.from({ length: 8 }, (_, i) => { const q = ((t * 0.02 + i / 8) % 1); return <g key={i} transform={`translate(${100 + i * 120} ${400 + q * 700}) rotate(${q * 300 + i * 40}) scale(0.12)`}><Paper t={30} rot={0} /></g>; })}
    <Sfx t={t - 3} text="WILD!" x={540} y={640} rot={-6} size={130} />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1E140C" />
    <Rays x={540} y={-100} t={t} o={0.3} n={6} spread={50} dir={90} />
    {Array.from({ length: Math.min(14, Math.floor(t / 2) + 1) }, (_, i) => <g key={i} transform={`translate(${540 + (i % 2 ? 12 : -12)} ${1180 - i * 34}) scale(0.32 0.06)`}><rect x={-360} y={-200} width={720} height={400} fill={PAPER} stroke={INK} strokeWidth={30} /></g>)}
    <Counter t={t - 1} from={0} to={19000} dur={30} sub="COPIES, THEY CLAIMED" y={500} color={GOLD} />
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#20160E" />
    <Rays x={540} y={-100} t={t} o={0.28} n={6} spread={50} dir={90} />
    <Paper t={t - 1} x={330} y={820} s={0.62} rot={-10} name="THE TIMES" />
    <Paper t={t - 6} x={760} y={760} s={0.62} rot={8} name="THE STAR" />
    <Paper t={t - 11} x={540} y={980} s={0.62} rot={-2} name="THE POST" />
    <Punch t={t - 2} lines={['COPIED', 'WORD FOR WORD']} y={280} size={96} color={GOLD} />
  </g>
);
// ---------------------------------------------------------------- the twist
export const S22: S = ({ t }) => (
  <g>
    <Cape id="m22" t={t} />
    <Telescope x={640} base={1340} s={1.05} t={t} />
    <Herschel x={300} feet={1480} s={1.5} t={t} g="stand" />
    <Punch t={t - 2} lines={['NO IDEA']} y={300} size={124} color={MOONC} kicker="HERSCHEL HIMSELF" />
  </g>
);
export const S23: S = ({ t }) => (
  <g>
    <Cape id="m23" t={t} mood="warm" />
    <Telescope x={640} base={1340} s={1.05} t={t} />
    <Herschel x={300} feet={1480} s={1.5} t={t} g="point" />
    <Punch t={t - 2} lines={['REALLY IN', 'SOUTH AFRICA']} y={290} size={96} color={GOLD} />
  </g>
);
export const S24: S = ({ t }) => (
  <g>
    <Cape id="m24" t={t} />
    <Herschel x={540} feet={1480} s={1.6} t={t} g="shock" />
    <Burst t={t - 2} text="BAT-MEN?" x={540} y={600} size={100} color="#FF8AD0" />
  </g>
);
export const S25: S = ({ t }) => (
  <g>
    <Desk t={t} />
    <Man x={300} feet={1500} s={1.5} mood="warm" t={t} g="point" hat="none" />
    <Punch t={t - 2} lines={['MADE IT ALL UP']} y={300} size={100} color={GOLD} kicker="A REPORTER" />
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Desk t={t + 40} />
    <Man x={540} feet={1500} s={1.55} mood="warm" t={t} g="stand" hat="none" />
    <Punch t={t - 2} lines={['RICHARD', 'ADAMS LOCKE']} y={280} size={100} color={GOLD} kicker="MOST LIKELY" />
  </g>
);
export const S27: S = ({ t }) => (
  <g>
    <Press t={t + 30} />
    <Paper t={t - 1} y={880} s={0.95} head={['THE TRUTH?', 'MAYBE...']} />
  </g>
);
export const S28: S = ({ t }) => (
  <g>
    <Press t={t + 60} />
    <Burst t={t - 2} text="SORRY? NOPE." x={540} y={700} size={92} color="#FF5A5A" />
  </g>
);
export const S29: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#18120A" />
    <circle cx={540} cy={900} r={500} fill={GOLD} opacity={0.25} filter="url(#gsB48)" style={scr} />
    {Array.from({ length: 16 }, (_, i) => { const q = ((t * 0.04 + i / 16) % 1); return <ellipse key={i} cx={120 + (i * 61) % 860} cy={300 + q * 1000} rx={34} ry={12} fill={GOLD} stroke={INK} strokeWidth={4} transform={`rotate(${q * 360 + i * 30} ${120 + (i * 61) % 860} ${300 + q * 1000})`} />; })}
    <Punch t={t - 2} lines={['SALES STAYED', 'SKY HIGH']} y={290} size={100} color={GOLD} />
  </g>
);
export const S30: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#06080F" />
    <Phone t={t - 1} />
  </g>
);
export const S31: S = ({ t }) => (
  <g>
    <Cape id="m31" t={t} />
    <Telescope x={420} base={1500} s={1.9} t={t} aim={-34} />
    <Punch t={t - 2} lines={['CHECK THE', 'TELESCOPE']} y={290} size={106} color={MOONC} />
  </g>
);
export const S32: S = ({ t }) => (
  <g>
    <NYC id="m32" mood="cold" t={t} moonX={540} moonY={600} moonR={260} />
    <Punch t={t - 2} lines={["THAT'S REAL."]} y={300} size={120} color={GOLD} />
  </g>
);
export const S33: S = ({ t }) => (
  <g>
    <NYC id="m33" mood="night" t={t} moonX={800} moonY={430} moonR={140} />
    {Array.from({ length: 4 }, (_, i) => <Man key={i} x={160 + i * 250} feet={1500 + (i % 2) * 20} s={0.92} mood="night" t={t} g="stand" hat={i % 2 ? 'cap' : 'bowler'} flip={i % 2 === 0} ph={i * 2} />)}
    <Lamp x={110} base={1720} s={1.1} t={t} />
    <Punch t={t - 3} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={300} size={80} color="#C9A2FF" />
  </g>
);

// ---------------------------------------------------------------- "wide, then close" pairs
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S5 = close(S4, 540, 520, 1.5, 30);     // "a real front page": the headline
export const S18 = close(S17, 300, 820, 1.6, 30);   // "flying over the lakes": one bat-person
export const S34 = close(S33, 540, 1350, 1.5, 40);  // "strange history": the crowd
export const S35 = close(S19, 540, 1300, 1.5, 30);  // "went wild": the crowd
export const S36 = close(S25, 600, 1000, 1.5, 30);  // "made the whole thing up": the quill
export const S37 = close(S1, 760, 700, 1.5, 40);    // "the whole city": the moon over the roofs
export const S38 = close(S6, 540, 700, 1.4, 40);    // "here's the deal": the moon
export const S39 = close(S21, 540, 900, 1.4, 40);   // "just to keep up": the papers
