import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { random, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SHOTS, NIGHT, DAWN, JOINS, V3 } from "./story";

/**
 * "What if your whole family joined your game?": the Blocky What If format (Mom, Dad, little sister, pop
 * captions, PLAYER JOINED cards) rendered as a 3D voxel world. Original characters and an invented game.
 * Animate ONLY from useCurrentFrame(); never useFrame() or a clock.
 */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => Easing.out(Easing.cubic)(clamp(x));

// ---------------------------------------------------------------- pixel textures
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const pixelTex = (seed: string, palette: string[], n = 16, repeat: [number, number] = [1, 1], fn?: (x: number, y: number) => string | null) => {
  const data = new Uint8Array(n * n * 4);
  for (let i = 0; i < n * n; i++) {
    const x = i % n, y = Math.floor(i / n);
    const c = hex(fn?.(x, y) ?? palette[Math.floor(random(`${seed}${i}`) * palette.length)]);
    data.set([c[0], c[1], c[2], 255], i * 4);
  }
  const t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
};
const useTex = () => useMemo(() => ({
  grass: pixelTex("grass", ["#5AB848", "#52AC40", "#62C450", "#4AA03C"], 16, [40, 40]),
  grassSide: pixelTex("gside", ["#8A5A3A", "#7A4E32", "#966444"], 8, [1, 1], (x, y) => (y < 2 || (y === 2 && x % 3 === 0) ? "#5AB848" : null)),
  dirt: pixelTex("dirt", ["#8A5A3A", "#7A4E32", "#966444", "#6E452C"], 8),
  plank: pixelTex("plank", ["#C89A5A", "#BC8E50", "#D4A666"], 8, [1, 1], (x, y) => (y % 4 === 3 ? "#A07A40" : null)),
  log: pixelTex("log", ["#6A4A2A", "#5E4024", "#765434"], 8, [1, 1], (x) => (x % 3 === 0 ? "#4E361E" : null)),
  leaf: pixelTex("leaf", ["#2E8A3A", "#3AA04A", "#267A32", "#44B054"], 8),
  stone: pixelTex("stone", ["#8A8A92", "#7C7C84", "#96969E"], 8),
  roof: pixelTex("roof", ["#B8423A", "#A83A32", "#C84A42"], 8, [1, 1], (x, y) => (y % 4 === 0 ? "#7A2A24" : null)),
  hoodie: pixelTex("hood", ["#D8323A", "#CC2C34"], 8, [1, 1], (x, y) => ((x === 3 || x === 4) && y > 1 && y < 6 ? "#FFD23F" : null)),
  jeans: pixelTex("jeans", ["#3A5AB8", "#34528E", "#4062A6"], 8),
  momDress: pixelTex("mom", ["#9A7AD8", "#8E6ECC"], 8, [1, 1], (x, y) => (y === 6 ? "#F28AB8" : null)),
  dadShirt: pixelTex("dad", ["#3A9A5A"], 8, [1, 1], (x, y) => (x % 4 === 0 || y % 4 === 0 ? "#26703E" : "#3A9A5A")),
  dadPants: pixelTex("dadp", ["#4A4458", "#423C50"], 8),
  sisShirt: pixelTex("sis", ["#FF8AD0", "#F67EC4"], 8, [1, 1], (x, y) => (x === 4 && y === 3 ? "#FFFFFF" : null)),
  sisSkirt: pixelTex("sisk", ["#C85AA8", "#BC509C"], 8),
  monster: pixelTex("mon", ["#3A6A5A", "#346050", "#407464", "#2E5648"], 8),
  monShirt: pixelTex("mons", ["#4A3A6A", "#42345E", "#523E76"], 8),
  feather: pixelTex("feath", ["#F4F4F0", "#E8E8E2", "#FFFFFF"], 8),
}), []);

// ---------------------------------------------------------------- building blocks
const Box: React.FC<{ p: V3; s: V3; c?: string; map?: THREE.Texture; r?: V3; em?: string; emI?: number; shadow?: boolean; o?: number }> = ({ p, s, c = "#ffffff", map, r, em, emI = 1, shadow = true, o = 1 }) => (
  <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} map={map ?? null} roughness={0.9} emissive={em ?? "#000000"} emissiveIntensity={em ? emI : 0} transparent={o < 1} opacity={o} />
  </mesh>
);
type Face = "neutral" | "happy" | "shock" | "yell" | "smug" | "groan" | "grin" | "glow";
type Hair = "kid" | "mom" | "dad" | "sis" | "none";
const Head: React.FC<{ face: Face; skin?: string; hair: Hair; hairC?: string; blink?: number }> = ({ face, skin = "#F2D2B4", hair, hairC = "#5A3A22", blink = 0 }) => {
  const S = 0.5, u = S / 8, z = S / 2 + 0.004;
  const shut = face === "groan" || face === "grin";
  const wide = face === "shock" || face === "yell" ? 1.35 : 1;
  const eye = (sx: number) => (
    <group position={[sx * 1.7 * u, 0.3 * u, z]}>
      {face === "glow" ? <Box p={[0, 0, 0]} s={[1.8 * u, 1.2 * u, 0.01]} c="#FF5A3A" em="#FF3A1A" emI={3} shadow={false} />
        : !shut && blink < 0.5 ? <>
          <Box p={[0, 0, 0]} s={[2 * u, 1.6 * u * wide, 0.01]} c="#FFFFFF" shadow={false} />
          <Box p={[sx * -0.3 * u, 0, 0.004]} s={[0.9 * u, 1.1 * u, 0.01]} c="#2A1E1A" shadow={false} />
        </> : <Box p={[0, -0.2 * u, 0]} s={[2 * u, 0.4 * u, 0.01]} c="#2A1E1A" shadow={false} r={[0, 0, face === "grin" ? sx * -0.4 : 0]} />}
      {hair !== "none" ? <Box p={[0, (wide > 1 ? 2.0 : 1.5) * u, 0]} s={[2.2 * u, 0.45 * u, 0.01]} c={hairC} r={[0, 0, sx * (face === "yell" || face === "smug" ? 0.3 : wide > 1 ? -0.3 : face === "groan" ? -0.25 : -0.05)]} shadow={false} /> : null}
    </group>
  );
  const mouth = face === "shock" ? <Box p={[0, -2.3 * u, z]} s={[1.6 * u, 1.8 * u, 0.01]} c="#3A1418" shadow={false} />
    : face === "yell" ? <Box p={[0, -2.2 * u, z]} s={[2.6 * u, 2.0 * u, 0.01]} c="#3A1418" shadow={false} />
    : face === "happy" || face === "grin" ? <><Box p={[0, -2.4 * u, z]} s={[3 * u, 0.7 * u, 0.01]} c="#7A2A2A" shadow={false} /><Box p={[-1.8 * u, -1.9 * u, z]} s={[0.6 * u, 0.6 * u, 0.01]} c="#7A2A2A" shadow={false} /><Box p={[1.8 * u, -1.9 * u, z]} s={[0.6 * u, 0.6 * u, 0.01]} c="#7A2A2A" shadow={false} /></>
    : face === "smug" ? <Box p={[0.6 * u, -2.3 * u, z]} s={[2.4 * u, 0.5 * u, 0.01]} c="#7A2A2A" r={[0, 0, 0.25]} shadow={false} />
    : face === "groan" ? <Box p={[0, -2.4 * u, z]} s={[2.6 * u, 0.5 * u, 0.01]} c="#7A2A2A" r={[0, 0, -0.08]} shadow={false} />
    : face === "glow" ? <Box p={[0, -2.4 * u, z]} s={[3.4 * u, 0.6 * u, 0.01]} c="#1A2A22" shadow={false} />
    : <Box p={[0, -2.3 * u, z]} s={[2 * u, 0.45 * u, 0.01]} c="#7A2A2A" shadow={false} />;
  return (
    <group>
      <Box p={[0, 0, 0]} s={[S, S, S]} c={skin} />
      {hair !== "none" ? <>
        <Box p={[0, S * 0.38, -0.02]} s={[S * 1.06, S * 0.3, S * 1.06]} c={hairC} />
        <Box p={[0, S * 0.08, -S * 0.3]} s={[S * 1.06, S * (hair === "mom" ? 0.9 : 0.7), S * 0.5]} c={hairC} />
      </> : null}
      {hair === "mom" ? <Box p={[0, S * 0.66, -S * 0.15]} s={[S * 0.4, S * 0.3, S * 0.4]} c={hairC} /> : null}
      {hair === "sis" ? <><Box p={[-S * 0.62, S * 0.1, -S * 0.1]} s={[S * 0.26, S * 0.34, S * 0.26]} c={hairC} /><Box p={[S * 0.62, S * 0.1, -S * 0.1]} s={[S * 0.26, S * 0.34, S * 0.26]} c={hairC} />
        <Box p={[-S * 0.62, S * 0.32, -S * 0.1]} s={[S * 0.18, S * 0.1, S * 0.3]} c="#FF5AB8" /><Box p={[S * 0.62, S * 0.32, -S * 0.1]} s={[S * 0.18, S * 0.1, S * 0.3]} c="#FF5AB8" /></> : null}
      {hair === "kid" ? <Box p={[0, S * 0.56, 0.02]} s={[S * 1.1, S * 0.08, S * 1.2]} c="#2E6AE8" /> : null}
      {hair === "dad" ? <Box p={[0, -S * 0.32, z - 0.012]} s={[S * 1.02, S * 0.36, 0.03]} c={hairC} shadow={false} /> : null}
      {eye(-1)}{eye(1)}{hair === "dad" && face !== "yell" && face !== "shock" ? null : mouth}
      {hair === "dad" ? <group position={[0, 0.06, 0]}>{mouth}</group> : null}
    </group>
  );
};
/** A voxel person. Arms swing forward by armR/armL (radians); armRz / armLz swing them out sideways. */
type P = { p: V3; ry?: number; s?: number; shirt: THREE.Texture; pants: THREE.Texture; face: Face; hair: Hair; hairC?: string; skin?: string;
  headRy?: number; headRx?: number; armR?: number; armL?: number; armRz?: number; armLz?: number; legSwing?: number; blink?: number; held?: React.ReactNode; lean?: number; skirt?: boolean };
const Person: React.FC<P> = ({ p, ry = 0, s = 1, shirt, pants, face, hair, hairC, skin = "#F2D2B4", headRy = 0, headRx = 0, armR = 0, armL = 0, armRz = 0, armLz = 0, legSwing = 0, blink = 0, held, lean = 0, skirt }) => (
  <group position={p} rotation={[0, ry, 0]} scale={s}>
    <group rotation={[lean, 0, 0]}>
      <group position={[-0.13, 0.6, 0]} rotation={[legSwing, 0, 0]}><Box p={[0, -0.3, 0]} s={[0.24, 0.6, 0.24]} map={pants} /></group>
      <group position={[0.13, 0.6, 0]} rotation={[-legSwing, 0, 0]}><Box p={[0, -0.3, 0]} s={[0.24, 0.6, 0.24]} map={pants} /></group>
      {skirt ? <Box p={[0, 0.5, 0]} s={[0.58, 0.24, 0.34]} map={pants} /> : null}
      <group position={[0, 0.6, 0]}>
        <Box p={[0, 0.3, 0]} s={[0.5, 0.6, 0.28]} map={shirt} />
        <group position={[-0.36, 0.55, 0]} rotation={[-armL, 0, -armLz]}><Box p={[0, -0.25, 0]} s={[0.2, 0.6, 0.2]} map={shirt} /><Box p={[0, -0.6, 0]} s={[0.18, 0.14, 0.18]} c={skin} /></group>
        <group position={[0.36, 0.55, 0]} rotation={[-armR, 0, armRz]}><Box p={[0, -0.25, 0]} s={[0.2, 0.6, 0.2]} map={shirt} /><Box p={[0, -0.6, 0]} s={[0.18, 0.14, 0.18]} c={skin} /><group position={[0, -0.68, 0]}>{held}</group></group>
        <group position={[0, 0.86, 0]} rotation={[headRx, headRy, 0]}><Head face={face} hair={hair} hairC={hairC} skin={skin} blink={blink} /></group>
      </group>
    </group>
  </group>
);
const Chicken: React.FC<{ p: V3; ry?: number; s?: number; t: number; i: number; tex: THREE.Texture; hop?: number }> = ({ p, ry = 0, s = 1, t, i, tex, hop = 0.03 }) => (
  <group position={[p[0], p[1] + Math.abs(Math.sin(t * 7 + i * 1.3)) * hop, p[2]]} rotation={[0, ry, 0]} scale={s}>
    <Box p={[0, 0.2, 0]} s={[0.24, 0.2, 0.32]} map={tex} />
    <Box p={[0, 0.36, 0.13]} s={[0.16, 0.2, 0.14]} map={tex} />
    <Box p={[0, 0.36, 0.23]} s={[0.07, 0.05, 0.08]} c="#F2A81A" /><Box p={[0, 0.48, 0.13]} s={[0.05, 0.06, 0.1]} c="#E2262E" /><Box p={[0, 0.3, 0.21]} s={[0.04, 0.05, 0.03]} c="#E2262E" />
    <Box p={[-0.06, 0.39, 0.205]} s={[0.03, 0.03, 0.01]} c="#1A1014" shadow={false} /><Box p={[0.06, 0.39, 0.205]} s={[0.03, 0.03, 0.01]} c="#1A1014" shadow={false} />
    <Box p={[-0.13, 0.21, 0]} s={[0.03, 0.14, 0.2]} map={tex} r={[0, 0, Math.sin(t * 9 + i) * 0.3]} /><Box p={[0.13, 0.21, 0]} s={[0.03, 0.14, 0.2]} map={tex} r={[0, 0, -Math.sin(t * 9 + i) * 0.3]} />
    <Box p={[-0.05, 0.05, 0]} s={[0.03, 0.1, 0.03]} c="#F2A81A" /><Box p={[0.05, 0.05, 0]} s={[0.03, 0.1, 0.03]} c="#F2A81A" />
  </group>
);
const Tree: React.FC<{ p: V3; T: ReturnType<typeof useTex>; h?: number }> = ({ p, T, h = 4 }) => (
  <group position={p}>
    {Array.from({ length: h }, (_, i) => <Box key={i} p={[0, 0.25 + i * 0.5, 0]} s={[0.5, 0.5, 0.5]} map={T.log} />)}
    {[[-0.5, 0, 0], [0.5, 0, 0], [0, 0, -0.5], [0, 0, 0.5], [0, 0.5, 0], [-0.5, 0, -0.5], [0.5, 0, 0.5], [-0.5, 0, 0.5], [0.5, 0, -0.5], [0, 0.5, 0.5], [0, 0.5, -0.5], [-0.5, 0.5, 0], [0.5, 0.5, 0], [0, 1.0, 0]].map(([x, y, z], i) => <Box key={i} p={[x, h * 0.5 - 0.25 + y, z]} s={[0.5, 0.5, 0.5]} map={T.leaf} />)}
  </group>
);
/** Mom's house, block by block: `built` 0..1 shows that share of its blocks, in building order. */
const HOUSE = (() => {
  const b: { p: V3; k: "plank" | "log" | "roof" | "glass" }[] = [];
  const W = 5, D = 4, H = 3, s = 0.5;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) {
    const edge = x === 0 || x === W - 1 || z === 0 || z === D - 1;
    if (!edge) continue;
    const corner = (x === 0 || x === W - 1) && (z === 0 || z === D - 1);
    if (z === D - 1 && x === 2 && y < 2) continue;                       // the door
    const glass = z === D - 1 && (x === 1 || x === 3) && y === 1;
    b.push({ p: [(x - (W - 1) / 2) * s, 0.25 + y * s, (z - (D - 1) / 2) * s], k: corner ? "log" : glass ? "glass" : "plank" });
  }
  for (let x = -1; x <= W; x++) for (let z = -1; z <= D; z++) {
    const ring = Math.min(x + 1, W - x, z + 1, D - z);
    if (ring > 2) continue;
    b.push({ p: [(x - (W - 1) / 2) * s, 0.25 + (H + ring - 1) * s, (z - (D - 1) / 2) * s], k: "roof" });
  }
  return b;
})();
const House: React.FC<{ p: V3; built: number; T: ReturnType<typeof useTex>; t: number; lit: boolean }> = ({ p, built, T, lit }) => {
  const n = Math.floor(HOUSE.length * built);
  return (
    <group position={p}>
      {HOUSE.slice(0, n).map((b, i) => {
        const fresh = i > n - 6 ? 1 + (n - i) * 0.0 : 1;
        return b.k === "glass" ? <Box key={i} p={b.p} s={[0.5, 0.5, 0.5]} c={lit ? "#FFE28A" : "#BDEBFF"} em={lit ? "#FFC84A" : undefined} emI={lit ? 1.5 : 0} o={0.85} />
          : <Box key={i} p={b.p} s={[0.5 * fresh, 0.5 * fresh, 0.5 * fresh]} map={b.k === "log" ? T.log : b.k === "roof" ? T.roof : T.plank} />;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- where everyone is
const HOUSE_P: V3 = [-2.2, 0, -2.6];
const KID: V3 = [0.4, 0, 0.6], MOM: V3 = [-1.1, 0, 0.5], DAD: V3 = [1.5, 0, -0.2], SIS: V3 = [-0.2, 0, 1.6];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const spawn = (t: number, at: number) => (t < at ? -1 : ease((t - at) / 0.45));

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps, total = durationInFrames / fps;
  const T = useTex();

  // camera: the shot table, a slow move inside each shot, and a snap-zoom punch on every cut
  const si = SHOTS.reduce((k, s, i) => (t >= s.from ? i : k), 0), shot = SHOTS[si];
  const end = SHOTS[si + 1]?.from ?? total, k = Easing.out(Easing.quad)(clamp((t - shot.from) / (end - shot.from)));
  const punch = Math.exp(-(t - shot.from) * 9) * 0.14;
  const fov = shot.fov * (1 - punch);
  const bonk = t >= 28.75 ? Math.max(0, 1 - (t - 28.75) / 0.3) : 0;
  const shake = bonk * 0.05 + (shot.shake ?? 0) * 0.02;
  const camPos = lerp3(shot.pos[0], shot.pos[1], k).map((v, i) => v + Math.sin(frame * (1.7 + i * 0.9)) * shake) as V3;
  let camLook = lerp3(shot.look[0], shot.look[1], k);

  // day, night and dawn
  const night = ramp(t, NIGHT, NIGHT + 0.7) * (1 - ramp(t, DAWN, DAWN + 0.6));
  const sky = new THREE.Color("#8EC8FF").lerp(new THREE.Color("#1A2450"), night).getStyle();
  const blink = Math.max(0, 1 - Math.abs(((t * 0.45) % 1) - 0.5) * 30);

  // the story beats
  const built = ramp(t, 4.05, 5.4);
  const momIn = spawn(t, JOINS[0]), dadIn = spawn(t, JOINS[1]), sisIn = spawn(t, JOINS[2]);
  const walk = ramp(t, 18.6, 22.3);
  const sisPos: V3 = t < 18.6 ? SIS : t < 22.3 ? [-1.6 + walk * 2.8, 0, 2.1 - Math.sin(walk * Math.PI) * 0.4] : [0.2, 0, 1.4];
  const monIn = ramp(t, 24.1, 25.7), flee = ramp(t, 30.9, 32.6);
  const charge = ramp(t, 32.4, 33.9), win = t >= 33.9;
  const slipper = ramp(t, 27.75, 28.75);
  const monsters = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ a: -0.4 + i * 0.75 + random(`ma${i}`) * 0.2, r0: 7.5, r1: 3.6 + random(`mr${i}`) * 0.4 })), []);
  const chickens = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ dx: (random(`cx${i}`) - 0.5) * 1.8, dz: 0.4 + random(`cz${i}`) * 1.4, s: 0.85 + random(`cs${i}`) * 0.3 })), []);
  const confetti = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: (random(`fx${i}`) - 0.5) * 6, z: (random(`fz${i}`) - 0.5) * 4, v: 1.2 + random(`fv${i}`) * 1.5, c: ["#FFD23F", "#E2262E", "#3AB86A", "#2E6AE8", "#FF8AD0"][i % 5] })), []);
  const centre: V3 = [0.2, 0, 0.6];
  // the slipper shot: frame the monster it hits, seen from the side
  let cam = camPos, look = camLook;
  if (shot.from === 28.42) {
    const m = monsters[2], r = m.r1 + (t > 28.75 ? ease((t - 28.75) / 0.4) * 1.5 : 0);
    look = [centre[0] + Math.cos(m.a) * r, 1.0, centre[2] + Math.sin(m.a) * r];
    const side = m.a - 0.9;
    cam = [centre[0] + Math.cos(side) * (m.r1 - 0.6), 1.3, centre[2] + Math.sin(side) * (m.r1 - 0.6)].map((v, i) => v + Math.sin(frame * (1.7 + i * 0.9)) * shake) as V3;
  }

  const talk = (who: string) => (shot.talk === who ? Math.abs(Math.sin(t * 16)) > 0.5 : false);
  const face = (who: string, base: Face): Face => (shot.faces?.[who] ?? base);

  return (
    <ThreeCanvas width={width} height={height} shadows style={{ background: sky }} camera={{ fov, position: cam, near: 0.05, far: 80 }}>
      <CameraRig pos={cam} look={look} fov={fov} />
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 14 - night * 4, 34 - night * 14]} />
      <hemisphereLight args={[night > 0.5 ? "#5A6AC8" : "#FFF2D8", night > 0.5 ? "#101428" : "#6A8A4A", 1.5 - night * 0.55]} />
      <directionalLight position={[6, 10, 5]} intensity={3.2 - night * 1.7} color={night > 0.5 ? "#9AB4FF" : "#FFE8C0"} castShadow shadow-mapSize={[1536, 1536]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-0.0008} />
      {night > 0 ? <><pointLight position={[HOUSE_P[0], 1.2, HOUSE_P[2] + 1.6]} intensity={night * 6} distance={6} color="#FFB84A" /><pointLight position={[0.4, 2.6, 2.4]} intensity={night * 5} distance={7} color="#8AA4FF" /></> : null}
      {/* the sun (a square) or the moon */}
      <Box p={[-9, 11 - night * 2, -18]} s={[2.2, 2.2, 0.2]} c={night > 0.5 ? "#E8F0FF" : "#FFE27A"} em={night > 0.5 ? "#C8D8FF" : "#FFD84A"} emI={1.4} shadow={false} />
      {[[-5, 7.5, -14], [3, 8.5, -16], [8, 7, -12], [-12, 8, -10]].map(([x, y, z], i) => <Box key={i} p={[x + Math.sin(t * 0.05 + i) * 0.5, y, z]} s={[3.2, 0.6, 1.4]} c={night > 0.5 ? "#3A4268" : "#FFFFFF"} shadow={false} />)}

      {/* the ground: a big grass field with a grass-block edge and a few hills */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial map={T.grass} roughness={1} /></mesh>
      {[[3.5, 0.25, -4.0], [4.0, 0.25, -4.0], [4.0, 0.75, -4.0], [-4.5, 0.25, 2.5], [5.5, 0.25, 1.5], [5.5, 0.75, 1.5], [6.0, 0.25, 1.5]].map((q, i) => <Box key={i} p={q as V3} s={[0.5, 0.5, 0.5]} map={T.grassSide} />)}
      <Tree p={[3.2, 0, -5.5]} T={T} /><Tree p={[-5.5, 0, -1.5]} T={T} h={5} /><Tree p={[5.8, 0, -1.0]} T={T} /><Tree p={[-4.0, 0, 4.6]} T={T} h={3} /><Tree p={[1.0, 0, -7.0]} T={T} h={5} />
      {[[2.4, -2.6], [-3.2, 1.8], [3.6, 2.6]].map(([x, z], i) => <Box key={i} p={[x, 0.25, z]} s={[0.5, 0.5, 0.5]} map={T.stone} />)}

      <House p={HOUSE_P} built={built} T={T} t={t} lit={night > 0.3} />

      {/* you */}
      <Person p={KID} ry={shot.ry?.kid ?? 0} s={0.72} shirt={T.hoodie} pants={T.jeans} hair="kid" face={face("kid", talk("kid") ? "yell" : "neutral")} blink={blink}
        armR={shot.arms?.kid?.[0] ?? 0.1} armL={shot.arms?.kid?.[1] ?? 0.1} armRz={shot.arms?.kid?.[2] ?? 0} armLz={shot.arms?.kid?.[3] ?? 0} />
      {/* Mom: spawns, builds, stands at the door, throws her slipper */}
      {momIn >= 0 ? <group position={[0, (1 - momIn) * 1.2, 0]} scale={0.6 + momIn * 0.4}>
        <Person p={t < 6.1 ? MOM : t < 22.3 ? [-1.2, 0, -0.6] : MOM} ry={shot.ry?.mom ?? 0.3} s={0.8} shirt={T.momDress} pants={T.momDress} skirt hair="mom" hairC="#8A4A2A" face={face("mom", talk("mom") ? "yell" : "happy")} blink={blink}
          armR={t > 4.05 && t < 5.4 ? 1.3 + Math.sin(t * 22) * 0.5 : shot.arms?.mom?.[0] ?? 0.1} armL={shot.arms?.mom?.[1] ?? 0.1} armRz={shot.arms?.mom?.[2] ?? 0} armLz={shot.arms?.mom?.[3] ?? 0} />
      </group> : null}
      {/* Dad: spawns, raises the sword, tells jokes */}
      {dadIn >= 0 ? <group position={[0, (1 - dadIn) * 1.2, 0]} scale={0.6 + dadIn * 0.4}>
        <Person p={DAD} ry={shot.ry?.dad ?? -0.4} s={0.84} shirt={T.dadShirt} pants={T.dadPants} hair="dad" hairC="#3A2A1E" face={face("dad", talk("dad") ? "yell" : "grin")} blink={blink}
          armR={shot.arms?.dad?.[0] ?? 0.1} armL={shot.arms?.dad?.[1] ?? 0.1} armRz={shot.arms?.dad?.[2] ?? 0} armLz={shot.arms?.dad?.[3] ?? 0}
          held={t > 10.6 ? <group rotation={[Math.PI / 2, 0, 0]}><Box p={[0, 0.0, 0.32]} s={[0.07, 0.04, 0.6]} c="#D8E8F8" em="#9ACCFF" emI={0.4} /><Box p={[0, 0, 0.02]} s={[0.2, 0.06, 0.06]} c="#8A5A3A" /><Box p={[0, 0, -0.08]} s={[0.05, 0.05, 0.16]} c="#6A4A2A" /></group> : null} />
      </group> : null}
      {/* your little sister, followed by every chicken in the world */}
      {sisIn >= 0 ? <group position={[0, (1 - sisIn) * 1.2, 0]} scale={0.6 + sisIn * 0.4}>
        <Person p={sisPos} ry={t >= 18.6 && t < 22.3 ? Math.PI / 2 : shot.ry?.sis ?? 0} s={0.58} shirt={T.sisShirt} pants={T.sisSkirt} skirt hair="sis" hairC="#8A4A2A" face={face("sis", talk("sis") ? "yell" : "happy")} blink={blink}
          legSwing={t >= 18.6 && t < 22.3 ? Math.sin(t * 12) * 0.5 : 0} armR={shot.arms?.sis?.[0] ?? 0.1} armL={shot.arms?.sis?.[1] ?? 0.1} armRz={shot.arms?.sis?.[2] ?? 0} armLz={shot.arms?.sis?.[3] ?? 0} />
      </group> : null}
      {t >= 18.6 ? chickens.map((c, i) => {
        const trail: V3 = [sisPos[0] - 0.4 - c.dz * 0.9, 0, sisPos[2] + c.dx * 0.8];
        const target: V3 = [centre[0] + Math.cos(monsters[i % 7].a) * (3.6 - charge * 1.2), 0, centre[2] + Math.sin(monsters[i % 7].a) * (3.6 - charge * 1.2) + c.dx];
        const home: V3 = [0.2 + c.dx * 1.6, 0, 2.2 + c.dz * 0.8];
        const pos = t < 22.3 ? trail : t < 32.4 ? home : win ? lerp3(target, home, ramp(t, 34.0, 35.5)) : lerp3(home, target, charge);
        return <Chicken key={i} p={pos} ry={t < 22.3 ? Math.PI / 2 : t >= 32.4 && !win ? Math.atan2(target[0] - home[0], target[2] - home[2]) : (i % 4) * 1.5} s={c.s} t={t} i={i} tex={T.feather} hop={t >= 32.4 && !win ? 0.12 : 0.03} />;
      }) : null}

      {/* the night: monsters close in, cover their ears at the joke, and run */}
      {t >= 24.1 && t < 33.9 ? monsters.map((m, i) => {
        const r = m.r0 + (m.r1 - m.r0) * ease(monIn) + flee * 6 + (t > 28.75 && i === 2 ? ease((t - 28.75) / 0.4) * 1.5 : 0);
        const p: V3 = [centre[0] + Math.cos(m.a) * r, 0, centre[2] + Math.sin(m.a) * r];
        const ears = t > 29.9 ? 1 : 0;
        return <Person key={i} p={p} ry={Math.atan2(centre[0] - p[0], centre[2] - p[2]) + (flee > 0 ? Math.PI : 0)} s={0.82} shirt={T.monShirt} pants={T.monShirt} skin="#5A9A7A" hair="none" face="glow"
          armR={ears ? 2.6 : 1.4} armL={ears ? 2.6 : 1.4} armRz={ears ? -0.5 : 0} armLz={ears ? -0.5 : 0} legSwing={monIn < 1 || flee > 0 ? Math.sin(t * 10 + i) * 0.5 : 0} lean={i === 2 && t > 28.75 && t < 29.6 ? -0.6 : 0} />;
      }) : null}
      {/* Mom's slipper flying at the nearest monster */}
      {slipper > 0 && slipper < 1 ? <group position={lerp3([MOM[0] + 0.3, 1.4, MOM[2]], [centre[0] + Math.cos(monsters[2].a) * 3.8, 1.3, centre[2] + Math.sin(monsters[2].a) * 3.8], slipper).map((v, i) => v + (i === 1 ? Math.sin(slipper * Math.PI) * 0.8 : 0)) as V3} rotation={[slipper * 14, slipper * 6, 0]}>
        <Box p={[0, 0, 0]} s={[0.16, 0.06, 0.34]} c="#F28AB8" /><Box p={[0, 0.05, 0.05]} s={[0.17, 0.04, 0.12]} c="#FFFFFF" />
      </group> : null}
      {/* sparkles where a player spawns */}
      {JOINS.map((j, n) => (t >= j && t < j + 1.0 ? Array.from({ length: 14 }, (_, i) => {
        const at = [MOM, DAD, SIS][n], a = (i / 14) * Math.PI * 2, r = 0.2 + (t - j) * 1.2;
        return <Box key={`${n}-${i}`} p={[at[0] + Math.cos(a) * r, 0.2 + (t - j) * 1.6 + (i % 3) * 0.2, at[2] + Math.sin(a) * r]} s={[0.07, 0.07, 0.07]} c="#FFF6A0" em="#FFE24A" emI={2} shadow={false} o={1 - (t - j)} />;
      }) : null))}
      {/* victory confetti */}
      {win ? confetti.map((c, i) => <Box key={i} p={[c.x, 5 - ((t - 33.9) * c.v + i * 0.13) % 5.5, c.z]} s={[0.08, 0.08, 0.02]} c={c.c} r={[t * 4 + i, t * 3, 0]} shadow={false} />) : null}
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
