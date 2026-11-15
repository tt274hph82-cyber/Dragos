#!/usr/bin/env node
// What motion-director needs, and what is missing.
//
//   node scripts/check-setup.mjs          report
//   node scripts/check-setup.mjs --fix    also fetch HyperFrames and its Chrome
//                                         (an npm download into the npx cache;
//                                         nothing is installed globally)
//
// Required: Node 22+, FFmpeg + FFprobe, HyperFrames (run through npx, pinned),
// the Chrome HyperFrames renders with, ~2 GB free disk.
// Optional: yt-dlp (only to download a reference video from a URL).
// Remotion is NEVER required: it is a fallback for people who already use it.
import fs from "node:fs";
import os from "node:os";
import { HF_VERSION, HOME, hf, run } from "./lib.mjs";

const fix = process.argv.includes("--fix");
const mac = process.platform === "darwin";
const rows = [];
const add = (ok, name, detail, hint) => rows.push({ ok, name, detail, hint });

const major = +process.versions.node.split(".")[0];
add(major >= 22, "Node.js 22+", `v${process.versions.node}`, mac ? "brew install node@22   (or https://nodejs.org)" : "https://nodejs.org (22 LTS or newer)");

for (const bin of ["ffmpeg", "ffprobe"]) {
  const r = run(bin, ["-version"]);
  add(r.code === 0, bin, r.code === 0 ? r.out.split("\n")[0].split(" ").slice(0, 3).join(" ") : "not found", mac ? "brew install ffmpeg" : "sudo apt install ffmpeg   (or https://ffmpeg.org/download.html)");
}

const npx = run("npx", ["--version"]);
add(npx.code === 0, "npx", npx.code === 0 ? npx.out.trim() : "not found", "comes with Node.js");

let hfOk = false;
if (npx.code === 0) {
  const v = hf(["--version"], { timeout: fix ? 600000 : 120000 });
  hfOk = v.code === 0;
  add(hfOk, `HyperFrames ${HF_VERSION}`, hfOk ? `npx hyperframes@${HF_VERSION} ${v.out.trim().split("\n").pop()}` : "could not run", `node scripts/check-setup.mjs --fix   (downloads hyperframes@${HF_VERSION} into the npx cache)`);
}
if (hfOk) {
  let p = hf(["browser", "path"]);
  let path_ = (p.out || "").trim().split("\n").pop();
  if ((!path_ || !fs.existsSync(path_)) && fix) { hf(["browser", "ensure"], { timeout: 900000, inherit: true }); p = hf(["browser", "path"]); path_ = (p.out || "").trim().split("\n").pop(); }
  const ok = !!path_ && fs.existsSync(path_);
  add(ok, "Chrome for rendering", ok ? path_.replace(os.homedir(), "~") : "not downloaded yet", "node scripts/check-setup.mjs --fix   (HyperFrames downloads its own headless Chrome)");
}

const df = run("df", ["-k", os.homedir()]);
const freeGB = df.code === 0 ? +df.out.trim().split("\n").pop().split(/\s+/)[3] / 1048576 : NaN;
add(!(freeGB < 2), "Free disk (2 GB+)", isNaN(freeGB) ? "unknown" : `${freeGB.toFixed(0)} GB free`, "free some space: a 30s project with its renders is ~0.5-1 GB");

const yt = run("yt-dlp", ["--version"]);
add(yt.code === 0 ? true : null, "yt-dlp (optional)", yt.code === 0 ? yt.out.trim() : "not found: only needed to download a reference video from a URL", mac ? "brew install yt-dlp" : "pipx install yt-dlp");

const rem = fs.existsSync("package.json") && /"remotion"/.test(fs.readFileSync("package.json", "utf8"));
add(null, "Remotion (fallback, optional)", rem ? "found in this folder: pass --remotion . to new-project.mjs to use it" : "not used: HyperFrames is the default", "never required");

if (process.env.GEMINI_API_KEY || process.env.HEYGEN_API_KEY)
  add(null, "Cloud keys in your environment", "found, and STRIPPED from every HyperFrames call: no frames are uploaded and nothing is billed", "set MD_ALLOW_CLOUD=1 only if you want HyperFrames' paid vision features");

console.log(`\nmotion-director setup  (projects and brands in ${HOME.replace(os.homedir(), "~")})\n`);
for (const r of rows) {
  const mark = r.ok === true ? "  ok " : r.ok === false ? "  !! " : "  -- ";
  console.log(`${mark}${r.name.padEnd(30)} ${r.detail}`);
  if (r.ok === false) console.log(`       fix: ${r.hint}`);
}
const missing = rows.filter((r) => r.ok === false);
console.log(missing.length ? `\n${missing.length} thing(s) missing. Fix those, then run this again.` : "\nReady. Ask your agent for a motion graphics video.");
process.exit(missing.length ? 1 : 0);
