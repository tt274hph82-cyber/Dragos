// Staging for "Why stop signs are red" (Detroit 1915 -> 1923 octagon -> yellow 1924-1954 -> red 1954). Each beat is its own
// place or a new angle: the downtown block (kit, at the origin; its cross street is x 46..52) for the 1915 / 1930s crossings,
// every other location at its own world x (see set.tsx). Times inside a beat are local frames from the narration (W(shot, word)).
import {TOTAL, shotAt, W, type V3} from '../../engine/core/clock';
import {autoGaze, carOn, seatOf, type Key} from '../../engine/core/staging';
import {PersonP, seq} from '../../engine/chars/rig';
import type {CarP, MeterP, Things} from '../../engine/kits/downtown/street';
import type {CartP} from '../../engine/kits/grocery/store';
export {TOTAL, shotAt};
/** world x of each location (the town block sits at the origin) */
export const X = {town: 0, wall: 400, room: 500, board: 600, snow: 700, paint: 800, fade: 900, montage: 1000, works: 1400, today: 1500} as const;
/** the downtown corner where the stop sign stands (near-side sidewalk, facing cars coming east along lane E) */
export const CORNER: V3 = [45.2, 0, 8.0];
export type Loc = 'hook' | 'detroit' | 'square' | 'night' | 'wall' | 'room' | 'board' | 'snow' | 'paint' | 'fade' | 'montage' | 'works' | 'today';
export type Extra = {hammer?: number; nailed?: number; shapes?: number; pick?: number; drop?: [number, number]; fade?: number; sun?: number; year?: number; cloth?: number; brake?: number; snowT?: number; lift?: number};
export type Stage = {people: PersonP[]; carts: CartP[]; extra: string[]; cars: CarP[]; meters: MeterP[]; things: Things; clock: number; nStoryCars: number; loc: Loc; ex: Extra};
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (t: number) => { t = cl(t); return t * t * (3 - 2 * t); };
const car = (keys: Key[], lf: number, col: string, base = 0) => carOn(keys, lf, col, base);
export function stage(f: number): Stage {
  const s = shotAt(f), lf = s.lf, P: PersonP[] = [], K: CarP[] = [], ex: Extra = {}, th: Things = {};
  const loc = s.name as Loc;
  switch (loc) {
    case 'hook': {   // night, 1930s: a car skids to a stop inches from the glowing yellow octagon
      const stopF = 26; K.push(car([[0, 18, 11.7], [stopF, 43.2, 11.7]], lf, '#2f4f6a'));
      P.push({who: 'man', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: lf < stopF ? 'neutral' : 'surprised', look: 1});
      ex.brake = cl((lf - 8) / 18); break; }
    case 'detroit': {   // day, 1915: chaos at the crossing; two cars nose to nose on "nobody"
      const nb = W('detroit', 'nobody');
      K.push(car([[0, 10, 11.7], [nb, 44.6, 11.7], [nb + 60, 44.9, 11.7]], lf, '#1e1e24'));
      K.push(car([[0, 48, 40], [nb, 48, 14.6], [nb + 60, 48, 14.4]], lf, '#a8443a', -Math.PI / 2));
      K.push(car([[0, 44, 14.4], [200, 10, 14.4]], lf, '#2f6f53', Math.PI));
      P.push({who: 'man', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: lf < nb ? 'smug' : 'angry', look: 1});
      P.push({who: 'youngman', p: seatOf(K[1], 1), inCar: true, sit: true, act: 'idle', expr: lf < nb ? 'happy' : 'surprised', look: 1});
      P.push({who: 'paperboy', p: [44 + sm(lf / 50) * 4, 0, 10.6 + sm(lf / 50) * 1.5], ...seq(lf, [[0, 'walk', 'surprised'], [50, 'wave', 'worried']])});
      P.push({who: 'woman', p: [36 + lf * 0.03, 0, 19.6], act: 'walk', expr: 'worried', bg: true});
      P.push({who: 'cop', p: [44.8, 0, 7.4], ...seq(lf, [[0, 'wave', 'angry'], [nb, 'point', 'angry']]), gaze: [48, 1, 11]});
      th.horse = {p: [38 + lf * 0.04, 0, 16.9], dir: 1, bob: Math.abs(Math.sin(lf * 0.3)) * 0.04}; break; }
    case 'square': {   // close: a workman nails the little white STOP square to the post
      ex.hammer = lf; ex.nailed = W('square', 'nails') + 6;
      P.push({who: 'mechanic', p: [CORNER[0] - 0.75, 0, CORNER[2] - 0.35], ...seq(lf, [[0, 'push', 'neutral'], [W('square', 'STOP'), 'present', 'proud']]), gaze: [CORNER[0], 2.1, CORNER[2]]}); break; }
    case 'night': {   // night, 1915: a car rolls straight past the white sign it never sees
      K.push(car([[0, 18, 11.7], [62, 47.6, 11.7], [100, 48, 34]], lf, '#1e1e24'));
      P.push({who: 'oldman', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: 'happy', look: 1}); break; }
    case 'wall': break;   // a fence of identical white signs
    case 'room': {   // 1923: engineers around a table of cut-out shapes
      const x = X.room, idea = W('room', 'idea'); ex.shapes = lf - W('room', 'sides'); ex.lift = lf - idea;
      P.push({who: 'teacher', p: [x - 1.4, 0, 0.9], ...seq(lf, [[0, 'think', 'neutral'], [idea - 6, 'eureka', 'happy'], [idea + 40, 'present', 'proud']]), gaze: [x, 1.0, 0]});
      P.push({who: 'banker', p: [x + 1.5, 0, 0.8], ...seq(lf, [[0, 'cross', 'smug'], [idea + 10, 'idle', 'surprised']]), gaze: [x - 1.4, 1.5, 0.9]});
      P.push({who: 'oldman', p: [x + 0.2, 0, -1.4], ...seq(lf, [[0, 'think', 'neutral'], [idea + 14, 'point', 'happy']]), gaze: [x, 1.0, 0]});
      P.push({who: 'man', p: [x - 0.3, 0, 1.6], act: 'idle', expr: 'happy', bg: true, view: 'back'}); break; }
    case 'board': {   // top-down: the circle drops on the railroad crossing, the octagon on the stop line
      ex.drop = [lf - W('board', 'circle'), lf - W('board', 'Eight')]; break; }
    case 'snow': {   // behind a snow-capped sign: you still read the octagon; a car stops
      const x = X.snow; ex.snowT = lf;
      K.push(car([[0, x + 22, 1.6], [70, x + 2.6, 1.6]], lf, '#2a5f9a', Math.PI));
      P.push({who: 'rancher', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: 'happy', look: 1}); break; }
    case 'paint': {   // the workbench: red or yellow? a hand lifts the yellow can on "Yellow"
      const x = X.paint; ex.pick = lf - W('paint', 'Yellow');
      P.push({who: 'oldman', p: [x - 0.2, 0, -0.9], ...seq(lf, [[0, 'think', 'neutral'], [W('paint', 'Not'), 'shrug', 'smirk'], [W('paint', 'Yellow') - 4, 'point', 'happy']]), gaze: [x + 0.4, 1.0, 0.1]}); break; }
    case 'fade': {   // time-lapse: a red sign under a racing sun goes pink, then grey
      ex.sun = lf; ex.fade = sm((lf - W('fade', 'pink') + 10) / 26) * 0.55 + sm((lf - W('fade', 'gray') + 6) / 24) * 0.45; break; }
    case 'montage': {   // thirty years of yellow: the road, the calendar flipping, the cars changing
      const x = X.montage; ex.year = 1924 + cl(lf / 80) * 30;
      K.push(car([[0, x - 10, 1.6], [90, x + 70, 1.6]], lf, lf < 45 ? '#2f4f6a' : 'M:#c8432a'));
      K.push(car([[0, x + 80, -1.6], [90, x + 5, -1.6]], lf, lf < 45 ? '#a8443a' : 'M:#5ab0a8', Math.PI)); break; }
    case 'works': {   // 1954 paint works: the cloth comes off a glossy red sign
      const x = X.works, red = W('works', 'red'); ex.cloth = sm((lf - red + 4) / 18);
      P.push({who: 'youngman', p: [x - 1.5, 0, 0.6], ...seq(lf, [[0, 'pull', 'happy'], [red + 20, 'cheer', 'happy']]), gaze: [x, 1.6, 0]});
      P.push({who: 'goldman', p: [x + 1.6, 0, 0.7], ...seq(lf, [[0, 'cross', 'neutral'], [red + 10, 'proud', 'proud']]), gaze: [x, 1.6, 0]});
      P.push({who: 'nurse', p: [x + 2.6, 0, -0.6], ...seq(lf, [[0, 'idle', 'neutral'], [red + 12, 'cheer', 'happy']]), gaze: [x, 1.6, 0]}); break; }
    case 'today': {   // today, night: a driver brakes, the red sign lights up in the headlights; pull back
      const x = X.today; ex.brake = cl((lf - 6) / 20);
      K.push(car([[0, x - 26, 1.6], [30, x - 4.4, 1.6]], lf, 'M:#e8e8f0'));
      P.push({who: 'youngwoman', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: 'happy', look: 1}); break; }
  }
  autoGaze(P, [] as MeterP[]);
  return {people: P, carts: [], extra: [], cars: K, meters: [], things: th, clock: 9, nStoryCars: K.length, loc, ex};
}
