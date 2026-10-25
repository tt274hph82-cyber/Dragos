// Metallic Stabs — generative music video. Every frame is drawn from time t alone.
(function () {
  const W = 1920, H = 1080;
  const cv = document.getElementById("cv");
  const ctx = cv.getContext("2d");
  const BPM = 128.15, BEAT = 60 / BPM, OFF = 0.419, BAR = BEAT * 4;
  const C = { bg: "#050608", cyan: "#19e6ff", red: "#ff2d3d", amber: "#ffb020", steel: "#cfd6df", dim: "#3a4350" };

  // ---------- deterministic helpers ----------
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rnd = (i, salt = 0) => mulberry((i * 9973 + salt * 7919 + 12345) | 0)();
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
  const easeIn = (k) => Math.pow(clamp(k), 3);
  const beatPos = (t) => (t - OFF) / BEAT;
  const beatIdx = (t) => Math.floor(beatPos(t));
  const sinceBeat = (t) => { const p = beatPos(t); return (p - Math.floor(p)) * BEAT; };
  const kick = (t, dec = 0.18) => Math.exp(-sinceBeat(t) / dec);
  function steelGrad(x0, y0, x1, y1, tint) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "#2b2f36"); g.addColorStop(0.45, tint || "#cfd6df"); g.addColorStop(0.55, "#8d96a3"); g.addColorStop(1, "#3c424c");
    return g;
  }
  function clear(col = C.bg) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
  function vignette(a = 0.7) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function grain(t, n = 380) {
    const f = Math.floor(t * 30);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < n; i++) ctx.fillRect(rnd(f, i) * W, rnd(f, i + 999) * H, 2, 2);
  }
  function flash(k, col = "255,255,255") { if (k <= 0) return; ctx.fillStyle = `rgba(${col},${clamp(k)})`; ctx.fillRect(0, 0, W, H); }
  function mono(px) { return `${px}px "JetBrains Mono", monospace`; }

  // ---------- title particles (built once fonts are ready) ----------
  let titlePts = [];
  function buildTitle() {
    const oc = document.createElement("canvas"); oc.width = W; oc.height = 400;
    const o = oc.getContext("2d");
    o.fillStyle = "#fff"; o.font = '170px "Archivo Black", sans-serif'; o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText("METALLIC STABS", W / 2, 200);
    const d = o.getImageData(0, 0, W, 400).data;
    titlePts = [];
    for (let y = 0; y < 400; y += 7) for (let x = 0; x < W; x += 7) if (d[(y * W + x) * 4 + 3] > 128) titlePts.push([x, y + 340]);
  }

  // ---------- 1. BOOT ----------
  const bootLines = ["> init forge.core ............ OK", "> mount /dev/stab_array0 ...... OK", "> calibrate presses [12/12] ... OK", "> lock tempo 128 bpm ......... OK", "> arm"];
  function boot(t) {
    clear();
    ctx.font = mono(34); ctx.textBaseline = "top";
    bootLines.forEach((ln, i) => {
      const st = 0.3 + i * 0.75, n = Math.floor(clamp((t - st) * 38, 0, ln.length));
      if (n <= 0) return;
      const s = ln.slice(0, n);
      ctx.fillStyle = "#7f93a8"; ctx.fillText(s.replace(/OK$/, ""), 140, 150 + i * 56);
      if (s.endsWith("OK")) { ctx.fillStyle = C.cyan; ctx.fillText("OK", 140 + ctx.measureText(s.slice(0, -2)).width, 150 + i * 56); }
      if (i === bootLines.length - 1 && Math.floor(t * 4) % 2 === 0) { ctx.fillStyle = C.red; ctx.fillRect(140 + ctx.measureText(s).width + 8, 152 + i * 56, 18, 36); }
    });
    // scanline sweeps
    const sy = ((t % 3.2) / 3.2) * H;
    const g = ctx.createLinearGradient(0, sy - 140, 0, sy);
    g.addColorStop(0, "rgba(25,230,255,0)"); g.addColorStop(1, "rgba(25,230,255,0.10)");
    ctx.fillStyle = g; ctx.fillRect(0, sy - 140, W, 140);
    ctx.fillStyle = C.cyan; ctx.fillRect(0, sy, W, 2);
    // title assembles
    const k = easeOut((t - 4.0) / 2.6);
    if (t > 4.0) {
      ctx.fillStyle = steelGrad(0, 380, 0, 700);
      titlePts.forEach((p, i) => {
        const sx = rnd(i, 1) * W, syy = rnd(i, 2) * H;
        const x = lerp(sx, p[0], k), y = lerp(syy, p[1], k);
        ctx.globalAlpha = clamp((t - 4.0) * 1.5);
        ctx.fillRect(x, y, 6, 6);
      });
      ctx.globalAlpha = 1;
    }
    // glitch slices into the build
    if (t > 6.9) { const j = (t - 6.9) / 0.46; for (let i = 0; i < 9; i++) { const y = rnd(i, Math.floor(t * 20)) * H, h = 20 + rnd(i, 7) * 60; ctx.drawImage(cv, 0, y, W, h, (rnd(i, 3) - 0.5) * 240 * j, y, W, h); } }
    vignette(); grain(t);
  }

  // ---------- 2. CIRCUIT ----------
  const traces = [];
  (function () {
    const R = mulberry(77);
    for (let k = 0; k < 64; k++) {
      const pts = [[W / 2, H / 2]]; let x = W / 2, y = H / 2, dir = Math.floor(R() * 8);
      const side = k % 4; // leave from a side of the chip
      x += [130, 0, -130, 0][side]; y += [0, 130, 0, -130][side]; pts.push([x, y]); dir = [0, 2, 4, 6][side];
      const segs = 3 + Math.floor(R() * 4);
      for (let s = 0; s < segs; s++) {
        dir = (dir + [0, 1, -1, 0, 1, -1][Math.floor(R() * 6)] + 8) % 8;
        const len = 80 + R() * 260, a = (dir * Math.PI) / 4;
        x += Math.cos(a) * len; y += Math.sin(a) * len; pts.push([x, y]);
      }
      let tot = 0; const lens = [0];
      for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(tot); }
      traces.push({ pts, lens, tot, st: k * 0.17 });
    }
  })();
  function along(tr, d) {
    for (let i = 1; i < tr.pts.length; i++) if (d <= tr.lens[i]) { const k = (d - tr.lens[i - 1]) / (tr.lens[i] - tr.lens[i - 1]); return [lerp(tr.pts[i - 1][0], tr.pts[i][0], k), lerp(tr.pts[i - 1][1], tr.pts[i][1], k)]; }
    return tr.pts[tr.pts.length - 1];
  }
  function drawTrace(tr, d) {
    ctx.beginPath(); ctx.moveTo(tr.pts[0][0], tr.pts[0][1]);
    for (let i = 1; i < tr.pts.length; i++) { if (d >= tr.lens[i]) ctx.lineTo(tr.pts[i][0], tr.pts[i][1]); else { const p = along(tr, d); ctx.lineTo(p[0], p[1]); break; } }
    ctx.stroke();
  }
  function circuit(t, lt, d) {
    clear();
    const z = 1 + 0.35 * (lt / d);
    ctx.setTransform(z, 0, 0, z, W / 2 * (1 - z), H / 2 * (1 - z));
    ctx.translate(W / 2, H / 2); ctx.rotate(lt * 0.004); ctx.translate(-W / 2, -H / 2);
    const warm = lt > d * 0.55;
    ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    traces.forEach((tr, k) => {
      const grow = clamp((lt - tr.st) * 520, 0, tr.tot);
      if (grow <= 0) return;
      ctx.strokeStyle = warm && k % 3 === 0 ? "#6a4a20" : "#2f3844"; drawTrace(tr, grow);
      if (grow >= tr.tot) { const e = tr.pts[tr.pts.length - 1]; ctx.fillStyle = "#56606e"; ctx.beginPath(); ctx.arc(e[0], e[1], 9, 0, 7); ctx.fill(); }
    });
    // pulses on beats
    const bi = beatIdx(t), sb = sinceBeat(t) / BEAT;
    for (let b = bi - 1; b <= bi; b++) {
      const prog = b === bi ? sb : sb + 1;
      for (let j = 0; j < 7; j++) {
        const tr = traces[Math.floor(rnd(b, j) * traces.length)];
        const dd = prog * tr.tot * 0.9;
        if (dd > tr.tot || lt < tr.st + tr.tot / 520) continue;
        const p = along(tr, dd);
        ctx.fillStyle = warm && j % 2 ? C.amber : C.cyan;
        ctx.globalAlpha = 1 - prog * 0.6; ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7); ctx.fill();
        for (let q = 1; q < 6; q++) { const pp = along(tr, Math.max(0, dd - q * 18)); ctx.globalAlpha = (1 - prog * 0.6) * (1 - q / 6); ctx.beginPath(); ctx.arc(pp[0], pp[1], 7 - q, 0, 7); ctx.fill(); }
      }
    }
    ctx.globalAlpha = 1;
    // the chip
    const kb = kick(t, 0.2);
    ctx.fillStyle = steelGrad(W / 2 - 130, H / 2 - 130, W / 2 + 130, H / 2 + 130); ctx.fillRect(W / 2 - 130, H / 2 - 130, 260, 260);
    ctx.fillStyle = "#0b0e12"; ctx.fillRect(W / 2 - 100, H / 2 - 100, 200, 200);
    ctx.fillStyle = `rgba(25,230,255,${0.25 + 0.75 * kb})`; ctx.fillRect(W / 2 - 40, H / 2 - 40, 80, 80);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = "#8d96a3"; [[-150, -105 + i * 30, 20, 10], [130, -105 + i * 30, 20, 10], [-105 + i * 30, -150, 10, 20], [-105 + i * 30, 130, 10, 20]].forEach((r) => ctx.fillRect(W / 2 + r[0], H / 2 + r[1], r[2], r[3])); }
    if (warm) { ctx.font = mono(22); ctx.fillStyle = "#6f7c8c"; traces.slice(0, 24).forEach((tr, k) => { const e = tr.pts[tr.pts.length - 1]; ctx.fillText(["U", "R", "C", "Q"][k % 4] + (k + 3), e[0] + 14, e[1] - 26); }); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    vignette(); grain(t);
  }

  // ---------- 3. CHARGE ----------
  function charge(t, lt, d) {
    clear();
    const sp = Math.pow(lt / d, 2.2);
    for (let i = 0; i < 9; i++) {
      const r = 70 + i * 58, rot = (i % 2 ? 1 : -1) * (lt * (0.4 + i * 0.12) + sp * 40 * (1 + i * 0.2));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(rot);
      ctx.strokeStyle = steelGrad(-r, -r, r, r, i === 8 ? C.cyan : null); ctx.lineWidth = 10 + (i % 3) * 6;
      ctx.setLineDash([40 + i * 14, 18 + i * 6]); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.setLineDash([]);
    for (let i = 0; i < 120; i++) { const a = (i / 120) * Math.PI * 2 + lt * 0.2, r0 = 620, r1 = 620 + (i % 5 === 0 ? 50 : 24) * (0.6 + 0.6 * kick(t)); ctx.strokeStyle = i % 5 === 0 ? C.cyan : "#4a525e"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1); ctx.stroke(); }
    const cr = 30 + sp * 520;
    ctx.fillStyle = `rgba(230,250,255,${0.15 + sp * 0.85})`; ctx.beginPath(); ctx.arc(W / 2, H / 2, cr, 0, 7); ctx.fill();
    vignette(0.6); grain(t);
    flash(easeIn((lt - (d - 0.6)) / 0.6) * 0.9);
  }

  // ---------- floor grid (used by PRESS) ----------
  function floor(lt, speed, col = "rgba(80,95,115,0.55)") {
    const hy = H * 0.46;
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    for (let i = -24; i <= 24; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 22, hy); ctx.lineTo(W / 2 + i * 260, H); ctx.stroke(); }
    const off = (lt * speed) % 1;
    for (let j = 0; j < 18; j++) { const z = j + 1 - off; const y = hy + (H - hy) * (1 / (z * 0.35 + 0.6)) * 0.6; if (y < hy || y > H) continue; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  // ---------- 4. PRESS (drop 1) ----------
  function blade(x, y, ang, len, wid, edge) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = steelGrad(0, -wid, 0, wid);
    ctx.beginPath(); ctx.moveTo(-len, -wid); ctx.lineTo(0, -wid * 0.35); ctx.lineTo(40, 0); ctx.lineTo(0, wid * 0.35); ctx.lineTo(-len, wid); ctx.closePath(); ctx.fill();
    ctx.fillStyle = edge; ctx.fillRect(-len, -4, len - 10, 8);
    ctx.restore();
  }
  function sparks(x, y, age, seed, n = 34, col = C.amber) {
    if (age < 0 || age > 0.9) return;
    for (let i = 0; i < n; i++) {
      const a = rnd(seed, i) * Math.PI * 2, v = 300 + rnd(seed, i + 50) * 900;
      const px = x + Math.cos(a) * v * age, py = y + Math.sin(a) * v * age + 900 * age * age;
      ctx.fillStyle = i % 4 === 0 ? "#fff" : col; ctx.globalAlpha = 1 - age / 0.9;
      ctx.fillRect(px, py, 4, 4 + v * 0.01);
    }
    ctx.globalAlpha = 1;
  }
  function press(t, lt, d) {
    clear();
    const dip = lt > 25.4 && lt < 29.4;
    const kb = dip ? 0 : kick(t);
    ctx.save(); ctx.translate((rnd(beatIdx(t), 5) - 0.5) * 22 * kb, (rnd(beatIdx(t), 6) - 0.5) * 22 * kb);
    floor(lt, dip ? 0.4 : 2.0 + kb * 2);
    const bi = beatIdx(t), b0 = beatIdx(t - lt);
    const group = Math.floor((bi - b0) / 16) % 4;
    const edge = group % 2 ? C.red : C.cyan;
    if (!dip) for (let b = bi - 2; b <= bi; b++) {
      const age = t - (OFF + b * BEAT); if (age < 0) continue;
      const r1 = rnd(b, 11), r2 = rnd(b, 12);
      let x, y, ang;
      if (group === 0) { ang = b % 2 ? -0.5 : Math.PI + 0.5; x = W / 2 + (b % 2 ? 1 : -1) * (60 + r1 * 200); y = H / 2 + (r2 - 0.5) * 300; }
      else if (group === 1) { ang = Math.PI / 2; x = 300 + (b % 4) * 440; y = 360 + r2 * 300; }
      else if (group === 2) { ang = (b % 4) * (Math.PI / 2) + Math.PI / 4; x = W / 2 + Math.cos(ang) * 40; y = H / 2 + Math.sin(ang) * 40; }
      else { ang = b % 2 ? 0 : Math.PI; x = W / 2 + (b % 2 ? 1 : -1) * 120; y = 260 + (b % 4) * 180; }
      const slam = easeOut(age / 0.09), out = clamp((age - BEAT * 1.6) / (BEAT * 0.6));
      const len = 1400, dx = Math.cos(ang) * (1 - slam) * -900, dy = Math.sin(ang) * (1 - slam) * -900;
      ctx.globalAlpha = 1 - out; blade(x + dx, y + dy, ang, len, 46, edge); ctx.globalAlpha = 1;
      sparks(x + Math.cos(ang) * 40, y + Math.sin(ang) * 40, age - 0.05, b);
    }
    if (dip) { // sparks rain slowly
      for (let i = 0; i < 160; i++) { const x = rnd(i, 21) * W, sp = 120 + rnd(i, 22) * 200, y = ((rnd(i, 23) * H + (lt - 25.4) * sp) % H); ctx.fillStyle = i % 5 ? C.amber : "#fff"; ctx.globalAlpha = 0.7; ctx.fillRect(x, y, 3, 10); }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // HUD counter
    ctx.font = mono(26); ctx.fillStyle = "#5d6a7a"; ctx.fillText("STAB " + String(Math.max(0, bi - b0)).padStart(3, "0"), 80, 70);
    vignette(); grain(t);
    flash(1 - lt / 0.3);
  }

  // ---------- 5. TUNNEL ----------
  function tunnel(t, lt, d) {
    clear();
    const dip = lt > 25.4 && lt < 29.0;
    const shape = [6, 4, 3, 8, 5, 12][Math.floor(lt / (BAR * 8)) % 6];
    const red = lt > 29.0;
    const speed = dip ? 0 : 1;
    // distance travelled: smooth base + beat surges
    const bp = beatPos(t) - beatPos(t - lt);
    const dist = dip ? 25.4 * 2.2 + Math.floor(25.4 / BEAT) * 0.8 : lt * 2.2 + Math.floor(bp) * 0.8 + easeOut(bp % 1) * 0.8;
    const N = 26, gap = 1;
    for (let i = N; i >= 0; i--) {
      const z = i * gap - (dist % gap) + 0.3;
      const s = 520 / z; if (s > 3000) continue;
      const rot = lt * 0.15 + (Math.floor(dist) + i) * 0.05;
      const near = clamp(1 - z / N);
      const idx = Math.floor(dist) + i;
      const lit = !dip && idx % 4 === 0 && kick(t) > 0.3;
      ctx.strokeStyle = lit ? (red ? C.red : C.cyan) : `rgba(${Math.round(80 + 160 * near)},${Math.round(90 + 160 * near)},${Math.round(105 + 150 * near)},${0.25 + 0.75 * near})`;
      ctx.lineWidth = 2 + near * 10;
      ctx.beginPath();
      for (let v = 0; v <= shape; v++) { const a = (v / shape) * Math.PI * 2 + rot; const x = W / 2 + Math.cos(a) * s * 1.4, y = H / 2 + Math.sin(a) * s; v ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // rails to next frame
      if (i < N) { const z2 = z + gap, s2 = 520 / z2, rot2 = lt * 0.15 + (Math.floor(dist) + i + 1) * 0.05; ctx.lineWidth = 1 + near * 3; ctx.strokeStyle = `rgba(120,135,150,${0.15 + 0.4 * near})`; for (let v = 0; v < shape; v++) { const a = (v / shape) * Math.PI * 2 + rot, a2 = (v / shape) * Math.PI * 2 + rot2; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * s * 1.4, H / 2 + Math.sin(a) * s); ctx.lineTo(W / 2 + Math.cos(a2) * s2 * 1.4, H / 2 + Math.sin(a2) * s2); ctx.stroke(); } }
    }
    if (dip) { const k = (lt - 25.4) / 3.6, r = 120 + 80 * Math.sin(k * Math.PI * 4); ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, 7); ctx.stroke(); }
    vignette(0.75); grain(t);
  }

  // ---------- 6. RACKS ----------
  function racks(t, lt, d) {
    clear();
    const vp = [W / 2, H / 2], depth = 14;
    const bi = beatIdx(t), mode = Math.floor(lt / (BAR * 2)) % 4;
    for (const side of [-1, 1]) {
      for (let c = depth; c >= 1; c--) {
        const z0 = c + 0.3 - (lt * 0.35) % 1, z1 = z0 + 0.9;
        if (z0 <= 0.2) continue;
        const x0 = vp[0] + side * 900 / z0, x1 = vp[0] + side * 900 / z1;
        const yt0 = vp[1] - 700 / z0, yb0 = vp[1] + 700 / z0, yt1 = vp[1] - 700 / z1, yb1 = vp[1] + 700 / z1;
        ctx.fillStyle = "#0d1117"; ctx.beginPath(); ctx.moveTo(x0, yt0); ctx.lineTo(x1, yt1); ctx.lineTo(x1, yb1); ctx.lineTo(x0, yb0); ctx.fill();
        ctx.strokeStyle = "#2a313b"; ctx.lineWidth = 2; ctx.stroke();
        // LEDs: 10 rows x 3 cols
        for (let r = 0; r < 10; r++) for (let q = 0; q < 3; q++) {
          const u = (q + 0.5) / 3, v = (r + 0.5) / 10;
          const x = lerp(x0, x1, u), yt = lerp(yt0, yt1, u), yb = lerp(yb0, yb1, u), y = lerp(yt, yb, v);
          let on;
          if (mode === 0) on = (r + c + bi) % 6 === 0;
          else if (mode === 1) on = ((bi >> (r % 5)) & 1) === 1 && q === 1;
          else if (mode === 2) on = rnd(bi * 50 + c, r * 3 + q) > 0.72;
          else on = Math.abs(r - ((bi * 2) % 10)) < 1.5;
          const sz = Math.max(2, 26 / z0);
          ctx.fillStyle = on ? (r % 4 === 0 ? C.red : C.cyan) : "#1b222b";
          ctx.fillRect(x - sz / 2, y - sz / 4, sz, sz / 2);
        }
      }
    }
    // red laser scan per bar
    const k = ((t - OFF) % BAR) / BAR, ly = lerp(120, H - 120, k);
    ctx.fillStyle = "rgba(255,45,61,0.85)"; ctx.fillRect(0, ly, W, 3);
    ctx.fillStyle = "rgba(255,45,61,0.12)"; ctx.fillRect(0, ly - 30, W, 60);
    vignette(0.7); grain(t);
  }

  // ---------- 7. CORE ----------
  const spherePts = [];
  for (let la = -8; la <= 8; la++) for (let lo = 0; lo < 24; lo++) spherePts.push([la, lo]);
  function sph(la, lo, R, ry, rx) {
    const phi = (la / 8) * (Math.PI / 2), th = (lo / 24) * Math.PI * 2 + ry;
    let x = Math.cos(phi) * Math.cos(th), y = Math.sin(phi), z = Math.cos(phi) * Math.sin(th);
    const y2 = y * Math.cos(rx) - z * Math.sin(rx), z2 = y * Math.sin(rx) + z * Math.cos(rx);
    return [W / 2 + x * R, H / 2 + y2 * R, z2];
  }
  function drawSphere(R, ry, rx, alpha, col) {
    ctx.lineWidth = 2;
    for (let la = -8; la <= 8; la++) for (let lo = 0; lo < 24; lo++) {
      const p = sph(la, lo, R, ry, rx), q = sph(la, lo + 1, R, ry, rx);
      const f = (p[2] + 1) / 2;
      ctx.strokeStyle = col ? col : `rgba(${150 + 90 * f},${160 + 90 * f},${175 + 80 * f},${alpha * (0.2 + 0.8 * f)})`;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      if (la < 8) { const r2 = sph(la + 1, lo, R, ry, rx); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke(); }
    }
  }
  function core(t, lt, d) {
    clear();
    const build = clamp((lt - 24) / (d - 24));
    const ry = lt * 0.25 + Math.pow(build, 2) * 18, rx = 0.35 + Math.sin(lt * 0.1) * 0.15;
    let R = 300 - build * 120;
    const hits = [135.0 - 120.355, 142.0 - 120.355];
    hits.forEach((h) => { const a = lt - h; if (a > 0 && a < 1.6) { R += 50 * Math.exp(-a * 4); ctx.strokeStyle = `rgba(25,230,255,${1 - a / 1.6})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(W / 2, H / 2, 300 + a * 900, 0, 7); ctx.stroke(); } });
    // dust
    for (let i = 0; i < 200; i++) { const x = (rnd(i, 31) * W + lt * (10 + rnd(i, 32) * 30)) % W, y = (rnd(i, 33) * H - lt * (5 + rnd(i, 34) * 15) + H * 10) % H; ctx.fillStyle = `rgba(200,215,230,${0.15 + rnd(i, 35) * 0.3})`; ctx.fillRect(x, y, 2, 2); }
    drawSphere(R, ry, rx, 0.9);
    if (build > 0) { for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, r0 = 900 - build * 600; ctx.strokeStyle = `rgba(25,230,255,${build})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * (r0 + 120), H / 2 + Math.sin(a) * (r0 + 120)); ctx.stroke(); } }
    vignette(0.75); grain(t);
  }

  // ---------- 8. SHATTER / KALEIDO ----------
  function shatter(t, lt, d) {
    clear();
    if (lt < 1.6) { // sphere explodes
      const k = easeOut(lt / 1.4);
      for (let i = 0; i < spherePts.length; i += 2) {
        const p = sph(spherePts[i][0], spherePts[i][1], 180, 18.3, 0.4);
        const dx = p[0] - W / 2, dy = p[1] - H / 2;
        const x = p[0] + dx * k * 5, y = p[1] + dy * k * 5;
        ctx.save(); ctx.translate(x, y); ctx.rotate(rnd(i, 41) * 6 + lt * 8);
        ctx.fillStyle = steelGrad(-20, -6, 20, 6); ctx.globalAlpha = 1 - lt / 1.6; ctx.fillRect(-26, -5, 52, 10); ctx.restore();
      }
      ctx.globalAlpha = 1; flash(1 - lt / 0.3); vignette(); grain(t); return;
    }
    const freeze = lt > 12.8 && lt < 14.6;
    const tt = freeze ? 12.8 : lt;
    const bi = beatIdx(freeze ? t - (lt - 12.8) : t), kb = freeze ? 0 : kick(t);
    const accent = lt > 14.6 ? C.cyan : C.red;
    const folds = 12;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(tt * 0.12);
    for (let f = 0; f < folds; f++) {
      ctx.save(); ctx.rotate((f / folds) * Math.PI * 2); if (f % 2) ctx.scale(1, -1);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1300, 0, (Math.PI * 2) / folds); ctx.closePath(); ctx.clip();
      for (let j = 0; j < 6; j++) {
        const r = 80 + j * 150 + ((tt * 120 + j * 40) % 150), a = rnd(bi, j) * 0.4 + 0.05, len = 100 + rnd(bi, j + 9) * 260;
        ctx.save(); ctx.rotate(a); ctx.translate(r, 0);
        ctx.fillStyle = steelGrad(0, -18, 0, 18); ctx.fillRect(0, -14 - kb * 6, len, 28 + kb * 12);
        ctx.fillStyle = accent; ctx.fillRect(0, -3, len * (0.3 + 0.7 * kb), 6);
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = "#050608"; ctx.beginPath(); ctx.arc(W / 2, H / 2, 70 + kb * 30, 0, 7); ctx.fill();
    ctx.strokeStyle = accent; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W / 2, H / 2, 70 + kb * 30, 0, 7); ctx.stroke();
    if (freeze) { ctx.fillStyle = "rgba(5,6,8,0.55)"; ctx.fillRect(0, 0, W, H); ctx.font = mono(30); ctx.fillStyle = "#8d96a3"; ctx.fillText("HOLD", W / 2 - 36, H / 2 + 120); }
    vignette(0.7); grain(t);
  }

  // ---------- 9. CITY ----------
  function city(t, lt, d) {
    clear();
    if (lt < 3.4) { // signal glitch
      const f = Math.floor(lt * 24);
      for (let i = 0; i < 70; i++) { const y = rnd(f, i) * H, h = 2 + rnd(f, i + 70) * 18; ctx.fillStyle = `rgba(${120 + rnd(f, i + 140) * 100},${130 + rnd(f, i + 210) * 100},${150 + rnd(f, i + 280) * 90},${0.15 + rnd(f, i + 350) * 0.4})`; ctx.fillRect(rnd(f, i + 420) * W * 0.3, y, W * (0.4 + rnd(f, i + 490) * 0.6), h); }
      ctx.font = mono(40); ctx.fillStyle = Math.floor(lt * 3) % 2 ? C.cyan : "#8d96a3"; ctx.fillText("RECALIBRATING_", W / 2 - 170, H / 2);
      vignette(); return;
    }
    const lt2 = lt - 3.4, hy = H * 0.34, camZ = lt2 * 3.2, bi = beatIdx(t);
    ctx.strokeStyle = "rgba(25,230,255,0.25)"; ctx.lineWidth = 1.5;
    for (let i = -30; i <= 30; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 10, hy); ctx.lineTo(W / 2 + i * 220, H); ctx.stroke(); }
    const towers = [];
    for (let zi = Math.floor(camZ) + 28; zi >= Math.floor(camZ) + 1; zi--) for (let xi = -7; xi <= 7; xi++) {
      if (Math.abs(xi) < 1) continue;
      const seed = zi * 31 + xi;
      if (rnd(seed, 1) < 0.45) continue;
      const z = zi - camZ; if (z <= 1.6) continue;
      const base = 0.6 + rnd(seed, 2) * 2.4, pump = (rnd(bi, seed % 97) > 0.6 ? 1 : 0) * kick(t, 0.25) * 0.8;
      towers.push({ x: xi * 1.6, z, h: base + pump, seed });
    }
    towers.forEach((o) => {
      const s = 600 / o.z, x = W / 2 + o.x * s, yb = hy + 480 / o.z * 1.2, w = 0.9 * s, h = o.h * s;
      const near = clamp(1 - o.z / 28);
      ctx.globalAlpha = clamp((o.z - 1.6) / 1.2);
      ctx.fillStyle = `rgb(${12 + 30 * near},${15 + 34 * near},${20 + 40 * near})`; ctx.fillRect(x - w / 2, yb - h, w, h);
      ctx.fillStyle = `rgba(207,214,223,${0.15 + 0.5 * near})`; ctx.fillRect(x - w / 2, yb - h, w, Math.max(1, 3 * near));
      ctx.fillStyle = rnd(o.seed, 4) > 0.7 ? `rgba(255,45,61,${near})` : `rgba(25,230,255,${0.6 * near})`;
      for (let wy = 0; wy < 5; wy++) if (rnd(o.seed, 10 + wy) > 0.5) ctx.fillRect(x - w / 2 + w * 0.2, yb - h + h * (0.15 + wy * 0.16), w * 0.6, Math.max(1, 2 * near));
      ctx.globalAlpha = 1;
    });
    vignette(0.7); grain(t);
  }

  // ---------- 10. OVERLOAD (one beat of each world, remixed) ----------
  const worlds = [];
  function overload(t, lt, d) {
    const bi = beatIdx(t), w = worlds[((bi % worlds.length) + worlds.length) % worlds.length];
    w.fn(t, w.at + (bi % 7) * 1.3, w.d);
    const k = kick(t, 0.12);
    // colour split slices
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.35 * k;
    ctx.drawImage(cv, 14 * k, 0); ctx.drawImage(cv, -14 * k, 0);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    flash(1 - lt / 0.3);
  }

  // ---------- 11. POWER DOWN ----------
  const downLines = ["> stab_array .......... offline", "> core temp ........... nominal", "> forge ................ idle"];
  function powerdown(t, lt, d) {
    clear();
    const k = clamp(lt / d);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 3;
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, r = (1 - easeOut(k)) * 1100 + 40; ctx.globalAlpha = 1 - k * 0.6; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r); ctx.lineTo(W / 2 + Math.cos(a) * (r + 60), H / 2 + Math.sin(a) * (r + 60)); ctx.stroke(); }
    ctx.globalAlpha = 1;
    const sy = H / 2 + Math.sin(lt * 1.2) * 300;
    ctx.fillStyle = C.cyan; ctx.fillRect(0, sy, W, 2);
    ctx.font = mono(34); ctx.textBaseline = "top";
    downLines.forEach((ln, i) => { const n = Math.floor(clamp((lt - 0.4 - i * 1.6) * 34, 0, ln.length)); if (n > 0) { ctx.fillStyle = "#7f93a8"; ctx.fillText(ln.slice(0, n), 140, 760 + i * 56); } });
    vignette(); grain(t);
  }

  // ---------- 12. FINAL HIT ----------
  function finalhit(t, lt, d) {
    clear();
    const hit = 210.0 - 209.315, a = lt - hit;
    if (a < 0) { const k = clamp(lt / hit); ctx.fillStyle = `rgba(25,230,255,${k})`; ctx.fillRect(W / 2 - 400 * k, H / 2 - 1, 800 * k, 2); grain(t); return; }
    const stamp = easeOut(a / 0.12);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(lerp(1.6, 1, stamp), lerp(1.6, 1, stamp));
    ctx.font = '170px "Archivo Black", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = steelGrad(0, -90, 0, 90); ctx.fillText("METALLIC STABS", 0, 0);
    ctx.fillStyle = C.red; ctx.fillRect(-760, 110, 1520 * clamp(a / 0.6), 10);
    ctx.restore(); ctx.textAlign = "left";
    sparks(W / 2 - 600, H / 2 + 115, a, 901, 60, C.amber); sparks(W / 2 + 600, H / 2 + 115, a, 902, 60, C.amber);
    vignette(); grain(t);
    flash(1 - a / 0.3);
    const fade = clamp((lt - (d - 1.6)) / 1.4);
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  }

  // ---------- sections ----------
  const S = [
    [0, 7.355, boot], [7.355, 22.935, circuit], [22.935, 30.475, charge], [30.475, 60.485, press],
    [60.485, 105.415, tunnel], [105.415, 120.355, racks], [120.355, 150.205, core], [150.205, 175.815, shatter],
    [175.815, 194.905, city], [194.905, 201.875, overload], [201.875, 209.315, powerdown], [209.315, 215.25, finalhit],
  ];
  worlds.push({ fn: circuit, at: 8, d: 15.6 }, { fn: press, at: 4, d: 30 }, { fn: tunnel, at: 10, d: 45 }, { fn: racks, at: 5, d: 15 }, { fn: core, at: 26, d: 29.8 }, { fn: shatter, at: 6, d: 25.6 }, { fn: city, at: 8, d: 19 });
  worlds.forEach((w) => { const sec = S.find((x) => x[2] === w.fn); const fn0 = w.fn; w.fn = (tt, lt, d) => fn0(sec[0] + lt, lt, d); });

  function renderAt(t) {
    t = Math.max(0, Math.min(t, 215.2));
    const s = S.find((x) => t >= x[0] && t < x[1]) || S[S.length - 1];
    const lt = t - s[0];
    if (s[2] === boot) s[2](t); else s[2](t, lt, s[1] - s[0]);
    // short glitch cut into each new section
    if (lt < 0.16 && s[0] > 0) { const f = Math.floor(t * 30); for (let i = 0; i < 6; i++) { const y = rnd(f, i) * H, h = 30 + rnd(f, i + 9) * 90; ctx.drawImage(cv, 0, y, W, h, (rnd(f, i + 20) - 0.5) * 160, y, W, h); } }
  }

  let ready = false, last = 0;
  const fonts = Promise.all([document.fonts.load('40px "JetBrains Mono"'), document.fonts.load('170px "Archivo Black"')]).then(() => { buildTitle(); ready = true; renderAt(last); });
  window.__hf = window.__hf || {};
  window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady.viz = fonts;
  window.addEventListener("hf-seek", (e) => { last = e.detail.time; renderAt(e.detail.time); });
  renderAt(0);
})();
