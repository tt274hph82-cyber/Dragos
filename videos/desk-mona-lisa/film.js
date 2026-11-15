// "The man who stole her": one continuous camera move over a detective's desk. Everything is drawn here with canvas 2D.
// The world is laid out in 4K pixels at zoom 1. window.seek(t) draws one frame; ?s=0.5 renders at half size for checks.
(() => {
  const W = 3840, H = 1646, FPS = 30;
  const S = +(new URLSearchParams(location.search).get('s') || 1);
  const T = window.TIMING, DUR = T.total;
  const cv = document.getElementById('screen'); cv.width = Math.round(W * S); cv.height = Math.round(H * S);
  const ctx = cv.getContext('2d');
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
  const eo = (p) => 1 - Math.pow(1 - clamp(p), 3), eio = (p) => { p = clamp(p); return p * p * p * (p * (p * 6 - 15) + 10); };
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const D2R = Math.PI / 180;
  // ---- narration times
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const L = Object.fromEntries(T.lines.map((l) => [l.id, l]));
  const ls = (id) => L[id].start, le = (id) => L[id].end;
  const wt = (id, word, nth = 0) => { const m = T.words.filter((w) => w.line === id && norm(w.w).startsWith(norm(word))); if (!m[nth]) throw new Error('no word ' + id + ' ' + word); return m[nth].s; };
  const CUES = []; const cue = (name, t, gain = 0) => { CUES.push({ name, t: +t.toFixed(3), gain }); return t; };
  const SERIF = '"Playfair Display", serif', TYPE = '"Special Elite", monospace', CAPS = 'Oswald, sans-serif';
  const INK = '#2a211a', RED = '#b3261e';

  // ---- drawing helpers
  function paper(c, w, h, base, seed, burn = 0.22) {
    const r = rng(seed); c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < (w * h) / 900; i++) { c.fillStyle = r() < 0.5 ? 'rgba(60,40,20,0.05)' : 'rgba(255,250,235,0.06)'; const s = 1 + r() * 3; c.fillRect(r() * w, r() * h, s, s); }
    for (let i = 0; i < 5; i++) { const x = r() * w, y = r() * h, rad = 60 + r() * Math.min(w, h) * 0.25, g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(120,85,40,0.07)'); g.addColorStop(1, 'rgba(120,85,40,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    const e = Math.min(w, h) * 0.12;
    [[0, 0, e, 0, 0, 0, e, h], [w, 0, w - e, 0, w - e, 0, e, h], [0, 0, 0, e, 0, 0, w, e], [0, h, 0, h - e, 0, h - e, w, e]].forEach(([x0, y0, x1, y1, rx, ry, rw, rh]) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(70,45,20,${burn})`); g.addColorStop(1, 'rgba(70,45,20,0)'); c.fillStyle = g; c.fillRect(rx, ry, rw, rh); });
  }
  const greyLines = (c, x, y, w, n, lh, th = 14, seed = 1, col = 'rgba(70,60,50,0.22)') => { const r = rng(seed); c.fillStyle = col; for (let i = 0; i < n; i++) c.fillRect(x, y + i * lh, w * (i === n - 1 ? 0.45 + r() * 0.3 : 0.88 + r() * 0.12), th); };
  function fitFont(c, text, weight, family, maxW, size) { c.font = `${weight} ${size}px ${family}`; const m = c.measureText(text).width; if (m > maxW) size *= maxW / m; c.font = `${weight} ${size}px ${family}`; return size; }
  // a sepia photo print: cream border, the scene, a vignette and grain
  function print(c, w, h, scene, seed) {
    const b = 46; paper(c, w, h, '#ece2c8', seed, 0.12);
    c.save(); c.beginPath(); c.rect(b, b, w - 2 * b, h - 2 * b - 30); c.clip(); c.translate(b, b); const iw = w - 2 * b, ih = h - 2 * b - 30;
    scene(c, iw, ih);
    const g = c.createRadialGradient(iw / 2, ih / 2, ih * 0.3, iw / 2, ih / 2, iw * 0.75); g.addColorStop(0, 'rgba(20,12,6,0)'); g.addColorStop(1, 'rgba(20,12,6,0.55)'); c.fillStyle = g; c.fillRect(0, 0, iw, ih);
    const r = rng(seed + 7); for (let i = 0; i < (iw * ih) / 260; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,240,210,0.07)' : 'rgba(20,10,0,0.08)'; const s = 1 + r() * 2.5; c.fillRect(r() * iw, r() * ih, s, s); }
    c.strokeStyle = 'rgba(255,245,220,0.10)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { c.beginPath(); const x = r() * iw; c.moveTo(x, r() * ih); c.lineTo(x + (r() - 0.5) * 40, r() * ih); c.stroke(); }
    c.restore();
    c.strokeStyle = 'rgba(60,40,20,0.35)'; c.lineWidth = 2; c.strokeRect(b, b, w - 2 * b, h - 2 * b - 30);
  }
  const SEP = { dk: '#231910', md: '#5e4a36', wall: '#8a7458', lt: '#cdb894', hi: '#f1e6cb' };
  function gilt(c, x, y, w, h, t, dark = '#3a2c1c') { // a picture frame, sepia
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 10, y + 14, w, h);
    const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#d8c193'); g.addColorStop(0.5, '#9c8358'); g.addColorStop(1, '#c9b283'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(40,25,10,0.5)'; c.lineWidth = Math.max(2, t * 0.12); c.strokeRect(x + t * 0.3, y + t * 0.3, w - t * 0.6, h - t * 0.6);
    c.fillStyle = dark; c.fillRect(x + t, y + t, w - 2 * t, h - 2 * t);
  }
  function hook(c, x, y, s = 1) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(x + 10 * s, y + 26 * s, 12 * s, 26 * s, 0.3, 0, 7); c.fill(); c.fillStyle = '#1c130c'; c.beginPath(); c.arc(x, y, 13 * s, 0, 7); c.fill(); c.fillRect(x - 5 * s, y, 10 * s, 34 * s); c.fillStyle = '#6d5a44'; c.beginPath(); c.arc(x - 4 * s, y - 4 * s, 4 * s, 0, 7); c.fill(); }
  // a figure seen from behind (feet at x,y; height hh)
  function back(c, x, y, hh, o = {}) {
    const col = o.col || SEP.dk, w = hh * (o.wide || 0.3);
    c.save(); c.translate(x, y);
    c.fillStyle = o.legs || col; c.fillRect(-w * 0.42, -hh * 0.42, w * 0.36, hh * 0.42); c.fillRect(w * 0.06, -hh * 0.42, w * 0.36, hh * 0.42);
    c.fillStyle = col; c.beginPath(); c.moveTo(-w * 0.5, -hh * 0.8); c.quadraticCurveTo(0, -hh * 0.9, w * 0.5, -hh * 0.8); c.lineTo(w * (o.skirt || 0.56), -hh * (o.hem || 0.34)); c.lineTo(-w * (o.skirt || 0.56), -hh * (o.hem || 0.34)); c.closePath(); c.fill();
    if (o.arm) { c.strokeStyle = col; c.lineWidth = w * 0.24; c.lineCap = 'round'; c.beginPath(); c.moveTo(w * 0.42, -hh * 0.76); c.lineTo(w * 0.78, -hh * 0.62); c.lineTo(w * 1.0, -hh * 0.8); c.stroke(); }
    c.fillStyle = o.neck || '#a68a66'; c.fillRect(-w * 0.12, -hh * 0.87, w * 0.24, hh * 0.06);
    c.fillStyle = o.hair || '#1a120b'; c.beginPath(); c.ellipse(0, -hh * 0.925, hh * 0.07, hh * 0.08, 0, 0, 7); c.fill();
    if (o.hat === 'cap') { c.fillStyle = o.hatCol || '#3a2d20'; c.beginPath(); c.ellipse(0, -hh * 0.975, hh * 0.085, hh * 0.035, 0, 0, 7); c.fill(); }
    if (o.hat === 'bowler') { c.fillStyle = '#120c07'; c.beginPath(); c.ellipse(0, -hh * 0.965, hh * 0.115, hh * 0.022, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, -hh * 0.985, hh * 0.07, hh * 0.06, 0, Math.PI, 0); c.fill(); }
    if (o.hat === 'wide') { c.fillStyle = o.hatCol || '#2c2118'; c.beginPath(); c.ellipse(0, -hh * 0.975, hh * 0.16, hh * 0.035, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, -hh * 0.995, hh * 0.08, hh * 0.04, 0, 0, 7); c.fill(); }
    c.restore();
  }
  // the stolen painting, small (used inside the gallery print and on the easel of the big one)
  function lady(c, x, y, w, h) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(x, y);
    const sky = c.createLinearGradient(0, 0, 0, h * 0.6); sky.addColorStop(0, '#6f8478'); sky.addColorStop(1, '#a9a27a'); c.fillStyle = sky; c.fillRect(0, 0, w, h);
    c.fillStyle = '#5f7a6c'; c.beginPath(); c.moveTo(0, h * 0.34); c.bezierCurveTo(w * 0.1, h * 0.22, w * 0.2, h * 0.3, w * 0.3, h * 0.27); c.lineTo(w * 0.3, h * 0.7); c.lineTo(0, h * 0.7); c.fill();
    c.beginPath(); c.moveTo(w, h * 0.3); c.bezierCurveTo(w * 0.9, h * 0.2, w * 0.8, h * 0.3, w * 0.68, h * 0.25); c.lineTo(w * 0.68, h * 0.7); c.lineTo(w, h * 0.7); c.fill();
    c.fillStyle = '#6f6a44'; c.fillRect(0, h * 0.42, w, h * 0.3);
    c.strokeStyle = '#b5a570'; c.lineWidth = w * 0.02; c.beginPath(); c.moveTo(w * 0.04, h * 0.58); c.bezierCurveTo(w * 0.16, h * 0.5, w * 0.06, h * 0.46, w * 0.2, h * 0.4); c.stroke();
    c.strokeStyle = '#8fa69a'; c.beginPath(); c.moveTo(w * 0.96, h * 0.52); c.bezierCurveTo(w * 0.84, h * 0.47, w * 0.94, h * 0.42, w * 0.8, h * 0.38); c.stroke();
    // dress and shoulders
    c.fillStyle = '#1f2018'; c.beginPath(); c.moveTo(w * 0.02, h); c.bezierCurveTo(w * 0.04, h * 0.62, w * 0.24, h * 0.5, w * 0.4, h * 0.47); c.lineTo(w * 0.62, h * 0.47); c.bezierCurveTo(w * 0.8, h * 0.5, w * 0.97, h * 0.62, w * 0.98, h); c.fill();
    // hair and veil
    c.fillStyle = '#17120c'; c.beginPath(); c.moveTo(w * 0.5, h * 0.07); c.bezierCurveTo(w * 0.26, h * 0.06, w * 0.24, h * 0.32, w * 0.27, h * 0.52); c.lineTo(w * 0.42, h * 0.56); c.lineTo(w * 0.6, h * 0.56); c.lineTo(w * 0.74, h * 0.52); c.bezierCurveTo(w * 0.77, h * 0.3, w * 0.74, h * 0.06, w * 0.5, h * 0.07); c.fill();
    // chest, neck, face
    const skin = c.createLinearGradient(w * 0.35, 0, w * 0.68, 0); skin.addColorStop(0, '#e2c58c'); skin.addColorStop(1, '#b8935c');
    c.fillStyle = skin; c.beginPath(); c.moveTo(w * 0.35, h * 0.535); c.quadraticCurveTo(w * 0.5, h * 0.455, w * 0.66, h * 0.535); c.quadraticCurveTo(w * 0.5, h * 0.63, w * 0.35, h * 0.535); c.fill();
    c.beginPath(); c.moveTo(w * 0.45, h * 0.34); c.lineTo(w * 0.56, h * 0.34); c.lineTo(w * 0.585, h * 0.5); c.lineTo(w * 0.425, h * 0.5); c.fill();
    c.fillStyle = 'rgba(70,40,10,0.4)'; c.beginPath(); c.ellipse(w * 0.505, h * 0.39, w * 0.075, h * 0.035, 0, 0, 7); c.fill(); c.fillStyle = skin;
    c.beginPath(); c.ellipse(w * 0.5, h * 0.25, w * 0.135, h * 0.135, 0, 0, 7); c.fill();
    c.fillStyle = '#17120c'; c.beginPath(); c.moveTo(w * 0.5, h * 0.105); c.bezierCurveTo(w * 0.42, h * 0.11, w * 0.365, h * 0.17, w * 0.36, h * 0.27); c.bezierCurveTo(w * 0.33, h * 0.16, w * 0.4, h * 0.07, w * 0.5, h * 0.075); c.bezierCurveTo(w * 0.6, h * 0.07, w * 0.67, h * 0.16, w * 0.64, h * 0.27); c.bezierCurveTo(w * 0.635, h * 0.17, w * 0.58, h * 0.11, w * 0.5, h * 0.105); c.fill();
    const fs = c.createLinearGradient(w * 0.36, 0, w * 0.64, 0); fs.addColorStop(0, 'rgba(60,35,10,0)'); fs.addColorStop(1, 'rgba(60,35,10,0.35)'); c.fillStyle = fs; c.beginPath(); c.ellipse(w * 0.5, h * 0.25, w * 0.135, h * 0.135, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(60,35,15,0.75)'; c.beginPath(); c.ellipse(w * 0.445, h * 0.24, w * 0.027, h * 0.009, 0, 0, 7); c.ellipse(w * 0.56, h * 0.24, w * 0.027, h * 0.009, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(80,45,20,0.6)'; c.lineWidth = Math.max(1, w * 0.008); c.beginPath(); c.moveTo(w * 0.505, h * 0.24); c.lineTo(w * 0.515, h * 0.29); c.stroke();
    c.beginPath(); c.moveTo(w * 0.455, h * 0.322); c.quadraticCurveTo(w * 0.505, h * 0.338, w * 0.56, h * 0.316); c.stroke();
    // hands
    c.fillStyle = skin; c.beginPath(); c.ellipse(w * 0.47, h * 0.86, w * 0.17, h * 0.045, -0.12, 0, 7); c.fill(); c.beginPath(); c.ellipse(w * 0.56, h * 0.9, w * 0.15, h * 0.04, 0.1, 0, 7); c.fill();
    c.fillStyle = 'rgba(70,50,10,0.22)'; c.fillRect(0, 0, w, h); // old varnish
    const v = c.createRadialGradient(w * 0.5, h * 0.4, h * 0.2, w * 0.5, h * 0.5, h * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(15,10,0,0.6)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
    c.restore();
  }
  const sepiaOver = (c, x, y, w, h) => { c.save(); c.globalCompositeOperation = 'color'; c.fillStyle = '#8a6f4c'; c.fillRect(x, y, w, h); c.restore(); };
  // police portrait
  function portrait(c, w, h, o) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9a8468'); g.addColorStop(1, '#6b573f'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const cx = w / 2, sk = '#d2b78c', skd = '#a98a61';
    c.fillStyle = o.coat || '#1f1710'; c.beginPath(); c.moveTo(-w * 0.05, h); c.bezierCurveTo(0, h * 0.72, w * 0.2, h * 0.68, cx - w * 0.12, h * 0.63); c.lineTo(cx + w * 0.12, h * 0.63); c.bezierCurveTo(w * 0.8, h * 0.68, w, h * 0.72, w * 1.05, h); c.fill();
    c.fillStyle = '#e9dfc8'; c.beginPath(); c.moveTo(cx - w * 0.11, h * 0.64); c.lineTo(cx, h * 0.86); c.lineTo(cx + w * 0.11, h * 0.64); c.fill();
    c.fillStyle = o.tie || '#2a1f18'; c.beginPath(); c.moveTo(cx - w * 0.03, h * 0.69); c.lineTo(cx + w * 0.03, h * 0.69); c.lineTo(cx + w * 0.045, h * 0.9); c.lineTo(cx - w * 0.045, h * 0.9); c.fill();
    c.fillStyle = skd; c.fillRect(cx - w * 0.085, h * 0.5, w * 0.17, h * 0.17);
    c.fillStyle = sk; c.beginPath(); c.ellipse(cx - w * 0.2, h * 0.39, w * 0.03, h * 0.05, 0, 0, 7); c.ellipse(cx + w * 0.2, h * 0.39, w * 0.03, h * 0.05, 0, 0, 7); c.fill();
    const fg = c.createLinearGradient(cx - w * 0.2, 0, cx + w * 0.2, 0); fg.addColorStop(0, '#dcc299'); fg.addColorStop(1, '#b3946a'); c.fillStyle = fg;
    c.beginPath(); c.moveTo(cx - w * 0.19, h * 0.3); c.bezierCurveTo(cx - w * 0.2, h * 0.5, cx - w * 0.12, h * 0.6, cx, h * 0.61); c.bezierCurveTo(cx + w * 0.12, h * 0.6, cx + w * 0.2, h * 0.5, cx + w * 0.19, h * 0.3); c.bezierCurveTo(cx + w * 0.18, h * 0.14, cx - w * 0.18, h * 0.14, cx - w * 0.19, h * 0.3); c.fill();
    c.fillStyle = o.hairCol || '#17100a';
    if (o.hair === 'fringe') { c.beginPath(); c.moveTo(cx - w * 0.21, h * 0.36); c.bezierCurveTo(cx - w * 0.25, h * 0.1, cx + w * 0.25, h * 0.08, cx + w * 0.21, h * 0.36); c.bezierCurveTo(cx + w * 0.19, h * 0.24, cx + w * 0.14, h * 0.2, cx + w * 0.08, h * 0.2); c.bezierCurveTo(cx, h * 0.24, cx - w * 0.08, h * 0.33, cx - w * 0.18, h * 0.3); c.fill(); }
    else { c.beginPath(); c.moveTo(cx - w * 0.2, h * 0.34); c.bezierCurveTo(cx - w * 0.24, h * 0.1, cx + w * 0.24, h * 0.1, cx + w * 0.2, h * 0.34); c.bezierCurveTo(cx + w * 0.17, h * 0.22, cx + w * 0.05, h * 0.2, cx - w * 0.05, h * 0.215); c.bezierCurveTo(cx - w * 0.13, h * 0.22, cx - w * 0.18, h * 0.26, cx - w * 0.2, h * 0.34); c.fill(); }
    c.strokeStyle = '#17100a'; c.lineCap = 'round'; c.lineWidth = w * 0.02; c.beginPath(); c.moveTo(cx - w * 0.14, h * 0.345); c.quadraticCurveTo(cx - w * 0.09, h * 0.325, cx - w * 0.04, h * 0.345); c.moveTo(cx + w * 0.04, h * 0.345); c.quadraticCurveTo(cx + w * 0.09, h * 0.325, cx + w * 0.14, h * 0.345); c.stroke();
    const ey = o.eye || 1; c.fillStyle = '#120c07'; c.beginPath(); c.ellipse(cx - w * 0.088, h * 0.385, w * 0.027 * ey, h * 0.014 * ey, 0, 0, 7); c.ellipse(cx + w * 0.088, h * 0.385, w * 0.027 * ey, h * 0.014 * ey, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(90,60,30,0.55)'; c.lineWidth = w * 0.012; c.beginPath(); c.moveTo(cx + w * 0.008, h * 0.39); c.lineTo(cx + w * 0.03, h * 0.47); c.lineTo(cx - w * 0.012, h * 0.475); c.stroke();
    if (o.mustache) { c.fillStyle = '#17100a'; c.beginPath(); c.moveTo(cx, h * 0.495); c.bezierCurveTo(cx - w * 0.06, h * 0.475, cx - w * 0.13, h * 0.5, cx - w * 0.165, h * 0.535); c.bezierCurveTo(cx - w * 0.1, h * 0.535, cx - w * 0.05, h * 0.525, cx, h * 0.515); c.bezierCurveTo(cx + w * 0.05, h * 0.525, cx + w * 0.1, h * 0.535, cx + w * 0.165, h * 0.535); c.bezierCurveTo(cx + w * 0.13, h * 0.5, cx + w * 0.06, h * 0.475, cx, h * 0.495); c.fill(); }
    c.strokeStyle = 'rgba(70,35,20,0.7)'; c.lineWidth = w * 0.012; c.beginPath(); c.moveTo(cx - w * 0.05, h * (o.mustache ? 0.545 : 0.53)); c.quadraticCurveTo(cx, h * (o.mustache ? 0.552 : 0.54), cx + w * 0.05, h * (o.mustache ? 0.545 : 0.53)); c.stroke();
    sepiaOver(c, 0, 0, w, h);
    const v = c.createRadialGradient(cx, h * 0.45, h * 0.3, cx, h * 0.5, h * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(15,8,0,0.5)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
  }
  function fingerprint(c, x, y, r, seed) { const rr = rng(seed); c.save(); c.translate(x, y); c.strokeStyle = 'rgba(40,30,25,0.5)'; c.lineWidth = r * 0.035; for (let i = 1; i < 11; i++) { c.beginPath(); c.ellipse(0, (10 - i) * r * 0.02, r * i / 11 * 0.8, r * i / 11, 0, rr() * 0.6, Math.PI * 2 - rr() * 0.6); c.stroke(); } c.restore(); }
  function policeCard(c, w, h, o, seed) {
    paper(c, w, h, '#dccfae', seed, 0.18);
    const pw = h * 0.74 * 0.82, ph = h * 0.74;
    c.save(); c.translate(60, 60); c.beginPath(); c.rect(0, 0, pw, ph); c.clip(); portrait(c, pw, ph, o); c.restore();
    c.strokeStyle = 'rgba(40,25,10,0.6)'; c.lineWidth = 3; c.strokeRect(60, 60, pw, ph);
    const x = 60 + pw + 70; c.fillStyle = 'rgba(70,60,50,0.3)'; c.fillRect(x, 70, 260, 22);
    greyLines(c, x, 150, w - x - 70, 3, 62, 16, seed + 1);
    c.strokeStyle = 'rgba(70,60,50,0.35)'; c.lineWidth = 3; c.strokeRect(w - 320, ph - 210, 250, 270); fingerprint(c, w - 195, ph - 75, 105, seed + 2);
    c.strokeStyle = 'rgba(70,60,50,0.4)'; c.beginPath(); c.moveTo(60, h - 58); c.lineTo(w - 60, h - 58); c.stroke();
  }
  // typed text: letters arrive one by one; the layout never shifts
  function typed(c, text, x, y, size, t, t0, o = {}) {
    if (t < t0) return; const n = Math.min(text.length, Math.floor((t - t0) * (o.cps || 24)) + 1);
    c.save(); c.font = `${o.weight || 400} ${size}px ${o.font || TYPE}`; c.letterSpacing = (o.ls || 0) + 'px'; c.textBaseline = 'alphabetic';
    const full = c.measureText(text).width; const x0 = o.align === 'center' ? x - full / 2 : x;
    c.fillStyle = o.col || INK; c.textAlign = 'left'; c.fillText(text.slice(0, n), x0, y); c.restore();
  }
  function stamp(c, text, x, y, size, rot, t, t0, col = RED) {
    if (t < t0) return; const p = clamp((t - t0) / 0.13), k = 1 + 1.6 * (1 - p) * (1 - p);
    c.save(); c.translate(x, y); c.rotate(rot * D2R); c.scale(k, k); c.globalAlpha *= 0.88 * p;
    c.font = `700 ${size}px ${CAPS}`; c.letterSpacing = size * 0.06 + 'px'; const w = c.measureText(text).width + size * 0.7, h = size * 1.45;
    c.strokeStyle = col; c.lineWidth = size * 0.09; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, size * 0.14); c.stroke();
    c.lineWidth = size * 0.03; c.beginPath(); c.roundRect(-w / 2 + size * 0.13, -h / 2 + size * 0.13, w - size * 0.26, h - size * 0.26, size * 0.08); c.stroke();
    c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, size * 0.03, size * 0.06); c.restore();
  }
  function pin(c, x, y, t, t0, s = 1) {
    if (t < t0) return; const p = eo((t - t0) / 0.3), lift = (1 - p) * 220 * s;
    c.save(); c.translate(x, y);
    c.fillStyle = `rgba(0,0,0,${0.35 * p})`; c.beginPath(); c.ellipse(26 * s + lift * 0.5, 30 * s + lift * 0.6, 44 * s, 22 * s, 0.5, 0, 7); c.fill();
    c.translate(0, -lift); c.strokeStyle = '#8d8d8d'; c.lineWidth = 7 * s; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -40 * s); c.stroke();
    const g = c.createRadialGradient(-12 * s, -66 * s, 4 * s, 0, -52 * s, 42 * s); g.addColorStop(0, '#ff7a6b'); g.addColorStop(0.5, '#cf2a1f'); g.addColorStop(1, '#7c120c'); c.fillStyle = g; c.beginPath(); c.arc(0, -52 * s, 40 * s, 0, 7); c.fill(); c.restore();
  }
  // a polyline drawn up to fraction k
  function trace(c, pts, k, dash) {
    if (k <= 0) return null; let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let left = tot * clamp(k), head = pts[0]; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) { const d = seg[i - 1]; if (d <= left) { c.lineTo(pts[i][0], pts[i][1]); head = pts[i]; left -= d; } else { const f = left / d; head = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; c.lineTo(head[0], head[1]); left = 0; } }
    c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); return head;
  }
  const smooth = (p, n = 14) => { const out = []; for (let i = 0; i < p.length - 1; i++) { const a = p[Math.max(0, i - 1)], b = p[i], d = p[i + 1], e = p[Math.min(p.length - 1, i + 2)]; for (let j = 0; j < n; j++) { const s = j / n, s2 = s * s, s3 = s2 * s; out.push([0.5 * (2 * b[0] + (d[0] - a[0]) * s + (2 * a[0] - 5 * b[0] + 4 * d[0] - e[0]) * s2 + (3 * b[0] - a[0] - 3 * d[0] + e[0]) * s3), 0.5 * (2 * b[1] + (d[1] - a[1]) * s + (2 * a[1] - 5 * b[1] + 4 * d[1] - e[1]) * s2 + (3 * b[1] - a[1] - 3 * d[1] + e[1]) * s3)]); } } out.push(p[p.length - 1]); return out; };

  // ---- the items on the desk
  const items = []; const byId = {};
  const item = (o) => { items.push(o); byId[o.id] = o; o.lit = o.lit || []; return o; };
  const drop = (t) => { cue('paper', t + 0.3); return t; };
  // local -> world for a point on an item
  const at = (it, lx, ly) => { const a = it.rot * D2R, dx = lx - it.w / 2, dy = ly - it.h / 2; return [it.x + dx * Math.cos(a) - dy * Math.sin(a), it.y + dx * Math.sin(a) + dy * Math.cos(a)]; };

  // times
  const tLouvre = wt('paris', 'Louvre'), tClosed = wt('paris', 'closed') + 0.12, tAug = wt('paris', 'August');
  const tGallery = drop(ls('smock') - 0.35), tHooks = drop(wt('lift', 'off') - 0.3), tCal = drop(ls('day') - 0.3), tFlip = wt('day', 'more') + 0.05;
  const tNews = drop(wt('news', 'front') - 0.4), tBorder = ls('borders') + 0.15, tPic = drop(ls('picasso') - 0.25), tQ = wt('picasso', 'question') + 0.1, tPablo = wt('picasso', 'Pablo');
  const tCrowd = drop(ls('crowds') - 0.3), tRoute = wt('miles', 'About'), tAway = wt('miles', 'away'), tTwo = wt('miles', 'two');
  const tTrunk = drop(wt('trunk', 'trunk') - 0.35), tYears = ls('years'), tMug = drop(ls('name') - 0.3), tVin = wt('name', 'Vincenzo'), tHelp = wt('name', 'helped') + 0.1;
  const tRail = ls('italy') + 0.7, tFlor = wt('italy', 'Florence'), tTele = drop(ls('dealer') - 0.3), tArrest = wt('dealer', 'police') + 0.12;
  const tSlip = drop(ls('months') - 0.3), tSeven = wt('months', 'seven'), tPaint = drop(wt('twist', 'twist') - 0.3), tAll = wt('famous', 'made');
  cue('type', tAug); cue('pin', tLouvre + 0.25); cue('stamp', tClosed); cue('page', tFlip); cue('scratch', tBorder); cue('stamp', tQ); cue('type', tPablo);
  cue('scratch', tRoute); cue('pin', tAway + 0.25); cue('tick', tYears + 0.05); cue('tick', wt('years', 'over')); cue('tick', wt('years', 'two') + 0.1); cue('type', tVin); cue('stamp', tHelp);
  cue('train', tRail); cue('pin', tFlor + 0.25); cue('stamp', tArrest); cue('type', tSeven); cue('shimmer', tPaint + 0.3); cue('boom', tAll);

  // Europe map
  const MAPW = 7400, MAPH = 4750;
  const proj = (lon, lat) => [(lon + 8) / 28 * MAPW, (53 - lat) / 12.5 * MAPH];
  const ring = (c, r) => { r.forEach(([a, b], i) => { const [x, y] = proj(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); };
  const francePts = window.MAP.france[0].map(([a, b]) => proj(a, b));
  const fStart = francePts.reduce((bi, p, i) => (p[1] < francePts[bi][1] ? i : bi), 0); const franceLoop = francePts.slice(fStart).concat(francePts.slice(0, fStart + 1));
  const rail = smooth([[2.35, 48.86], [5.04, 47.32], [4.84, 45.76], [6.66, 45.2], [7.69, 45.07], [8.93, 44.41], [10.4, 43.72], [11.25, 43.77]].map(([a, b]) => proj(a, b)));
  const map = item({ id: 'map', x: 10700, y: 3000, w: MAPW, h: MAPH, rot: 0.6, t0: -1,
    paint(c, w, h) {
      paper(c, w, h, '#cfc6a6', 11, 0.3);
      c.save(); c.beginPath(); window.MAP.land.forEach((r) => ring(c, r));
      c.lineJoin = 'round'; [[150, 0.05], [100, 0.06], [60, 0.07], [28, 0.09]].forEach(([lw, a]) => { c.strokeStyle = `rgba(70,90,95,${a})`; c.lineWidth = lw; c.stroke(); });
      c.fillStyle = '#e7dab4'; c.fill(); c.strokeStyle = '#5a4630'; c.lineWidth = 5; c.stroke(); c.restore();
      c.save(); c.beginPath(); window.MAP.land.forEach((r) => ring(c, r)); c.clip();
      const r = rng(5); for (let i = 0; i < 2600; i++) { c.fillStyle = 'rgba(90,60,30,0.05)'; const s = 2 + r() * 5; c.fillRect(r() * w, r() * h, s, s); }
      c.strokeStyle = 'rgba(90,70,45,0.55)'; c.lineWidth = 4; c.setLineDash([26, 18]); window.MAP.borders.forEach((l) => { c.beginPath(); l.forEach(([a, b], i) => { const [x, y] = proj(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); }); c.setLineDash([]); c.restore();
      c.strokeStyle = 'rgba(80,65,45,0.14)'; c.lineWidth = 2; for (let lon = -6; lon < 20; lon += 2) { const [x] = proj(lon, 0); c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let lat = 42; lat < 53; lat += 2) { const [, y] = proj(0, lat); c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.fillStyle = 'rgba(70,50,30,0.3)'; c.textAlign = 'center'; c.font = `700 190px ${SERIF}`; c.letterSpacing = '150px'; let p = proj(2.2, 46.3); c.fillText('FRANCE', p[0] + 75, p[1]); p = proj(12.6, 42.3); c.save(); c.translate(p[0], p[1]); c.rotate(0.75); c.font = `700 150px ${SERIF}`; c.letterSpacing = '110px'; c.fillText('ITALY', 0, 0); c.restore(); c.letterSpacing = '0px';
      [[2.35, 48.86], [11.25, 43.77]].forEach(([a, b]) => { const [x, y] = proj(a, b); c.fillStyle = '#e7dab4'; c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.arc(x, y, 26, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); });
      [0.25, 0.5, 0.75].forEach((f) => { const g = c.createLinearGradient(w * f - 30, 0, w * f + 30, 0); g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(0.5, 'rgba(60,40,20,0.16)'); g.addColorStop(0.55, 'rgba(255,250,230,0.14)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fillRect(w * f - 30, 0, 60, h); });
      const g = c.createLinearGradient(0, h / 2 - 30, 0, h / 2 + 30); g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(0.5, 'rgba(60,40,20,0.16)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fillRect(0, h / 2 - 30, w, 60);
      c.strokeStyle = 'rgba(60,40,20,0.5)'; c.lineWidth = 8; c.strokeRect(70, 70, w - 140, h - 140);
    },
    dyn(c, t) {
      // the borders close: France traced in red
      const kb = eio((t - tBorder) / 1.15), fade = 1 - clamp((t - (ls('picasso') + 1.5)) / 2) * 0.9;
      if (kb > 0) { c.save(); c.globalAlpha *= fade; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = 'rgba(179,38,30,0.25)'; c.lineWidth = 70; trace(c, franceLoop, kb); c.strokeStyle = RED; c.lineWidth = 24; trace(c, franceLoop, kb); c.restore(); }
      // the train home
      const kr = eio((t - tRail) / (tFlor - tRail));
      if (kr > 0) { c.save(); c.lineCap = 'round'; c.strokeStyle = '#1f1711'; c.lineWidth = 20; const head = trace(c, rail, kr, [46, 34]); if (kr < 1) { c.fillStyle = RED; c.beginPath(); c.arc(head[0], head[1], 30, 0, 7); c.fill(); } c.restore(); }
      const f = proj(11.25, 43.77); pin(c, f[0], f[1], t, tFlor, 1.5);
      typed(c, 'FLORENCE', f[0] + 110, f[1] + 40, 230, t, tFlor + 0.05, { font: CAPS, weight: 700, ls: 14, cps: 30 });
    } });

  // Paris city sheet
  const LOUVRE = [1380, 1560], ROOM = [2520, 760];
  const route = smooth([LOUVRE, [1700, 1380], [1980, 1200], [2260, 940], ROOM].map((p, i) => (i === 0 ? [p[0] + 60, p[1] - 40] : p)));
  const paris = item({ id: 'paris', x: 2600, y: 2000, w: 3600, h: 2600, rot: -1.5, t0: -1,
    paint(c, w, h) {
      paper(c, w, h, '#e9dcba', 21, 0.26);
      const r = rng(77);
      c.save(); c.beginPath(); c.ellipse(w * 0.52, h * 0.5, w * 0.44, h * 0.44, 0, 0, 7); c.clip();
      c.fillStyle = 'rgba(205,188,150,0.55)'; c.fillRect(0, 0, w, h);
      c.lineCap = 'round'; for (let fam = 0; fam < 2; fam++) for (let i = 0; i < 26; i++) { const big = i % 5 === 0; c.strokeStyle = big ? '#fbf3dc' : 'rgba(251,243,220,0.75)'; c.lineWidth = big ? 22 : 8; const a0 = (fam ? -1.28 : 0.22) + (r() - 0.5) * 0.16, d = (i - 13) * 150 + (r() - 0.5) * 60, nx = -Math.sin(a0), ny = Math.cos(a0), cx0 = w * 0.52 + nx * d, cy0 = h * 0.5 + ny * d; c.beginPath(); c.moveTo(cx0 - Math.cos(a0) * 2400, cy0 - Math.sin(a0) * 2400); c.lineTo(cx0 + Math.cos(a0) * 2400, cy0 + Math.sin(a0) * 2400); c.stroke(); }
      // the Seine
      const seine = () => { c.beginPath(); c.moveTo(w * 1.0, h * 0.74); c.bezierCurveTo(w * 0.78, h * 0.66, w * 0.62, h * 0.72, w * 0.5, h * 0.66); c.bezierCurveTo(w * 0.4, h * 0.61, w * 0.3, h * 0.6, w * 0.22, h * 0.72); c.bezierCurveTo(w * 0.17, h * 0.8, w * 0.1, h * 0.9, w * 0.0, h * 0.88); };
      c.strokeStyle = '#6e8a8a'; c.lineWidth = 104; seine(); c.stroke(); c.strokeStyle = '#a9bdb6'; c.lineWidth = 88; seine(); c.stroke();
      c.fillStyle = '#e9dcba'; c.strokeStyle = '#6e8a8a'; c.lineWidth = 6; c.beginPath(); c.ellipse(w * 0.545, h * 0.688, 120, 30, 0.22, 0, 7); c.fill(); c.stroke();
      c.restore();
      c.strokeStyle = 'rgba(70,50,30,0.6)'; c.lineWidth = 7; c.setLineDash([30, 16]); c.beginPath(); c.ellipse(w * 0.52, h * 0.5, w * 0.44, h * 0.44, 0, 0, 7); c.stroke(); c.setLineDash([]);
      // the Louvre: a long palace on the north bank
      c.save(); c.translate(LOUVRE[0], LOUVRE[1]); c.rotate(0.2); c.fillStyle = '#7c2d20'; c.fillRect(-190, -52, 380, 30); c.fillRect(-190, 22, 380, 30); c.fillRect(160, -52, 30, 104); c.fillRect(-190, -52, 30, 104); c.fillRect(-40, -52, 26, 104); c.restore();
      // title
      c.strokeStyle = INK; c.lineWidth = 8; c.fillStyle = '#efe4c6'; c.fillRect(170, 170, 1150, 420); c.strokeRect(170, 170, 1150, 420); c.lineWidth = 3; c.strokeRect(192, 192, 1106, 376);
      c.fillStyle = INK; c.textAlign = 'center'; c.font = `900 250px ${SERIF}`; c.letterSpacing = '40px'; c.fillText('PARIS', 765, 470); c.letterSpacing = '0px';
      [0.33, 0.66].forEach((f) => { const g = c.createLinearGradient(w * f - 26, 0, w * f + 26, 0); g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(0.5, 'rgba(60,40,20,0.18)'); g.addColorStop(0.56, 'rgba(255,250,230,0.16)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fillRect(w * f - 26, 0, 52, h); });
    },
    dyn(c, t) {
      typed(c, 'AUGUST 1911', 745, 760, 150, t, tAug, { align: 'center', cps: 16 });
      const kr = eio((t - tRoute) / (tAway - tRoute + 0.25));
      if (kr > 0) { c.save(); c.lineCap = 'round'; c.strokeStyle = RED; c.lineWidth = 18; trace(c, route, kr, [44, 32]); c.restore(); }
      typed(c, '2 MILES', 1560, 900, 210, t, tTwo, { font: CAPS, weight: 700, ls: 10, col: RED, cps: 30 });
      pin(c, LOUVRE[0], LOUVRE[1], t, tLouvre, 1.3); pin(c, ROOM[0], ROOM[1], t, tAway, 1.3);
      typed(c, 'THE LOUVRE', LOUVRE[0] + 250, LOUVRE[1] + 40, 170, t, tLouvre + 0.1, { font: CAPS, weight: 700, ls: 10, cps: 30 });
      const fade = 1 - clamp((t - ls('smock')) / 1); if (fade > 0) { c.save(); c.globalAlpha *= fade; stamp(c, 'CLOSED', LOUVRE[0] + 640, LOUVRE[1] + 300, 190, -7, t, tClosed); c.restore(); }
    } });

  item({ id: 'gallery', x: 1500, y: 4700, w: 1500, h: 1150, rot: -4, t0: tGallery,
    paint(c, w, h) { print(c, w, h, (c, iw, ih) => {
      const g = c.createLinearGradient(0, 0, 0, ih); g.addColorStop(0, '#7d6a50'); g.addColorStop(1, '#9a8565'); c.fillStyle = g; c.fillRect(0, 0, iw, ih);
      c.fillStyle = '#4b3a29'; c.fillRect(0, ih * 0.8, iw, ih * 0.2); c.fillStyle = '#2f2318'; c.fillRect(0, ih * 0.8, iw, 12);
      gilt(c, 40, 90, 400, 520, 44); gilt(c, iw - 470, 60, 430, 580, 48); gilt(c, 520, 420, 190, 250, 22);
      // the small one, in its own pool of light
      const lx = iw * 0.62, ly = ih * 0.31, lg = c.createRadialGradient(lx, ly, 20, lx, ly, 330); lg.addColorStop(0, 'rgba(255,240,200,0.5)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = lg; c.fillRect(lx - 340, ly - 340, 680, 680);
      gilt(c, lx - 100, ly - 135, 200, 270, 26); lady(c, lx - 74, ly - 109, 148, 218); sepiaOver(c, lx - 74, ly - 109, 148, 218);
      back(c, iw * 0.36, ih * 1.02, ih * 0.78, { col: SEP.hi, legs: '#231910', hem: 0.3, skirt: 0.62, hat: 'cap', arm: true });
    }, 31); } });
  item({ id: 'hooks', x: 3250, y: 4850, w: 1350, h: 1080, rot: 3, t0: tHooks,
    paint(c, w, h) { print(c, w, h, (c, iw, ih) => {
      const g = c.createLinearGradient(0, 0, 0, ih); g.addColorStop(0, '#806c52'); g.addColorStop(1, '#998466'); c.fillStyle = g; c.fillRect(0, 0, iw, ih);
      gilt(c, -260, 80, 420, 760, 60); gilt(c, iw - 160, 60, 420, 800, 60);
      const x = iw * 0.5 - 215, y = ih * 0.5 - 300; c.fillStyle = 'rgba(214,196,160,0.55)'; c.fillRect(x, y, 430, 600); c.strokeStyle = 'rgba(50,35,20,0.35)'; c.lineWidth = 6; c.strokeRect(x, y, 430, 600);
      [[x + 90, y + 110], [x + 340, y + 110], [x + 90, y + 470], [x + 340, y + 470]].forEach(([a, b]) => hook(c, a, b, 1.5));
    }, 41); } });

  // tear-off calendar
  item({ id: 'cal', x: 4850, y: 4700, w: 720, h: 900, rot: -2, t0: tCal,
    paint(c, w, h) { c.fillStyle = '#5a1f16'; c.beginPath(); c.roundRect(0, 0, w, h, 26); c.fill(); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, h - 40, w, 40); const g = c.createLinearGradient(0, 40, 0, 130); g.addColorStop(0, '#d9d2c0'); g.addColorStop(1, '#8e8777'); c.fillStyle = g; c.fillRect(50, 50, w - 100, 80); c.fillStyle = '#2a211a'; [0.3, 0.7].forEach((f) => { c.beginPath(); c.arc(w * f, 90, 20, 0, 7); c.fill(); }); },
    dyn(c, t) {
      const page = (day, num, col, sy) => { c.save(); c.translate(50, 130); c.scale(1, sy); c.fillStyle = '#f1e8d0'; c.fillRect(0, 0, 620, 710); c.fillStyle = 'rgba(60,40,20,0.12)'; c.fillRect(0, 690, 620, 20); c.fillStyle = col; c.textAlign = 'center'; c.font = `700 440px ${CAPS}`; c.fillText(num, 310, 470); c.fillStyle = INK; c.font = `500 104px ${CAPS}`; c.letterSpacing = '14px'; c.fillText(day, 317, 630); c.restore(); };
      const p = clamp((t - tFlip) / 0.4);
      if (p > 0) page('TUESDAY', '22', RED, 1);
      if (p < 1) { page('MONDAY', '21', INK, 1 - eio(p)); if (p > 0) { c.fillStyle = `rgba(0,0,0,${0.3 * p})`; c.fillRect(50, 130, 620, 710 * (1 - eio(p))); } }
    } });

  item({ id: 'news', x: 6350, y: 6050, w: 2100, h: 1500, rot: 4, t0: tNews,
    paint(c, w, h) {
      paper(c, w, h, '#d8d0b8', 51, 0.2); c.fillStyle = INK; c.textAlign = 'center';
      c.font = `700 96px ${SERIF}`; c.letterSpacing = '18px'; c.globalAlpha = 0.7; c.fillText('THE EVENING HERALD', w / 2, 170); c.globalAlpha = 1; c.letterSpacing = '0px';
      c.fillRect(90, 215, w - 180, 10); c.fillRect(90, 238, w - 180, 3);
      const s = fitFont(c, 'STOLEN!', 900, SERIF, w - 240, 520); c.fillText('STOLEN!', w / 2, 290 + s * 0.83);
      const y = 320 + s * 0.9; c.fillRect(90, y, w - 180, 5);
      const cw = (w - 180 - 120) / 4; for (let i = 0; i < 4; i++) greyLines(c, 90 + i * (cw + 40), y + 70, cw, 12, 44, 14, 60 + i);
      const g = c.createLinearGradient(0, h - 140, 0, h); g.addColorStop(0, 'rgba(40,25,10,0)'); g.addColorStop(1, 'rgba(40,25,10,0.3)'); c.fillStyle = g; c.fillRect(0, h - 140, w, 140);
    } });

  item({ id: 'picasso', x: 9800, y: 6250, w: 1500, h: 1000, rot: -3, t0: tPic,
    paint(c, w, h) { policeCard(c, w, h, { hair: 'fringe', eye: 1.35, coat: '#2a2018' }, 61); },
    dyn(c, t) { typed(c, 'PABLO PICASSO', 60, 915, 112, t, tPablo, { cps: 20 }); stamp(c, 'QUESTIONED', 1045, 470, 118, -9, t, tQ); } });

  item({ id: 'crowd', x: 11900, y: 6300, w: 1600, h: 1160, rot: 2.5, t0: tCrowd,
    paint(c, w, h) { print(c, w, h, (c, iw, ih) => {
      const g = c.createLinearGradient(0, 0, 0, ih); g.addColorStop(0, '#85715a'); g.addColorStop(1, '#a08b6c'); c.fillStyle = g; c.fillRect(0, 0, iw, ih);
      gilt(c, 60, 50, 380, 430, 46); gilt(c, iw - 440, 50, 380, 430, 46);
      const x = iw / 2 - 120, y = 90; const lg = c.createRadialGradient(iw / 2, 250, 30, iw / 2, 250, 420); lg.addColorStop(0, 'rgba(255,240,200,0.45)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = lg; c.fillRect(iw / 2 - 430, -170, 860, 860);
      c.fillStyle = 'rgba(220,202,166,0.6)'; c.fillRect(x, y, 240, 330); [[x + 50, y + 60], [x + 190, y + 60], [x + 50, y + 260], [x + 190, y + 260]].forEach(([a, b]) => hook(c, a, b, 0.8));
      const r = rng(9), hats = ['bowler', 'wide', 'cap', 'bowler', 'wide'];
      for (let row = 0; row < 3; row++) for (let i = 0; i < 9 + row; i++) { const hh = ih * (0.5 + row * 0.13) * (0.92 + r() * 0.14); back(c, (i + 0.5 + (r() - 0.5) * 0.5) * iw / (8.5 + row) - 20, ih * (0.86 + row * 0.2), hh, { col: ['#2a1f15', '#1d150e', '#120c07'][row], hat: hats[Math.floor(r() * 5)], hair: '#0e0906', neck: '#7a6449', wide: 0.3 + r() * 0.06 }); }
    }, 71); } });

  item({ id: 'trunk', x: 5650, y: 1250, w: 1450, h: 1080, rot: 4, t0: tTrunk,
    paint(c, w, h) { print(c, w, h, (c, iw, ih) => {
      const g = c.createLinearGradient(0, 0, 0, ih); g.addColorStop(0, '#3a2c1f'); g.addColorStop(1, '#5d4a35'); c.fillStyle = g; c.fillRect(0, 0, iw, ih);
      c.fillStyle = '#6d5840'; c.fillRect(0, ih * 0.66, iw, ih * 0.34); c.strokeStyle = 'rgba(30,20,10,0.5)'; c.lineWidth = 4; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(i * iw / 6 - 60, ih); c.lineTo(i * iw / 6 * 0.8 + iw * 0.1, ih * 0.66); c.stroke(); }
      // the bed above
      c.fillStyle = '#17100a'; c.fillRect(60, 0, 34, ih * 0.9); c.fillRect(iw - 94, 0, 34, ih * 0.9); c.fillStyle = '#231910'; c.fillRect(0, ih * 0.14, iw, 40);
      c.fillStyle = '#b8a482'; c.beginPath(); c.moveTo(0, 0); c.lineTo(iw, 0); c.lineTo(iw, ih * 0.14); c.quadraticCurveTo(iw * 0.8, ih * 0.2, iw * 0.62, ih * 0.15); c.quadraticCurveTo(iw * 0.4, ih * 0.25, iw * 0.2, ih * 0.16); c.lineTo(0, ih * 0.2); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.ellipse(iw / 2, ih * 0.9, 520, 60, 0, 0, 7); c.fill();
      // the trunk
      const x = iw / 2 - 400, y = ih * 0.36, tw = 800, th = 500; const tg = c.createLinearGradient(0, y, 0, y + th); tg.addColorStop(0, '#9b7a50'); tg.addColorStop(1, '#5f4628'); c.fillStyle = tg; c.beginPath(); c.roundRect(x, y, tw, th, 34); c.fill();
      c.strokeStyle = '#2a1c10'; c.lineWidth = 9; c.stroke(); c.beginPath(); c.moveTo(x, y + 150); c.lineTo(x + tw, y + 150); c.stroke();
      c.fillStyle = '#2f2114'; [0.22, 0.78].forEach((f) => c.fillRect(x + tw * f - 34, y, 68, th)); c.fillStyle = '#c9ad6e'; [0.22, 0.78].forEach((f) => c.fillRect(x + tw * f - 24, y + 170, 48, 54));
      c.fillStyle = '#c9ad6e'; c.beginPath(); c.roundRect(x + tw / 2 - 46, y + 120, 92, 110, 12); c.fill(); c.fillStyle = '#1a120b'; c.beginPath(); c.arc(x + tw / 2, y + 170, 13, 0, 7); c.fill(); c.fillRect(x + tw / 2 - 5, y + 170, 10, 34);
      [[x, y], [x + tw, y], [x, y + th], [x + tw, y + th]].forEach(([a, b]) => { c.fillStyle = '#c9ad6e'; c.beginPath(); c.arc(a, b, 60, 0, 7); c.save(); c.clip(); c.fillRect(x, y, tw, th); c.restore(); });
      sepiaOver(c, 0, 0, iw, ih);
    }, 81); } });

  // the years tick by, typed on the desk
  item({ id: 'years', x: 5650, y: 2260, w: 1200, h: 440, rot: 0, t0: -1, nocache: true,
    dyn(c, t) { if (t < tYears) return; const y = t < wt('years', 'over') ? '1911' : t < wt('years', 'two') + 0.1 ? '1912' : '1913'; const tl = y === '1911' ? tYears : y === '1912' ? wt('years', 'over') : wt('years', 'two') + 0.1; const k = 1 + 0.18 * (1 - eo((t - tl) / 0.25));
      c.save(); c.translate(600, 220); c.scale(k, k); c.fillStyle = '#f3e7c8'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 420px ${CAPS}`; c.letterSpacing = '24px'; c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 30 * S; c.shadowOffsetY = 12 * S; c.fillText(y, 12, 20); c.restore(); } });

  item({ id: 'mug', x: 5650, y: 3400, w: 1500, h: 1000, rot: -3, t0: tMug,
    paint(c, w, h) { policeCard(c, w, h, { mustache: true, hair: 'slick' }, 91); },
    dyn(c, t) { typed(c, 'VINCENZO PERUGGIA', 60, 912, 100, t, tVin, { cps: 22 }); stamp(c, 'EX-EMPLOYEE', 1055, 480, 106, -9, t, tHelp); } });

  item({ id: 'tele', x: 13550, y: 4800, w: 1500, h: 820, rot: -4, t0: tTele,
    paint(c, w, h) { paper(c, w, h, '#d9c79a', 101, 0.2); c.fillStyle = 'rgba(42,33,26,0.75)'; c.font = `700 78px ${CAPS}`; c.letterSpacing = '30px'; c.textAlign = 'left'; c.fillText('TELEGRAM', 70, 125); c.letterSpacing = '0px'; c.fillRect(70, 160, w - 140, 6);
      [250, 400, 550].forEach((y, i) => { c.fillStyle = '#efe4c4'; c.fillRect(70, y, w - 140 - (i === 2 ? 420 : 0), 100); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(70, y + 100, w - 140 - (i === 2 ? 420 : 0), 5); greyLines(c, 100, y + 40, w - 200 - (i === 2 ? 420 : 0), 1, 0, 20, 110 + i, 'rgba(70,60,50,0.28)'); }); },
    dyn(c, t) { stamp(c, 'ARRESTED', 750, 440, 210, -8, t, tArrest); } });

  item({ id: 'slip', x: 13950, y: 6100, w: 1250, h: 800, rot: 3, t0: tSlip,
    paint(c, w, h) { paper(c, w, h, '#e6dcc0', 111, 0.18); c.fillStyle = 'rgba(42,33,26,0.7)'; c.font = `500 66px ${CAPS}`; c.letterSpacing = '26px'; c.textAlign = 'center'; c.fillText('SENTENCE', w / 2 + 13, 130); c.letterSpacing = '0px'; c.fillRect(90, 170, w - 180, 5);
      greyLines(c, 90, 560, w - 420, 3, 56, 16, 112); c.strokeStyle = 'rgba(140,40,30,0.4)'; c.lineWidth = 8; c.beginPath(); c.arc(w - 190, 620, 105, 0, 7); c.stroke(); c.lineWidth = 3; c.beginPath(); c.arc(w - 190, 620, 84, 0, 7); c.stroke(); },
    dyn(c, t) { typed(c, '7 MONTHS', 625, 440, 250, t, tSeven, { align: 'center', cps: 18 }); } });

  item({ id: 'painting', x: 15450, y: 2750, w: 1150, h: 1560, rot: 1.5, t0: tPaint,
    paint(c, w, h) { const f = 120; const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e9c779'); g.addColorStop(0.35, '#9a6f2a'); g.addColorStop(0.6, '#d9b25e'); g.addColorStop(1, '#7a5520'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const r = rng(3); c.strokeStyle = 'rgba(60,35,5,0.35)'; c.lineWidth = 5; [18, 52, 92].forEach((d) => c.strokeRect(d, d, w - 2 * d, h - 2 * d));
      for (let i = 0; i < 180; i++) { const side = i % 4, k = r(); const x = side < 2 ? 30 + k * (w - 60) : side === 2 ? 62 : w - 62, y = side < 2 ? (side ? 62 : h - 62) : 30 + k * (h - 60); c.fillStyle = r() < 0.5 ? 'rgba(255,235,170,0.5)' : 'rgba(70,40,5,0.35)'; c.beginPath(); c.arc(x, y, 5 + r() * 9, 0, 7); c.fill(); }
      c.fillStyle = '#120c06'; c.fillRect(f - 8, f - 8, w - 2 * f + 16, h - 2 * f + 16); lady(c, f, f, w - 2 * f, h - 2 * f);
      const sh = c.createLinearGradient(0, f, 0, f + 70); sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sh; c.fillRect(f, f, w - 2 * f, 70);
    } });

  // which thing is the hero, and when: [from, to, level]
  const hero = (id, a, b, lv = 1) => byId[id].lit.push([a, b, lv]);
  const END = DUR + 5;
  hero('paris', 0, tGallery + 0.2); hero('gallery', tGallery, tHooks + 0.25); hero('hooks', tHooks, tCal + 0.2); hero('cal', tCal, tNews + 0.2); hero('news', tNews, tBorder);
  hero('map', tBorder - 0.2, tPic + 0.2); hero('picasso', tPic, tCrowd + 0.2); hero('crowd', tCrowd, tRoute - 0.6); hero('paris', tRoute - 0.8, tTrunk + 0.25);
  hero('trunk', tTrunk, tYears + 0.2); hero('trunk', tYears, tMug, 0.3); hero('years', tYears - 0.1, tMug + 0.2); hero('mug', tMug, ls('italy') + 0.2);
  hero('map', ls('italy') - 0.1, tTele + 0.2); hero('tele', tTele, tSlip + 0.2); hero('slip', tSlip, tPaint + 0.2); hero('painting', tPaint, END);
  items.forEach((it) => { if (it.id !== 'painting') hero(it.id, tAll, END, it.id === 'years' ? 1 : 0.6); });
  const litAt = (it, t) => { let v = 0; for (const [a, b, lv] of it.lit) v = Math.max(v, lv * Math.min(eio((t - a) / 0.6), 1 - eio((t - b) / 0.6))); return v; };
  const dimAt = (t) => 0.66 * eio(t / 1.5) - 0.2 * eio((t - tAll) / 1.5);

  // ---- camera: poses to arrive at, joined by a smooth monotone curve; holds keep creeping toward the next pose
  const P = (id, lx, ly) => at(byId[id], lx, ly), C = (id) => [byId[id].x, byId[id].y];
  const fr = P('map', ...proj(2.6, 46.5)), mp = P('map', ...proj(2.35, 48.86)), fl = P('map', ...proj(11.9, 43.6));
  const POSES = [ // t = when the camera has arrived; z = zoom; r = roll in degrees; via = zoom at mid-travel
    { t: 0, p: P('paris', 1500, 900), z: 0.62, r: -2.2 },
    { t: tAug + 0.2, p: P('paris', 1150, 720), z: 0.95, r: -1.5 },
    { t: tLouvre + 0.1, p: P('paris', 1900, 1640), z: 1.12, r: -1, till: le('paris') - 0.05 },
    { t: ls('smock') + 0.45, p: C('gallery'), z: 1.16, r: -3 },
    { t: wt('lift', 'off') + 0.25, p: C('hooks'), z: 1.2, r: 2, till: le('lift') },
    { t: ls('day') + 0.3, p: C('cal'), z: 1.36, r: -1.5 },
    { t: wt('news', 'front') + 0.15, p: C('news'), z: 0.96, r: 3 },
    { t: tBorder + 0.45, p: fr, z: 0.4, r: 0.5, till: ls('picasso') - 0.45 },
    { t: ls('picasso') + 0.6, p: C('picasso'), z: 1.3, r: -2.2, till: le('picasso') + 0.1 },
    { t: ls('crowds') + 0.55, p: C('crowd'), z: 1.12, r: 2, till: le('crowds') - 0.2 },
    { t: tRoute + 0.1, p: P('paris', 1980, 1160), z: 1.0, r: -1.2, via: 0.36, move: 2.3 },
    { t: wt('trunk', 'trunk') + 0.2, p: C('trunk'), z: 1.22, r: 3 },
    { t: tYears + 0.3, p: C('years'), z: 1.25, r: 0.5 },
    { t: ls('name') + 0.4, p: C('mug'), z: 1.28, r: -2.2, till: le('name') - 0.15 },
    { t: ls('italy') + 0.75, p: mp, z: 0.78, r: 0.5, via: 0.55 },
    { t: tFlor + 0.1, p: fl, z: 0.86, r: 1, move: tFlor - ls('italy') - 1.0 },
    { t: ls('dealer') + 0.4, p: C('tele'), z: 1.3, r: -3, till: le('dealer') },
    { t: ls('months') + 0.4, p: C('slip'), z: 1.42, r: 2.2, till: le('months') + 0.2 },
    { t: wt('twist', 'twist') + 0.3, p: C('painting'), z: 0.98, r: 1.2, via: 0.6 },
    { t: wt('famous', 'most') - 0.2, p: [8300, 3700], z: 0.236, r: 0, move: wt('famous', 'most') - 0.2 - ls('famous') + 0.2 },
    { t: DUR + 0.5, p: [8300, 3700], z: 0.222, r: -0.4 },
  ];
  const keys = [];
  POSES.forEach((A, i) => {
    keys.push({ t: A.t, x: A.p[0], y: A.p[1], lz: Math.log(A.z), r: A.r });
    const B = POSES[i + 1]; if (!B) return;
    const dist = Math.hypot(B.p[0] - A.p[0], B.p[1] - A.p[1]); const move = B.move || clamp(0.9 + dist / 5000, 1.0, 2.2); let dep = B.t - move; if (A.till && dep < A.till) dep = Math.min(A.till, B.t - 0.85);
    if (dep > A.t + 0.3) { const d = Math.min(dist * 0.06, 110 / A.z) / Math.max(dist, 1); keys.push({ t: dep, x: A.p[0] + (B.p[0] - A.p[0]) * d, y: A.p[1] + (B.p[1] - A.p[1]) * d, lz: Math.log(A.z) + clamp((Math.log(B.z) - Math.log(A.z)) * 0.08, -0.035, 0.035), r: lerp(A.r, B.r, 0.12) }); }
    if (B.via) { const d0 = Math.max(dep, A.t), tm = (d0 + B.t) / 2; keys.push({ t: tm, x: lerp(A.p[0], B.p[0], 0.5), y: lerp(A.p[1], B.p[1], 0.5), lz: Math.log(B.via), r: lerp(A.r, B.r, 0.5) }); }
    if (dep > A.t + 0.3 || B.via) cue('whoosh', Math.max(dep, A.t) + 0.15, dist > 4000 ? 3 : 0);
  });
  function pchip(ts, ys) {
    const n = ts.length, h = [], d = [], m = new Array(n); for (let i = 0; i < n - 1; i++) { h[i] = ts[i + 1] - ts[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
    m[0] = d[0]; m[n - 1] = d[n - 2]; for (let i = 1; i < n - 1; i++) { if (d[i - 1] * d[i] <= 0) m[i] = 0; else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); } }
    return (t) => { t = clamp(t, ts[0], ts[n - 1]); let i = 0; while (i < n - 2 && t > ts[i + 1]) i++; const s = (t - ts[i]) / h[i], s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * h[i] * m[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * h[i] * m[i + 1]; };
  }
  const kt = keys.map((k) => k.t), fx = pchip(kt, keys.map((k) => k.x)), fy = pchip(kt, keys.map((k) => k.y)), fz = pchip(kt, keys.map((k) => k.lz)), frr = pchip(kt, keys.map((k) => k.r));
  // soften every start and landing: each channel is averaged over a short bell-shaped window
  const TAPS = [[-0.3, 0.05], [-0.2, 0.12], [-0.1, 0.2], [0, 0.26], [0.1, 0.2], [0.2, 0.12], [0.3, 0.05]];
  const soft = (f) => (t) => TAPS.reduce((v, [d, w]) => v + f(t + d) * w, 0);
  const sx = soft(fx), sy = soft(fy), sz = soft(fz), sr = soft(frr);
  function camAt(t) {
    const z = Math.exp(sz(t)); // a little handheld life, the same size on screen at any zoom
    const hx = Math.sin(t * 1.31) * 5 + Math.sin(t * 2.17 + 1.3) * 3 + Math.sin(t * 3.9 + 0.4) * 1.2, hy = Math.sin(t * 1.07 + 2.1) * 4 + Math.sin(t * 2.63 + 0.2) * 2.5 + Math.sin(t * 4.3 + 1.9) * 1;
    return { x: sx(t) + hx / z, y: sy(t) + hy / z, z, r: (sr(t) + Math.sin(t * 0.83 + 0.7) * 0.18 + Math.sin(t * 1.9) * 0.07) * D2R };
  }

  // ---- caches
  const PAD = 140;
  function build() {
    for (const it of items) {
      if (!it.nocache) { it.cache = mk(it.w * S, it.h * S); const c = it.cache.getContext('2d'); c.scale(S, S); it.paint(c, it.w, it.h); }
      const q = S / 8; it.shadow = mk((it.w + 2 * PAD) * q, (it.h + 2 * PAD) * q); if (it.nocache) continue; const sc = it.shadow.getContext('2d'); sc.filter = `blur(${PAD * q * 0.32}px)`; sc.fillStyle = '#000'; sc.fillRect(PAD * q, PAD * q, it.w * q, it.h * q);
    }
  }
  const wood = mk(4096 * S, 2048 * S); let woodPat;
  (function () { const c = wood.getContext('2d'); c.scale(S, S); const r = rng(1234); c.fillStyle = '#2a1a10'; c.fillRect(0, 0, 4096, 2048);
    for (let p = 0; p < 4; p++) { c.fillStyle = `rgba(${p % 2 ? 80 : 0},${p % 2 ? 45 : 0},${p % 2 ? 20 : 0},${0.05 + r() * 0.07})`; c.fillRect(0, p * 512, 4096, 512); }
    for (let i = 0; i < 2600; i++) { const y = r() * 2048, x = r() * 4096, len = 200 + r() * 1400, lt = r() < 0.5; c.strokeStyle = lt ? `rgba(150,95,50,${0.03 + r() * 0.07})` : `rgba(0,0,0,${0.05 + r() * 0.12})`; c.lineWidth = 1 + r() * 5; const wob = (r() - 0.5) * 16; for (const ox of [0, -4096]) { c.beginPath(); c.moveTo(x + ox, y); c.bezierCurveTo(x + ox + len * 0.3, y + wob, x + ox + len * 0.6, y - wob, x + ox + len, y + wob * 0.3); c.stroke(); } }
    for (let p = 0; p < 4; p++) { c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, p * 512 - 3, 4096, 6); c.fillStyle = 'rgba(160,110,60,0.08)'; c.fillRect(0, p * 512 + 3, 4096, 3); const sx = r() * 4096; c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(sx, p * 512, 5, 512); }
  })();
  const grain = mk(512, 512); (function () { const c = grain.getContext('2d'), d = c.createImageData(512, 512), r = rng(99); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 150; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); })();
  const vig = mk(W * S / 4, H * S / 4); (function () { const c = vig.getContext('2d'), w = vig.width, h = vig.height; c.translate(w / 2, h / 2); c.scale(1, h / w * 1.25); const g = c.createRadialGradient(0, 0, w * 0.28, 0, 0, w * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.6, 'rgba(8,4,0,0.35)'); g.addColorStop(1, 'rgba(6,3,0,0.85)'); c.fillStyle = g; c.fillRect(-w, -w * 2, w * 2, w * 4); })();
  const scratch = mk(W * S, H * S), sctx = scratch.getContext('2d'), small = mk(W * S / 8, H * S / 8), smctx = small.getContext('2d');

  function drawItem(g, it, t, pass) {
    let e = 1, a = 1; if (it.t0 >= 0) { const p = (t - it.t0) / 0.5; if (p <= 0) return; e = eo(p); a = clamp(p * 5); }
    const k = 1 + 0.45 * (1 - e), rr = (it.rot + (1 - e) * (it.spin || 7)) * D2R, off = 16 + 150 * (1 - e);
    g.save(); g.translate(it.x, it.y);
    if (pass === 0 && !it.nocache) { g.save(); g.globalAlpha = a * (0.45 + 0.25 * e); g.translate(off * 0.55, off); g.rotate(rr); g.scale(k, k); g.drawImage(it.shadow, -it.w / 2 - PAD, -it.h / 2 - PAD, it.w + 2 * PAD, it.h + 2 * PAD); g.restore(); }
    g.globalAlpha = a * (pass === 0 ? 1 : litAt(it, t)); g.rotate(rr); g.scale(k, k); g.translate(-it.w / 2, -it.h / 2);
    if (it.cache) g.drawImage(it.cache, 0, 0, it.w, it.h); if (it.dyn) it.dyn(g, t);
    g.restore();
  }
  function drawWorld(g, t) {
    const cam = camAt(t); g.setTransform(S, 0, 0, S, 0, 0); g.translate(W / 2, H / 2); g.rotate(-cam.r); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
    const R = 2400 / cam.z; g.fillStyle = woodPat; g.fillRect(cam.x - R, cam.y - R, 2 * R, 2 * R);
    for (const it of items) drawItem(g, it, t, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(6,3,1,${dimAt(t)})`; g.fillRect(0, 0, W * S, H * S); g.restore();
    for (const it of items) if (litAt(it, t) > 0.01) drawItem(g, it, t, 1);
  }
  const SHUTTER = 0.5 / FPS;
  function seek(t) {
    const a = camAt(t), b = camAt(t + SHUTTER); // how far the picture moves while the shutter is open
    const px = (Math.hypot(b.x - a.x, b.y - a.y) * a.z + Math.abs(Math.log(b.z / a.z)) * W * 0.5 + Math.abs(b.r - a.r) * W * 0.5) * S;
    const n = clamp(Math.ceil(px / 5), 1, 10);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    if (n === 1) drawWorld(ctx, t); else for (let k = 0; k < n; k++) { drawWorld(sctx, t + SHUTTER * k / n); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 / (k + 1); ctx.drawImage(scratch, 0, 0); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    // soft glow
    smctx.filter = `blur(${5 * S}px)`; smctx.drawImage(cv, 0, 0, small.width, small.height); smctx.filter = 'none';
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.2; ctx.drawImage(small, 0, 0, cv.width, cv.height);
    // warm lamp, vignette, grain
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.5; const lg = ctx.createRadialGradient(cv.width * 0.5, cv.height * 0.45, 0, cv.width * 0.5, cv.height * 0.45, cv.width * 0.5); lg.addColorStop(0, '#ffd9a0'); lg.addColorStop(1, '#3a2a4a'); ctx.fillStyle = lg; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(vig, 0, 0, cv.width, cv.height);
    const f = Math.round(t * FPS), gr = rng(f * 7919 + 13); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.13; const gs = 512 * Math.max(1, S * 1.5), ox = -gr() * gs, oy = -gr() * gs; for (let y = oy; y < cv.height; y += gs) for (let x = ox; x < cv.width; x += gs) ctx.drawImage(grain, x, y, gs, gs);
    ctx.globalCompositeOperation = 'source-over'; const fade = Math.max(1 - eio(t / 1.2), eio((t - (DUR - 1.3)) / 1.2)); if (fade > 0) { ctx.globalAlpha = fade; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height); }
    ctx.globalAlpha = 1;
  }

  (async () => {
    await Promise.all([`900 100px ${SERIF}`, `700 100px ${SERIF}`, `400 100px ${TYPE}`, `700 100px ${CAPS}`, `500 100px ${CAPS}`].map((f) => document.fonts.load(f)));
    build(); woodPat = ctx.createPattern(wood, 'repeat'); woodPat.setTransform(new DOMMatrix().scale(1 / S));
    window.seek = seek; window.DURATION = DUR; window.CUES = CUES.sort((a, b) => a.t - b.t);
    window.BEATS = POSES.map((p) => +p.t.toFixed(2)); window.HEROS = [0.6, tAug + 1.2, tClosed + 0.5, tGallery + 1.6, tHooks + 1.4, tCal + 0.9, tFlip + 0.8, tNews + 1.5, tBorder + 1.7, tQ + 0.2, tPablo + 1.2, tCrowd + 1.6, tTwo + 0.5, tAway + 0.7, tTrunk + 1.6, tYears + 1.9, tVin + 1.2, tHelp + 0.8, (tRail + tFlor) / 2, tFlor + 0.9, tArrest + 0.5, tSeven + 0.8, tPaint + 1.5, tPaint + 4, tAll + 0.3, DUR - 2.5]; window.camAt = camAt;
    window.__ready = true; seek(+(new URLSearchParams(location.search).get('t') || 0));
  })();
})();
