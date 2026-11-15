#!/usr/bin/env node
// Render one MOVE (a single effect, transition, sting or overlay) in a brand.
//
//   node move-render.mjs --move <id> [--brand <project dir | brand dir>] [--aspect 9:16|16:9|1:1]
//        [--format mp4|mov|webm|gif|png-sequence] [--bg look|none] [--vars '{"title":"..."}']
//        [--out file] [--quality draft|delivery]
//
// --brand defaults to the bundled example brand (templates/demo-brand).
// --bg none renders with a transparent background (use --format mov for ProRes 4444
// or webm for VP9 alpha) so the move sits on top of a talking head as an overlay;
// --bg look renders the move's own ground, for a full-frame B-roll cutaway.
// --vars overrides the move's declared variables (see templates/moves/<id>/move.json).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SKILL, die, hf, readJSON, run, withPage } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const id = opt("--move") || die("usage: move-render.mjs --move <id> [--brand dir] [--aspect 9:16] [--format mp4] [--bg look|none] [--vars json] [--out file]");
const MD = path.join(SKILL, "templates", "moves", id);
if (!fs.existsSync(path.join(MD, "move.json"))) die(`no move "${id}" in templates/moves`);
const meta = readJSON(path.join(MD, "move.json"));
const aspect = opt("--aspect", meta.formats?.[0] || "9:16");
const DIMS = { "9:16": [1080, 1920], "16:9": [1920, 1080], "1:1": [1080, 1080], "4:5": [1080, 1350] };
const [W, H] = DIMS[aspect] || die(`--aspect must be one of ${Object.keys(DIMS).join(", ")}`);
if (meta.formats && !meta.formats.includes(aspect)) die(`${id} supports ${meta.formats.join(", ")}`);
const format = opt("--format", "mp4"), bg = opt("--bg", "look");
if (bg === "none" && !meta.alpha) die(`${id} has no transparent version (move.json alpha: false); use --bg look`);
if (bg === "none" && !["mov", "webm", "png-sequence", "gif"].includes(format)) die("--bg none needs --format mov, webm or png-sequence to keep the transparency");

// ---- the brand, normalised to one token set every move reads
export const brandTokens = (dir) => {
  const demo = path.join(SKILL, "templates", "demo-brand");
  const d = dir ? path.resolve(dir) : demo;
  let j = readJSON(path.join(d, "brand.json"), null) || readJSON(path.join(d, "brand", "brand.json"), null);
  const root = fs.existsSync(path.join(d, "brand.json")) ? d : path.join(d, "brand");
  if (!j) die(`no brand.json in ${d} (run brand-intake.mjs, or omit --brand for the example brand)`);
  const c = j.colors || {};
  const shots = (j.screens || (j.shots || []).map((s) => s.file) || []).filter(Boolean);
  return {
    root,
    tokens: {
      brandName: String(j.name || "").split(":")[0].trim(), domain: (j.domain || j.url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").replace(/-com$/, ".com"),
      tagline: j.tagline || "", handle: j.handle || "", headline: j.headline || (j.headings || [])[0] || "",
      ground: c.ground || "#0E0D12", ink: c.ink || "#F4F2EE", accent: c.accent || "#FF6A3D", accent2: c.accent2 || c.palette?.[5] || c.accent || "#7C5CFF",
      surface: c.surface || "#1A1820", muted: c.muted || "#8D8A96", paper: c.paper || "#F3EFE6",
      fontDisplay: (j.fonts?.display?.family ? "Brand display" : j.fonts?.display) || "Archivo Black", fontBody: (j.fonts?.body?.family ? "Brand body" : j.fonts?.body) || "Inter",
      stats: j.stats || [],
    },
    files: { logo: j.logo, mark: j.mark || j.logo, screens: shots, people: j.people || [], fonts: j.fonts },
  };
};

const B = brandTokens(opt("--brand"));
const work = fs.mkdtempSync(path.join(os.tmpdir(), `md-move-${id}-`));
const A = path.join(work, "assets"), BA = path.join(A, "brand");
fs.mkdirSync(BA, { recursive: true });
// the move's own static assets
if (fs.existsSync(path.join(MD, "assets"))) fs.cpSync(path.join(MD, "assets"), A, { recursive: true });
// brand files, under stable names the move can rely on
const put = (rel, name) => { if (!rel) return null; const src = path.join(B.root, rel); if (!fs.existsSync(src)) return null; const dst = name + path.extname(src); fs.copyFileSync(src, path.join(BA, dst)); return `assets/brand/${dst}`; };
const files = {
  logo: put(B.files.logo, "logo"), mark: put(B.files.mark, "mark"),
  screens: B.files.screens.map((s, i) => put(s, `screen-${i + 1}`)).filter(Boolean),
  people: B.files.people.map((s, i) => put(s, `person-${i + 1}`)).filter(Boolean),
};
// brand font files (captured brands)
let fontCss = "";
for (const role of ["display", "body"]) {
  const f = B.files.fonts?.[role]; if (!f?.files?.length) continue;
  for (const ff of f.files) { const src = path.join(B.root, ff.file); if (!fs.existsSync(src)) continue; fs.copyFileSync(src, path.join(BA, path.basename(src)));
    fontCss += `@font-face{font-family:"Brand ${role}";src:url("assets/brand/${path.basename(src)}");font-weight:${ff.weight || "100 900"};font-display:block}\n`; }
}
fs.writeFileSync(path.join(A, "brand-fonts.css"), fontCss || "/* bundled faces */\n");
for (const f of ["md.js"]) fs.copyFileSync(path.join(SKILL, "templates", "hyperframes", f), path.join(A, f));
fs.copyFileSync(path.join(SKILL, "templates", "moves", "_lib", "move.js"), path.join(A, "move.js"));

const vars = { ...B.tokens, ...files, bg, aspect, ...JSON.parse(opt("--vars", "{}")) };
const dur = +(vars.duration || meta.duration);
let html = fs.readFileSync(path.join(MD, "index.html"), "utf8").split("{{W}}").join(W).split("{{H}}").join(H).split("{{DUR}}").join(dur);
fs.writeFileSync(path.join(work, "index.html"), html);
fs.writeFileSync(path.join(work, "hyperframes.json"), JSON.stringify({ paths: { assets: "assets" } }));
fs.writeFileSync(path.join(work, "meta.json"), JSON.stringify({ id: `move-${id}`, name: meta.name }));
fs.writeFileSync(path.join(work, "vars.json"), JSON.stringify(vars));

// 9:16 full-frame B-roll: measure where the content sits (in a throwaway page, since measuring seeks the
// timeline) and pass the offset that centres it as centreDy. Overlays keep their placement.
if (H > W && bg !== "none" && !vars.key && String(vars.centre) !== "off" && vars.centreDy === undefined) {
  try {
    const box = await withPage("file://" + path.join(work, "index.html"), { width: W, height: H }, async ({ evaluate }) => evaluate(`(async () => {
      for (let i = 0; i < 100 && !(window.__timelines && window.__timelines.main); i++) await new Promise((r) => setTimeout(r, 50));
      await document.fonts.ready;
      await Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
      return window.MV && window.MV.__measure ? window.MV.__measure() : null; })()`));
    if (box) {
      const k = W / 1080, edge = 120 * k;
      let dy = H / 2 - (box.y0 + box.y1) / 2;
      dy = Math.max(edge - box.y0, Math.min(H - edge - box.y1, dy));
      if (Math.abs(dy) >= H * 0.02) { vars.centreDy = Math.round(dy); fs.writeFileSync(path.join(work, "vars.json"), JSON.stringify(vars)); }
    }
  } catch (e) { /* render as authored */ }
}

const ext = { mp4: ".mp4", mov: ".mov", webm: ".webm", gif: ".gif", "png-sequence": "" }[format];
const out = path.resolve(opt("--out", `${id}-${aspect.replace(":", "x")}${bg === "none" ? "-alpha" : ""}${ext}`));
const t = Date.now();
const r = hf(["render", "-o", out, "--quiet", "--format", format, "--quality", opt("--quality", "delivery"), "--variables-file", path.join(work, "vars.json"), "--workers", process.env.MD_WORKERS || "4"], { cwd: work, timeout: 1800000 });
if (r.code || !fs.existsSync(out)) die(`render failed (work dir kept: ${work}):\n${(r.err || r.out).split("\n").slice(-14).join("\n")}`);
if (!argv.includes("--keep")) fs.rmSync(work, { recursive: true, force: true }); else console.log(`work dir: ${work}`);
console.log(`${out}  ${aspect} ${format}${bg === "none" ? " (transparent)" : ""} in ${((Date.now() - t) / 1000).toFixed(1)}s`);
