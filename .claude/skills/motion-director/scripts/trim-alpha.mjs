#!/usr/bin/env node
// Crop a logo or mark to its own ink.
//
//   node trim-alpha.mjs <in.png> <out.png> [--pad 8]
//
// App icons and site logos rarely paint their own canvas: one mark fills 99%
// of its square, the next 60%, so at the same CSS size they render at
// different sizes with invisible margins ("why is this logo smaller"). Fix it
// in the asset: decode to raw RGBA, find the bounds of alpha > 8, crop.
import { dims, die, run } from "./lib.mjs";

const [inp, out] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const pad = process.argv.includes("--pad") ? +process.argv[process.argv.indexOf("--pad") + 1] : 8;
if (!inp || !out) die("usage: trim-alpha.mjs <in.png> <out.png> [--pad 8]");
const d = dims(inp) || die(`cannot read ${inp}`);
const raw = run("ffmpeg", ["-v", "error", "-i", inp, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { binary: true }).out;
let x0 = d.w, y0 = d.h, x1 = -1, y1 = -1;
for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) {
  if (raw[(y * d.w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
}
if (x1 < 0) die(`${inp} is fully transparent`);
x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(d.w - 1, x1 + pad); y1 = Math.min(d.h - 1, y1 + pad);
const w = x1 - x0 + 1, h = y1 - y0 + 1;
const r = run("ffmpeg", ["-v", "error", "-y", "-i", inp, "-vf", `crop=${w}:${h}:${x0}:${y0}`, out]);
if (r.code) die(r.err);
console.log(`${out}  ${w}x${h} (from ${d.w}x${d.h}, aspect ${(w / h).toFixed(2)})`);
