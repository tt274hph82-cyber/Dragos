import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, random, useCurrentFrame, useVideoConfig, Easing } from "remotion";

/**
 * "The closet door": a voxel night-story short. Everything is boxes with small pixel textures,
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

/** A voxel dog, curled up asleep (morning) or just two glowing eyes in the dark (night). */
const Dog: React.FC<{ p: V3; ry?: number; t: number; asleep: boolean; c?: string; c2?: string }> = ({ p, ry = 0, t, asleep, c = "#8A5A32", c2 = "#F2E8D8" }) => {
  const br = 1 + Math.sin(t * 2.2) * 0.03;
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <group scale={[1, br, 1]}><Box p={[0, 0.17, 0]} s={[0.42, 0.3, 0.62]} c={c} /><Box p={[0.12, 0.17, 0.04]} s={[0.2, 0.31, 0.4]} c={c2} /></group>
      <Box p={[-0.17, 0.08, -0.32]} s={[0.12, 0.12, 0.3]} c={c} r={[0, 0.6, 0]} />
      <group position={[0.06, 0.24, 0.36]} rotation={[asleep ? 0.35 : 0, asleep ? -0.25 : 0, 0]}>
        <Box p={[0, 0, 0]} s={[0.3, 0.26, 0.28]} c={c} />
        <Box p={[0, -0.04, 0.17]} s={[0.17, 0.13, 0.12]} c={c2} /><Box p={[0, 0.0, 0.235]} s={[0.07, 0.05, 0.02]} c="#1A1014" />
        <Box p={[-0.17, -0.02, 0]} s={[0.06, 0.24, 0.14]} c="#5A3A1E" /><Box p={[0.17, -0.02, 0]} s={[0.06, 0.24, 0.14]} c="#5A3A1E" />
        {asleep ? <><Box p={[-0.07, 0.04, 0.142]} s={[0.07, 0.015, 0.01]} c="#1A1014" shadow={false} /><Box p={[0.07, 0.04, 0.142]} s={[0.07, 0.015, 0.01]} c="#1A1014" shadow={false} /></>
          : <><Box p={[-0.07, 0.05, 0.142]} s={[0.08, 0.06, 0.01]} c="#FFF6A0" em="#FFE24A" emI={8} shadow={false} /><Box p={[0.07, 0.05, 0.142]} s={[0.08, 0.06, 0.01]} c="#FFF6A0" em="#FFE24A" emI={8} shadow={false} /></>}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- the story: shots and their cameras
type Shot = { from: number; id: string; pos: [V3, V3]; look: [V3, V3]; fov: number };
const SHOTS: Shot[] = [
  { from: 0, id: "wide", pos: [[2.0, 2.7, 3.4], [1.5, 2.3, 2.7]], look: [[-1.4, 0.7, -0.9], [-1.5, 0.6, -1.0]], fov: 50 },
  { from: 1.85, id: "door", pos: [[0.6, 1.5, 3.0], [0.9, 1.35, 2.5]], look: [[2.5, 0.95, 0.7], [2.5, 0.95, 0.7]], fov: 44 },
  { from: 5.75, id: "look", pos: [[-1.85, 1.45, 0.85], [-1.95, 1.4, 0.45]], look: [[-2.1, 1.15, -1.3], [-2.1, 1.15, -1.3]], fov: 40 },
  { from: 7.3, id: "eyes", pos: [[-1.2, 1.1, -0.8], [0.6, 0.85, -0.2]], look: [[2.65, 0.45, 0.4], [2.65, 0.42, 0.4]], fov: 36 },
  { from: 10.7, id: "hide", pos: [[0.2, 2.3, 0.9], [0.5, 2.7, 1.4]], look: [[-1.6, 0.55, -1.1], [-1.6, 0.55, -1.05]], fov: 46 },
  { from: 13.95, id: "morning", pos: [[-1.2, 1.7, 3.8], [-0.9, 1.55, 3.3]], look: [[2.3, 0.9, 0.7], [2.3, 0.85, 0.7]], fov: 46 },
  { from: 16.05, id: "dog", pos: [[0.15, 1.3, 0.3], [0.6, 1.05, 0.35]], look: [[2.75, 0.3, 0.6], [2.75, 0.28, 0.6]], fov: 46 },
];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const SOCKS = ["#F2F2E8", "#E2262E", "#2E6AE8", "#FFD23F", "#3AB86A", "#F28AB8", "#E8E8F0", "#8A8AA8"];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps, total = durationInFrames / fps;
  const T = useTextures(), clockTex = useClockTex();

  const si = SHOTS.reduce((k, s, i) => (t >= s.from ? i : k), 0), shot = SHOTS[si];
  const end = SHOTS[si + 1]?.from ?? total, k = Easing.out(Easing.quad)(clamp((t - shot.from) / (end - shot.from)));
  const jolt = t >= 7.45 ? Math.max(0, 1 - (t - 7.45) / 0.3) : 0;           // the sting when the eyes appear
  const shake = jolt * 0.03 + (shot.id === "look" || shot.id === "hide" ? 0.004 : 0.0015);
  const camPos = lerp3(shot.pos[0], shot.pos[1], k).map((v, i) => v + Math.sin(frame * (1.7 + i * 0.9)) * shake) as V3;
  const camLook = lerp3(shot.look[0], shot.look[1], k);

  const day = ramp(t, 13.4, 13.95);
  const isDay = t >= 13.95;
  const blink = Math.max(0, 1 - Math.abs(((t * 0.6) % 1) - 0.5) * 30);
  // the closet door: creaks open a little on its own at night, then the kid opens it wide in the morning
  const doorA = isDay ? 0.6 + Easing.inOut(Easing.cubic)(ramp(t, 15.0, 16.0)) * 1.05 : Easing.inOut(Easing.sin)(ramp(t, 2.1, 5.2)) * 0.6;
  const eyes = !isDay && t > 7.3;

  const bg = isDay ? "#BFE2FF" : day > 0 ? "#3A4A7A" : "#070A1C";
  const beam = useMemo(() => {
    const a = new THREE.Vector3(1.1, 1.75, -1.95), b = new THREE.Vector3(-0.6, 0.02, 0.9), mid = a.clone().add(b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return { pos: mid.toArray() as V3, quat: q, len: a.distanceTo(b) };
  }, []);
  const motes = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ x: -2.2 + random(`mx${i}`) * 4.2, y: 0.3 + random(`my${i}`) * 2.2, z: -1.8 + random(`mz${i}`) * 3.4, s: 0.2 + random(`ms${i}`) })), []);
  const socks = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ x: 2.72 + random(`sx${i}`) * 0.5, y: 0.04 + random(`sy${i}`) * 0.1, z: 0.32 + random(`sz${i}`) * 0.78, r: random(`sr${i}`) * 3, c: SOCKS[i % SOCKS.length] })), []);

  const sitting = shot.id === "look";
  const hidden = shot.id === "hide";

  return (
    <ThreeCanvas width={width} height={height} shadows style={{ background: bg }} camera={{ fov: shot.fov, position: camPos, near: 0.05, far: 60 }}>
      <CameraRig pos={camPos} look={camLook} fov={shot.fov} />
      <color attach="background" args={[bg]} />
      {!isDay ? <fog attach="fog" args={["#070A1C", 5, 13]} /> : null}

      <hemisphereLight args={[isDay ? "#FFF2D8" : "#5A78C8", isDay ? "#8A6A4A" : "#0A0C20", isDay ? 1.6 : 0.75 + day * 0.6]} />
      <spotLight position={[3.4, 4.6, -5.6]} target-position={[-0.9, 0, 0.6]} angle={0.5} penumbra={0.5} decay={0} intensity={isDay ? 9 : 5 + day * 2} color={isDay ? "#FFD9A0" : "#8FB4FF"} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0015} />
      <pointLight position={[-1.05, 0.85, -1.45]} intensity={isDay ? 0 : 0.5} distance={2.2} color="#FF3030" />
      {!isDay ? <pointLight position={[-1.4, 1.9, 0.2]} intensity={1.4} distance={5} decay={1} color="#7A9AFF" /> : <pointLight position={[0.5, 2.4, 1.2]} intensity={6} distance={9} color="#FFE8C0" />}
      
      {isDay && t > 15.3 ? <pointLight position={[2.4, 1.2, 0.7]} intensity={2.5 * ramp(t, 15.3, 16.2)} distance={2.4} color="#FFC890" /> : null}

      {/* the room: floor, ceiling, back wall with a window, left wall, right wall with the closet opening */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2.5]} receiveShadow><planeGeometry args={[5, 9]} /><meshStandardMaterial map={T.floor} roughness={0.95} /></mesh>
      <Box p={[-1.0, 1.5, -2.05]} s={[3.2, 3, 0.1]} map={T.wall} /><Box p={[2.05, 1.5, -2.05]} s={[0.9, 3, 0.1]} map={T.wall} />
      <Box p={[1.1, 0.6, -2.05]} s={[1.0, 1.2, 0.1]} map={T.wall} /><Box p={[1.1, 2.65, -2.05]} s={[1.0, 0.7, 0.1]} map={T.wall} />
      <Box p={[1.1, 1.75, -2.02]} s={[0.06, 1.1, 0.06]} c="#E8E8F0" /><Box p={[1.1, 1.75, -2.02]} s={[1.0, 0.06, 0.06]} c="#E8E8F0" />
      <Box p={[0, 3.05, 2.5]} s={[5.2, 0.1, 9.2]} c="#3A4E7A" />
      <Box p={[-2.55, 1.5, 2.5]} s={[0.1, 3, 9.2]} map={T.wallL} />
      <Box p={[2.55, 1.5, -0.95]} s={[0.1, 3, 2.3]} map={T.wallL} /><Box p={[2.55, 1.5, 4.1]} s={[0.1, 3, 5.8]} map={T.wallL} /><Box p={[2.55, 2.5, 0.7]} s={[0.1, 1.0, 1.0]} map={T.wallL} />
      {/* door frame and the door, hinged at its back edge */}
      <Box p={[2.5, 1.0, 0.18]} s={[0.06, 2.0, 0.05]} c="#E8E8F0" /><Box p={[2.5, 1.0, 1.22]} s={[0.06, 2.0, 0.05]} c="#E8E8F0" /><Box p={[2.5, 2.0, 0.7]} s={[0.06, 0.06, 1.1]} c="#E8E8F0" />
      <group position={[2.5, 0, 1.2]} rotation={[0, doorA, 0]}>
        <Box p={[0, 0.99, -0.5]} s={[0.05, 1.96, 0.98]} c="#E8DCC8" /><Box p={[-0.03, 1.45, -0.5]} s={[0.02, 0.6, 0.7]} c="#D8CCB8" /><Box p={[-0.03, 0.55, -0.5]} s={[0.02, 0.6, 0.7]} c="#D8CCB8" />
        <Box p={[-0.04, 1.0, -0.86]} s={[0.04, 0.06, 0.06]} c="#C8A040" />
      </group>
      {/* inside the closet: walls, a rail with hanging clothes, a shelf, the sock pile */}
      <Box p={[3.35, 1.0, 0.7]} s={[0.1, 2.0, 1.1]} map={T.cavity} /><Box p={[2.95, 1.0, 0.13]} s={[0.8, 2.0, 0.06]} map={T.cavity} /><Box p={[2.95, 1.0, 1.27]} s={[0.8, 2.0, 0.06]} map={T.cavity} />
      <Box p={[2.95, 0.01, 0.7]} s={[0.8, 0.02, 1.1]} map={T.cavity} /><Box p={[2.95, 2.0, 0.7]} s={[0.8, 0.06, 1.1]} map={T.cavity} />
      <Box p={[2.95, 1.55, 0.7]} s={[0.03, 0.03, 1.1]} c="#B8B8C8" />
      {["#2E6AE8", "#E2262E", "#3AB86A", "#FFD23F"].map((c, i) => <Box key={i} p={[2.95, 1.25, 0.32 + i * 0.25]} s={[0.4, 0.55, 0.06]} c={c} />)}
      <Box p={[2.95, 1.75, 0.7]} s={[0.7, 0.04, 1.0]} map={T.wood} />
      {socks.map((s, i) => <Box key={i} p={[s.x, s.y, s.z]} s={[0.16, 0.06, 0.08]} c={s.c} r={[0, s.r, 0]} />)}
      <Dog p={[isDay ? 2.95 : 3.0, 0.1, isDay ? 0.62 : 0.5]} ry={-Math.PI / 2 + (isDay ? 0.4 : -0.45)} t={t} asleep={isDay} c={isDay ? undefined : "#120E18"} c2={isDay ? undefined : "#16121C"} />
      {!isDay ? <pointLight position={[1.3, 1.8, 0.5]} intensity={3} distance={3} decay={1} color="#7A9AFF" /> : null}

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

      {/* the kid: asleep, sitting up to stare at the closet, hiding, then opening the closet in the morning */}
      {!isDay ? <>
        <Box p={[-1.9, 0.6 + (hidden ? 0.05 : 0), sitting ? -0.45 : hidden ? -0.95 : -0.7]} s={[1.08, hidden ? 0.3 : 0.2, sitting ? 1.2 : hidden ? 1.9 : 1.6]} map={T.blanket} />
        {hidden ? <Box p={[-1.9, 0.72 + Math.sin(t * 9) * 0.008, -1.45]} s={[0.62, 0.3, 0.6]} map={T.blanket} />
          : sitting ? <Person p={[-1.9, 0.58, -1.3]} sit scale={0.8} shirt={T.pj} pants={T.pj} face="scared" headRy={0.45} armR={0.3} armL={0.2} blink={0} />
          : <group position={[-1.9, 0.74, -1.5]} rotation={[-Math.PI / 2 + 0.25, 0, 0]} scale={0.8}><Head face="asleep" /></group>}
      </> : <>
        <Box p={[-1.9, 0.58, -0.75]} s={[1.08, 0.16, 1.7]} map={T.blanket} r={[0, 0.06, 0]} />
        <Person p={[1.8, 0, shot.id === "dog" ? -0.9 : -0.05]} ry={Math.PI / 2 + 0.35} scale={0.8} shirt={T.pj} pants={T.pj} face={t > 16.3 ? "happy" : "neutral"} headRy={t > 16.3 ? 0.2 : 0} headRx={t > 16.3 ? 0.3 : 0} armR={t < 16.2 ? 1.2 : 0.3} armRz={t < 16.2 ? 0.4 : 0} armL={0.2} blink={blink} />
      </>}

      <mesh position={beam.pos} quaternion={beam.quat}><boxGeometry args={[0.9, beam.len, 0.9]} /><meshBasicMaterial color={isDay ? "#FFE2B0" : "#8FB4FF"} transparent opacity={isDay ? 0.1 : 0.07} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      {motes.map((m, i) => <mesh key={i} position={[m.x + Math.sin(t * 0.3 * m.s + i) * 0.15, m.y + Math.sin(t * 0.2 + i * 2) * 0.1, m.z]}><boxGeometry args={[0.008, 0.008, 0.008]} /><meshBasicMaterial color={isDay ? "#FFF2D0" : "#B8C8FF"} transparent opacity={0.5} /></mesh>)}
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
