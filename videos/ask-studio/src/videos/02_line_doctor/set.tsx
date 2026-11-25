// Sets for "The woman who painted a line": each beat renders only its own location (see stage.ts X).
import React from 'react';
import * as THREE from 'three';
import type {Tod} from '../../engine/look/look';
import {useMats, Set as Grocery} from '../../engine/kits/grocery/store';
import {Car} from '../../engine/kits/downtown/street';
import {charPts} from '../../engine/camera/camera';
import {useDesert, Sky, Mountains, Palm, DesertRoad, Truck, Front, Room, ModernCar, Can, Brush, M, T, basic, sph, cyl, plane, box, type DesertData} from '../../engine/kits/desert/desert';
import {X, type Stage} from './stage';
export const AUDIO: {voice: string | null; bed: string | null} = {voice: null, bed: null};
export const useSetData = () => ({g: useMats(), d: useDesert()});
type P = {d: ReturnType<typeof useSetData>; f: number; st: Stage; cam: THREE.Vector3; vel: (THREE.Vector3 | null)[]; tod: Tod};
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pop = (t: number) => { t = cl(t); return 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); };
const Img: React.FC<{t: THREE.Texture; p: [number, number, number]; s: [number, number]; r?: [number, number, number]}> = ({t, p, s, r = [0, 0, 0]}) =>
  <mesh geometry={plane} position={p} scale={[s[0], s[1], 1]} rotation={r}><meshToonMaterial map={t} /></mesh>;
const Cars: React.FC<{st: Stage; night?: boolean}> = ({st, night}) => <>{st.cars.map((c, i) => c.col === 'TRUCK'
  ? <Truck key={i} p={c.p} ry={c.ry} spin={c.spin} /> : c.col?.startsWith('M:') ? <ModernCar key={i} p={c.p} ry={c.ry} col={c.col.slice(2)} night={night} /> : <Car key={i} c={c} />)}</>;
/** a glowing light bulb popping in */
const Bulb: React.FC<{p: [number, number, number]; k: number}> = ({p, k}) => k <= 0 ? null : (<group position={p} scale={pop(k / 8) * 0.9}>
  <M g={sph} m={basic('#fff2a0')} s={0.22} sh={false} /><M g={cyl} m={T('#9a9aa2')} p={[0, -0.24, 0]} s={[0.1, 0.12, 0.1]} />
  <mesh geometry={sph} scale={0.55}><meshBasicMaterial color="#fff0a0" transparent opacity={0.25 * cl(k / 6)} depthWrite={false} /></mesh>
  {Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return <M key={i} m={basic('#fff2a0')} p={[Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0]} s={[0.05, 0.16, 0.02]} r={[0, 0, a + Math.PI / 2]} sh={false} />; })}
</group>);
const Dust: React.FC<{p: [number, number, number]; lf: number}> = ({p, lf}) => <group position={p}>{Array.from({length: 10}, (_, i) => { const k = cl((lf - i * 1.5) / 40); if (k <= 0 || k >= 1) return null;
  return <mesh key={i} geometry={sph} position={[-i * 0.5 - k * 2, 0.4 + k * 1.2, (i % 3 - 1) * 0.8]} scale={0.4 + k * 1.4}><meshToonMaterial color="#e8cf9a" transparent opacity={0.85 * (1 - k)} /></mesh>; })}</group>;

const Hook: React.FC<P> = ({d, f, st, cam}) => { const D = d.d, x = X.hook, j = st.people[0], q = j && charPts(j, f, cam, null);
  return (<group>
    <Sky t={D.skyDusk} at={[x, 0, 0]} /><Mountains x={x} col="#5a3a6a" col2="#7a4a7a" />
    <DesertRoad d={D} x0={x - 120} x1={x + 120} line={st.ex.line} seed={3} />
    <Palm p={[x - 9, 0, -9]} h={8} /><Palm p={[x + 12, 0, -14]} h={6.5} lean={-0.1} />
    {q && <Brush p={[x + 0.95, 0.02, -0.2]} ry={Math.PI} tilt={0.6} s={1.1} />}
    <Can d={D} p={[x + 1.4, 0, -1.4]} s={1.2} />
  </group>); };
const Town: React.FC<P> = ({d}) => { const D = d.d, x = X.town;
  return (<group>
    <Sky t={D.skyDay} at={[x, 0, 0]} /><Mountains x={x} />
    <DesertRoad d={D} x0={x - 60} x1={x + 60} seed={5} />
    <group position={[0, 0, -8]}>
      <Front p={[x, 0, 0]} w={5} h={4.2} col="#e8d8b0" sign={D.signDoc} signW={0.9} />
      <Front p={[x - 6, 0, 0]} w={5.5} h={4.6} col="#c8836a" sign={D.signStore} />
      <Front p={[x + 6, 0, 0]} w={5} h={3.8} col="#9ab8b0" sign={D.signPost} />
      <Front p={[x - 12, 0, 0]} w={5} h={5.2} col="#d8b87a" sign={D.signHotel} signW={0.6} />
    </group>
    {[-16, -3.2, 3.2, 14].map((dx, i) => <Palm key={i} p={[x + dx, 0, -5.4 - (i % 2) * 2]} h={7 + (i % 2)} lean={(i % 2 ? -1 : 1) * 0.06} />)}
    <group position={[x + 9, 0, 3.6]}><M g={cyl} m={T('#7a4a28')} p={[0, 1.2, 0]} s={[0.07, 2.4, 0.07]} /><Img t={D.signIndio} p={[0, 2.3, 0.05]} s={[1.6, 0.7]} /></group>
  </group>); };
const Road: React.FC<P & {sand?: boolean}> = ({d, st, sand}) => { const D = d.d, x = X.road;
  return (<group>
    <Sky t={D.skyDay} at={[x, 0, 0]} /><Mountains x={x} />
    <DesertRoad d={D} x0={x - 120} x1={x + 160} seed={7} />
    {[-30, -8, 22, 48, 70].map((dx, i) => <Palm key={i} p={[x + dx, 0, -10 - (i % 3) * 4]} h={6.5 + (i % 2)} />)}
    <Cars st={st} />
    {sand && st.cars[0] && <Dust p={st.cars[0].p} lf={st.ex.dust ?? 0} />}
    {sand && st.people[0] && <Bulb p={[st.people[0].p[0], 2.2, st.people[0].p[2]]} k={st.ex.bulb ?? 0} />}
  </group>); };
const Idea: React.FC<P> = ({d, st}) => { const D = d.d, x = X.idea;
  return (<group><Sky t={D.skyDay} at={[x, 0, 0]} /><DesertRoad d={D} x0={x - 80} x1={x + 80} line={st.ex.line} seed={9} /><Cars st={st} />
    <M g={sph} m={basic('#fbf8ee')} p={[st.ex.line ? st.ex.line[1] : x, 0.05, 0]} s={0.14} sh={false} /></group>); };
const County: React.FC<P> = ({d}) => { const D = d.d, x = X.county;
  return (<group>
    <Room p={[x, 0, 0]} w={10} d={8} wall={T('#7a5236')} floor={T('#5a3a26')} />
    {Array.from({length: 9}, (_, i) => <M key={i} m={T('#5a3a22')} p={[x - 4.5 + i * 1.12, 1.8, -3.93]} s={[0.08, 3.6, 0.06]} sh={false} />)}
    <Img t={D.signBoard} p={[x, 2.95, -3.9]} s={[2.6, 0.68]} />
    <M m={T('#4a2a18')} p={[x + 0.4, 0.5, -1.0]} s={[4.6, 1.0, 0.9]} /><M m={T('#2f6f73')} p={[x + 0.4, 1.02, -1.0]} s={[4.7, 0.05, 1.0]} />
    <Img t={D.letter} p={[x - 0.9, 1.06, -0.7]} s={[0.4, 0.5]} r={[-Math.PI / 2, 0, 0.2]} />
    <group position={[x - 3.6, 0, -3]}><M g={cyl} m={T('#c8a060')} p={[0, 1.2, 0]} s={[0.04, 2.4, 0.04]} /><M m={T('#e8e8f0')} p={[0.45, 2.1, 0]} s={[0.9, 0.55, 0.02]} /><M m={T('#c8262e')} p={[0.45, 2.24, 0.01]} s={[0.9, 0.12, 0.02]} /><M m={T('#2a5f9a')} p={[0.22, 2.25, 0.02]} s={[0.4, 0.28, 0.02]} /></group>
    <M m={T('#bfe0f0')} p={[x + 3.2, 2.0, -3.92]} s={[1.6, 1.4, 0.04]} /><M m={T('#e8dcc0')} p={[x + 3.2, 2.0, -3.9]} s={[0.06, 1.4, 0.05]} />
  </group>); };
const Door: React.FC<P> = ({d, st}) => { const D = d.d, x = X.door, k = st.ex.door ?? 0;
  return (<group>
    <M m={T('#d8c8a0')} p={[x, 1.8, -0.2]} s={[10, 3.6, 0.2]} /><M m={T('#6b5240')} p={[x, 0.45, -0.08]} s={[10, 0.9, 0.05]} />
    <M g={plane} m={T('#7a5a3a')} p={[x, 0, 2]} s={[10, 5, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
    <M m={T('#3a2414')} p={[x + 1.2, 1.15, -0.1]} s={[1.3, 2.3, 0.05]} />
    <group position={[x + 0.55, 0, -0.06]} rotation={[0, -k * 1.4, 0]}><M m={T('#7a3b22')} p={[0.65, 1.15, 0]} s={[1.3, 2.3, 0.08]} /><M g={sph} m={T('#d8b040')} p={[1.15, 1.1, 0.07]} s={0.06} />
      <Img t={D.signBoard} p={[0.65, 1.8, 0.05]} s={[1.0, 0.28]} /></group>
    {[x - 3.2, x + 3.6].map((lx) => <group key={lx}><M g={sph} m={basic('#fff0b8')} p={[lx, 2.6, -0.05]} s={0.15} sh={false} /><M m={T('#c8a060')} p={[lx, 2.4, -0.08]} s={[0.05, 0.3, 0.05]} /></group>)}
  </group>); };
const BrushClose: React.FC<P> = ({d, st}) => { const D = d.d, x = X.brush, lf = st.ex.brushT ?? 0, bx = x - 2 + lf * 0.05;
  return (<group><Sky t={D.skyGold} at={[x, 0, 0]} /><DesertRoad d={D} x0={x - 60} x1={x + 60} line={st.ex.line} seed={11} />
    <Brush p={[bx + 0.02, 0.02, 0]} ry={Math.PI} tilt={0.5 + 0.08 * Math.sin(lf * 0.5)} />
    <Can d={D} p={[bx + 0.7, 0, -0.45]} />
    {Array.from({length: 6}, (_, i) => <M key={i} g={sph} m={T('#fbf8ee')} p={[bx - 0.5 - i * 0.37, 0.025, (i % 2 ? 0.07 : -0.06)]} s={[0.05, 0.01, 0.04]} sh={false} />)}
  </group>); };
const Stare: React.FC<P> = ({d, st}) => { const D = d.d, x = X.stare;
  return (<group><Sky t={D.skyDay} at={[x, 0, 0]} /><Mountains x={x} /><DesertRoad d={D} x0={x - 100} x1={x + 100} line={st.ex.line} seed={13} /><Cars st={st} />
    <Can d={D} p={[x + 4.4, 0, -1.6]} s={1.2} /><Brush p={[x + 3.9, 0.02, -0.15]} ry={Math.PI} tilt={0.6} s={1.1} />
    {[-20, 14, 30].map((dx, i) => <Palm key={i} p={[x + dx, 0, -12 - i * 3]} h={7} />)}</group>); };
const Stretch: React.FC<P> = ({d, st}) => { const D = d.d, x = X.stretch;
  return (<group><Sky t={D.skyGold} at={[x, 0, 0]} /><Mountains x={x} col="#8a5a7a" col2="#a8708a" /><DesertRoad d={D} x0={x - 160} x1={x + 160} line={st.ex.line} seed={15} /><Cars st={st} />
    {[-40, -12, 18, 44].map((dx, i) => <Palm key={i} p={[x + dx, 0, -9 - (i % 2) * 5]} h={7.5} />)}</group>); };
const Club: React.FC<P> = ({d}) => { const D = d.d, x = X.club;
  return (<group>
    <Room p={[x, 0, 0]} w={10} d={8} wall={T('#c89aa8')} floor={T('#7a5236')} />
    <Img t={D.signClub} p={[x, 2.9, -3.9]} s={[2.8, 0.72]} />
    <M m={T('#6a3a22')} p={[x, 0.42, 0.9]} s={[3.2, 0.84, 1.1]} /><M m={T('#f4ead6')} p={[x, 0.86, 0.9]} s={[3.3, 0.04, 1.2]} />
    {Array.from({length: 9}, (_, i) => <Img key={i} t={D.letter} p={[x - 1.3 + (i % 5) * 0.62, 0.9 + Math.floor(i / 5) * 0.01, 0.65 + Math.floor(i / 5) * 0.45]} s={[0.36, 0.45]} r={[-Math.PI / 2, 0, (i % 3 - 1) * 0.2]} />)}
    {Array.from({length: 3}, (_, i) => <M key={'w' + i} m={T('#bfe0f0')} p={[x - 3 + i * 3, 2.0, -3.92]} s={[1.2, 1.4, 0.04]} />)}
    <M g={cyl} m={T('#3a3a42')} p={[x + 1.2, 0.93, 1.0]} s={[0.06, 0.1, 0.06]} />
  </group>); };
const MapRoom: React.FC<P> = ({d, st}) => { const D = d.d, x = X.map, lf = st.ex.pins ?? 0, sc = st.ex.scroll ?? 0;
  const PINS: [number, number][] = [[0.45, 0.14], [0.5, 0.3], [0.62, 0.48], [0.3, 0.2], [0.38, 0.46], [0.72, 0.7], [0.55, 0.62], [0.64, 0.86], [0.8, 0.82]];
  return (<group>
    <Room p={[x, 0, 0]} w={10} d={8} wall={T('#b8a080')} floor={T('#6a4a30')} />
    <M m={T('#5a3a22')} p={[x, 2.1, -3.88]} s={[3.2, 4.2, 0.1]} />
    <Img t={D.map} p={[x, 2.1, -3.8]} s={[3.0, 4.0]} />
    {PINS.map(([u, v], i) => { const k = cl((lf - 6 - Math.floor(i / 3) * 22 - (i % 3) * 5) / 6); return k <= 0 ? null : <group key={i} position={[x - 1.5 + u * 3.0, 4.1 - v * 4.0, -3.74]} scale={pop(k)}>
      <M g={sph} m={basic('#ff5a4a')} s={0.09} sh={false} /><mesh geometry={sph} scale={0.22}><meshBasicMaterial color="#ffb080" transparent opacity={0.35} depthWrite={false} /></mesh></group>; })}
    <M m={T('#6a3a22')} p={[x, 0.42, 0.9]} s={[2.6, 0.84, 1.0]} />
    <group position={[x, 0.86, 0.5]}><M g={cyl} m={T('#e8d8b0')} p={[0, 0.06, 0]} s={[0.07, 1.4, 0.07]} r={[0, 0, Math.PI / 2]} />
      {sc > 0 && <Img t={D.scroll} p={[0, 0.02, 0.4 + sc * 0.9]} s={[1.3, sc * 1.8]} r={[-Math.PI / 2, 0, 0]} />}</group>
  </group>); };
const Years: React.FC<P> = ({d, st}) => { const D = d.d, x = X.years, c = st.ex.cal ?? -1, s = st.ex.stamp ?? -1;
  const fl = cl(c / 8), down = s > 0 && s < 10 ? 1 - Math.abs(s - 5) / 5 : 0;
  return (<group>
    <Room p={[x, 0, 0]} w={10} d={8} wall={T('#9ab0a8')} floor={T('#5a4a3a')} />
    <Img t={D.signComm} p={[x + 1.2, 2.95, -3.9]} s={[2.4, 0.95]} />
    <group position={[x - 2.2, 2.2, -3.85]}><Img t={fl < 0.5 ? D.cal17 : D.cal24} p={[0, 0, 0]} s={[1.1, 1.4 * Math.abs(1 - 2 * fl)]} /></group>
    <M m={T('#4a2a18')} p={[x, 0.5, 0]} s={[2.6, 1.0, 1.2]} /><M m={T('#2f6f73')} p={[x, 1.02, 0]} s={[2.7, 0.05, 1.3]} />
    <Img t={D.letter} p={[x - 0.3, 1.06, 0.2]} s={[0.6, 0.75]} r={[-Math.PI / 2, 0, 0]} />
    {s > 4 && <Img t={D.stamp} p={[x - 0.3, 1.07, 0.3]} s={[0.55, 0.21]} r={[-Math.PI / 2, 0, 0.12]} />}
    <group position={[x - 0.3, 1.1 + 0.35 * (1 - down) + (s <= 0 ? 0.2 : 0), 0.3]}><M m={T('#7a3b22')} p={[0, 0.06, 0]} s={[0.4, 0.12, 0.25]} /><M g={cyl} m={T('#a8743a')} p={[0, 0.25, 0]} s={[0.06, 0.3, 0.06]} /><M g={sph} m={T('#7a3b22')} p={[0, 0.42, 0]} s={0.1} /></group>
  </group>); };
const Miles: React.FC<P> = ({d, st}) => { const D = d.d, x = X.miles;
  return (<group><Sky t={D.skyDay} at={[x, 0, 0]} r={420} /><Mountains x={x + 300} z={-200} /><DesertRoad d={D} x0={x - 60} x1={x + 700} line={st.ex.line} seed={17} />
    {st.ex.line && <M g={sph} m={basic('#ffffff')} p={[st.ex.line[1], 0.1, 0]} s={0.5} sh={false} />}</group>); };
const Modern: React.FC<P> = ({d, st}) => { const D = d.d, x = X.modern;
  return (<group><Sky t={D.skyNight} at={[x, 0, 0]} /><DesertRoad d={D} x0={x - 320} x1={x + 320} line={st.ex.line} newRoad seed={19} /><Cars st={st} night />
    {Array.from({length: 14}, (_, i) => <group key={i}><M g={cyl} m={T('#8a8a92')} p={[x - 120 + i * 18, 3, -4.2]} s={[0.08, 6, 0.08]} /><M g={sph} m={basic('#ffe8b0')} p={[x - 120 + i * 18, 6.1, -3.6]} s={0.22} sh={false} />
      <mesh geometry={sph} position={[x - 120 + i * 18, 0.05, -2.4]} scale={[3, 0.02, 2]}><meshBasicMaterial color="#ffe8b0" transparent opacity={0.18} depthWrite={false} /></mesh></group>)}</group>); };
const End: React.FC<P> = ({d, st}) => { const D = d.d, x = X.end, c = st.cars[0];
  return (<group>
    <Sky t={D.skyGold} at={[x, 0, 0]} /><Mountains x={x} col="#8a5a7a" col2="#a8708a" /><DesertRoad d={D} x0={x - 120} x1={x + 120} line={st.ex.line} seed={21} />
    <Can d={D} p={[x + 2.8, 0, -1.6]} s={1.2} /><Brush p={[x + 1.5, 0.02, -0.1]} ry={Math.PI} tilt={1.2} s={1.1} />
    {[-14, 9].map((dx, i) => <Palm key={i} p={[x + dx, 0, -8 - i * 3]} h={7.5} />)}
    {/* today: a modern car on a modern road, the line under the bonnet */}
    <Sky t={D.skyDay} at={[X.dash, 0, 0]} /><DesertRoad d={D} x0={X.dash - 100} x1={X.dash + 200} line={[X.dash - 100, X.dash + 200]} newRoad seed={23} />
    {c && <ModernCar p={c.p} ry={0} col="#5b7fb5" />}
  </group>); };
export const SetBefore: React.FC<P> = (p) => {
  switch (p.st.loc) {
    case 'hook': return <Hook {...p} />; case 'town': return <Town {...p} />; case 'road': return <Road {...p} sand={p.st.ex.dust !== undefined} />;
    case 'idea': return <Idea {...p} />; case 'county': return <County {...p} />; case 'door': return <Door {...p} />;
    case 'store': return <><Grocery m={p.d.g} f={p.f} /><Can d={p.d.d} p={[-2.75, 1.05, 1.6]} s={0.9} /></>;
    case 'brush': return <BrushClose {...p} />; case 'stare': return <Stare {...p} />; case 'stretch': return <Stretch {...p} />;
    case 'club': return <Club {...p} />; case 'map': return <MapRoom {...p} />; case 'years': return <Years {...p} />;
    case 'miles': return <Miles {...p} />; case 'modern': return <Modern {...p} />; case 'end': return <End {...p} />;
  }
  return null;
};
export const SetAfter: React.FC<P> = () => null;
void box;
