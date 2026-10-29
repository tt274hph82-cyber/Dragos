import React from "react";
import * as THREE from "three";
import { Flat, INK, Ink, Stick } from "./toon";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export type CharacterProps = {
  position?: [number, number, number];
  rotationY?: number;
  skin: string;
  hair: string;
  outfit: "coat" | "hoodie" | "sweater";
  outfitColor: string;
  /** hand positions in the character's local space */
  leftHand?: [number, number, number];
  rightHand?: [number, number, number];
  headTurn?: number; // radians, + = look to character's left
  headTilt?: number;
  blink?: number; // 0 open → 1 closed
  sitting?: boolean;
  breathe?: number; // small squash/stretch, -1..1
  glasses?: boolean;
};

const HEAD_R = 0.5;

export const Character: React.FC<CharacterProps> = ({
  position = [0, 0, 0], rotationY = 0, skin, hair, outfit, outfitColor,
  leftHand = [-0.55, 1.05, 0.05], rightHand = [0.55, 1.05, 0.05],
  headTurn = 0, headTilt = 0, blink = 0, sitting = false, breathe = 0, glasses = false,
}) => {
  const hipY = 1.05;
  const s = 1 + breathe * 0.015;
  // legs: standing = straight down; sitting = thighs forward, shins down
  const legs = [-1, 1].map((side) => {
    const hip = V(side * 0.16, hipY, 0);
    if (!sitting) return { hip, knee: null, foot: V(side * 0.2, 0.07, 0.02) };
    return { hip, knee: V(side * 0.2, hipY - 0.02, 0.5), foot: V(side * 0.2, 0.2, 0.55) };
  });
  const shoulders = [V(-0.33, 1.78, 0), V(0.33, 1.78, 0)];
  const hands = [V(...leftHand), V(...rightHand)];

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* legs + feet */}
      {legs.map((l, i) => (
        <group key={i}>
          {l.knee ? (<><Stick from={l.hip} to={l.knee} /><Stick from={l.knee} to={l.foot} /></>) : <Stick from={l.hip} to={l.foot} />}
          <mesh position={[l.foot.x, l.foot.y - 0.02, l.foot.z + 0.06]} scale={[1, 0.6, 1.5]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        </group>
      ))}

      {/* arms (behind torso so shoulders tuck in) */}
      {shoulders.map((sh, i) => <Stick key={i} from={sh} to={hands[i]} />)}
      {hands.map((h, i) => <Ink key={i} position={[h.x, h.y, h.z]} color={skin} outline={0.12} geometry={<sphereGeometry args={[0.085, 16, 12]} />} />)}

      {/* torso */}
      <group position={[0, 1.45, 0]} scale={[1, s, 1]}>
        <Ink color={outfitColor} outline={0.05} scale={[1, 1, 0.82]} geometry={<capsuleGeometry args={[0.36, 0.42, 6, 20]} />} />
        {outfit === "coat" && (
          <>
            {/* teal shirt "V" + lapel line */}
            <Flat color="#2f9c95" position={[0, 0.22, 0.3]}><circleGeometry args={[0.13, 3, -Math.PI / 2]} /></Flat>
            <Flat color={INK} position={[0, -0.05, 0.302]} scale={[0.012, 0.5, 1]}><planeGeometry /></Flat>
            <Flat color="#2f9c95" position={[0.17, 0.05, 0.29]} scale={[0.09, 0.05, 1]}><planeGeometry /></Flat>
          </>
        )}
        {outfit === "hoodie" && (
          <>
            <Flat color="#1f6d73" position={[0, -0.2, 0.3]} scale={[0.36, 0.17, 1]}><planeGeometry /></Flat>
            <Ink color={outfitColor} outline={0.08} position={[0, 0.38, -0.05]} rotation={[Math.PI / 2.4, 0, 0]} geometry={<torusGeometry args={[0.22, 0.07, 10, 24]} />} />
            {[-0.07, 0.07].map((x) => <Stick key={x} from={V(x, 0.3, 0.3)} to={V(x, 0.08, 0.31)} radius={0.012} />)}
          </>
        )}
        {outfit === "sweater" && (
          <Flat color={INK} position={[0, 0.2, 0.301]} scale={0.6}><ringGeometry args={[0.16, 0.18, 3, 1, -Math.PI / 2]} /></Flat>
        )}
      </group>

      {/* head */}
      <group position={[0, 2.25, 0]} rotation={[headTilt, headTurn, 0]}>
        <Ink color={skin} outline={0.04} geometry={<sphereGeometry args={[HEAD_R, 32, 24]} />} />
        {/* hair cap */}
        <Ink color={hair} outline={0.04} rotation={[0.42, 0, 0]} geometry={<sphereGeometry args={[HEAD_R * 1.04, 32, 16, 0, Math.PI * 2, 0, 1.0]} />} />
        {/* eyes */}
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.02, HEAD_R * 0.94]} scale={[1, Math.max(0.12, 1.25 * (1 - blink)), 0.5]}>
            <sphereGeometry args={[0.05, 12, 10]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        ))}
        {glasses && [-0.16, 0.16].map((x) => (
          <mesh key={"g" + x} position={[x, 0.02, HEAD_R * 0.97]}>
            <torusGeometry args={[0.11, 0.018, 8, 24]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        ))}
        {/* blush */}
        {[-0.3, 0.3].map((x) => (
          <mesh key={"b" + x} position={[x, -0.1, HEAD_R * 0.86]} rotation={[0, x * 1.1, 0]}>
            <circleGeometry args={[0.065, 20]} />
            <meshBasicMaterial color="#ef8a8a" transparent opacity={0.75} />
          </mesh>
        ))}
        {/* smile */}
        <mesh position={[0, -0.1, HEAD_R * 0.95]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.085, 0.017, 8, 20, Math.PI]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>
    </group>
  );
};
