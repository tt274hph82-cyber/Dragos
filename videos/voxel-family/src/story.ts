// The shot list: when each cut lands (seconds, cued on the narration's word times), the camera's move
// (from / to position and look-at), and who talks, faces and arm poses for that shot.
export type V3 = [number, number, number];
type Arms = [number, number, number?, number?];   // armR forward, armL forward, armR out, armL out (radians)
export type Shot = { from: number; pos: [V3, V3]; look: [V3, V3]; fov: number; shake?: number; talk?: string;
  faces?: Record<string, any>; arms?: Record<string, Arms>; ry?: Record<string, number> };
export const JOINS = [2.1, 8.6, 16.2];   // Mom, Dad, sister spawn
export const NIGHT = 22.38, DAWN = 33.9;
const KIDC: V3 = [0.4, 0.8, 0.6];
const kidClose = (from: number, extra: Partial<Shot> = {}): Shot => ({ from, pos: [[0.62, 1.05, 2.5], [0.58, 1.0, 2.2]], look: [KIDC, KIDC], fov: 40, ...extra });
export const SHOTS: Shot[] = [
  { from: 0, pos: [[3.6, 2.6, 7.0], [3.0, 2.2, 5.8]], look: [[0.2, 0.9, 0.2], [0.2, 0.9, 0.2]], fov: 46, faces: { kid: "happy" } },
  kidClose(0.94, { faces: { kid: "happy" }, arms: { kid: [0.1, 0.1, 0.5, 0.5] } }),
  { from: 2.1, pos: [[-0.3, 1.4, 3.6], [-0.6, 1.3, 3.0]], look: [[-1.0, 0.9, 0.5], [-1.0, 0.9, 0.5]], fov: 44, faces: { kid: "shock" } },
  { from: 3.2, pos: [[-0.95, 1.25, 2.35], [-1.0, 1.22, 2.05]], look: [[-1.1, 0.98, 0.5], [-1.1, 0.98, 0.5]], fov: 44, faces: { mom: "smug" }, arms: { mom: [0.1, 0.1, 0.4, 0] } },
  { from: 4.0, pos: [[1.8, 3.2, 4.8], [1.4, 2.8, 4.1]], look: [[-1.8, 1.0, -2.2], [-1.8, 1.0, -2.2]], fov: 50, faces: { kid: "shock" } },
  { from: 5.4, pos: [[1.0, 1.7, 3.0], [0.8, 1.6, 2.6]], look: [[-1.5, 1.0, -1.5], [-1.5, 1.0, -1.5]], fov: 46, faces: { kid: "shock", mom: "happy" }, arms: { mom: [0.1, 0.1, 1.2, 1.2] } },
  { from: 6.24, pos: [[-0.75, 1.32, 1.45], [-0.82, 1.28, 1.1]], look: [[-1.2, 1.01, -0.6], [-1.2, 1.01, -0.6]], fov: 44, talk: "mom", arms: { mom: [1.5, 0.1, 0.1, 0] }, ry: { mom: 0.4 } },
  kidClose(7.32, { faces: { kid: "shock" }, arms: { kid: [0.6, 0.6, 0.3, 0.3] } }),
  { from: 8.6, pos: [[2.4, 1.6, 3.2], [2.1, 1.45, 2.7]], look: [[1.5, 0.95, -0.2], [1.5, 0.95, -0.2]], fov: 44, faces: { kid: "shock" } },
  { from: 9.82, pos: [[1.75, 1.42, 1.95], [1.7, 1.38, 1.65]], look: [[1.5, 1.1, -0.2], [1.5, 1.1, -0.2]], fov: 44, faces: { dad: "grin" }, ry: { dad: 0 } },
  { from: 10.6, pos: [[2.5, 0.7, 2.2], [2.35, 0.8, 1.9]], look: [[1.5, 1.4, -0.2], [1.5, 1.4, -0.2]], fov: 46, faces: { dad: "happy" }, arms: { dad: [3.0, 0.1, 0, 0.3] }, ry: { dad: -0.2 } },
  kidClose(12.1, { faces: { kid: "groan" }, arms: { kid: [2.5, 0.1, -0.5, 0] } }),
  { from: 13.5, pos: [[1.75, 1.42, 1.85], [1.7, 1.38, 1.55]], look: [[1.5, 1.1, -0.2], [1.5, 1.1, -0.2]], fov: 44, talk: "dad", arms: { dad: [1.2, 1.2, 0.5, 0.5] }, ry: { dad: 0 } },
  { from: 15.36, pos: [[-0.2, 1.5, 3.4], [-0.3, 1.45, 3.0]], look: [[-0.4, 0.95, 0.0], [-0.4, 0.95, 0.0]], fov: 44, faces: { kid: "groan", mom: "groan", dad: "grin" }, arms: { kid: [2.5, 0.1, -0.5, 0] } },
  { from: 16.2, pos: [[0.4, 1.0, 4.0], [0.2, 1.0, 3.5]], look: [[-0.2, 0.7, 1.6], [-0.2, 0.7, 1.6]], fov: 44, faces: { kid: "shock" } },
  { from: 17.82, pos: [[-0.12, 0.88, 3.1], [-0.15, 0.86, 2.85]], look: [[-0.2, 0.68, 1.6], [-0.2, 0.68, 1.6]], fov: 44, faces: { sis: "happy" }, arms: { sis: [0.1, 0.1, 0.7, 0.7] } },
  { from: 18.6, pos: [[0.0, 1.8, 6.4], [0.3, 1.6, 5.6]], look: [[0.0, 0.5, 2.0], [0.3, 0.5, 2.0]], fov: 46 },
  { from: 19.64, pos: [[-0.6, 0.55, 4.3], [-0.2, 0.55, 4.1]], look: [[-1.0, 0.3, 2.2], [-0.6, 0.3, 2.2]], fov: 44 },
  { from: 20.68, pos: [[1.7, 0.95, 2.25], [1.45, 0.92, 2.2]], look: [[0.25, 0.66, 1.8], [0.3, 0.66, 1.8]], fov: 44, talk: "sis", arms: { sis: [1.6, 1.6, 0, 0] } },
  { from: 22.38, pos: [[2.8, 3.2, 6.0], [2.4, 2.8, 5.1]], look: [[-1.0, 1.0, -1.0], [-1.0, 1.0, -1.0]], fov: 50, faces: { kid: "shock", mom: "shock", dad: "shock", sis: "shock" } },
  { from: 23.22, pos: [[0.5, 1.2, 3.6], [0.45, 1.15, 3.2]], look: [[-0.2, 1.1, 0.4], [-0.2, 1.2, 0.4]], fov: 46, faces: { kid: "shock", mom: "shock", dad: "shock", sis: "shock" } },
  { from: 24.18, pos: [[1.5, 8.0, 6.5], [1.2, 6.8, 5.2]], look: [[0.2, 0, 0.5], [0.2, 0, 0.5]], fov: 55, faces: { kid: "shock", mom: "shock", dad: "shock", sis: "shock" } },
  kidClose(25.8, { talk: "kid", arms: { kid: [2.9, 2.9, 0.3, 0.3] }, shake: 0.4 }),
  { from: 27.62, pos: [[-0.1, 1.5, 2.9], [-0.25, 1.45, 2.5]], look: [[-1.2, 1.15, 0.2], [-1.2, 1.15, 0.2]], fov: 44, faces: { mom: "yell" }, arms: { mom: [2.8, 0.1, 0, 0] }, ry: { mom: 0.8 } },
  { from: 28.42, pos: [[2.6, 1.3, 1.95], [2.5, 1.25, 2.25]], look: [[0.6, 1.2, 4.2], [0.6, 1.2, 4.2]], fov: 44, faces: { mom: "smug" }, arms: { mom: [1.0, 0.1, 0, 0] }, ry: { mom: 0.8 } },
  { from: 29.28, pos: [[1.75, 1.42, 1.85], [1.7, 1.38, 1.55]], look: [[1.5, 1.1, -0.2], [1.5, 1.1, -0.2]], fov: 44, talk: "dad", arms: { dad: [1.3, 1.3, 0.5, 0.5] }, ry: { dad: 0 } },
  { from: 30.46, pos: [[0.0, 1.7, -0.4], [0.05, 1.65, -0.1]], look: [[1.4, 1.0, 4.0], [1.4, 1.0, 4.0]], fov: 48, faces: { kid: "shock" } },
  { from: 31.02, pos: [[1.2, 7.5, 6.0], [1.2, 8.5, 6.6]], look: [[0.2, 0, 0.5], [0.2, 0, 0.5]], fov: 55, faces: { kid: "happy", mom: "smug", dad: "grin", sis: "happy" } },
  { from: 32.46, pos: [[-0.6, 3.4, -2.6], [-0.6, 3.1, -2.0]], look: [[0.6, 0.3, 3.4], [0.6, 0.3, 3.6]], fov: 52, faces: { sis: "yell" } },
  { from: 34.02, pos: [[0.4, 1.7, 5.0], [0.4, 1.55, 4.2]], look: [[0.1, 1.0, 0.5], [0.1, 1.0, 0.5]], fov: 46, faces: { kid: "happy", mom: "happy", dad: "happy", sis: "happy" }, arms: { kid: [2.9, 2.9, 0.3, 0.3], mom: [2.9, 2.9, 0.3, 0.3], dad: [2.9, 2.9, 0.3, 0.3], sis: [2.9, 2.9, 0.3, 0.3] } },
  kidClose(35.12, { talk: "kid", faces: { kid: "happy" } }),
  { from: 36.34, pos: [[0.4, 1.4, 3.6], [0.4, 1.35, 3.2]], look: [[0.1, 1.0, 0.5], [0.1, 1.0, 0.5]], fov: 46, faces: { kid: "happy", mom: "happy", dad: "grin", sis: "happy" }, arms: { kid: [0.1, 0.1, 0.6, 0.6], sis: [2.9, 2.9, 0.3, 0.3] } },
  { from: 37.42, pos: [[0.6, 2.4, 6.4], [0.5, 2.2, 5.6]], look: [[0.1, 0.9, 0.3], [0.1, 0.9, 0.3]], fov: 46, faces: { kid: "happy", mom: "happy", dad: "happy", sis: "happy" } },
];
