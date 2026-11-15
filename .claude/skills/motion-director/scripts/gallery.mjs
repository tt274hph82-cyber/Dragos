#!/usr/bin/env node
// Build the preview gallery: a looping preview of every MOVE (rendered in the
// example brand in templates/demo-brand) and every THEME, in one page the user picks from.
//
//   node gallery.mjs                      # render missing/stale move previews, write gallery.html + gallery.jpg
//   node gallery.mjs --only bar-race      # just these moves (comma separated)
//   node gallery.mjs --force              # re-render every preview
//   node gallery.mjs --no-render          # only rebuild the page from previews already on disk
//   node gallery.mjs --open               # open the page when done
//
// Per move it writes templates/moves/<id>/preview.mp4 (540px wide, 9:16 if the
// move has it) and preview.gif (270px, for chat). Themes show their preview
// strip (templates/themes/<id>/preview.jpg) when one exists.
// The page lives at <skill>/gallery.html and filters by use, look and tag.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SKILL, die, duration, readJSON, run } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const only = opt("--only") ? opt("--only").split(",") : null;
const force = argv.includes("--force"), noRender = argv.includes("--no-render");
const MOVES = path.join(SKILL, "templates", "moves"), THEMES = path.join(SKILL, "templates", "themes");
if (run("ffmpeg", ["-version"]).code) die("ffmpeg is needed for previews (see check-setup.mjs)");

// the example brand can carry per-move example copy ("examples": {"<move id>": {vars}}) so previews read right
const BRAND = path.join(SKILL, "templates", "demo-brand", "brand.json");
const EXAMPLES = readJSON(BRAND, {}).examples || {};
const mtime = (p) => (fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0);
const dirs = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((n) => !n.startsWith("_") && !n.startsWith(".") && fs.statSync(path.join(d, n)).isDirectory()) : []);

// ---- moves: render the preview loops
const moves = [];
for (const id of dirs(MOVES)) {
  const md = path.join(MOVES, id), mj = path.join(md, "move.json");
  if (!fs.existsSync(mj)) continue;
  const m = readJSON(mj);
  moves.push(m);
  if (noRender || (only && !only.includes(id))) continue;
  const mp4 = path.join(md, "preview.mp4"), gif = path.join(md, "preview.gif");
  const src = Math.max(mtime(mj), mtime(path.join(md, "index.html")), mtime(path.join(MOVES, "_lib", "move.js")), mtime(BRAND));
  if (!force && mtime(mp4) > src && mtime(gif) > src) continue;
  const aspect = (m.formats || ["9:16"]).includes("9:16") ? "9:16" : m.formats[0];
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "md-gallery-")), `${id}.mp4`);
  process.stdout.write(`${id} (${aspect}) ... `);
  const r = run("node", [path.join(SKILL, "scripts", "move-render.mjs"), "--move", id, "--aspect", aspect, "--quality", opt("--quality", "draft"), "--out", tmp, ...(EXAMPLES[id] ? ["--vars", JSON.stringify(EXAMPLES[id])] : [])], { timeout: 1800000 });
  if (r.code || !fs.existsSync(tmp)) { console.log("FAILED\n" + (r.err || r.out).split("\n").slice(-6).join("\n")); continue; }
  run("ffmpeg", ["-y", "-v", "error", "-i", tmp, "-vf", "scale=540:-2:flags=lanczos", "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
  run("ffmpeg", ["-y", "-v", "error", "-i", tmp, "-vf", "fps=15,scale=270:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4", gif]);
  fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
  console.log(`ok (${(fs.statSync(mp4).size / 1024).toFixed(0)} KB mp4, ${(fs.statSync(gif).size / 1024).toFixed(0)} KB gif)`);
}

// ---- themes: whole films
const themes = dirs(THEMES).map((id) => ({ ...readJSON(path.join(THEMES, id, "theme.json"), { id, name: id }), id })).filter((t) => t.name);

// ---- the page
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rel = (p) => path.relative(SKILL, p).split(path.sep).join("/");
const card = (o) => `
  <article class="card ${o.kind}" data-uses="${esc(o.uses.join(" "))}" data-looks="${esc(o.looks.join(" "))}" data-text="${esc((o.name + " " + o.id + " " + o.tags.join(" ") + " " + o.say).toLowerCase())}">
    <div class="media ${o.tall ? "tall" : "wide"}">${o.media}</div>
    <div class="body">
      <h3>${esc(o.name)} <span class="id">${esc(o.id)}</span></h3>
      <p>${esc(o.oneLiner)}</p>
      ${o.say ? `<p class="say">${esc(o.say)}</p>` : ""}
      <div class="chips">${o.uses.map((x) => `<b>${esc(x)}</b>`).join("")}${o.looks.map((x) => `<i>${esc(x)}</i>`).join("")}${o.alpha ? "<b class=a>transparent</b>" : ""}${(o.formats || []).map((x) => `<i>${esc(x)}</i>`).join("")}</div>
      <code>${esc(o.cmd)}</code>
    </div>
  </article>`;
const cards = [
  ...themes.map((t) => {
    const img = t.preview && fs.existsSync(path.join(THEMES, t.id, t.preview)) ? rel(path.join(THEMES, t.id, t.preview)) : null;
    return card({ kind: "theme", id: t.id, name: t.name, oneLiner: t.oneLiner || "", say: t.bestFor ? `Best for: ${t.bestFor}` : "", uses: ["film"], looks: [t.ground || ""].filter(Boolean), tags: [], formats: [t.format].filter(Boolean), tall: false,
      media: img ? `<img src="${img}" loading="lazy" alt="">` : `<div class="none">preview strip not bundled</div>`, cmd: `film-init.mjs --theme ${t.id}` });
  }),
  ...moves.map((m) => {
    const mp4 = path.join(MOVES, m.id, "preview.mp4");
    const tall = (m.formats || ["9:16"]).includes("9:16");
    return card({ kind: "move", id: m.id, name: m.name || m.id, oneLiner: m.oneLiner || "", say: m.say ? `Use it ${m.say}` : "", uses: m.uses || [], looks: m.looks || [], tags: m.tags || [], formats: m.formats, alpha: m.alpha, tall,
      media: fs.existsSync(mp4) ? `<video src="${rel(mp4)}" autoplay loop muted playsinline preload="metadata"></video>` : `<div class="none">no preview yet: node scripts/gallery.mjs --only ${esc(m.id)}</div>`,
      cmd: `move-render.mjs --move ${m.id}${m.alpha ? " --bg none --format mov" : ""}` });
  }),
];
const uses = [...new Set(["film", ...moves.flatMap((m) => m.uses || [])])];
const looks = [...new Set(moves.flatMap((m) => m.looks || []))].sort();
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Motion library</title>
<style>
  :root { --bg:#0f0f12; --card:#18181d; --line:#2a2a31; --ink:#f2f1ee; --mute:#9a98a3; --acc:#ff6a3d; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.45 -apple-system, system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 2; padding: 18px 24px 14px; background: rgba(15,15,18,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
  h1 { margin: 0 0 10px; font-size: 20px; } h1 small { color: var(--mute); font-weight: 400; font-size: 14px; margin-left: 8px; }
  .bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .bar button { background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 99px; padding: 5px 12px; cursor: pointer; font: inherit; font-size: 13px; }
  .bar button.on { background: var(--ink); color: var(--bg); } .bar span { color: var(--mute); font-size: 12px; margin: 0 4px 0 10px; }
  .bar input { flex: 1 1 180px; min-width: 0; background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 99px; padding: 6px 14px; font: inherit; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px; padding: 22px 24px 60px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
  .card.theme { grid-column: 1 / -1; }
  .media { background: #000; display: grid; place-items: center; } .media.tall { aspect-ratio: 9 / 16; } .card.theme .media { aspect-ratio: auto; }
  .media video, .media img { width: 100%; height: 100%; object-fit: cover; display: block; } .card.theme .media img { height: auto; }
  .none { color: var(--mute); font-size: 12px; padding: 30px; text-align: center; }
  .body { padding: 12px 14px 14px; } h3 { margin: 0 0 4px; font-size: 16px; } .id { color: var(--mute); font-weight: 400; font-size: 12px; margin-left: 4px; }
  p { margin: 0 0 6px; color: #cfcdd6; font-size: 13px; } .say { color: var(--mute); }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; } .chips b, .chips i { font-style: normal; font-size: 11px; padding: 2px 8px; border-radius: 99px; border: 1px solid var(--line); color: var(--mute); }
  .chips b { color: var(--ink); } .chips b.a { border-color: var(--acc); color: var(--acc); }
  code { display: block; font-size: 11px; color: var(--mute); background: #111114; padding: 6px 8px; border-radius: 6px; overflow-wrap: anywhere; }
  .hide { display: none; }
  @media (max-width: 600px) { header, main { padding-left: 16px; padding-right: 16px; } }
</style></head><body>
<header><h1>Motion library <small>${themes.length} themes, ${moves.length} moves, shown in the example brand</small></h1>
<div class="bar"><span>use</span><button class="on" data-f="use" data-v="">all</button>${uses.map((u) => `<button data-f="use" data-v="${esc(u)}">${esc(u)}</button>`).join("")}
<span>look</span><button class="on" data-f="look" data-v="">all</button>${looks.map((l) => `<button data-f="look" data-v="${esc(l)}">${esc(l)}</button>`).join("")}
<input id="q" placeholder="search: number, logo, transition, quote..."></div></header>
<main>${cards.join("")}</main>
<script>
  const f = { use: "", look: "" }, q = document.getElementById("q");
  const apply = () => { const s = q.value.trim().toLowerCase(); document.querySelectorAll(".card").forEach((c) => {
    const ok = (!f.use || c.dataset.uses.split(" ").includes(f.use)) && (!f.look || c.dataset.looks.split(" ").includes(f.look)) && (!s || c.dataset.text.includes(s));
    c.classList.toggle("hide", !ok); }); };
  document.querySelectorAll(".bar button").forEach((b) => b.onclick = () => { f[b.dataset.f] = b.dataset.v;
    document.querySelectorAll('.bar button[data-f="' + b.dataset.f + '"]').forEach((x) => x.classList.toggle("on", x === b)); apply(); });
  q.oninput = apply;
</script></body></html>
`;
fs.writeFileSync(path.join(SKILL, "gallery.html"), html);

// ---- the catalogue, split by category: CATALOG.md is a short index, catalog/<category>.md holds one
// line per move. Choosing moves reads the index plus the one or two sections a beat needs (~1-2k tokens
// each) instead of every move.json (~60k) or gallery.html (~100k). Each move.json names its "category".
const CATEGORIES = {
  social: "posts, comments, DMs, follows, stories, polls, reactions, testimonials",
  creator: "videos, channels, editing tools, captions, thumbnails, chapters, podcasts, list numbers",
  ai: "agents, prompts, models, AI answers, memory, automations, connectors",
  dev: "code, terminal, pull requests, deploys, APIs, logs, status pages, sites and domains",
  productivity: "docs, email, calendar, tasks, files, meetings, search, timers",
  business: "deals, invoices, payments, pricing, carts and orders, hiring, bookings, products",
  data: "charts, stats, rankings, growth, comparisons by number, maps",
  paper: "physical documents: clippings, letters, receipts, stamps, certificates, print, books",
  system: "phone and desktop OS: notifications, dialogs, codes, windows, settings, shortcuts",
  explain: "breaking an idea down: parts, steps, lists, frameworks, pros and cons, verdicts, pointing at things",
};
const clip = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const c = s.slice(0, n); return c.slice(0, c.lastIndexOf(" ")) + "..."; };
const groups = {};
for (const m of moves.sort((a, b) => a.id.localeCompare(b.id))) {
  const c = CATEGORIES[m.category] ? m.category : "other";
  if (c === "other") console.warn(`! ${m.id}: move.json has no known "category" (one of ${Object.keys(CATEGORIES).join(", ")})`);
  (groups[c] ||= []).push(m);
}
const CATDIR = path.join(MOVES, "catalog");
fs.mkdirSync(CATDIR, { recursive: true });
for (const [c, ms] of Object.entries(groups)) fs.writeFileSync(path.join(CATDIR, `${c}.md`), [
  `# ${c} moves (generated by scripts/gallery.mjs, do not edit)`,
  "",
  "Each line: id | uses | t = can render transparent | when to use it.",
  "",
  ...ms.map((m) => `- ${m.id} | ${(m.uses || []).join(",")}${m.alpha ? " | t" : ""} | ${clip(m.say || m.oneLiner, 100)}`),
  "",
].join("\n"));
const cat = [
  "# Moves catalogue (generated by scripts/gallery.mjs, do not edit)",
  "",
  "Pick a category for what the speaker is saying, then read only that file in catalog/ (two at most",
  "per beat). Open a move's own files only for the 1-2 moves being rendered. Never read gallery.html",
  "or every move.json.",
  "",
  ...Object.keys(CATEGORIES).concat("other").filter((c) => groups[c]).map((c) => `- catalog/${c}.md | ${groups[c].length} moves | ${CATEGORIES[c] || "moves with no category yet"}`),
  "",
  "## Themes (whole films)",
  "",
  ...themes.map((t) => `- ${t.id} | ${clip(t.bestFor || t.oneLiner, 100)}`),
  "",
];
fs.writeFileSync(path.join(MOVES, "CATALOG.md"), cat.join("\n"));

// ---- a contact sheet for chat: one frame from the middle of each move preview
const frames = moves.map((m) => path.join(MOVES, m.id, "preview.mp4")).filter((p) => fs.existsSync(p));
if (frames.length) {
  const td = fs.mkdtempSync(path.join(os.tmpdir(), "md-sheet-"));
  frames.forEach((p, i) => run("ffmpeg", ["-y", "-v", "error", "-ss", (duration(p) * 0.6).toFixed(2), "-i", p, "-frames:v", "1", "-vf", "scale=270:480:force_original_aspect_ratio=decrease,pad=270:480:(ow-iw)/2:(oh-ih)/2:color=0x0f0f12", path.join(td, `f${String(i).padStart(3, "0")}.png`)]));
  const cols = Math.min(6, frames.length), rows = Math.ceil(frames.length / cols);
  run("ffmpeg", ["-y", "-v", "error", "-framerate", "1", "-i", path.join(td, "f%03d.png"), "-vf", `tile=${cols}x${rows}:padding=8:margin=8:color=0x0f0f12`, "-frames:v", "1", "-q:v", "3", path.join(SKILL, "gallery.jpg")]);
  fs.rmSync(td, { recursive: true, force: true });
}
console.log(`\n${path.join(SKILL, "gallery.html")}  (${themes.length} themes, ${moves.length} moves)${frames.length ? `\n${path.join(SKILL, "gallery.jpg")}  contact sheet` : ""}`);
if (argv.includes("--open")) run("open", [path.join(SKILL, "gallery.html")]);
