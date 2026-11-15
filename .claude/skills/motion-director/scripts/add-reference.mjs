#!/usr/bin/env node
// Grow the library from references: turn a few links (Pinterest pins, YouTube,
// Instagram, X, Dribbble, any page yt-dlp reads) or local files into an intake
// folder with everything needed to write a new THEME (a whole-film way of
// working) or a new MOVE (one effect, transition, sting or overlay).
//
//   node add-reference.mjs --as move  --id ink-reveal  <link|file> [more ...] [--fast]
//   node add-reference.mjs --as theme --id chrome-y2k  <link|file> [more ...]
//
// Writes <home>/library-intake/<id>/:
//   ref-N/source.mp4 (or source.jpg for a still pin)
//   ref-N/ref/       ref-style.mjs output: frames, sheets, cuts, palette, motion energy
//   ref-N/strip-*.png  CONTINUOUS strips, 24 frames each at 4 fps (8 with --fast)
//   DRAFT.md         the notes to fill by looking, then the build and approval steps
//
// Nothing enters templates/ until the user has seen a proof and said yes.
// Copy the grammar, never the content: no downloaded clip, image, logo or font ships.
import fs from "node:fs";
import path from "node:path";
import { HOME, SKILL, die, duration, fmtT, readJSON, run, sheet, slugify, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const as = opt("--as", "move");
if (!["move", "theme"].includes(as)) die("--as must be move or theme");
const id = slugify(opt("--id") || die("usage: add-reference.mjs --as move|theme --id <name> <link|file> [...]"));
const valued = new Set(["--as", "--id", "--out"]);
const sources = argv.filter((a, i) => !a.startsWith("--") && !valued.has(argv[i - 1]));
if (!sources.length) die("give at least one link or file");
if (fs.existsSync(path.join(SKILL, "templates", as === "move" ? "moves" : "themes", id))) die(`a ${as} called "${id}" already exists; pick another --id`);
const fps = argv.includes("--fast") ? 8 : 4;
const OUT = path.resolve(opt("--out", path.join(HOME, "library-intake", id)));
fs.mkdirSync(OUT, { recursive: true });

// A Pinterest pin carries its video as v1.pinimg.com/videos/...mp4 (or only an image)
const pinterest = async (url, dir) => {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" } });
  const page = (await res.text()).replace(/\\u002F/g, "/").replace(/\\\//g, "/");
  const vids = [...new Set(page.match(/https:\/\/v1\.pinimg\.com\/videos\/[^"'\s]+?\.mp4/g) || [])];
  const rank = (u) => +(u.match(/(\d{3,4})[pP]/) || [0, 0])[1];
  const pick = vids.sort((a, b) => rank(b) - rank(a))[0];
  const still = (page.match(/https:\/\/i\.pinimg\.com\/originals\/[^"'\s]+?\.(?:jpg|png|webp)/) || [])[0];
  const target = pick || still;
  if (!target) return null;
  const file = path.join(dir, pick ? "source.mp4" : "source" + path.extname(still));
  const r = await fetch(target);
  if (!r.ok) return null;
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  return file;
};

const refs = [];
for (const [i, src] of sources.entries()) {
  const dir = path.join(OUT, `ref-${i + 1}`);
  fs.mkdirSync(dir, { recursive: true });
  process.stdout.write(`ref-${i + 1}: ${src}\n  `);
  let file = null;
  if (/^https?:\/\//.test(src)) {
    if (/pinterest\.|pin\.it\//.test(src)) file = await pinterest(src, dir).catch(() => null);
    if (!file) {
      if (run("yt-dlp", ["--version"]).code) { console.log("skipped: links need yt-dlp, or download the video and pass the file"); continue; }
      const out = path.join(dir, "source.mp4");
      const r = run("yt-dlp", ["-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--merge-output-format", "mp4", "--no-playlist", "-o", out, src], { timeout: 900000 });
      if (!r.code && fs.existsSync(out)) file = out;
    }
  } else if (fs.existsSync(src)) {
    file = path.join(dir, "source" + path.extname(src).toLowerCase());
    fs.copyFileSync(src, file);
  }
  if (!file) { console.log("could not fetch it; download it yourself and pass the file"); continue; }
  if (/\.(jpe?g|png|webp)$/i.test(file)) { console.log("a still: read it as a mood-board image"); refs.push({ src, dir, still: file }); continue; }

  // the measured read (cuts, shot lengths, palette, motion energy, 2 fps sheets)
  writeJSON(path.join(dir, "project.json"), { id: `intake-${id}-${i + 1}`, intake: true });
  const r = run("node", [path.join(SKILL, "scripts", "ref-style.mjs"), file, "--project", dir], { timeout: 900000 });
  if (r.code) console.log(`  measured read failed: ${(r.err || "").split("\n").slice(-3).join(" ")}`);
  // continuous strips: every frame at 4/8 fps, 24 per strip, so motion reads as motion
  const fr = path.join(dir, "strip-frames");
  fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr);
  run("ffmpeg", ["-v", "error", "-i", file, "-vf", `fps=${fps},scale=360:-2`, "-q:v", "4", path.join(fr, "%05d.jpg")]);
  const frames = fs.readdirSync(fr).filter((f) => f.endsWith(".jpg")).sort();
  const D = duration(file);
  const strips = [];
  for (let k = 0; k < frames.length; k += 24) {
    const out = path.join(dir, `strip-${String(k / 24 + 1).padStart(2, "0")}.png`);
    sheet(frames.slice(k, k + 24).map((f, j) => ({ src: path.join(fr, f), label: fmtT((k + j) / fps) })), out,
      { cols: 8, cell: 220, title: `ref-${i + 1}  ${fmtT(k / fps)}-${fmtT(Math.min(D, (k + 24) / fps))}  (${fps} fps, continuous)` });
    strips.push(out);
  }
  const data = readJSON(path.join(dir, "ref", "style-data.json"), {});
  console.log(`${D.toFixed(1)}s, ${data.shotStats?.shots ?? "?"} shots, ${strips.length} strips`);
  refs.push({ src, dir, file, duration: +D.toFixed(2), strips: strips.length, data });
}
if (!refs.length) die("no reference could be read");

// ---- the draft the agent fills by LOOKING, then builds from
const palettes = refs.filter((r) => r.data?.palette).map((r, i) => `- ref-${i + 1}: ${r.data.palette.slice(0, 6).map((p) => `\`${p.hex}\` ${Math.round(p.share * 100)}%`).join(", ")}`).join("\n");
const pace = refs.filter((r) => r.data?.shotStats).map((r, i) => `- ref-${i + 1}: ${r.duration}s, ${r.data.shotStats.shots} shots, median ${r.data.shotStats.median}s`).join("\n");
const moveSteps = `## Build (a MOVE)

1. Read references/moves.md (the contract) and one approved move of the same look.
2. Write templates/moves/${id}/move.json (kind, uses, looks, formats, duration, alpha, say)
   and index.html. Real material only: the brand's screens, logo, people, and
   CC0 photos, scans and 3D renders from find-assets.mjs / prop-render.mjs.
3. Verify: move-render.mjs in 9:16 and 16:9 (and --bg none --format mov if alpha),
   frame-audit.mjs clean, a 4 fps contact sheet looked at frame by frame, and
   a side-by-side against the reference strip at the same moments.
4. Show the user the proof next to the reference. Only on a yes:
   node scripts/gallery.mjs --only ${id}`;
const themeSteps = `## Build (a THEME)

1. Rebuild ONE reference as one film in a real brand, beat for beat
   (references/themes.md, "Rebuild one reference per film"), with real
   material only. Render it with proof-render.mjs and compare it side by side
   with the reference strips at the same moments.
2. Show the user. Only on a yes: write templates/themes/${id}/theme.json and
   RECIPE.md from this draft and the approved film (what each beat does, the
   numbers, the materials and where they came from, the banned list), and a
   preview strip from the approved film (preview.jpg, kept local if it shows
   a real brand or person).
3. Split the film's best beats into MOVES (references/moves.md) so they work
   inside talking-head videos too.`;
fs.writeFileSync(path.join(OUT, "DRAFT.md"), `# ${id} (${as}, draft)

Status: INTAKE. Nothing ships until the user has approved a proof.
References:
${refs.map((r, i) => `- ref-${i + 1}: ${r.src}${r.still ? " (still)" : ` (${r.duration}s, ${r.strips} strips)`}`).join("\n")}

## Measured
Palette by area:
${palettes || "- (stills: measure from the images)"}
Pace:
${pace || "- (stills)"}

## Read by looking (every strip, every frame; fill each with numbers)

- The ONE job it does (${as === "move" ? "what the speaker is saying when it lands" : "what kind of film it is for"}):
- Ground and materials (paper scan, glass, chrome, cork, 3D render, photo cut-out); where to get each free:
- Palette roles (ground, ink, one accent) and how the brand colour maps onto them:
- Type: family class, weight, case, size as % of frame height, tracking, how it enters and leaves:
- Strokes, outlines, shadows, grain, blur, glow (widths in px at 1080):
- Motion: what moves, path, ease (long tail, spring, stepped on twos), duration in frames, overlap:
- Camera: push, orbit, whip, rack focus; speed:
- Transitions and what causes each:
- The moment that lands (stamp, click, snap, flash) and its frame:
- What never moves:
- Banned (what would make it look templated):

${as === "move" ? moveSteps : themeSteps}
`);
console.log(`\nintake: ${OUT}
  1. LOOK at every ref-*/strip-*.png (and ref-*/ref/sheet-*.png), fill DRAFT.md with numbers
  2. build the ${as} as DRAFT.md says, show the proof next to the reference, wait for a yes`);
