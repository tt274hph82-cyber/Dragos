// Staging for "The woman who painted a line" (Dr. June McCarroll, Indio, 1917-1924). Every beat is its own place, at its own
// world x (see set.tsx), so no scene repeats. Times inside a beat are local frames from the narration (W(shot, word)).
import {TOTAL, shotAt, W, T, SHOT_REAL, type V3} from '../../engine/core/clock';
import {autoGaze, carOn, seatOf, type Key} from '../../engine/core/staging';
import {PersonP, seq} from '../../engine/chars/rig';
import type {CarP, MeterP, Things} from '../../engine/kits/downtown/street';
import type {CartP} from '../../engine/kits/grocery/store';
export {TOTAL, shotAt};
/** world x of each location */
export const X = {hook: 1300, town: 100, road: 200, idea: 300, county: 400, door: 500, brush: 600, stare: 700, stretch: 800, club: 900, map: 1000, years: 1100, miles: 1200, end: 1400, modern: 1500, dash: 1600} as const;
export type Extra = {door?: number; bulb?: number; line?: [number, number]; dust?: number; stamp?: number; cal?: number; pins?: number; scroll?: number; brushT?: number; slam?: number};
export type Stage = {people: PersonP[]; carts: CartP[]; extra: string[]; cars: CarP[]; meters: MeterP[]; things: Things; clock: number; nStoryCars: number; loc: keyof typeof X | 'store'; ex: Extra};
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (t: number) => { t = cl(t); return t * t * (3 - 2 * t); };
/** a car (kit Car or, with col 'TRUCK'/'M:<colour>', the desert truck / a modern car) on a path */
const car = (keys: Key[], lf: number, col: string, base = 0) => carOn(keys, lf, col, base);
export function stage(f: number): Stage {
  const s = shotAt(f), lf = s.lf, P: PersonP[] = [], K: CarP[] = [], ex: Extra = {};
  let loc: Stage['loc'] = s.name as any;
  switch (s.name) {
    case 'hook': {   // dusk: she bends over the road with a long brush, the wet line behind her
      const x = X.hook;
      P.push({who: 'june', p: [x + 0.6, 0, -0.55], ...seq(lf, [[0, 'push', 'proud'], [W('hook', 'nobody'), 'push', 'smug']]), view: 'side', dir: 1});
      ex.line = [x - 60, x + 0.9 + lf * 0.004]; break; }
    case 'town': {   // Indio: she steps out of her office with her bag
      const x = X.town; P.push({who: 'june', p: [x, 0, -4.6 + sm(lf / 50) * 3.2], ...seq(lf, [[0, 'walk', 'happy'], [52, 'present', 'proud']]), gaze: 'cam'});
      P.push({who: 'oldman', p: [x + 4.2, 0, -3.0], act: 'idle', expr: 'happy', bg: true}); P.push({who: 'paperboy', p: [x - 4.0, 0, -2.6], act: 'wave', expr: 'happy'}); break; }
    case 'truck': {   // she drives east (+x, right lane z+); the truck comes west straight down the middle
      loc = 'road'; const x = X.road, roar = W('truck', 'roaring');
      K.push(car([[0, x - 30, 1.5], [roar + 20, x + 4, 1.5]], lf, '#1e1e24'));
      K.push(car([[0, x + 40, 0], [roar + 20, x + 10, 0]], lf, 'TRUCK', Math.PI));
      P.push({who: 'june', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: lf < roar ? 'happy' : 'surprised', look: 1});
      P.push({who: 'mechanic', p: seatOf(K[1], 1), inCar: true, sit: true, act: 'idle', expr: 'smug'}); break; }
    case 'sand': {   // the car skids off into the sand; then the idea
      loc = 'road'; const x = X.road + 30, k = sm(lf / 18);
      K.push({...car([[0, x - 8, 1.5], [18, x - 1, 5.2]], lf, '#1e1e24'), ry: -0.55 * k});
      K.push(car([[0, x + 2, 0], [70, x - 26, 0]], lf, 'TRUCK', Math.PI));
      ex.dust = lf;
      const out = W('sand', 'idea') - 16;
      P.push(lf < out ? {who: 'june', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: 'surprised', look: 1} : {who: 'june', p: [x - 1.5, 0, 7.4], ...seq(lf, [[0, 'eureka', 'happy']]), gaze: 'cam'});
      ex.bulb = lf - W('sand', 'idea') + 4; break; }
    case 'idea': {   // bird's-eye: the line draws itself, a car on each side
      const x = X.idea; ex.line = [x - 40, x - 40 + 80 * sm((lf - 2) / (W('idea', 'Your') - 4))];
      K.push(car([[W('idea', 'Your') - 20, x - 30, 1.6], [W('idea', 'Your') + 40, x + 30, 1.6]], lf, '#2f6f73'));
      K.push(car([[W('idea', 'My') - 20, x + 30, -1.6], [W('idea', 'My') + 40, x - 30, -1.6]], lf, '#d0532f', Math.PI)); break; }
    case 'county': {   // three officials behind a long desk laugh at her drawing
      const x = X.county, money = W('county', 'money');
      P.push({who: 'june', p: [x - 1.6, 0, 1.2], ...seq(lf, [[0, 'present', 'happy'], [money, 'slump', 'sad']]), gaze: [x, 1.2, -1.6]});
      P.push({who: 'preacher', p: [x - 0.9, 0, -1.6], ...seq(lf, [[0, 'cross', 'smug'], [money, 'cross', 'smirk']])});
      P.push({who: 'banker', p: [x + 0.4, 0, -1.6], ...seq(lf, [[0, 'idle', 'smug'], [W('county', 'Paint'), 'shrug', 'smirk'], [money - 4, 'bounce', 'happy']])});
      P.push({who: 'shopper2', p: [x + 1.7, 0, -1.6], ...seq(lf, [[0, 'idle', 'neutral'], [money, 'point', 'happy']])}); break; }
    case 'door': {   // the board's door shuts in her face, twice
      const x = X.door, i1 = W('door', 'Ignored'), i2 = Math.round((T('door', 'Ignored', 2) - SHOT_REAL.door) * 30);
      ex.door = lf < i1 - 3 ? 1 : lf < i1 + 3 ? 1 - (lf - (i1 - 3)) / 6 : lf < i2 - 18 ? 0 : lf < i2 - 8 ? (lf - (i2 - 18)) / 10 : lf < i2 - 3 ? 1 : lf < i2 + 3 ? 1 - (lf - (i2 - 3)) / 6 : 0;
      ex.slam = lf;
      P.push({who: 'june', p: [x - 0.2, 0, 1.1], ...seq(lf, [[0, 'talk', 'happy'], [i1, 'slump', 'worried'], [i1 + 18, 'talk', 'angry'], [i2, 'cross', 'angry']]), view: 'side', dir: -1}); break; }
    case 'store': {   // the general store: a can of white paint across the counter
      loc = 'store';
      P.push({who: 'goldman', p: [-2.4, 0, 0.75], ...seq(lf, [[0, 'present', 'happy']]), gaze: [-2.4, 1.3, 2.6]});
      P.push({who: 'june', p: [-2.4, 0, 2.75], ...seq(lf, [[0, 'talk', 'proud'], [W('store', 'paint') , 'point', 'happy']]), gaze: [-2.4, 1.2, 0.8]}); break; }
    case 'brush': {  // extreme close: the brush lays the line on the road
      ex.brushT = lf; ex.line = [X.brush - 30, X.brush - 2 + lf * 0.05]; break; }
    case 'stare': {  // a slow car rolls past; two men gawk at the lady with the brush
      const x = X.stare; ex.line = [x - 60, x + 3];
      K.push(car([[0, x - 18, 1.6], [70, x - 2, 1.6], [140, x + 12, 1.6]], lf, '#5b7fb5'));
      P.push({who: 'rancher', p: seatOf(K[0], 1), inCar: true, sit: true, act: 'idle', expr: 'surprised', gaze: [x + 3, 1, -1.2]});
      P.push({who: 'youngman', p: seatOf(K[0], -1), inCar: true, sit: true, ...seq(lf, [[0, 'idle', 'surprised'], [W('stare', "That's"), 'point', 'smirk']]), gaze: [x + 3, 1, -1.2]});
      P.push({who: 'june', p: [x + 3.6, 0, -1.3], ...seq(lf, [[0, 'push', 'proud']]), view: 'side', dir: -1}); break; }
    case 'stretch': {   // sunset, high and wide: cars keep to their own side of her line
      const x = X.stretch; ex.line = [x - 80, x + 80];
      K.push(car([[0, x - 26, 1.6], [150, x + 26, 1.6]], lf, '#2f6f73'));
      K.push(car([[0, x + 30, -1.6], [150, x - 22, -1.6]], lf, '#d0532f', Math.PI));
      K.push(car([[0, x - 52, 1.6], [150, x + 2, 1.6]], lf, '#f2b234'));
      P.push({who: 'june', p: [x + 1, 0, -4.4], act: 'proud', expr: 'proud', gaze: [x, 0.5, 0]}); break; }
    case 'club': {   // the women's club writes letters
      const x = X.club;
      P.push({who: 'june', p: [x, 0, -1.5], ...seq(lf, [[0, 'talk', 'happy'], [30, 'point', 'proud']]), gaze: 'cam'});
      P.push({who: 'grandma', p: [x - 2.9, 0, 0.4], act: 'think', expr: 'happy'}); P.push({who: 'baker', p: [x + 2.0, 0, 0.6], act: 'cheer', expr: 'happy'});
      P.push({who: 'woman', p: [x - 1.4, 0, 1.9], act: 'present', expr: 'proud'}); P.push({who: 'youngwoman', p: [x + 1.6, 0, 1.9], act: 'talk', expr: 'happy'}); break; }
    case 'map': {   // the state map lights up club by club; a petition unrolls
      const x = X.map; ex.pins = lf; ex.scroll = cl((lf - W('map', 'Thousands') + 6) / 40);
      P.push({who: 'nurse', p: [x - 1.7, 0, 0.4], ...seq(lf, [[0, 'point', 'happy']]), gaze: [x, 2, -1.8]});
      P.push({who: 'shopper', p: [x + 1.7, 0, 0.5], ...seq(lf, [[0, 'present', 'proud'], [W('map', 'Thousands'), 'cheer', 'happy']]), gaze: [x, 1, 0.8]}); break; }
    case 'years': {   // the commission: 1917 flips to 1924, APPROVED
      const x = X.years; ex.cal = lf - W('years', 'later') + 4; ex.stamp = lf - W('years', 'yes') - 2;
      P.push({who: 'magee', p: [x + 0.6, 0, -0.9], ...seq(lf, [[0, 'think', 'neutral'], [W('years', 'yes') - 6, 'cheer', 'happy']]), gaze: [x - 0.3, 0.9, 0.2]}); break; }
    case 'miles': {   // aerial: the line races to the horizon
      ex.line = [X.miles - 40, X.miles - 40 + 600 * sm(lf / 66)]; break; }
    case 'modern': {   // today, at night: every car on its own side
      const x = X.modern; ex.line = [x - 300, x + 300];
      [[0, 1.6, '#c8262e', 0], [40, 1.6, '#e8e8f0', 0], [10, -1.6, '#2a5f9a', 1], [60, -1.6, '#f2b234', 1]].forEach(([o, z, c, back]) => K.push(back
        ? car([[-30, x + 60 - +o * 0.2, +z], [200, x - 60 - +o * 0.2, +z]], lf, 'M:' + c, Math.PI) : car([[-30, x - 60 + +o * 0.2, +z], [200, x + 60 + +o * 0.2, +z]], lf, 'M:' + c))); break; }
    case 'end': {    // a kid looks down at the line from the passenger seat... then June at her finished line, golden hour
      const x = X.end; ex.line = [x - 80, x + 1];
      K.push({p: [X.dash, 0, 1.6], ry: 0, col: 'M:#5b7fb5'});
      P.push({who: 'kid', p: [X.dash + 2.2, 0, -1.0], act: 'idle', expr: 'surprised', gaze: [X.dash + 3, 0, 0]});
      P.push({who: 'june', p: [x + 2.0, 0, -0.9], ...seq(lf, [[0, 'proud', 'proud'], [W('end', 'doctor'), 'wave', 'happy']]), gaze: 'cam'}); break; }
  }
  autoGaze(P, [] as MeterP[]);
  return {people: P, carts: [], extra: [], cars: K, meters: [], things: {}, clock: 9, nStoryCars: K.length, loc, ex};
}
