#!/usr/bin/env node
// The film's own rules, checked before anything renders.
//
//   node lint-md.mjs --project <dir>
//
// HyperFrames' `check` covers the framework contract (timelines, media, layout).
// This covers the craft rules that are easy to forget and expensive to find
// in a render:
//   - every text line has an id, a deliberate entrance AND a deliberate exit
//   - no em or en dashes, no placeholder copy, no emoji, no stock icon sets
//   - no type-only scene (centred text on a plain ground) without a stated reason
//   - real screenshots are on screen: at least 3 of the brand's, or all it has
//   - every shot in beatgrid.json is a scene with the same start and length
//   - nothing in a script that is not a function of time (Date, Math.random)
import fs from "node:fs";
import { die, logEvent, makeTime, project, readJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const P = project(argv.includes("--project") ? argv[argv.indexOf("--project") + 1] : ".");
const idx = P.file("film", "index.html");
if (!fs.existsSync(idx)) die("no film/index.html: run film-init.mjs");
const html = fs.readFileSync(idx, "utf8");
const G = readJSON(P.file("sound", "beats.json"));
const T = makeTime({ bpm: G.bpm, beatsPerBar: G.beatsPerBar, cues: G.cues });

const errors = [], warns = [];
const body = html.replace(/<!--[\s\S]*?-->/g, "");
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map((m) => [m[1], m[2]]));
const tags = [...body.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map((m) => ({ name: m[1].toLowerCase(), raw: m[0], a: attrs(m[2]), at: m.index }));

// 1. lines
const lines = tags.filter((t) => /(^|\s)md-line(\s|$)/.test(t.a.class || ""));
if (!lines.length) errors.push("no .md-line elements: every text line goes through MD.lines so it gets an entrance and an exit");
for (const l of lines) {
  const who = l.a.id ? `#${l.a.id}` : l.raw.slice(0, 60);
  if (!l.a.id) errors.push(`${who}: no id`);
  for (const k of ["data-in", "data-out"]) {
    const v = l.a[k];
    if (!v) { errors.push(`${who}: no ${k}. Every text line has a deliberate entrance AND exit.`); continue; }
    const [kind, at] = v.split("@");
    if (kind === "end") { if (k === "data-in") errors.push(`${who}: "end" is an exit, not an entrance`); continue; }
    if (!at) { errors.push(`${who}: ${k}="${v}" has no time`); continue; }
    try { const t = T.t(at); if (t < 0 || t > G.length) errors.push(`${who}: ${k} at ${t}s is outside the film (0-${G.length}s)`); }
    catch (e) { errors.push(`${who}: ${k}: ${e.message}`); }
  }
  if (l.a["data-in"] && l.a["data-out"] && !/^end/.test(l.a["data-out"])) {
    try { if (T.t(l.a["data-out"].split("@")[1]) <= T.t(l.a["data-in"].split("@")[1])) errors.push(`${who}: exits before it enters`); } catch {}
  }
  if (/^end/.test(l.a["data-out"] || "")) {
    try { if (G.length - T.t((l.a["data-in"] || "").split("@")[1]) > 6) warns.push(`${who}: out="end" but it enters ${(G.length - T.t(l.a["data-in"].split("@")[1])).toFixed(1)}s before the end; "end" is for the end card's last line`); } catch {}
  }
}

// 1b. 9:16: no line in the band the platform paints its caption and buttons over.
// The runtime check samples moments; this reads every line's own position.
if (P.meta.format === "9:16") for (const l of lines) {
  const st = l.a.style || "";
  const top = parseFloat((st.match(/(?:^|;)\s*top:\s*([\d.]+)px/) || [])[1]);
  const fs_ = parseFloat((st.match(/font-size:\s*([\d.]+)px/) || [])[1] || 40);
  if (!isNaN(top) && top + fs_ > 1330) errors.push(`#${l.a.id}: top ${top}px + ${fs_}px type reaches y=${top + fs_}, inside the 9:16 caption/button band (below 1330)`);
}

// 1b. type that renders cleanly
// Tracking tighter than -0.025em makes glyphs overlap ("t" into "h"), and every
// overlap renders as a visible anti-aliasing seam through the letters.
for (const m of body.matchAll(/letter-spacing:\s*(-[\d.]+)(em|px)/g)) {
  const v = parseFloat(m[1]), em = m[2] === "em" ? v : null;
  if (em !== null && em < -0.025) errors.push(`letter-spacing ${m[1]}em: glyphs overlap below -0.025em and render a seam through the letters. Use -0.025em at the tightest.`);
}
// A clip floor at the line box (bottom inset 0) slices descenders and glows flat.
for (const m of body.matchAll(/inset\((-?[\d.]+%?)\s+(-?[\d.]+%?)\s+(0%?|0px)\s+(-?[\d.]+%?)\)/g))
  warns.push(`clip ${m[0]}: a bottom inset of 0 cuts descenders and text glow. Use a negative bottom (MD's floor is -0.42em).`);

// 2. copy
const visible = body.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
if (/[\u2013\u2014]/.test(visible) || /&mdash;|&ndash;/.test(body)) errors.push(`em/en dash in on-screen copy: "${(visible.match(/.{0,30}[\u2013\u2014].{0,30}/) || [""])[0].trim()}". Use a comma, a colon or two sentences.`);
for (const re of [/lorem ipsum/i, /\bplaceholder\b/i, /\bTODO\b/, /your (text|headline|logo) here/i, /\bxxx\b/i])
  if (re.test(visible)) errors.push(`placeholder copy on screen: ${re}`);
if (/\p{Extended_Pictographic}/u.test(visible)) errors.push("emoji in on-screen copy: draw the real icon or leave it out");
for (const re of [/font-?awesome/i, /lucide/i, /heroicons/i, /material-?(icons|symbols)/i, /ionicons/i, /flaticon/i, /iconify/i, /feather-?icons/i, /bootstrap-icons/i])
  if (re.test(body)) errors.push(`stock icon set referenced (${re}): use the brand's own marks, its real UI, or nothing`);

// 3. scenes
const scenes = tags.filter((t) => t.name === "section" && /(^|\s)md-scene(\s|$)/.test(t.a.class || ""));
const ends = [...body.matchAll(/<\/section>/gi)].map((m) => m.index);
const sceneBody = (s) => body.slice(s.at, ends.find((e) => e > s.at) ?? body.length);
// media that is timed on its own wrapper (a <video> may not sit inside a timed
// scene) still puts a picture under any scene it overlaps
const divEnds = (t) => { let depth = 0; const re = /<(\/?)div\b[^>]*>/gi; re.lastIndex = t.at; let m; while ((m = re.exec(body))) { depth += m[1] ? -1 : 1; if (!depth) return m.index; } return body.length; };
const mediaClips = tags.filter((t) => t.name === "div" && /(^|\s)clip(\s|$)/.test(t.a.class || "") && t.a["data-start"] !== undefined)
  .filter((t) => /<(img|video|svg|canvas)\b/i.test(body.slice(t.at, divEnds(t))))
  .concat(tags.filter((t) => ["video", "img"].includes(t.name) && t.a["data-start"] !== undefined))
  // a mounted scene file (a device scene, a registry block) is a picture too
  .concat(tags.filter((t) => t.a["data-composition-src"] && t.a["data-start"] !== undefined))
  .map((t) => [parseFloat(t.a["data-start"]), parseFloat(t.a["data-start"]) + parseFloat(t.a["data-duration"] || 0)]);
for (const s of scenes) {
  const inner = sceneBody(s);
  const a0 = parseFloat(s.a["data-start"]), a1 = a0 + parseFloat(s.a["data-duration"] || 0);
  const under = mediaClips.some(([m0, m1]) => m0 < a1 - 0.01 && m1 > a0 + 0.01);
  const hasPicture = under || /<(img|video|svg|canvas)\b/i.test(inner) || /md-shot|md-ui|md-glass|md-obj|pp-cut|tt-prop|tt-surface|st-folder|st-orb|data-picture/.test(inner);
  if (!hasPicture && !s.a["data-type-scene"]) errors.push(`#${s.a.id}: a type-only scene (text on a plain ground). Put the real product, a screenshot or a designed object in it, or mark it data-type-scene="why this scene is type only".`);
  if (s.a["data-type-scene"] && /gradient/i.test(s.a["data-type-scene"])) errors.push(`#${s.a.id}: "${s.a["data-type-scene"]}" is not a reason; centred text on a gradient is the banned default`);
}
for (const shot of G.shots) {
  const s = scenes.find((x) => x.a.id === shot.id);
  if (!s) { errors.push(`shot "${shot.id}" from beatgrid.json has no <section id="${shot.id}" class="clip md-scene">`); continue; }
  const st = parseFloat(s.a["data-start"]), du = parseFloat(s.a["data-duration"]);
  if (Math.abs(st - shot.a) > 0.011 || Math.abs(st + du - shot.b) > 0.011)
    errors.push(`#${shot.id}: scene is ${st}..${(st + du).toFixed(3)}s but the grid says ${shot.a}..${shot.b}s (data-start="${shot.a}" data-duration="${+(shot.b - shot.a).toFixed(4)}")`);
}
for (const s of scenes) if (!G.shots.find((x) => x.id === s.a.id)) warns.push(`#${s.a.id}: scene not in beatgrid.json`);

// 4. real screenshots, real files
const srcs = tags.filter((t) => ["img", "video"].includes(t.name) && t.a.src).map((t) => t.a.src);
for (const s of srcs) if (!/^https?:/.test(s) && !/\$\{/.test(s) && !fs.existsSync(P.file("film", s))) errors.push(`missing file: ${s}`);
const brand = readJSON(P.file("brand", "brand.json"), { shots: [] });
// REAL MATERIAL over drawn mockups: the brand's screenshots, its product
// video, its client marks. Script-built pieces count by the paths they name.
const realRefs = new Set([...body.matchAll(/assets\/(?:shots|clients|thumbs)\/[\w.${}+ -]+/g)].map((m) => m[0]));
const clientsDir = P.file("film", "assets", "clients");
const nClients = fs.existsSync(clientsDir) && [...realRefs].some((r) => r.includes("${")) ? fs.readdirSync(clientsDir).length : 0;
const usedVideo = /assets\/video-/.test(body);
const usedShots = new Set([...realRefs].filter((r) => r.includes("/shots/")));
const real = [...realRefs].filter((r) => !r.includes("${")).length + nClients + (usedVideo ? 3 : 0);
if (real < 3) errors.push(`only ${real} piece(s) of real brand material on screen; use at least 3 (screenshots, product video, client marks): real material over drawn mockups`);
if (!srcs.some((s) => s.includes(brand.logo || "@@") || s.includes(brand.mark || "@@")) && !/assets\/(logo|mark)\./.test(body)) errors.push("the brand's logo is never on screen");

// 5. determinism
const scripts = [...body.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join("\n");
if (/Math\.random|Date\.now|new Date|performance\.now|setTimeout|setInterval|requestAnimationFrame/.test(scripts)) errors.push("a script uses the clock or randomness: everything must be a function of timeline time (use MD.rand(seed))");
if (/repeat\s*:\s*-1/.test(scripts)) errors.push("repeat: -1 never ends; use a finite repeat");
if (!/window\.__timelines\["main"\]\s*=\s*tl/.test(scripts)) errors.push('the registration line window.__timelines["main"] = tl is missing');
if (!/MD\.lines\(tl/.test(scripts)) errors.push("MD.lines(tl) is never called");

const ok = !errors.length;
for (const e of errors) console.log("  ERROR " + e);
for (const w of warns) console.log("  warn  " + w);
console.log(ok ? `lint-md: clean (${lines.length} lines, ${scenes.length} scenes, ${real} pieces of real brand material${warns.length ? `, ${warns.length} warning(s)` : ""})` : `lint-md: ${errors.length} error(s)`);
logEvent(P.dir, { phase: "lint", secs: 0, note: ok ? "clean" : `${errors.length} errors` });
process.exit(ok ? 0 : 1);
