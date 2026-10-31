import React from 'react';
import {
  Hero, HERO, LOOKS, Pose, basePose, poseAt, faceAt, kf, clamp, lerp, easeOut, easeIn, backOut, settle, camT, joints, toWorld, reachAngle,
  LEG_LEN, HEAD, Study, Desk, Classroom, SchoolDesk, Kid, Kitchen, KitchenIsland, KITCHEN, stand, Rooftop, Schematic, SCH, SchLabel, DrawOn,
  Tabletop, Phone, PaperBall, Foreground, Glow, LightVeil, TitleCard, Dial, Sparkle, FocusRings, ShotProps,
} from '../../engine';

// "What if you could pause time, but only while you hold your breath?" Sixteen shots on four sets (study,
// classroom, kitchen, rooftop) and the schematic. The power: the world freezes (its clock stops, the picture goes
// cold and grey, a PAUSED chip and a breath dial come up) while Juno keeps moving. Each shot is a pure function of t.
// In paused shots the set gets a fixed clock, so dust, sways and kids hold perfectly still.

const JUNO = HERO;
const MO = LOOKS.mo;
const ICE = '#BFE3FF';

/** Rings rippling out from a frozen object: the "paused" mark. */
const Frozen: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 60 }) => (
  <g>
    {[0, 1].map((k) => {
      const p = ((t + k * 12) % 24) / 24;
      return <circle key={k} cx={x} cy={y} r={r * (0.8 + p * 0.9)} fill="none" stroke={ICE} strokeWidth={4} opacity={0.55 * (1 - p)} />;
    })}
  </g>
);

/** A phone lying on the desk, seen from the front: a thin dark slab with a lit edge. */
const PhoneSide: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.8)`}>
    <rect x={-42} y={-12} width={84} height={12} rx={4} fill="#1A1A22" stroke="#0A0A10" strokeWidth={2} />
    <rect x={-38} y={-12} width={76} height={3} fill="#7FD4FF" opacity={0.9} />
    <ellipse cx={0} cy={-14} rx={70} ry={26} fill="#7FD4FF" opacity={0.28} />
  </g>
);

// ---------- S1: wide, the study: Juno's elbow knocks the phone off the desk ----------
export const S1: React.FC<ShotProps> = ({ t }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 712, yaw: 0.45, look: 0.4, armR: { a: 30, b: 60 }, armL: { a: 14, b: -6 } } },
    { f: 5, p: { armR: { a: 62, b: 30 }, tilt: 4 }, ease: easeOut },
    { f: 12, p: { armR: { a: 50, b: 20 }, tilt: 2, look: 1 } },
  ]);
  const slide = easeIn(clamp((t - 4) / 12));
  const px = lerp(1250, 1385, slide);
  const prot = slide > 0.75 ? (slide - 0.75) * 4 * 50 : 0;
  return (
    <g transform={camT(990, 545, kf(t, [[0, 0.88], [18, 0.93]]))}>
      <Study t={t} id="ps1" veil={0.28} />
      <Hero look={JUNO} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [12, 'shock']]) }} shadow={0} rimId="rimR" />
      <Desk x0={560} x1={1360} y={700} />
      <PhoneSide x={px} y={700 + Math.max(0, slide - 0.8) * 120} rot={prot} />
      <Foreground blur={10}>
        <path d="M -140 1220 L -140 860 Q -128 786 -30 786 L 236 786 Q 322 786 334 862 L 344 1220 Z" fill="#140F1A" />
        <path d="M 1640 1200 Q 1540 900 1600 700 Q 1660 900 1760 1180 Z" fill="#0E1610" />
      </Foreground>
    </g>
  );
};

// ---------- S2: macro insert, high angle over the desk edge: the phone tips and falls away ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const k = clamp(t / len);
  const x = lerp(900, 1060, k);
  const y = lerp(470, 900, easeIn(k));
  const rot = lerp(8, 70, easeIn(k));
  const s = lerp(1, 0.78, easeIn(k));
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <Tabletop edge={700} />
      <Glow x={760} y={300} r={700} o={0.3} />
      <rect x={300} y={240} width={300} height={40} fill="#D9C8A8" transform="rotate(-10 450 260)" />
      <rect x={1380} y={300} width={110} height={110} fill="#9BD3A8" transform="rotate(8 1435 355)" />
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
        <Phone x={0} y={0} w={200} on={1} caller="MO" />
      </g>
    </g>
  );
};

// ---------- S3: medium, PAUSED: the phone hangs mid-air; Juno plucks it out of the frozen world ----------
const S3_PHONE = { x: 1395, y: 780 };
const S3_KEYS = [
  { f: 0, p: { x: 960, y: 712, yaw: 0.45, look: 1, armL: { a: 14, b: -6 }, armR: { a: 30, b: 40 } } },
  { f: 6, p: {} },
  { f: 10, p: { x: 1010, tilt: 10, sway: 8 } },
  { f: 16, p: { x: 1060, tilt: 22, sway: 12 }, ease: easeOut },
  { f: 30, p: { x: 1000, tilt: 0, yaw: 0.3, look: 0.3 } },
];
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const body = poseAt(t, S3_KEYS);
  const reach = reachAngle(body, S3_PHONE);
  const grab = t >= 18;
  let armR = { a: lerp(30, reach, easeOut(clamp((t - 8) / 9))), b: lerp(40, 0, clamp((t - 8) / 9)) };
  if (t >= 18) {
    const k = easeOut(clamp((t - 18) / 12));
    armR = { a: lerp(reach, 70, k), b: lerp(0, 70, k) };
  }
  const pose = { ...body, armR };
  const hand = toWorld(pose, joints(pose).armR.end);
  const phone = grab ? { x: hand.x + 4, y: hand.y + 6, rot: lerp(38, 10, clamp((t - 18) / 10)) } : { x: S3_PHONE.x, y: S3_PHONE.y, rot: 38 };
  return (
    <g transform={camT(kf(t, [[0, 1080], [len, 1060]]), 600, kf(t, [[0, 1.75], [len, 1.85]]))}>
      {/* the world's clock is stopped: the study draws at one fixed moment */}
      <Study t={80} id="ps3" />
      <Hero look={JUNO} pose={{ ...pose, ...faceAt(t, [[0, 'shock'], [8, 'neutral'], [22, 'smug']]) }} shadow={0} rimId="rimR" />
      <Desk x0={520} x1={1360} y={700} lamp={false} />
      {!grab ? <Frozen x={phone.x} y={phone.y} t={t} r={70} /> : null}
      <g transform={`translate(${phone.x} ${phone.y}) rotate(${phone.rot}) scale(0.32)`}>
        <Phone x={0} y={0} w={200} on={1} caller="MO" />
      </g>
      <Foreground blur={10}>
        <path d="M 1640 900 Q 1520 700 1560 520 Q 1600 700 1700 880 Z" fill="#0E1610" />
      </Foreground>
    </g>
  );
};

// ---------- S4: close-up, PLAY: smug, phone held up ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 2.9 * (1 + 0.03 * clamp(t / len));
  const head = { x: 900, y: 430 };
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.25, look: 0.5, armL: { a: 14, b: -6 }, armR: { a: 40, b: 105 }, tilt: -2, ...faceAt(t, [[0, 'smug']]) };
  const hand = toWorld(pose, joints(pose).armR.end);
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-700 -420) scale(1.9)">
          <Study t={95 + t} id="ps4" />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.22} />
      <Hero look={JUNO} pose={pose} shadow={0} rimId="rimR" />
      <g transform={`translate(${hand.x + 10} ${hand.y - 60}) rotate(-8) scale(1.1)`}>
        <Phone x={0} y={0} w={200} on={1} caller="MO" />
      </g>
      <Sparkle x={hand.x + 160} y={hand.y - 260} t={t + 2} s={1.6} />
    </g>
  );
};

// ---------- S5: over the shoulder, the classroom: a paper ball flies at Juno's face ----------
const JUNO_DESK = { x: 1260, y: 760 };
const ballPath = (t: number) => {
  const k = clamp((t - 20) / 44);
  return { x: lerp(620, 1230, k), y: lerp(760, 560, k) - Math.sin(k * Math.PI) * 120, r: lerp(26, 46, k), rot: t * 18 };
};
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const b = ballPath(t);
  const pose = poseAt(t, [
    { f: 0, p: { ...JUNO_DESK, yaw: -0.35, look: -0.4, armL: { a: 10, b: -8 }, armR: { a: 14, b: -6 } } },
    { f: 40, p: { look: -1 } },
    { f: 52, p: { tilt: 6, headTilt: 6 }, ease: easeOut },
  ]);
  const throwArm = kf(t, [[0, 40], [14, 150], [20, 60]]);
  return (
    <g transform={camT(kf(t, [[0, 1010], [len, 1050]]), kf(t, [[0, 540], [len, 525]]), kf(t, [[0, 1.65], [len, 1.8]]))}>
      <Classroom t={t + 240} id="pcl5" />
      <Hero look={JUNO} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [42, 'shock']]) }} shadow={0} rimId="rimL" />
      <SchoolDesk x={1260} />
      {t >= 20 ? <PaperBall x={b.x} y={b.y} r={b.r} rot={b.rot} /> : null}
      <Foreground blur={16}>
        <Kid x={653} y={1027} s={2.9} look={{ hair: 'short', hairC: '#120E18', top: '#1E1A28' }} t={t} />
        <path d={`M 760 860 Q ${760 + Math.sin((throwArm * Math.PI) / 180) * 120} ${860 - Math.cos((throwArm * Math.PI) / 180) * -40} ${760 + Math.sin((throwArm * Math.PI) / 180) * 260} ${860 - Math.cos((throwArm * Math.PI) / 180) * 220}`} stroke="#1E1A28" strokeWidth={70} fill="none" strokeLinecap="round" />
      </Foreground>
    </g>
  );
};

// ---------- S6: wide, PAUSED: the ball hangs in the air; Juno steps aside ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const step = easeOut(clamp((t - 10) / 16));
  const lift = Math.sin(clamp((t - 10) / 16) * Math.PI);
  const pose = poseAt(t, [
    { f: 0, p: { ...JUNO_DESK, yaw: -0.35, look: -1, tilt: 6, headTilt: 6, armL: { a: 10, b: -8 }, armR: { a: 14, b: -6 } } },
    { f: 8, p: { tilt: 0, headTilt: 0, look: 0 } },
    { f: 26, p: { yaw: 0.2, look: -0.6 } },
  ]);
  const x = lerp(JUNO_DESK.x, JUNO_DESK.x + 150, step);
  const ball = { x: 1180, y: 590 };
  return (
    <g transform={camT(kf(t, [[0, 1010], [len, 1030]]), 520, kf(t, [[0, 1.2], [len, 1.25]]))}>
      <Classroom t={300} id="pcl6" />
      <SchoolDesk x={1260} />
      <Hero look={JUNO} pose={{ ...pose, x, legL: { a: 20 * lift, b: -30 * lift }, legR: { a: -10 * lift, b: 0 }, ...faceAt(t, [[0, 'shock'], [10, 'smug']]) }} shadow={0.5} rimId="rimL" />
      <Frozen x={ball.x} y={ball.y} t={t} r={50} />
      <PaperBall x={ball.x} y={ball.y} r={40} rot={220} />
      <Foreground blur={16}>
        <Kid x={520} y={1080} s={2.4} look={{ hair: 'short', hairC: '#120E18', top: '#1E1A28' }} t={0} />
      </Foreground>
    </g>
  );
};

// ---------- S7: medium, PLAY: the ball whizzes past her ear; she doesn't flinch ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const bx = lerp(700, 1900, clamp(t / 8));
  const pose: Pose = { ...basePose, x: 1050, y: 760, scale: 1.25, yaw: 0.2, look: 0.6, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...faceAt(t, [[0, 'cool']]) };
  return (
    <g transform={camT(1000, 470, kf(t, [[0, 1.9], [len, 1.95]]))}>
      <g filter="url(#blur6)">
        <Classroom t={330 + t} id="pcl7" />
      </g>
      <Hero look={JUNO} pose={pose} shadow={0} rimId="rimL" />
      {t < 9 ? (
        <g>
          {[0, 1, 2].map((i) => <path key={i} d={`M ${bx - 60 - i * 40} ${430 + i * 14} L ${bx - 200 - i * 60} ${430 + i * 14}`} stroke="#F6EFE3" strokeWidth={5} opacity={0.6 - i * 0.15} strokeLinecap="round" />)}
          <PaperBall x={bx} y={440} r={30} rot={t * 40} />
        </g>
      ) : null}
    </g>
  );
};

// ---------- S8: medium two-shot, the kitchen: Mo mid-laugh, Juno beside him ----------
const MO_STAND = stand(KITCHEN, 0.58, 0.4);
const JU_STAND = stand(KITCHEN, 0.38, 0.4);
const moLaugh = (t: number): Pose => ({
  ...basePose, x: MO_STAND.x, y: MO_STAND.y, scale: MO_STAND.scale, yaw: -0.35, look: -0.6,
  tilt: -6 + Math.sin(t / 2.2) * 3, headTilt: -10 + Math.sin(t / 2.2) * 5, squash: Math.abs(Math.sin(t / 2.2)) * 0.03,
  armL: { a: 30, b: 70 }, armR: { a: 20 + Math.sin(t / 2.2) * 6, b: 90 }, expr: 'laugh',
});
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 975]]), 590, kf(t, [[0, 1.8], [len, 1.88]]))}>
    <Kitchen t={t + 40} id="pk8" />
    <Hero look={JUNO} pose={{ ...basePose, x: JU_STAND.x, y: JU_STAND.y, scale: JU_STAND.scale, yaw: 0.35, look: 0.6, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...faceAt(t, [[0, 'happy']]) }} shadow={0} rimId="rimR" />
    <Hero look={MO} pose={moLaugh(t)} shadow={0} rimId="rimL" />
    <KitchenIsland />
    <Foreground blur={10}>
      <path d="M 1260 1000 Q 1300 760 1420 700 Q 1380 820 1400 1000 Z" fill="#0E1610" />
    </Foreground>
  </g>
);

// ---------- S9: close-up, PAUSED: Mo frozen mid-laugh; Juno waves a hand in front of his face ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 3.3;
  const head = { x: 1060, y: 520 };
  const frozen = moLaugh(57);
  const mo: Pose = { ...frozen, x: head.x, y: head.y - HEAD.y * sc, scale: sc, blink: 0 };
  const wave = Math.sin(t / 2.4) * 120;
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-820 -560) scale(2)">
          <Kitchen t={97} id="pk9" />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.2} />
      <Hero look={MO} pose={mo} shadow={0} rimId="rimL" />
      <Frozen x={head.x} y={head.y - 40} t={t} r={260} />
      {/* Juno's arm from the left edge, the mitten waving in front of his eyes */}
      <g filter="url(#rimR)">
        <path d={`M -100 900 Q 300 760 ${640 + wave} ${520}`} stroke={JUNO.line} strokeWidth={118} fill="none" strokeLinecap="round" />
        <path d={`M -100 900 Q 300 760 ${640 + wave} ${520}`} stroke={JUNO.jacket} strokeWidth={100} fill="none" strokeLinecap="round" />
        <g transform={`translate(${700 + wave} ${470}) rotate(-70) scale(4.4)`}>
          <ellipse cx={-10} cy={3} rx={5.5} ry={9} transform="rotate(28 -10 3)" fill={JUNO.hand} stroke={JUNO.line} strokeWidth={2.4} />
          <ellipse cx={0} cy={10} rx={11} ry={15} fill={JUNO.hand} stroke={JUNO.line} strokeWidth={2.4} />
        </g>
      </g>
    </g>
  );
};

// ---------- S10: extreme close-up, PAUSED: Mo's frozen face fills the frame, not even blinking ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 7.4 * (1 + 0.05 * clamp(t / len));
  const head = { x: 960, y: 610 };
  const mo: Pose = { ...moLaugh(57), x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: -0.12, look: 0, tilt: 0, headTilt: -4, blink: 0 };
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-700 -500) scale(2.2)">
          <Kitchen t={97} id="pk10" />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.25} />
      <Hero look={MO} pose={mo} shadow={0} rimId="rimL" />
    </g>
  );
};

// ---------- S11: the title, wide on the roof at dusk: the sun-clock's hands stop ----------
const ROOF_FEET = 820;
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const spin = t < 26 ? t * 6 : 156;
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: ROOF_FEET - LEG_LEN * 0.62, scale: 0.62, yaw: 0, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 24, p: {} },
    { f: 30, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 1.0], [len, 1.06]]))}>
      <Rooftop clock t={t < 26 ? t : 26} sunY={650} spin={spin} />
      <Hero look={JUNO} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} shadow={0.6} rimId="rimR" />
      <TitleCard t={t} lines={['WHAT IF YOU COULD', 'PAUSE TIME?']} accent="PAUSE" accentT={26} />
    </g>
  );
};

// ---------- S12: low angle, medium: Juno takes a big breath and holds it; the breath dial starts draining ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 790, scale: 1.8, yaw: 0.15, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 8, p: { squash: -0.04, armL: { a: 34, b: 14 }, armR: { a: 34, b: 14 }, headTilt: -6 }, ease: easeOut },
    { f: 16, p: { squash: 0, armL: { a: 22, b: 30 }, armR: { a: 22, b: 30 }, headTilt: 0 } },
  ]);
  const drain = clamp((t - 16) / (len - 16));
  const secs = 60 - drain * 6;
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <Rooftop clock t={26} sunX={1080} sunY={520} spin={156} low={260} />
      <Hero look={JUNO} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [14, 'puff']]) }} shadow={0} rimId="rimR" />
      {t > 14 ? <Dial x={1500} y={330} r={110} p={1 - drain * 0.1} readout={`0:${String(Math.floor(secs)).padStart(2, '0')}`} size={44} /> : null}
      {t > 14 ? <SchLabel x={1500} y={490} t={t - 14} text="BREATH" size={30} color="#F6EFE3" /> : null}
    </g>
  );
};

// ---------- S13: schematic: most people, about one minute ----------
const LUNGS = 'M 470 300 Q 400 300 360 420 Q 330 540 360 600 Q 400 640 460 600 Q 490 560 490 420 Z M 530 300 Q 600 300 640 420 Q 670 540 640 600 Q 600 640 540 600 Q 510 560 510 420 Z M 500 220 L 500 330';
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const k = easeOut(clamp((t - 8) / 30));
  const secs = Math.round(60 * k);
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t} id="psch13" />
      <DrawOn d={LUNGS} t={t} dur={12} width={7} />
      <SchLabel x={500} y={760} t={t - 6} text="MOST PEOPLE" size={52} />
      <Dial x={1300} y={480} r={200} p={k} readout={`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`} size={96} />
      <SchLabel x={1300} y={780} t={t - 20} text="ABOUT 1 MINUTE" size={44} color={SCH.live} />
    </g>
  );
};

// ---------- S14: schematic: the world record, on pure oxygen, counting up to 29:03 ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const k = easeIn(clamp((t - 10) / 70)) ** 0.7;
  const total = Math.round(k * (29 * 60 + 3));
  const read = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  const barMax = 1300;
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t + 55} id="psch14" />
      <SchLabel x={960} y={170} t={t - 2} text="WORLD RECORD · PURE OXYGEN" size={56} />
      <text x={960} y={470} textAnchor="middle" fontFamily="Fragment Mono" fontSize={230} fill={SCH.live} style={{ filter: `drop-shadow(0 0 18px ${SCH.glow})` }}>{read}</text>
      {/* the comparison: one minute is a sliver of the record's bar */}
      <g transform="translate(310 620)">
        <SchLabel x={0} y={-20} t={t - 14} text="YOU · 1:00" size={30} color={SCH.dim} anchor="start" />
        <rect x={0} y={0} width={barMax / 29.05} height={44} fill={SCH.line} opacity={t > 14 ? 0.9 : 0} />
        <SchLabel x={0} y={150} t={t - 18} text="RECORD · 29:03" size={30} color={SCH.dim} anchor="start" />
        <rect x={0} y={170} width={barMax * k} height={44} fill={SCH.live} />
      </g>
      <SchLabel x={960} y={1000} t={t - 85} text="VITOMIR MARIČIĆ · CROATIA · 2025" size={30} color={SCH.dim} />
    </g>
  );
};

// ---------- S15: extreme close-up: "That's real." Juno, shocked; the sky starting to turn ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 6.4 * (1 + 0.05 * clamp(t / len));
  const head = { x: 960, y: 700 };
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.1, look: 0, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...faceAt(t, [[0, 'shock']]) };
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)">
          <Rooftop t={t + 200} sunX={980} sunY={600} red={0.25} low={180} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.22} />
      <Hero look={JUNO} pose={pose} rimId="rimR" shadow={0} />
    </g>
  );
};

// ---------- S16: low angle, slow push in: red sky; Juno holds her breath, the dial nearly empty ----------
export const S16: React.FC<ShotProps> = ({ t, len }) => {
  const red = easeOut(clamp(t / 14));
  const drain = clamp(t / len);
  const secs = 9 - drain * 6;
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 800, scale: 1.9, yaw: -0.15, look: 0.4, armL: { a: 22, b: 30 }, armR: { a: 22, b: 30 } } },
    { f: 40, p: { look: 0.9, headTilt: 4 } },
    { f: len, p: { look: 0.2, headTilt: -2 } },
  ]);
  const shiver = Math.sin(t * 2.3) * 2 * drain;
  return (
    <g transform={camT(kf(t, [[0, 940], [len, 910]]), kf(t, [[0, 540], [len, 470]]), kf(t, [[0, 1.0], [len, 1.3]]))}>
      <Rooftop clock t={26} sunX={1180} sunY={470} spin={156} red={red} lightsOut={clamp((t - 20) / 30)} low={260} />
      <Hero look={JUNO} pose={{ ...pose, x: pose.x + shiver, ...faceAt(t, [[0, 'puff'], [44, 'worried']]) }} shadow={0} rimId={red > 0.5 ? 'rimRed' : 'rimR'} />
      <g transform={`translate(1480 330) scale(${1 + 0.06 * Math.sin(t / 2)})`}>
        <Dial x={0} y={0} r={110} p={0.1 - drain * 0.08} readout={`0:${String(Math.max(0, Math.floor(secs))).padStart(2, '0')}`} size={44} />
      </g>
      <SchLabel x={1480} y={490} t={t} text="BREATH" size={30} color="#FF8A7A" />
    </g>
  );
};
