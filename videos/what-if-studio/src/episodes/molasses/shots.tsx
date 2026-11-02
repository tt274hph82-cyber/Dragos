import React from 'react';
import { ShotProps, faceAt, kf, Hero, basePose, LEG_LEN } from '../../engine';
import {
  W, H, Mood, MOODS, Sky, City, Street, ElRail, Tank, Molasses, Figure, Host, HostClose, HostCut, Punch, BigNumber, Calendar, Clock, Thermometer,
  Sparks, Sfx, popIn, clamp, lerp, easeOut, Glow, INK, Fore, CloseCtx,
} from './kit';

// "The Great Molasses Flood" — a native 9:16 story Reel. Everything key sits between y = 280 and 1250 (the Reels safe
// zone); the karaoke captions are drawn by the engine at y = 1170. The engine adds the slow push-in and the dissolves.

type S = React.FC<ShotProps>;
const crowd = (mood: Mood, t: number, n: number, x0: number, x1: number, feet: number, s: number, run = 0) =>
  Array.from({ length: n }, (_, i) => {
    const x = lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)) + run * t * (i % 2 ? 1.2 : 1);
    const ph = t * (run ? 0.6 : 0.15) + i * 1.7;
    const sw = Math.sin(ph) * (run ? 30 : 6);
    return (
      <Figure key={i} x={x} feet={feet + (i % 3) * 14} s={s * (0.92 + (i % 3) * 0.06)} mood={mood} extra={i % 4 === 1 ? 'bob' : i % 4 === 3 ? 'bunches' : undefined}
        hat={i % 4 === 0 ? 'bowler' : i % 4 === 2 ? 'cap' : 'none'}
        pose={{ yaw: run ? -0.6 : i % 2 ? 0.4 : -0.3, legL: { a: sw, b: -Math.abs(sw) }, legR: { a: -sw, b: -Math.abs(sw) }, armL: { a: 20 - sw, b: 30 }, armR: { a: 20 + sw, b: 30 } }} />
    );
  });
const harbour = (id: string, mood: Mood, t: number, o: { tank?: boolean; rail?: number; brown?: number; leak?: number; sunY?: number } = {}) => (
  <g>
    <Sky id={id} mood={mood} sunY={o.sunY ?? 480} />
    <City mood={mood} />
    {o.tank !== false ? <Tank x={300} y={830} s={0.95} brown={o.brown} leak={o.leak} t={t} c={mood === 'noon' ? '#55636F' : MOODS[mood].layers[2]} /> : null}
    {o.rail !== undefined ? <ElRail y={1060} bend={o.rail} /> : null}
    <Street mood={mood} />
  </g>
);
// a shot's foreground layer, drawn last: blurred posts and rope right at the lens
const front = (kind: 'posts' | 'barrel' = 'posts') => <Fore kind={kind} />;

// ---------------------------------------------------------------- the hook (0-12 s)
export const S1: S = ({ t }) => (
  <g>
    {harbour('m1', 'noon', t, { rail: 0 })}
    {crowd('noon', t, 6, 120, 980, 1330, 0.62)}
    <Punch t={t - 2} lines={['BOSTON,', '1919']} y={360} size={110} color="#FFD23F" />
    {front()}
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    {harbour('m2', 'warm', t, { tank: false, rail: 0, sunY: 360 })}
    <Clock t={t - 2} h={12} m={30} x={540} y={640} tick={t * 0.05} />
    {crowd('warm', t, 5, 160, 920, 1330, 0.66)}
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Sky id="m3" mood="danger" sunY={300} />
    <Tank x={540} y={520} s={1.9} t={t} c="#5A3A36" />
    {[[380, 650, 4], [700, 820, 10], [460, 980, 16], [640, 600, 22], [520, 900, 28], [760, 1040, 34]].map(([x, y, d], i) => <Sparks key={i} x={x} y={y} t={t - d} seed={i} />)}
    <Sfx t={t - 4} text="RA-TA-TA!" x={540} y={420} />
  </g>
);
export const S4: S = ({ t, len }) => {
  const k = easeOut(clamp(t / len));
  return (
    <g>
      {harbour('m4', 'danger', t, { tank: false, rail: 0 })}
      <Molasses id="m4w" top={lerp(1200, 560, k)} crest={240 * k} t={t} />
      {crowd('danger', t, 5, 160, 900, 1330, 0.68, -3)}
      <Punch t={t - 10} lines={['AS TALL AS', 'A HOUSE']} y={340} size={90} color="#FF8A3D" />
    </g>
  );
};
export const S5: S = ({ t }) => (
  <g>
    <Sky id="m5" mood="brown" sunY={260} />
    <Molasses id="m5w" top={760} crest={120} t={t} />
    {/* a glossy drip falls into the frame and splats */}
    <ellipse cx={540} cy={lerp(200, 700, clamp(t / 10))} rx={46} ry={70} fill="#5A2A0A" stroke="#E8A35A" strokeWidth={4} opacity={t < 10 ? 1 : 0} />
    <Sfx t={t - 30} text="SYRUP!" x={540} y={520} size={150} rot={-6} />
  </g>
);

// ---------------------------------------------------------------- the host (a new intro place: the wharf at noon)
export const S6: S = ({ t }) => (
  <g>
    {harbour('m6', 'noon', t, { rail: 0 })}
    {[180, 900].map((x) => <g key={x}><rect x={x - 60} y={1270} width={120} height={150} rx={20} fill="#6A4222" stroke={INK} strokeWidth={6} /><path d={`M ${x - 60} 1310 L ${x + 60} 1310 M ${x - 60} 1380 L ${x + 60} 1380`} stroke={INK} strokeWidth={5} /></g>)}
    <HostCut pose="laugh_point" x={560} bottom={1640} height={980} t={t} />
    <Punch t={t - 3} lines={['THE GREAT', 'MOLASSES FLOOD']} y={330} size={84} color="#FFD23F" />
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <Sky id="m7" mood="noon" sunY={380} />
    <City mood="noon" />
    <HostCut pose="smug" x={540} bottom={1500} height={880} t={t} />
    <Punch t={t - 6} lines={['IT REALLY', 'HAPPENED']} y={330} size={80} />
  </g>
);

// ---------------------------------------------------------------- the tank and the warnings
export const S8: S = ({ t }) => (
  <g>
    {harbour('m8', 'noon', t, { tank: false })}
    <Tank x={540} y={560} s={1.5} t={t} c="#55636F" />
    {/* a height ruler beside it */}
    <g transform={`translate(880 ${560}) scale(1 ${popIn(t - 20)})`}>
      <path d="M 0 -105 L 0 600 M -24 -105 L 24 -105 M -24 600 L 24 600" stroke="#FFD23F" strokeWidth={10} />
    </g>
    <Sfx t={t - 24} text="15 M" x={880} y={500} rot={0} size={80} />
    <HostCut pose="sitting" x={860} bottom={1600} height={620} t={t} />
  </g>
);
export const S9: S = ({ t, len }) => (
  <g>
    <Sky id="m9" mood="brown" sunY={300} />
    {/* cutaway: the tank's wall drawn as an outline with molasses rising inside */}
    <defs><clipPath id="m9c"><rect x={240} y={480} width={600} height={720} /></clipPath></defs>
    <g clipPath="url(#m9c)"><Molasses id="m9m" top={lerp(1150, 560, easeOut(clamp(t / (len * 0.6))))} t={t} x0={240} x1={840} /></g>
    <rect x={240} y={480} width={600} height={720} fill="none" stroke="#E8DCC8" strokeWidth={10} />
    <path d="M 230 480 L 540 380 L 850 480" fill="none" stroke="#E8DCC8" strokeWidth={10} />
    <BigNumber t={t - 18} text="8.7 M" sub="LITRES OF MOLASSES" y={340} />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Sky id="m10" mood="warm" sunY={420} />
    {/* barrel -> arrow -> bottle: molasses was turned into industrial alcohol */}
    <g transform={`translate(300 760) scale(${popIn(t)})`}>
      <rect x={-110} y={-150} width={220} height={300} rx={60} fill="#6A4222" stroke={INK} strokeWidth={8} />
      {[-90, 0, 90].map((y) => <path key={y} d={`M -110 ${y} L 110 ${y}`} stroke={INK} strokeWidth={8} />)}
    </g>
    <path d="M 450 760 L 620 760 M 590 720 L 630 760 L 590 800" stroke="#FFFFFF" strokeWidth={16} fill="none" strokeLinecap="round" opacity={clamp((t - 8) / 6)} />
    <g transform={`translate(800 760) scale(${popIn(t - 14)})`}>
      <path d="M -60 -40 L -30 -150 L 30 -150 L 60 -40 L 60 150 L -60 150 Z" fill="#9FD8F2" stroke={INK} strokeWidth={8} />
      <rect x={-46} y={10} width={92} height={80} fill="#FFF8EA" stroke={INK} strokeWidth={5} />
      <text y={64} textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={40} fill={INK}>ALC</text>
    </g>
  </g>
);
export const S11: S = ({ t, len }) => (
  <g>
    {harbour('m11', 'noon', t, { tank: false })}
    <Tank x={540} y={560} s={1.5} t={t} leak={clamp(t / len)} c="#55636F" />
    <Sfx t={t - 8} text="DRIP..." x={760} y={460} rot={6} size={80} />
  </g>
);
export const S12: S = ({ t, len }) => {
  const k = clamp(t / len);
  return (
    <g>
      {harbour('m12', 'noon', t, { tank: false })}
      <Tank x={540} y={560} s={1.5} t={t} leak={1 - k} brown={k} c="#55636F" />
      {/* a painter on a ladder rolling brown paint */}
      <path d="M 820 1380 L 900 640 M 880 1380 L 960 640" stroke={INK} strokeWidth={10} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M ${828 + i * 10} ${1300 - i * 105} L ${888 + i * 10} ${1300 - i * 105}`} stroke={INK} strokeWidth={8} />)}
      <Figure x={880} feet={900} s={0.55} mood="noon" pose={{ yaw: -0.8, armR: { a: 110 + Math.sin(t * 0.4) * 20, b: 20 } }} />
      <Punch t={t - 26} lines={['PAINTED', 'BROWN']} y={360} size={92} color="#C98448" />
    </g>
  );
};
export const S13: S = ({ t }) => (
  <g>
    {harbour('m13', 'warm', t, { tank: false })}
    <Tank x={540} y={520} s={1.3} t={t} leak={1} brown={1} c="#55636F" />
    {[300, 470, 640, 800].map((x, i) => (
      <g key={x}>
        <Figure x={x} feet={1320} s={0.66} mood="warm" extra={i % 2 ? 'bunches' : undefined} pose={{ yaw: i % 2 ? -0.3 : 0.3, armR: { a: 70, b: 40 }, headTilt: -10 }} />
        <rect x={x + 26} y={1320 - 245} width={38} height={44} rx={6} fill="#C98448" stroke={INK} strokeWidth={4} />
      </g>
    ))}
    {front()}
    <HostCut pose="walk" x={170} bottom={1640} height={700} t={t} flip />
  </g>
);

// ---------------------------------------------------------------- the day
export const S14: S = ({ t }) => (
  <g>
    <Sky id="m14" mood="cold" sunY={380} />
    <City mood="cold" />
    <Calendar t={t - 2} day="15" month="JAN" year="1919" y={720} />
  </g>
);
export const S15: S = ({ t, len }) => (
  <g>
    <Sky id="m15" mood={t / len < 0.5 ? 'cold' : 'warm'} sunY={380} />
    <City mood={t / len < 0.5 ? 'cold' : 'warm'} />
    <Thermometer t={t - 2} k={easeOut(clamp((t - 10) / (len - 20)))} y={820} />
    <Sfx t={t - 10} text="-17°C" x={260} y={520} rot={-6} size={84} />
    <Sfx t={t - (len - 30)} text="+4°C" x={820} y={420} rot={6} size={96} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Sky id="m16" mood="warm" sunY={380} />
    <City mood="warm" />
    <Clock t={t - 2} h={12} m={38} x={540} y={720} tick={t * 0.06} />
    <Sfx t={t - 10} text="12:40" x={540} y={380} rot={0} size={110} />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Sky id="m17" mood="danger" sunY={260} />
    {/* extreme close on one seam: the rivets fire off one after another */}
    <rect x={-100} y={420} width={W + 200} height={760} fill="#5A3A36" stroke={INK} strokeWidth={8} />
    <path d="M -100 800 L 1180 800" stroke={INK} strokeWidth={10} />
    {Array.from({ length: 7 }, (_, i) => {
      const at = 4 + i * 6;
      const gone = t > at;
      return (
        <g key={i}>
          <circle cx={90 + i * 150} cy={770} r={22} fill={INK} opacity={gone ? 0.15 : 1} />
          {gone ? <circle cx={90 + i * 150 + (t - at) * 30} cy={770 - (t - at) * 18} r={18} fill={INK} /> : null}
          <Sparks x={90 + i * 150} y={770} t={t - at} seed={i} />
        </g>
      );
    })}
    <Sfx t={t - 6} text="POP! POP! POP!" x={540} y={360} size={92} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Sky id="m18" mood="danger" sunY={300} />
    <City mood="danger" />
    <Tank x={540} y={560} s={1.5} t={t} brown={1} burst={easeOut(clamp((t - 44) / 12))} c="#55636F" />
    {t > 46 ? <Molasses id="m18w" top={lerp(1250, 900, clamp((t - 46) / 20))} crest={200} t={t} /> : null}
    <Sfx t={t - 46} text="BOOM!" x={540} y={380} size={140} />
  </g>
);

// ---------------------------------------------------------------- the wave
export const S19: S = ({ t, len }) => (
  <g>
    {harbour('m19', 'brown', t, { tank: false, rail: 0 })}
    <Molasses id="m19w" top={lerp(900, 560, easeOut(clamp(t / len)))} crest={220} t={t} />
    {/* a 7.5 m marker against a house */}
    <g transform={`translate(900 0) scale(1 ${popIn(t - 10)})`} style={{ transformOrigin: '900px 1250px' }}>
      <path d="M 0 560 L 0 1250 M -24 560 L 24 560" stroke="#FFD23F" strokeWidth={10} />
    </g>
    <Punch t={t - 8} lines={['UP TO', '7.5 METRES']} y={330} size={92} color="#FFD23F" />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    {harbour('m20', 'brown', t, { tank: false, rail: 0 })}
    <Molasses id="m20w" top={700} crest={160} t={t * 3} />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${((i * 170 + t * 40) % 1400) - 200} ${620 + i * 70} l -180 0`} stroke="#E8A35A" strokeWidth={6} opacity={0.6} strokeLinecap="round" />)}
    <BigNumber t={t - 14} text="56" sub="KM/H" y={430} />
  </g>
);
export const S21: S = ({ t, len }) => {
  const k = easeOut(clamp(t / len));
  return (
    <g>
      <Sky id="m21" mood="brown" sunY={300} />
      <City mood="brown" />
      <g transform={`translate(540 ${lerp(1000, 900, k)}) rotate(${lerp(0, -16, k)})`}>
        <rect x={-220} y={-340} width={440} height={420} fill="#3A2416" stroke={INK} strokeWidth={8} />
        <path d="M -250 -340 L 0 -520 L 250 -340 Z" fill="#2A180E" stroke={INK} strokeWidth={8} />
        {[[-130, -230], [70, -230], [-130, -80], [70, -80]].map(([x, y], i) => <rect key={i} x={x} y={y} width={60} height={80} fill="#FFD27A" opacity={0.7} />)}
      </g>
      <Molasses id="m21w" top={lerp(1100, 880, k)} crest={60} t={t} />
    </g>
  );
};
export const S22: S = ({ t, len }) => (
  <g>
    <Sky id="m22" mood="brown" sunY={300} />
    <City mood="brown" />
    <ElRail y={760} bend={easeOut(clamp(t / len))} c="#140A06" />
    <Molasses id="m22w" top={1020} crest={80} t={t} />
    <Punch t={t - 20} lines={['STEEL', 'BENT']} y={380} size={96} color="#FF8A3D" />
  </g>
);
export const S23: S = ({ t, len }) => {
  const p = (d: number) => popIn(t - d);
  const third = len / 3;
  return (
    <g>
      <Sky id="m23" mood="brown" sunY={300} />
      <Molasses id="m23w" top={940} crest={60} t={t} />
      {/* a wagon wheel, a horse, a person: one after another, as the words come */}
      <g transform={`translate(260 760) scale(${p(2)}) rotate(${t * 3})`}>
        <circle r={110} fill="none" stroke="#140A06" strokeWidth={20} />
        {[0, 45, 90, 135].map((a) => <rect key={a} x={-6} y={-110} width={12} height={220} fill="#140A06" transform={`rotate(${a})`} />)}
      </g>
      <g transform={`translate(560 820) scale(${p(third)})`} fill="#140A06">
        <ellipse cx={0} cy={0} rx={140} ry={60} />
        <path d="M 110 -20 L 200 -150 L 240 -130 L 170 10 Z" />
        {[-100, -50, 60, 110].map((x) => <rect key={x} x={x - 10} y={30} width={20} height={130} transform={`rotate(${x > 0 ? 20 : -20} ${x} 30)`} />)}
      </g>
      <g transform={`scale(${p(third * 2)})`} style={{ transformOrigin: '820px 900px' }}>
        <Figure x={820} feet={1020} s={0.6} mood="brown" pose={{ armL: { a: 160, b: 10 }, armR: { a: 150, b: 20 }, tilt: 14 }} />
      </g>
    </g>
  );
};
export const S24: S = ({ t }) => (
  <g>
    <Sky id="m24" mood="brown" sunY={340} />
    <City mood="brown" />
    <ElRail y={900} bend={1} c="#140A06" />
    <Molasses id="m24w" top={920} crest={0} t={t * 0.4} />
    {[[200, 980, -30], [520, 1010, 20], [840, 970, 60]].map(([x, y, r], i) => <rect key={i} x={x - 70} y={y - 20} width={140} height={40} fill="#140A06" transform={`rotate(${r + Math.sin(t * 0.05 + i) * 4} ${x} ${y})`} />)}
    <Punch t={t - 6} lines={['IT TOOK', 'EVERYTHING']} y={380} size={86} />
  </g>
);

// ---------------------------------------------------------------- the worst part
export const S25: S = ({ t }) => (
  <g>
    <Sky id="m25" mood="danger" sunY={340} />
    <City mood="danger" />
    <HostCut pose="angry" x={540} bottom={1520} height={900} t={t} />
    <Punch t={t - 4} lines={['THE WORST', 'PART']} y={330} size={90} color="#FF8A3D" />
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Sky id="m26" mood="cold" sunY={300} />
    <Molasses id="m26w" top={720} crest={40} t={t * 0.15} />
    {/* frost creeping over the surface: it sets like glue */}
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${i * 80} ${740 + (i % 3) * 30} l 30 -20 l 30 20`} stroke="#CFEFFF" strokeWidth={5} fill="none" opacity={clamp((t - i * 3) / 10) * 0.8} />)}
    <Punch t={t - 30} lines={['THICK', 'AS GLUE']} y={400} size={110} color="#9FE3FF" />
  </g>
);
export const S27: S = ({ t, len }) => {
  const sink = easeOut(clamp(t / len)) * 160;
  return (
    <g>
      <Sky id="m27" mood="cold" sunY={300} />
      <City mood="cold" />
      <defs><clipPath id="m27c"><rect x={-100} y={-100} width={W + 200} height={960} /></clipPath></defs>
      <g clipPath="url(#m27c)">
        <Figure x={540} feet={960 + sink} s={0.95} mood="cold" pose={{ armL: { a: 150 + Math.sin(t * 0.5) * 15, b: 20 }, armR: { a: 150 - Math.sin(t * 0.5) * 15, b: 20 } }} />
      </g>
      <Molasses id="m27w" top={860} crest={0} t={t * 0.1} />
    </g>
  );
};
export const S28: S = ({ t }) => (
  <g>
    {harbour('m28', 'night', t, { tank: false })}
    <Molasses id="m28w" top={1130} t={t * 0.1} />
    {/* rescuers wading in with a rope */}
    <path d={`M 120 1000 Q 540 ${1060 + Math.sin(t * 0.2) * 20} 960 1000`} stroke="#E8DCC8" strokeWidth={6} fill="none" />
    {[200, 420, 660, 880].map((x, i) => <Figure key={x} x={x} feet={1240} s={0.72} mood="night" pose={{ yaw: i < 2 ? 0.6 : -0.6, armR: { a: 80 + Math.sin(t * 0.3 + i) * 15, b: 40 }, armL: { a: 70, b: 50 } }} />)}
    {front()}
  </g>
);
export const S29: S = ({ t }) => (
  <g>
    <Sky id="m29" mood="night" moon sunX={780} sunY={360} />
    <City mood="night" />
    <Street mood="night" y={1300} />
    {Array.from({ length: 7 }, (_, i) => (
      <g key={i} opacity={clamp((t - 10 - i * 3) / 6)}>
        <rect x={190 + i * 110} y={1180} width={20} height={70} fill="#E8DCC8" />
        <ellipse cx={200 + i * 110} cy={1172} rx={9} ry={16} fill="#FFD27A" />
        <Glow x={200 + i * 110} y={1170} r={60} kind="warm" o={0.7} />
      </g>
    ))}
    <BigNumber t={t - 2} text="21" sub="DEAD · 150 HURT" y={720} color="#FFFFFF" />
  </g>
);

// ---------------------------------------------------------------- the clean-up and the court
export const S30: S = ({ t }) => (
  <g>
    {harbour('m30', 'night', t, { tank: false, rail: 1 })}
    <Molasses id="m30w" top={1250} t={t * 0.1} />
    {[200, 420, 660, 880].map((x, i) => <Figure key={x} x={x} feet={1280} s={0.66} mood="night" pose={{ yaw: 0.5, tilt: 18 + Math.sin(t * 0.3 + i) * 10, armL: { a: 60, b: 40 }, armR: { a: 50, b: 50 } }} />)}
    <Punch t={t - 10} lines={['WEEKS OF', 'CLEAN-UP']} y={380} size={88} />
    {front()}
  </g>
);
export const S31: S = ({ t }) => (
  <g>
    <Sky id="m31" mood="warm" sunY={420} />
    <City mood="warm" />
    <rect x={-300} y={1080} width={W + 600} height={H} fill="#4A2810" />
    {/* the fireboat and its water arcs */}
    <path d="M 120 1150 L 560 1150 L 520 1240 L 160 1240 Z" fill={INK} />
    <rect x={260} y={1060} width={140} height={90} fill={INK} />
    {[0, 1, 2].map((i) => <path key={i} d={`M 380 1060 Q ${620 + i * 80} ${700 - i * 60} ${900 + i * 50} ${1120}`} stroke="#BFE6FF" strokeWidth={10 - i * 2} fill="none" strokeDasharray="30 20" strokeDashoffset={-t * 6} opacity={0.85} />)}
    <Punch t={t - 40} lines={['BROWN UNTIL', 'SUMMER']} y={360} size={86} color="#C98448" />
  </g>
);
export const S32: S = ({ t }) => (
  <g>
    <Sky id="m32" mood="night" sunY={300} />
    <g transform={`translate(540 760) rotate(${-6 + Math.sin(t * 0.05) * 2}) scale(${popIn(t) * 1.15})`}>
      <rect x={-330} y={-420} width={660} height={800} fill="#F2E9D8" stroke={INK} strokeWidth={8} />
      <text y={-330} textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={56} fill={INK}>THE BOSTON NEWS</text>
      <path d="M -300 -300 L 300 -300" stroke={INK} strokeWidth={6} />
      <text y={-170} textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={84} fill="#B8322A">ANARCHISTS?</text>
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-300} y={-80 + i * 60} width={i % 2 ? 520 : 600} height={18} fill="#8A8072" />)}
      {/* a cartoon bomb */}
      <circle cx={170} cy={250} r={70} fill={INK} />
      <path d="M 210 190 q 30 -40 60 -30" stroke={INK} strokeWidth={10} fill="none" />
    </g>
  </g>
);
export const S33: S = ({ t }) => {
  const slam = clamp((t - 30) / 5);
  return (
    <g>
      <Sky id="m33" mood="warm" sunY={340} />
      {/* the courtroom: a judge's bench, the crowd behind */}
      <rect x={140} y={900} width={800} height={340} fill="#4A2A18" stroke={INK} strokeWidth={8} />
      <Figure x={500} feet={1020} s={1.25} mood="warm" pose={{ yaw: 0.3, armR: { a: lerp(150, 70, slam), b: 20 } }} />
      <g transform={`translate(${640} ${lerp(600, 800, slam)}) rotate(${lerp(-40, 0, slam)})`}>
        <rect x={-60} y={-30} width={120} height={60} rx={10} fill="#8A5A30" stroke={INK} strokeWidth={6} />
        <rect x={-10} y={30} width={20} height={120} fill="#8A5A30" stroke={INK} strokeWidth={5} />
      </g>
      <Sfx t={t - 34} text="BANG!" x={800} y={700} size={90} />
      <HostCut pose="arms_crossed" x={880} bottom={1640} height={720} t={t} />
      <Punch t={t - 40} lines={['TOO THIN.', 'NEVER TESTED.']} y={360} size={80} color="#FFD23F" />
    </g>
  );
};
export const S34: S = ({ t }) => (
  <g>
    <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#123A6A" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${i * 40} -100 L ${i * 40} ${H + 100} M -100 ${i * 70} L ${W + 100} ${i * 70}`} stroke="#2A5A8E" strokeWidth={2} />)}
    {/* a tank drawn as a blueprint, then the engineer's stamp */}
    <g stroke="#DCEBFF" strokeWidth={6} fill="none" opacity={clamp(t / 10)}>
      <rect x={340} y={520} width={400} height={520} />
      <path d="M 330 520 L 540 440 L 750 520" />
      <path d="M 300 520 L 300 1040 M 280 520 L 320 520 M 280 1040 L 320 1040" />
    </g>
    <g transform={`translate(760 1000) rotate(-14) scale(${popIn(t - 24) * 1.2})`}>
      <rect x={-170} y={-60} width={340} height={120} rx={14} fill="none" stroke="#FF5A4A" strokeWidth={10} />
      <text y={22} textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={62} fill="#FF5A4A">APPROVED</text>
    </g>
    <Punch t={t - 6} lines={['ENGINEERS', 'MUST SIGN']} y={340} size={84} />
  </g>
);
export const S35: S = ({ t }) => (
  <g>
    <Sky id="m35" mood="noon" sunY={380} />
    <City mood="noon" />
    <g transform={`translate(540 780) scale(${popIn(t - 4) * 1.3})`}>
      <path d="M 0 -200 L 170 -130 L 150 60 Q 100 170 0 220 Q -100 170 -150 60 L -170 -130 Z" fill="#3FA9F5" stroke={INK} strokeWidth={10} />
      <path d="M -70 0 L -15 60 L 85 -60" stroke="#FFFFFF" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <Punch t={t - 10} lines={['STILL SAFER', 'TODAY']} y={360} size={86} />
  </g>
);

// ---------------------------------------------------------------- the turn and the end
export const S36: S = ({ t }) => (
  <g>
    <Sky id="m36" mood="brown" sunY={340} />
    <City mood="brown" />
    <HostCut pose="bust" x={540} bottom={1700} height={1180} t={t} />
    <Punch t={t - 30} lines={['21 DROWNED', 'IN SYRUP']} y={330} size={84} color="#FFD23F" />
  </g>
);
export const S37: S = ({ t }) => (
  <g>
    {harbour('m37', 'warm', t, { rail: 0 })}
    {/* he holds up a jar of molasses */}
    <HostCut pose="rock" x={540} bottom={1640} height={980} t={t} />
    <Punch t={t - 6} lines={['"SLOW AS', 'MOLASSES"?']} y={330} size={84} color="#C98448" />
  </g>
);
export const S38: S = ({ t }) => (
  <g>
    <Sky id="m38" mood="night" moon sunX={800} sunY={380} />
    <City mood="night" />
    <Street mood="night" />
    <HostCut pose="arms_crossed" x={540} bottom={1640} height={1000} t={t} />
    <Punch t={t - 4} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={330} size={76} color="#C9A2FF" />
  </g>
);

// ---------------------------------------------------------------- the faster cut: "wide, then close" and reactions
// The references cut from a wide view to a close one in the same place. A close variant renders its parent shot
// pushed in on (cx, cy), with the parent's clock carried on by `from` frames so the action doesn't restart.
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S39 = close(S3, 560, 800, 1.6, 50);    // "rips through the harbour": on the sparks
export const S40 = close(S4, 540, 900, 1.5, 60);    // "as tall as a house": the crest over the crowd
export const S41 = close(S8, 540, 760, 1.5, 40);    // "giant steel tank"
export const S42 = close(S8, 880, 760, 1.8, 90);    // "fifteen metres": the ruler
export const S43 = close(S12, 880, 760, 1.7, 80);   // "painted it brown": the painter
export const S44 = close(S13, 540, 1100, 1.6, 50);  // "cups and buckets"
export const S45 = close(S15, 540, 700, 1.4, 70);   // "turned warm": the thermometer
export const S46 = close(S17, 540, 780, 1.6, 40);   // "like gunshots"
export const S47 = close(S19, 700, 900, 1.5, 60);   // "seven and a half metres"
export const S48 = close(S20, 540, 600, 1.4, 50);   // "fifty-five kilometres an hour"
export const S49 = close(S26, 540, 760, 1.6, 60);   // "like glue": the frost on the surface
export const S50 = close(S27, 540, 820, 1.7, 70);   // "the deeper they sank"
export const S51 = close(S28, 540, 1050, 1.6, 70);  // "pull people out"
export const S52 = close(S33, 640, 800, 1.6, 40);   // "too thin": the gavel
export const S53 = close(S34, 760, 1000, 1.6, 40);  // "designs": the stamp
export const S54 = close(S37, 690, 880, 1.8, 60);   // "tell them about Boston": the jar

/** Nea Costel reacting, cut in like the references' host inserts. */
const react = (mood: Mood, face: 'shock' | 'worried' | 'smug' | 'oops', pose: Partial<import('../../engine').Pose>, words?: string[]): S => ({ t }) => (
  <g>
    <Sky id={`r${mood}${face}`} mood={mood} sunY={360} />
    <City mood={mood} />
    <HostCut pose={face === 'shock' ? 'yell' : face === 'smug' ? 'smug' : face === 'worried' ? 'confused' : 'angry'} x={540} bottom={1500} height={face === 'shock' ? 760 : 820} t={t} />
    {words ? <Punch t={t - 4} lines={words} y={330} size={84} color="#FFD23F" /> : null}
  </g>
);
export const S55 = react('brown', 'shock', { armL: { a: 150, b: 120 }, armR: { a: 150, b: 120 } }, ['8.7 MILLION', 'LITRES!']);
export const S56 = react('noon', 'smug', { yaw: 0.3, eyes: 0.8 } as any);
export const S57 = react('danger', 'shock', { armL: { a: 60, b: 40 }, armR: { a: 60, b: 40 }, yaw: -0.2 });
export const S58 = react('cold', 'worried', { headTilt: 10 });
