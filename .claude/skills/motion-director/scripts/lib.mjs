// Shared helpers for the motion-director scripts. Node 22+, no dependencies.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// The CLI version every project is rendered with. Pinned, so a film renders
// the same next month. Bump deliberately, then re-run check-setup.
export const HF_VERSION = "0.8.188";

// Where brands and (by default) projects live. Override with MOTION_DIRECTOR_HOME.
export const HOME = process.env.MOTION_DIRECTOR_HOME
  ? path.resolve(process.env.MOTION_DIRECTOR_HOME.replace(/^~/, os.homedir()))
  : path.join(os.homedir(), "motion-director");

export const die = (msg, code = 1) => {
  console.error(`\n!! ${msg}`);
  process.exit(code);
};

export const readJSON = (p, fallback) => {
  if (!fs.existsSync(p)) {
    if (fallback !== undefined) return fallback;
    die(`missing ${p}`);
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    die(`${p} is not valid JSON: ${e.message}`);
  }
};

export const writeJSON = (p, v) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
};

export const slugify = (s) =>
  String(s).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "film";

/**
 * Run a command and return {code, out, err}. argv is an ARRAY: never build a
 * command line by string, because zsh does not word-split an unquoted
 * variable and the failure is silent.
 */
export const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, {
    encoding: opts.binary ? null : "utf8",
    maxBuffer: 1 << 30,
    cwd: opts.cwd,
    env: { ...process.env, ...(opts.env || {}) },
    stdio: opts.inherit ? "inherit" : "pipe",
    timeout: opts.timeout,
  });
  if (r.error && r.error.code === "ENOENT") return { code: 127, out: "", err: `${cmd}: not found` };
  return { code: r.status ?? 1, out: r.stdout, err: r.stderr ? String(r.stderr) : "" };
};

/**
 * HyperFrames, pinned and private by default:
 *  - telemetry off (HYPERFRAMES_NO_TELEMETRY, DO_NOT_TRACK)
 *  - init does not install AI skills into the user's agent (HYPERFRAMES_SKIP_SKILLS)
 *  - no paid vision calls: GEMINI / HeyGen keys are removed from the child's
 *    environment, so `snapshot` and `capture` never upload frames or bill an
 *    account unless the user opts in with MD_ALLOW_CLOUD=1.
 */
export const hfEnv = () => {
  const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1", DO_NOT_TRACK: "1", HYPERFRAMES_SKIP_SKILLS: "1" };
  if (process.env.MD_ALLOW_CLOUD !== "1") {
    for (const k of ["GEMINI_API_KEY", "GOOGLE_API_KEY", "HEYGEN_API_KEY", "HEYGEN_ACCESS_TOKEN",
      "HYPERFRAMES_VERTEX_PROJECT_ID", "HYPERFRAMES_VERTEX_SERVICE_ACCOUNT"]) delete env[k];
  }
  return env;
};

export const hf = (args, opts = {}) => {
  const r = spawnSync("npx", ["-y", `hyperframes@${HF_VERSION}`, ...args], {
    encoding: "utf8",
    maxBuffer: 1 << 30,
    cwd: opts.cwd,
    env: hfEnv(),
    stdio: opts.inherit ? "inherit" : "pipe",
    timeout: opts.timeout,
  });
  return { code: r.status ?? 1, out: r.stdout || "", err: r.stderr || "" };
};

/** Parse the last JSON document out of a CLI's stdout (some print logs first). */
export const lastJSON = (s) => {
  const t = String(s || "").trim();
  try { return JSON.parse(t); } catch {}
  for (let i = t.lastIndexOf("\n{"); i >= 0; i = t.lastIndexOf("\n{", i - 1)) {
    try { return JSON.parse(t.slice(i + 1)); } catch {}
  }
  const j = t.indexOf("{");
  if (j >= 0) { try { return JSON.parse(t.slice(j)); } catch {} }
  return null;
};

export const ffprobeJSON = (file) => {
  const r = run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  if (r.code) die(`ffprobe failed on ${file}: ${r.err}`);
  return JSON.parse(r.out);
};

export const duration = (file) => parseFloat(ffprobeJSON(file).format.duration);

/* ------------------------------------------------------------ project */

export const project = (dir) => {
  const p = path.resolve(dir || ".");
  if (!fs.existsSync(path.join(p, "project.json"))) die(`${p} is not a motion-director project (no project.json). Run scripts/new-project.mjs first.`);
  return { dir: p, meta: readJSON(path.join(p, "project.json")), file: (...xs) => path.join(p, ...xs) };
};

export const FORMATS = {
  "16:9": { w: 1920, h: 1080, label: "landscape" },
  "9:16": { w: 1080, h: 1920, label: "portrait" },
  "1:1": { w: 1080, h: 1080, label: "square" },
};

/* ---------------------------------------------------------------- log */

/**
 * Every script records what it did and how long it took into log.json, so
 * the delivery log is DERIVED from the run rather than remembered.
 * cost is in USD and stays 0 unless a step called a paid API.
 */
export const logEvent = (projDir, ev) => {
  const p = path.join(projDir, "log.json");
  const log = readJSON(p, { events: [] });
  log.events.push({ at: new Date().toISOString(), cost: 0, ...ev });
  writeJSON(p, log);
};

export const timed = (projDir, phase, fn, extra = {}) => {
  const t0 = Date.now();
  const res = fn();
  logEvent(projDir, { phase, secs: +((Date.now() - t0) / 1000).toFixed(2), ...extra });
  return res;
};

/* --------------------------------------------------------- time specs */

/**
 * The same parser md.js uses in the composition: "B12", "bar3", "B12+0.1",
 * "4.5", or a cue name. Picture and sound resolve times through the same
 * rules against the same beats.json, so they cannot drift apart.
 */
export const makeTime = ({ bpm, offset = 0, beatsPerBar = 4, cues = {} }) => {
  const spb = 60 / bpm;
  const B = (n) => offset + n * spb;
  const bar = (n) => B(n * beatsPerBar);
  const t = (spec) => {
    if (typeof spec === "number") return spec;
    const s = String(spec).replace(/\s+/g, "");
    if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    const m = s.match(/^(.+?)([+-]\d+(?:\.\d+)?)?$/);
    const head = m[1];
    const off = m[2] ? parseFloat(m[2]) : 0;
    let base;
    if (/^B\d+(\.\d+)?$/.test(head)) base = B(parseFloat(head.slice(1)));
    else if (/^bar\d+(\.\d+)?$/.test(head)) base = bar(parseFloat(head.slice(3)));
    else if (Object.prototype.hasOwnProperty.call(cues, head)) base = typeof cues[head] === "number" ? cues[head] : t(cues[head]);
    else throw new Error(`cannot read time "${spec}" (use B12, bar3, 4.5, or a cue name)`);
    return +(base + off).toFixed(4);
  };
  return { spb, B, bar, t };
};

export const fmtT = (s) => {
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(2).padStart(5, "0")}`;
};

/* ------------------------------------------------------- contact sheets */

let _chrome;
/** The headless Chrome HyperFrames renders with (downloaded on first use). */
export const chromePath = () => {
  if (_chrome) return _chrome;
  const r = hf(["browser", "path"]);
  const p = (r.out || "").trim().split("\n").pop();
  if (r.code || !p || !fs.existsSync(p)) die("could not find HyperFrames' Chrome. Run: node scripts/check-setup.mjs --fix");
  return (_chrome = p);
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/**
 * A labelled grid of images, rendered as HTML and screenshotted (this FFmpeg
 * build may have no drawtext, and a sheet without labels cannot be referred to).
 * items: [{src, label}] with absolute paths.
 */
export const sheet = (items, out, { cols = 4, cell = 480, title = "", well = "#2a2a30", aspect = 1.6 } = {}) => {
  if (!items.length) return null;
  const rows = Math.ceil(items.length / cols);
  const ch = Math.round(cell / aspect);
  const W = cols * (cell + 16) + 16;
  const H = rows * (ch + 46) + 16 + (title ? 56 : 0);
  const html = `<!doctype html><html><body style="margin:0;background:#16161a;font:600 15px/1.2 -apple-system,Helvetica,Arial,sans-serif;color:#eee;width:${W}px">
${title ? `<div style="padding:18px 16px 0;font-size:22px">${esc(title)}</div>` : ""}
<div style="display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:16px;padding:16px">
${items.map((it) => `<div><div style="width:${cell}px;height:${ch}px;background:${well} url('file://${encodeURI(it.src)}') center/contain no-repeat;border-radius:6px"></div><div style="margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.label)}</div></div>`).join("\n")}
</div></body></html>`;
  const tmp = out.replace(/\.\w+$/, "") + ".sheet.html";
  fs.writeFileSync(tmp, html);
  const r = run(chromePath(), ["--headless", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
    `--window-size=${W},${H}`, `--screenshot=${out}`, "--default-background-color=16161aff", `file://${tmp}`]);
  fs.rmSync(tmp, { force: true });
  if (r.code || !fs.existsSync(out)) die(`could not draw contact sheet ${out}: ${r.err.slice(-400)}`);
  return out;
};

/** Pixel size of an image or video via ffprobe. */
export const dims = (file) => {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", file]);
  const [w, h] = (r.out || "").trim().split("\n")[0].split("x").map(Number);
  return w && h ? { w, h } : null;
};

/**
 * Copy a brand's real material into a film's assets folder A (logo, mark,
 * shots, product video, font files) and write A/brand.css with its tokens.
 * Returns the font families by role. Used by film-init and theme-board.
 */
export const writeBrandAssets = (P, b, A) => {
  fs.mkdirSync(path.join(A, "fonts"), { recursive: true });
  fs.mkdirSync(path.join(A, "shots"), { recursive: true });
  // brand assets
  fs.copyFileSync(P.file("brand", b.logo), path.join(A, path.basename(b.logo)));
  if (b.mark && fs.existsSync(P.file("brand", b.mark))) fs.copyFileSync(P.file("brand", b.mark), path.join(A, path.basename(b.mark)));
  for (const s of b.shots) fs.copyFileSync(P.file("brand", s.file), path.join(A, "shots", path.basename(s.file)));
  for (const f of fs.readdirSync(P.file("brand")).filter((f) => /^video-.*\.(mp4|webm|mov)$/i.test(f))) {
    // the site's own product video, if the capture found one: real motion beats a still
    const dst = path.join(A, f.replace(/\.(webm|mov)$/i, ".mp4"));
    if (!fs.existsSync(dst)) run("ffmpeg", ["-v", "error", "-y", "-i", P.file("brand", f), "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", dst]);
  }
  const candVid = P.file("brand", "candidates");
  if (fs.existsSync(candVid)) for (const f of fs.readdirSync(candVid).filter((f) => /^video-.*\.(mp4|webm|mov)$/i.test(f))) {
    const dst = path.join(A, f.replace(/\.(webm|mov)$/i, ".mp4"));
    if (!fs.existsSync(dst)) run("ffmpeg", ["-v", "error", "-y", "-i", path.join(candVid, f), "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", dst]);
  }

  // fonts: the brand's own files where captured, else the nearest bundled face
  const face = [];
  const fam = {};
  for (const role of ["display", "heading", "body"]) {
    const f = b.fonts?.[role];
    if (!f) continue;
    if (f.files?.length) {
      const name = `Brand ${role}`;
      for (const file of f.files) {
        const src = P.file("brand", file.file);
        if (!fs.existsSync(src)) continue;
        fs.copyFileSync(src, path.join(A, "fonts", path.basename(file.file)));
        // a variable file declares its full ranges, or font-stretch / 900 are faked
        const vr = String(file.weight).includes(" ") ? " font-stretch: 62% 125%;" : "";
        face.push(`@font-face { font-family: "${name}"; src: url("fonts/${path.basename(file.file)}"); font-weight: ${file.weight};${vr} font-style: normal; font-display: block; }`);
      }
      fam[role] = `"${name}", "${f.fallback}"`;
    } else fam[role] = `"${f.fallback}"`;
  }
  const c = b.colors;
  const css = `/* written by film-init.mjs from brand/brand.json (${b.name}, ${b.url}) */
  ${face.join("\n")}
  :root, #root {
    --ground: ${c.ground};
    --ink: ${c.ink};
    --accent: ${c.accent};
    --surface: ${c.surface};
    --muted: ${c.muted};
    --font-display: ${fam.display || fam.heading || '"Inter"'};
    --font-heading: ${fam.heading || fam.display || '"Inter"'};
    --font-body: ${fam.body || '"Inter"'};
    --display-weight: ${b.fonts?.display?.weight || 700};
    --radius: ${b.radius || "12px"};
  }
  `;
  fs.writeFileSync(path.join(A, "brand.css"), css);
  return fam;
};

/**
 * Open a page in the HyperFrames headless Chrome and talk to it over CDP.
 * fn(page) gets { evaluate(expr), send(method, params), screenshot(file, transparent) }.
 */
export const withPage = async (url, { width = 1920, height = 1080, gl = false } = {}, fn) => {
  const { spawn } = await import("node:child_process");
  const net = await import("node:net");
  const port = await new Promise((r) => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
  const flags = ["--headless", "--hide-scrollbars", "--allow-file-access-from-files", `--remote-debugging-port=${port}`, `--window-size=${width},${height}`];
  if (gl) flags.push("--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader");
  const chrome = spawn(chromePath(), [...flags, "about:blank"], { stdio: "ignore" });
  let ws;
  try {
    for (let i = 0; i < 60 && !ws; i++) { await new Promise((r) => setTimeout(r, 150)); try { const t = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = t.find((x) => x.type === "page"); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch {} }
    if (!ws) throw new Error("could not start headless Chrome");
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    let id = 0; const pending = new Map();
    ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    const evaluate = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result?.result?.value; };
    const screenshot = async (file, transparent = false) => {
      if (transparent) await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
      const r = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(file, Buffer.from(r.result.data, "base64"));
    };
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.enable"); await send("Page.navigate", { url });
    return await fn({ evaluate, send, screenshot });
  } finally { try { ws && ws.close(); } catch {} try { chrome.kill("SIGKILL"); } catch {} }
};
