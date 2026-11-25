// Camera for "The woman who painted a line": one continuous take per beat; keys land on the narration words.
import {K, type Take, type Kick, type Whip, type Flash, type Props} from '../../engine/camera/takes_api';
import {T} from '../../engine/core/clock';
import {SHOT_REAL as R} from './timeline';
import {X} from './stage';
export const PROPS: Props = {
  hookline: [[X.hook - 5, 0.3, 0], [4, 0.4, 2]],
  docsign: [[X.town, 3.45, -7.8], [2.4, 0.9, 0.3]],
  idearoad: [[X.idea, 0, 0], [6, 0.3, 3]],
  door: [[X.door + 1.2, 1.2, -0.1], [0.8, 1.2, 0.2]],
  can: [[-2.6, 1.2, 1.6], 0.35],
  brush: [[X.brush - 1.2, 0.15, 0], [0.9, 0.3, 0.5]],
  stretchroad: [[X.stretch, 0, 0], [8, 0.6, 3]],
  map: [[X.map, 2.1, -3.8], [1.6, 2.1, 0.1]],
  scroll: [[X.map, 0.9, 1.4], [0.8, 0.3, 1.1]],
  cal: [[X.years - 2.2, 2.2, -3.85], [0.7, 0.8, 0.1]],
  stampdesk: [[X.years - 0.3, 1.1, 0.3], [0.5, 0.25, 0.4]],
  milesnear: [[X.miles - 20, 0, 0], [8, 0.5, 3]],
  milesfar: [[X.miles + 60, 0, 0], [18, 1, 4]],
  modroad: [[X.modern, 0.6, 0], [6, 0.6, 3]],
  dashline: [[X.dash + 4, 0.05, 0], [1.2, 0.1, 0.4]],
};
export const TAKES: Take[] = [
  {name: 'hook', why: 'frame 0: dusk, she paints the line; push to her face on "by hand", pull back to the empty road on "nobody else"', keys: [
    K(R.hook, 'june', 'MS', 70, 6, 40, {push: 1.05}),
    K(T('hook', 'hand'), 'june', 'MCU', 55, 4, 36, {move: 'arc', dur: 0.7}),
    K(T('hook', 'nobody'), ['june', 'prop:hookline'], 'WS', 25, 12, 40, {move: 'pullpush', dur: 1.0})]},
  {name: 'town', why: 'Indio: push on her sign, then on her as she steps out', keys: [
    K(R.town, 'prop:docsign', 'MS', 0, 4, 40, {push: 1.04}),
    K(T('town', 'doctor'), 'june', 'MS', 15, 4, 40, {move: 'arc'}),
    K(T('town', 'California'), ['june', 'paperboy'], 'FS', 25, 8, 42, {move: 'pullpush', dur: 0.9})]},
  {name: 'truck', why: 'she drives; the camera arcs round to the truck coming head-on, push into its grille on "roaring"', keys: [
    K(R.truck, 'car:0', 'FS', 10, 5, 42),
    K(T('truck', 'truck'), ['car:0', 'car:1'], 'WS', 70, 6, 40, {move: 'arc', dur: 0.9}),
    K(T('truck', 'roaring'), 'car:1', 'MS', 100, 8, 38, {move: 'dolly', dur: 0.5})]},
  {name: 'sand', why: 'the skid into the sand, then her face and the bulb on "idea"', keys: [
    K(R.sand, 'car:0', 'FS', 40, 8, 42),
    K(T('sand', 'idea') - 0.2, 'june', 'MCU', 25, 5, 36, {move: 'arc', dur: 0.7})]},
  {name: 'idea', why: "bird's-eye: the line draws itself; a car on each side on \"your\" / \"my\"", keys: [
    K(R.idea, 'prop:idearoad', 'WS', 0, 80, 40, {push: 1.03}),
    K(T('idea', 'Your'), 'car:0', 'FS', 0, 70, 40, {move: 'pan', dur: 0.6}),
    K(T('idea', 'My'), 'car:1', 'FS', 0, 70, 40, {move: 'pan', dur: 0.6})]},
  {name: 'county', why: 'the board; push on the banker laughing on "money"', keys: [
    K(R.county, ['june', 'preacher', 'banker', 'shopper2'], 'FS', 10, 8, 42),
    K(T('county', 'Waste'), 'banker', 'MCU', -10, 3, 36, {move: 'arc', dur: 0.7})]},
  {name: 'door', why: 'the door shuts twice, a kick on each "Ignored"', keys: [
    K(R.door, ['june', 'prop:door'], 'FS', 20, 4, 40),
    K(T('door', 'again', 2), 'june', 'MCU', 40, 2, 36, {move: 'arc', dur: 0.6}),
    K(T('door', 'Ignored', 2), ['june', 'prop:door'], 'MS', 10, 4, 40, {move: 'pullpush', dur: 0.6})]},
  {name: 'store', why: 'the general store; push onto the paint can', keys: [
    K(R.store, ['goldman', 'june'], 'MS', 90, 8, 68),
    K(T('store', 'paint'), ['prop:can', 'goldman'], 'MS', 70, 16, 38, {move: 'arc', dur: 0.7})]},
  {name: 'brush', why: 'extreme close on the brush laying the line', keys: [K(R.brush, 'prop:brush', 'MCU', 35, 28, 34, {push: 1.08})]},
  {name: 'stare', why: 'the slow car; push on the man pointing on "crazy"', keys: [
    K(R.stare, 'car:0', 'FS', 30, 4, 42),
    K(T('stare', "That's"), 'car:0', 'MS', 15, 6, 40, {move: 'arc', dur: 0.7})]},
  {name: 'stretch', why: 'sunset, high and wide: cars on their own sides', keys: [
    K(R.stretch, 'prop:stretchroad', 'WS', 20, 35, 40, {push: 1.03}),
    K(T('stretch', 'everyone'), ['june', 'car:0'], 'FS', 35, 14, 40, {move: 'arc', dur: 0.9})]},
  {name: 'club', why: "the women's club; push on June", keys: [
    K(R.club, ['june', 'grandma', 'baker', 'woman', 'youngwoman'], 'FS', 0, 8, 42),
    K(T('club', 'joined'), 'june', 'MCU', 10, 4, 36, {move: 'arc', dur: 0.7})]},
  {name: 'map', why: 'the map lights up in threes; tilt down to the petition on "Thousands"', keys: [
    K(R.map, 'prop:map', 'FS', 0, 4, 40, {push: 1.04}),
    K(T('map', 'Thousands'), 'prop:scroll', 'MS', 10, 40, 38, {move: 'pullpush', dur: 0.8})]},
  {name: 'years', why: 'the calendar flips 1917 -> 1924; push onto APPROVED on "yes"', keys: [
    K(R.years, 'prop:cal', 'MS', 0, 2, 40),
    K(T('years', 'yes') - 0.1, 'prop:stampdesk', 'CU', 20, 40, 36, {move: 'arc', dur: 0.6})]},
  {name: 'miles', why: 'aerial: the line races off to the horizon', keys: [
    K(R.miles, 'prop:milesnear', 'WS', -70, 30, 40),
    K(T('miles', 'thousands'), 'prop:milesfar', 'EWS', -80, 18, 40, {move: 'dolly', dur: 1.4})]},
  {name: 'modern', why: 'today at night: every car on its own side', keys: [
    K(R.modern, 'prop:modroad', 'WS', 25, 26, 40, {push: 1.03}),
    K(T('modern', 'drew'), 'car:0', 'FS', 45, 6, 40, {move: 'arc', dur: 0.8})]},
  {name: 'end', why: 'a kid looks down at the line; whip to June at her first line, golden hour', keys: [
    K(R.end, 'car:0', 'MS', -30, 12, 40),
    K(T('end', 'down'), 'prop:dashline', 'MS', 0, 55, 40, {move: 'pan', dur: 0.6}),
    K(T('end', 'That'), 'june', 'WS', 40, 6, 42, {move: 'whip', dur: 0.3})]},
];
export const KICKS: Kick[] = [{t: T('door', 'Ignored'), a: 1.2, z: 0.02}, {t: T('door', 'Ignored', 2), a: 1.4, z: 0.025}, {t: T('years', 'yes'), a: 1, z: 0.02}, {t: T('truck', 'roaring'), a: 1, z: 0.02}];
export const WHIPS: Whip[] = [];
export const FLASHES: Flash[] = [{t: T('sand', 'idea'), a: 0.35}];
