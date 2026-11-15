// "Why your phone crawls after 80%": a dark tech-cutaway Short in one continuous camera move, drawn with canvas 2D.
// World units are 1080x1920 pixels at zoom 1. window.seek(t) draws one frame; ?s=0.5 renders at half size.
(() => {
  const W = 1080, H = 1920, FPS = 60;
  const S = +(new URLSearchParams(location.search).get('s') || 1);
  const T = window.TIMING, DUR = T.total;
  const cv = document.getElementById('screen'); cv.width = Math.round(W * S); cv.height = Math.round(H * S);
  const ctx = cv.getContext('2d');
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
  const eo = (p) => 1 - Math.pow(1 - clamp(p), 3), eio = (p) => { p = clamp(p); return p * p * p * (p * (p * 6 - 15) + 10); };
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const D2R = Math.PI / 180;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const L = Object.fromEntries(T.lines.map((l) => [l.id, l])); const ls = (id) => L[id].start, le = (id) => L[id].end;
  const wt = (id, word) => { const m = T.words.find((w) => w.line === id && norm(w.w).startsWith(norm(word))); if (!m) throw new Error('no word ' + id + ' ' + word); return m.s; };
  const CUES = []; const cue = (name, t, gain = 0) => { CUES.push({ name, t: +t.toFixed(3), gain }); return t; };
  const SANS = 'Figtree, sans-serif', MONO = '"JetBrains Mono", monospace';
  const GOLD = '#f0c860';

  // ---- story times
  const tEighty = wt('hook', 'eighty'), tInside = ls('inside') - 0.15, tIons = wt('inside', 'ions'), tRoom = ls('room'), tFull = ls('full');
  const tPush = ls('push'), tPile = wt('push', 'pile'), tDamage = wt('push', 'damage'), tSlow = wt('slow', 'slows'), tOut = wt('slow', 'purpose') + 0.25;
  cue('plug', 0.35); cue('tick', tEighty + 0.25); cue('dive', tInside + 0.1); cue('hum', tIons - 0.3); cue('sizzle', tPile + 0.1); cue('zap', tDamage + 0.1); cue('down', tSlow + 0.1); cue('whoosh', tOut - 0.2); cue('tick', DUR - 0.75);

  // ---- the phone (world space)
  const PH = { x: 160, y: 220, w: 760, h: 1560, r: 118 }, BAT = { x: 215, y: 600, w: 330, h: 820 }, B = [BAT.x + BAT.w / 2, BAT.y + BAT.h / 2];
  const ZC = 14; // the battery cell is drawn 14x smaller, inside the battery
  const cellToWorld = (lx, ly) => [B[0] + (lx - 540) / ZC, B[1] + (ly - 960) / ZC];
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  function phone(c, t) {
    const xr = eio((t - tInside) / 0.8) - eio((t - (tOut - 0.1)) / 0.9);
    // cable and plug
    const pk = eo((t - 0.1) / 0.5), py = PH.y + PH.h + 6 + (1 - pk) * 260;
    c.strokeStyle = '#d9d9de'; c.lineWidth = 44; c.lineCap = 'round'; c.beginPath(); c.moveTo(540, py + 200); c.bezierCurveTo(540, py + 520, 700, py + 700, 660, py + 1100); c.stroke();
    let g = c.createLinearGradient(470, 0, 610, 0); g.addColorStop(0, '#b9b9c2'); g.addColorStop(0.3, '#ffffff'); g.addColorStop(0.75, '#e6e6ea'); g.addColorStop(1, '#9c9ca6'); c.fillStyle = g; rr(c, 468, py, 144, 230, 34); c.fill();
    c.fillStyle = '#9a9aa4'; rr(c, 496, py - 34, 88, 44, 8); c.fill();
    // body
    c.save(); c.shadowColor = 'rgba(150,120,255,0.25)'; c.shadowBlur = 90 * S; g = c.createLinearGradient(PH.x, 0, PH.x + PH.w, 0); g.addColorStop(0, '#8a79c2'); g.addColorStop(0.06, '#cdbdf2'); g.addColorStop(0.5, '#b3a1e2'); g.addColorStop(0.94, '#cdbdf2'); g.addColorStop(1, '#7b6ab2'); c.fillStyle = g; rr(c, PH.x, PH.y, PH.w, PH.h, PH.r); c.fill(); c.restore();
    c.fillStyle = '#6c5ca0'; [[PH.x - 7, 560, 9, 110], [PH.x - 7, 700, 9, 110], [PH.x + PH.w - 2, 620, 9, 170]].forEach(([x, y, w, h]) => { rr(c, x, y, w, h, 4); c.fill(); });
    const ix = PH.x + 20, iy = PH.y + 20, iw = PH.w - 40, ih = PH.h - 40;
    c.save(); rr(c, ix, iy, iw, ih, PH.r - 18); c.clip();
    // inside: boards, camera, battery
    c.fillStyle = '#0b0b0e'; c.fillRect(ix, iy, iw, ih);
    const r = rng(42);
    c.fillStyle = '#17181d'; rr(c, 580, 290, 290, 1130, 22); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 2; c.stroke();
    for (let i = 0; i < 46; i++) { const w = 22 + r() * 70, h = 18 + r() * 60, x = 596 + r() * (258 - w), y = 306 + r() * (1098 - h); g = c.createLinearGradient(x, y, x + w, y + h); const v = 40 + r() * 60; g.addColorStop(0, `rgb(${v + 30},${v + 32},${v + 40})`); g.addColorStop(1, `rgb(${v * 0.5},${v * 0.5},${v * 0.58})`); c.fillStyle = g; rr(c, x, y, w, h, 4); c.fill(); if (r() < 0.3) { c.fillStyle = 'rgba(240,200,96,0.7)'; for (let k = 0; k < 5; k++) c.fillRect(x + 3 + k * (w - 8) / 5, y + h, 3, 5); } }
    c.fillStyle = '#101116'; rr(c, 205, 270, 350, 300, 60); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.1)'; c.stroke();
    [[300, 365, 70], [455, 365, 70], [378, 480, 58]].forEach(([x, y, rad]) => { g = c.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 2, x, y, rad); g.addColorStop(0, '#5b6076'); g.addColorStop(0.5, '#1b1d27'); g.addColorStop(1, '#07070a'); c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); c.strokeStyle = '#3a3d4a'; c.lineWidth = 5; c.stroke(); c.fillStyle = 'rgba(120,150,255,0.35)'; c.beginPath(); c.arc(x - rad * 0.25, y - rad * 0.25, rad * 0.14, 0, 7); c.fill(); });
    g = c.createLinearGradient(BAT.x, BAT.y, BAT.x + BAT.w, BAT.y + BAT.h); g.addColorStop(0, '#f1d27c'); g.addColorStop(0.45, '#c9a44a'); g.addColorStop(1, '#8f6f26'); c.fillStyle = g; rr(c, BAT.x, BAT.y, BAT.w, BAT.h, 26); c.fill();
    c.save(); rr(c, BAT.x, BAT.y, BAT.w, BAT.h, 26); c.clip(); for (let i = 0; i < 90; i++) { c.fillStyle = i % 2 ? 'rgba(255,240,190,0.07)' : 'rgba(60,40,0,0.07)'; c.fillRect(BAT.x + i * 3.7, BAT.y, 1.6, BAT.h); } g = c.createLinearGradient(BAT.x, BAT.y, BAT.x + BAT.w * 0.8, BAT.y + BAT.h * 0.5); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(BAT.x, BAT.y, BAT.w, BAT.h); c.restore();
    c.strokeStyle = 'rgba(255,235,170,0.6)'; c.lineWidth = 2; rr(c, BAT.x, BAT.y, BAT.w, BAT.h, 26); c.stroke();
    c.fillStyle = '#1a1b20'; rr(c, 215, 1450, 655, 250, 24); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.08)'; c.stroke();
    c.strokeStyle = '#2c2e37'; c.lineWidth = 3; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(380, 1575, 20 + i * 9, 0, 7); c.stroke(); } c.fillStyle = '#2a2c35'; rr(c, 600, 1480, 240, 190, 14); c.fill();
    // charge runs from the port up to the battery
    const kp = clamp((t - tInside - 0.3) / 0.8); if (kp > 0 && xr > 0) { c.save(); c.globalAlpha = xr; c.strokeStyle = GOLD; c.lineWidth = 6; c.shadowColor = '#ffb030'; c.shadowBlur = 24 * S; c.setLineDash([14, 12]); c.lineDashOffset = -t * 160; c.beginPath(); c.moveTo(540, 1760); c.lineTo(540, 1440); c.lineTo(380, 1440); c.lineTo(380, 1420); c.stroke(); c.restore(); }
    // the screen, fading away for the x-ray
    if (xr < 1) { c.globalAlpha = 1 - xr; g = c.createLinearGradient(ix, iy, ix + iw, iy + ih); g.addColorStop(0, '#1b0f33'); g.addColorStop(0.5, '#3a1d63'); g.addColorStop(1, '#120a22'); c.fillStyle = g; c.fillRect(ix, iy, iw, ih);
      g = c.createRadialGradient(540, 1250, 40, 540, 1250, 700); g.addColorStop(0, 'rgba(255,120,200,0.35)'); g.addColorStop(1, 'rgba(255,120,200,0)'); c.fillStyle = g; c.fillRect(ix, iy, iw, ih);
      c.fillStyle = '#000'; rr(c, 440, 262, 200, 56, 28); c.fill();
      const pct = t < tOut ? Math.round(lerp(9, 80, eio(t / (tEighty + 0.25)))) : (t > DUR - 0.75 ? 81 : 80);
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 250px ${SANS}`; c.fillText(pct + '%', 548, 860);
      rr(c, 300, 960, 480, 64, 32); c.fillStyle = 'rgba(255,255,255,0.16)'; c.fill(); c.save(); rr(c, 300, 960, 480, 64, 32); c.clip(); c.fillStyle = '#39d86b'; c.fillRect(300, 960, 480 * pct / 100, 64); c.restore();
      c.fillStyle = '#39d86b'; c.beginPath(); c.moveTo(552, 1070); c.lineTo(520, 1128); c.lineTo(542, 1128); c.lineTo(530, 1176); c.lineTo(564, 1114); c.lineTo(541, 1114); c.closePath(); c.fill();
      g = c.createLinearGradient(ix, iy, ix + iw * 0.7, iy + ih * 0.5); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(ix, iy, iw, ih); c.globalAlpha = 1; }
    c.restore();
    c.fillStyle = '#15121f'; rr(c, 500, PH.y + PH.h - 15, 80, 13, 6); c.fill();
    if (xr > 0.5) note(c, 'MAGNIFIED ILLUSTRATION', 180, 1830, 20, (xr - 0.5) * 2 * 0.5);
  }
  const note = (c, text, x, y, size, a) => { c.save(); c.globalAlpha *= a; c.fillStyle = '#c9c9d2'; c.font = `500 ${size}px ${MONO}`; c.textAlign = 'left'; c.letterSpacing = size * 0.08 + 'px'; c.fillText(text, x, y); c.restore(); };

  // ---- inside one battery cell (local space 1080x1920, shown 14x smaller inside the battery)
  const GAPS = 12, SHY0 = 470, SHSTEP = 82, COLS = [806, 868, 930, 992];
  const slots = []; for (let g = 0; g < GAPS; g++) for (let k = 0; k < 4; k++) slots.push({ x: COLS[k], y: SHY0 + 56 + g * SHSTEP, g });
  const order = slots.map((_, i) => i); { const r = rng(7); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } }
  // keep four slots in the middle rows free to the very end, so there is something to "look for"
  const keep = order.filter((i) => slots[i].g >= 4 && slots[i].g <= 7).slice(0, 4), fillOrder = order.filter((i) => !keep.includes(i)).concat(keep);
  const src = []; for (let row = 0; row < 12; row++) for (let col = 0; col < 5; col++) src.push({ x: 84 + col * 50, y: SHY0 + 56 + row * SHSTEP }); { const r = rng(11); for (let i = src.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [src[i], src[j]] = [src[j], src[i]]; } }
  const ions = []; const r0 = rng(3);
  const N1 = 38, N2 = 6, N3 = 14;
  for (let i = 0; i < N1; i++) { const s = slots[fillOrder[i]]; ions.push({ a: src[i], pts: [[540, s.y], [742, s.y], [s.x, s.y]], t0: tIons - 1.3 + (tFull - 0.9 - (tIons - 1.3)) * Math.pow(i / N1, 0.85), d: 1.25, slot: fillOrder[i] }); }
  for (let i = 0; i < N2; i++) { const s = slots[fillOrder[N1 + i]], y1 = SHY0 + 56 + Math.floor(r0() * GAPS) * SHSTEP, y2 = SHY0 + 56 + Math.floor(r0() * GAPS) * SHSTEP; ions.push({ a: src[N1 + i], pts: [[540, y1], [722, y1], [716, y2], [730, s.y], [s.x, s.y]], t0: tFull - 0.2 + i * 0.42, d: 2.6, slot: fillOrder[N1 + i], seek: true }); }
  for (let i = 0; i < N3; i++) { const cy = i % 2 ? 760 : 1090, yy = cy + (r0() - 0.5) * 150, y0 = SHY0 + 56 + Math.floor(r0() * GAPS) * SHSTEP; ions.push({ a: src[N1 + N2 + i], pts: [[540, y0], [640, yy], [718 - (i % 3) * 20 - r0() * 8, yy]], t0: tPush + 0.25 + i * 0.13, d: 0.8, pile: true }); }
  const along = (pts, k) => { const n = pts.length - 1, f = clamp(k) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i, e = u * u * (3 - 2 * u); return [lerp(pts[i][0], pts[i + 1][0], e), lerp(pts[i][1], pts[i + 1][1], e)]; };
  const ionPos = (ion, t) => { const k = (t - ion.t0) / ion.d; if (k <= 0) return [ion.a.x, ion.a.y, 0]; const p = along([[ion.a.x, ion.a.y]].concat(ion.pts), eio(k)); const wob = k < 1 ? Math.sin(t * 9 + ion.a.y) * 5 * Math.sin(Math.PI * clamp(k)) : 0; return [p[0], p[1] + wob, clamp(k)]; };
  function glowDot(c, x, y, rad, hot) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad * 3.2); g.addColorStop(0, hot ? 'rgba(255,130,30,0.55)' : 'rgba(255,200,80,0.5)'); g.addColorStop(1, 'rgba(255,160,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, rad * 3.2, 0, 7); c.fill();
    const b = c.createRadialGradient(x - rad * 0.35, y - rad * 0.4, 1, x, y, rad); b.addColorStop(0, '#fff8dc'); b.addColorStop(0.45, hot ? '#ff9a2e' : '#f3c657'); b.addColorStop(1, hot ? '#a83a08' : '#94701f'); c.fillStyle = b; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill();
  }
  // a tiny mono label with a leader line; k keeps it the same size on screen at any zoom
  function tag(c, text, x, y, dx, dy, k, a = 1) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 2 * k; c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx * k, y + dy * k); c.lineTo(x + (dx + (dx < 0 ? -26 : 26)) * k, y + dy * k); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 4 * k, 0, 7); c.fill(); c.font = `700 ${27 * k}px ${MONO}`; c.letterSpacing = 2.5 * k + 'px'; c.textAlign = dx < 0 ? 'right' : 'left'; c.textBaseline = 'middle'; c.fillText(text, x + (dx + (dx < 0 ? -36 : 36)) * k, y + dy * k + 1 * k); c.restore();
  }
  const sparks = []; { const r = rng(21); for (let i = 0; i < 70; i++) sparks.push({ cy: i % 2 ? 760 : 1090, a: Math.PI * (0.6 + r() * 0.8), v: 120 + r() * 380, t0: r() * 1.2, life: 0.35 + r() * 0.5, off: (r() - 0.5) * 120 }); }
  function cell(c, t, z) {
    const a = eio((z - 3.2) / 5); if (a <= 0) return; const k = ZC / z; // k: size of one screen pixel in local units, relative to the base view
    c.save(); c.translate(B[0], B[1]); c.scale(1 / ZC, 1 / ZC); c.translate(-540, -960); c.globalAlpha = a;
    let g = c.createRadialGradient(540, 960, 100, 540, 960, 1500); g.addColorStop(0, '#111116'); g.addColorStop(1, '#040405'); c.fillStyle = g; rr(c, -900, -700, 2880, 3320, 120); c.fill();
    const r = rng(5); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.1})`; c.beginPath(); c.arc(r() * 1080, 300 + r() * 1500, 1 + r() * 2, 0, 7); c.fill(); }
    // cathode: stacked metal-oxide sheets
    for (let row = 0; row <= 12; row++) { const y = SHY0 + row * SHSTEP; g = c.createLinearGradient(0, y, 0, y + 30); g.addColorStop(0, '#7f8fb5'); g.addColorStop(0.25, '#46516f'); g.addColorStop(1, '#1b2030'); c.fillStyle = g; rr(c, 40, y, 300, 30, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(48, y + 3, 284, 2); }
    // separator with pores
    g = c.createLinearGradient(512, 0, 568, 0); g.addColorStop(0, 'rgba(210,220,240,0.10)'); g.addColorStop(0.5, 'rgba(210,220,240,0.26)'); g.addColorStop(1, 'rgba(210,220,240,0.10)'); c.fillStyle = g; rr(c, 512, SHY0 - 40, 56, SHSTEP * 12 + 110, 20); c.fill(); c.strokeStyle = 'rgba(230,235,255,0.35)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#050506'; for (let i = 0; i < GAPS; i++) { rr(c, 508, SHY0 + 40 + i * SHSTEP, 64, 32, 14); c.fill(); }
    // anode: graphite shelves and their slots
    for (let row = 0; row <= GAPS; row++) { const y = SHY0 + row * SHSTEP; g = c.createLinearGradient(0, y, 0, y + 30); g.addColorStop(0, '#8b8d96'); g.addColorStop(0.22, '#484a52'); g.addColorStop(1, '#191a1e'); c.fillStyle = g; rr(c, 760, y, 290, 30, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(768, y + 3, 274, 2);
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2; for (let x = 780; x < 1040; x += 26) { c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + 8, y + 24); c.stroke(); } }
    c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 2; c.setLineDash([5, 6]); slots.forEach((s) => { c.beginPath(); c.arc(s.x, s.y, 17, 0, 7); c.stroke(); }); src.forEach((s) => { c.beginPath(); c.arc(s.x, s.y, 17, 0, 7); c.stroke(); }); c.setLineDash([]);
    // heat where the ions pile up
    const heat = eio((t - tPile) / 1.0) * (1 - 0.45 * eio((t - tSlow) / 1.2));
    if (heat > 0) [760, 1090].forEach((cy) => { g = c.createRadialGradient(722, cy, 10, 722, cy, 300); g.addColorStop(0, `rgba(255,110,20,${0.55 * heat})`); g.addColorStop(1, 'rgba(255,110,20,0)'); c.fillStyle = g; c.fillRect(380, cy - 320, 680, 640); });
    // the ions
    c.save(); c.globalCompositeOperation = 'lighter'; for (const ion of ions) { const [x, y, kk] = ionPos(ion, t); if (kk > 0 && kk < 1) { const [x2, y2] = ionPos(ion, t - 0.05); const tg = c.createLinearGradient(x2, y2, x, y); tg.addColorStop(0, 'rgba(255,190,70,0)'); tg.addColorStop(1, 'rgba(255,190,70,0.5)'); c.strokeStyle = tg; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x, y); c.stroke(); } } c.restore();
    for (const ion of ions) { const [x, y, kk] = ionPos(ion, t); const hot = ion.pile && kk >= 1 ? clamp((t - ion.t0 - ion.d) / 0.5) : 0; const land = kk >= 1 ? 1 + 0.5 * (1 - eo((t - ion.t0 - ion.d) / 0.3)) : 1; glowDot(c, x, y, (kk > 0 && kk < 1 ? 15 : 14) * land, hot > 0.5); }
    // sparks
    if (t > tPile) { c.save(); c.globalCompositeOperation = 'lighter'; for (const s of sparks) { const u = ((t - tPile - s.t0) % 1.3) / s.life; if (u < 0 || u > 1 || t > tSlow + 0.6) continue; const x = 716 + Math.cos(s.a) * s.v * u * 0.5, y = s.cy + s.off + Math.sin(s.a) * s.v * u * 0.5 + 60 * u * u; c.fillStyle = `rgba(255,${150 + 80 * (1 - u)},60,${1 - u})`; c.beginPath(); c.arc(x, y, 4 * (1 - u) + 1.5, 0, 7); c.fill(); } c.restore(); }
    // labels
    const la = eio((t - (tIons - 0.9)) / 0.4);
    tag(c, 'CATHODE', 190, SHY0 - 6, 0, -70, k, la * (1 - eio((t - tRoom) / 0.4))); tag(c, 'ANODE', 905, SHY0 - 6, 0, -70, k, la * (1 - eio((t - tRoom) / 0.4)));
    const e1 = slots[keep[0]]; tag(c, 'EMPTY', e1.x + 17, e1.y, 70, -52, k, eio((t - wt('room', 'empty')) / 0.3) * (1 - eio((t - tPush + 0.2) / 0.4)));
    tag(c, 'PLATING', 700, 1090, -60, 120, k, eio((t - tPile - 0.5) / 0.3) * (1 - eio((t - tOut + 0.3) / 0.4)));
    // the charging current, stepping down
    const ga = eio((t - (tSlow - 0.5)) / 0.5); if (ga > 0) { c.save(); c.globalAlpha *= ga; const gx = 150, gw = 780, gy = 1640, gh = 150;
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(gx, gy - 20); c.lineTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke(); c.setLineDash([6, 8]); c.beginPath(); c.moveTo(gx + gw * 0.8, gy - 20); c.lineTo(gx + gw * 0.8, gy + gh); c.stroke(); c.setLineDash([]);
      note(c, 'CURRENT', gx, gy - 44, 23, 1); c.save(); c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = `700 23px ${MONO}`; c.fillText('80%', gx + gw * 0.8, gy + gh + 40); c.restore();
      const pts = []; for (let i = 0; i <= 100; i++) { const u = i / 100; pts.push([gx + gw * u, gy + (u < 0.8 ? 0 : gh * 0.92 * (1 - Math.exp(-(u - 0.8) * 16)))]); }
      const kk = eio((t - tSlow + 0.1) / 1.3), n = Math.max(1, Math.round(kk * 100)); c.strokeStyle = GOLD; c.lineWidth = 6; c.lineJoin = 'round'; c.shadowColor = '#ffb030'; c.shadowBlur = 20 * S; c.beginPath(); pts.slice(0, n + 1).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.shadowBlur = 0; glowDot(c, pts[n][0], pts[n][1], 9, false); c.restore(); }
    c.restore();
  }

  // ---- captions: the phrase builds word by word; the spoken word is white and bold, key words get a selection box
  const KEY = new Set(['eighty', 'crawls', 'battery', 'ions', 'empty', 'full', 'pile', 'damage', 'slows', 'purpose']);
  const chunks = []; { let cur = []; T.words.forEach((w, i) => { cur.push(w); const nx = T.words[i + 1]; if (!nx || nx.line !== w.line || /[,.?!]$/.test(w.w) || cur.length >= 4) { chunks.push(cur); cur = []; } }); }
  function captions(c, t) {
    let ch = null; for (const k of chunks) if (t >= k[0].s - 0.03) ch = k; if (!ch) return; const lastE = ch[ch.length - 1].e; const ni = chunks.indexOf(ch) + 1, nextS = chunks[ni] ? chunks[ni][0].s : DUR; const out = clamp((t - Math.min(nextS - 0.02, lastE + 0.7)) / 0.12); if (out >= 1) return;
    const vis = ch.filter((w) => t >= w.s - 0.03), cur = vis[vis.length - 1], size = 46;
    c.save(); c.setTransform(S, 0, 0, S, 0, 0); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.globalAlpha = 1 - out;
    const meas = (w) => { c.font = `${w === cur ? 700 : 400} ${size}px ${SANS}`; return c.measureText(w.w).width; };
    let lines = [vis]; const total = vis.reduce((s, w) => s + meas(w) + 12, -12); if (total > 820) { const h = Math.ceil(vis.length / 2); lines = [vis.slice(0, h), vis.slice(h)]; }
    lines.forEach((ln, li) => { const wd = ln.reduce((s, w) => s + meas(w) + 12, -12); let x = W / 2 - wd / 2; const y = 318 + li * 60;
      for (const w of ln) { const ww = meas(w), isKey = KEY.has(norm(w.w));
        if (isKey) { const p = eo((t - w.s) / 0.18), bx = x - 9, by = y - 43, bw = (ww + 18) * p, bh = 58; c.fillStyle = 'rgba(38,78,190,0.5)'; c.fillRect(bx, by, bw, bh); c.strokeStyle = '#5b8ef8'; c.lineWidth = 2.5; c.strokeRect(bx, by, bw, bh); [[bx, by], [bx + bw, by + bh]].forEach(([hx, hy]) => { c.fillStyle = '#5b8ef8'; c.beginPath(); c.arc(hx, hy, 6.5, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(hx, hy, 3, 0, 7); c.fill(); }); }
        const fresh = w === cur ? eo((t - w.s) / 0.12) : 1; c.font = `${w === cur ? 700 : 400} ${size}px ${SANS}`; c.fillStyle = w === cur || isKey ? `rgba(255,255,255,${fresh})` : 'rgba(255,255,255,0.5)'; c.fillText(w.w, x, y + (1 - fresh) * 8); x += ww + 12; } });
    c.restore();
  }

  // ---- camera
  const cw = (lx, ly) => cellToWorld(lx, ly);
  const POSES = [
    { t: 0, p: [540, 1180], z: 0.86, r: 5 },
    { t: tEighty + 0.3, p: [540, 900], z: 1.45, r: -1.5 },
    { t: wt('inside', 'battery') + 0.25, p: [B[0] + 110, B[1]], z: 1.75, r: 2 },
    { t: tIons + 0.1, p: cw(540, 1010), z: 13.6, r: 0, move: 1.5 },
    { t: tRoom + 0.7, p: cw(880, 960), z: 27, r: -2 },
    { t: tFull + 1.2, p: cw(860, 900), z: 33, r: 1.5 },
    { t: tPile + 0.1, p: cw(700, 930), z: 25, r: -2.5 },
    { t: tSlow + 0.1, p: cw(540, 1180), z: 13.2, r: 0, till: le('push') - 0.2 },
    { t: DUR - 1.0, p: [540, 980], z: 1.1, r: -2, via: 5, move: DUR - 1.0 - tOut },
    { t: DUR + 0.5, p: [540, 980], z: 1.16, r: -2.5 },
  ];
  const keys = [];
  POSES.forEach((A, i) => {
    keys.push({ t: A.t, x: A.p[0], y: A.p[1], lz: Math.log(A.z), r: A.r }); const Bp = POSES[i + 1]; if (!Bp) return;
    const dist = Math.hypot(Bp.p[0] - A.p[0], Bp.p[1] - A.p[1]) * A.z; const move = Bp.move || 1.1; let dep = Bp.t - move; if (A.till && dep < A.till) dep = Math.min(A.till, Bp.t - 0.7);
    if (dep > A.t + 0.3) { const d = Math.min(0.08, 60 / Math.max(dist, 1)); keys.push({ t: dep, x: lerp(A.p[0], Bp.p[0], d), y: lerp(A.p[1], Bp.p[1], d), lz: Math.log(A.z) + clamp((Math.log(Bp.z) - Math.log(A.z)) * 0.08, -0.05, 0.05), r: lerp(A.r, Bp.r, 0.12) }); }
    if (Bp.via) { const d0 = Math.max(dep, A.t); keys.push({ t: (d0 + Bp.t) / 2, x: lerp(A.p[0], Bp.p[0], 0.5), y: lerp(A.p[1], Bp.p[1], 0.5), lz: Math.log(Bp.via), r: lerp(A.r, Bp.r, 0.5) }); }
  });
  function pchip(ts, ys) {
    const n = ts.length, h = [], d = [], m = new Array(n); for (let i = 0; i < n - 1; i++) { h[i] = ts[i + 1] - ts[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
    m[0] = d[0]; m[n - 1] = d[n - 2]; for (let i = 1; i < n - 1; i++) { if (d[i - 1] * d[i] <= 0) m[i] = 0; else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); } }
    return (t) => { t = clamp(t, ts[0], ts[n - 1]); let i = 0; while (i < n - 2 && t > ts[i + 1]) i++; const s = (t - ts[i]) / h[i], s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * h[i] * m[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * h[i] * m[i + 1]; };
  }
  const kt = keys.map((k) => k.t), TAPS = [[-0.24, 0.06], [-0.16, 0.12], [-0.08, 0.2], [0, 0.24], [0.08, 0.2], [0.16, 0.12], [0.24, 0.06]];
  const soft = (f) => (t) => TAPS.reduce((v, [d, w]) => v + f(t + d) * w, 0);
  // x and y are followed in "screen" terms: interpolate them together with zoom so deep dives stay centred
  const fz = soft(pchip(kt, keys.map((k) => k.lz))), fx = soft(pchip(kt, keys.map((k) => k.x))), fy = soft(pchip(kt, keys.map((k) => k.y))), frr = soft(pchip(kt, keys.map((k) => k.r)));
  function camAt(t) {
    const z = Math.exp(fz(t)); const hx = Math.sin(t * 1.31) * 5 + Math.sin(t * 2.17 + 1.3) * 3, hy = Math.sin(t * 1.07 + 2.1) * 5 + Math.sin(t * 2.63 + 0.2) * 2.5;
    return { x: fx(t) + hx / z, y: fy(t) + hy / z, z, r: (frr(t) + Math.sin(t * 0.83 + 0.7) * 0.25) * D2R };
  }

  // ---- frame
  const grain = mk(512, 512); (function () { const c = grain.getContext('2d'), d = c.createImageData(512, 512), r = rng(99); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 150; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); })();
  const scratch = mk(W * S, H * S), sctx = scratch.getContext('2d'), small = mk(W * S / 6, H * S / 6), smctx = small.getContext('2d');
  const dust = []; { const r = rng(8); for (let i = 0; i < 60; i++) dust.push([r() * 2400 - 660, r() * 3200 - 640, 1 + r() * 2.5, r() * 6.28]); }
  function drawWorld(g, t) {
    const cam = camAt(t); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; const bg = g.createRadialGradient(W * S / 2, H * S * 0.55, 0, W * S / 2, H * S * 0.55, H * S * 0.75); bg.addColorStop(0, '#15131b'); bg.addColorStop(1, '#050507'); g.fillStyle = bg; g.fillRect(0, 0, W * S, H * S);
    g.setTransform(S, 0, 0, S, 0, 0); g.translate(W / 2, H / 2); g.rotate(-cam.r); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
    for (const [x, y, rad, ph] of dust) { g.fillStyle = `rgba(255,220,160,${0.12 + 0.1 * Math.sin(t * 0.8 + ph)})`; g.beginPath(); g.arc(x + Math.sin(t * 0.3 + ph) * 20, y - t * 6, rad, 0, 7); g.fill(); }
    phone(g, t); cell(g, t, cam.z);
  }
  const SHUTTER = 0.5 / FPS;
  function seek(t) {
    const a = camAt(t), b = camAt(t + SHUTTER); const px = (Math.hypot(b.x - a.x, b.y - a.y) * a.z + Math.abs(Math.log(b.z / a.z)) * H * 0.5 + Math.abs(b.r - a.r) * H * 0.5) * S; const n = clamp(Math.ceil(px / 4), 1, 8);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    if (n === 1) drawWorld(ctx, t); else for (let k = 0; k < n; k++) { drawWorld(sctx, t + SHUTTER * k / n); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 / (k + 1); ctx.drawImage(scratch, 0, 0); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    smctx.filter = `blur(${6 * S}px)`; smctx.drawImage(cv, 0, 0, small.width, small.height); smctx.filter = 'none'; ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.34; ctx.drawImage(small, 0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // soft dark falloff at the top (behind the captions) and the bottom, and a vignette
    let g = ctx.createLinearGradient(0, 0, 0, cv.height * 0.3); g.addColorStop(0, 'rgba(5,5,7,0.96)'); g.addColorStop(0.55, 'rgba(5,5,7,0.7)'); g.addColorStop(1, 'rgba(5,5,7,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height * 0.3);
    g = ctx.createLinearGradient(0, cv.height * 0.84, 0, cv.height); g.addColorStop(0, 'rgba(5,5,7,0)'); g.addColorStop(1, 'rgba(5,5,7,0.8)'); ctx.fillStyle = g; ctx.fillRect(0, cv.height * 0.84, cv.width, cv.height * 0.16);
    g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, cv.height * 0.3, cv.width / 2, cv.height / 2, cv.height * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    captions(ctx, t); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const f = Math.round(t * FPS), gr = rng(f * 7919 + 13); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.09; const gs = 512 * Math.max(1, S), ox = -gr() * gs, oy = -gr() * gs; for (let y = oy; y < cv.height; y += gs) for (let x = ox; x < cv.width; x += gs) ctx.drawImage(grain, x, y, gs, gs);
    ctx.globalCompositeOperation = 'source-over'; const fade = Math.max(1 - eio(t / 0.5), eio((t - (DUR - 0.45)) / 0.4)); if (fade > 0) { ctx.globalAlpha = fade; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height); } ctx.globalAlpha = 1;
  }
  (async () => {
    await Promise.all([`400 40px ${SANS}`, `700 40px ${SANS}`, `700 20px ${MONO}`, `500 20px ${MONO}`].map((f) => document.fonts.load(f)));
    window.seek = seek; window.DURATION = DUR; window.CUES = CUES.sort((a, b) => a.t - b.t); window.camAt = camAt; window.FPS = FPS;
    window.HEROS = [0.9, tEighty + 0.5, wt('hook', 'crawls') + 0.3, wt('inside', 'battery') + 0.4, tIons - 0.5, tIons + 0.8, le('inside'), wt('room', 'empty') + 0.5, tFull + 1.3, le('full'), tPile + 0.6, tDamage + 0.5, tSlow + 0.9, tOut + 0.3, DUR - 0.8];
    window.__ready = true; seek(+(new URLSearchParams(location.search).get('t') || 0));
  })();
})();
