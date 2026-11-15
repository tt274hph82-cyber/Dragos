#!/usr/bin/env node
// Lint, check and render one round.
//
//   node render.mjs --project <dir> --round <n> [--draft]
//
// 1. lint-md.mjs (the film's own rules)        any error stops the render
// 2. hyperframes check --json (the contract)   any error stops the render
// 3. hyperframes render -> critique/round-<n>/film.mp4, timed
// A gate that stops the render prints why; nothing renders "best effort".
import fs from "node:fs";
import path from "node:path";
import { SKILL, die, duration, hf, lastJSON, logEvent, project, run, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const P = project(opt("--project", "."));
const round = +opt("--round", 1);
const dir = P.file("critique", `round-${round}`);
fs.mkdirSync(dir, { recursive: true });
const film = P.file("film");

// keep the score in step with the grid before anything else reads it
if (!fs.existsSync(path.join(film, "assets", "score.wav"))) die("no film/assets/score.wav: run synth.mjs");

console.log("1/3 lint-md");
const lint = run("node", [path.join(SKILL, "scripts", "lint-md.mjs"), "--project", P.dir]);
process.stdout.write(lint.out);
if (lint.code) die("lint-md found errors; fix them before rendering");
// every frame measured: text outside its box or the frame, text on text
const audit = run("node", [path.join(SKILL, "scripts", "frame-audit.mjs"), P.file("film"), "--margin", P.meta.height > P.meta.width ? "40" : "24"]);
process.stdout.write(audit.out);
if (audit.code) die("frame-audit found problems on screen; fix every one before rendering");

console.log("2/3 hyperframes check");
const t1 = Date.now();
// safe margins: nothing breaches the frame edge, and on 9:16 no copy sits in
// the band the platform paints its caption, handle and buttons over
const zone = P.meta.format === "9:16" ? ["--caption-zone", `x0=0;y0=${(1330 / 1920).toFixed(3)};x1=1;y1=1;severity=error;seek=.25,.5,.75`] : [];
const chk = hf(["check", "--json", "--at-transitions", "--max-transition-samples", "40", "--frame-check", "severity=warning;seek=.25,.5,.75;tol=4", ...zone], { cwd: film, timeout: 600000 });
const cj = lastJSON(chk.out);
if (!cj) die(`check produced no JSON: ${chk.err.slice(-600)}`);
writeJSON(path.join(dir, "check.json"), cj);
const findings = [];
for (const k of ["lint", "runtime", "layout", "motion", "contrast", "craft"]) for (const f of cj[k]?.findings || []) findings.push({ area: k, ...f });
const errs = findings.filter((f) => f.severity === "error");
for (const f of findings) console.log(`  ${f.severity.padEnd(7)} ${f.area}/${f.code}: ${(f.message || "").slice(0, 180)}`);
logEvent(P.dir, { phase: "check", round, secs: +((Date.now() - t1) / 1000).toFixed(1), note: `${errs.length} errors, ${findings.length - errs.length} warnings` });
if (errs.length || cj.browserSkipped) die(`hyperframes check: ${errs.length} error(s)${cj.browserSkipped ? ", runtime checks skipped" : ""}. Fix and re-run.`);

console.log("3/3 render");
const out = path.join(dir, "film.mp4");
fs.rmSync(out, { force: true });
const t2 = Date.now();
const r = hf(["render", "-o", out, "--quiet", "--quality", argv.includes("--draft") ? "draft" : "delivery", "--video-frame-format", "png", "--workers", process.env.MD_WORKERS || "4"], { cwd: film, timeout: 3600000 });
const secs = +((Date.now() - t2) / 1000).toFixed(1);
if (r.code || !fs.existsSync(out)) die(`render failed after ${secs}s:\n${(r.err || r.out).split("\n").slice(-15).join("\n")}`);
// The renderer's own mixer lands the score ~2 dB under the file that was
// measured. Mux the approved mix ONCE onto the stream-copied picture: one AAC
// encode, padded then capped to the picture so neither stream runs long.
{
  const pic = duration(out);
  const tmp = out.replace(/\.mp4$/, ".mux.mp4");
  const m = run("ffmpeg", ["-v", "error", "-y", "-i", out, "-i", path.join(film, "assets", "score.wav"), "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-af", "apad", "-t", pic.toFixed(4), "-movflags", "+faststart", tmp]);
  if (m.code || !fs.existsSync(tmp)) die(`audio mux failed: ${m.err}`);
  fs.renameSync(tmp, out);
}
const d = duration(out);
logEvent(P.dir, { phase: "render", round, secs, note: `${d.toFixed(2)}s film, ${(fs.statSync(out).size / 1e6).toFixed(1)} MB` });
console.log(`rendered ${out}\n  ${d.toFixed(2)}s of film in ${secs}s (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)\n  next: node critique.mjs --project ${P.dir} --round ${round}`);
