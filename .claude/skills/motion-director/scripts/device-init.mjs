#!/usr/bin/env node
// A real 3D MacBook and/or iPhone with the brand's own UI on the screens.
//
//   node device-init.mjs --project <dir> --preset macbook|duo|iphone --start <spec> --duration <s>
//                        [--id dev] [--rim #hex] [--env #hex]
//
// Reads the screen content from <project>/device/:
//   laptop.html   the MacBook screen, laid out at 1440x900  (macbook, duo)
//   phone.html    the iPhone screen, laid out at 390x844    (duo, iphone)
//   screen.css    styles for both (optional)
//   screen.js     defines window.MD_SCREEN_<id> = (p, t, S) => { ... } to animate
//                 that HTML: p is 0..1 over the screen's active span (optional)
// Build the screens from REAL brand material: the product's own screenshots,
// its real copy and numbers, its real forms. Never an invented dashboard.
//
// Writes film/compositions/<id>.html and fetches the GLTF models (from
// HyperFrames' vfx-iphone-device block, via the registry) into film/models/.
// Then mount it in index.html with the printed host line. The scene is
// transparent: the film's silk and glass show around the device.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SKILL, die, hf, lastJSON, logEvent, makeTime, project, readJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const P = project(opt("--project", "."));
const id = opt("--id", "dev");
if (!/^[a-z][a-z0-9-]*$/.test(id)) die("--id: lowercase letters, digits and dashes");
const preset = opt("--preset", "macbook");
if (!["macbook", "duo", "iphone"].includes(preset)) die("--preset must be macbook, duo or iphone");
const G = readJSON(P.file("sound", "beats.json"));
const T = makeTime({ bpm: G.bpm, beatsPerBar: G.beatsPerBar, cues: G.cues });
const start = T.t(opt("--start") ?? die("--start <time spec>"));
const dur = parseFloat(opt("--duration") ?? die("--duration <seconds>"));
const film = P.file("film");
const dev = P.file("device");
const read = (f, need) => { const p = path.join(dev, f); if (fs.existsSync(p)) return fs.readFileSync(p, "utf8"); if (need) die(`missing ${p}`); return ""; };
const laptop = preset !== "iphone", phone = preset !== "macbook";
const lapHtml = laptop ? read("laptop.html", true) : "";
const phoneHtml = phone ? read("phone.html", true) : "";

// the models come from the registry at build time; the skill never ships them
const models = path.join(film, "models");
if (!fs.existsSync(path.join(models, "macbook.glb")) || !fs.existsSync(path.join(models, "iphone.glb"))) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "md-device-"));
  fs.writeFileSync(path.join(tmp, "hyperframes.json"), JSON.stringify({ registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" } }));
  fs.writeFileSync(path.join(tmp, "index.html"), "<!doctype html><html><body></body></html>");
  const r = hf(["add", "vfx-iphone-device", "--json", "--no-clipboard"], { cwd: tmp, timeout: 300000 });
  const j = lastJSON(r.out);
  if (!fs.existsSync(path.join(tmp, "models", "macbook.glb"))) die(`could not fetch the device models: ${(r.err || "").slice(-400)} ${j ? JSON.stringify(j).slice(0, 300) : ""}`);
  fs.mkdirSync(models, { recursive: true });
  for (const f of ["macbook.glb", "iphone.glb"]) fs.copyFileSync(path.join(tmp, "models", f), path.join(models, f));
  fs.rmSync(tmp, { recursive: true, force: true });
}

const brand = readJSON(P.file("brand", "brand.json"), { colors: {} });
const cfg = { preset, laptop, phone, rim: opt("--rim", brand.colors?.accent || "#6366f1"), env: opt("--env", "#1a1a2e"), fill: "#ffd9c2", shadow: 0.4 };
let html = fs.readFileSync(path.join(SKILL, "templates", "hyperframes", "md-device.html"), "utf8");
const fill = { ID: id, W: P.meta.width, H: P.meta.height, DUR: dur, CONFIG: JSON.stringify(cfg), LAPTOP_HTML: lapHtml, PHONE_HTML: phoneHtml, SCREEN_CSS: read("screen.css"), SCREEN_JS: read("screen.js") };
for (const [k, v] of Object.entries(fill)) html = html.split(`{{${k}}}`).join(String(v));
if (/\{\{[A-Z_]+\}\}/.test(html)) die(`unfilled placeholder: ${html.match(/\{\{[A-Z_]+\}\}/)[0]}`);
fs.mkdirSync(path.join(film, "compositions"), { recursive: true });
fs.writeFileSync(path.join(film, "compositions", `${id}.html`), html);
logEvent(P.dir, { phase: "device-init", secs: 0, note: `${preset} ${id} at ${start}s for ${dur}s` });
console.log(`device scene written: film/compositions/${id}.html (${preset}, ${dur}s)
mount it in index.html, ABOVE the silk and below the vignette:
  <div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${start}" data-duration="${dur}" data-width="${P.meta.width}" data-height="${P.meta.height}" data-track-kind="graphics"></div>`);
