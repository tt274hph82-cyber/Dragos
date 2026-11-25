// Desert-highway kit (California, 1917-1924 + today): low-poly toon sets in the kit's style (flat toon materials, ink-dark
// accents, canvas signs). Every location sits at its own world x so one camera can frame each by name. Written for the
// "woman who painted a line" short; reusable for any desert / road story.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {lookToon} from '../../look/look';
import {drawSign, drawWood, drawWallpaper} from '../../look/draw';

export type V3 = [number, number, number];
const INK = '#241726';
const FONT = '"Archivo Black", Anton, Impact, sans-serif';
const cv = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const tex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; return t; };
const box = new THREE.BoxGeometry(1, 1, 1), cyl = new THREE.CylinderGeometry(1, 1, 1, 18), sph = new THREE.SphereGeometry(1, 20, 14), cone = new THREE.ConeGeometry(1, 1, 5), plane = new THREE.PlaneGeometry(1, 1);
const cache = new Map<string, THREE.Material>();
/** toon material by colour (cached) */
export const T = (c: string, o: THREE.MeshToonMaterialParameters = {}) => { const k = c + JSON.stringify(o); let m = cache.get(k); if (!m) { m = lookToon({color: c, ...o}); cache.set(k, m); } return m; };
const basic = (c: string, o: THREE.MeshBasicMaterialParameters = {}) => { const k = 'b' + c + JSON.stringify(o); let m = cache.get(k); if (!m) { m = new THREE.MeshBasicMaterial({color: c, ...o}); cache.set(k, m); } return m; };
type MP = {g?: THREE.BufferGeometry; m: THREE.Material; p?: V3; s?: V3 | number; r?: V3; sh?: boolean};
export const M: React.FC<MP> = ({g = box, m, p = [0, 0, 0], s = 1, r = [0, 0, 0], sh = true}) =>
  <mesh geometry={g} material={m} position={p} scale={typeof s === 'number' ? [s, s, s] : s} rotation={r} castShadow={sh} receiveShadow />;

// ---------------- painted textures ----------------
const skyTex = (stops: [number, string][], stars = 0, sun?: [number, number, number, string]) => { const c = cv(64, 512), g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
  for (let i = 0; i < stars; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * ((i * 37) % 10) / 10})`; g.fillRect((i * 53) % 64, (i * 97) % 300, 1, 1); }
  return tex(c); };
// ground textures are soft and low-contrast on purpose: fine dots / thin lines alias into flicker when the camera moves
const roadTex = (base: string) => { const c = cv(256, 256), g = c.getContext('2d')!; g.fillStyle = base; g.fillRect(0, 0, 256, 256); g.filter = 'blur(6px)';
  for (let i = 0; i < 60; i++) { const a = ((i * 7919) % 1000) / 1000; g.fillStyle = a > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'; g.beginPath(); g.ellipse((i * 37) % 256, (i * 101) % 256, 14 + (i % 4) * 6, 8 + (i % 3) * 4, 0, 0, Math.PI * 2); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const sandTex = () => { const c = cv(256, 256), g = c.getContext('2d')!; g.fillStyle = '#e6c48a'; g.fillRect(0, 0, 256, 256); g.filter = 'blur(10px)';
  for (let i = 0; i < 9; i++) { g.strokeStyle = 'rgba(176,128,70,.12)'; g.lineWidth = 18; g.beginPath(); const y = (i * 29) % 256; g.moveTo(-20, y); g.bezierCurveTo(80, y - 14, 170, y + 16, 276, y); g.stroke(); }
  for (let i = 0; i < 24; i++) { g.fillStyle = i % 2 ? 'rgba(255,240,210,.10)' : 'rgba(150,100,50,.08)'; g.beginPath(); g.arc((i * 53) % 256, (i * 131) % 256, 18 + (i % 3) * 8, 0, Math.PI * 2); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 18); return t; };
/** a rough California outline (lon/lat-ish polygon) with club pins */
const caMap = () => { const c = cv(768, 1024), g = c.getContext('2d')!; g.fillStyle = '#e8d8b0'; g.fillRect(0, 0, 768, 1024);
  for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(120,90,50,.15)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, i * 90); g.lineTo(768, i * 90); g.stroke(); g.beginPath(); g.moveTo(i * 70, 0); g.lineTo(i * 70, 1024); g.stroke(); }
  const P: [number, number][] = [[120, 60], [430, 60], [430, 420], [700, 760], [690, 820], [640, 960], [470, 975], [450, 930], [330, 850], [250, 720], [200, 600], [150, 460], [110, 300], [95, 180]];
  g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = '#c9b27a'; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.fillText('CALIFORNIA', 330, 500);
  g.font = `900 28px ${FONT}`; g.fillText('INDIO', 600, 880); g.beginPath(); g.arc(610, 840, 12, 0, 7); g.fill();
  return tex(c); };
const letterTex = (lines = 7) => { const c = cv(256, 320), g = c.getContext('2d')!; g.fillStyle = '#fbf3e0'; g.fillRect(0, 0, 256, 320); g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(3, 3, 250, 314);
  g.fillStyle = '#5b6a8a'; for (let i = 0; i < lines; i++) g.fillRect(26, 40 + i * 36, 204 - (i % 3) * 30, 9); return tex(c); };
const scrollTex = () => { const c = cv(256, 1024), g = c.getContext('2d')!; g.fillStyle = '#f4e8c8'; g.fillRect(0, 0, 256, 1024);
  g.fillStyle = INK; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.fillText('PETITION', 128, 56);
  g.fillStyle = '#3d4a66'; for (let i = 0; i < 46; i++) { g.save(); g.translate(30 + (i % 2) * 100, 100 + i * 20); g.rotate(-0.05 + (i % 5) * 0.02); g.fillRect(0, 0, 80 + (i * 13) % 40, 5); g.restore(); }
  return tex(c); };
const calTex = (year: string, red = false) => { const c = cv(256, 320), g = c.getContext('2d')!; g.fillStyle = '#fbf3e0'; g.fillRect(0, 0, 256, 320);
  g.fillStyle = red ? '#b2391f' : '#2f6f73'; g.fillRect(0, 0, 256, 80); g.fillStyle = '#fff'; g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.fillText('YEAR', 128, 58);
  g.fillStyle = INK; g.font = `900 104px ${FONT}`; g.fillText(year, 128, 220); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 248, 312); return tex(c); };
const stampTex = () => { const c = cv(512, 192), g = c.getContext('2d')!; g.clearRect(0, 0, 512, 192); g.strokeStyle = '#c8262e'; g.lineWidth = 14; g.strokeRect(14, 14, 484, 164);
  g.fillStyle = '#c8262e'; g.font = `900 104px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('APPROVED', 256, 100); return tex(c); };

/** shared texture bundle (built once) */
export const useDesert = () => useMemo(() => ({
  skyDay: skyTex([[0, '#3f7ad0'], [0.55, '#8fc0ec'], [1, '#f6e2b8']]),
  skyDusk: skyTex([[0, '#2a2a6a'], [0.45, '#a8507a'], [0.75, '#f2994a'], [1, '#fbd38a']]),
  skyNight: skyTex([[0, '#060818'], [0.6, '#141a3a'], [1, '#2a2a4a']], 160),
  skyGold: skyTex([[0, '#4a6ab0'], [0.5, '#f2b05a'], [1, '#fbe0a0']]),
  road: roadTex('#8a7d6a'), roadNew: roadTex('#3a3c46'), sand: sandTex(), map: caMap(), letter: letterTex(), scroll: scrollTex(),
  cal17: calTex('1917'), cal24: calTex('1924', true), stamp: stampTex(),
  wood: drawWood('#8a5a32', {planks: 6, seed: 3}), woodV: drawWood('#7a4a28', {planks: 8, vertical: true, seed: 9}), paper: drawWallpaper(),
  signDoc: drawSign(['DR. J. McCARROLL', 'PHYSICIAN'], {w: 1024, h: 320, bg: '#f2e3c0'}), signStore: drawSign(['GENERAL', 'STORE'], {w: 768, h: 320, bg: '#e0a040'}),
  signPost: drawSign(['POST OFFICE'], {w: 768, h: 200, bg: '#3f8a86', fg: '#fbf3e0'}), signHotel: drawSign(['HOTEL'], {w: 512, h: 200, bg: '#c8432a', fg: '#fbf3e0'}),
  signIndio: drawSign(['INDIO'], {w: 512, h: 220, bg: '#fbf3e0'}), signBoard: drawSign(['COUNTY BOARD'], {w: 768, h: 200, bg: '#3d4a66', fg: '#fbf3e0'}),
  signClub: drawSign(["WOMEN'S CLUB"], {w: 768, h: 200, bg: '#8f6aa8', fg: '#fbf3e0'}), signComm: drawSign(['STATE HIGHWAY', 'COMMISSION'], {w: 768, h: 300, bg: '#2f6f73', fg: '#fbf3e0'}),
  can: drawSign(['WHITE', 'PAINT'], {w: 256, h: 256, bg: '#f4f1ea', fg: '#2a5f9a', border: '#2a5f9a'}),
}), []);
export type DesertData = ReturnType<typeof useDesert>;

// ---------------- pieces ----------------
/** sky dome around a location */
export const Sky: React.FC<{t: THREE.Texture; at: V3; r?: number}> = ({t, at, r = 160}) => {
  const m = useMemo(() => new THREE.MeshBasicMaterial({map: t, side: THREE.BackSide, fog: false, depthWrite: false}), [t]);
  return <mesh geometry={sph} material={m} position={at} scale={r} renderOrder={-10} />;
};
export const Mountains: React.FC<{x: number; z?: number; col?: string; col2?: string}> = ({x, z = -90, col = '#8a7aa8', col2 = '#a898c0'}) => (<group>
  {[[-90, 30, 46], [-55, 22, 38], [-20, 34, 52], [20, 26, 40], [55, 36, 50], [95, 24, 42]].map(([dx, h, w], i) =>
    <M key={i} g={cone} m={T(i % 2 ? col : col2)} p={[x + dx, h / 2 - 1, z - (i % 2) * 14]} s={[w, h, w * 0.4]} sh={false} />)}
</group>);
export const Palm: React.FC<{p: V3; h?: number; lean?: number}> = ({p, h = 7, lean = 0.08}) => (<group position={p} rotation={[0, 0, lean]}>
  {Array.from({length: 7}, (_, i) => <M key={i} g={cyl} m={T(i % 2 ? '#8a6a44' : '#7a5a38')} p={[0, (i + 0.5) * h / 7, 0]} s={[0.22 - i * 0.012, h / 7, 0.22 - i * 0.012]} />)}
  {Array.from({length: 9}, (_, i) => { const a = (i / 9) * Math.PI * 2; return <M key={'f' + i} g={sph} m={T(i % 2 ? '#3f7a3a' : '#4f8a44')} p={[Math.cos(a) * 1.3, h - 0.25 - Math.abs(Math.sin(a * 2)) * 0.2, Math.sin(a) * 1.3]} s={[1.5, 0.12, 0.42]} r={[0, -a, -0.35]} />; })}
  <M g={sph} m={T('#6a5a2a')} p={[0, h - 0.4, 0]} s={0.45} />
</group>);
export const Bush: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => <group position={p} scale={s}>{[[0, 0.3, 0, 0.45], [0.35, 0.22, 0.1, 0.32], [-0.3, 0.2, -0.1, 0.3]].map(([x, y, z, r], i) => <M key={i} g={sph} m={T('#8a9a4a')} p={[x, y, z]} s={r} />)}</group>;
export const Rock: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => <M g={sph} m={T('#b08a6a')} p={p} s={[0.6 * s, 0.35 * s, 0.5 * s]} />;
/** desert ground + a road along x (width 6) from x0 to x1 at z = 0, with an optional painted centre line [from, to] */
export const DesertRoad: React.FC<{d: DesertData; x0: number; x1: number; line?: [number, number] | null; dash?: boolean; newRoad?: boolean; seed?: number}> = ({d, x0, x1, line, dash, newRoad, seed = 1}) => {
  const L = x1 - x0, cx = (x0 + x1) / 2;
  const roadM = useMemo(() => { const t = (newRoad ? d.roadNew : d.road).clone(); t.needsUpdate = true; t.repeat.set(L / 6, 1); return lookToon({map: t}); }, [L, newRoad, d]);
  const sandM = useMemo(() => lookToon({map: d.sand}), [d]);
  return (<group>
    <M g={plane} m={sandM} p={[cx, 0, 0]} s={[L + 400, 400, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
    <M g={plane} m={roadM} p={[cx, 0.02, 0]} s={[L, 6, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
    {[-3.05, 3.05].map((z) => <M key={z} g={plane} m={T(newRoad ? '#f2efe6' : '#b09a78')} p={[cx, 0.035, z]} s={[L, newRoad ? 0.14 : 0.3, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />)}
    {line && line[1] > line[0] && (dash
      ? Array.from({length: Math.floor((line[1] - line[0]) / 6)}, (_, i) => <M key={i} g={plane} m={T('#f2c23a')} p={[line[0] + i * 6 + 1.6, 0.05, 0]} s={[3.2, 0.16, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />)
      : <M g={plane} m={T('#fbf8ee')} p={[(line[0] + line[1]) / 2, 0.05, 0]} s={[line[1] - line[0], 0.18, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />)}
    {Array.from({length: Math.floor(L / 9)}, (_, i) => { const x = x0 + i * 9 + ((i * 7 + seed) % 5), side = (i + seed) % 2 ? 1 : -1, z = side * (6 + ((i * 13 + seed) % 9)); return i % 3 === 0 ? <Rock key={i} p={[x, 0.1, z]} s={0.7 + (i % 3) * 0.3} /> : <Bush key={i} p={[x, 0, z]} s={0.7 + (i % 4) * 0.2} />; })}
  </group>);
};
/** 1917 Ford-style truck (cab + flatbed), front facing +x */
export const Truck: React.FC<{p: V3; ry?: number; spin?: number; col?: string}> = ({p, ry = 0, spin = 0, col = '#a8443a'}) => (<group position={p} rotation={[0, ry, 0]}>
  <M m={T('#3a3a42')} p={[0, 0.62, 0]} s={[4.4, 0.18, 1.7]} />
  <M m={T('#8a5a32')} p={[-1.0, 0.95, 0]} s={[2.4, 0.5, 1.8]} />
  {[-0.88, 0.88].map((z) => <M key={z} m={T('#6a4428')} p={[-1.0, 1.25, z]} s={[2.4, 0.4, 0.08]} />)}
  <M m={T(col)} p={[0.75, 1.35, 0]} s={[1.0, 1.25, 1.6]} />
  <M m={T('#cfe4f2', {transparent: true, opacity: 0.6})} p={[1.26, 1.65, 0]} s={[0.03, 0.5, 1.3]} />
  <M m={T(col)} p={[1.75, 1.0, 0]} s={[1.1, 0.7, 1.2]} />
  <M m={T('#2a2a30')} p={[2.32, 1.0, 0]} s={[0.06, 0.62, 1.0]} />
  {[-0.45, 0.45].map((z) => <group key={z}><M g={sph} m={T('#d8d8d0')} p={[2.36, 1.32, z]} s={0.17} /><M g={sph} m={basic('#fff6c8')} p={[2.46, 1.32, z]} s={0.11} sh={false} /></group>)}
  {[1.75, -1.5].map((x) => [-0.85, 0.85].map((z) => <group key={x + '' + z} position={[x, 0.42, z]} rotation={[Math.PI / 2, spin, 0]}>
    <M g={cyl} m={T('#1e1e24')} s={[0.42, 0.22, 0.42]} /><M g={cyl} m={T('#c8a060')} s={[0.24, 0.23, 0.24]} /><M m={T('#1e1e24')} s={[0.05, 0.24, 0.36]} /></group>))}
</group>);
/** a wooden false-front shop with a sign, porch and boardwalk; front faces +z */
export const Front: React.FC<{p: V3; w: number; h: number; col: string; sign?: THREE.Texture; signW?: number; door?: string}> = ({p, w, h, col, sign, signW = 0.8, door = '#5a3a22'}) => (<group position={p}>
  <M m={T(col)} p={[0, h / 2, 0]} s={[w, h, 0.3]} />
  <M m={T('#4a2418')} p={[0, h + 0.1, 0.05]} s={[w + 0.2, 0.2, 0.42]} />
  {sign && <mesh geometry={plane} position={[0, h - 0.75, 0.17]} scale={[w * signW, w * signW * 0.32, 1]}><meshBasicMaterial map={sign} toneMapped={false} /></mesh>}
  <M m={T(door)} p={[0, 1.05, 0.16]} s={[0.95, 2.1, 0.05]} />
  {[-1, 1].map((sd) => <group key={sd}><M m={T('#bfe0f0')} p={[sd * w * 0.3, 1.5, 0.16]} s={[w * 0.22, 1.0, 0.04]} /><M m={T('#4a2418')} p={[sd * w * 0.3, 1.5, 0.17]} s={[0.06, 1.0, 0.05]} /></group>)}
  <M m={T('#9a6a3a')} p={[0, 2.6, 0.9]} s={[w, 0.08, 1.8]} r={[0.12, 0, 0]} />
  {[-w / 2 + 0.15, w / 2 - 0.15].map((x) => <M key={x} g={cyl} m={T('#7a4a28')} p={[x, 1.3, 1.7]} s={[0.07, 2.6, 0.07]} />)}
  <M m={T('#a87a48')} p={[0, 0.1, 1.0]} s={[w, 0.2, 2.0]} />
</group>);
/** an interior shell: floor, back wall, two side walls (open toward +z), centred at p */
const voidM = new THREE.MeshBasicMaterial({color: '#1c1410', side: THREE.BackSide, fog: false});
export const Room: React.FC<{p: V3; w?: number; d?: number; h?: number; wall: THREE.Material; floor: THREE.Material}> = ({p, w = 9, d = 8, h = 3.6, wall, floor}) => (<group position={p}>
  <mesh geometry={sph} material={voidM} scale={[w * 1.6, h * 3, d * 1.6]} />
  <M g={plane} m={floor} p={[0, 0, 0]} s={[w, d, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} />
  <M m={wall} p={[0, h / 2, -d / 2]} s={[w, h, 0.1]} sh={false} />
  {[-w / 2, w / 2].map((x) => <M key={x} m={wall} p={[x, h / 2, 0]} s={[0.1, h, d]} sh={false} />)}
  <M g={plane} m={T('#e8dcc0')} p={[0, h, 0]} s={[w, d, 1]} r={[Math.PI / 2, 0, 0]} sh={false} />
</group>);
/** a modern car (simple), front +x, with glowing headlights / red tail lights for night */
export const ModernCar: React.FC<{p: V3; ry?: number; col: string; night?: boolean}> = ({p, ry = 0, col, night}) => (<group position={p} rotation={[0, ry, 0]}>
  <M m={T(col)} p={[0, 0.62, 0]} s={[4.2, 0.6, 1.8]} />
  <M m={T(col)} p={[-0.3, 1.15, 0]} s={[2.2, 0.55, 1.6]} />
  <M m={T('#2a3a5a')} p={[-0.3, 1.16, 0]} s={[2.24, 0.42, 1.62]} />
  {[1.4, -1.4].map((x) => [-0.85, 0.85].map((z) => <M key={x + '' + z} g={cyl} m={T('#18181e')} p={[x, 0.36, z]} s={[0.36, 0.2, 0.36]} r={[Math.PI / 2, 0, 0]} />))}
  {[-0.6, 0.6].map((z) => <group key={z}><M m={basic(night ? '#fff8d0' : '#e8e8f0')} p={[2.12, 0.72, z]} s={[0.06, 0.16, 0.36]} sh={false} /><M m={basic(night ? '#ff3030' : '#a02020')} p={[-2.12, 0.72, z]} s={[0.06, 0.14, 0.3]} sh={false} /></group>)}
  {night && <mesh geometry={cone} position={[6.5, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1.8, 9, 1.8]}><meshBasicMaterial color="#fff2b0" transparent opacity={0.16} depthWrite={false} /></mesh>}
</group>);
/** paint can (white paint, blue label) */
export const Can: React.FC<{d: DesertData; p: V3; s?: number}> = ({d, p, s = 1}) => (<group position={p} scale={s}>
  <mesh geometry={cyl} position={[0, 0.16, 0]} scale={[0.13, 0.32, 0.13]} castShadow><meshToonMaterial map={d.can} /></mesh>
  <M g={cyl} m={T('#fbf8ee')} p={[0, 0.325, 0]} s={[0.12, 0.01, 0.12]} />
  <mesh geometry={new THREE.TorusGeometry(0.13, 0.008, 6, 20, Math.PI)} material={T('#8a8a92')} position={[0, 0.33, 0]} />
</group>);
/** a wide paintbrush; tip at p, handle pointing along the given yaw and up */
export const Brush: React.FC<{p: V3; ry?: number; tilt?: number; s?: number}> = ({p, ry = 0, tilt = 0.9, s = 1}) => (<group position={p} rotation={[0, ry, 0]} scale={s}><group rotation={[0, 0, tilt]}>
  <M m={T('#fbf8ee')} p={[0, 0.06, 0]} s={[0.04, 0.12, 0.16]} />
  <M m={T('#b8b8c0')} p={[0, 0.15, 0]} s={[0.05, 0.08, 0.17]} />
  <M g={cyl} m={T('#a8743a')} p={[0, 0.42, 0]} s={[0.025, 0.46, 0.025]} />
</group></group>);

// ---------------- light, glow and set dressing (polish pass) ----------------
/** a glowing material that blooms: colour pushed above 1 and not tone-mapped */
const gcache = new Map<string, THREE.Material>();
export const glow = (c: string, k = 2.5, o = 1) => { const key = c + k + o; let m = gcache.get(key); if (!m) { const col = new THREE.Color(c).multiplyScalar(k);
  m = new THREE.MeshBasicMaterial({color: col, toneMapped: false, transparent: o < 1, opacity: o, depthWrite: o >= 1, fog: false}); gcache.set(key, m); } return m; };
const add = (c: string, o: number) => new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide});
/** soft radial glow sprite (no hard edge, unlike a translucent sphere) */
let haloT: THREE.Texture | null = null;
const halo = () => { if (haloT) return haloT; const c = cv(128, 128), g = c.getContext('2d')!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.45)'); r.addColorStop(0.6, 'rgba(255,255,255,.1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  haloT = new THREE.CanvasTexture(c); return haloT; };
export const Halo: React.FC<{p?: V3; col: string; s: number; o?: number}> = ({p = [0, 0, 0], col, s, o = 0.5}) =>
  <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={halo()} color={col} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} /></sprite>;
/** seeded 0..1 (no Math.random: frames must render the same everywhere) */
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
/** saguaro cactus */
export const Cactus: React.FC<{p: V3; h?: number; ry?: number}> = ({p, h = 3.2, ry = 0}) => (<group position={p} rotation={[0, ry, 0]}>
  <M g={cyl} m={T('#4f7a3a')} p={[0, h / 2, 0]} s={[0.26, h, 0.26]} /><M g={sph} m={T('#4f7a3a')} p={[0, h, 0]} s={[0.26, 0.2, 0.26]} />
  <M g={cyl} m={T('#4a7236')} p={[0.42, h * 0.42, 0]} s={[0.16, 0.5, 0.16]} r={[0, 0, Math.PI / 2]} /><M g={cyl} m={T('#4a7236')} p={[0.62, h * 0.58, 0]} s={[0.17, h * 0.34, 0.17]} /><M g={sph} m={T('#4a7236')} p={[0.62, h * 0.75, 0]} s={0.17} />
  <M g={cyl} m={T('#4a7236')} p={[-0.38, h * 0.55, 0]} s={[0.14, 0.42, 0.14]} r={[0, 0, Math.PI / 2]} /><M g={cyl} m={T('#4a7236')} p={[-0.55, h * 0.68, 0]} s={[0.15, h * 0.26, 0.15]} /><M g={sph} m={T('#4a7236')} p={[-0.55, h * 0.81, 0]} s={0.15} />
</group>);
/** a row of telegraph poles with sagging wires along x */
export const Poles: React.FC<{x0: number; x1: number; z: number; step?: number; h?: number}> = ({x0, x1, z, step = 22, h = 6}) => { const n = Math.floor((x1 - x0) / step);
  return (<group>{Array.from({length: n + 1}, (_, i) => { const x = x0 + i * step; return (<group key={i}>
    <M g={cyl} m={T('#5a3a26')} p={[x, h / 2, z]} s={[0.1, h, 0.1]} /><M m={T('#5a3a26')} p={[x, h - 0.4, z]} s={[0.08, 0.08, 1.4]} />
    {[-0.55, 0.55].map((dz) => <M key={dz} g={sph} m={T('#d8e0e8')} p={[x, h - 0.32, z + dz]} s={0.05} sh={false} />)}
    {i < n && [-0.55, 0.55].map((dz) => <mesh key={'w' + dz} position={[x + step / 2, h - 0.62, z + dz]} rotation={[0, 0, 0]} scale={[step / 2, 0.3, 1]}>
      <tubeGeometry args={[new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1, 1, 0), new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(1, 1, 0)), 12, 0.012, 3, false]} /><meshBasicMaterial color="#2a2020" /></mesh>)}
  </group>); })}</group>); };
/** a tumbleweed rolling along +x from x0, by local frame lf */
export const Tumble: React.FC<{p: V3; lf: number; speed?: number; s?: number}> = ({p, lf, speed = 0.12, s = 0.6}) => { const dx = lf * speed, y = s * 0.9 + Math.abs(Math.sin(lf * 0.18)) * 0.35;
  return (<group position={[p[0] + dx, p[1] + y, p[2]]} rotation={[0, 0, -dx / s]} scale={s}>
    {Array.from({length: 7}, (_, i) => <mesh key={i} rotation={[i * 0.9, i * 1.7, i * 0.4]}><torusGeometry args={[0.85, 0.035, 4, 14]} /><meshToonMaterial color={i % 2 ? '#a8885a' : '#8a6a40'} /></mesh>)}</group>); };
export const Barrel: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => (<group position={p} scale={s}><M g={cyl} m={T('#8a5a32')} p={[0, 0.45, 0]} s={[0.32, 0.9, 0.32]} />
  {[0.15, 0.75].map((y) => <M key={y} g={cyl} m={T('#3a3a40')} p={[0, y, 0]} s={[0.335, 0.05, 0.335]} />)}</group>);
export const Hitch: React.FC<{p: V3; w?: number}> = ({p, w = 2.4}) => (<group position={p}>{[-w / 2, w / 2].map((x) => <M key={x} m={T('#6a4428')} p={[x, 0.5, 0]} s={[0.1, 1.0, 0.1]} />)}<M g={cyl} m={T('#7a4a28')} p={[0, 0.95, 0]} s={[0.05, w + 0.2, 0.05]} r={[0, 0, Math.PI / 2]} /></group>);
export const WaterTower: React.FC<{p: V3}> = ({p}) => (<group position={p}>{[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <M key={i} m={T('#5a3a26')} p={[a * 1.1, 3, b * 1.1]} s={[0.14, 6, 0.14]} />)}
  <M g={cyl} m={T('#8a5a32')} p={[0, 7.2, 0]} s={[1.8, 2.6, 1.8]} /><M g={cone} m={T('#4a2418')} p={[0, 9.0, 0]} s={[2.0, 1.0, 2.0]} /></group>);
/** a hanging or wall lamp: glowing bulb + soft halo (+ a real point light when lit) */
export const Lamp: React.FC<{p: V3; col?: string; k?: number; hang?: number; light?: number}> = ({p, col = '#ffd08a', k = 3, hang = 0, light = 0}) => (<group position={p}>
  {hang > 0 && <M g={cyl} m={T('#2a2a2a')} p={[0, hang / 2, 0]} s={[0.012, hang, 0.012]} sh={false} />}
  {hang > 0 && <M g={cone} m={T('#2f6f73')} p={[0, 0.1, 0]} s={[0.32, 0.22, 0.32]} sh={false} />}
  <M g={sph} m={glow(col, k)} s={0.09} sh={false} />
  <Halo col={col} s={1.1} o={0.55} />
  {light > 0 && <pointLight color={col} intensity={light} distance={7} decay={1.6} />}
</group>);
/** a light shaft: an additive slab from a window along a direction */
export const Shaft: React.FC<{p: V3; s: V3; r?: V3; col?: string; o?: number}> = ({p, s, r = [0, 0, 0], col = '#fff0c8', o = 0.10}) => (<group position={p} rotation={r}>
  {[1, 0.7, 0.4].map((k, i) => <mesh key={i} geometry={box} scale={[s[0] * k, s[1], s[2] * k]} material={add(col, o / (i + 1.4))} />)}</group>);
/** floating dust motes in a box (seeded), drifting with the frame */
export const Motes: React.FC<{c: V3; size: V3; f: number; n?: number; col?: string; seed?: number}> = ({c, size, f, n = 40, col = '#fff4d8', seed = 1}) => (<group position={c}>
  {Array.from({length: n}, (_, i) => { const t = f / 30, x = (rnd(i, seed) - 0.5) * size[0] + Math.sin(t * 0.4 + i) * 0.15, y = ((rnd(i, seed + 1) * size[1] + t * 0.05 * (0.5 + rnd(i, seed + 2))) % size[1]) - size[1] / 2, z = (rnd(i, seed + 3) - 0.5) * size[2];
    return <M key={i} g={sph} m={glow(col, 1.15, 0.35)} p={[x, y, z]} s={0.006 + rnd(i, seed + 4) * 0.01} sh={false} />; })}</group>);
/** a sun / moon disk with a halo, placed far away along a direction from at */
export const SunDisk: React.FC<{at: V3; dir: V3; col?: string; r?: number; dist?: number}> = ({at, dir, col = '#fff0c0', r = 6, dist = 140}) => { const v = new THREE.Vector3(...dir).normalize().multiplyScalar(dist);
  return (<group position={[at[0] + v.x, at[1] + v.y, at[2] + v.z]}><mesh geometry={sph} scale={r} material={glow(col, 2.2)} /><Halo col={col} s={r * 7} o={0.55} /><Halo col={col} s={r * 16} o={0.18} /></group>); };
/** a picture frame on a wall (z+ facing) */
export const Frame: React.FC<{p: V3; w?: number; h?: number; col?: string; art?: string}> = ({p, w = 0.7, h = 0.9, col = '#6a4428', art = '#8a9a7a'}) => (<group position={p}>
  <M m={T(col)} s={[w, h, 0.05]} /><M m={T(art)} p={[0, 0, 0.03]} s={[w * 0.8, h * 0.8, 0.02]} /><M g={sph} m={T('#e8d8b0')} p={[0, h * 0.05, 0.045]} s={[w * 0.18, h * 0.18, 0.01]} /></group>);
export const Rug: React.FC<{p: V3; w: number; d: number; col?: string; edge?: string}> = ({p, w, d, col = '#8a2f2a', edge = '#d8b060'}) => (<group position={p}>
  <M g={plane} m={T(edge)} p={[0, 0.006, 0]} s={[w, d, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} /><M g={plane} m={T(col)} p={[0, 0.012, 0]} s={[w - 0.2, d - 0.2, 1]} r={[-Math.PI / 2, 0, 0]} sh={false} /></group>);
export const Shelf: React.FC<{p: V3; w?: number; seed?: number}> = ({p, w = 1.8, seed = 1}) => (<group position={p}>
  <M m={T('#5a3a22')} p={[0, 1.1, 0]} s={[w, 2.2, 0.4]} />
  {[0.35, 0.95, 1.55].map((y, r) => <group key={r}><M m={T('#3a2414')} p={[0, y + 0.28, 0.05]} s={[w - 0.1, 0.5, 0.32]} />
    {Array.from({length: 10}, (_, i) => <M key={i} m={T(['#8a2f2a', '#2f5a7a', '#c8a050', '#4a6a3a', '#6a3a5a'][Math.floor(rnd(i + r * 10, seed) * 5)])} p={[-w / 2 + 0.15 + i * (w - 0.25) / 10, y + 0.22, 0.12]} s={[0.12, 0.3 + rnd(i, seed + r) * 0.12, 0.24]} />)}</group>)}
</group>);
export const Bunting: React.FC<{x0: number; x1: number; y: number; z: number}> = ({x0, x1, y, z}) => (<group>{Array.from({length: Math.floor((x1 - x0) / 0.45)}, (_, i) => { const x = x0 + i * 0.45, t = (x - x0) / (x1 - x0);
  return <mesh key={i} position={[x, y - Math.sin(t * Math.PI) * 0.35, z]} rotation={[0, 0, Math.PI]} scale={[0.18, 0.26, 0.02]} geometry={cone} material={T(['#c8262e', '#f4ead6', '#2a5f9a'][i % 3])} />; })}</group>);
/** stars on the sky dome (seeded twinkle) */
export const Stars: React.FC<{at: V3; n?: number; f: number; r?: number}> = ({at, n = 140, f, r = 150}) => (<group position={at}>
  {Array.from({length: n}, (_, i) => { const a = rnd(i, 7) * Math.PI * 2, e = 0.12 + rnd(i, 8) * 1.2, tw = 0.6 + 0.4 * Math.sin(f * 0.2 + i);
    return <M key={i} g={sph} m={glow('#e8f0ff', 1.2 + tw, 1)} p={[Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r]} s={0.18 + rnd(i, 9) * 0.25} sh={false} />; })}</group>);
export {basic, box, cyl, sph, cone, plane};
