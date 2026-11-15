#!/usr/bin/env node
// Deliver: the final MP4 in out/, and a log DERIVED from what actually ran.
//
//   node deliver.mjs --project <dir> --round <n>
//
// out/<slug>.mp4   the chosen round, stream-copied (no re-encode)
// out/LOG.md       total time, time waiting on the user, render time per round,
//                  API cost, critique scores per round, what was measured
import fs from "node:fs";
import path from "node:path";
import { die, fmtT, logEvent, project, readJSON, run } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const P = project(opt("--project", "."));
const round = +opt("--round", 0) || die("--round <n>: which critique round to deliver");
const src = P.file("critique", `round-${round}`, "film.mp4");
if (!fs.existsSync(src)) die(`no ${src}`);
const out = P.file("out", `${P.meta.slug}.mp4`);
fs.copyFileSync(src, out);
// the log runs to the FIRST delivery of this round; delivering again (to
// refresh LOG.md) must not stretch the clock
let all = readJSON(P.file("log.json")).events;
if (!all.find((e) => e.phase === "deliver" && e.round === round)) {
  logEvent(P.dir, { phase: "deliver", round, secs: 0, note: out });
  all = readJSON(P.file("log.json")).events;
}
const cut = all.findIndex((e) => e.phase === "deliver" && e.round === round);
const log = all.slice(0, cut + 1);
const at = (e) => new Date(e.at).getTime();
const first = at(log[0]), last = at(log[log.length - 1]);
// waiting on the user (beat grid shown -> approved) is not working time
let wait = 0;
const ok = log.find((e) => e.phase === "approved");
const shown = ok && log.filter((e) => e.phase === "beatgrid" && at(e) <= at(ok)).pop();
if (shown && ok) wait = (at(ok) - at(shown)) / 1000;
const build = ok ? (last - at(ok)) / 1000 : null;
const wall = (last - first) / 1000;
const sum = (ph) => log.filter((e) => e.phase === ph).reduce((a, e) => a + (e.secs || 0), 0);
const renders = log.filter((e) => e.phase === "render");
const cost = log.reduce((a, e) => a + (e.cost || 0), 0);
const hist = readJSON(P.file("critique", "history.json"), { rounds: [] });
const M = readJSON(P.file("critique", `round-${round}`, "metrics.json"), {});
const S = readJSON(P.file("sound", "sound.json"), {});
const G = readJSON(P.file("sound", "beats.json"), {});
const size = fs.statSync(out).size / 1e6;
const probe = run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate", "-of", "csv=p=0", out]).out.trim().replace(/\n/g, "; ");

const md = `# ${P.meta.title}: delivery log

**Film:** \`out/${path.basename(out)}\` (${size.toFixed(1)} MB, ${M.duration ?? "?"}s, ${P.meta.format} ${P.meta.width}x${P.meta.height}, ${probe})
**Project:** \`${P.dir}\`
**Delivered round:** ${round} of ${hist.rounds.length}

## Time

| | |
|---|---|
| total wall clock | ${fmtT(wall)} |
| waiting on approval of the beat grid | ${fmtT(wait)} |
| **working time** | **${fmtT(wall - wait)}** |
| approval to delivery (build, sound, renders, critique) | ${build === null ? "n/a" : fmtT(build)} |
| brand intake | ${sum("brand-intake").toFixed(1)}s |
| sound (synthesis) | ${sum("synth").toFixed(1)}s |
| checks | ${sum("check").toFixed(1)}s |
| **render time** | **${sum("render").toFixed(1)}s** over ${renders.length} render(s): ${renders.map((r) => `round ${r.round} ${r.secs}s`).join(", ")} |
| critique measurement | ${sum("critique-measure").toFixed(1)}s |

## API cost

**$${cost.toFixed(2)}.** ${cost ? "" : "Everything ran on this machine: capture, render, synthesis and critique made no paid calls (cloud vision and HeyGen keys are stripped from HyperFrames' environment unless MD_ALLOW_CLOUD=1)."}

## Critique

| round | hook | brand | motion | readability | pacing | polish | mean |
|---|---|---|---|---|---|---|---|
${hist.rounds.map((r) => `| ${r.round} | ${["hook", "brand", "motion", "readability", "pacing", "polish"].map((k) => r.scores[k]).join(" | ")} | ${r.mean} |`).join("\n")}

${hist.rounds.filter((r) => Object.keys(r.fixes || {}).length).map((r) => `**Fixed after round ${r.round}:** ${Object.entries(r.fixes).map(([k, v]) => `${k}: ${v.join("; ")}`).join(" · ")}`).join("\n\n")}

## Measured on the delivered file

- Loudness ${M.loudness?.lufs} LUFS, true peak ${M.loudness?.truePeak} dBFS
- Timestamps: ${M.timestamps?.frames} frames, ${M.timestamps?.irregular} irregular
- Frame 0 ink: ${((M.firstFrameInk || 0) * 100).toFixed(1)}%
- Longest still per shot: ${(M.stillness || []).map((s) => `${s.shot} ${s.longestStill}s`).join(", ")}
- Sound effects (offset from frame, rise over bed): ${(M.sfx || []).map((s) => `${s.type} ${s.peakOffsetMs}ms +${s.riseDb}dB`).join(", ")}
- Open problems: ${(M.problems || []).length ? M.problems.join("; ") : "none"}

## Sound

Original, synthesised in code: ${G.vibe} at ${G.bpm} BPM${G.key ? ` in ${G.key}` : ""}, ${G.bars} bars, ${(S.sfx || []).length} UI sounds. No samples and no licensed or copyrighted music. Measured, not listened to.
`;
fs.writeFileSync(P.file("out", "LOG.md"), md);
console.log(md);
