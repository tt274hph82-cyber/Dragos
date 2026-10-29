import React, { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as THREE from "three";
import { Character } from "./Character";
import { Flat, INK, Ink, useCanvasTexture } from "./toon";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** 0→1→0 pulse between frames a and b (used for blinks). */
const pulse = (f: number, a: number, b: number) => interpolate(f, [a, (a + b) / 2, b], [0, 1, 0], clamp);

/**
 * Doctor's office, 4 s. All motion comes from useCurrentFrame() (deterministic).
 */
export const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // doctor raises arm to point at the screen, then taps twice
  const raise = spring({ frame: f - 8, fps, config: { damping: 12, mass: 0.8 } });
  const tap = Math.max(0, Math.sin(((f - 50) / 10) * Math.PI)) * (f > 50 && f < 70 ? 1 : 0);
  const pointHand: [number, number, number] = [
    interpolate(raise, [0, 1], [0.55, 1.15]) + tap * 0.06,
    interpolate(raise, [0, 1], [1.05, 1.95]),
    interpolate(raise, [0, 1], [0.05, 0.25]),
  ];
  // patient looks at the screen, then back at the camera
  const look = interpolate(f, [38, 52, 92, 106], [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // the drawing on the screen: dot travels along an arc
  const draw = interpolate(f, [22, 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const camZ = interpolate(f, [0, durationInFrames], [10.2, 9.2], { easing: Easing.inOut(Easing.cubic) });
  const camX = interpolate(f, [0, durationInFrames], [-0.25, 0.2]);

  return (
    <ThreeCanvas width={width} height={height} style={{ background: "#efe2cc" }} camera={{ fov: 28, position: [camX, 2.3, camZ] }}>
      <CameraRig x={camX} z={camZ} />
      <hemisphereLight args={["#ffffff", "#c9b8a0", 1.6]} />
      <directionalLight position={[3, 6, 5]} intensity={1.6} />

      <Room draw={draw} />

      <Character
        position={[-2.35, 0, 0.4]} rotationY={0.28}
        skin="#c98a5a" hair="#c9ccd1" outfit="coat" outfitColor="#f7f7f5"
        rightHand={pointHand} leftHand={[-0.5, 1.1, 0.12]}
        headTurn={interpolate(raise, [0, 1], [0, 0.35]) - look * 0.25} blink={pulse(f, 28, 34) + pulse(f, 96, 102)}
        breathe={Math.sin(f / 9)}
      />
      <Character
        position={[2.25, 0.02, 0.15]} rotationY={-0.18} sitting
        skin="#f2d3b0" hair="#4a3426" outfit="hoodie" outfitColor="#3aa3a8"
        leftHand={[-0.5, 1.12, 0.35]} rightHand={[0.5, 1.12, 0.35]}
        headTurn={-look * 0.7} headTilt={look * 0.05} blink={pulse(f, 70, 76)}
        breathe={Math.sin(f / 11 + 1)}
      />
    </ThreeCanvas>
  );
};

const CameraRig: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(x, 2.3, z);
    camera.lookAt(x * 0.5, 1.75, 0);
  }, [camera, x, z]);
  return null;
};

/* ---------------- Room ---------------- */
const Room: React.FC<{ draw: number }> = ({ draw }) => {
  const poster = useCanvasTexture((c, w, h) => {
    c.fillStyle = "#fbfaf6"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#2f8f8a"; c.fillRect(0, 0, w, 110);
    c.fillStyle = "#fff"; c.font = "bold 64px sans-serif"; c.textAlign = "center"; c.fillText("HEALTH", w / 2, 78);
    c.fillStyle = "#222"; c.font = "bold 46px sans-serif";
    ["Congenital", "insensitivity", "to pain"].forEach((t, i) => c.fillText(t, w / 2, 200 + i * 58));
    c.strokeStyle = "#e05a5a"; c.lineWidth = 10;
    c.beginPath(); c.arc(150, 470, 36, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(190, 470); c.bezierCurveTo(260, 420, 300, 520, 360, 470); c.stroke();
    c.fillStyle = "#e05a5a"; c.beginPath(); c.arc(375, 470, 26, 0, Math.PI * 2); c.fill();
  });

  // arc drawn on the screen (like a range-of-motion diagram)
  const arcPts = Array.from({ length: 40 }, (_, i) => {
    const a = Math.PI * 0.95 - (i / 39) * Math.PI * 0.45;
    return new THREE.Vector3(0.35 + Math.cos(a) * 0.9, -0.35 + Math.sin(a) * 0.55, 0);
  });
  const shown = Math.max(2, Math.round(arcPts.length * draw));
  const dot = arcPts[shown - 1];

  return (
    <group>
      {/* walls & floor */}
      <Flat color="#ecdcc4" position={[0, 3, -1.6]}><planeGeometry args={[16, 8]} /></Flat>
      <Flat color="#5fa79f" position={[0, 1.25, -1.58]}><planeGeometry args={[16, 0.14]} /></Flat>
      <Flat color={INK} position={[0, 1.18, -1.579]}><planeGeometry args={[16, 0.02]} /></Flat>
      <Flat color="#d9c6a8" position={[0, 0.12, -1.58]}><planeGeometry args={[16, 0.24]} /></Flat>
      <Flat color={INK} position={[0, 0.245, -1.579]}><planeGeometry args={[16, 0.018]} /></Flat>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]}>
        <planeGeometry args={[16, 8]} />
        <meshToonMaterial color="#d8d4cc" />
      </mesh>

      {/* screen */}
      <group position={[-0.25, 2.45, -1.5]}>
        <Ink color="#d7dbe0" outline={0} geometry={<boxGeometry args={[2.55, 1.6, 0.08]} />} />
        <Flat color={INK} position={[0, 0, 0.041]}><planeGeometry args={[2.62, 1.67]} /></Flat>
        <Flat color="#c9ced4" position={[0, 0, 0.043]}><planeGeometry args={[2.52, 1.57]} /></Flat>
        <Flat color="#1e4fb3" position={[0, 0, 0.045]}><planeGeometry args={[2.36, 1.42]} /></Flat>
        <group position={[0, 0, 0.05]}>
          {/* vertical line + circle at the top */}
          <Flat color="#ffffff" position={[0.35, -0.05, 0]} scale={[0.02, 1.0, 1]}><planeGeometry /></Flat>
          <mesh position={[0.35, 0.5, 0]}><ringGeometry args={[0.09, 0.115, 32]} /><meshBasicMaterial color="#ffffff" /></mesh>
          {/* animated dashed arc */}
          {arcPts.slice(0, shown).map((p, i) => i % 2 === 0 && (
            <mesh key={i} position={p}><circleGeometry args={[0.018, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
          ))}
          <mesh position={dot}><circleGeometry args={[0.06, 20]} /><meshBasicMaterial color="#ffffff" /></mesh>
        </group>
      </group>

      {/* poster */}
      <group position={[2.0, 2.85, -1.55]}>
        <Flat color={INK} position={[0, 0, -0.005]}><planeGeometry args={[0.98, 1.21]} /></Flat>
        <mesh><planeGeometry args={[0.92, 1.15]} /><meshBasicMaterial map={poster} /></mesh>
      </group>

      {/* exam table */}
      <group position={[2.4, 0, -0.1]}>
        <Ink color="#f4f4f2" outline={0.025} position={[0, 0.95, 0]} geometry={<boxGeometry args={[2.3, 0.16, 1.0]} />} />
        <Ink color="#8b929b" outline={0.03} position={[0, 0.45, 0]} geometry={<boxGeometry args={[1.9, 0.85, 0.8]} />} />
        <Ink color="#ffffff" outline={0.06} position={[1.2, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={<cylinderGeometry args={[0.14, 0.14, 1.0, 20]} />} />
      </group>

      {/* cabinet on the left */}
      <group position={[-4.6, 0, -0.9]}>
        <Ink color="#7f8e9c" outline={0.025} position={[0, 0.6, 0]} geometry={<boxGeometry args={[1.6, 1.2, 0.9]} />} />
        <Ink color="#3d4248" outline={0.04} position={[0, 1.24, 0]} geometry={<boxGeometry args={[1.66, 0.08, 0.96]} />} />
        <Flat color={INK} position={[0, 0.6, 0.452]} scale={[0.015, 1.1, 1]}><planeGeometry /></Flat>
      </group>
    </group>
  );
};
