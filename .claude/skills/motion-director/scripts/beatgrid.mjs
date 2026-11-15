#!/usr/bin/env node
// The beat grid: one plan, read by the picture AND the sound.
//
//   node beatgrid.mjs --project <dir>
//
// Reads <project>/beatgrid.json, checks it, and writes:
//   beatgrid.md               the table shown to the user for approval
//   sound/beats.json          every beat, bar, section, cue and sound effect in seconds
//   film/assets/beats.js      the same numbers for md.js (only if film/ exists)
//
// Every time in beatgrid.json is a spec ("B12", "bar3", "B12+0.1", "drop",
// "4.5"). Shots are written in BEATS, so a cut always lands on the grid and
// the music and the picture cannot drift apart.
import fs from "node:fs";
import path from "node:path";
import { die, fmtT, logEvent, makeTime, project, readJSON, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const P = project(argv.includes("--project") ? argv[argv.indexOf("--project") + 1] : ".");
// --approved: the user said yes to beatgrid.md. Recorded so the delivery log
// can tell working time from time spent waiting on them.
if (argv.includes("--approved")) {
  logEvent(P.dir, { phase: "approved", secs: 0, note: argv.includes("--note") ? argv[argv.indexOf("--note") + 1] : "beat grid approved" });
  console.log("beat grid approved: build the film (film-init.mjs, then the scenes).");
  process.exit(0);
}
const g = readJSON(P.file("beatgrid.json"));

const problems = [];
const need = (c, msg) => { if (!c) problems.push(msg); };
need(g.bpm >= 60 && g.bpm <= 180, `bpm ${g.bpm} out of range 60-180`);
need(Number.isInteger(g.bars) && g.bars > 0, "bars must be a whole number of bars");
need(Array.isArray(g.shots) && g.shots.length, "shots: at least one shot");
need(Array.isArray(g.sections) && g.sections.length, "sections: at least one music section");
if (problems.length) die(problems.join("\n   "));

const bpb = g.beatsPerBar || 4;
// cues may refer to each other ("logo": "drop+B8" is not allowed; keep them simple)
const T0 = makeTime({ bpm: g.bpm, beatsPerBar: bpb, cues: {} });
const cues = {};
for (const [k, v] of Object.entries(g.cues || {})) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) || /^(B|bar)\d/.test(k)) die(`cue name "${k}": letters, digits and _ only, and not B<n>/bar<n>`);
  try { cues[k] = T0.t(v); } catch (e) { die(`cue ${k}: ${e.message}`); }
}
const T = makeTime({ bpm: g.bpm, beatsPerBar: bpb, cues });
const t = (spec, where) => { try { return T.t(spec); } catch (e) { die(`${where}: ${e.message}`); } };

const music = T.bar(g.bars);
const tail = g.tail ?? 0.8; // the last chord rings, the end card holds
const length = +(music + tail).toFixed(3);
if (g.length && Math.abs(g.length - length) > 1.5) problems.push(`brief asks for ${g.length}s but ${g.bars} bars at ${g.bpm} BPM + ${tail}s tail is ${length.toFixed(1)}s`);
if (length < 9.5 || length > 31) problems.push(`film is ${length.toFixed(1)}s: keep it 10-30s`);

// shots: contiguous, on the grid, covering the film
const shots = g.shots.map((s, i) => {
  const a = t(s.from, `shot ${s.id}.from`), b = t(s.to, `shot ${s.id}.to`);
  if (!s.id) problems.push(`shot ${i + 1} has no id`);
  if (b <= a) problems.push(`shot ${s.id}: ends before it starts`);
  for (const k of ["screen", "motion", "sound"]) if (!s[k]) problems.push(`shot ${s.id}: no "${k}" column`);
  return { ...s, a, b };
});
for (let i = 1; i < shots.length; i++)
  if (Math.abs(shots[i].a - shots[i - 1].b) > 0.001) problems.push(`gap or overlap between ${shots[i - 1].id} (ends ${shots[i - 1].b.toFixed(2)}s) and ${shots[i].id} (starts ${shots[i].a.toFixed(2)}s)`);
if (Math.abs(shots[0].a) > 0.001) problems.push(`first shot starts at ${shots[0].a}s, not 0: frame 0 is the thumbnail`);
const last = shots[shots.length - 1];
if (Math.abs(last.b - length) > 0.001 && Math.abs(last.b - music) > 0.001) problems.push(`last shot ends at ${last.b.toFixed(2)}s; the film is ${length}s (music ${music.toFixed(2)}s + ${tail}s tail). End it on "${length}"`);
last.b = length;

// sections of the score
const sections = g.sections.map((s) => ({ ...s, a: t(s.from, `section ${s.name}`), b: t(s.to, `section ${s.name}`) }));
for (let i = 1; i < sections.length; i++)
  if (Math.abs(sections[i].a - sections[i - 1].b) > 0.001) problems.push(`music sections ${sections[i - 1].name} and ${sections[i].name} do not meet`);

// sound effects: one per VISIBLE event. A cue on a beat where nothing changes
// on screen is the "two sounds and nothing happens" note.
const ROLES = ["click", "tick", "pop", "whoosh", "hit", "riser", "shimmer", "type"];
const sfx = (g.sfx || []).map((x) => {
  if (!ROLES.includes(x.type)) problems.push(`sfx ${x.type}@${x.at}: role must be one of ${ROLES.join(", ")}`);
  if (!x.event) problems.push(`sfx ${x.type}@${x.at}: name the visible "event" it belongs to`);
  return { ...x, t: t(x.at, `sfx ${x.type}`) };
}).sort((a, b) => a.t - b.t);
const hits = sfx.filter((x) => x.type === "hit");
if (hits.length > 1) problems.push(`${hits.length} "hit" cues: the big hit happens once, on the payoff or the mark`);
for (const x of sfx) if (x.t > length) problems.push(`sfx ${x.type}@${x.at} at ${x.t.toFixed(2)}s is after the film ends`);

if (problems.length) die("beat grid problems:\n   " + problems.join("\n   "));

const beats = [];
for (let n = 0; n <= g.bars * bpb; n++) beats.push(+T.B(n).toFixed(4));
const out = {
  bpm: g.bpm, beatsPerBar: bpb, bars: g.bars, spb: T.spb, music, tail, length,
  vibe: g.vibe || "driving", key: g.key || null, seed: g.seed ?? 7,
  cues, beats, sections: sections.map(({ name, a, b, energy, riser, drop }) => ({ name, a, b, energy: energy ?? 0.6, riser: !!riser, drop: !!drop })),
  sfx: sfx.map(({ type, t: tt, at, event }) => ({ type, t: tt, at, event })),
  shots: shots.map(({ id, a, b, from, to }) => ({ id, a: +a.toFixed(4), b: +b.toFixed(4), from, to })),
};
writeJSON(P.file("sound", "beats.json"), out);
if (fs.existsSync(P.file("film", "assets"))) {
  fs.writeFileSync(P.file("film", "assets", "beats.js"),
    `// written by beatgrid.mjs from beatgrid.json. Do not edit: edit the grid and re-run.\nwindow.MD_BEATS = ${JSON.stringify({ bpm: g.bpm, offset: 0, beatsPerBar: bpb, length, cues })};\n`);
  // keep the composition's length in step with the grid
  const idx = P.file("film", "index.html");
  if (fs.existsSync(idx)) {
    const s = fs.readFileSync(idx, "utf8");
    const s2 = s.replace(/(data-composition-id="main"[^>]*?data-duration=")[\d.]+(")/, `$1${length}$2`)
      .replace(/(<audio id="score"[^>]*?data-duration=")[\d.]+(")/, `$1${length}$2`);
    if (s2 !== s) fs.writeFileSync(idx, s2);
  }
}

// the table the user approves
const beatLabel = (x) => `B${+(x / T.spb).toFixed(2)}`;
const sfxIn = (s) => sfx.filter((x) => x.t >= s.a - 1e-6 && x.t < s.b - 1e-6).map((x) => `${x.type} ${fmtT(x.t)}`).join(", ");
let md = `# Beat grid: ${g.title || P.meta.title}

**${length.toFixed(2)}s** · ${P.meta.format} ${P.meta.width}x${P.meta.height} · ${g.bpm} BPM, ${g.bars} bars of ${bpb} (one bar = ${(T.spb * bpb).toFixed(2)}s) · vibe: ${g.vibe || "driving"}${g.key ? ` · key ${g.key}` : ""}
${g.signature ? `\n**Signature moment:** ${g.signature}\n` : ""}
| # | time | beats | on screen | motion | sound |
|---|---|---|---|---|---|
`;
shots.forEach((s, i) => {
  md += `| ${i + 1} ${s.id} | ${fmtT(s.a)} to ${fmtT(s.b)} (${(s.b - s.a).toFixed(2)}s) | ${beatLabel(s.a)} to ${s === last ? "end" : beatLabel(s.b)} | ${s.screen} | ${s.motion} | ${s.sound}${sfxIn(s) ? ` (${sfxIn(s)})` : ""} |\n`;
});
md += `\n**Score:** ${sections.map((s) => `${s.name} ${fmtT(s.a)}-${fmtT(s.b)}${s.riser ? " (riser)" : ""}${s.drop ? " (drop)" : ""}`).join(" · ")}\n`;
if (Object.keys(cues).length) md += `\n**Cues:** ${Object.entries(cues).map(([k, v]) => `${k} ${fmtT(v)}`).join(" · ")}\n`;
fs.writeFileSync(P.file("beatgrid.md"), md);
logEvent(P.dir, { phase: "beatgrid", secs: 0, note: `${shots.length} shots, ${length.toFixed(2)}s` });
console.log(md);
