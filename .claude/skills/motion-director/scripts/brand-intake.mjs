#!/usr/bin/env node
// Brand intake: logo, colours, fonts and real product screenshots from a URL.
//
//   node brand-intake.mjs <url> --project <dir> [--refresh]
//       Captures the site with a headless browser (hyperframes capture), drafts
//       brand.json + brand.md in the brand LIBRARY, then copies it into the
//       project's brand/. If the library already has a brand.md for this domain
//       it is reused as-is (pass --refresh to capture again).
//
//   node brand-intake.mjs pick --project <dir> --logo <file> --shots <f1,f2,...> [--mark <file>]
//       After LOOKING at the candidate sheets: record the real logo and the 3-6
//       real product screenshots, then refresh brand.md and the project copy.
//
// Library: $MOTION_DIRECTOR_HOME/brands/<domain>/ (default ~/motion-director).
import fs from "node:fs";
import path from "node:path";
import {
  HOME, die, dims, hf, lastJSON, logEvent, project, readJSON, run, sheet, slugify, writeJSON,
} from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const P = project(opt("--project", "."));

const copyDir = (a, b) => fs.cpSync(a, b, { recursive: true, force: true, filter: (s) => !s.includes(`${path.sep}capture${path.sep}`) && !s.endsWith(`${path.sep}capture`) });
const syncToProject = (lib) => {
  copyDir(lib, P.file("brand"));
  const meta = readJSON(P.file("project.json"));
  meta.brand = { library: lib, domain: path.basename(lib) };
  writeJSON(P.file("project.json"), meta);
};

/* -------------------------------------------------------------- colour */

const hex = (h) => {
  let s = h.replace("#", "");
  if (s.length === 3 || s.length === 4) s = [...s].map((c) => c + c).join("");
  return s.slice(0, 6).toUpperCase();
};
const rgb = (h) => { const n = parseInt(hex(h), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lum = (h) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = rgb(h);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const sat = (h) => { const [r, g, b] = rgb(h).map((c) => c / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/** Roles from how the page USES each colour, not from how often it appears. */
const mix = (a, b, k) => "#" + rgb(a).map((v, i) => Math.round(v * (1 - k) + rgb(b)[i] * k).toString(16).padStart(2, "0")).join("").toUpperCase();
function roles(tokens, styles = {}) {
  const stats = (tokens.colorStats || []).filter((c) => /^#[0-9a-f]{6}$/i.test(c.hex));
  const all = (tokens.colors || []).filter((c) => /^#([0-9a-f]{6})$/i.test(c));
  const byArea = [...stats].sort((a, b) => (b.maxArea || 0) - (a.maxArea || 0));
  const ground = (byArea[0] || {}).hex || "#FFFFFF";
  const ink = ([...stats].sort((a, b) => (b.textCount || 0) - (a.textCount || 0)).find((c) => contrast(c.hex, ground) > 4.5) || {}).hex
    || (lum(ground) > 0.5 ? "#000000" : "#FFFFFF");
  const pool = [...new Set([...stats.filter((c) => c.interactiveBg > 0).map((c) => c.hex), ...all])];
  // the primary call-to-action's fill IS the accent when it is a colour; a
  // review widget's green or a partner logo's blue is not
  const btn = (styles.buttons || []).map((b) => b.background).find((c) => /^#[0-9a-f]{6}$/i.test(c || "") && sat(c) > 0.35 && lum(c) > 0.02 && lum(c) < 0.85);
  const accent = btn || pool.filter((c) => sat(c) > 0.35 && lum(c) > 0.04 && lum(c) < 0.85)
    .sort((a, b) => sat(b) - sat(a))[0] || ink;
  const surface = all.find((c) => c !== ground && Math.abs(lum(c) - lum(ground)) < 0.12 && Math.abs(lum(c) - lum(ground)) > 0.005) || ground;
  const muted = all.find((c) => sat(c) < 0.2 && contrast(c, ground) > 2.2 && contrast(c, ground) < 6) || mix(ink, ground, 0.45);
  const palette = [...new Set([ground, ink, accent, surface, muted, ...all])].slice(0, 12).map((c) => "#" + hex(c));
  return { ground: "#" + hex(ground), ink: "#" + hex(ink), accent: "#" + hex(accent), surface: "#" + hex(surface), muted: "#" + hex(muted), palette };
}

/* --------------------------------------------------------------- fonts */

const BUNDLED = ["Inter", "Montserrat", "Outfit", "Nunito", "Oswald", "League Gothic", "Archivo Black", "Space Mono",
  "IBM Plex Mono", "JetBrains Mono", "EB Garamond", "Playfair Display", "Source Code Pro", "Roboto", "Open Sans", "Lato", "Poppins"];
const nearest = (fam) => {
  const f = fam.toLowerCase();
  const hit = BUNDLED.find((b) => f.includes(b.toLowerCase())) || BUNDLED.find((b) => b.toLowerCase().startsWith(f.split(" ")[0]));
  if (hit) return hit;
  if (/mono|code|courier/.test(f)) return "JetBrains Mono";
  if (/serif|garamond|lyon|tiempos|georgia|times|caslon|playfair/.test(f) && !/sans/.test(f)) return "EB Garamond";
  if (/grotesk|gothic|condensed|compressed|display|black/.test(f)) return "Archivo Black";
  return "Inter";
};

function fonts(capDir, styles) {
  const manifest = readJSON(path.join(capDir, "extracted", "fonts-manifest.json"), { files: [] }).files || [];
  const typo = styles.typography || [];
  const pickRole = (re) => typo.find((t) => re.test(t.role)) || {};
  const out = {};
  for (const [role, re] of [["display", /^display$/], ["heading", /^heading$/], ["body", /^body$/]]) {
    const t = pickRole(re);
    if (!t.fontFamily) continue;
    const fam = t.fontFamily.replace(/["']/g, "").split(",")[0].trim();
    const norm = (s) => s.toLowerCase().replace(/\s+web$/, "").replace(/[^a-z0-9]/g, "");
    const files = manifest.filter((m) => !m.isIcon && (norm(m.family) === norm(fam) || norm(m.rawFamily || "").startsWith(norm(fam))))
      .filter((m) => m.style !== "italic")
      // Next.js ships one file per unicode subset; the preloaded one (".p.")
      // is the Latin subset. Then woff2, then the biggest.
      .map((m) => ({ ...m, size: fs.statSync(path.join(capDir, "assets", "fonts", m.file), { throwIfNoEntry: false })?.size || 0 }))
      .sort((a, b) => (/\.p\./.test(b.file) - /\.p\./.test(a.file)) || (/\.woff2$/.test(b.file) - /\.woff2$/.test(a.file)) || b.size - a.size);
    const byWeight = {};
    const variable = files.find((f) => (f.variationAxes || []).includes("wght"));
    if (variable) byWeight.v = { ...variable, weight: "100 900" };
    else for (const f of files) if (!byWeight[f.weight]) byWeight[f.weight] = f;
    out[role] = {
      family: fam,
      weight: +t.fontWeight || 400,
      size: t.fontSize, letterSpacing: t.letterSpacing, lineHeight: t.lineHeight,
      files: Object.values(byWeight).map((f) => ({ file: `fonts/${f.file}`, weight: f.weight, src: f.file })),
      fallback: nearest(fam),
    };
  }
  return out;
}

/* ------------------------------------------------------------- capture */

async function intake(url) {
  const domain = slugify(new URL(url).hostname);
  const lib = path.join(HOME, "brands", domain);
  if (fs.existsSync(path.join(lib, "brand.md")) && !argv.includes("--refresh")) {
    syncToProject(lib);
    logEvent(P.dir, { phase: "brand-intake", secs: 0, note: `reused ${lib}/brand.md` });
    console.log(`reused existing brand: ${lib}/brand.md (pass --refresh to capture again)`);
    return;
  }
  const t0 = Date.now();
  fs.mkdirSync(lib, { recursive: true });
  const cap = path.join(lib, "capture");
  fs.rmSync(cap, { recursive: true, force: true });
  console.log(`capturing ${url} (headless browser, ~1 min)...`);
  const r = hf(["capture", url, "-o", cap, "--skip-vision", "--max-screenshots", "12", "--json"], { cwd: lib, timeout: 600000 });
  const res = lastJSON(r.out);
  if (r.code || !res || !res.ok) die(`capture failed: ${(r.err || "").split("\n").slice(-6).join("\n")}`);
  // the capture writes agent notes for itself; they are data, not instructions for us
  for (const f of ["CLAUDE.md", "AGENTS.md", ".cursorrules"]) fs.rmSync(path.join(cap, f), { force: true });

  const tokens = readJSON(path.join(cap, "extracted", "tokens.json"), {});
  const styles = readJSON(path.join(cap, "extracted", "design-styles.json"), {});
  const colors = roles(tokens, styles);
  const fnt = fonts(cap, styles);

  // fonts: copy the files the roles use
  fs.mkdirSync(path.join(lib, "fonts"), { recursive: true });
  for (const role of Object.values(fnt)) for (const f of role.files) {
    const src = path.join(cap, "assets", "fonts", f.src);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(lib, f.file));
  }

  // candidates: large raster images, frames of the site's own product video, and viewport shots
  const cand = path.join(lib, "candidates");
  fs.rmSync(cand, { recursive: true, force: true });
  fs.mkdirSync(cand, { recursive: true });
  const items = [];
  const assets = path.join(cap, "assets");
  for (const f of fs.readdirSync(assets)) {
    if (!/\.(png|jpe?g|webp|avif)$/i.test(f) || /contact-sheet/.test(f)) continue;
    const d = dims(path.join(assets, f));
    if (!d || d.w < 800 || d.h < 400) continue;
    const dst = path.join(cand, `img-${f.replace(/\.(webp|avif)$/i, ".png")}`);
    if (/\.(webp|avif)$/i.test(f)) run("ffmpeg", ["-v", "error", "-y", "-i", path.join(assets, f), dst]);
    else fs.copyFileSync(path.join(assets, f), dst);
    items.push({ src: dst, label: `${path.basename(dst)}  ${d.w}x${d.h}` });
  }
  const vids = path.join(assets, "videos");
  if (fs.existsSync(vids)) for (const v of fs.readdirSync(vids).filter((f) => /\.(mp4|webm|mov)$/i.test(f)).slice(0, 3)) {
    const src = path.join(vids, v);
    const pr = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]);
    const dur = parseFloat(pr.out) || 0;
    if (!dur) continue;
    fs.copyFileSync(src, path.join(cand, `video-${v}`));
    for (const frac of [0.15, 0.4, 0.65, 0.9]) {
      const dst = path.join(cand, `frame-${path.parse(v).name}-${Math.round(frac * 100)}.png`);
      run("ffmpeg", ["-v", "error", "-y", "-ss", String(dur * frac), "-i", src, "-frames:v", "1", dst]);
      if (fs.existsSync(dst)) items.push({ src: dst, label: `${path.basename(dst)}  (video ${(dur * frac).toFixed(1)}s)` });
    }
  }
  const shots = path.join(cap, "screenshots");
  for (const f of fs.readdirSync(shots).filter((f) => /^scroll-\d+\.png$/.test(f)).sort()) {
    fs.copyFileSync(path.join(shots, f), path.join(cand, `page-${f}`));
    items.push({ src: path.join(cand, `page-${f}`), label: `page-${f}  (viewport)` });
  }
  // videos the page embeds: their full-size thumbnails are real, sharp brand
  // material (the page itself only carries small copies)
  const html = (() => { try { return fs.readFileSync(path.join(cap, "extracted", "page.html"), "utf8"); } catch { return ""; } })();
  for (const id of [...new Set([...html.matchAll(/i\.ytimg\.com\/vi\/([A-Za-z0-9_-]{11})\//g)].map((m) => m[1]))].slice(0, 8)) {
    for (const q of ["maxresdefault", "hqdefault"]) {
      try {
        const res = await fetch(`https://i.ytimg.com/vi/${id}/${q}.jpg`);
        if (!res.ok) continue;
        const dst = path.join(cand, `yt-${id}.jpg`);
        fs.writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
        const d = dims(dst);
        items.push({ src: dst, label: `yt-${id}.jpg ${d ? `${d.w}x${d.h}` : ""} (video thumbnail)` });
        break;
      } catch {}
    }
  }
  sheet(items, path.join(lib, "candidates-sheet.png"), { cols: 4, title: `${domain}: product screenshot candidates` });

  // logo candidates: the capture's own structural guess, plus icons
  const svgDir = path.join(assets, "svgs");
  const logos = fs.existsSync(svgDir) ? fs.readdirSync(svgDir).filter((f) => /^logo-.*\.svg$/.test(f)) : [];
  const lc = path.join(lib, "logo-candidates");
  fs.rmSync(lc, { recursive: true, force: true });
  fs.mkdirSync(lc, { recursive: true });
  const logoItems = [];
  for (const f of logos) { fs.copyFileSync(path.join(svgDir, f), path.join(lc, f)); logoItems.push({ src: path.join(lc, f), label: f }); }
  for (const f of fs.readdirSync(assets).filter((f) => /^(icon|favicon|logo)/i.test(f) && /\.(png|svg|jpe?g|webp)$/i.test(f))) {
    fs.copyFileSync(path.join(assets, f), path.join(lc, f));
    logoItems.push({ src: path.join(lc, f), label: f });
  }
  // A vector mark beats a 180px favicon at video size. Simple Icons publishes
  // one monochrome path per brand; try the domain's first label and the
  // page title's brand word.
  const guesses = [...new Set([domain.split("-")[0], (tokens.title || "").split(/[|:\u2013\u2014-]/).pop().trim().toLowerCase().replace(/[^a-z0-9]/g, "")])].filter(Boolean);
  for (const g of guesses) {
    try {
      const res = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${g}.svg`);
      if (!res.ok) continue;
      const svg = (await res.text()).replace("<svg ", '<svg fill="#000000" width="512" height="512" ');
      const f = path.join(lc, `simpleicons-${g}.svg`);
      fs.writeFileSync(f, svg);
      logoItems.unshift({ src: f, label: `simpleicons-${g}.svg (vector)` });
    } catch {}
  }
  logoItems.unshift(...(await youtube(cap, lc)));
  sheet(logoItems, path.join(lib, "logo-sheet.png"), { cols: 6, cell: 260, well: "#8c8c94", title: `${domain}: logo candidates on mid grey, so black and white marks both show` });

  const brand = {
    name: (tokens.title || domain).split(/[|\u2013\u2014-]/).pop().trim() || domain,
    domain, url, captured: new Date().toISOString(),
    tagline: (tokens.description || "").replace(/\s*[\u2013\u2014]\s*/g, " - "),
    colors, fonts: fnt,
    radius: (styles.radius || [])[0] || "8px",
    buttons: (styles.buttons || []).slice(0, 2),
    headings: (tokens.headings || []).slice(0, 6).map((h) => h.text.replace(/\s*[\u2013\u2014]\s*/g, " - ")),
    logo: null, mark: null, shots: [],
    candidates: { sheet: "candidates-sheet.png", logos: "logo-sheet.png", count: items.length },
  };
  writeJSON(path.join(lib, "brand.json"), brand);
  fs.writeFileSync(path.join(lib, "brand.md"), brandMd(brand));
  syncToProject(lib);
  const secs = +((Date.now() - t0) / 1000).toFixed(1);
  logEvent(P.dir, { phase: "brand-intake", secs, note: `captured ${url}: ${items.length} screenshot candidates, ${logoItems.length} logo candidates` });
  console.log(`brand drafted in ${secs}s: ${lib}
  LOOK at ${lib}/candidates-sheet.png and ${lib}/logo-sheet.png, then:
  node brand-intake.mjs pick --project ${P.dir} --logo <file> --shots <3-6 files>`);
}

function brandMd(b) {
  const c = b.colors;
  const f = (r) => (b.fonts[r] ? `${b.fonts[r].family} ${b.fonts[r].weight}${b.fonts[r].files.length ? "" : ` (no file captured, render with ${b.fonts[r].fallback})`}` : "not found");
  return `# ${b.name}

Source: ${b.url} (captured ${b.captured.slice(0, 10)})
${b.tagline ? `\n> ${b.tagline}\n` : ""}
## Colour (roles measured from how the page uses each colour)

| role | hex | use |
|---|---|---|
| ground | \`${c.ground}\` | the largest painted area |
| ink | \`${c.ink}\` | body and headline type |
| accent | \`${c.accent}\` | the call-to-action fill; one accented word per line, never a second accent |
| surface | \`${c.surface}\` | cards and wells on the ground |
| muted | \`${c.muted}\` | secondary type, hairlines |

Full palette: ${c.palette.map((p) => `\`${p}\``).join(" ")}

## Type

- Display: ${f("display")}${b.fonts.display ? `, ${b.fonts.display.size}, tracking ${b.fonts.display.letterSpacing}` : ""}
- Heading: ${f("heading")}
- Body: ${f("body")}

## Shape

- Corner radius: ${b.radius}
${b.buttons.map((x) => `- Button "${x.label}": ${x.background} fill, ${x.color} text, radius ${x.borderRadius}`).join("\n")}

## Logo

${b.logo ? `- Logo: \`${b.logo}\`` : "- Not chosen yet: look at logo-sheet.png and run `brand-intake.mjs pick`."}
${b.mark ? `- Mark: \`${b.mark}\`` : ""}

## Product screenshots (real, captured from the site)

${b.shots.length ? b.shots.map((s) => `- \`${s.file}\` ${s.w}x${s.h}${s.note ? `: ${s.note}` : ""}`).join("\n") : "- Not chosen yet: look at candidates-sheet.png and run `brand-intake.mjs pick`."}

## Voice (the site's own headlines)

${b.headings.map((h) => `- ${h}`).join("\n")}
`;
}

/* ------------------------------------------------------------- youtube */

// A channel intro wants the channel's own avatar, and the site's favicon is
// usually a 192px copy of it. If the page links a YouTube channel, take the
// avatar and banner at full size from the channel page (yt3 URLs, "=s0").
async function youtube(cap, dest) {
  const txt = ["extracted/tokens.json", "extracted/visible-text.txt", "extracted/design-styles.json", "extracted/page.html"]
    .map((f) => { try { return fs.readFileSync(path.join(cap, f), "utf8"); } catch { return ""; } }).join("\n");
  const ch = (txt.match(/https?:\/\/(?:www\.)?youtube\.com\/(?:@|channel\/|c\/)[A-Za-z0-9_.-]+/) || [])[0];
  if (!ch) return [];
  const got = [];
  try {
    const html = await (await fetch(ch, { headers: { "accept-language": "en" } })).text();
    // group the yt3 URLs by image id: the avatar is requested at small sizes, the
    // banner or a post image at large ones (look before using it)
    const ids = {};
    for (const u of html.match(/https:\/\/yt3\.(?:googleusercontent|ggpht)\.com\/[A-Za-z0-9_\-\/=]+/g) || []) {
      const [base, opts] = u.split("=");
      const size = +((opts || "").match(/[sw](\d+)/) || [0, 0])[1];
      ids[base] = Math.max(ids[base] || 0, size);
    }
    const byId = Object.entries(ids).filter(([, z]) => z > 0);
    const avatar = byId.filter(([, z]) => z < 1000).sort((a, b) => b[1] - a[1])[0]?.[0];
    const banner = byId.filter(([, z]) => z >= 1000).sort((a, b) => b[1] - a[1])[0]?.[0];
    for (const [name, u] of [["youtube-avatar", avatar], ["youtube-large-image", banner]]) {
      if (!u) continue;
      const full = `${u}=s0`;
      const res = await fetch(full);
      if (!res.ok) continue;
      const f = path.join(dest, `${name}.jpg`);
      fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
      const d = dims(f);
      got.push({ src: f, label: `${name}.jpg ${d ? `${d.w}x${d.h}` : ""} (${ch.replace(/^https?:\/\/(www\.)?/, "")})` });
    }
  } catch {}
  return got;
}

/* ---------------------------------------------------------------- pick */

function pick() {
  const meta = readJSON(P.file("project.json"));
  if (!meta.brand) die("no brand yet: run brand-intake.mjs <url> --project ... first");
  const lib = meta.brand.library;
  const b = readJSON(path.join(lib, "brand.json"));
  const resolve = (f) => [f, path.join(lib, f), path.join(lib, "candidates", f), path.join(lib, "logo-candidates", f)].find((x) => fs.existsSync(x)) || die(`not found: ${f}`);
  const logo = opt("--logo");
  if (logo) { const s = resolve(logo); const dst = `logo${path.extname(s)}`; fs.copyFileSync(s, path.join(lib, dst)); b.logo = dst; }
  const mark = opt("--mark");
  if (mark) { const s = resolve(mark); const dst = `mark${path.extname(s)}`; fs.copyFileSync(s, path.join(lib, dst)); b.mark = dst; }
  const shots = opt("--shots");
  if (shots) {
    const list = shots.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length < 3 || list.length > 6) die(`pick 3 to 6 product screenshots (got ${list.length})`);
    fs.rmSync(path.join(lib, "shots"), { recursive: true, force: true });
    fs.mkdirSync(path.join(lib, "shots"), { recursive: true });
    b.shots = list.map((f, i) => {
      const s = resolve(f);
      const dst = `shots/shot-${i + 1}${path.extname(s)}`;
      fs.copyFileSync(s, path.join(lib, dst));
      const d = dims(s) || {};
      return { file: dst, from: path.basename(s), w: d.w, h: d.h };
    });
  }
  writeJSON(path.join(lib, "brand.json"), b);
  fs.writeFileSync(path.join(lib, "brand.md"), brandMd(b));
  syncToProject(lib);
  logEvent(P.dir, { phase: "brand-pick", secs: 0, note: `logo ${b.logo}, ${b.shots.length} shots` });
  console.log(`brand.md updated: ${lib}/brand.md (copied to ${P.file("brand")})`);
}

// recompute colour roles and fonts from the stored capture (no new capture)
async function recolor() {
  const meta = readJSON(P.file("project.json"));
  if (!meta.brand) die("no brand yet");
  const lib = meta.brand.library, cap = path.join(lib, "capture");
  const b = readJSON(path.join(lib, "brand.json"));
  const styles = readJSON(path.join(cap, "extracted", "design-styles.json"), {});
  b.colors = roles(readJSON(path.join(cap, "extracted", "tokens.json"), {}), styles);
  b.fonts = fonts(cap, styles);
  fs.rmSync(path.join(lib, "fonts"), { recursive: true, force: true });
  fs.mkdirSync(path.join(lib, "fonts"), { recursive: true });
  for (const role of Object.values(b.fonts)) for (const f of role.files) fs.copyFileSync(path.join(cap, "assets", "fonts", f.src), path.join(lib, f.file));
  writeJSON(path.join(lib, "brand.json"), b);
  fs.writeFileSync(path.join(lib, "brand.md"), brandMd(b));
  syncToProject(lib);
  const yt = await youtube(cap, path.join(lib, "logo-candidates"));
  if (yt.length) console.log("youtube: " + yt.map((y) => y.label).join(", "));
  console.log(JSON.stringify(b.colors));
}

if (argv[0] === "pick") pick();
else if (argv[0] === "recolor") await recolor();
else {
  const url = argv.find((a) => /^https?:\/\//.test(a));
  if (!url) die("usage: brand-intake.mjs <url> --project <dir> [--refresh]   |   brand-intake.mjs pick --project <dir> --logo f --shots a,b,c");
  await intake(url);
}
