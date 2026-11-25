import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, MOODS, Sky, Punch, Burst, Counter, Calendar, popIn, clamp, lerp, easeOut, Glow, INK } from '../molasses/kit';
import { Rays, Clouds } from '../great-stink/shots';
import words from './words.json';
import ep from './episode.json';
import {
  scr, BLUB, SKIN, DYN, Txt, Speech, BigX, Man, Sea, Sand, Headland, Beach, Whale, Chunk, Rain, Dynamite, Crate, Plunger, Gull, Car, Truck,
  OREGON, Tape, Weight, SickCloud, Dozer, Mound, Board, Crowd,
} from './shots';

// The animated-shorts-kit camera grammar on the 2D story engine: one camera per take that travels from subject to subject.
// Moves land ON the spoken word (the camera arrives as the word starts), ease in fast and settle slowly (velocity peak at
// ~40 %), and between moves it never stops: a slow creep-in and drift. Fast moves get motion blur. Edits are 4-frame
// dissolves at a change of place or time (one hard cut, on KABOOM). Keys live in episode.json "takes" so the sound pass
// can put a whoosh on every move.

type S = React.FC<ShotProps>;
type Key = [string | null, number, number, number, number?, string?];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const WF = (words as { w: string; s: number }[]).map((w) => ({ n: norm(w.w), f: Math.round(w.s * 30) }));
/** frame of the first time `word` is said at or after frame a */
const wordAt = (word: string, a: number) => { const n = norm(word); const h = WF.find((w) => w.n === n && w.f >= a - 3); return h ? h.f : a; };
/** eased 0..1 with the velocity peak at ~40 % (fast start, long settle) */
const ease = (u: number) => { u = clamp(u); const v = Math.pow(u, 0.82); return v * v * v * (v * (v * 6 - 15) + 10); };
type Cam = { x: number; y: number; z: number; blur: number };
const camAt = (id: string, f: number, t: number): Cam => {
  const keys = (ep as any).takes[id] as Key[], a = f - t;
  const arr = keys.map((k) => (k[0] ? wordAt(k[0], a) : -1e9));
  const at = (ff: number) => {
    let i = 0; while (i + 1 < keys.length && ff >= arr[i + 1] - (keys[i + 1][4] ?? 22)) i++;
    const k = keys[i];
    if (i + 1 < keys.length && ff >= arr[i + 1] - (keys[i + 1][4] ?? 22)) { /* unreachable */ }
    const nx = keys[i + 1], d = nx ? nx[4] ?? 22 : 0;
    // inside a move from key i-1 to key i?
    if (i > 0) {
      const p = keys[i - 1], dd = k[4] ?? 22, u = (ff - (arr[i] - dd)) / dd;
      if (u < 1) { const e = ease(u); return { x: lerp(p[1], k[1], e), y: lerp(p[2], k[2], e), z: Math.exp(lerp(Math.log(p[3]), Math.log(k[3]), e)) }; }
    }
    // holding on key i: creep in and drift (never still)
    const since = Math.max(0, ff - (i > 0 ? arr[i] : a));
    void d;
    return { x: k[1] + Math.sin((since + i * 40) * 0.02) * 10, y: k[2] + Math.sin((since + i * 30) * 0.015) * 6, z: k[3] * (1 + Math.min(0.09, since * 0.0016)) };
  };
  const c = at(f), p = at(f - 1);
  const speed = Math.hypot(c.x - p.x, c.y - p.y) * c.z + Math.abs(Math.log(c.z / p.z)) * 1400;
  return { ...c, blur: speed > 60 ? 6 : speed > 28 ? 3 : 0 };
};
/** the camera: world group transformed so (x, y) sits at the frame centre at zoom z */
const Take: React.FC<{ id: string; f: number; t: number; children: React.ReactNode; over?: React.ReactNode }> = ({ id, f, t, children, over }) => {
  const c = camAt(id, f, t);
  return (
    <g>
      <g transform={`translate(${W / 2} 960) scale(${c.z}) translate(${-c.x} ${-c.y})`}>{children}</g>
      {over}
    </g>
  );
};
const w = (f: number, t: number, word: string, off = 0) => f - wordAt(word, f - t) - off;   // frames since `word` in this take

// ---------------------------------------------------------------- takes
export const S101: S = ({ t, f }) => (   // HOOK: CU on the blast, whip pull-back to the beach on "Oregon", push to the grinning official on "purpose"
  <Take id="S101" f={f} t={t} over={<>
    {w(f, t, 'Oregon') < 0 ? <Punch t={t + 6} lines={['THEY BLEW', 'UP A WHALE']} y={300} size={124} color="#FFB03A" kicker="OREGON, 1970" /> : null}
    {w(f, t, 'purpose') >= 0 ? <g transform={`translate(540 520) rotate(-10) scale(${popIn(w(f, t, 'purpose'), 5)})`}><rect x={-300} y={-80} width={600} height={160} fill="none" stroke="#D8322A" strokeWidth={16} /><Txt x={0} y={34} s={100} c="#D8322A">ON PURPOSE</Txt></g> : null}
  </>}>
    <Beach id="t1" mood="danger" t={t} sunX={300} sunY={880} />
    <Crowd mood="danger" t={t} n={6} x0={60} x1={420} feet={1470} s={0.75} g="shock" seed={1} />
    <Whale x={540} y={1110} s={0.9} rim={MOODS.danger.rim} open={clamp(0.6 + t / 30)} t={t} />
    {Array.from({ length: 5 }, (_, i) => { const k = clamp(1 - t / 140); return <circle key={i} cx={560 + (i - 2) * 90} cy={880 - t * 2 - i * 60} r={160 + t * 3 + i * 40} fill={['#FFE07A', '#FF9A3A', '#C8402A', '#5A3A3A', '#3A2A2A'][i]} opacity={(0.75 - i * 0.1) * k + (i > 2 ? 0.3 * (1 - k) : 0)} />; })}
    <Glow x={560} y={900} r={700} kind="warm" o={0.9 * clamp(1 - t / 120) + 0.2} />
    {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, k = (t + 6) / 40; return <Chunk key={i} x={540 + Math.cos(a) * 700 * k} y={900 + Math.sin(a) * 500 * k - 200 * k + k * k * 160} s={0.6 + k * 0.9} rot={t * 6 + i * 40} seed={i} />; })}
    <Plunger x={880} y={1330} s={0.45} k={1} />
    <Man x={860} feet={1450} s={0.9} mood="danger" t={t} g="vote" hat="cap" e="happy" flip />
  </Take>
);
export const S102: S = ({ t, f }) => (   // the dock: crane up the dynamite stack, pan to the fisherman's tall tale, on to the TV newsman
  <Take id="S102" f={f} t={t} over={<>
    {w(f, t, 'half') >= 0 && w(f, t, 'buddy') < 0 ? <Counter t={w(f, t, 'half')} from={0} to={1000} dur={30} sub="POUNDS OF DYNAMITE" y={420} color="#FFB03A" /> : null}
    {w(f, t, 'tall') >= 0 && w(f, t, 'film') < 0 ? <><Txt x={540} y={420} s={110} c="#FFD23F">TALL TALE?</Txt><BigX t={w(f, t, 'tale') + 2} y={820} s={0.9} /></> : null}
    {w(f, t, 'film') >= 0 ? <Punch t={w(f, t, 'film')} lines={["IT'S ON FILM"]} y={360} size={110} color="#FFD23F" /> : null}
  </>}>
    <Beach id="t2" mood="warm" t={t} sunX={760} sunY={880} />
    {/* wooden dock and shed */}
    <rect x={-300} y={1290} width={W + 600} height={60} fill="#6A4428" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-260 + i * 110} y={1290} width={8} height={60} fill={INK} opacity={0.5} />)}
    {Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 - r }, (_, k) => <Dynamite key={r + '-' + k} x={190 + k * 74 + r * 37} y={1290 - r * 88} s={0.6} />))}
    <Glow x={300} y={1100} r={300} kind="red" o={0.35} />
    <Man x={620} feet={1300} s={1.0} mood="warm" t={t} g="shock" hat="cap" e={w(f, t, 'tale') > 4 ? 'sad' : 'happy'} />
    <g transform="translate(730 1180) rotate(-8) scale(0.55)"><path d="M -230 0 Q -60 -120 160 -20 L 260 -90 L 240 0 L 260 90 L 160 20 Q -60 120 -230 0 Z" fill="#6A8AA0" stroke={INK} strokeWidth={8} /><circle cx={-170} cy={-10} r={12} fill="#FFF" /></g>
    <g transform="translate(940 1290) scale(0.42)">
      <path d="M -60 0 L 0 -320 L 60 0 M 0 -320 L 0 0" stroke={INK} strokeWidth={14} />
      <rect x={-120} y={-460} width={220} height={150} rx={12} fill="#3A3A42" stroke={INK} strokeWidth={6} />
      <circle cx={-60} cy={-500} r={50} fill="#4A4A52" stroke={INK} strokeWidth={6} /><circle cx={40} cy={-500} r={50} fill="#4A4A52" stroke={INK} strokeWidth={6} />
      <rect x={100} y={-420} width={90} height={70} fill="#2A2A30" stroke={INK} strokeWidth={6} /><circle cx={190} cy={-385} r={30} fill="#9AD8F0" stroke={INK} strokeWidth={6} />
      <circle cx={-110} cy={-430} r={10} fill="#FF3A3A" opacity={Math.sin(t * 0.4) > 0 ? 1 : 0.2} />
    </g>
    <Man x={840} feet={1300} s={0.62} mood="warm" t={t} g="point" hat="none" e="happy" />
  </Take>
);
export const S103: S = ({ t, f }) => (   // November: the neon map, push into Florence on its name
  <Take id="S103" f={f} t={t} over={w(f, t, 'Florence') < 0 ? <Calendar t={t} day="12" month="NOVEMBER" year="1970" x={540} y={560} /> : <Punch t={w(f, t, 'Florence')} lines={['FLORENCE,', 'OREGON']} y={330} size={104} color="#FFD23F" />}>
    <rect x={-600} y={-600} width={W + 1200} height={3200} fill="#0C1426" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-600 + i * 80} -600 L ${-600 + i * 80} 2600`} stroke="#1A2A46" strokeWidth={2} />)}
    <path d={OREGON} transform="translate(0 200)" fill="#14243E" stroke="#5AD8FF" strokeWidth={10} style={{ filter: 'drop-shadow(0 0 18px #5AD8FF)' }} />
    <Txt x={540} y={760} s={120} c="#5AD8FF">OREGON</Txt>
    <g transform={`translate(190 ${920 - popIn(t) * 10})`}><circle r={22} fill="#FF5A4A" /><Glow x={0} y={0} r={90} kind="red" o={0.8} /><circle r={30 + (t % 30)} fill="none" stroke="#FF5A4A" strokeWidth={3} opacity={1 - (t % 30) / 30} /><Txt x={0} y={-40} s={40}>FLORENCE</Txt></g>
  </Take>
);
export const S104: S = ({ t, f }) => (   // the whale: truck along it with the tape, push on the dead eye, pull back for the tons, down to the crowd's noses
  <Take id="S104" f={f} t={t} over={<>
    {w(f, t, 'forty') >= 0 && w(f, t, 'dead') < 0 ? <Tape x0={120} x1={960} y={430} k={w(f, t, 'forty') / 22} label="45 FEET" /> : null}
    {w(f, t, 'dead') >= 0 && w(f, t, 'Eight') < 0 ? <Punch t={w(f, t, 'dead')} lines={['DEAD']} y={340} size={130} color="#9FE3FF" /> : null}
    {w(f, t, 'tons') >= 0 && w(f, t, 'stinks') < 0 ? <Txt x={540} y={420} s={120} c="#9FE3FF">8 TONS</Txt> : null}
    {w(f, t, 'stinks') >= 0 ? <Txt x={540} y={420} s={104} c="#9AD84A">PEE-YOO!</Txt> : null}
  </>}>
    <Beach id="t4" mood="cold" t={t} sunX={800} sunY={860} />
    <Whale x={540} y={1150} s={0.8} rim={MOODS.cold.rim} />
    {Array.from({ length: 8 }, (_, i) => { const k = w(f, t, 'Eight') - i * 2; return k < 0 ? null : <g key={i} transform={`translate(${170 + i * 105} 1290) scale(${popIn(k, 5) * 0.5})`}><Weight x={0} y={0} /></g>; })}
    {Array.from({ length: 2 }, (_, i) => <Gull key={i} x={140 + i * 820} y={1200} s={0.5} flip={i === 1} />)}
    {w(f, t, 'stinks') > -20 ? Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${200 + i * 170} ${1180 - ((t * 3 + i * 40) % 200)} q 20 -30 0 -60 q -20 -30 0 -60`} stroke="#9AD84A" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} style={{ filter: 'drop-shadow(0 0 8px #9AD84A)' }} />) : null}
    <Crowd mood="cold" t={t} n={3} x0={300} x1={780} feet={1780} s={1.25} g="nose" seed={2} />
  </Take>
);
export const S105: S = ({ t, f }) => (   // the sign in the sand, the whale, the highway truck rolling up
  <Take id="S105" f={f} t={t} over={w(f, t, 'problem') >= 0 ? <Punch t={w(f, t, 'problem')} lines={['THEIR', 'PROBLEM']} y={340} size={110} color="#F2B030" /> : null}>
    <Beach id="t5" mood="noon" t={t} />
    <Whale x={300} y={1150} s={0.45} rim={MOODS.noon.rim} />
    {w(f, t, 'highway') >= -8 ? <g transform={`translate(0 ${(1 - popIn(w(f, t, 'highway') + 8, 6)) * 220})`}><Board x={560} y={900} w={300} h={150} lines={['BEACH', '= HIGHWAY']} size={44} /></g> : null}
    <Truck x={lerp(1300, 760, easeOut(clamp((w(f, t, 'whale') + 10) / 50)))} y={1220} s={0.45} />
  </Take>
);
export const S106: S = ({ t, f }) => (   // the office: push to the blueprint, pan out of the window to the gulls, down to the dynamite on the desk
  <Take id="S106" f={f} t={t} over={w(f, t, 'What') >= 0 ? <><Txt x={540} y={400} s={96} c="#C9A2FF">WHAT COULD</Txt><Txt x={540} y={510} s={110} c="#FFB03A">GO WRONG?</Txt></> : null}>
    <rect x={-600} y={-600} width={W + 1200} height={3200} fill="#3A4A5A" />
    <rect x={640} y={360} width={320} height={360} fill="#F2C890" stroke={INK} strokeWidth={10} />
    <path d="M 640 600 Q 800 640 960 600" stroke={INK} strokeWidth={3} fill="none" />
    {Array.from({ length: 3 }, (_, i) => <Gull key={i} x={690 + i * 100} y={612} s={0.35} flip={i === 1} lick={t * 0.5 + i} />)}
    <path d="M 800 360 L 800 720 M 640 540 L 960 540" stroke={INK} strokeWidth={8} />
    <Glow x={800} y={540} r={360} kind="warm" o={0.5} />
    <path d="M 640 720 L 960 720 L 760 1600 L 120 1600 Z" fill="#FFE2B8" opacity={0.14} filter="url(#gsB24)" style={scr} />
    <rect x={-600} y={1150} width={W + 1200} height={900} fill="#2A2A30" />
    <rect x={80} y={980} width={920} height={50} fill="#6A4428" stroke={INK} strokeWidth={6} />
    <g transform="translate(540 960) rotate(-3)"><rect x={-260} y={-160} width={520} height={150} fill="#2A5A9A" stroke="#F4EEE2" strokeWidth={6} />
      <path d="M -200 -50 Q -120 -110 0 -100 Q 120 -90 200 -55" stroke="#F4EEE2" strokeWidth={6} fill="none" /><circle cx={0} cy={-80} r={20} fill="#D8322A" />
      {w(f, t, 'Blow') >= 0 ? <text x={0} y={-24} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={44} fill="#F4EEE2">PLAN: KABOOM</text> : null}</g>
    <g transform="translate(230 975)"><Crate x={0} y={0} s={0.55} />{w(f, t, 'wrong') >= 0 ? <Glow x={0} y={-40} r={220} kind="red" o={0.6 + 0.2 * Math.sin(t * 0.4)} /> : null}</g>
    <g transform="translate(330 420)"><path d="M 0 -140 L 0 0" stroke={INK} strokeWidth={5} /><path d="M -60 40 L 60 40 L 30 0 L -30 0 Z" fill="#2F6F73" stroke={INK} strokeWidth={4} /><circle cx={0} cy={44} r={14} fill="#FFE7A0" /><Glow x={0} y={60} r={300} kind="warm" o={0.7} /></g>
    <Man x={380} feet={1520} s={1.25} mood="night" t={t} g="point" hat="none" e="happy" />
    <Man x={780} feet={1520} s={1.25} mood="night" t={t + 5} g="stand" hat="bowler" e="smug" flip />
  </Take>
);
export const S107: S = ({ t, f }) => (   // the crowd on the dunes: push to the army man, his warning, arc to the hard hat waving him off
  <Take id="S107" f={f} t={t} over={<>
    {w(f, t, 'army') >= 0 && w(f, t, 'said') < 0 ? <><Txt x={540} y={400} s={96} c="#FFD27A">ARMY</Txt><Txt x={540} y={500} s={80}>EXPLOSIVES MAN</Txt></> : null}
    {w(f, t, 'too') >= -4 && w(f, t, 'Nobody') < 0 ? <Speech t={w(f, t, 'too') + 4} x={800} y={520} flip><text x={0} y={-10} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={96} fill="#D8322A">TOO</text><text x={0} y={90} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={96} fill="#D8322A">MUCH!</text></Speech> : null}
    {w(f, t, 'Nobody') >= 0 ? <><Txt x={540} y={400} s={110} c="#F2B030">NOBODY</Txt><Txt x={540} y={510} s={110} c="#F2B030">LISTENED</Txt></> : null}
  </>}>
    <Beach id="t7" mood="noon" t={t} />
    <Whale x={260} y={1100} s={0.4} rim={MOODS.noon.rim} />
    <path d="M -300 1480 Q 300 1240 1380 1400 L 1380 2400 L -300 2400 Z" fill={MOODS.noon.layers[2]} />
    <Crowd mood="noon" t={t} n={6} x0={60} x1={520} feet={1450} s={0.85} seed={3} />
    <Man x={620} feet={1420} s={1.0} mood="warm" t={t} g={w(f, t, 'too') >= 0 ? 'point' : 'stand'} hat="cap" e={w(f, t, 'Nobody') >= 0 ? 'sad' : w(f, t, 'said') >= 0 ? 'angry' : 'smug'} />
    <Glow x={620} y={1200} r={240} kind="warm" o={0.5} />
    <Man x={880} feet={1430} s={1.0} mood="noon" t={t} g={w(f, t, 'Nobody') >= 0 ? 'vote' : 'stand'} hat="bowler" e="smug" flip />
  </Take>
);
export const S108: S = ({ t, f }) => {   // crates stack up to twenty along the whale; push to the plunger for the countdown
  const c = w(f, t, 'countdown'), n = 3 - Math.min(2, Math.floor(Math.max(0, c) / 10));
  return (
    <Take id="S108" f={f} t={t} over={<>
      {c < 0 ? <Counter t={t} from={0} to={20} dur={24} sub="CASES OF DYNAMITE" y={420} color="#FFB03A" /> : <g transform={`translate(540 560) scale(${popIn(Math.max(0, c) % 10, 4)})`}><Txt x={0} y={90} s={280} c="#FFD23F">{String(n)}</Txt></g>}
    </>}>
      <Beach id="t8" mood="danger" t={t} head={false} sunX={300} sunY={880} />
      <Whale x={480} y={1060} s={0.6} rim={MOODS.danger.rim} />
      {Array.from({ length: 20 }, (_, i) => { const k = t - i * 1.2; return k < 0 ? null : <g key={i} transform={`translate(${170 + (i % 7) * 85} ${1180 - Math.floor(i / 7) * 70}) scale(${popIn(k, 4) * 0.5})`}><Crate x={0} y={0} /></g>; })}
      <path d="M 640 1180 Q 760 1260 820 1330" stroke={DYN} strokeWidth={5} fill="none" />
      <Plunger x={820} y={1360} s={0.6} k={clamp((w(f, t, 'KABOOM') + 6) / 5)} />
    </Take>
  );
};
export const S109: S = ({ t, f }) => (   // KABOOM: the fireball, then a whip pull-back to the smoke column over the crowd
  <Take id="S109" f={f} t={t} over={<>{w(f, t, 'Sand') < 0 ? <Burst t={t} text="KABOOM!" y={520} size={130} color="#FF8A1A" /> : <Txt x={540} y={400} s={110} c="#F2A33A">SAND. SMOKE.</Txt>}</>}>
    <Beach id="t9" mood="brown" t={t} sunX={820} sunY={860} />
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={540 + Math.sin(i * 1.7) * (60 + i * 14)} cy={1080 - i * 55 - t * 2} r={90 + i * 12 + t} fill={i % 2 ? '#6A5A4A' : '#8A7A62'} opacity={0.85 * clamp(t / 20)} />)}
    {Array.from({ length: 6 }, (_, i) => <circle key={'f' + i} cx={540 + (i - 3) * 60} cy={900 - t * 4 - i * 50} r={120 + t * 10 + i * 30} fill={['#FFF6C0', '#FFE07A', '#FF9A3A', '#D8502A', '#6A3A2A', '#3A2A2A'][i]} opacity={(0.9 - i * 0.1) * clamp(1 - t / 50)} />)}
    <Glow x={540} y={900} r={900} kind="warm" o={clamp(1 - t / 60)} />
    {Array.from({ length: 30 }, (_, i) => <circle key={'s' + i} cx={540 + (random(`sp${i}`) - 0.5) * 900 * clamp(t / 30)} cy={1100 - random(`sq${i}`) * 500 * Math.sin(clamp(t / 40) * Math.PI)} r={6} fill="#C8A878" />)}
    <Crowd mood="brown" t={t} n={8} x0={60} x1={1020} feet={1420} s={0.8} g="shock" seed={5} />
  </Take>
);
export const S110: S = ({ t, f }) => (   // it rained whale: in the sky with the falling chunks, tilt down to the running crowd, up to the sick cloud
  <Take id="S110" f={f} t={t} over={<>{w(f, t, 'crowd') < 0 ? <Punch t={t - 2} lines={['IT RAINED', 'WHALE']} y={300} size={124} color={BLUB} /> : w(f, t, 'bellyache') >= 0 ? <Txt x={540} y={360} s={96} c="#9AD84A">BELLYACHE</Txt> : null}</>}>
    <Sky id="t10" mood="warm" sunX={760} sunY={700} />
    <Clouds mood="warm" t={t} y={520} />
    <SickCloud x={540} y={540} s={0.8} t={t} />
    <Sea mood="warm" t={t} y={1050} to={1240} />
    <Sand mood="warm" y={1240} />
    <Rain t={t + 10} n={24} seed="a" s={0.7} ground={1560} />
    {Array.from({ length: 5 }, (_, i) => <g key={i}><Man x={1000 - ((t * 7 + i * 220) % 1100)} feet={1500 + (i % 2) * 50} s={0.9} mood="warm" t={t + i * 5} g="run" hat="none" e="scared" flip ph={i} /><path d={`M ${1000 - ((t * 7 + i * 220) % 1100) - 55} ${1500 + (i % 2) * 50 - 250} q 55 -45 110 0`} stroke={['#2A5A9A', '#8A3A2A', '#3A6A3A'][i % 3]} strokeWidth={22} fill="none" strokeLinecap="round" /></g>)}
  </Take>
);
export const S111: S = ({ t, f }) => {   // a chunk falls onto the new car's roof on "flattened"; pull back; arc to the army man
  const k = w(f, t, 'flattened');
  return (
    <Take id="S111" f={f} t={t} over={<>{k >= 0 && w(f, t, 'whose') < 0 ? <Burst t={k} text="CRUNCH!" y={440} size={110} color="#FF5A4A" /> : null}{w(f, t, 'whose') >= 0 && w(f, t, 'army') < 0 ? <Txt x={540} y={520} s={300} c="#F2B030">?</Txt> : null}{w(f, t, 'army') >= 0 ? <Txt x={540} y={400} s={110} c="#FF8A3D">HIS CAR!</Txt> : null}</>}>
      <Beach id="t11" mood="danger" t={t} head={false} />
      <rect x={-300} y={1260} width={W + 600} height={1000} fill="#3A3A42" />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={i * 260 - 60} y={1300} width={14} height={200} fill="#F2E6C8" opacity={0.5} transform={`skewX(-30)`} />)}
      <Car x={600} y={1340} s={0.75} crush={clamp(k / 4)} />
      {k < 0 ? <Chunk x={600} y={1180 + Math.min(0, k) * 30} s={1.4} rot={t * 8} seed={4} /> : null}
      <Man x={190} feet={1440} s={1.05} mood="danger" t={t} g="shock" hat="cap" e={w(f, t, 'army') >= 0 ? 'shock' : 'neutral'} />
    </Take>
  );
};
export const S112: S = ({ t, f }) => (   // rewind: the dealer lot, tilt up to the sign
  <Take id="S112" f={f} t={t}>
    <Sky id="t12" mood="warm" sunX={760} sunY={760} />
    <rect x={-300} y={1160} width={W + 600} height={1000} fill="#5A5A62" />
    <Board x={540} y={760} w={620} h={360} lines={['GET A', 'WHALE', 'OF A DEAL!']} size={84} bg="#D8322A" posts={400} />
    {Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return <circle key={i} cx={540 + Math.cos(a) * 330} cy={580 + Math.sin(a) * 200} r={10} fill={(Math.floor(t / 4) + i) % 2 ? '#FFF2B0' : '#7A5A2A'} />; })}
    <Glow x={540} y={580} r={460} kind="warm" o={0.4} />
    <path d="M -100 1000 Q 540 1100 1180 1000" stroke={INK} strokeWidth={4} fill="none" />
    {Array.from({ length: 14 }, (_, i) => { const u = (i + 0.5) / 14, x = lerp(-100, 1180, u), y = 1000 + Math.sin(u * Math.PI) * 90; return <path key={i} d={`M ${x - 22} ${y} L ${x + 22} ${y} L ${x} ${y + 50 + Math.sin(t * 0.3 + i) * 5} Z`} fill={['#D8322A', '#F4EEE2', '#2A5A9A'][i % 3]} stroke={INK} strokeWidth={3} />; })}
    <Car x={580} y={1280} s={0.8} />
    <Man x={240} feet={1400} s={0.95} mood="warm" t={t} g="point" hat="cap" e="happy" />
  </Take>
);
export const S113: S = ({ t, f }) => (   // the seagulls burst off; tilt down to the lone gull sniffing a chunk
  <Take id="S113" f={f} t={t} over={w(f, t, 'Didn\'t') < 0 ? <Txt x={540} y={400} s={110}>SCARED OFF</Txt> : <Txt x={540} y={400} s={104} c="#9FE3FF">NOT A BITE</Txt>}>
    <Beach id="t13" mood="cold" t={t} />
    {Array.from({ length: 12 }, (_, i) => <Gull key={i} x={120 + (i % 6) * 170 + t * (i % 2 ? 4 : -4)} y={1000 - (i < 6 ? 0 : 140) - t * (6 + (i % 4) * 2)} s={0.5 + (i % 3) * 0.12} flap={t * 0.6 + i} flip={i % 2 === 0} />)}
    <Chunk x={540} y={1300} s={1.0} seed={6} />
    <Gull x={700} y={1310} s={0.9} flip={w(f, t, 'bite') > 4} />
  </Take>
);
export const S114: S = ({ t, f }) => (   // the remains; pan to the bulldozer burying it; pull back
  <Take id="S114" f={f} t={t} over={w(f, t, 'buried') < 0 ? <Punch t={t - 2} lines={['STILL', 'THERE']} y={320} size={120} color="#9FE3FF" /> : <Txt x={540} y={400} s={110} c="#FFD27A">BURIED</Txt>}>
    <Beach id="t14" mood="warm" t={t} head={false} sunX={800} sunY={860} />
    <g transform="translate(380 1090) scale(0.5)"><Whale x={0} y={0} s={1} rim={MOODS.warm.rim} open={0.5} /></g>
    {Array.from({ length: 10 }, (_, i) => <Chunk key={i} x={random(`rc${i}`) * W} y={1180 + random(`rd${i}`) * 200} s={0.35} seed={i} />)}
    <Mound x={560} y={1200} w={260} h={lerp(20, 170, clamp((w(f, t, 'buried') + 10) / 60))} c={MOODS.warm.layers[1]} />
    <Dozer x={lerp(1100, 780, easeOut(clamp(t / 50)))} y={1230} s={0.55} t={t} />
  </Take>
);
export const S115: S = ({ t, f }) => (   // today: kids in the park, pan to the park sign, push to the plaque
  <Take id="S115" f={f} t={t} over={w(f, t, 'real') >= -2 ? <g transform={`translate(540 720) rotate(-10) scale(${popIn(w(f, t, 'real') + 2, 5)})`}><rect x={-330} y={-100} width={660} height={200} fill="#140A12" fillOpacity={0.35} stroke="#FFD23F" strokeWidth={16} /><Txt x={0} y={44} s={124} c="#FFD23F">THAT'S REAL</Txt></g> : w(f, t, 'Exploding') < 0 ? <Punch t={t - 2} lines={['TODAY']} y={330} size={120} color="#FFD23F" /> : null}>
    <Sky id="t15" mood="noon" sunX={760} sunY={600} />
    <Clouds mood="noon" t={t} y={520} />
    <rect x={-300} y={1000} width={W + 600} height={1200} fill="#4A7A3A" />
    {Array.from({ length: 5 }, (_, i) => <g key={i} transform={`translate(${60 + i * 250} 1000)`}><rect x={-12} y={-140} width={24} height={140} fill="#5A3A22" /><circle cx={0} cy={-190} r={80} fill="#3A6A2A" stroke={INK} strokeWidth={5} /></g>)}
    <g transform="translate(200 1260) scale(0.7)"><path d="M -120 0 L -60 -260 L 60 -260 L 120 0" stroke={INK} strokeWidth={12} fill="none" /><path d={`M 0 -260 L ${Math.sin(t * 0.12) * 90} -100`} stroke={INK} strokeWidth={5} /><rect x={Math.sin(t * 0.12) * 90 - 30} y={-108} width={60} height={14} fill="#D8322A" /></g>
    {[0, 1].map((i) => { const u = ((t * 0.006 + i * 0.5) % 1), back = u > 0.5, x = back ? lerp(920, 120, (u - 0.5) * 2) : lerp(120, 920, u * 2);   // the kids run laps across the lawn
      return <Man key={i} x={x} feet={1300 + i * 30} s={0.7} mood="noon" t={t + i * 4} g="run" hat="none" e="happy" ph={i} flip={back} />; })}
    <Board x={600} y={1060} w={460} h={290} lines={['EXPLODING WHALE', 'MEMORIAL PARK']} size={46} bg="#5A3A22" posts={150} />
    <rect x={500} y={1130} width={200} height={100} rx={10} fill="#C8A048" stroke={INK} strokeWidth={5} />
    <text x={600} y={1172} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={18} fill={INK}>NOV 12, 1970</text>
    <text x={600} y={1200} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={16} fill={INK}>FLORENCE, OREGON</text>
  </Take>
);
export const S116: S = ({ t, f }) => (   // a modern office: the whiteboard plan; push in as the stamp lands
  <Take id="S116" f={f} t={t} over={w(f, t, 'dynamite') >= -6 ? <g transform={`translate(540 640) rotate(-12) scale(${lerp(1.8, 1, popIn(w(f, t, 'dynamite') + 6, 4))})`}><rect x={-420} y={-110} width={840} height={220} fill="none" stroke="#D8322A" strokeWidth={18} /><Txt x={0} y={-6} s={74} c="#D8322A">HOW MUCH</Txt><Txt x={0} y={80} s={74} c="#D8322A">DYNAMITE?</Txt></g> : null}>
    <rect x={-600} y={-600} width={W + 1200} height={3200} fill="#2E3A4A" />
    {[300, 780].map((lx) => <g key={lx}><rect x={lx - 90} y={250} width={180} height={18} rx={9} fill="#E8F2FF" /><Glow x={lx} y={268} r={360} kind="cool" o={0.6} /></g>)}
    <rect x={220} y={500} width={640} height={400} fill="#F4F4F0" stroke="#8A8A92" strokeWidth={12} />
    <text x={540} y={660} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={80} fill="#2A5A9A">I'VE GOT</text>
    <text x={540} y={760} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={80} fill="#2A5A9A">A PLAN!</text>
    <path d="M 340 820 L 740 820" stroke="#D8322A" strokeWidth={7} strokeDasharray={400} strokeDashoffset={400 * (1 - clamp(t / 20))} />
    <Dynamite x={760} y={890} s={0.5} n={3} />
    <rect x={-600} y={1150} width={W + 1200} height={1000} fill="#1E242E" />
    <Man x={820} feet={1500} s={1.2} mood="cold" t={t} g="point" hat="none" e="happy" flip />
    <Man x={250} feet={1560} s={1.4} mood="cold" t={t} g="stand" hat="none" e={w(f, t, 'ask') >= 0 ? 'smug' : 'shock'} />
  </Take>
);
export const S117: S = ({ t, f }) => (   // sign-off: the whale on the sunset beach, pull back and up to the whale-shaped cloud
  <Take id="S117" f={f} t={t} over={w(f, t, 'Follow') < 0 ? <><Txt x={540} y={400} s={96} c="#FFD08A">THAT'S ABOUT IT,</Txt><Txt x={540} y={510} s={110}>FOLKS</Txt></> : <Punch t={w(f, t, 'Follow')} lines={['FOLLOW FOR MORE', 'STRANGE HISTORY']} y={300} size={80} color="#FFD08A" />}>
    <Sky id="t17" mood="outback" sunX={540} sunY={1000} />
    <Rays x={540} y={1000} t={t} o={0.3} n={10} spread={140} dir={90} />
    <Clouds mood="outback" t={t} y={620} o={0.9} />
    <Sea mood="outback" t={t} y={1000} to={1180} sunX={540} />
    <Sand mood="outback" y={1180} />
    <Whale x={540} y={1200} s={0.4} rim={MOODS.outback.rim} dead={false} />
  </Take>
);
void SKIN; void Headland; void Truck;
