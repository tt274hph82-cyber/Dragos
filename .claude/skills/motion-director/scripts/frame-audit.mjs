#!/usr/bin/env node
// Measure every frame for the defects a viewer sees at once, so they never ship:
//   - text outside the box it is printed on (a label, patch, ticket, card)
//   - text outside the frame (or the safe margin)
//   - two visible pieces of text overlapping each other
// Text inside an element marked data-bleed (tape, ticker) may run off the frame.
//
//   node frame-audit.mjs <dir with index.html> [--step 0.1] [--margin 24] [--strict]
//
// Opens the page in the same headless Chrome HyperFrames renders with, seeks the
// registered timeline to every step, and measures the real text boxes (Range
// rects, so wrapping and transforms count). Exits 1 with a list of
// "t=1.2s  #id  what" when anything is wrong. Run it before every render.
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { chromePath, die } from "./lib.mjs";

const argv = process.argv.slice(2);
const dir = path.resolve(argv.find((a) => !a.startsWith("--") && !/^[\d.]+$/.test(a)) || die("usage: frame-audit.mjs <dir>"));
const opt = (k, d) => (argv.includes(k) ? +argv[argv.indexOf(k) + 1] : d);
const STEP = opt("--step", 0.1), MARGIN = opt("--margin", 24), STRICT = argv.includes("--strict");
const html = path.join(dir, fs.existsSync(path.join(dir, "index.html")) ? "index.html" : "film/index.html");
if (!fs.existsSync(html)) die(`no index.html in ${dir}`);
const W = +(fs.readFileSync(html, "utf8").match(/data-width="(\d+)"/) || [0, 1920])[1];
const H = +(fs.readFileSync(html, "utf8").match(/data-height="(\d+)"/) || [0, 1080])[1];

const port = await new Promise((r) => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
const chrome = spawn(chromePath(), ["--headless", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const kill = () => { try { chrome.kill("SIGKILL"); } catch {} };
process.on("exit", kill);
let ws;
for (let i = 0; i < 60 && !ws; i++) {
  await new Promise((r) => setTimeout(r, 150));
  try { const t = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = t.find((x) => x.type === "page"); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch {}
}
if (!ws) die("could not start headless Chrome");
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result?.result?.value; };

await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.enable");
await send("Page.navigate", { url: "file://" + html });
let dur = 0;
for (let i = 0; i < 100; i++) { await new Promise((r) => setTimeout(r, 200)); dur = await evaluate(`(window.__timelines && window.__timelines.main && document.fonts.status === "loaded") ? window.__timelines.main.duration() : 0`).catch(() => 0); if (dur) break; }
if (!dur) die("the page never registered window.__timelines.main");
await new Promise((r) => setTimeout(r, 400));

// the probe runs inside the page at every step
const PROBE = `(() => {
  const W = ${W}, H = ${H}, M = ${MARGIN}, STRICT = ${STRICT};
  const vis = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
  const name = (el) => el.id ? "#" + el.id : (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/)[0] : el.tagName.toLowerCase()) + (el.parentElement && el.parentElement.id ? " in #" + el.parentElement.id : "");
  // a box that paints: a background colour/image or a class that names a printed surface
  const paints = (e) => { const cs = getComputedStyle(e); if ((cs.backgroundClip || cs.webkitBackgroundClip) === "text") return false; return (cs.backgroundColor && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(cs.backgroundColor)) || (cs.backgroundImage && cs.backgroundImage !== "none"); };
  const clipped = (el, r) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.overflow === "hidden" || cs.overflow === "clip") { const b = e.getBoundingClientRect(); if (r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom) return true; } } return false; };
  const texts = [];
  const tw = document.createTreeWalker(document.getElementById("root") || document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement; if (el.closest("svg, script, style")) continue;
    const o = vis(el); if (o < 0.35) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    const rs = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
    if (!rs.length) continue;
    const r = { left: Math.min(...rs.map((q) => q.left)), top: Math.min(...rs.map((q) => q.top)), right: Math.max(...rs.map((q) => q.right)), bottom: Math.max(...rs.map((q) => q.bottom)) };
    if (clipped(el, r)) continue;
    // a strip meant to run off the frame (tape, ticker, marquee) says so with data-bleed
    if (el.closest("[data-bleed]")) continue;
    // a deliberate layered title (a ghost word under a line) opts out of the overlap test
    if (el.closest("[data-layered]")) { texts.push({ el, r, o, txt: n.textContent.trim().slice(0, 28), layered: true }); continue; }
    texts.push({ el, r, o, txt: n.textContent.trim().slice(0, 28) });
  }
  const out = [];
  for (const t of texts) {
    const { r } = t, who = name(t.el) + ' "' + t.txt + '"';
    // 1. in frame
    // text that is still travelling (an entrance or exit across the edge), or that only just
    // appeared this frame, is allowed past the margin; it must be inside by the next frame
    const key = name(t.el) + "|" + t.txt, prev = (window.__faPrev || {})[key];
    const moving = !prev || (Math.abs(prev.left - r.left) > 6 || Math.abs(prev.top - r.top) > 6 || Math.abs((prev.right - prev.left) - (r.right - r.left)) > 6);
    (window.__faNext = window.__faNext || {})[key] = r;
    if (!moving && (r.left < M - 1 || r.top < M - 1 || r.right > W - M + 1 || r.bottom > H - M + 1)) out.push(who + " outside the frame margin (" + [r.left, r.top, r.right, r.bottom].map(Math.round).join(",") + ")");
    // 2. inside the box it is printed on: the nearest painting ancestor that is smaller than the frame
    for (let e = t.el; e && e.id !== "root" && e !== document.body; e = e.parentElement) {
      if (!paints(e)) continue; const b = e.getBoundingClientRect(); if (b.width >= W * 0.98 && b.height >= H * 0.98) break;
      const cs = getComputedStyle(e), pl = Math.min(parseFloat(cs.paddingLeft) || 0, 40) * 0.4, pt = Math.min(parseFloat(cs.paddingTop) || 0, 40) * 0.25;
      if (r.left < b.left + pl - 1 || r.right > b.right - pl + 1 || r.top < b.top + pt - 2 || r.bottom > b.bottom - pt + 2) out.push(who + " spills out of its box " + name(e));
      break;
    }
  }
  // 3. text on text, from different elements
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j]; if (a.layered || b.layered) continue; if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    // words of one text block (a split headline) are one unit
    const blk = (e) => e.closest(".md-line, h1, h2, h3, h4, p, li, [data-block]") || e;
    if (blk(a.el) === blk(b.el)) continue;
    // compare ink, not font boxes: a line box is ~20% taller than its glyphs at each edge
    const ink = (r) => { const h = (r.bottom - r.top) * 0.2; return { left: r.left, right: r.right, top: r.top + h, bottom: r.bottom - h }; };
    const A = ink(a.r), B = ink(b.r);
    const ix = Math.min(A.right, B.right) - Math.max(A.left, B.left), iy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (ix > 4 && iy > 4) out.push(name(a.el) + ' "' + a.txt + '" overlaps ' + name(b.el) + ' "' + b.txt + '"');
  }
  window.__faPrev = window.__faNext || {}; window.__faNext = {};
  return out;
})()`;

const found = new Map();
for (let t = 0; t <= dur - 0.001; t += STEP) {
  const tt = +t.toFixed(3);
  await evaluate(`window.__timelines.main.seek(${tt}, false); document.querySelectorAll("[data-start][data-duration]").forEach(e => { if (e.id === "root") return; const a = +e.dataset.start, d = +e.dataset.duration; e.style.visibility = (${tt} >= a && ${tt} < a + d) ? "" : "hidden"; }); 0`);
  for (const p of await evaluate(PROBE)) { if (!found.has(p)) found.set(p, []); found.get(p).push(tt); }
}
ws.close(); kill();
const fmt = (ts) => { const runs = []; let a = ts[0], b = ts[0]; for (const t of ts.slice(1)) { if (t - b <= STEP * 1.5) b = t; else { runs.push([a, b]); a = b = t; } } runs.push([a, b]); return runs.map(([x, y]) => (x === y ? `${x}s` : `${x}-${y}s`)).join(", "); };
const rows = [...found.entries()].sort((x, y) => x[1][0] - y[1][0]);
if (!rows.length) { console.log(`frame-audit: clean (${Math.round(dur / STEP)} frames checked, ${W}x${H}, margin ${MARGIN}px)`); process.exit(0); }
console.log(`frame-audit: ${rows.length} problem(s)`);
for (const [p, ts] of rows) console.log(`  ${fmt(ts).padEnd(16)} ${p}`);
process.exit(1);
