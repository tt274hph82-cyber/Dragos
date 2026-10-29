import React, { useMemo } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------
 * Cartoon look: flat toon shading (3 tone bands) + thick black outlines
 * drawn with the "inverted hull" trick (a slightly bigger black copy of
 * each mesh, rendered back-faces only).
 * ------------------------------------------------------------------ */

let gradient: THREE.DataTexture | null = null;
/** 3-step light ramp shared by all toon materials. */
export function toonGradient() {
  if (!gradient) {
    const data = new Uint8Array([90, 90, 90, 255, 190, 190, 190, 255, 255, 255, 255, 255]);
    gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;
  }
  return gradient;
}

export const Toon: React.FC<{ color: string }> = ({ color }) => (
  <meshToonMaterial color={color} gradientMap={toonGradient()} />
);

export const INK = "#141414";

type GeoProps = { geometry: React.ReactElement; color: string; outline?: number; position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] | number };

/** A mesh with toon shading and a black outline. `outline` = outline thickness as scale factor. */
export const Ink: React.FC<GeoProps> = ({ geometry, color, outline = 0.06, position, rotation, scale }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh>
      {geometry}
      <Toon color={color} />
    </mesh>
    {outline > 0 && (
      <mesh scale={1 + outline}>
        {geometry}
        <meshBasicMaterial color={INK} side={THREE.BackSide} />
      </mesh>
    )}
  </group>
);

/** Flat, unlit shape (for faces, posters, screen drawings). */
export const Flat: React.FC<{ color: string; children: React.ReactNode; position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] | number }> = ({ color, children, ...rest }) => (
  <mesh {...rest}>
    {children}
    <meshBasicMaterial color={color} />
  </mesh>
);

/** A thin black "stick" limb between two points, with rounded ends. */
export const Stick: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; radius?: number }> = ({ from, to, radius = 0.055 }) => {
  const { pos, quat, len } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5), quat, len };
  }, [from.x, from.y, from.z, to.x, to.y, to.z]);
  return (
    <mesh position={pos} quaternion={quat}>
      <capsuleGeometry args={[radius, Math.max(len, 0.001), 4, 10]} />
      <meshBasicMaterial color={INK} />
    </mesh>
  );
};

/** Text drawn on a canvas, used as a texture (posters, labels). */
export function useCanvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 512, h = 640) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
