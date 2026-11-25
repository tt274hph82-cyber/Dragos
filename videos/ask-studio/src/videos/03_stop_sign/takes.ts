// Camera for "Why stop signs are red": keys land on the narration words; az 0 = camera on +z, 90 = on +x.
import {K, type Take, type Kick, type Whip, type Flash, type Props} from '../../engine/camera/takes_api';
import {T} from '../../engine/core/clock';
import {SHOT_REAL as R} from './timeline';
import {X, CORNER} from './stage';
const S: [number, number, number] = [CORNER[0], 2.1, CORNER[2]];
export const PROPS: Props = {
  hooksign: [S, 0.45], cornersign: [S, 0.4],
  crossing: [[45, 0.8, 12.5], [5, 1, 4]],
  wall: [[X.wall, 1.6, -2.4], [5, 1.6, 0.3]], wall2: [[X.wall + 10.6, 1.6, -2.8], [4.5, 1.6, 0.3]],
  table: [[X.room, 0.9, 0], [1.4, 0.1, 0.8]], oct: [[X.room - 0.2, 1.5, 0.25], 0.4],
  plan: [[X.board, 0, 0], [3.2, 0.1, 3.2]], circle: [[X.board - 1.85, 0.1, 0], 0.7], octb: [[X.board + 1.15, 0.1, 0], 0.7],
  snowsign: [[X.snow - 0.2, 2.1, -3.3], 0.45],
  cans: [[X.paint, 1.15, 0.1], [0.8, 0.3, 0.3]], yellow: [[X.paint + 0.45, 1.25, 0.15], 0.3],
  fadewide: [[X.fade, 3, -3.3], [7, 3, 2]], fadesign: [[X.fade, 2.1, -3.3], 0.5],
  mroad: [[X.montage + 20, 1, 0], [8, 0.6, 3]], msign: [[X.montage + 18, 2.1, -3.4], 0.5], billboard: [[X.montage + 24, 4.2, -7.5], [2.2, 1.4, 0.2]], mroad2: [[X.montage + 60, 1, 0], [8, 0.6, 3]],
  easel: [[X.works, 1.75, -0.2], 0.7],
  todaysign: [[X.today - 2.0, 2.1, 3.6], 0.45], todaywide: [[X.today, 1, 0], [10, 1, 6]],
};
export const TAKES: Take[] = [
  {name: 'hook', why: 'frame 0: night, the glowing yellow octagon fills the frame as headlights rush in; push on "red", then the car', keys: [
    K(R.hook, 'prop:hooksign', 'MS', -125, 4, 40, {push: 1.05}),
    K(T('hook', 'red') - 0.1, ['prop:hooksign', 'car:0'], 'MS', -100, 8, 46, {move: 'arc', dur: 0.7}),
    K(T('hook', 'mistake'), ['car:0', 'prop:hooksign'], 'MS', -60, 7, 44, {move: 'arc', dur: 0.7})]},
  {name: 'detroit', why: '1915 crane shot over the chaos; drop to the nose-to-nose cars on "nobody"', keys: [
    K(R.detroit, 'prop:crossing', 'WS', -75, 24, 40, {push: 1.03}),
    K(T('detroit', 'chaos'), ['car:1', 'paperboy', 'cop'], 'FS', -80, 14, 40, {move: 'arc', dur: 0.9}),
    K(T('detroit', 'nobody'), ['car:0', 'car:1'], 'FS', -95, 14, 40, {move: 'pullpush', dur: 0.6})]},
  {name: 'square', why: 'close on the hammer and the little white square; out to the workman on "STOP"', keys: [
    K(R.square, 'prop:cornersign', 'MCU', -60, 5, 36, {push: 1.06}),
    K(T('square', 'Stop') - 0.1, ['mechanic', 'prop:cornersign'], 'MS', -30, 6, 40, {move: 'arc', dur: 0.6})]},
  {name: 'night', why: 'night: a car rolls past the sign nobody can see', keys: [
    K(R.night, 'prop:cornersign', 'MS', -100, 5, 44),
    K(T('night', 'see'), 'prop:cornersign', 'MCU', -95, 3, 40, {move: 'dolly', dur: 0.8})]},
  {name: 'wall', why: 'a fence of identical white signs; whip along it on "every"', keys: [
    K(R.wall, 'prop:wall', 'FS', 10, 6, 40, {push: 1.04}),
    K(T('wall', 'every'), 'prop:wall2', 'FS', -15, 6, 40, {move: 'whip', dur: 0.35})]},
  {name: 'room', why: '1923: the engineers; push on the idea, down to the shapes, close on the octagon', keys: [
    K(R.room, ['teacher', 'banker', 'oldman'], 'FS', 10, 10, 42),
    K(T('room', 'idea') - 0.1, 'teacher', 'MCU', 25, 5, 36, {move: 'arc', dur: 0.6}),
    K(T('room', 'sides'), 'prop:table', 'MS', 0, 40, 38, {move: 'pullpush', dur: 0.7}),
    K(T('room', 'dangerous'), 'prop:oct', 'CU', 10, 25, 34, {move: 'arc', dur: 0.6})]},
  {name: 'board', why: 'top-down plan: circle on the railroad, octagon on the stop line', keys: [
    K(R.board, 'prop:plan', 'WS', 0, 84, 40, {push: 1.04}),
    K(T('board', 'circle'), 'prop:circle', 'MS', 0, 80, 38, {move: 'pan', dur: 0.5}),
    K(T('board', 'Eight'), 'prop:octb', 'MS', 0, 80, 38, {move: 'pan', dur: 0.5})]},
  {name: 'snow', why: 'from behind a snow-capped sign: the octagon still reads; the car stops', keys: [
    K(R.snow, 'prop:snowsign', 'MS', -100, 5, 42, {push: 1.04}),
    K(T('snow', 'behind'), ['prop:snowsign', 'car:0'], 'FS', -105, 6, 42, {move: 'arc', dur: 0.6}),
    K(T('snow', 'covered'), 'prop:snowsign', 'MCU', -125, 8, 36, {move: 'arc', dur: 0.7})]},
  {name: 'paint', why: 'the workbench: red or yellow; the yellow can lifts on "Yellow"', keys: [
    K(R.paint, ['oldman', 'prop:cans'], 'MS', 15, 10, 40),
    K(T('paint', 'Not'), 'prop:cans', 'MCU', 0, 20, 36, {move: 'arc', dur: 0.5}),
    K(T('paint', 'Yellow') - 0.1, 'prop:yellow', 'CU', 20, 12, 34, {move: 'pullpush', dur: 0.5})]},
  {name: 'fade', why: 'time-lapse: the sun races, the sign goes pink, then gray', keys: [
    K(R.fade, 'prop:fadewide', 'WS', 20, 8, 42),
    K(T('fade', 'summers'), 'prop:fadesign', 'MS', 10, 4, 38, {move: 'arc', dur: 0.8}),
    K(T('fade', 'gray') - 0.2, 'prop:fadesign', 'MCU', 0, 3, 34, {move: 'dolly', dur: 0.6})]},
  {name: 'montage', why: 'thirty years of yellow: road, calendar flipping, cars changing', keys: [
    K(R.montage, 'prop:msign', 'MS', 40, 5, 40),
    K(T('montage', 'years'), 'prop:billboard', 'MS', 10, 8, 40, {move: 'pan', dur: 0.5}),
    K(T('montage', 'America'), 'prop:mroad2', 'WS', 50, 14, 40, {move: 'dolly', dur: 1.0})]},
  {name: 'works', why: '1954: the cloth comes off the red sign', keys: [
    K(R.works, ['youngman', 'goldman', 'prop:easel'], 'FS', 0, 8, 42),
    K(T('works', 'red') - 0.1, 'prop:easel', 'MS', 10, 6, 38, {move: 'arc', dur: 0.6}),
    K(T('works', 'job'), ['prop:easel', 'goldman'], 'FS', -20, 10, 40, {move: 'pullpush', dur: 0.6})]},
  {name: 'today', why: 'today: the brake lights, the red sign in the headlights, pull back to the crossing', keys: [
    K(R.today, 'car:0', 'MS', 60, 6, 40),
    K(T('today', 'look'), 'prop:todaysign', 'MCU', -110, 4, 36, {move: 'arc', dur: 0.7}),
    K(T('today', 'took'), 'prop:todaywide', 'WS', -60, 30, 40, {move: 'pullpush', dur: 1.4})]},
];
export const KICKS: Kick[] = [{t: 0.87, a: 1.2, z: 0.02}, {t: T('detroit', 'nobody'), a: 1.2, z: 0.02}, {t: T('square', 'Stop'), a: 1, z: 0.02}, {t: T('paint', 'Yellow'), a: 1.1, z: 0.02}, {t: T('works', 'red'), a: 1, z: 0.02}];
export const WHIPS: Whip[] = [];
export const FLASHES: Flash[] = [{t: T('works', 'red'), a: 0.3}];
