#!/usr/bin/env node
// Cut the subject (a person, a hand, an object) out of a real photo, to a PNG
// with alpha cropped to the subject. Uses Apple's Vision framework on macOS 14+
// (compiled once from native/cutout.swift); nothing is downloaded or uploaded.
//
//   node cutout.mjs <in.jpg|png> <out.png> [--instance N]
//
// Works on photos (faces, people, products on a table, video stills); a UI
// screenshot has no subject and fails. Paper and object-story films need these.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SKILL, die, run } from "./lib.mjs";

const args = process.argv.slice(2);
if (args.length < 2) die("usage: cutout.mjs <in> <out.png> [--instance N]");
if (process.platform !== "darwin") die("cutout needs macOS 14+ (Vision). Elsewhere, ask the user for cut-out PNGs.");
const bin = path.join(os.homedir(), ".cache", "motion-director", "cutout");
const src = path.join(SKILL, "scripts", "native", "cutout.swift");
if (!fs.existsSync(bin) || fs.statSync(bin).mtimeMs < fs.statSync(src).mtimeMs) {
  fs.mkdirSync(path.dirname(bin), { recursive: true });
  const c = run("swiftc", ["-O", src, "-o", bin]);
  if (c.code) die(`could not compile the cutout tool (needs Xcode command line tools): ${c.err.slice(-300)}`);
}
const r = run(bin, args);
if (r.code) die(r.out.trim() || r.err.trim());
console.log(r.out.trim());
