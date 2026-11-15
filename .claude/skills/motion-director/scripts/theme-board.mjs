#!/usr/bin/env node
// Show the user the themes in THEIR brand, so they pick a look by seeing it.
//
//   node theme-board.mjs --project <dir> [--themes paper,studio] [--still]
//
// For every theme in templates/themes/ (or the ones named), builds the theme's
// 5 second sample with the brand's own headline, screenshots, logo, colours and
// fonts, renders it (draft quality, ~10-20s each), and writes:
//   themes/<id>/sample.mp4     the sample, to play
//   themes/board.png           three frames of every theme side by side, labelled
//   themes/board.md            what each theme is and when it fits
// Show the board (and the MP4s) and ask which one. Then:
//   node film-init.mjs --project <dir> --theme <id>
// --still skips the render and screenshots one frame per theme (fast check).
import fs from "node:fs";
import path from "node:path";
import { SKILL, chromePath, die, hf, logEvent, project, readJSON, run, sheet, writeBrandAssets } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const P = project(opt("--project", "."));
const b = readJSON(P.file("brand", "brand.json")) || die("no brand/brand.json: run brand-intake.mjs first");
if (!b.logo || !b.shots?.length) die("the brand needs a logo and screenshots first (brand-intake.mjs pick)");
const TH = path.join(SKILL, "templates", "themes");
const all = fs.readdirSync(TH).filter((d) => fs.existsSync(path.join(TH, d, "theme.json")));
const want = opt("--themes", all.join(",")).split(",").filter(Boolean);
for (const w of want) if (!all.includes(w)) die(`unknown theme "${w}": have ${all.join(", ")}`);

// ---- the brand's own words, fitted to a two-line headline
const clean = (s) => String(s || "").replace(/[\u2013\u2014]/g, ",").replace(/\s+/g, " ").trim();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const heads = (b.headings || []).map(clean).filter((h) => h.length > 3);
const pick = heads.find((h) => h.split(" ").length >= 3 && h.length <= 48) || heads[0] || clean(b.name);
const words = pick.replace(/[.!]$/, "").split(" ");
let cut = 1, best = 1e9;
for (let i = 1; i < words.length; i++) { const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length); if (d < best) { best = d; cut = i; } }
const L1 = words.slice(0, cut).join(" "), L2w = words.slice(cut);
const LAST = L2w.pop() + (/[.!]$/.test(pick) ? pick.slice(-1) : ".");
const L2 = L2w.join(" ");
const longest = Math.max(L1.length, (L2 + " " + LAST).length);
const HEAD_SIZE = Math.max(84, Math.min(168, Math.round(1500 / (longest * 0.56))));
// wide display caps (Archivo Black and similar) run ~0.8em a character
// a headline that must stay inside ~1000px (collage layouts with pieces beside it)
const HEAD_SIZE_NARROW = Math.max(64, Math.min(150, Math.round(1000 / (longest * 0.56))));
// the same caps set big over 3 lines, for themes that fill the frame with type
const HEAD_SIZE_BIG = Math.max(96, Math.min(220, Math.round(1560 / ((Math.ceil(pick.length / 3) + 1) * 0.77))));
const HEAD_SIZE_WIDE = Math.max(70, Math.min(200, Math.round(1700 / (longest * 0.8))));
const line2 = heads.find((h) => h !== pick && h.split(" ").length >= 3) || clean(b.tagline).split(/[.:]/)[0];
const LINE2_SHORT = line2.split(" ").slice(0, 6).join(" ");
const domain = (b.domain || b.url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").replace(/-com$/, ".com");
const shots = b.shots.map((s) => path.basename(s.file));
const fill = {
  NAME: esc(clean(b.name).split(":")[0]), DOMAIN: esc(domain), HEAD_L1: esc(L1), HEAD_L2: esc(L2), LAST: esc(LAST),
  HEAD_SIZE, HEAD_SIZE_WIDE, HEAD_SIZE_BIG, HEAD_SIZE_NARROW, UNDER_Y: 330 + Math.round(HEAD_SIZE_NARROW * 0.95 * 2) + 18, LINE2_SHORT: esc(LINE2_SHORT), LINE2: esc(line2),
  SHOT1: shots[0], SHOT2: shots[1] || shots[0], SHOT3: shots[2] || shots[0], LOGO: path.basename(b.logo),
  MARK: path.basename(b.mark || b.logo), ACCENT: b.colors.accent, GROUND: b.colors.ground, INK: b.colors.ink,
};

const out = P.file("themes");
fs.mkdirSync(out, { recursive: true });
const T0 = Date.now();
const items = [], notes = [];
for (const id of want) {
  const dir = path.join(TH, id), meta = readJSON(path.join(dir, "theme.json"));
  // a theme taken from an approved film shows that film (preview.jpg, a strip of
  // its key frames) and is built from its RECIPE.md; only themes with a
  // sample.html are rendered live in this brand
  if (!fs.existsSync(path.join(dir, "sample.html"))) {
    for (const pv of ["preview.jpg", "preview-9x16.jpg"]) if (fs.existsSync(path.join(dir, pv))) items.push({ src: path.join(dir, pv), label: pv.includes("9x16") ? `${meta.name}, vertical` : `${meta.name} (${meta.format || ""}): ${meta.oneLiner}` });
    if (!fs.existsSync(path.join(dir, "preview.jpg"))) items.push({ src: path.join(SKILL, "templates", "themes", "_none.png"), label: `${meta.name}: ${meta.oneLiner} (no preview on this machine)` });
    notes.push(`## ${meta.name} (\`${id}\`)\n\n${meta.oneLiner}\n\n- Best for: ${meta.bestFor}\n- Motion: ${meta.motion}\n- Format: ${meta.format || "any"}, ${meta.length || ""}\n- Built from: templates/themes/${id}/RECIPE.md\n`);
    console.log(`  ${id.padEnd(14)} preview`);
    continue;
  }
  const film = path.join(out, id), A = path.join(film, "assets");
  fs.mkdirSync(A, { recursive: true });
  writeBrandAssets(P, b, A);
  for (const f of ["md.js", "md.css", "md-world.css", "md-silk.js"]) fs.copyFileSync(path.join(SKILL, "templates", "hyperframes", f), path.join(A, f));
  fs.copyFileSync(path.join(dir, "theme.css"), path.join(A, "theme.css"));
  fs.copyFileSync(path.join(dir, "theme.js"), path.join(A, "theme.js"));
  let html = fs.readFileSync(path.join(dir, "sample.html"), "utf8");
  for (const [k, v] of Object.entries(fill)) html = html.split(`{{${k}}}`).join(String(v));
  if (/\{\{[A-Z0-9_]+\}\}/.test(html)) die(`${id}/sample.html: unfilled ${html.match(/\{\{[A-Z0-9_]+\}\}/)[0]}`);
  fs.writeFileSync(path.join(film, "index.html"), html);
  fs.writeFileSync(path.join(film, "hyperframes.json"), JSON.stringify({ paths: { assets: "assets" } }));
  fs.writeFileSync(path.join(film, "meta.json"), JSON.stringify({ id: `theme-${id}`, name: meta.name }));
  const mp4 = path.join(film, "sample.mp4");
  const t = Date.now();
  if (!argv.includes("--still")) {
    const r = hf(["render", "-o", mp4, "--quiet", "--quality", "draft", "--workers", process.env.MD_WORKERS || "4"], { cwd: film, timeout: 900000 });
    if (r.code || !fs.existsSync(mp4)) die(`${id}: render failed:\n${(r.err || r.out).split("\n").slice(-12).join("\n")}`);
    for (const [k, at] of [[1, meta.stills?.[0] ?? 1.6], [2, meta.stills?.[1] ?? 3.4], [3, meta.stills?.[2] ?? 5.0]]) {
      const png = path.join(film, `still-${k}.png`);
      run("ffmpeg", ["-v", "error", "-y", "-ss", String(at), "-i", mp4, "-frames:v", "1", png]);
    }
    const strip = path.join(film, "strip.jpg");
    run("ffmpeg", ["-v", "error", "-y", "-i", path.join(film, "still-1.png"), "-i", path.join(film, "still-2.png"), "-i", path.join(film, "still-3.png"), "-filter_complex", "[0][1][2]hstack=3,scale=1800:-2", strip]);
    items.push({ src: strip, label: `${meta.name} (live in this brand): ${meta.oneLiner}` });
  } else {
    const png = path.join(film, "still-1.png");
    run(chromePath(), ["--headless", "--hide-scrollbars", "--allow-file-access-from-files", "--window-size=1920,1080", "--virtual-time-budget=4000", `--screenshot=${png}`, `file://${path.join(film, "index.html")}`]);
    items.push({ src: png, label: meta.name });
  }
  notes.push(`## ${meta.name} (\`${id}\`)\n\n${meta.oneLiner}\n\n- Best for: ${meta.bestFor}\n- Motion: ${meta.motion}\n- Sample: themes/${id}/sample.mp4 (${((Date.now() - t) / 1000).toFixed(0)}s to render)\n`);
  console.log(`  ${id.padEnd(9)} ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
const board = sheet(items, path.join(out, "board.png"), { cols: 1, cell: 1500, aspect: 4.2, title: `Themes in the brand of ${clean(b.name).split(":")[0]}` });
fs.writeFileSync(path.join(out, "board.md"), `# Pick a theme\n\nEach theme is one approved film. Themes marked live were rendered in this brand; the others show the film they come from and are rebuilt for this brand from their RECIPE.md.\n\n${notes.join("\n")}\nThen: \`node scripts/film-init.mjs --project ${P.dir} --theme <id>\`\n`);
logEvent(P.dir, { phase: "theme-board", secs: +((Date.now() - T0) / 1000).toFixed(1), note: want.join(",") });
console.log(`board: ${board}\nnotes: ${path.join(out, "board.md")}\nShow the board and the samples, ask which theme, then film-init --theme <id>.`);
