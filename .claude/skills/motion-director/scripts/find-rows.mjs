#!/usr/bin/env node
// Where the rows of a real screenshot are, in the coordinates of the box that shows it.
//
//   node find-rows.mjs <image> --box <w>x<h> [--inset 10] [--fit cover|contain]
//                      [--pos top|center] [--x0 0.2 --x1 0.7]
//
// A highlight, cursor or stamp that steps down a table must land ON a row. Eyeballed
// offsets miss by a quarter row and read as broken. This decodes the image, finds
// the hairline dividers (a run of mid-grey pixels across most of the table width),
// and prints each row's top, centre and height inside the displayed box, after the
// same object-fit and object-position the page uses. Paste the numbers into the
// scene; never guess them.
import { dims, die, run } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const img = argv.find((a) => !a.startsWith("--") && !argv[argv.indexOf(a) - 1]?.startsWith("--"));
if (!img) die("usage: find-rows.mjs <image> --box <w>x<h> [--inset 10] [--fit cover] [--pos top]");
const [bw, bh] = (opt("--box") ?? die("--box <w>x<h>: the element's size in the film")).split("x").map(Number);
const inset = +opt("--inset", 0), fit = opt("--fit", "cover"), pos = opt("--pos", "top");
const x0f = +opt("--x0", 0.2), x1f = +opt("--x1", 0.7);
const d = dims(img) || die(`cannot read ${img}`);
const raw = run("ffmpeg", ["-v", "error", "-i", img, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"], { binary: true }).out;

// a divider row: 80%+ of the sampled pixels are a light or dark hairline grey
const xs = [];
for (let x = Math.round(d.w * x0f); x < Math.round(d.w * x1f); x += 3) xs.push(x);
const bg = raw[Math.round(d.h * 0.5) * d.w + 2];
const dark = bg < 128;
const isLine = (p) => (dark ? p >= 30 && p <= 90 : p >= 200 && p <= 242);
const hits = [];
for (let y = 0; y < d.h; y++) {
  let n = 0;
  for (const x of xs) if (isLine(raw[y * d.w + x])) n++;
  if (n > 0.8 * xs.length) hits.push(y);
}
const lines = [];
for (const y of hits) { const l = lines[lines.length - 1]; if (l && y - l[1] <= 2) l[1] = y; else lines.push([y, y]); }
if (lines.length < 2) die("found fewer than 2 dividers: try --x0/--x1 to sample only the table's columns");

// image px -> box px, as object-fit / object-position lay it out
const iw = bw - 2 * inset, ih = bh - 2 * inset;
const s = fit === "contain" ? Math.min(iw / d.w, ih / d.h) : Math.max(iw / d.w, ih / d.h);
const oy = pos === "center" ? (ih - d.h * s) / 2 : 0;
const toBox = (y) => Math.round(inset + oy + y * s);
console.log(`${img}: ${lines.length} dividers, ${lines.length - 1} rows; scale ${s.toFixed(4)} into ${bw}x${bh} (inset ${inset}, ${fit}, ${pos})`);
console.log("row  top  centre  height   (box px)");
const rows = [];
for (let i = 0; i + 1 < lines.length; i++) {
  const a = toBox(lines[i][1] + 1), b = toBox(lines[i + 1][0]);
  if (b > bh) break;
  rows.push(Math.round((a + b) / 2));
  console.log(`${String(i + 1).padStart(3)}  ${String(a).padStart(4)}  ${String(Math.round((a + b) / 2)).padStart(6)}  ${String(b - a).padStart(6)}`);
}
console.log(`centres: [${rows.join(", ")}]`);
