import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";

/**
 * The 3D scene. Animate ONLY from useCurrentFrame(); never use useFrame() or a clock,
 * so every frame renders identically in Studio, locally and on GitHub Actions.
 */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  const intro = spring({ frame, fps, config: { damping: 14, mass: 0.9 } });
  const camAngle = interpolate(frame, [0, durationInFrames], [-0.6, 0.9], { easing: Easing.inOut(Easing.cubic) });
  const camR = interpolate(frame, [0, durationInFrames], [7.5, 6]);

  const pillars = useMemo(
    () => Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return { x: Math.cos(a) * 3.2, z: Math.sin(a) * 3.2, h: 0.6 + ((i * 37) % 10) / 6, delay: i * 2 };
    }),
    [],
  );

  return (
    <ThreeCanvas width={width} height={height} style={{ background: "#07090c" }}
      camera={{ fov: 40, position: [Math.sin(camAngle) * camR, 2.4, Math.cos(camAngle) * camR] }}
    >
      <CameraRig angle={camAngle} radius={camR} />
      <fog attach="fog" args={["#07090c", 9, 20]} />
      <hemisphereLight args={["#9fb8d6", "#1a1410", 1.1]} />
      <directionalLight position={[4, 6, 3]} intensity={3} color="#ffe2b0" />
      <pointLight position={[-3, 2.5, -2]} intensity={40} color="#4fa3ff" />
      <pointLight position={[2.5, 1, 3]} intensity={18} color="#ffb35c" />

      {/* hero object */}
      <mesh position={[0, 1.1 + Math.sin(t * 1.6) * 0.12, 0]} rotation={[t * 0.4, t * 0.7, 0]} scale={intro}>
        <torusKnotGeometry args={[0.8, 0.26, 220, 32]} />
        <meshStandardMaterial color="#e0a63a" metalness={0.45} roughness={0.3} />
      </mesh>

      {/* ring of pillars rising one by one */}
      {pillars.map((p, i) => {
        const s = spring({ frame: frame - 15 - p.delay, fps, config: { damping: 16 } });
        return (
          <mesh key={i} position={[p.x, (p.h * s) / 2, p.z]} scale={[1, Math.max(s, 0.001), 1]}>
            <boxGeometry args={[0.35, p.h, 0.35]} />
            <meshStandardMaterial color="#5a6470" metalness={0.2} roughness={0.55} />
          </mesh>
        );
      })}

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#1c222a" roughness={0.85} />
      </mesh>
    </ThreeCanvas>
  );
};

/** Moves the camera each frame (frame-driven, deterministic). */
const CameraRig: React.FC<{ angle: number; radius: number }> = ({ angle, radius }) => {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.position.set(Math.sin(angle) * radius, 2.4, Math.cos(angle) * radius);
    camera.lookAt(0, 0.8, 0);
  }, [camera, angle, radius]);
  return null;
};
