#!/usr/bin/env node
// Reference style: read a reference video's GRAMMAR, never its content.
//
//   node ref-style.mjs <url|file> --project <dir>
//
// Writes into <project>/ref/:
//   source.mp4                 the reference (downloaded with yt-dlp if a URL)
//   frames/NNNN.jpg            one frame every 0.5s
//   sheet-N.png                those frames, labelled with their time, 30 per sheet
//   style-data.json            what can be MEASURED: cut times and shot lengths,
//                              the palette by area, motion energy per second
//   style.md                   the write-up, drafted with the numbers; the rest
//                              (type, transitions, camera, texture, how text
//                              enters and exits) is filled in by LOOKING at the sheets
//
// Copy the grammar: palette proportions, rhythm, transitions, camera, texture,
// typographic behaviour. Never its content, logos, characters, footage or music.
import fs from "node:fs";
import path from "node:path";
import { die, duration, fmtT, logEvent, project, run, sheet, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const P = project(argv.includes("--project") ? argv[argv.indexOf("--project") + 1] : ".");
const srcArg = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1] === "--project"));
if (!srcArg) die("usage: ref-style.mjs <url|file> --project <dir>");
const t0 = Date.now();
const R = P.file("ref");
fs.mkdirSync(R, { recursive: true });
const src = path.join(R, "source.mp4");

if (/^https?:\/\//.test(srcArg)) {
  const y = run("yt-dlp", ["--version"]);
  if (y.code) die("a reference URL needs yt-dlp (https://github.com/yt-dlp/yt-dlp). Or download the video yourself and pass the file.");
  fs.rmSync(src, { force: true });
  const r = run("yt-dlp", ["-f", "bv*[height<=720]+ba/b[height<=720]/b", "--merge-output-format", "mp4", "--no-playlist", "-o", src, srcArg], { timeout: 900000 });
  if (r.code || !fs.existsSync(src)) die(`download failed: ${(r.err || "").split("\n").slice(-4).join("\n")}`);
} else {
  if (!fs.existsSync(srcArg)) die(`no such file: ${srcArg}`);
  fs.copyFileSync(srcArg, src);
}
const D = duration(src);

// frames every 0.5s
const fr = path.join(R, "frames");
fs.rmSync(fr, { recursive: true, force: true });
fs.mkdirSync(fr, { recursive: true });
run("ffmpeg", ["-v", "error", "-i", src, "-vf", "fps=2,scale=480:-2", "-q:v", "4", path.join(fr, "%04d.jpg")]);
const frames = fs.readdirSync(fr).filter((f) => f.endsWith(".jpg")).sort();
for (let i = 0; i < frames.length; i += 30) {
  sheet(frames.slice(i, i + 30).map((f, j) => ({ src: path.join(fr, f), label: fmtT((i + j) * 0.5) })),
    path.join(R, `sheet-${i / 30 + 1}.png`), { cols: 6, cell: 300, title: `reference ${fmtT(i * 0.5)}-${fmtT(Math.min(D, (i + 30) * 0.5))}` });
}

// cuts and shot lengths
const sc = run("ffmpeg", ["-hide_banner", "-i", src, "-vf", "select='gt(scene,0.32)',showinfo", "-f", "null", "-"]).err;
const cuts = [...sc.matchAll(/pts_time:([\d.]+)/g)].map((m) => +(+m[1]).toFixed(2));
const bounds = [0, ...cuts, D];
const shots = bounds.slice(1).map((b, i) => +(b - bounds[i]).toFixed(2)).filter((x) => x > 0.04);
const sorted = [...shots].sort((a, b) => a - b);
const stat = { cuts: cuts.length, shots: shots.length, median: sorted[Math.floor(sorted.length / 2)], mean: +(D / Math.max(1, shots.length)).toFixed(2), shortest: sorted[0], longest: sorted[sorted.length - 1] };

// palette by area: k-means over small frames
const W = 48, H = 27;
const px = run("ffmpeg", ["-v", "error", "-i", src, "-vf", `fps=1,scale=${W}:${H}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { binary: true }).out;
const pts = [];
for (let i = 0; i + 2 < px.length; i += 3 * 3) pts.push([px[i], px[i + 1], px[i + 2]]);
let cent = Array.from({ length: 8 }, (_, k) => pts[Math.floor((k + 0.5) * pts.length / 8)] || [0, 0, 0]);
for (let it = 0; it < 12; it++) {
  const acc = cent.map(() => [0, 0, 0, 0]);
  for (const p of pts) {
    let b = 0, bd = 1e9;
    cent.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; b = k; } });
    acc[b][0] += p[0]; acc[b][1] += p[1]; acc[b][2] += p[2]; acc[b][3]++;
  }
  cent = acc.map((a, k) => (a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3], a[3]] : [...cent[k].slice(0, 3), 0]));
}
const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
// merge clusters a viewer could not tell apart (five near-identical whites are one white)
const merged = [];
for (const c of cent.filter((c) => c[3]).sort((a, b) => b[3] - a[3])) {
  const m = merged.find((d) => Math.hypot(d[0] - c[0], d[1] - c[1], d[2] - c[2]) < 28);
  if (m) m[3] += c[3]; else merged.push([...c]);
}
const palette = merged.map((c) => ({ hex: hex(c), share: +(c[3] / pts.length).toFixed(3) }));

// motion energy per second: how busy the picture is, second by second
const mw = 64, mh = 36;
const g = run("ffmpeg", ["-v", "error", "-i", src, "-vf", `fps=10,scale=${mw}:${mh},format=gray`, "-f", "rawvideo", "-"], { binary: true }).out;
const nf = Math.floor(g.length / (mw * mh));
const energy = [];
for (let s = 0; s < Math.ceil(nf / 10); s++) {
  let tot = 0, n = 0;
  for (let i = Math.max(1, s * 10); i < Math.min(nf, s * 10 + 10); i++) {
    let d = 0;
    for (let k = 0; k < mw * mh; k++) d += Math.abs(g[i * mw * mh + k] - g[(i - 1) * mw * mh + k]);
    tot += d / (mw * mh); n++;
  }
  energy.push(+(tot / Math.max(1, n)).toFixed(1));
}

const data = { source: srcArg, duration: +D.toFixed(2), cutTimes: cuts, shotLengths: shots, shotStats: stat, palette, motionEnergyPerSecond: energy, frames: frames.length };
writeJSON(path.join(R, "style-data.json"), data);
const bars = energy.map((e) => "▁▂▃▄▅▆▇█"[Math.min(7, Math.floor(e / 4))]).join("");
fs.writeFileSync(path.join(R, "style.md"), `# Reference style

Source: ${srcArg} (${D.toFixed(1)}s). Grammar only: nothing from its content, logos, characters, footage or music goes into the film.

## Measured

- **Shots:** ${stat.shots} shots, ${stat.cuts} hard cuts. Median shot ${stat.median}s, mean ${stat.mean}s, shortest ${stat.shortest}s, longest ${stat.longest}s.
- **Palette by area:** ${palette.map((p) => `\`${p.hex}\` ${Math.round(p.share * 100)}%`).join(", ")}
- **Motion energy per second:** \`${bars}\` (${energy.join(", ")})

## Read off the sheets (fill in by looking at sheet-*.png)

- **Palette roles:** which colour is the ground, which the ink, which the single accent, and how much of the frame each takes
- **Type:** families (serif, grotesk, mono), weights, case, size relative to frame height, tracking, alignment
- **Shot lengths and rhythm:** where it rushes, where it holds, and what the hold is for
- **Transitions:** which kinds, and what on screen causes each (match cut, whip, zoom through, colour flood, mask, dip)
- **Camera moves:** push, pull, pan, orbit, parallax; speeds and eases
- **Texture:** grain, blur, glow, gradients, shadows, noise, 3D, flat
- **How text enters and exits:** per word, per letter, line blur, mask rise, slot roll, wipe; how long it holds
- **Grammar to copy into this film:** five concrete rules, each a number where possible
- **Do NOT copy:** its content, its logo, its characters, its footage, its music, its copy
`);
logEvent(P.dir, { phase: "ref-style", secs: +((Date.now() - t0) / 1000).toFixed(1), note: `${stat.shots} shots, ${frames.length} frames` });
console.log(`reference read: ${frames.length} frames, ${stat.shots} shots (median ${stat.median}s)
  LOOK at ${R}/sheet-*.png, then finish ${R}/style.md`);
