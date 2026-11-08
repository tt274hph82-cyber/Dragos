import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Bedroom, Burst, Sparkles, Sky, Confetti, SpeedLines, Storm, Rain, Gem, CubeHead } from '../ten-seconds/shots';
import { Toast, Ground, Lobby } from '../best-friend/shots';
import words from './words.json';

// "What if you hacked the game?" The blocky-game What If style, YOU twist: four hacks, then the game hacks you
// back and turns you into a chicken. Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const T = { h: [at('Hack', 1), at('Hack', 2), at('Hack', 3), at('Hack', 4)], warn: at('Warning'), back: at('back'), chicken: at('chicken') };
const txt = (s: number, c = '#FFFFFF', sw = 12) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: sw, paintOrder: 'stroke' as const });
const GREEN = '#4ADE6A';

/** The hack terminal pill at the top (fixed HUD): counts the hacks, then turns red, then glitches. */
export const HackBar: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, n = T.h.filter((c) => sec >= c).length;
  const state = sec >= T.chicken ? 'chicken' : sec >= T.back ? 'back' : sec >= T.warn ? 'warn' : 'ok';
  const c = state === 'ok' ? GREEN : state === 'warn' ? '#FF4A4A' : state === 'back' ? '#FF7AE0' : '#FFD23F';
  const label = state === 'ok' ? `> HACKS ${n}/4` : state === 'warn' ? '! CHEATER DETECTED' : state === 'back' ? '> GAME.EXE HACKING YOU' : '> PLAYER = CHICKEN';
  const pop = T.h.some((h) => sec >= h && sec < h + 0.25) || (sec >= T.warn && sec < T.warn + 0.25) ? 1.15 : 1;
  const jit = state === 'back' && Math.floor(f / 3) % 4 === 0 ? (random(`hj${f}`) - 0.5) * 30 : 0;
  const blink = state === 'warn' && Math.floor(f / 6) % 2 === 0 ? 0.55 : 1;
  return (
    <g transform={`translate(${540 + jit} 330) scale(${pop})`} opacity={blink}>
      <rect x={-330} y={-46} width={660} height={92} rx={20} fill="#0A140E" stroke={c} strokeWidth={6} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={label.length > 18 ? 38 : 46} fill={c}>{label}{Math.floor(f / 15) % 2 ? '_' : ' '}</text>
    </g>
  );
};
const HackBadge: React.FC<{ t: number; n: string; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#06120A" />
    <Code t={t} />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke={GREEN} strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-260} y={-160} width={520} height={320} rx={40} fill="#0A140E" stroke={OL} strokeWidth={14} />
      <rect x={-236} y={-136} width={472} height={272} rx={28} fill="none" stroke={GREEN} strokeWidth={12} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={GREEN}>HACK</text>
      <text y={110} {...txt(170, GREEN)}>{n}</text>
    </g>
  </g>
);
const badge = (n: string): S => ({ t, len }) => <HackBadge t={t} n={n} len={len} />;
/** Falling green code columns. */
const Code: React.FC<{ t: number; c?: string; o?: number }> = ({ t, c = GREEN, o = 0.35 }) => (
  <g opacity={o}>{Array.from({ length: 14 }, (_, i) => {
    const x = 40 + i * 76, y0 = ((t * (16 + random(`cv${i}`) * 14) + random(`cy${i}`) * 2000) % 2300) - 300;
    return <g key={i}>{Array.from({ length: 8 }, (_, k) => <text key={k} x={x} y={y0 - k * 56} fontFamily={FONT.game} fontWeight={900} fontSize={44} fill={c} opacity={1 - k / 8}>{random(`ch${i}_${k}_${Math.floor(t / 4)}`) > 0.5 ? '1' : '0'}</text>)}</g>;
  })}</g>
);
/** Glitch tear: the picture drawn in horizontal slices that jump sideways every few frames. */
const Glitch: React.FC<{ t: number; amt?: number; id: string; children: React.ReactNode }> = ({ t, amt = 1, id, children }) => {
  const k = Math.floor(t / 3);
  const bands = Array.from({ length: 7 }, (_, i) => ({ y: i * 300 - 200, h: 300, dx: random(`${id}${k}_${i}`) > 0.6 ? (random(`${id}d${k}_${i}`) - 0.5) * 120 * amt : 0 }));
  return (
    <g>
      <defs>{bands.map((b, i) => <clipPath key={i} id={`${id}c${i}`}><rect x={-400} y={b.y} width={W + 800} height={b.h} /></clipPath>)}</defs>
      {bands.map((b, i) => <g key={i} clipPath={`url(#${id}c${i})`} transform={`translate(${b.dx} 0)`}>{children}</g>)}
      {random(`${id}f${k}`) > 0.5 ? <rect x={-300} y={200 + random(`${id}y${k}`) * 1400} width={W + 600} height={30} fill="#FF3AC8" opacity={0.5 * amt} /> : null}
      {random(`${id}g${k}`) > 0.5 ? <rect x={-300} y={200 + random(`${id}z${k}`) * 1400} width={W + 600} height={18} fill="#3AF8FF" opacity={0.5 * amt} /> : null}
    </g>
  );
};
const Laptop: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-340} width={520} height={340} rx={24} fill="#2A2234" stroke={OL} strokeWidth={10} />
    <rect x={-234} y={-314} width={468} height={288} rx={10} fill="#06120A" />
    {[0, 1, 2, 3, 4].map((k) => <text key={k} x={-210} y={-262 + k * 52} fontFamily={FONT.game} fontWeight={900} fontSize={36} fill={GREEN} opacity={clamp((t - k * 3) / 2)}>{['> hack.exe', '> fly = ON', '> gems = ∞', '> size = 99', '> boss = null'][k]}</text>)}
    <path d="M -320 0 L 320 0 L 290 40 L -290 40 Z" fill="#4A4458" stroke={OL} strokeWidth={10} strokeLinejoin="round" />
    <ellipse cx={0} cy={-170} rx={420} ry={260} fill={GREEN} opacity={0.08} />
  </g>
);
const Toggle: React.FC<{ y: number; label: string; on: boolean; c?: string }> = ({ y, label, on, c = GREEN }) => (
  <g transform={`translate(0 ${y})`}>
    <text x={-250} y={22} fontFamily={FONT.game} fontWeight={900} fontSize={56} fill="#FFFFFF">{label}</text>
    <rect x={130} y={-34} width={140} height={68} rx={34} fill={on ? c : '#3A3448'} stroke={OL} strokeWidth={6} />
    <circle cx={on ? 236 : 164} cy={0} r={26} fill="#FFFFFF" stroke={OL} strokeWidth={5} />
  </g>
);
const Sock: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string }> = ({ x, y, s = 1, r = 0, c = '#F2F2F8' }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <path d="M -30 -80 L 30 -80 L 30 20 Q 30 60 70 60 Q 100 60 100 85 Q 100 110 60 110 L -10 110 Q -30 110 -30 80 Z" fill={c} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-30} y={-80} width={60} height={30} fill="#E2262E" stroke={OL} strokeWidth={6} />
  </g>
);
/** You, as a chicken: a white cube body, your face, a beak and a comb. */
const Chicken: React.FC<{ x: number; y: number; s: number; t: number; face?: 'shock' | 'worried' | 'despair' }> = ({ x, y, s, t, face = 'shock' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={220} ry={26} fill="#000" opacity={0.22} />
    {[-60, 60].map((lx, i) => <path key={i} d={`M ${lx} -160 L ${lx} 0 M ${lx - 40} 0 L ${lx + 40} 0`} stroke="#FFA81A" strokeWidth={22} strokeLinecap="round" />)}
    <rect x={-200} y={-520} width={400} height={380} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={9} />
    <path d={`M -200 -380 Q ${-320 - Math.sin(t * 1.4) * 30} -330 -200 -260 Z`} fill="#F2F2F8" stroke={OL} strokeWidth={8} />
    <path d={`M 200 -380 Q ${320 + Math.sin(t * 1.4) * 30} -330 200 -260 Z`} fill="#F2F2F8" stroke={OL} strokeWidth={8} />
    <g transform="translate(0 -700)">
      <CubeHead face={face} hair="kid" skin="#FFFFFF" t={t} />
      <path d="M -60 -175 Q -50 -260 -10 -190 Q 10 -280 40 -190 Q 70 -250 80 -175 Z" fill="#E2262E" stroke={OL} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -40 70 L 0 130 L 40 70 Z" fill="#FFA81A" stroke={OL} strokeWidth={7} strokeLinejoin="round" />
    </g>
  </g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g>
    <Bedroom t={t} dark={0.45} />
    <Blocky x={540} y={1440} s={0.62} kind="kid" face="smirk" t={t} pose={{ armL: 60, armR: 60 }} />
    <Laptop x={540} y={1580} s={0.72} t={t} />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#06120A" />
    <Code t={t} />
    <g transform={`translate(540 860) scale(${popIn(t, 6) * 1.1})`}>
      <rect x={-320} y={-400} width={640} height={800} rx={30} fill="#0A140E" stroke={GREEN} strokeWidth={10} />
      <text y={-300} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill={GREEN}>HACK MENU</text>
      <Toggle y={-170} label="FLY" on={t > 8} />
      <Toggle y={-40} label="GEMS ∞" on={t > 12} />
      <Toggle y={90} label="GIANT" on={t > 16} />
      <Toggle y={220} label="NO BOSS" on={t > 20} c="#FF4A4A" />
    </g>
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Sky />
    {Array.from({ length: 5 }, (_, i) => { const x = ((W + 400) - ((t * 30 + i * 300) % (W + 600))); return <g key={i} fill="#FFFFFF"><rect x={x - 90} y={400 + i * 260} width={180} height={56} rx={12} /><rect x={x - 40} y={360 + i * 260} width={100} height={56} rx={12} /></g>; })}
    <g transform={`translate(330 ${1150 + Math.sin(t * 0.3) * 20})`}>
      <path d="M -40 -650 Q -300 -520 -360 -300 Q -200 -420 -40 -440 Z" fill="#E2262E" stroke={OL} strokeWidth={8} transform="rotate(60)" />
      <Blocky x={0} y={0} s={0.55} kind="kid" face="starry" t={t} pose={{ armL: 175, armR: 175, legL: -6, legR: 6, lean: 60 }} />
    </g>
    <SpeedLines t={t} o={0.35} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A6AA8" c2="#2A8AC8" />
    <Blocky x={540} y={1850} s={1.35} kind="kid" face="starry" t={t} pose={{ armL: 165, armR: 165 }} />
    <SpeedLines t={t} o={0.3} />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground />
    <Rain t={t} kind="gem" n={30} seed="ig" />
    <Blocky x={540} y={1500} s={0.6} kind="kid" face="starry" t={t} pose={{ armL: 150, armR: 150 }} />
    <g transform={`translate(540 600) scale(${popIn(t)})`}><rect x={-300} y={-60} width={600} height={120} rx={60} fill="#1A1424" stroke="#5AE8F8" strokeWidth={8} /><Gem x={-220} y={0} s={0.8} />
      <text x={40} y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill="#5AE8F8">{Math.round(lerp(0, 9999999, clamp(t / 30))).toLocaleString('en-US')}</text></g>
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#0A3A4A" c2="#0E4A5E" />
    <Glitch t={t} id="cnt" amt={clamp(t / 10)}>
      <g transform="translate(540 860) scale(1.2)"><rect x={-300} y={-80} width={600} height={160} rx={80} fill="#1A1424" stroke="#5AE8F8" strokeWidth={10} /><Gem x={-220} y={0} s={1} />
        <text x={50} y={30} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={t > 12 ? 100 : 70} fill={t > 12 ? '#FF4A4A' : '#5AE8F8'}>{t > 12 ? 'ERR' : t > 6 ? '9.9E+99' : '99,999,999'}</text></g>
    </Glitch>
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <Lobby t={t} />
    <Blocky x={540} y={1480} s={lerp(0.4, 1.05, easeOut(clamp(t / 12)))} kind="kid" face="grin" t={t} pose={{ armL: 120, armR: 120 }} />
  </g>
);
export const S8: S = ({ t }) => {
  const down = easeOut(clamp((t - 4) / 6));
  return (
    <g>
      <Sky c="#9ACDE8" /><Ground c="#7AC87A" />
      {[160, 400, 680, 920].map((x, i) => <g key={i} transform={`translate(${x} 1300) scale(1 ${t > 10 && Math.abs(x - 540) < 300 ? 0.2 : 1}) translate(${-x} -1300)`}><rect x={x - 50} y={1060} width={100} height={240} fill="#C8C0D8" stroke={OL} strokeWidth={8} /><rect x={x - 80} y={1020} width={160} height={50} fill="#D8D0E8" stroke={OL} strokeWidth={8} /></g>)}
      {/* the giant shoe stomping down */}
      <g transform={`translate(540 ${lerp(-200, 1180, down)})`}>
        <rect x={-180} y={-1400} width={360} height={1300} fill="#3A5AB8" stroke={OL} strokeWidth={12} />
        <rect x={-260} y={-140} width={520} height={160} rx={40} fill="#2A2234" stroke={OL} strokeWidth={12} />
      </g>
      {t > 10 ? Array.from({ length: 10 }, (_, i) => <circle key={i} cx={540 + Math.cos(i * 0.63) * (200 + (t - 10) * 26)} cy={1260 - Math.abs(Math.sin(i * 0.63)) * (60 + (t - 10) * 12)} r={Math.max(4, 40 - (t - 10) * 2)} fill="#C8C0D8" opacity={clamp(1 - (t - 10) / 20)} />) : null}
      {t > 10 && !React.useContext(CloseCtx) ? <g transform={`translate(540 640) scale(${popIn(t - 10, 4)}) rotate(-6)`}><text {...txt(130, '#FFD23F')}>STOMP!</text></g> : null}
    </g>
  );
};
export const S9: S = ({ t }) => {
  const gone = clamp((t - 10) / 14);
  return (
    <g>
      <Storm t={t} />
      <g opacity={1 - gone}><Blocky x={540} y={1500} s={0.85} kind="boss" face="shock" t={t} pose={{ armL: 140, armR: 140 }} /></g>
      {Array.from({ length: 40 }, (_, i) => { const x = 280 + random(`px${i}`) * 520, y = 500 + random(`py${i}`) * 1000; return t > 10 ? <rect key={i} x={x + (t - 10) * 14 * (random(`pd${i}`) - 0.3)} y={y - (t - 10) * 10 * random(`pu${i}`)} width={40} height={40} fill={['#6A4AC8', '#FF9A3A', '#5A5A6A'][i % 3]} stroke={OL} strokeWidth={4} opacity={clamp(1 - (t - 10 - random(`po${i}`) * 10) / 12)} /> : null; })}
      <g transform={`translate(540 640) scale(${popIn(t, 5)})`}>
        <rect x={-320} y={-100} width={640} height={200} rx={30} fill="#1A1424" stroke="#FF4A4A" strokeWidth={8} />
        <text y={-14} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={52} fill="#FFFFFF">DELETE BOSS?</text>
        <rect x={-90} y={20} width={180} height={64} rx={20} fill={t > 8 ? '#FF4A4A' : '#3A3448'} stroke={OL} strokeWidth={6} />
        <text y={66} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF">YES</text>
      </g>
    </g>
  );
};
export const S10: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill={Math.floor(t / 5) % 2 ? '#5A0A0A' : '#8A1010'} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-300 + ((i * 220 + t * 12) % 1800)} y={-300} width={100} height={2600} fill="#FFD23F" opacity={0.12} transform="rotate(30 540 960)" />)}
    <g transform={`translate(540 820) scale(${popIn(t, 5) * 1.2})`}>
      <path d="M 0 -260 L 260 200 L -260 200 Z" fill="#FFD23F" stroke={OL} strokeWidth={16} strokeLinejoin="round" />
      <rect x={-22} y={-130} width={44} height={200} rx={20} fill={OL} /><circle cx={0} cy={140} r={28} fill={OL} />
    </g>
  </g>
);
/** The game's eye: a giant red pixel eye opening in the dark. */
export const S11: S = ({ t }) => {
  const open = easeOut(clamp(t / 8));
  return (
    <g>
      <rect x={-300} y={-300} width={W + 600} height={2600} fill="#0A0612" />
      <Code t={t} c="#FF3A3A" o={0.25} />
      <g transform={`translate(540 860) scale(1 ${open})`}>
        <ellipse rx={420} ry={240} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
        <circle cx={Math.sin(t * 0.4) * 60} r={170} fill="#E2262E" stroke={OL} strokeWidth={12} />
        <rect x={Math.sin(t * 0.4) * 60 - 50} y={-50} width={100} height={100} fill={OL} />
      </g>
    </g>
  );
};
export const S12: S = ({ t }) => (
  <Glitch t={t} id="kb" amt={1}>
    <Bedroom t={t} dark={0.5} />
    <Blocky x={540} y={1850} s={1.3} kind="kid" face="shock" t={t} pose={{ armL: 150, armR: 150 }} />
  </Glitch>
);
export const S13: S = ({ t }) => (
  <Glitch t={t} id="term" amt={0.8}>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#14060E" />
    <Code t={t} c="#FF7AE0" o={0.3} />
    <g transform={`translate(540 860) scale(${popIn(t, 5)})`}>
      <rect x={-380} y={-200} width={760} height={400} rx={30} fill="#0A0612" stroke="#FF7AE0" strokeWidth={10} />
      {['> game.exe', '> target = YOU', '> hacking...'].map((l, k) => <text key={k} x={-330} y={-90 + k * 100} fontFamily={FONT.game} fontWeight={900} fontSize={64} fill="#FF7AE0" opacity={clamp((t - k * 5) / 2)}>{l}</text>)}
    </g>
  </Glitch>
);
export const S14: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground />
    {Array.from({ length: 16 }, (_, i) => {
      const x = random(`sk${i}`) * W, y = -150 + ((t * (14 + random(`skv${i}`) * 10) + random(`sky${i}`) * 2000) % 2100);
      return y > 900 ? <Sock key={i} x={x} y={y} s={0.7} r={t * 6 + i * 30} c={['#F2F2F8', '#FFD23F', '#7ACCF2'][i % 3]} /> : <Gem key={i} x={x} y={y} s={0.7} />;
    })}
    <Blocky x={540} y={1500} s={0.6} kind="kid" face="worried" t={t} pose={{ armL: 60, armR: 60 }} />
  </g>
);
const Sword: React.FC<{ t: number; floppy: number }> = ({ t, floppy }) => (
  <g>
    <path d={`M 0 0 Q ${floppy * 160} ${-200 + floppy * 60} ${floppy * 260 + Math.sin(t * 0.8) * 30 * floppy} ${-420 + floppy * 480}`} stroke={floppy > 0.5 ? '#F2D27A' : '#C8D8E8'} strokeWidth={60} fill="none" strokeLinecap="round" />
    <rect x={-80} y={-10} width={160} height={30} rx={10} fill="#8A5A3A" stroke={OL} strokeWidth={6} />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Blocky x={540} y={1700} s={0.9} kind="kid" face={t > 8 ? 'despair' : 'determined'} t={t} pose={{ armR: 120 }} extra={<g transform="translate(330 -760)"><Sword t={t} floppy={easeOut(clamp((t - 4) / 10))} /></g>} />
  </g>
);
export const S16: S = ({ t }) => {
  const pink = clamp((t - 4) / 8);
  return (
    <g>
      <Burst t={t} c1="#C83A9A" c2="#E85AB8" />
      <Blocky x={540} y={1850} s={1.3} kind="kid" face={pink > 0.5 ? 'shock' : 'worried'} t={t} />
      <g transform="translate(540 1850) scale(1.3)" opacity={pink}>
        <rect x={-130} y={-600} width={260} height={320} rx={30} fill="#FF7AD0" stroke={OL} strokeWidth={9} />
        <path d="M -40 -520 Q 0 -560 40 -520 Q 80 -480 0 -400 Q -80 -480 -40 -520 Z" fill="#FFFFFF" stroke={OL} strokeWidth={6} />
      </g>
      <Sparkles t={t} seed="pk" />
    </g>
  );
};
export const S17: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2A48" c2="#4A3A5A" />
    <Blocky x={540} y={1850} s={1.35} kind="kid" face="despair" t={t} pose={{ armL: 100, armR: 100 }} />
  </g>
);
export const S18: S = ({ t }) => {
  const hit = Math.floor(t / 6) % 2 === 0 && t % 6 < 2;
  return (
    <g>
      <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
      <g transform={`translate(540 900) scale(${hit ? 0.9 : 1})`}>
        <ellipse cx={0} cy={60} rx={340} ry={110} fill="#2A2234" stroke={OL} strokeWidth={12} />
        <ellipse cx={0} cy={hit ? 40 : 0} rx={300} ry={100} fill="#4ADE6A" stroke={OL} strokeWidth={12} />
        <text y={hit ? 62 : 22} {...txt(110, '#FFFFFF', 10)}>UNDO</text>
      </g>
      <g transform={`translate(${660} ${hit ? 760 : 560}) rotate(20)`}><rect x={-60} y={-240} width={120} height={260} rx={30} fill="#D8323A" stroke={OL} strokeWidth={9} /><rect x={-58} y={-40} width={116} height={100} rx={30} fill="#F4E2CC" stroke={OL} strokeWidth={9} /></g>
    </g>
  );
};
export const S19: S = ({ t }) => (
  <Glitch t={t} id="err" amt={0.6}>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#1A3AA8" />
    <g transform={`translate(540 820) scale(${popIn(t, 5) * 1.1})`}>
      <rect x={-380} y={-260} width={760} height={520} rx={20} fill="#E8E8F0" stroke={OL} strokeWidth={12} />
      <rect x={-380} y={-260} width={760} height={90} rx={20} fill="#E2262E" stroke={OL} strokeWidth={12} />
      <text x={-340} y={-196} fontFamily={FONT.game} fontWeight={900} fontSize={46} fill="#FFFFFF">ERROR 404</text>
      <text y={-40} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>UNDO</text>
      <text y={50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>NOT FOUND</text>
      <rect x={-110} y={120} width={220} height={90} rx={20} fill="#3A3448" stroke={OL} strokeWidth={8} />
      <text y={182} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={54} fill="#FFFFFF">OK</text>
    </g>
  </Glitch>
);
export const S20: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground c="#7AC87A" />
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={540 + Math.cos(i * 0.52) * (120 + t * 22)} cy={1000 + Math.sin(i * 0.52) * (120 + t * 22)} r={Math.max(4, 50 - t * 2)} fill="#FFFFFF" opacity={clamp(1 - t / 22)} />)}
    <g transform={`translate(0 0) scale(1)`}><Chicken x={540} y={1500} s={popIn(t - 4, 6) * 0.75} t={t} /></g>
    <g opacity={clamp(1 - t / 6)}><circle cx={540} cy={1000} r={460} fill="#FFFFFF" /></g>
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Chicken x={540} y={1850} s={1.2} t={t} face="worried" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d="M 0 -40 Q 30 0 0 40 Q -30 0 0 -40 Z" fill="#FFFFFF" stroke={OL} strokeWidth={5} transform={`translate(${200 + i * 140} ${500 + ((t * 6 + i * 120) % 500)}) rotate(${t * 5 + i * 50})`} />)}
    <g transform={`translate(720 680) rotate(10) scale(${popIn(t - 2, 4)})`}><text {...txt(120, '#FFD23F')}>BAWK?</text></g>
  </g>
);
export const S22: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#06120A" />
    <Code t={t} />
    <g transform="translate(540 760) scale(0.85)">
      <rect x={-200} y={40} width={400} height={120} rx={20} fill="#3A3448" stroke={OL} strokeWidth={10} />
      <ellipse cx={0} cy={40} rx={200} ry={60} fill="#2A2234" stroke={OL} strokeWidth={10} />
      <ellipse cx={0} cy={10 + Math.max(0, Math.sin(t * 0.5)) * 10} rx={170} ry={56} fill="#E2262E" stroke={OL} strokeWidth={10} />
      <text y={34} {...txt(64, '#FFFFFF', 8)}>HACK</text>
    </g>
    <Chicken x={540} y={1400} s={0.45} t={t} face="worried" />
    <Toast t={t - 3} text="COMMENT HACK" c={GREEN} y={600} />
    <Sparkles t={t} seed="end" />
  </g>
);
export const S23 = badge('1');
export const S24 = badge('2');
export const S25 = badge('3');
export const S26 = badge('4');

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S30 = close(S1, 540, 1250, 1.9, 20);   // "hacked": the laptop code
export const S31: S = ({ t }) => (   // "actually fly": a tilted flying close-up
  <g>
    <Burst t={t} c1="#2A7AC8" c2="#3A9AE8" />
    <Blocky x={600} y={1900} s={1.2} kind="kid" face="grin" t={t} pose={{ armL: 175, armR: 175, lean: 18 }} />
    <SpeedLines t={t} o={0.45} />
  </g>
);
export const S32 = close(S9, 540, 900, 1.5, 14);    // "boss": the boss crumbling into pixels
export const S33 = close(S17, 540, 1000, 1.3, 20);  // "sorry": begging
export const S34 = close(S20, 540, 920, 1.6, 30);   // "Forever": the chicken's face
export const S35 = close(S14, 540, 1100, 1.6, 20);  // "socks": socks raining
export const S36 = close(S15, 760, 760, 1.5, 20);   // "noodle": the floppy sword
export const S37 = close(S8, 540, 1100, 1.5, 12);   // "lobby": the stomp
