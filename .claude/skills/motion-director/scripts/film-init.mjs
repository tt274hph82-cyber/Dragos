#!/usr/bin/env node
// Scaffold the HyperFrames film inside a project, in the brand.
//
//   node film-init.mjs --project <dir> [--theme <id from templates/themes>] [--force]
//
// Writes film/index.html (from the template), film/assets/{md.js, md.css,
// brand.css, beats.js, logo, shots/, fonts/} and a hyperframes.json. Re-run
// with --force only to refresh the assets; it never overwrites index.html once
// the film has been written.
import fs from "node:fs";
import path from "node:path";
import { SKILL, die, logEvent, project, readJSON, writeBrandAssets, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const P = project(argv.includes("--project") ? argv[argv.indexOf("--project") + 1] : ".");
const meta = P.meta;
if (meta.renderer !== "hyperframes") die(`this project renders with ${meta.renderer}; see references/remotion-fallback.md`);
const brandFile = P.file("brand", "brand.json");
if (!fs.existsSync(brandFile)) die("no brand/brand.json: run brand-intake.mjs first");
const b = readJSON(brandFile);
if (!b.logo) die("brand has no logo chosen: run brand-intake.mjs pick --logo ... first");
if (!b.shots || b.shots.length < 3) die("brand has fewer than 3 real product screenshots: run brand-intake.mjs pick --shots ... first");

const film = P.file("film");
const A = path.join(film, "assets");
fs.mkdirSync(path.join(A, "fonts"), { recursive: true });
fs.mkdirSync(path.join(A, "shots"), { recursive: true });

const T = path.join(SKILL, "templates", "hyperframes");
fs.copyFileSync(path.join(T, "md.js"), path.join(A, "md.js"));
fs.copyFileSync(path.join(T, "md.css"), path.join(A, "md.css"));
fs.copyFileSync(path.join(T, "md-world.css"), path.join(A, "md-world.css"));
fs.copyFileSync(path.join(T, "md-silk.js"), path.join(A, "md-silk.js"));

// brand assets: logo, mark, shots, product video, fonts and brand.css
const fam = writeBrandAssets(P, b, A);

// the theme: picked from the board (theme-board.mjs), remembered in project.json
const themes = fs.readdirSync(path.join(SKILL, "templates", "themes")).filter((d) => fs.existsSync(path.join(SKILL, "templates", "themes", d, "theme.json")));
const theme = argv.includes("--theme") ? argv[argv.indexOf("--theme") + 1] : meta.theme || "glass";
if (!themes.includes(theme)) die(`unknown theme "${theme}": have ${themes.join(", ")}. Show the board first: theme-board.mjs`);
const TD = path.join(SKILL, "templates", "themes", theme);
for (const f of ["theme.css", "theme.js"]) { const src = path.join(TD, f); if (fs.existsSync(src)) fs.copyFileSync(src, path.join(A, f)); else fs.writeFileSync(path.join(A, f), f.endsWith("css") ? "/* this theme is built from its RECIPE.md */\n" : "/* this theme is built from its RECIPE.md */\n"); }
if (fs.existsSync(path.join(TD, "RECIPE.md"))) console.log(`theme ${theme}: build every shot from templates/themes/${theme}/RECIPE.md`);
if (meta.theme !== theme) { meta.theme = theme; writeJSON(P.file("project.json"), meta); }

const idx = path.join(film, "index.html");
const grid = fs.existsSync(P.file("sound", "beats.json")) ? readJSON(P.file("sound", "beats.json")) : null;
if (!fs.existsSync(idx) || (argv.includes("--force") && !/md-scene"/.test(fs.readFileSync(idx, "utf8").replace(/<!--[\s\S]*?-->/g, "")))) {
  const html = fs.readFileSync(path.join(T, "index.html"), "utf8")
    .replaceAll("{{W}}", meta.width).replaceAll("{{H}}", meta.height)
    .replaceAll("{{DURATION}}", grid ? grid.length : 20).replaceAll("{{TITLE}}", meta.title);
  fs.writeFileSync(idx, html);
}
if (grid) fs.writeFileSync(path.join(A, "beats.js"),
  `// written by beatgrid.mjs from beatgrid.json. Do not edit: edit the grid and re-run.\nwindow.MD_BEATS = ${JSON.stringify({ bpm: grid.bpm, offset: 0, beatsPerBar: grid.beatsPerBar, length: grid.length, cues: grid.cues })};\n`);
if (fs.existsSync(P.file("sound", "score.wav")) && !fs.existsSync(path.join(A, "score.wav"))) fs.copyFileSync(P.file("sound", "score.wav"), path.join(A, "score.wav"));
writeJSON(path.join(film, "hyperframes.json"), { $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { assets: "assets" }, media: { autoProxy: true } });
fs.writeFileSync(path.join(film, "meta.json"), JSON.stringify({ id: meta.slug, name: meta.title }, null, 2));
logEvent(P.dir, { phase: "film-init", secs: 0, note: `${b.shots.length} shots, fonts ${Object.values(fam).join(" / ")}` });
console.log(`film scaffolded: ${film}
  assets: logo, ${b.shots.length} screenshots, fonts ${JSON.stringify(fam)}
  next: write the scenes in film/index.html from beatgrid.md, then render.mjs`);
