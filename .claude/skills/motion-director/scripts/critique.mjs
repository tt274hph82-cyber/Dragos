#!/usr/bin/env node
// The critique loop: measure the rendered film, lay out its key frames, score it.
//
//   node critique.mjs --project <dir> --round <n>
//       Measures critique/round-<n>/film.mp4 and writes, in that folder:
//         sheet.png         key frames: frame 0, each shot at +0.3s and its middle, the last frame
//         phone.png         the same frames at phone width (360px): can every line be read?
//         metrics.json      what was MEASURED (see below)
//         scores.json       the six scores to fill in, after LOOKING at both sheets
//
//   node critique.mjs --project <dir> --round <n> --verdict
//       Reads the filled scores.json, prints the table and decides:
//       every axis >= 8 -> deliver; anything under 8 -> fix and render round n+1;
//       after round 3 -> deliver the best round and say what is still under 8.
//
// Measured, not judged: timestamps one frame apart from zero; the longest
// stretch where nothing on screen changes, per shot; whether each sound effect
// actually lands in the delivered audio, and how far from its frame; loudness
// and true peak; the HyperFrames check's craft warnings (unread lines, dead
// stretches, small text, empty first frame).
import fs from "node:fs";
import path from "node:path";
import { die, duration, fmtT, logEvent, project, readJSON, run, sheet, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const P = project(opt("--project", "."));
const round = +opt("--round", 1);
const dir = P.file("critique", `round-${round}`);
const film = path.join(dir, "film.mp4");
const AXES = {
  hook: "Hook: does frame 0 and the first 2s stop a scroll? A result, a real product or one bold line on screen at once, never black or a logo",
  brand: "Brand match: the brand's own colours, type, logo and real product, used the way the brand uses them",
  motion: "Motion quality: eases by role, arrive slow and leave clean, moves with a cause, nothing robotic or floating",
  readability: "Readability: every line held long enough to read, big enough at phone width, inside the safe box, contrast",
  pacing: "Pacing: cuts on the beat, layout changes on the bar, no dead stretch over ~3s, the signature moment lands on the drop",
  polish: "Polish: no jumps at seams, no clipped shadows, no stray pixels, sound effects on their frames, a held end card",
};

/* -------------------------------------------------------------- verdict */

if (argv.includes("--verdict")) {
  const sc = readJSON(path.join(dir, "scores.json"));
  const bad = [];
  for (const k of Object.keys(AXES)) {
    const v = sc[k]?.score;
    if (!Number.isInteger(v) || v < 1 || v > 10) die(`scores.json: ${k}.score must be a whole number 1-10 (got ${v})`);
    if (v < 8 && !(sc[k].fix || []).length) die(`scores.json: ${k} is ${v}; under 8 needs at least one concrete "fix" line`);
    if (v < 8) bad.push(k);
  }
  const row = Object.keys(AXES).map((k) => sc[k].score);
  const mean = (row.reduce((a, b) => a + b, 0) / row.length).toFixed(1);
  const table = `| round | hook | brand | motion | readability | pacing | polish | mean |\n|---|---|---|---|---|---|---|---|\n| ${round} | ${row.join(" | ")} | ${mean} |`;
  const hist = P.file("critique", "history.json");
  const h = readJSON(hist, { rounds: [] });
  h.rounds = h.rounds.filter((r) => r.round !== round);
  h.rounds.push({ round, scores: Object.fromEntries(Object.keys(AXES).map((k) => [k, sc[k].score])), mean: +mean, fixes: Object.fromEntries(bad.map((k) => [k, sc[k].fix])), notes: Object.fromEntries(Object.keys(AXES).map((k) => [k, sc[k].notes || []])) });
  h.rounds.sort((a, b) => a.round - b.round);
  writeJSON(hist, h);
  console.log(table);
  for (const k of bad) console.log(`  ${k} ${sc[k].score}: ${sc[k].fix.join("; ")}`);
  let verdict;
  if (!bad.length) verdict = `PASS: every axis 8 or over. Deliver round ${round}: node deliver.mjs --project ${P.dir} --round ${round}`;
  else if (round >= 3) {
    const best = [...h.rounds].sort((a, b) => Math.min(...Object.values(b.scores)) - Math.min(...Object.values(a.scores)) || b.mean - a.mean)[0];
    verdict = `STOP: 3 rounds done. Deliver the best round (${best.round}) and report what is still under 8: ${bad.join(", ")}`;
  } else verdict = `FIX: ${bad.join(", ")} under 8. Apply the fixes, then render round ${round + 1}.`;
  console.log(verdict);
  logEvent(P.dir, { phase: "critique-verdict", round, secs: 0, note: `${row.join("/")} -> ${verdict.split(":")[0]}` });
  process.exit(0);
}

/* -------------------------------------------------------------- measure */

if (!fs.existsSync(film)) die(`no ${film}: run render.mjs --round ${round}`);
const t0 = Date.now();
const G = readJSON(P.file("sound", "beats.json"));
const meta = P.meta;
const D = duration(film);
const M = { round, film, duration: +D.toFixed(3), expected: G.length, problems: [] };
if (Math.abs(D - G.length) > 0.05) M.problems.push(`film is ${D.toFixed(2)}s, the grid says ${G.length}s`);

// timestamps: every frame 1/fps apart, starting at zero (a duplicated
// timestamp passes every duration check and plays as a glitch)
{
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "packet=pts_time", "-of", "csv=p=0", film]);
  const pts = r.out.split(/\s+/).map((x) => parseFloat(x)).filter((x) => !isNaN(x)).sort((a, b) => a - b);
  const step = 1 / meta.fps;
  const bad = pts.slice(1).filter((p, i) => Math.abs(p - pts[i] - step) > step / 2).length;
  M.timestamps = { frames: pts.length, first: pts[0], irregular: bad };
  if (Math.abs(pts[0]) > 1e-6 || bad) M.problems.push(`timestamps: first ${pts[0]}, ${bad} irregular gap(s)`);
}

// stillness: count the PIXELS that changed, not the mean change (a small real
// move averaged against a still frame vanishes; grain must not count as motion)
{
  const W = 160, H = Math.round((160 * meta.height) / meta.width), fps = 10;
  const r = run("ffmpeg", ["-v", "error", "-i", film, "-vf", `fps=${fps},scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], { binary: true });
  const buf = r.out, n = Math.floor(buf.length / (W * H));
  const still = [];
  for (let i = 1; i < n; i++) {
    let moved = 0;
    for (let k = 0; k < W * H; k++) if (Math.abs(buf[i * W * H + k] - buf[(i - 1) * W * H + k]) > 6) moved++;
    still.push(moved / (W * H) < 0.004);
  }
  M.stillness = G.shots.map((s, si) => {
    let best = 0, run_ = 0, at = 0, runAt = 0;
    for (let i = Math.ceil(s.a * fps); i < Math.min(still.length, Math.floor(s.b * fps)); i++) {
      if (still[i]) { if (!run_) runAt = i; run_++; if (run_ > best) { best = run_; at = runAt; } } else run_ = 0;
    }
    const secs = best ? (best + 1) / fps : 0;
    const last = si === G.shots.length - 1;
    const limit = last ? 3.5 : 3.0; // the end card may hold; nothing else may sit still for 3s
    if (secs > limit) M.problems.push(`${s.id}: nothing moves for ${secs.toFixed(1)}s from ${fmtT(at / fps)} (limit ${limit}s)`);
    return { shot: s.id, longestStill: +secs.toFixed(2), at: +(at / fps).toFixed(2) };
  });
  // first frame: is anything on it? (it is the thumbnail on every social player)
  const f0 = buf.subarray(0, W * H), corner = [f0[0], f0[W - 1], f0[(H - 1) * W], f0[H * W - 1]].sort((a, b) => a - b)[1];
  let ink = 0;
  for (let k = 0; k < W * H; k++) if (Math.abs(f0[k] - corner) > 24) ink++;
  M.firstFrameInk = +(ink / (W * H)).toFixed(3);
  if (M.firstFrameInk < 0.03) M.problems.push(`frame 0 is nearly empty (${(M.firstFrameInk * 100).toFixed(1)}% ink): the first frame is the thumbnail`);
}

// sound: present, loud enough, and each effect landing on its frame IN THE DELIVERED FILE
{
  const e = run("ffmpeg", ["-hide_banner", "-i", film, "-af", "ebur128=peak=true", "-f", "null", "-"]).err;
  M.loudness = {
    lufs: parseFloat((e.match(/I:\s+(-?[\d.]+) LUFS/g) || ["nan"]).pop().match(/-?[\d.]+|nan/)[0]),
    truePeak: parseFloat((e.match(/Peak:\s+(-?[\d.]+) dBFS/g) || ["nan"]).pop().match(/-?[\d.]+|nan/)[0]),
  };
  if (!(M.loudness.lufs > -17 && M.loudness.lufs < -12)) M.problems.push(`loudness ${M.loudness.lufs} LUFS (want about -14)`);
  if (M.loudness.truePeak > -0.5) M.problems.push(`true peak ${M.loudness.truePeak} dBFS (want -1 or lower)`);
  const SR = 8000;
  const a = run("ffmpeg", ["-v", "error", "-i", film, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { binary: true }).out;
  const x = new Float32Array(a.buffer, a.byteOffset, Math.floor(a.length / 4));
  const hop = 40; // 5 ms
  const env = [];
  // a 300 Hz - 4 kHz band envelope: where UI sounds live and where a phone
  // speaker plays. (A first-difference envelope was tried first: it favours
  // hats at 8 kHz and read a clearly audible 700 Hz pop as +1.7 dB.)
  const hpA = Math.exp(-2 * Math.PI * 300 / SR), lpA = Math.exp(-2 * Math.PI * 4000 / SR);
  let hpY = 0, hpX = 0, lpY = 0;
  const band = new Float32Array(x.length);
  for (let k = 0; k < x.length; k++) { hpY = hpA * (hpY + x[k] - hpX); hpX = x[k]; lpY = (1 - lpA) * hpY + lpA * lpY; band[k] = lpY; }
  for (let i = 0; i + hop <= x.length; i += hop) { let s = 0; for (let k = i; k < i + hop; k++) s += band[k] * band[k]; env.push(Math.sqrt(s / hop)); }
  const at = (t) => env[Math.max(0, Math.min(env.length - 1, Math.round((t * SR) / hop)))];
  // broadband RMS in 30 ms windows, for sounds that swell rather than click
  const rmsAt = (t) => { const a0 = Math.max(0, Math.round((t - 0.015) * SR)), a1 = Math.min(x.length, a0 + Math.round(0.03 * SR)); let q = 0; for (let k = a0; k < a1; k++) q += x[k] * x[k]; return Math.sqrt(q / Math.max(1, a1 - a0)); };
  const sj = readJSON(P.file("sound", "sound.json"), { sfx: [] });
  M.sfx = sj.sfx.filter((s) => s.type !== "riser").map((s) => {
    let best = 0, bt = s.t;
    for (let t = s.t - 0.08; t <= s.t + 0.08; t += hop / SR) if (at(t) > best) { best = at(t); bt = t; }
    const before = [];
    for (let t = s.t - 0.4; t < s.t - 0.12; t += hop / SR) before.push(at(t));
    before.sort((p, q) => p - q);
    const floor = before[Math.floor(before.length / 2)] || 1e-6;
    let rise = 20 * Math.log10(best / floor);
    if (s.type === "shimmer") { let b2 = 0; for (let t = s.t; t <= s.t + 0.3; t += hop / SR) b2 = Math.max(b2, at(t)); rise = 20 * Math.log10(b2 / floor); }
    if (s.type === "hit") {
      let pk = 0; for (let t = s.t - 0.05; t <= s.t + 0.25; t += 0.01) pk = Math.max(pk, rmsAt(t));
      const fl = []; for (let t = s.t - 0.6; t < s.t - 0.15; t += 0.01) fl.push(rmsAt(t));
      fl.sort((p, q) => p - q);
      rise = 20 * Math.log10(pk / (fl[Math.floor(fl.length / 2)] || 1e-6));
    }
    const off = Math.round((bt - s.peakAt) * 1000);
    if (rise < 3) M.problems.push(`${s.type} at ${fmtT(s.t)} (${s.event}) barely rises over the bed (+${rise.toFixed(1)} dB)`);
    // a hit or a shimmer swells; only a click, tick, pop or whoosh has a
    // transient sharp enough to time to the frame
    if (Math.abs(off) > 50 && !["hit", "shimmer"].includes(s.type)) M.problems.push(`${s.type} at ${fmtT(s.t)} peaks ${off} ms from its frame`);
    return { type: s.type, event: s.event, t: s.t, peakOffsetMs: off, riseDb: +rise.toFixed(1) };
  });
}

// the check's craft findings from this round's render
const cj = readJSON(path.join(dir, "check.json"), null);
M.check = [];
if (cj) for (const k of ["layout", "contrast", "craft", "motion", "runtime"]) for (const f of cj[k]?.findings || []) M.check.push(`${f.severity} ${k}/${f.code}: ${(f.message || "").slice(0, 200)}`);

/* --------------------------------------------------------------- frames */

const fr = path.join(dir, "frames");
fs.rmSync(fr, { recursive: true, force: true });
fs.mkdirSync(fr, { recursive: true });
const picks = [{ t: 0, label: "frame 0 (thumbnail)" }];
for (const s of G.shots) {
  picks.push({ t: s.a + 0.3, label: `${s.id} +0.3s (${fmtT(s.a + 0.3)})` });
  picks.push({ t: (s.a + s.b) / 2, label: `${s.id} middle (${fmtT((s.a + s.b) / 2)})` });
}
picks.push({ t: Math.max(0, D - 0.12), label: `last frame (${fmtT(D - 0.12)})` });
const items = picks.map((p, i) => {
  const f = path.join(fr, `${String(i).padStart(2, "0")}.jpg`);
  run("ffmpeg", ["-v", "error", "-y", "-i", film, "-ss", p.t.toFixed(3), "-frames:v", "1", "-q:v", "3", f]);
  return { src: f, label: `${i}. ${p.label}` };
});
const portrait = meta.height > meta.width;
const aspect = meta.width / meta.height;
sheet(items, path.join(dir, "sheet.png"), { cols: portrait ? 6 : meta.width === meta.height ? 5 : 4, cell: portrait ? 320 : meta.width === meta.height ? 380 : 460, aspect, title: `${meta.title}: round ${round}` });
// phone width: a 9:16 film fills a phone's 360px width; a landscape or square one does too
sheet(items, path.join(dir, "phone.png"), { cols: portrait ? 7 : 5, cell: 360, aspect, title: "phone width (360px): can every line be read?" });

// the dense sheet: one frame every half second of the whole film. Most
// defects live BETWEEN shot midpoints (a sliced word mid-push, a ghost left
// behind a handoff, a frame with nothing on it), so this is the sheet to read.
{
  const cols = portrait ? 8 : 6, w = portrait ? 216 : 384;
  run("ffmpeg", ["-v", "error", "-y", "-i", film, "-vf", `fps=2,scale=${w}:-2,tile=${cols}x${Math.ceil((D * 2) / cols)}:padding=4`, "-frames:v", "1", path.join(dir, "dense.jpg")]);
}
writeJSON(path.join(dir, "metrics.json"), M);
const scoresFile = path.join(dir, "scores.json");
if (!fs.existsSync(scoresFile)) writeJSON(scoresFile, Object.fromEntries(Object.entries(AXES).map(([k, q]) => [k, { question: q, score: null, notes: [], fix: [] }])));
logEvent(P.dir, { phase: "critique-measure", round, secs: +((Date.now() - t0) / 1000).toFixed(1), note: `${M.problems.length} measured problem(s)` });

console.log(`round ${round}: ${D.toFixed(2)}s, ${M.loudness.lufs} LUFS, true peak ${M.loudness.truePeak}, frame 0 ink ${(M.firstFrameInk * 100).toFixed(1)}%`);
console.log(`stillness: ${M.stillness.map((s) => `${s.shot} ${s.longestStill}s`).join(", ")}`);
console.log(`sound effects: ${M.sfx.map((s) => `${s.type}@${s.t.toFixed(2)} ${s.peakOffsetMs >= 0 ? "+" : ""}${s.peakOffsetMs}ms +${s.riseDb}dB`).join(", ") || "none"}`);
if (M.check.length) console.log("hyperframes check:\n  " + M.check.join("\n  "));
console.log(M.problems.length ? `MEASURED PROBLEMS:\n  ${M.problems.join("\n  ")}` : "measured: no problems");
console.log(`\nNow LOOK at ${dir}/dense.jpg (every 0.5s), ${dir}/sheet.png and ${dir}/phone.png, fill ${scoresFile}
(score 1-10 per axis; anything under 8 needs a "fix" line), then:
  node critique.mjs --project ${P.dir} --round ${round} --verdict`);
