// Sets for "Why stop signs are red": each beat renders only its own location (see stage.ts X / CORNER).
import React from 'react';
import * as THREE from 'three';
import type {Tod} from '../../engine/look/look';
import {Town} from '../../engine/kits/downtown/town';
import {Car, ThingsView} from '../../engine/kits/downtown/street';
import {useDesert, Sky, Mountains, DesertRoad, ModernCar, Room, M, T, basic, sph, cyl, cone, plane, box, glow, Cactus, Poles, Lamp, Halo, Motes, SunDisk, Frame, Rug, Shelf, Stars, rnd} from '../../engine/kits/desert/desert';
import {Sign, SignWall, PaintCanC, Hammer, Calendar, Easel} from '../../engine/kits/signs/signs';
import {X, CORNER, type Stage} from './stage';
export const AUDIO: {voice: string | null; bed: string | null} = {voice: null, bed: '03_stop_sign/mix.wav'};
export const useSetData = () => ({d: useDesert()});
type P = {d: ReturnType<typeof useSetData>; f: number; st: Stage; cam: THREE.Vector3; vel: (THREE.Vector3 | null)[]; tod: Tod};
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pop = (t: number) => { t = cl(t); return 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); };
const YEL = '#f2c230', RED = '#c8202a';
const Cars: React.FC<{st: Stage; night?: boolean}> = ({st, night}) => <>{st.cars.map((c, i) => c.col?.startsWith('M:')
  ? <ModernCar key={i} p={c.p} ry={c.ry} col={c.col.slice(2)} night={night} /> : <group key={i}><Car c={c} />{night && <HeadBeam c={c} />}</group>)}</>;
/** headlight cone + glowing lamps for a kit car at night (front = +x local) */
const HeadBeam: React.FC<{c: {p: [number, number, number]; ry?: number}}> = ({c}) => (<group position={c.p} rotation={[0, c.ry ?? 0, 0]}>
  {[-0.5, 0.5].map((z) => <group key={z}><M g={sph} m={glow('#fff2c8', 3)} p={[1.95, 0.95, z]} s={0.11} sh={false} /><Halo p={[2.05, 0.95, z]} col="#fff0c0" s={1.2} o={0.6} /></group>)}
  <mesh geometry={cone} position={[6.8, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} scale={[2.2, 10, 1.6]}><meshBasicMaterial color="#fff2c0" transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
</group>);
/** a dark night dome inside the town's painted day sky */
const NightDome: React.FC<{at: [number, number, number]; f: number}> = ({at, f}) => (<group>
  <mesh geometry={sph} position={at} scale={120}><meshBasicMaterial color="#0b1028" side={THREE.BackSide} fog={false} depthWrite={false} /></mesh>
  <Stars at={at} f={f} r={110} /><SunDisk at={at} dir={[-0.5, 0.55, 0.9]} col="#e8eeff" r={3.5} dist={100} />
</group>);
/** corner lamp light pools for the night town */
const TownNight: React.FC = () => (<group>{[34, 40, 56, 62].map((x, i) => <group key={i}><Lamp p={[x, 3.38, i < 2 ? 7.9 : 18.5]} col="#ffd28a" k={3.2} light={1.6} />
  <mesh geometry={sph} position={[x, 0.03, i < 2 ? 7.4 : 18]} scale={[2.6, 0.02, 2.2]}><meshBasicMaterial color="#ffcf80" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh></group>)}</group>);

const Hook: React.FC<P> = ({f, st}) => (<group>
  <Town tod="day" /><NightDome at={[48, 0, 12]} f={f} /><TownNight /><Cars st={st} night />
  <Sign p={CORNER} ry={-Math.PI / 2} bg={YEL} fg="#1e1e24" glow={0.25 + 0.5 * (st.ex.brake ?? 0)} grime={0.2} />
  {(st.ex.brake ?? 0) > 0 && st.cars[0] && Array.from({length: 2}, (_, i) => <mesh key={i} geometry={plane} position={[st.cars[0].p[0] - 3 - (st.ex.brake ?? 0) * 6, 0.012, 11.7 + (i ? 0.75 : -0.75)]} rotation={[-Math.PI / 2, 0, 0]} scale={[(st.ex.brake ?? 0) * 12, 0.18, 1]}><meshBasicMaterial color="#141418" transparent opacity={0.55} depthWrite={false} /></mesh>)}
  <Motes c={[44, 1.2, 11.5]} size={[6, 2.2, 4]} f={f} n={40} col="#fff0c8" seed={31} />
</group>);
const Detroit: React.FC<P> = ({f, st, cam}) => (<group>
  <Town tod="day" /><Cars st={st} /><ThingsView t={st.things} f={f} cam={cam} />
  <Motes c={[48, 1.5, 12]} size={[14, 3, 10]} f={f} n={50} seed={33} />
</group>);
const Square: React.FC<P> = ({f, st}) => { const lf = st.ex.hammer ?? 0, n = st.ex.nailed ?? 99, sw = lf < n ? Math.abs(Math.sin(lf * 0.32)) : 0;
  return (<group>
    <Town tod="day" />
    <Sign p={CORNER} ry={-Math.PI / 2 + 0.25} shape="square" bg="#f4f1ea" fg="#1e1e24" size={0.34} post={2.0} />
    <Hammer p={[CORNER[0] - 0.42, 2.05 + sw * 0.25, CORNER[2] - 0.12]} r={[0, -Math.PI / 2, -0.4 - sw * 1.1]} s={1.4} />
    {lf >= n && <M g={sph} m={glow('#fff6d0', 1.6)} p={[CORNER[0] - 0.05, 2.32, CORNER[2]]} s={0.025} sh={false} />}
    <Motes c={[CORNER[0], 1.8, CORNER[2]]} size={[2, 1.5, 2]} f={f} n={30} seed={35} />
  </group>); };
const Night: React.FC<P> = ({f, st}) => (<group>
  <Town tod="day" /><NightDome at={[40, 0, 12]} f={f} /><Cars st={st} night />
  <Sign p={CORNER} ry={-Math.PI / 2} shape="square" bg="#7a7a74" fg="#3a3a3a" size={0.34} post={2.0} />
</group>);
const Wall: React.FC<P> = ({d, f}) => { const x = X.wall;
  return (<group>
    <Sky t={d.d.skyDay} at={[x, 0, 0]} /><DesertRoad d={d.d} x0={x - 40} x1={x + 40} seed={41} />
    <SignWall p={[x, 0, -2.4]} w={10} n={24} /><SignWall p={[x + 10.6, 0, -2.8]} w={9} n={18} />
    <Sign p={[x - 6.4, 0, -1.6]} shape="square" bg="#f4f1ea" fg="#1e1e24" size={0.34} />
    <Motes c={[x, 1.6, -1]} size={[12, 2.6, 3]} f={f} n={40} seed={37} />
  </group>); };
const SHAPES: {k: 'oct' | 'circle' | 'tri' | 'dia' | 'sq'; dx: number; dz: number; col: string}[] = [
  {k: 'circle', dx: -0.85, dz: 0.1, col: '#f4f1ea'}, {k: 'oct', dx: -0.2, dz: 0.25, col: YEL}, {k: 'tri', dx: 0.45, dz: 0.05, col: '#f4f1ea'}, {k: 'dia', dx: 1.0, dz: 0.3, col: YEL}, {k: 'sq', dx: 0.2, dz: -0.35, col: '#f4f1ea'}];
const Cut: React.FC<{k: string; col: string; s?: number; glowK?: number}> = ({k, col, s = 0.22, glowK = 0}) => { const seg = k === 'circle' ? 36 : k === 'oct' ? 8 : k === 'tri' ? 3 : 4;
  return <mesh rotation={[0, k === 'oct' ? Math.PI / 8 : k === 'sq' ? Math.PI / 4 : 0, 0]} scale={[s, 0.02, s]} castShadow receiveShadow>
    <cylinderGeometry args={[1, 1, 1, seg]} />{glowK > 0 ? <meshBasicMaterial color={new THREE.Color(col).multiplyScalar(1 + glowK)} toneMapped={false} /> : <meshToonMaterial color={col} />}</mesh>; };
const RoomSet: React.FC<P> = ({f, st}) => { const x = X.room, sh = st.ex.shapes ?? -99, lift = st.ex.lift ?? -99, up = cl(lift / 14);
  return (<group>
    <Room p={[x, 0, 0]} w={10} d={8} wall={T('#8a9a88')} floor={T('#5a3a26')} />
    <M m={T('#3a2a1a')} p={[x, 0.55, -3.86]} s={[10, 1.1, 0.08]} />
    <M m={T('#5a3a22')} p={[x, 0.4, 0]} s={[2.8, 0.8, 1.6]} /><M m={T('#2f5a4a')} p={[x, 0.82, 0]} s={[2.9, 0.04, 1.7]} />
    {SHAPES.map((q, i) => { const lit = sh > i * 7 ? cl((sh - i * 7) / 6) : 0, isOct = q.k === 'oct';
      return <group key={i} position={[x + q.dx, 0.86 + (isOct ? up * 0.9 : 0), q.dz]} rotation={[isOct ? -up * 1.2 : 0, 0, 0]} scale={isOct ? 1 + up * 0.4 : 1}><Cut k={q.k} col={q.col} glowK={lit * 0.5} /></group>; })}
    <Shelf p={[x - 3.6, 0, -3.6]} seed={4} /><Frame p={[x + 0.4, 2.3, -3.85]} w={1.4} h={0.9} art="#c8b890" />
    <M m={T('#1e2a24')} p={[x + 2.6, 2.1, -3.86]} s={[2.0, 1.2, 0.05]} />{[0, 1, 2].map((i) => <M key={i} m={T('#e8e8e0')} p={[x + 2.0 + i * 0.55, 2.2, -3.82]} s={[0.36, 0.36, 0.01]} sh={false} />)}
    <Lamp p={[x, 3.0, 0]} hang={0.6} k={3} light={1.2} /><Rug p={[x, 0, 0]} w={5} d={3.4} col="#4a3a2a" edge="#c8a060" />
    <Motes c={[x, 1.7, 0]} size={[6, 2.6, 4]} f={f} n={50} seed={39} />
  </group>); };
/** top-down road plan on a drafting table: a main road, a railway, a side road */
const planTex = (() => { if (typeof document === 'undefined') return null as any; const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d')!;
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, 1024, 1024); g.strokeStyle = 'rgba(90,120,150,.25)'; g.lineWidth = 2; for (let i = 0; i < 1024; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
  g.fillStyle = '#8a8478'; g.fillRect(0, 440, 1024, 150); g.fillRect(640, 0, 130, 1024);
  g.strokeStyle = '#f4f1ea'; g.lineWidth = 6; g.setLineDash([30, 24]); g.beginPath(); g.moveTo(0, 515); g.lineTo(1024, 515); g.stroke(); g.setLineDash([]);
  g.strokeStyle = '#4a3a2a'; g.lineWidth = 10; g.beginPath(); g.moveTo(230, 0); g.lineTo(230, 1024); g.moveTo(270, 0); g.lineTo(270, 1024); g.stroke();
  g.lineWidth = 8; for (let y = 10; y < 1024; y += 34) { g.beginPath(); g.moveTo(205, y); g.lineTo(295, y); g.stroke(); }
  g.strokeStyle = '#f4f1ea'; g.lineWidth = 14; g.beginPath(); g.moveTo(626, 446); g.lineTo(626, 584); g.stroke();
  g.fillStyle = '#3a4a66'; g.font = '900 34px "Archivo Black", Impact, sans-serif'; g.fillText('RAILROAD', 300, 120); g.fillText('STOP LINE', 420, 640);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; return t; })();
const Board: React.FC<P> = ({f, st}) => { const x = X.board, [a, b] = st.ex.drop ?? [-99, -99];
  const drop = (k: number) => ({y: 0.05 + (1 - cl(k / 10)) * 3, s: k < 0 ? 0 : pop(k / 10)});
  const A = drop(a), B = drop(b);
  return (<group>
    <M m={T('#5a3a22')} p={[x, -0.25, 0]} s={[8, 0.5, 8]} />
    <mesh geometry={plane} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[7.4, 7.4, 1]} receiveShadow><meshToonMaterial map={planTex} /></mesh>
    {A.s > 0 && <group position={[x - 1.85, A.y, -0.05]} scale={A.s}><Cut k="circle" col="#f4f1ea" s={0.5} /><Halo p={[0, 0.1, 0]} col="#fff0c0" s={1.6} o={0.3 * cl(a / 10)} /></group>}
    {B.s > 0 && <group position={[x + 1.15, B.y, 0.05]} scale={B.s}><Cut k="oct" col={YEL} s={0.5} /><Halo p={[0, 0.1, 0]} col="#ffe080" s={1.6} o={0.35 * cl(b / 10)} /></group>}
    <group position={[x + 2.9, 0.05, 2.6]} rotation={[0, 0.6, 0]}><M g={cyl} m={T('#c8a060')} p={[0, 0.03, 0]} s={[0.025, 1.4, 0.025]} r={[0, 0, Math.PI / 2]} /></group>
    <M m={T('#e8e0c8')} p={[x - 2.8, 0.02, 2.7]} s={[1.0, 0.02, 0.7]} />
    <Lamp p={[x + 2.6, 2.6, -2.2]} k={2.6} light={1.4} />
    <Motes c={[x, 1.0, 0]} size={[6, 1.6, 6]} f={f} n={40} seed={43} />
  </group>); };
const Snow: React.FC<P> = ({d, f, st}) => { const x = X.snow, t = st.ex.snowT ?? 0;
  return (<group>
    <mesh geometry={sph} position={[x, 0, 0]} scale={150}><meshBasicMaterial color="#c8d4e4" side={THREE.BackSide} fog={false} /></mesh>
    <M g={plane} m={T('#eef3fa')} p={[x, 0, 0]} s={[300, 300, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
    <M g={plane} m={T('#b8bcc4')} p={[x, 0.02, 0]} s={[300, 5.6, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
    {Array.from({length: 40}, (_, i) => <M key={i} g={sph} m={T('#f4f8ff')} p={[x - 60 + i * 3.1, 0.03, (i % 2 ? 2.9 : -2.9)]} s={[1.4, 0.06, 0.4]} sh={false} />)}
    {Array.from({length: 26}, (_, i) => { const px = x - 40 + rnd(i, 3) * 80, pz = (rnd(i, 4) > 0.5 ? 1 : -1) * (7 + rnd(i, 5) * 20), h = 3 + rnd(i, 6) * 3;
      return <group key={i} position={[px, 0, pz]}><M g={cyl} m={T('#5a3a26')} p={[0, 0.5, 0]} s={[0.15, 1, 0.15]} />{[0, 1, 2].map((k) => <group key={k}><M g={cone} m={T('#2f5a3a')} p={[0, 1.2 + k * h * 0.22, 0]} s={[h * 0.32 * (1 - k * 0.25), h * 0.32, h * 0.32 * (1 - k * 0.25)]} /><M g={cone} m={T('#f4f8ff')} p={[0, 1.38 + k * h * 0.22, 0]} s={[h * 0.24 * (1 - k * 0.25), h * 0.16, h * 0.24 * (1 - k * 0.25)]} /></group>)}</group>; })}
    <Sign p={[x - 0.2, 0, -3.3]} ry={Math.PI / 2} bg={YEL} fg="#1e1e24" snow={1} grime={0.3} />
    <Cars st={st} />
    {/* falling snow */}
    {Array.from({length: 120}, (_, i) => { const yy = 6 - ((t * 0.04 + rnd(i, 7) * 6) % 6); return <M key={'s' + i} g={sph} m={T('#ffffff')} p={[x - 6 + rnd(i, 8) * 12 + Math.sin(t * 0.05 + i) * 0.2, yy, -6 + rnd(i, 9) * 10]} s={0.03 + rnd(i, 10) * 0.03} sh={false} />; })}
  </group>); };
const Paint: React.FC<P> = ({f, st}) => { const x = X.paint, k = st.ex.pick ?? -99, up = cl(k / 12);
  return (<group>
    <Room p={[x, 0, 0]} w={8} d={7} wall={T('#9a8a70')} floor={T('#4a3a2a')} />
    {Array.from({length: 8}, (_, i) => <M key={i} m={T('#6a5a44')} p={[x - 3.5 + i, 1.8, -3.42]} s={[0.06, 3.6, 0.05]} sh={false} />)}
    <M m={T('#6a4428')} p={[x, 0.45, 0]} s={[2.6, 0.9, 1.1]} /><M m={T('#8a5a32')} p={[x, 0.92, 0]} s={[2.7, 0.06, 1.2]} />
    <PaintCanC p={[x - 0.45, 0.95, 0.1]} col={RED} lid={0.4} />
    <group position={[x + 0.45, 0.95 + up * 0.45, 0.1 + up * 0.15]} rotation={[0, 0, -up * 0.15]}><PaintCanC p={[0, 0, 0]} col={YEL} lid={1} /></group>
    {up > 0.2 && <Halo p={[x + 0.45, 1.3 + up * 0.45, 0.2]} col="#ffd860" s={1.6} o={0.35 * up} />}
    {[[-1.0, -0.3], [1.05, -0.25]].map(([dx, dz], i) => <M key={i} m={T(i ? YEL : RED)} p={[x + dx, 0.96, dz]} s={[0.42, 0.01, 0.42]} r={[0, i * 0.3, 0]} sh={false} />)}
    <Shelf p={[x + 2.6, 0, -3.1]} seed={6} /><Lamp p={[x, 2.8, 0.2]} hang={0.6} k={3} light={1.4} />
    <Motes c={[x, 1.6, 0]} size={[5, 2.4, 3]} f={f} n={40} seed={45} />
  </group>); };
const lerpC = (a: string, b: string, t: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), cl(t)).getHexString();
const Fade: React.FC<P> = ({d, f, st}) => { const x = X.fade, k = st.ex.fade ?? 0, s = st.ex.sun ?? 0;
  const col = k < 0.55 ? lerpC(RED, '#e89aa0', k / 0.55) : lerpC('#e89aa0', '#9a9894', (k - 0.55) / 0.45);
  const a = (s / 26) * Math.PI;   // the sun arcs across the sky every ~1.7 s
  return (<group>
    <Sky t={d.d.skyDay} at={[x, 0, 0]} /><Mountains x={x} /><DesertRoad d={d.d} x0={x - 60} x1={x + 60} seed={47} />
    <SunDisk at={[x, 0, 0]} dir={[Math.cos(a), Math.max(0.05, Math.sin(a)), -0.6]} col="#fff0c0" r={6} />
    <Sign p={[x, 0, -3.3]} bg={col} fg={lerpC('#ffffff', '#d8d4cc', k)} grime={k} />
    {[-14, 9, 22].map((dx, i) => <Cactus key={i} p={[x + dx, 0, -10 - i * 3]} h={3} ry={i} />)}
  </group>); };
const Montage: React.FC<P> = ({d, f, st}) => { const x = X.montage, y = st.ex.year ?? 1924;
  return (<group>
    <Sky t={d.d.skyGold} at={[x + 30, 0, 0]} r={200} /><Mountains x={x + 40} col="#8a5a7a" col2="#a8708a" />
    <DesertRoad d={d.d} x0={x - 60} x1={x + 160} line={[x - 60, x + 160]} dash seed={49} />
    {Array.from({length: 7}, (_, i) => <group key={i}><Sign p={[x + i * 18, 0, -3.4]} bg={YEL} fg="#1e1e24" grime={0.15} />
      <M g={plane} m={T('#8a8478')} p={[x + i * 18 + 1.6, 0.015, -8]} s={[3, 10, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} /></group>)}
    <group position={[x + 24, 0, -7.5]}>{[-1.4, 1.4].map((dx) => <M key={dx} g={cyl} m={T('#6a4428')} p={[dx, 2.2, 0]} s={[0.1, 4.4, 0.1]} />)}
      <M m={T('#f4ead6')} p={[0, 4.2, 0]} s={[4.4, 2.6, 0.12]} /><Calendar p={[0, 4.2, 0.12]} y={y} s={1.4} /></group>
    <Poles x0={x - 40} x1={x + 160} z={-6.5} /><Cars st={st} />
    {[-30, 10, 50, 90].map((dx, i) => <Cactus key={i} p={[x + dx, 0, 9 + i * 2]} h={3.4} ry={i} />)}
    <Motes c={[x + 20, 1.4, 0]} size={[30, 2.4, 6]} f={f} n={60} col="#ffd8a0" seed={51} />
  </group>); };
const Works: React.FC<P> = ({f, st}) => { const x = X.works, k = st.ex.cloth ?? 0;
  return (<group>
    <Room p={[x, 0, 0]} w={14} d={9} h={5} wall={T('#7a8088')} floor={T('#4a4a52')} />
    {Array.from({length: 6}, (_, i) => <group key={i}><M g={cyl} m={T('#8a8a92')} p={[x - 5.5 + i * 2.2, 3.2, -3.6]} s={[0.5, 2.6, 0.5]} /><M g={cyl} m={T(['#c8202a', '#f2c230', '#2a5f9a'][i % 3])} p={[x - 5.5 + i * 2.2, 3.2, -3.6]} s={[0.505, 0.6, 0.505]} /></group>)}
    {[-4, 0, 4].map((dx, i) => <Lamp key={i} p={[x + dx, 4.0, -0.5]} hang={0.8} k={3.4} light={i === 1 ? 2.0 : 0.9} />)}
    <Easel p={[x, 0, -0.2]} k={k}><Sign p={[0, -1.1, 0.02]} bg={RED} fg="#ffffff" size={0.62} post={2.8} glow={0.12 + 0.35 * k} /></Easel>
    {k > 0.3 && <Halo p={[x, 1.75, 0.3]} col="#ff6050" s={3.4} o={0.35 * k} />}
    <Rug p={[x, 0, 0.6]} w={6} d={3} col="#3a3a44" edge="#c8a060" />
    <Motes c={[x, 2.0, 0]} size={[8, 3, 4]} f={f} n={60} seed={53} />
  </group>); };
const Today: React.FC<P> = ({d, f, st}) => { const x = X.today, br = st.ex.brake ?? 0, c = st.cars[0];
  return (<group>
    <mesh geometry={sph} position={[x, 0, 0]} scale={150}><meshBasicMaterial color="#0a0f26" side={THREE.BackSide} fog={false} /></mesh>
    <Stars at={[x, 0, 0]} f={f} /><SunDisk at={[x, 0, 0]} dir={[0.4, 0.5, -0.9]} col="#e8eeff" r={4} />
    <DesertRoad d={d.d} x0={x - 120} x1={x + 120} line={[x - 120, x - 6]} dash newRoad seed={55} />
    <M g={plane} m={T('#3a3c46')} p={[x + 1.5, 0.018, 0]} s={[6, 160, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
    <M g={plane} m={T('#f4f1ea')} p={[x - 2.1, 0.05, 1.6]} s={[0.35, 3, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
    <Sign p={[x - 2.0, 0, 3.6]} ry={-Math.PI / 2} bg={RED} fg="#ffffff" glow={0.2 + 0.9 * br} />
    {Array.from({length: 8}, (_, i) => { const hx = x - 40 + i * 11, hz = i % 2 ? -14 : 14; return <group key={i} position={[hx, 0, hz]}>
      <M m={T(['#5a5a66', '#6a5a50', '#4a5a6a'][i % 3])} p={[0, 1.6, 0]} s={[6, 3.2, 5]} /><M g={cone} m={T('#2a2a32')} p={[0, 3.9, 0]} s={[4.6, 1.5, 3.6]} r={[0, Math.PI / 4, 0]} />
      {[-1.6, 1.6].map((wx) => <M key={wx} m={glow(rnd(i, 2) > 0.3 ? '#ffd08a' : '#a8c0ff', 1.3)} p={[wx, 1.7, hz > 0 ? -2.52 : 2.52]} s={[0.9, 0.8, 0.02]} sh={false} />)}</group>; })}
    {Array.from({length: 6}, (_, i) => <group key={'l' + i}><M g={cyl} m={T('#8a8a92')} p={[x - 50 + i * 20, 3, -4.6]} s={[0.08, 6, 0.08]} /><Lamp p={[x - 50 + i * 20, 6.0, -4.0]} col="#ffd89a" k={3.2} /></group>)}
    {c && <ModernCar p={c.p} ry={c.ry} col="#e8e8f0" night />}
    {c && br > 0 && [-0.6, 0.6].map((z) => <Halo key={z} p={[c.p[0] - 2.2, 0.72, c.p[2] + z]} col="#ff2020" s={1.4} o={0.7 * br} />)}
  </group>); };
export const SetBefore: React.FC<P> = (p) => {
  switch (p.st.loc) {
    case 'hook': return <Hook {...p} />; case 'detroit': return <Detroit {...p} />; case 'square': return <Square {...p} />; case 'night': return <Night {...p} />;
    case 'wall': return <Wall {...p} />; case 'room': return <RoomSet {...p} />; case 'board': return <Board {...p} />; case 'snow': return <Snow {...p} />;
    case 'paint': return <Paint {...p} />; case 'fade': return <Fade {...p} />; case 'montage': return <Montage {...p} />; case 'works': return <Works {...p} />;
    case 'today': return <Today {...p} />;
  }
  return null;
};
export const SetAfter: React.FC<P> = () => null;
void basic; void box;
