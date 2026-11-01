import React, { useContext } from 'react';
import {
  Hero, HERO, LOOKS, Look, Pose, Expr, basePose, poseAt, faceAt, walkPose, kf, clamp, lerp, camT, HEAD, LEG_LEN,
  Study, Desk, Classroom, Kitchen, KitchenIsland, Bedroom, Rooftop, Schematic, Outdoor, Foreground, ShotProps, VerticalCtx,
} from '../../engine';

// Building blocks for the long episode: most shots are a scene (a set, a camera, some actors), a close-up (one face
// over a soft background) or a card (the schematic with labels). Everything is a pure function of the shot clock t.

export const JUNO = HERO;
export const MO = LOOKS.mo;
export const SIS = LOOKS.sis;
export const MUM = LOOKS.mom;
export const SUIT = LOOKS.suit;
export const TEACHER = LOOKS.nova; // Nova, the spare design, works as the teacher
export const ICE = '#BFE3FF';

type Key = { f: number; p: Partial<Pose>; ease?: (x: number) => number };

/** One character in a scene: standing (keys/pose), or walking between two x positions. Feet land on `feet`. */
export type Act = {
  look: Look;
  x: number;
  feet: number;
  scale?: number;
  pose?: Partial<Pose>;
  keys?: Key[];
  face?: [number, Expr][];
  walk?: { to: number; t0?: number; t1: number; speed?: number };
  rim?: string;
  freeze?: number; // draw the character at this fixed clock (frozen in a paused world)
  shadow?: number;
};

export const actor = (a: Act, tIn: number, key: string | number) => {
  const t = a.freeze !== undefined ? a.freeze : tIn;
  const sc = a.scale ?? 1;
  const y = a.feet - LEG_LEN * sc;
  let pose: Pose;
  if (a.walk) {
    const k = clamp((t - (a.walk.t0 ?? 0)) / (a.walk.t1 - (a.walk.t0 ?? 0)));
    const x = lerp(a.x, a.walk.to, k);
    const facing: 1 | -1 = a.walk.to >= a.x ? 1 : -1;
    const moving = k > 0 && k < 1;
    pose = moving
      ? walkPose(x, t * 0.6 * (a.walk.speed ?? 1), a.feet, sc, { ...(a.pose ?? {}) }, facing)
      : { ...basePose, x, y, scale: sc, yaw: facing * 0.6, ...(a.pose ?? {}) };
  } else {
    pose = poseAt(t, [{ f: 0, p: { x: a.x, y, scale: sc, ...(a.pose ?? {}) } }, ...(a.keys ?? [])]);
  }
  const face = a.face ? faceAt(t, a.face) : {};
  return <Hero key={key} look={a.look} pose={{ ...pose, ...face }} rimId={a.rim ?? 'rimR'} shadow={a.shadow ?? 0.5} />;
};

/** A scene: a set, a camera (start → end), actors, things behind / in front of them, and a foreground. */
export const scene = (o: {
  set: (t: number) => React.ReactNode;
  cam: [number, number, number] | [number, number, number, number, number, number];
  actors?: Act[] | ((t: number) => Act[]);
  under?: (t: number, len: number) => React.ReactNode;
  over?: (t: number, len: number) => React.ReactNode;
  fg?: React.ReactNode;
}): React.FC<ShotProps> =>
  ({ t, len }) => {
    const [cx, cy, z] = o.cam;
    const [cx2, cy2, z2] = o.cam.length === 6 ? [o.cam[3], o.cam[4], o.cam[5]] : [cx, cy, z * 1.05];
    const acts = typeof o.actors === 'function' ? o.actors(t) : o.actors ?? [];
    return (
      <g transform={camT(kf(t, [[0, cx], [len, cx2]]), kf(t, [[0, cy], [len, cy2]]), kf(t, [[0, z], [len, z2]]))}>
        {o.set(t)}
        {o.under ? o.under(t, len) : null}
        {acts.map((a, i) => actor(a, t, i))}
        {o.over ? o.over(t, len) : null}
        {o.fg ? <Foreground blur={10}>{o.fg}</Foreground> : null}
      </g>
    );
  };

/** A close-up: one face over a blurred background, with a slow push-in. */
export const closeUp = (o: {
  look: Look;
  face: [number, Expr][];
  bg: (t: number) => React.ReactNode;
  bgT?: string; // transform for the background (it is drawn scaled up, then blurred)
  sc?: number;
  x?: number;
  y?: number; // where the head's centre sits on screen
  yaw?: number;
  eyes?: number;
  tilt?: number;
  rim?: string;
  pose?: Partial<Pose>;
  over?: (t: number, len: number, head: { x: number; y: number; sc: number }) => React.ReactNode;
  dim?: number;
  vertSc?: number; // scale the head by this in the 9:16 crop, so a big close-up still fits its width
  vertY?: number; // where the head's centre sits in the 9:16 crop (keep faces out of the Reels/Shorts button zone)
}): React.FC<ShotProps> =>
  ({ t, len }) => {
    const vert = useContext(VerticalCtx);
    const sc = (o.sc ?? 3.6) * (vert ? o.vertSc ?? 1 : 1) * (1 + 0.05 * clamp(t / len));
    const head = { x: o.x ?? 960, y: (vert ? o.vertY : undefined) ?? o.y ?? 560 };
    const pose: Pose = {
      ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: o.yaw ?? 0.2, look: o.eyes ?? 0.3, headTilt: o.tilt ?? 0,
      armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...(o.pose ?? {}), ...faceAt(t, o.face),
    };
    return (
      <g>
        <g filter="url(#blur16)">
          <g transform={o.bgT ?? 'translate(-700 -500) scale(2)'}>{o.bg(t)}</g>
        </g>
        <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={o.dim ?? 0.22} />
        <Hero look={o.look} pose={pose} rimId={o.rim ?? 'rimR'} shadow={0} />
        {o.over ? o.over(t, len, { ...head, sc }) : null}
      </g>
    );
  };

/** A card on the schematic ground, with a slow push-in. */
export const card = (id: string, draw: (t: number, len: number) => React.ReactNode): React.FC<ShotProps> =>
  ({ t, len }) => (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t} id={id} />
      {draw(t, len)}
    </g>
  );

/** Rings rippling out from a frozen object: the "paused" mark. */
export const Frozen: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 60 }) => (
  <g>
    {[0, 1].map((k) => {
      const p = ((t + k * 12) % 24) / 24;
      return <circle key={k} cx={x} cy={y} r={r * (0.8 + p * 0.9)} fill="none" stroke={ICE} strokeWidth={4} opacity={0.55 * (1 - p)} />;
    })}
  </g>
);

/** A big arm reaching in from off-frame (sleeve + mitten), for inserts. */
export const Arm: React.FC<{ look: Look; from: [number, number]; to: [number, number]; w?: number; rot?: number; s?: number; point?: boolean }> = ({ look, from, to, w = 110, rot = 0, s = 4.4, point }) => (
  <g filter="url(#rimR)">
    <path d={`M ${from[0]} ${from[1]} Q ${(from[0] + to[0]) / 2} ${from[1] - 60} ${to[0]} ${to[1]}`} stroke={look.line} strokeWidth={w + 18} fill="none" strokeLinecap="round" />
    <path d={`M ${from[0]} ${from[1]} Q ${(from[0] + to[0]) / 2} ${from[1] - 60} ${to[0]} ${to[1]}`} stroke={look.jacket} strokeWidth={w} fill="none" strokeLinecap="round" />
    <g transform={`translate(${to[0]} ${to[1]}) rotate(${rot}) scale(${s})`}>
      {point ? (
        <g>
          <rect x={-4} y={10} width={8} height={24} rx={4} fill={look.hand} stroke={look.line} strokeWidth={2.4} />
          <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={look.hand} stroke={look.line} strokeWidth={2.6} strokeLinejoin="round" />
        </g>
      ) : (
        <g>
          <ellipse cx={-10} cy={3} rx={5.5} ry={9} transform="rotate(28 -10 3)" fill={look.hand} stroke={look.line} strokeWidth={2.4} />
          <ellipse cx={0} cy={10} rx={11} ry={15} fill={look.hand} stroke={look.line} strokeWidth={2.4} />
        </g>
      )}
    </g>
  </g>
);

// ---------- set shortcuts: `frozen` gives the set a fixed clock so nothing in it moves ----------
export const sets = {
  study: (t: number, frozen = false) => <Study t={frozen ? 80 : t + 40} id={`st${frozen ? 'f' : ''}`} />,
  studyDesk: () => <Desk x0={560} x1={1360} y={700} />,
  classroom: (t: number, frozen = false, id = 'cl') => <Classroom t={frozen ? 300 : t + 200} id={id} />,
  kitchen: (t: number, frozen = false, id = 'kt') => <Kitchen t={frozen ? 97 : t + 40} id={id} />,
  island: () => <KitchenIsland />,
  bedroom: (t: number, frozen = false, id = 'bd', clock = '21:30') => <Bedroom t={frozen ? 50 : t + 20} id={id} clock={clock} />,
  roof: (t: number, o: { low?: number; red?: number; sunX?: number; sunY?: number; clock?: boolean; spin?: number } = {}) => (
    <Rooftop t={t + 60} low={o.low ?? 0} red={o.red ?? 0} sunX={o.sunX ?? 1100} sunY={o.sunY ?? 560} clock={o.clock} spin={o.spin ?? 156} />
  ),
  field: (t: number, frozen = false, id = 'fd') => <Outdoor t={t} kind="field" frozen={frozen} id={id} />,
  street: (t: number, frozen = false, id = 'sr', red = 0) => <Outdoor t={t} kind="street" frozen={frozen} id={id} red={red} />,
  garden: (t: number, frozen = false, id = 'gd', red = 0) => <Outdoor t={t} kind="garden" frozen={frozen} id={id} red={red} sunX={1500} />,
};
