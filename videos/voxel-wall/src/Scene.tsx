import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, random, useCurrentFrame, useVideoConfig, Easing } from "remotion";

/**
 * "Scratching in the wall": a voxel night-story short. Everything is boxes with small pixel textures,
 * lit like a film (moonlight through the window, a red clock glow, warm morning sun).
 * Animate ONLY from useCurrentFrame(); never useFrame() or a clock.
 */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

// ---------------------------------------------------------------- pixel textures
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/** A small nearest-filtered texture: each pixel picks one of the palette colours (seeded). */
const pixelTex = (seed: string, palette: string[], n = 16, repeat: [number, number] = [1, 1], rowFn?: (x: number, y: number) => string | null) => {
  const data = new Uint8Array(n * n * 4);
  for (let i = 0; i < n * n; i++) {
    const x = i % n, y = Math.floor(i / n);
    const c = hex(rowFn?.(x, y) ?? palette[Math.floor(random(`${seed}${i}`) * palette.length)]);
    data.set([c[0], c[1], c[2], 255], i * 4);
  }
  const t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
};
const useTextures = () => useMemo(() => ({
  wall: pixelTex("wall", ["#4E6FA8", "#4868A0", "#5476B0", "#46649A"], 16, [5, 3]),
  wallL: pixelTex("wallL", ["#4E6FA8", "#4868A0", "#5476B0", "#46649A"], 16, [4, 3]),
  floor: pixelTex("floor", ["#7A5232", "#70492C", "#855A38"], 16, [5, 9], (x, y) => (y % 4 === 0 ? "#5E3C22" : null)),
  rug: pixelTex("rug", ["#7A3A9A", "#6E3290", "#8642A6"], 16, [2, 2], (x, y) => ((x + y) % 8 === 0 ? "#A860C8" : null)),
  blanket: pixelTex("blanket", ["#2E9AC8", "#2890BE", "#36A4D2"], 16, [2, 3], (x, y) => (x % 8 === 0 || y % 8 === 0 ? "#1E78A8" : null)),
  wood: pixelTex("wood", ["#6A4428", "#603C22", "#74502E"], 8, [1, 1]),
  pj: pixelTex("pj", ["#3AB88A"], 8, [1, 2], (x, y) => (y % 4 < 2 ? "#F2F2E8" : "#3AB88A")),
  plaid: pixelTex("plaid", ["#B8323A"], 8, [1, 1], (x, y) => (x % 4 === 0 || y % 4 === 0 ? "#7A1E24" : "#B8323A")),
  jeans: pixelTex("jeans", ["#3A5A9A", "#34528E", "#4062A6"], 8),
  fur: pixelTex("fur", ["#E8963A", "#DC8A30", "#F2A246"], 8, [1, 1], (x, y) => (y % 4 === 0 && x % 3 !== 0 ? "#B86A1E" : null)),
  cavity: pixelTex("cav", ["#5A3E28", "#4E3420", "#664830"], 8, [2, 2]),
}), []);
/** The red digits of the clock, drawn on a canvas. */
const useClockTex = () => useMemo(() => {
  const c = document.createElement("canvas"); c.width = 64; c.height = 32;
  const g = c.getContext("2d")!; g.fillStyle = "#140406"; g.fillRect(0, 0, 64, 32);
  g.fillStyle = "#FF2A2A"; g.font = "bold 24px monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("3:00", 32, 17);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}, []);

// ---------------------------------------------------------------- building blocks
type V3 = [number, number, number];
const Box: React.FC<{ p: V3; s: V3; c?: string; map?: THREE.Texture; r?: V3; em?: string; emI?: number; shadow?: boolean }> = ({ p, s, c = "#ffffff", map, r, em, emI = 1, shadow = true }) => (
  <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} map={map ?? null} roughness={0.9} emissive={em ?? "#000000"} emissiveIntensity={em ? emI : 0} />
  </mesh>
);
type Face = "neutral" | "scared" | "asleep" | "happy" | "squeeze";
/** A voxel head: a cube with hair on top and a face made of flat boxes on its +z side. */
const Head: React.FC<{ size?: number; skin?: string; hair?: string; face: Face; blink?: number; beard?: boolean }> = ({ size = 0.5, skin = "#F2D2B4", hair = "#5A3A22", face, blink = 0, beard }) => {
  const u = size / 8, z = size / 2 + 0.004;
  const open = face === "asleep" || face === "squeeze" ? 0 : 1 - blink;
  const wide = face === "scared" ? 1.35 : 1;
  const eye = (sx: number) => (
    <group position={[sx * 1.7 * u, 0.2 * u, z]}>
      {open > 0.1 ? <>
        <Box p={[0, 0, 0]} s={[2 * u, 1.6 * u * wide * open, 0.01]} c="#FFFFFF" shadow={false} />
        <Box p={[sx * -0.3 * u, 0, 0.004]} s={[0.9 * u, 1.1 * u * open, 0.01]} c="#2A1E1A" shadow={false} />
      </> : <Box p={[0, -0.2 * u, 0]} s={[2 * u, 0.35 * u, 0.01]} c="#2A1E1A" shadow={false} />}
      <Box p={[0, (face === "scared" ? 2.0 : 1.5) * u, 0]} s={[2.2 * u, 0.45 * u, 0.01]} c={hair} r={[0, 0, sx * (face === "scared" ? -0.35 : face === "squeeze" ? 0.3 : -0.05)]} shadow={false} />
    </group>
  );
  return (
    <group>
      <Box p={[0, 0, 0]} s={[size, size, size]} c={skin} />
      <Box p={[0, size * 0.36, -0.02]} s={[size * 1.06, size * 0.34, size * 1.06]} c={hair} />
      <Box p={[0, size * 0.1, -size * 0.3]} s={[size * 1.06, size * 0.7, size * 0.5]} c={hair} />
      {eye(-1)}{eye(1)}
      {face === "scared" ? <Box p={[0, -2.2 * u, z]} s={[1.6 * u, 1.8 * u, 0.01]} c="#3A1418" shadow={false} />
        : face === "happy" ? <><Box p={[0, -2.3 * u, z]} s={[3 * u, 0.6 * u, 0.01]} c="#7A2A2A" shadow={false} /><Box p={[-1.7 * u, -1.9 * u, z]} s={[0.6 * u, 0.6 * u, 0.01]} c="#7A2A2A" shadow={false} /><Box p={[1.7 * u, -1.9 * u, z]} s={[0.6 * u, 0.6 * u, 0.01]} c="#7A2A2A" shadow={false} /></>
        : <Box p={[0, -2.3 * u, z]} s={[2 * u, 0.45 * u, 0.01]} c="#7A2A2A" shadow={false} />}
      {beard ? <Box p={[0, -2.9 * u, z - 0.01]} s={[size * 1.02, 2.2 * u, 0.03]} c={hair} shadow={false} /> : null}
    </group>
  );
};
/** A standing or sitting voxel person. armR/armL swing forward (radians); sit hides the legs under the blanket. */
const Person: React.FC<{ p: V3; ry?: number; scale?: number; shirt: THREE.Texture; pants: THREE.Texture; face: Face; headRy?: number; headRx?: number; armR?: number; armL?: number; armRz?: number; sit?: boolean; hair?: string; beard?: boolean; blink?: number; held?: React.ReactNode; lean?: number }> =
  ({ p, ry = 0, scale = 1, shirt, pants, face, headRy = 0, headRx = 0, armR = 0, armL = 0, armRz = 0, sit, hair, beard, blink, held, lean = 0 }) => (
    <group position={p} rotation={[0, ry, 0]} scale={scale}>
      <group rotation={[lean, 0, 0]}>
        {!sit ? <><Box p={[-0.13, 0.3, 0]} s={[0.24, 0.6, 0.24]} map={pants} /><Box p={[0.13, 0.3, 0]} s={[0.24, 0.6, 0.24]} map={pants} /></> : null}
        <group position={[0, sit ? 0 : 0.6, 0]}>
          <Box p={[0, 0.3, 0]} s={[0.5, 0.6, 0.28]} map={shirt} />
          <group position={[-0.36, 0.55, 0]} rotation={[-armL, 0, 0]}><Box p={[0, -0.25, 0]} s={[0.2, 0.6, 0.2]} map={shirt} /><Box p={[0, -0.6, 0]} s={[0.18, 0.14, 0.18]} c="#F2D2B4" /></group>
          <group position={[0.36, 0.55, 0]} rotation={[-armR, 0, armRz]}><Box p={[0, -0.25, 0]} s={[0.2, 0.6, 0.2]} map={shirt} /><Box p={[0, -0.6, 0]} s={[0.18, 0.14, 0.18]} c="#F2D2B4" /><group position={[0, -0.68, 0]}>{held}</group></group>
          <group position={[0, 0.86, 0]} rotation={[headRx, headRy, 0]}><Head face={face} hair={hair} beard={beard} blink={blink} /></group>
        </group>
      </group>
    </group>
  );
const Cat: React.FC<{ p: V3; s?: number; ry?: number; fur?: THREE.Texture; c?: string; t: number; i?: number; curl?: boolean }> = ({ p, s = 1, ry = 0, fur, c = "#ffffff", t, i = 0, curl }) => (
  <group position={p} rotation={[0, ry, 0]} scale={s}>
    <Box p={[0, 0.16, 0]} s={[0.26, 0.24, 0.5]} c={c} map={fur} />
    <group position={[0, 0.3 + Math.sin(t * 2 + i) * 0.012, 0.3]} rotation={[0, Math.sin(t * 1.3 + i * 2) * 0.25, 0]}>
      <Box p={[0, 0, 0]} s={[0.28, 0.24, 0.24]} c={c} map={fur} />
      <Box p={[-0.09, 0.15, 0]} s={[0.07, 0.08, 0.07]} c={c} map={fur} /><Box p={[0.09, 0.15, 0]} s={[0.07, 0.08, 0.07]} c={c} map={fur} />
      <Box p={[-0.07, 0.02, 0.122]} s={[0.05, 0.05, 0.01]} c="#2A3A1A" em="#9AE85A" emI={0.6} shadow={false} /><Box p={[0.07, 0.02, 0.122]} s={[0.05, 0.05, 0.01]} c="#2A3A1A" em="#9AE85A" emI={0.6} shadow={false} />
      <Box p={[0, -0.04, 0.122]} s={[0.04, 0.03, 0.01]} c="#F28A9A" shadow={false} />
    </group>
    <group position={[0, 0.22, -0.26]} rotation={[curl ? 0.3 : 0.9 + Math.sin(t * 1.6 + i) * 0.2, 0, 0]}><Box p={[0, 0.14, 0]} s={[0.07, 0.32, 0.07]} c={c} map={fur} /></group>
    {[[-0.09, 0.2], [0.09, 0.2], [-0.09, -0.2], [0.09, -0.2]].map(([x, z], k) => <Box key={k} p={[x, 0.03, z]} s={[0.07, 0.08, 0.07]} c={c} map={fur} />)}
  </group>
);

// ---------------------------------------------------------------- the story: shots and their cameras
type Shot = { from: number; id: string; pos: [V3, V3]; look: [V3, V3]; fov: number };
const SHOTS: Shot[] = [
  { from: 0, id: "wide", pos: [[2.0, 2.7, 3.4], [1.5, 2.3, 2.7]], look: [[-1.4, 0.7, -0.9], [-1.5, 0.6, -1.0]], fov: 50 },
  { from: 4.3, id: "clock", pos: [[-0.75, 1.9, -0.35], [-0.95, 1.7, -0.55]], look: [[-1.55, 0.68, -1.5], [-1.6, 0.68, -1.5]], fov: 42 },
  { from: 7.7, id: "knock", pos: [[-1.75, 1.45, 0.75], [-1.9, 1.4, 0.5]], look: [[-2.05, 1.1, -1.25], [-2.1, 1.1, -1.25]], fov: 42 },
  { from: 9.75, id: "back", pos: [[-1.85, 1.45, 0.85], [-1.95, 1.4, 0.45]], look: [[-2.1, 1.15, -1.3], [-2.1, 1.15, -1.3]], fov: 40 },
  { from: 11.7, id: "hide", pos: [[0.2, 2.3, 0.9], [0.5, 2.7, 1.4]], look: [[-1.6, 0.55, -1.1], [-1.6, 0.55, -1.05]], fov: 46 },
  { from: 15.0, id: "saw", pos: [[-0.2, 1.5, 5.4], [-0.5, 1.35, 4.8]], look: [[-1.9, 0.85, 0.9], [-1.95, 0.8, 0.9]], fov: 44 },
  { from: 17.5, id: "cats", pos: [[-0.5, 0.95, 1.05], [-1.6, 0.6, 1.05]], look: [[-2.9, 0.4, 1.05], [-2.9, 0.38, 1.05]], fov: 44 },
];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps, total = durationInFrames / fps;
  const T = useTextures(), clockTex = useClockTex();

  const si = SHOTS.reduce((k, s, i) => (t >= s.from ? i : k), 0), shot = SHOTS[si];
  const end = SHOTS[si + 1]?.from ?? total, k = Easing.out(Easing.quad)(clamp((t - shot.from) / (end - shot.from)));
  // "knocked back": three hits shake the wall and the camera
  const hits = [10.5, 10.78, 11.06].map((h) => (t >= h ? Math.max(0, 1 - (t - h) / 0.22) : 0));
  const hit = Math.max(...hits);
  const shake = hit * 0.035 + (shot.id === "back" ? 0.004 : 0.0015);
  const camPos = lerp3(shot.pos[0], shot.pos[1], k).map((v, i) => v + Math.sin(frame * (1.7 + i * 0.9)) * shake) as V3;
  const camLook = lerp3(shot.look[0], shot.look[1], k);

  const day = ramp(t, 14.2, 15.0);                    // night to morning, hidden under the blanket shot's end
  const isDay = t >= 15.0;
  const knockArm = shot.id === "knock" ? Math.max(...[8.62, 8.9, 9.18].map((h) => (t >= h - 0.08 ? Math.max(0, 1 - Math.abs(t - h) / 0.1) : 0))) : 0;
  const blink = Math.max(0, 1 - Math.abs(((t * 0.6) % 1) - 0.5) * 30);
  const sawX = Math.sin(t * 9) * 0.16;
  const cut = ramp(t, 15.3, 17.4);                    // the saw's progress along the wall

  const bg = isDay ? "#BFE2FF" : day > 0 ? "#3A4A7A" : "#070A1C";
  // the light shaft from the window to the floor
  const beam = useMemo(() => {
    const a = new THREE.Vector3(1.1, 1.75, -1.95), b = new THREE.Vector3(-0.6, 0.02, 0.9), mid = a.clone().add(b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return { pos: mid.toArray() as V3, quat: q, len: a.distanceTo(b) };
  }, []);
  const motes = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ x: -2.2 + random(`mx${i}`) * 4.2, y: 0.3 + random(`my${i}`) * 2.2, z: -1.8 + random(`mz${i}`) * 3.4, s: 0.2 + random(`ms${i}`) })), []);

  const kidAwake = shot.id === "clock" ? t > 5.4 : false;
  const sitting = shot.id === "knock" || shot.id === "back";
  const hidden = shot.id === "hide";

  return (
    <ThreeCanvas width={width} height={height} shadows style={{ background: bg }} camera={{ fov: shot.fov, position: camPos, near: 0.05, far: 60 }}>
      <CameraRig pos={camPos} look={camLook} fov={shot.fov} />
      <color attach="background" args={[bg]} />
      {!isDay ? <fog attach="fog" args={["#070A1C", 5, 13]} /> : null}

      {/* light: moon or sun through the window, a soft fill, the clock's red glow */}
      <hemisphereLight args={[isDay ? "#FFF2D8" : "#5A78C8", isDay ? "#8A6A4A" : "#0A0C20", isDay ? 1.6 : 0.75 + day * 0.6]} />
      <spotLight position={[3.4, 4.6, -5.6]} target-position={[-0.9, 0, 0.6]} angle={0.5} penumbra={0.5} decay={0} intensity={isDay ? 9 : 5 + day * 2} color={isDay ? "#FFD9A0" : "#8FB4FF"} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0015} />
      <pointLight position={[-1.05, 0.85, -1.45]} intensity={isDay ? 0 : 0.5} distance={2.2} color="#FF3030" />
      {!isDay ? <pointLight position={[-1.4, 1.9, 0.2]} intensity={1.4} distance={5} decay={1} color="#7A9AFF" /> : <pointLight position={[0.5, 2.4, 1.2]} intensity={6} distance={9} color="#FFE8C0" />}
      {t > 17.5 ? <pointLight position={[-2.75, 0.7, 1.05]} intensity={2.2 * ramp(t, 17.5, 18.3)} distance={2.4} color="#FFC070" /> : null}

      {/* the room: floor, back wall with a window, left wall with the panel that hides the cats, right wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2.5]} receiveShadow><planeGeometry args={[5, 9]} /><meshStandardMaterial map={T.floor} roughness={0.95} /></mesh>
      <Box p={[-1.0, 1.5, -2.05]} s={[3.2, 3, 0.1]} map={T.wall} /><Box p={[2.05, 1.5, -2.05]} s={[0.9, 3, 0.1]} map={T.wall} />
      <Box p={[1.1, 0.6, -2.05]} s={[1.0, 1.2, 0.1]} map={T.wall} /><Box p={[1.1, 2.65, -2.05]} s={[1.0, 0.7, 0.1]} map={T.wall} />
      <Box p={[1.1, 1.75, -2.02]} s={[0.06, 1.1, 0.06]} c="#E8E8F0" /><Box p={[1.1, 1.75, -2.02]} s={[1.0, 0.06, 0.06]} c="#E8E8F0" />
      <Box p={[2.55, 1.5, 2.5]} s={[0.1, 3, 9.2]} map={T.wallL} />
      <Box p={[0, 3.05, 2.5]} s={[5.2, 0.1, 9.2]} c="#3A4E7A" />
      <Box p={[-2.55, 1.5, 4.5]} s={[0.1, 3, 5]} map={T.wallL} />
      <Box p={[-2.55, 1.5, -0.75]} s={[0.1, 3, 2.6]} map={T.wallL} /><Box p={[-2.55, 1.5, 1.8]} s={[0.1, 3, 0.5]} map={T.wallL} /><Box p={[-2.55, 2.05, 1.05]} s={[0.1, 1.9, 1.0]} map={T.wallL} /><Box p={[-2.55, 0.06, 1.05]} s={[0.1, 0.12, 1.0]} map={T.wallL} />
      {/* the wall panel: shakes on the knocks at night, is cut out and laid on the floor in the morning */}
      {!isDay || cut < 1 ? <Box p={[-2.55 + hit * 0.02, 0.61, 1.05]} s={[0.1, 0.98, 1.0]} map={T.wallL} /> : <Box p={[-1.75, 0.06, 1.75]} s={[0.98, 0.1, 1.0]} map={T.wallL} r={[0, 0.3, 0]} />}
      {isDay && cut < 1 ? <Box p={[-2.49, 1.09, 0.55 + cut * 0.5]} s={[0.02, 0.03, cut * 1.0]} c="#1A1410" shadow={false} /> : null}
      {/* the hollow inside the wall */}
      <Box p={[-3.15, 0.6, 1.05]} s={[0.1, 1.3, 1.2]} map={T.cavity} /><Box p={[-2.85, 0.02, 1.05]} s={[0.6, 0.06, 1.2]} map={T.cavity} /><Box p={[-2.85, 1.2, 1.05]} s={[0.6, 0.06, 1.2]} map={T.cavity} />
      <Box p={[-2.85, 0.6, 0.5]} s={[0.6, 1.2, 0.06]} map={T.cavity} /><Box p={[-2.85, 0.6, 1.6]} s={[0.6, 1.2, 0.06]} map={T.cavity} />
      <Box p={[-2.85, 0.08, 1.05]} s={[0.5, 0.08, 0.9]} c="#D8C8A8" />
      <Cat p={[-2.86, 0.12, 0.92]} s={0.95} ry={Math.PI / 2 + 0.3} fur={T.fur} t={t} />
      {[["#F2F2E8", 0.3, 1.32], ["#3A3A42", 0.5, 1.18], ["#E8963A", 0.75, 1.38], ["#B8B8C8", 0.4, 0.72], ["#D8A868", 0.7, 1.0]].map(([c, dx, z], i) => (
        <Cat key={i} p={[-3.05 + (dx as number) * 0.4 + (i === 2 ? ramp(t, 20.2, 22.5) * 0.55 : 0), 0.12 + Math.abs(Math.sin(t * 5 + i * 1.7)) * 0.03, z as number]} s={0.42} ry={Math.PI / 2 + (i - 2) * 0.35} c={c as string} t={t * 1.6} i={i + 1} />
      ))}

      {/* furniture: bed, nightstand and clock, rug, shelf, pennant, toys */}
      <Box p={[-1.9, 0.2, -0.9]} s={[1.15, 0.4, 2.15]} map={T.wood} /><Box p={[-1.9, 0.75, -1.93]} s={[1.15, 1.1, 0.1]} map={T.wood} />
      <Box p={[-1.9, 0.45, -0.9]} s={[1.05, 0.12, 2.05]} c="#E8E8F0" /><Box p={[-1.9, 0.56, -1.55]} s={[0.7, 0.12, 0.42]} c="#F4F4FA" />
      <Box p={[-1.05, 0.28, -1.65]} s={[0.5, 0.56, 0.5]} map={T.wood} />
      <mesh position={[-1.05, 0.66, -1.5]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.36, 0.18, 0.14]} /><meshStandardMaterial color="#1A1014" /></mesh>
      <mesh position={[-1.016, 0.66, -1.438]} rotation={[0, 0.5, 0]}><planeGeometry args={[0.3, 0.13]} /><meshBasicMaterial map={clockTex} toneMapped={false} color={isDay ? "#886060" : "#ffffff"} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.012, 0.5]} receiveShadow><planeGeometry args={[2.2, 2.0]} /><meshStandardMaterial map={T.rug} roughness={1} /></mesh>
      <Box p={[1.9, 0.7, -1.7]} s={[0.9, 1.4, 0.4]} map={T.wood} />
      {["#E2262E", "#FFD23F", "#3AB86A", "#2E6AE8", "#F28AB8"].map((c, i) => <Box key={i} p={[1.6 + i * 0.15, 1.52, -1.7]} s={[0.1, 0.24 + (i % 2) * 0.06, 0.26]} c={c} />)}
      <Box p={[-0.6, 2.3, -1.98]} s={[1.2, 0.34, 0.03]} c="#2E8A5A" r={[0, 0, 0.05]} /><Box p={[-0.6, 2.3, -1.96]} s={[0.9, 0.08, 0.02]} c="#F2F2E8" r={[0, 0, 0.05]} />
      <Box p={[0.9, 0.11, 1.1]} s={[0.22, 0.22, 0.22]} c="#E2262E" r={[0, 0.5, 0]} /><Box p={[1.2, 0.09, 0.7]} s={[0.18, 0.18, 0.18]} c="#FFD23F" r={[0, 0.2, 0]} /><Box p={[0.3, 0.07, 1.4]} s={[0.3, 0.14, 0.2]} c="#2E6AE8" r={[0, -0.4, 0]} />

      {/* the kid: asleep under the blanket, sitting up to knock, hiding, then standing in the morning */}
      {!isDay ? <>
        <Box p={[-1.9, 0.6 + (hidden ? 0.05 : 0), sitting ? -0.45 : hidden ? -0.95 : -0.7]} s={[1.08, hidden ? 0.3 : 0.2, sitting ? 1.2 : hidden ? 1.9 : 1.6]} map={T.blanket} />
        {hidden ? <Box p={[-1.9, 0.72 + Math.sin(t * 9) * 0.006, -1.45]} s={[0.62, 0.3, 0.6]} map={T.blanket} />
          : sitting ? <Person p={[-1.9, 0.58, -1.3]} sit scale={0.8} shirt={T.pj} pants={T.pj} face={shot.id === "back" && t > 10.5 ? "scared" : "neutral"} headRy={shot.id === "back" && t > 10.5 ? 0.15 : -0.6} headRx={0} armR={shot.id === "knock" ? 1.35 : 0.3} armRz={shot.id === "knock" ? -0.9 - knockArm * 0.35 : 0} armL={0.2} blink={blink} />
          : <group position={[-1.9, 0.74, -1.5]} rotation={[-Math.PI / 2 + 0.25, 0, 0]} scale={0.8}><Head face={kidAwake ? "scared" : "asleep"} /></group>}
      </> : <>
        <Box p={[-1.9, 0.58, -0.75]} s={[1.08, 0.16, 1.7]} map={T.blanket} r={[0, 0.06, 0]} />
        <Person p={[-1.35, 0, shot.id === "cats" ? 0.25 : 0.2]} ry={-1.9} scale={0.8} shirt={T.pj} pants={T.pj} face={t > 18 ? "happy" : "neutral"} headRy={-0.2} headRx={0.25} armL={0.2} armR={0.2} blink={blink} />
        <Person p={[-1.8, 0, shot.id === "cats" ? 2.0 : 1.45]} ry={-Math.PI / 2 - 0.25} shirt={T.plaid} pants={T.jeans} face={t > 18 ? "happy" : "neutral"} hair="#3A2A1E" beard lean={0.15} headRx={0.2} armR={1.0} armL={0.3} blink={blink}
          held={cut < 1 ? <group position={[0, 0, 0.3 + sawX]} rotation={[0.5, 0, 0]}><Box p={[0, 0, 0.1]} s={[0.03, 0.12, 0.6]} c="#C8C8D8" /><Box p={[0, 0, -0.24]} s={[0.06, 0.16, 0.14]} c="#E8A03A" /></group> : null} />
      </>}

      {/* air: the light shaft and floating dust */}
      <mesh position={beam.pos} quaternion={beam.quat}><boxGeometry args={[0.9, beam.len, 0.9]} /><meshBasicMaterial color={isDay ? "#FFE2B0" : "#8FB4FF"} transparent opacity={isDay ? 0.1 : 0.07} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      {motes.map((m, i) => <mesh key={i} position={[m.x + Math.sin(t * 0.3 * m.s + i) * 0.15, m.y + Math.sin(t * 0.2 + i * 2) * 0.1 - (hit > 0 && m.x < -1.8 ? 0.05 : 0), m.z]}><boxGeometry args={[0.008, 0.008, 0.008]} /><meshBasicMaterial color={isDay ? "#FFF2D0" : "#B8C8FF"} transparent opacity={0.5} /></mesh>)}
      {/* dust knocked off the wall */}
      {hits.map((h, i) => (h > 0 ? Array.from({ length: 6 }, (_, j) => <mesh key={`${i}-${j}`} position={[-2.45 + (1 - h) * 0.3 * random(`dx${i}${j}`), 1.3 - (1 - h) * 0.5 + random(`dy${i}${j}`) * 0.4, -1.5 + random(`dz${i}${j}`) * 0.8]}><boxGeometry args={[0.03, 0.03, 0.03]} /><meshBasicMaterial color="#C8D0E8" transparent opacity={h} /></mesh>) : null))}
    </ThreeCanvas>
  );
};

/** Moves the camera each frame (frame-driven, deterministic). */
const CameraRig: React.FC<{ pos: V3; look: V3; fov: number }> = ({ pos, look, fov }) => {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(...look);
  }, [camera, pos[0], pos[1], pos[2], look[0], look[1], look[2], fov]);
  return null;
};
