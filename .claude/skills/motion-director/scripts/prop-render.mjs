#!/usr/bin/env node
// Render a real 3D prop (any glTF, e.g. a Poly Haven model) to a transparent,
// photoreal PNG: image-based lighting from an HDRI, ACES tone mapping, a soft
// key light, no ground. Use the PNG as a cut-out in a collage or as an object
// in an object-story shot, at exactly the angle the shot needs.
//
//   node prop-render.mjs <model.gltf> <out.png> [--hdri studio.hdr] [--size 1600]
//        [--rx -20] [--ry 35] [--rz 0] [--fov 30] [--exposure 1.0] [--fill 0.82]
//        [--screen shot.png] [--screen-mesh display]   (a device: put a real screenshot on its screen)
//
// rx/ry/rz rotate the model in degrees; the camera frames it to --fill of the
// image. Everything runs locally in the headless Chrome HyperFrames uses.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { die, run, withPage } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const [model, out] = argv.filter((a, i) => !a.startsWith("--") && !(argv[i - 1] || "").startsWith("--"));
if (!model || !out) die("usage: prop-render.mjs <model.gltf> <out.png> [--hdri f.hdr] [--rx --ry --rz] [--size]");
const size = +opt("--size", 1600), hdri = opt("--hdri", ""), screen = opt("--screen", ""), screenMesh = opt("--screen-mesh", "display");
const cfg = { rx: +opt("--rx", -20), ry: +opt("--ry", 35), rz: +opt("--rz", 0), fov: +opt("--fov", 30), exposure: +opt("--exposure", 1), fill: +opt("--fill", 0.82) };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "md-prop-"));
const mdir = path.dirname(path.resolve(model));
// three's loaders use fetch(), which Chrome refuses on file://: serve the files locally
const http = await import("node:http");
const parts = [mdir, hdri ? path.dirname(path.resolve(hdri)) : mdir, screen ? path.dirname(path.resolve(screen)) : mdir].map((p) => p.split(path.sep));
let k = 0; while (parts.every((p) => p[k] === parts[0][k]) && k < parts[0].length) k++;
const ROOT = parts[0].slice(0, k).join(path.sep) || "/";
const MIME = { ".gltf": "model/gltf+json", ".bin": "application/octet-stream", ".jpg": "image/jpeg", ".png": "image/png", ".hdr": "application/octet-stream", ".html": "text/html" };
const server = http.createServer((q, w) => { const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { w.writeHead(404); return w.end(); } w.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(w); });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;
const url = (f) => BASE + "/" + path.relative(ROOT, path.resolve(f)).split(path.sep).map(encodeURIComponent).join("/");
const html = `<!doctype html><html><body style="margin:0;background:transparent">
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/RGBELoader.js"></script>
<script>
const C = ${JSON.stringify(cfg)}, S = ${size}; const SCREEN = ${JSON.stringify(screen ? "SCREENURL" : "")}; const m0 = (o, f) => o.traverse(f);
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setSize(S, S); r.setClearColor(0x000000, 0); r.outputEncoding = THREE.sRGBEncoding;
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = C.exposure; r.physicallyCorrectLights = true;
document.body.appendChild(r.domElement);
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(C.fov, 1, 0.01, 1000);
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 5, 4); scene.add(key);
scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 0.6));
const done = () => { window.__ready = true; };
const load = (env) => new THREE.GLTFLoader().load(${JSON.stringify(url(model))}, (g) => {
  if (env) scene.environment = env;
  if (SCREEN) { const tex = new THREE.TextureLoader().load(SCREEN, () => {}); tex.encoding = THREE.sRGBEncoding; tex.flipY = false;
    m0(g.scene, (c) => { if (c.isMesh && c.name.replace(/\.\d+$/, "") === ${JSON.stringify(screenMesh)}) { const gg = c.geometry; gg.computeBoundingBox(); const bb = gg.boundingBox, pos = gg.attributes.position, uv = new Float32Array(pos.count * 2);
      const w = bb.max.x - bb.min.x || 1, h = bb.max.y - bb.min.y || 1; for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - bb.min.x) / w; uv[i * 2 + 1] = 1 - (pos.getY(i) - bb.min.y) / h; }
      gg.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); c.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); } }); }
  const m = g.scene; m.rotation.set(C.rx * Math.PI / 180, C.ry * Math.PI / 180, C.rz * Math.PI / 180);
  const box = new THREE.Box3().setFromObject(m), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  m.position.sub(c); scene.add(m);
  const rad = s.length() / 2, d = rad / Math.sin((C.fov * Math.PI / 180) / 2) * (0.92 / C.fill);
  cam.position.set(0, 0, d); cam.lookAt(0, 0, 0);
  setTimeout(() => { r.render(scene, cam); done(); }, 1500);
}, undefined, (e) => { document.title = "ERR " + e; done(); });
${hdri ? `new THREE.RGBELoader().load(${JSON.stringify(url(hdri))}, (t) => { t.mapping = THREE.EquirectangularReflectionMapping; const pm = new THREE.PMREMGenerator(r); load(pm.fromEquirectangular(t).texture); });` : "load(null);"}
</script></body></html>`;
const page = path.join(mdir, `.prop-${process.pid}.html`);
fs.writeFileSync(page, html.replace("SCREENURL", screen ? url(screen) : ""));
const raw = path.join(dir, "raw.png");
const err = await withPage(url(page), { width: size, height: size, gl: true }, async ({ evaluate, screenshot }) => {
  for (let i = 0; i < 150; i++) { if (await evaluate("!!window.__ready")) break; await new Promise((r) => setTimeout(r, 200)); }
  const title = await evaluate("document.title");
  await screenshot(raw, true);
  return title.startsWith("ERR") ? title : "";
});
fs.rmSync(page, { force: true }); server.close();
if (err) die(err);
if (!fs.existsSync(raw)) die("render failed");
// trim to the prop's own alpha, keep a small margin
const t = run("node", [path.join(path.dirname(new URL(import.meta.url).pathname), "trim-alpha.mjs"), raw, path.resolve(out), "--pad", "12"]);
if (t.code) die(t.err || t.out);
console.log(t.out.trim());
