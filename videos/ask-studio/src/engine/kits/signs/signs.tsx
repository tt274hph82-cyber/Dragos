// Road-sign kit: STOP signs (octagon / square / circle) with painted faces in any colour, snow caps, a wall of signs,
// a railroad-crossing disk, paint cans, a hammer, a year calendar and a cloth-covered easel. Toon style, matches the desert kit.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {lookToon} from '../../look/look';
import {M, T, glow, cyl, sph, box, plane, type V3} from '../desert/desert';

const FONT = '"Archivo Black", Anton, Impact, sans-serif';
const cv = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const faceCache = new Map<string, THREE.Texture>();
/** painted sign face: background colour, text colour, border; octagon / square / circle cut is done by the geometry */
export const signFace = (bg: string, fg: string, text: string, shape: 'oct' | 'square' | 'circle', grime = 0) => {
  const k = [bg, fg, text, shape, grime.toFixed(2)].join('|'); let t = faceCache.get(k); if (t) return t;
  const c = cv(512, 512), g = c.getContext('2d')!;
  g.fillStyle = bg; g.fillRect(0, 0, 512, 512);
  // inner border following the shape
  g.strokeStyle = fg; g.lineWidth = 16; g.beginPath();
  if (shape === 'oct') { for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i / 8) * Math.PI * 2, x = 256 + Math.cos(a) * 222, y = 256 + Math.sin(a) * 222; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); }
  else if (shape === 'circle') g.arc(256, 256, 222, 0, Math.PI * 2); else g.rect(34, 34, 444, 444);
  g.stroke();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (text === 'RR') { g.lineWidth = 30; g.beginPath(); g.moveTo(130, 130); g.lineTo(382, 382); g.moveTo(382, 130); g.lineTo(130, 382); g.stroke();
    g.font = `900 110px ${FONT}`; g.fillText('R', 150, 256); g.fillText('R', 362, 256); }
  else { g.font = `900 ${text.length > 4 ? 120 : 150}px ${FONT}`; g.fillText(text, 256, 262); }
  // weather: speckle + sun bleaching wash (grime 0..1)
  if (grime > 0) { for (let i = 0; i < 400 * grime; i++) { g.fillStyle = `rgba(${i % 2 ? '255,255,255' : '60,50,40'},${0.12 * grime})`; g.fillRect((i * 97) % 512, (i * 211) % 512, 6, 6); } }
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; faceCache.set(k, t); return t;
};
/** the cylinder cap maps the canvas sideways: a rotated copy for octagon / circle faces */
const capCache = new Map<string, THREE.Texture>();
const capTex = (t: THREE.Texture, rot: number) => { const k = t.uuid + rot; let c = capCache.get(k); if (!c) { c = t.clone(); c.center.set(0.5, 0.5); c.rotation = rot; c.needsUpdate = true; capCache.set(k, c); } return c; };
export let CAP_ROT = Math.PI / 2;
const octGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1); octGeo.rotateY(Math.PI / 8);
const circGeo = new THREE.CylinderGeometry(1, 1, 1, 40, 1);
const mcache = new Map<string, THREE.Material[]>();
const faceMats = (tex: THREE.Texture, edge: string, gl: number) => { const k = tex.uuid + edge + gl; let m = mcache.get(k); if (m) return m;
  const face = gl > 0 ? new THREE.MeshBasicMaterial({map: tex, color: new THREE.Color(1, 1, 1).multiplyScalar(1 + gl), toneMapped: gl <= 0}) : lookToon({map: tex});
  m = [lookToon({color: edge}), face, lookToon({color: '#7a7a82'})]; mcache.set(k, m); return m; };

export type SignP = {p: V3; ry?: number; shape?: 'oct' | 'square' | 'circle'; bg?: string; fg?: string; text?: string; size?: number; post?: number; snow?: number; grime?: number; glow?: number; tilt?: number};
/** a sign on a post; face points +z (before ry). glow > 0 = lit by headlights (blooms) */
export const Sign: React.FC<SignP> = ({p, ry = 0, shape = 'oct', bg = '#c8262e', fg = '#ffffff', text = 'STOP', size = 0.38, post = 2.1, snow = 0, grime = 0, glow: gl = 0, tilt = 0}) => {
  const raw = signFace(bg, fg, text, shape, grime), tex = shape === 'square' ? raw : capTex(raw, shape === 'oct' ? CAP_ROT - Math.PI / 8 : CAP_ROT), mats = faceMats(tex, '#d8d8dc', gl);
  const geo = shape === 'oct' ? octGeo : shape === 'circle' ? circGeo : box;
  return (<group position={p} rotation={[0, ry, tilt]}>
    <M g={cyl} m={T('#8a8a92')} p={[0, post / 2, -0.03]} s={[0.035, post, 0.035]} />
    <group position={[0, post, 0]}>
      {shape === 'square' ? <mesh geometry={box} scale={[size * 1.7, size * 1.7, 0.03]} material={[mats[0], mats[0], mats[0], mats[0], mats[1], mats[2]]} castShadow receiveShadow />
        : <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]} scale={[size, 0.03, size]} castShadow receiveShadow>
          {/* cylinder groups: 0 side, 1 top (+y -> +z after rotation), 2 bottom */}
          <primitive object={mats[0]} attach="material-0" /><primitive object={mats[1]} attach="material-1" /><primitive object={mats[2]} attach="material-2" /></mesh>}
      {snow > 0 && <group><M g={sph} m={T('#f4f8ff')} p={[0, size * 0.93, 0]} s={[size * 0.75, 0.07 * snow + 0.02, 0.06]} />{[-1, 1].map((sx) => <M key={sx} g={sph} m={T('#f4f8ff')} p={[sx * size * 0.62, size * 0.66, 0]} s={[size * 0.28, 0.05, 0.05]} r={[0, 0, sx * -0.75]} />)}</group>}
    </group>
    {snow > 0 && <M g={sph} m={T('#f4f8ff')} p={[0, 0.02, 0]} s={[0.35, 0.08, 0.35]} />}
  </group>);
};
/** a fence of many plain white signs (shop signs, notices, arrows) all the same colour */
export const SignWall: React.FC<{p: V3; w?: number; h?: number; n?: number}> = ({p, w = 9, h = 3.2, n = 22}) => {
  const words = ['STOP', 'SLOW', 'KEEP RIGHT', 'NO PARKING', 'DETOUR', 'SCHOOL', 'HOTEL', 'GARAGE', 'DANGER', 'TURN', 'ONE WAY', 'BRIDGE'];
  return (<group position={p}>
    <M m={T('#6a4a32')} p={[0, h / 2, -0.08]} s={[w + 0.4, h + 0.3, 0.1]} />
    {Array.from({length: n}, (_, i) => { const c = i % 6, r = Math.floor(i / 6), sw = 1.1 + ((i * 7) % 3) * 0.2, x = -w / 2 + 0.8 + c * (w - 1.4) / 5 + ((i * 13) % 5 - 2) * 0.05, y = 0.55 + r * 0.8;
      const t = words[i % words.length]; return <mesh key={i} geometry={box} position={[x, y, 0]} rotation={[0, 0, ((i * 31) % 7 - 3) * 0.02]} scale={[sw, 0.6, 0.03]}
        material={[T('#d8d8dc'), T('#d8d8dc'), T('#d8d8dc'), T('#d8d8dc'), lookToon({map: signFace('#f4f1ea', '#1e1e24', t, 'square')}), T('#7a7a82')]} castShadow />; })}
  </group>);
};
export const PaintCanC: React.FC<{p: V3; col: string; s?: number; lid?: number}> = ({p, col, s = 1, lid = 0}) => (<group position={p} scale={s}>
  <M g={cyl} m={T('#b8b8c0')} p={[0, 0.2, 0]} s={[0.17, 0.4, 0.17]} /><M g={cyl} m={T(col)} p={[0, 0.2, 0]} s={[0.172, 0.24, 0.172]} />
  <M g={cyl} m={T(col)} p={[0, 0.405, 0]} s={[0.155, 0.01, 0.155]} sh={false} />
  {lid > 0 && <M g={cyl} m={T('#a8a8b0')} p={[0.25 * lid, 0.42 + 0.1 * lid, 0]} s={[0.17, 0.02, 0.17]} r={[0, 0, 0.6 * lid]} />}
  <mesh position={[0, 0.42, 0]}><torusGeometry args={[0.17, 0.008, 6, 20, Math.PI]} /><meshToonMaterial color="#8a8a92" /></mesh>
</group>);
export const Hammer: React.FC<{p: V3; r?: V3; s?: number}> = ({p, r = [0, 0, 0], s = 1}) => (<group position={p} rotation={r} scale={s}>
  <M g={cyl} m={T('#a8743a')} p={[0, -0.18, 0]} s={[0.022, 0.36, 0.022]} /><M m={T('#4a4a52')} p={[0, 0, 0]} s={[0.2, 0.06, 0.06]} /><M g={cyl} m={T('#5a5a62')} p={[0.1, 0, 0]} s={[0.04, 0.05, 0.04]} r={[0, 0, Math.PI / 2]} /></group>);
const calCache = new Map<number, THREE.Texture>();
const calTex = (y: number) => { let t = calCache.get(y); if (t) return t; const c = cv(256, 320), g = c.getContext('2d')!; g.fillStyle = '#fbf3e0'; g.fillRect(0, 0, 256, 320);
  g.fillStyle = '#b2391f'; g.fillRect(0, 0, 256, 80); g.fillStyle = '#fff'; g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.fillText('YEAR', 128, 58);
  g.fillStyle = '#241726'; g.font = `900 104px ${FONT}`; g.fillText(String(y), 128, 220); g.lineWidth = 8; g.strokeStyle = '#241726'; g.strokeRect(4, 4, 248, 312);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; calCache.set(y, t); return t; };
/** a calendar board showing a year (integer part of y), the top page flipping by the fraction */
export const Calendar: React.FC<{p: V3; y: number; s?: number; ry?: number}> = ({p, y, s = 1, ry = 0}) => { const yr = Math.floor(y), fl = y - yr;
  return (<group position={p} rotation={[0, ry, 0]} scale={s}>
    <M m={T('#5a3a22')} p={[0, 0, -0.04]} s={[1.3, 1.6, 0.06]} />
    <mesh geometry={plane} position={[0, 0, 0.01]} scale={[1.1, 1.4, 1]}><meshToonMaterial map={calTex(yr + 1)} /></mesh>
    <group position={[0, 0.7, 0.02]} rotation={[-fl * Math.PI * 0.95, 0, 0]}><mesh geometry={plane} position={[0, -0.7, 0]} scale={[1.1, 1.4, 1]}><meshToonMaterial map={calTex(yr)} side={THREE.DoubleSide} /></mesh></group>
  </group>); };
/** an easel holding a big sign, with a cloth that lifts off by k 0..1 */
export const Easel: React.FC<{p: V3; k: number; children?: React.ReactNode}> = ({p, k, children}) => (<group position={p}>
  {[-0.6, 0.6].map((x) => <M key={x} m={T('#7a4a28')} p={[x, 1.0, -0.2]} s={[0.07, 2.0, 0.07]} r={[0.12, 0, x * -0.15]} />)}<M m={T('#7a4a28')} p={[0, 0.85, 0.05]} s={[1.5, 0.08, 0.2]} />
  {children}
  {k < 1 && <group position={[0, 1.65 + k * 2.4, 0.15 + k * 0.6]} rotation={[k * 0.8, 0, k * 0.3]} scale={[1, 1 - k * 0.5, 1]}>
    <M m={T('#d8cfc0')} s={[1.5, 1.5, 0.08]} /><M m={T('#c8bfb0')} p={[0, -0.8, 0.06]} s={[1.56, 0.16, 0.1]} />{[-0.4, 0, 0.4].map((dx) => <M key={dx} m={T('#bfb6a6')} p={[dx, -0.1, 0.05]} s={[0.05, 1.4, 0.02]} sh={false} />)}</group>}
</group>);
export const useSignsReady = () => useMemo(() => true, []);
