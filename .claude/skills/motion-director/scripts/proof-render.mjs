#!/usr/bin/env node
// Render a standalone HyperFrames folder (index.html + assets/) to <dir>/out.mp4
// and a dense frame sheet, for method tests outside a project.
//   node proof-render.mjs <dir> [--fps 4]
import fs from "node:fs";
import path from "node:path";
import { die, hf, run } from "./lib.mjs";
const dir = path.resolve(process.argv[2] || die("usage: proof-render.mjs <dir>"));
const fps = process.argv.includes("--fps") ? process.argv[process.argv.indexOf("--fps") + 1] : "4";
if (!fs.existsSync(path.join(dir, "hyperframes.json"))) fs.writeFileSync(path.join(dir, "hyperframes.json"), JSON.stringify({ paths: { assets: "assets" } }));
if (!fs.existsSync(path.join(dir, "meta.json"))) fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ id: path.basename(dir), name: path.basename(dir) }));
const out = path.join(dir, "out.mp4"), t = Date.now();
const r = hf(["render", "-o", out, "--quiet", "--quality", process.argv.includes("--final") ? "delivery" : "draft", "--workers", "4"], { cwd: dir, timeout: 1800000 });
if (r.code || !fs.existsSync(out)) die((r.err || r.out).split("\n").slice(-14).join("\n"));
run("ffmpeg", ["-v", "error", "-y", "-i", out, "-vf", `fps=${fps},scale=300:-2,tile=8x5:padding=3:color=white`, "-frames:v", "1", path.join(dir, "dense.jpg")]);
console.log(`${out} in ${((Date.now() - t) / 1000).toFixed(1)}s; sheet ${path.join(dir, "dense.jpg")}`);
