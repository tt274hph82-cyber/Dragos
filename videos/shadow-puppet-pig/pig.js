// "The Pig War" (San Juan Island, 1859) as a shadow play, 9:16 (720 x 1280). Same theatre as the Emu War:
// lamp light on the cloth -> coloured gels (multiply) -> silhouettes (each puppet on its own scratch layer, holes
// punched with destination-out, then laid on the shadow layer, blurred if held off the screen) -> cloth weave,
// light diffusion, grain. Every frame is a pure function of t.
(function () {
  const INK = 'rgb(20,8,4)';
  const FF = '"IM Fell English"';
  const NF = '"Libre Baskerville"';
  const TAU = Math.PI * 2;
  const NZ = H.makeNoise(4242);
  const sm = H.smooth, cl = H.clamp, lerp = H.lerp, EO = H.ease.out, EIO = H.ease.inOut;
  const LAY = {};
  function lay(name, w, h) {
    let c = LAY[name];
    if (!c || c.width !== w || c.height !== h) c = LAY[name] = H.layer(w, h);
    const x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none';
    x.clearRect(0, 0, c.width, c.height);
    return c;
  }

  // ---------- small drawing helpers (from the reference) ----------
  function cut(p, fn) { p.save(); p.globalCompositeOperation = 'destination-out'; p.fillStyle = '#000'; p.strokeStyle = '#000'; fn(); p.restore(); }
  function dot(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, TAU); c.fill(); }
  function tear(c, x, y, len, w, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(0, -w / 2); c.quadraticCurveTo(len * 0.55, -w * 0.45, len, 0); c.quadraticCurveTo(len * 0.55, w * 0.45, 0, w / 2);
    c.arc(0, 0, w / 2, Math.PI / 2, Math.PI * 1.5); c.fill(); c.restore();
  }
  function pin(p, x, y, r) { r = r || 8; cut(p, () => dot(p, x, y, r)); p.fillStyle = INK; dot(p, x, y, r * 0.55); }
  const both = (cs, fn) => cs.forEach(fn);
  const wpt = (p, x, y) => { const q = p.getTransform().transformPoint(new DOMPoint(x, y)); return [q.x, q.y]; };
  const bz = (P, u) => { const v = 1 - u; return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0], v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]]; };
  const bzA = (P, u) => { const a = bz(P, Math.max(0, u - 0.01)), b = bz(P, Math.min(1, u + 0.01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const swing = (t, t0, amp, k, w) => (t > t0 ? amp * Math.exp(-(t - t0) * k) * Math.sin((t - t0) * w) : 0);
  const blinkAt = (t, list) => list.reduce((m, b) => Math.max(m, 1 - Math.abs((t - b) / 0.08)), 0);
  function star(p, x, y, r) { p.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, a = i * TAU / 10 - Math.PI / 2; p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } p.fill(); }

  // ---------- frame lifecycle (from the reference; lamp centred for the tall screen) ----------
  function begin(W, Hh) { return { W, Hh, S: lay('S', W, Hh), G: lay('G', W, Hh), rods: [] }; }
  function pup(st, o, fn) {
    const P = lay('P', st.W, st.Hh), p = P.getContext('2d'), g = st.G.getContext('2d');
    p.fillStyle = INK; p.strokeStyle = INK;
    g.save(); fn(p, g, st.rods); g.restore();
    const s = st.S.getContext('2d');
    s.save(); s.globalAlpha = o.alpha == null ? 1 : o.alpha; if (o.blur) s.filter = `blur(${o.blur}px)`; s.drawImage(P, 0, 0); s.restore();
  }
  const STOPS = [[0, [255, 232, 168]], [0.16, [255, 200, 104]], [0.42, [238, 132, 46]], [0.68, [168, 60, 20]], [0.88, [84, 24, 9]], [1, [38, 10, 4]]];
  function lamp(ctx, W, Hh, t, b, flare) {
    const f = 1 + 0.045 * NZ.n2(t * 6.1, 0.3) + 0.025 * NZ.n2(t * 17.3, 2.2);
    const B = Math.max(0, b * f);
    const cx = W / 2 + NZ.n2(t * 0.9, 5) * 12, cy = Hh * 0.42 + NZ.n2(7, t * 0.8) * 9;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 980 + (flare || 0) * 200);
    STOPS.forEach(([o, c]) => g.addColorStop(o, H.rgba(c.map((v) => Math.min(255, v * B + (255 - v) * (flare || 0) * 0.7)), 1)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
  }
  function weave(W, Hh) {
    const key = '_weave' + W + 'x' + Hh;
    if (LAY[key]) return LAY[key];
    const c = H.layer(W, Hh), x = c.getContext('2d'), img = x.createImageData(W, Hh), d = img.data, r = H.rng(77);
    const row = Float32Array.from({ length: Hh }, () => 0.6 + r() * 0.8), col = Float32Array.from({ length: W }, () => 0.6 + r() * 0.8);
    for (let y = 0; y < Hh; y++) for (let X = 0; X < W; X++) {
      const i = (y * W + X) * 4;
      const th = (y % 3 === 0 ? 1 : y % 3 === 1 ? 0.35 : 0) * row[y] * (0.7 + 0.3 * Math.sin(X * 0.05 + row[y] * 9));
      const tv = (X % 3 === 0 ? 1 : X % 3 === 1 ? 0.3 : 0) * col[X] * (0.7 + 0.3 * Math.sin(y * 0.043 + col[X] * 7));
      const v = 255 * (1 - 0.075 * th - 0.06 * tv);
      d[i] = v; d[i + 1] = v * 0.985; d[i + 2] = v * 0.97; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const fw = Math.round(W / 8), fh = Math.round(Hh / 8);
    const f = H.layer(fw, fh), fx = f.getContext('2d'), fi = fx.createImageData(fw, fh);
    for (let y = 0; y < fh; y++) for (let X = 0; X < fw; X++) {
      const v = 255 * (1 - 0.07 * (0.5 + 0.5 * NZ.fbm2(X * 0.05, y * 0.012, 3)) - 0.03 * (0.5 + 0.5 * NZ.n2(X * 0.4, y * 0.2)));
      const i = (y * fw + X) * 4; fi.data[i] = fi.data[i + 1] = fi.data[i + 2] = v; fi.data[i + 3] = 255;
    }
    fx.putImageData(fi, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.imageSmoothingEnabled = true; x.drawImage(f, 0, 0, W, Hh);
    // a vertical seam in the cloth
    x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(200,190,180,1)'; x.fillRect(150, 0, 2, Hh); x.fillStyle = 'rgba(232,226,220,1)'; x.fillRect(147, 0, 7, Hh);
    LAY[key] = c; return c;
  }
  function grainTile(k) {
    const key = '_grain' + k;
    if (LAY[key]) return LAY[key];
    const c = H.layer(256, 256), x = c.getContext('2d'), img = x.createImageData(256, 256), r = H.rng(900 + k);
    for (let i = 0; i < img.data.length; i += 4) { const w = r() < 0.5 ? 0 : 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = w; img.data[i + 3] = r() * 26; }
    x.putImageData(img, 0, 0); LAY[key] = c; return c;
  }
  function end(ctx, st, t) {
    const { W, Hh } = st;
    if (st.rods.length) {
      const R = lay('R', W, Hh), r = R.getContext('2d');
      r.strokeStyle = INK; r.lineCap = 'round';
      st.rods.forEach(([x, y, w, a]) => { r.globalAlpha = a == null ? 1 : a; r.lineWidth = w || 3.2; r.beginPath(); r.moveTo(x, y); r.lineTo(x + (x - W / 2) * 0.14 + 18, Hh + 40); r.stroke(); dot(r, x, y, (w || 3.2) * 1.2); });
      r.globalAlpha = 1;
      const s = st.S.getContext('2d'); s.save(); s.filter = 'blur(1.3px)'; s.globalAlpha = 0.9; s.drawImage(R, 0, 0); s.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(st.G, 0, 0); ctx.restore();
    ctx.save(); ctx.filter = 'blur(0.7px)'; ctx.globalAlpha = 0.97; ctx.drawImage(st.S, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(weave(W, Hh), 0, 0); ctx.restore();
    const hl = lay('half', W / 4, Hh / 4), hx = hl.getContext('2d');
    hx.filter = 'blur(5px)'; hx.drawImage(ctx.canvas, 0, 0, W / 4, Hh / 4);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.13; ctx.drawImage(hl, 0, 0, W, Hh); ctx.restore();
    const fr = Math.floor(t * 12), gt = grainTile(fr % 3), gr = H.rng(fr + 5);
    ctx.save(); ctx.fillStyle = ctx.createPattern(gt, 'repeat'); ctx.translate(-gr() * 256, -gr() * 256); ctx.fillRect(0, 0, W + 256, Hh + 256); ctx.restore();
    H.vignette(ctx, W, Hh, 0.38, '20,5,2');
  }

  // ---------- stage furniture (cached; from the reference) ----------
  function valance(W) {
    const key = '_val' + W; if (LAY[key]) return LAY[key];
    const c = H.layer(W, 80), p = c.getContext('2d');
    p.fillStyle = INK; p.fillRect(0, 0, W, 14);
    for (let x = -16; x < W + 32; x += 32) { p.beginPath(); p.arc(x + 16, 13, 16, 0, Math.PI); p.fill(); }
    for (let x = 32; x < W; x += 64) { p.fillRect(x - 1, 20, 2, 22); tear(p, x, 40, 18, 9, Math.PI / 2); dot(p, x, 40, 5); }
    cut(p, () => { for (let x = 8; x < W; x += 12) dot(p, x, 6, 1.8); for (let x = -16; x < W + 32; x += 32) { dot(p, x + 16, 20, 3.2); tear(p, x + 10, 17, 7, 3.4, 2.4); tear(p, x + 22, 17, 7, 3.4, 0.74); } });
    LAY[key] = c; return c;
  }
  function ground(W) {
    const key = '_gnd' + W; if (LAY[key]) return LAY[key];
    const c = H.layer(W, 110), p = c.getContext('2d'), r = H.rng(31);
    p.fillStyle = INK; p.strokeStyle = INK; p.fillRect(0, 96, W, 14);
    for (let x = -10; x < W + 10; x += 5 + r() * 6) {
      const h = 14 + r() * 34 * (0.6 + 0.4 * Math.sin(x * 0.013) ** 2), lean = (r() - 0.5) * 22, w = 2 + r() * 2.5;
      p.beginPath(); p.moveTo(x - w, 100); p.quadraticCurveTo(x + lean * 0.3, 100 - h * 0.6, x + lean, 100 - h); p.quadraticCurveTo(x + lean * 0.3 + w * 0.6, 100 - h * 0.55, x + w, 100); p.fill();
    }
    p.lineCap = 'round';
    for (let x = 60; x < W; x += 150 + r() * 90) {
      const dir = r() < 0.5 ? -1 : 1, h = 40 + r() * 26;
      p.lineWidth = 3; p.beginPath(); p.moveTo(x, 100); p.quadraticCurveTo(x + dir * 6, 100 - h * 0.6, x + dir * 2, 100 - h);
      for (let a = 0; a < 5.5; a += 0.3) { const rr = 10 * (1 - a / 6.2); p.lineTo(x + dir * (2 + 10 - Math.cos(a) * rr), 100 - h - Math.sin(a) * rr * dir * dir); }
      p.stroke();
      for (let k = 1; k < 4; k++) tear(p, x + dir * 3, 100 - h * k / 4.2, 14, 6, dir > 0 ? -0.5 : Math.PI + 0.5);
    }
    LAY[key] = c; return c;
  }
  // a gum-tree branch hanging in from the top corner (the outback's own frame), cached and blurred: held near the lamp
  function gumBranch(st, t, side, a) {
    if (!LAY._gum) {
      const c = H.layer(520, 520), raw = H.layer(520, 520), x = raw.getContext('2d');
      x.fillStyle = INK; x.strokeStyle = INK; x.lineCap = 'round';
      x.lineWidth = 16; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(220, 60, 460, 300); x.stroke();
      for (let k = 0; k < 14; k++) { const u = k / 14, px = lerp(20, 440, u), py = lerp(10, 290, u * u); for (const sd of [-1, 1]) { x.lineWidth = 3; x.beginPath(); x.moveTo(px, py); x.lineTo(px + sd * 10, py + 50); x.stroke(); tear(x, px + sd * 10, py + 50, 70, 16, Math.PI / 2 + sd * 0.35); } }
      const cx = c.getContext('2d'); cx.filter = 'blur(6px)'; cx.drawImage(raw, 0, 0); LAY._gum = c;
    }
    const s = st.S.getContext('2d');
    s.save(); s.globalAlpha = a;
    if (side > 0) { s.translate(st.W, 0); s.scale(-1, 1); }
    s.translate(-40, -30); s.rotate(Math.sin(t * 0.7) * 0.025); s.drawImage(LAY._gum, 0, 0); s.restore();
  }

  // ---------- labels, vines, cards (from the reference) ----------
  function plaque(p, o) {
    p.save(); p.translate(o.x, o.y); p.rotate(o.rot || 0);
    p.font = `italic 400 ${o.size}px ${FF}`;
    const tw = p.measureText(o.text).width, w = tw + o.size * 1.1, h = o.size * 1.5;
    p.fillStyle = INK; p.strokeStyle = INK;
    if (o.hang) { p.lineWidth = 2; p.beginPath(); p.moveTo(0, -h / 2); p.lineTo(0, -h / 2 - o.hang); p.stroke(); }
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, h * 0.28); p.fill();
    dot(p, -w / 2 - 4, 0, h * 0.24); dot(p, w / 2 + 4, 0, h * 0.24);
    cut(p, () => {
      p.lineWidth = 2; p.beginPath(); p.roundRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, h * 0.2); p.stroke();
      dot(p, -w / 2 - 4, 0, h * 0.09); dot(p, w / 2 + 4, 0, h * 0.09);
      p.textAlign = 'center'; p.textBaseline = 'middle'; p.fillText(o.text, 0, 2);
    });
    p.restore();
  }
  function vine(p, P, prog, w) {
    if (prog <= 0.001) return;
    w = w || 7; p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round'; p.lineJoin = 'round';
    const N = 60, n = Math.max(2, Math.ceil(N * prog));
    p.lineWidth = w; p.beginPath();
    for (let i = 0; i <= n; i++) { const q = bz(P, Math.min(prog, i / N)); if (i === 0) p.moveTo(q[0], q[1]); else p.lineTo(q[0], q[1]); }
    p.stroke();
    const s0 = bz(P, 0), a0 = bzA(P, 0);
    p.lineWidth = 3.5; p.beginPath();
    for (let a = 0; a < 5.2; a += 0.25) { const r = 16 * (1 - a / 6), aa = a0 + Math.PI + a; p.lineTo(s0[0] + Math.cos(a0 + Math.PI) * 4 + Math.cos(aa) * r - Math.cos(a0 + Math.PI) * 16, s0[1] + Math.sin(a0 + Math.PI) * 4 + Math.sin(aa) * r - Math.sin(a0 + Math.PI) * 16); }
    p.stroke();
    [0.18, 0.34, 0.5, 0.66, 0.8].forEach((u, i) => {
      if (u > prog - 0.06) return;
      const q = bz(P, u), a = bzA(P, u) + (i % 2 ? 1 : -1) * 0.9, gr = Math.min(1, (prog - u) / 0.12);
      tear(p, q[0], q[1], 26 * gr, 11 * gr, a);
      cut(p, () => { p.lineWidth = 1.4; p.beginPath(); p.moveTo(q[0] + Math.cos(a) * 5, q[1] + Math.sin(a) * 5); p.lineTo(q[0] + Math.cos(a) * 20 * gr, q[1] + Math.sin(a) * 20 * gr); p.stroke(); });
    });
    const e = bz(P, prog), ea = bzA(P, prog);
    p.save(); p.translate(e[0], e[1]); p.rotate(ea);
    p.beginPath(); p.moveTo(30, 0); p.quadraticCurveTo(8, -6, -4, -19); p.quadraticCurveTo(2, -6, -6, 0); p.quadraticCurveTo(2, 6, -4, 19); p.quadraticCurveTo(8, 6, 30, 0); p.fill();
    cut(p, () => dot(p, 6, 0, 3.2));
    p.restore();
  }
  function titleCard(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y - o.h / 2 * o.s); c.rotate(o.rot || 0); c.scale(o.s, o.s); c.translate(0, o.h / 2); });
    const w = o.w, h = o.h;
    p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 2.4;
    p.beginPath(); p.moveTo(-w * 0.32, -h / 2); p.lineTo(-w * 0.32, -h / 2 - 1400); p.moveTo(w * 0.32, -h / 2); p.lineTo(w * 0.32, -h / 2 - 1400); p.stroke();
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, 14); p.fill();
    for (let x = -w / 2 + 12; x <= w / 2 - 12; x += 16) { dot(p, x, -h / 2, 6); dot(p, x, h / 2, 6); }
    for (const sx of [-1, 1]) { p.beginPath(); p.arc(sx * w / 2, 0, h * 0.18, -Math.PI / 2, Math.PI / 2, sx < 0); p.fill(); }
    cut(p, () => {
      p.lineWidth = 3; p.beginPath(); p.roundRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8); p.stroke();
      for (let x = -w / 2 + 34; x <= w / 2 - 34; x += 11) { dot(p, x, -h / 2 + 24, 1.8); dot(p, x, h / 2 - 24, 1.8); }
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        const cx = sx * (w / 2 - 34), cy = sy * (h / 2 - 34);
        dot(p, cx, cy, 4);
        [0, 1, 2].forEach((k) => tear(p, cx, cy, 14, 6, Math.atan2(-sy, -sx) + (k - 1) * 0.7 + Math.PI));
      }
      for (const sx of [-1, 1]) { dot(p, sx * (w / 2 + h * 0.08), 0, h * 0.06); }
      o.lines.forEach((L) => { p.font = `${L.italic ? 'italic ' : ''}400 ${L.size}px ${L.num ? NF : FF}`; p.textAlign = 'center'; p.textBaseline = 'alphabetic'; p.fillText(L.text, 0, L.y); });
    });
    both([p, g], (c) => c.restore());
  }
  // a hanging tag with cut-out letters and an optional x / tick badge (from the reference)
  function tag(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); });
    p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 2;
    p.beginPath(); p.moveTo(0, 0); p.lineTo(0, 30); p.stroke(); dot(p, 0, 0, 4);
    both([p, g], (c) => { c.translate(0, 30 + o.h / 2); });
    const w = o.w, h = o.h;
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, 12); p.fill();
    for (let x = -w / 2 + 10; x <= w / 2 - 10; x += 14) { dot(p, x, -h / 2, 4.5); dot(p, x, h / 2, 4.5); }
    cut(p, () => {
      p.lineWidth = 2.4; p.beginPath(); p.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 7); p.stroke();
      p.font = `italic 400 ${o.size}px ${FF}`; p.textAlign = 'center'; p.textBaseline = 'middle'; p.fillText(o.text, o.tx || 0, 3);
    });
    if (o.badge && o.badgeS > 0.01) badge(p, g, { x: w / 2 - 40, y: 0, s: o.badgeS, ok: o.badge === 'v' });
    both([p, g], (c) => c.restore());
  }
  function badge(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    p.fillStyle = INK; dot(p, 0, 0, 40);
    for (let k = 0; k < 12; k++) dot(p, Math.cos(k * TAU / 12) * 40, Math.sin(k * TAU / 12) * 40, 7);
    cut(p, () => dot(p, 0, 0, 31));
    g.fillStyle = o.ok ? 'rgb(110,220,120)' : 'rgb(240,60,46)'; dot(g, 0, 0, 33);
    p.strokeStyle = INK; p.lineCap = 'round'; p.lineWidth = 11; p.beginPath();
    if (o.ok) { p.moveTo(-16, 1); p.lineTo(-4, 14); p.lineTo(18, -14); } else { p.moveTo(-14, -14); p.lineTo(14, 14); p.moveTo(14, -14); p.lineTo(-14, 14); }
    p.stroke();
    both([p, g], (c) => c.restore());
  }
  // a counter board on two strings: a big number in lining figures, a plaque under it
  function board(p, o) {
    p.save(); p.translate(o.x, o.y); p.rotate(o.rot || 0); p.scale(o.s || 1, o.s || 1);
    p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 2;
    const hw = o.hw || 230;
    p.beginPath(); p.moveTo(-hw, 30); p.lineTo(-hw, -1400); p.moveTo(hw, 30); p.lineTo(hw, -1400); p.stroke();
    p.fillRect(-hw - 6, 22, hw * 2 + 12, 7); dot(p, -hw - 6, 25, 8); dot(p, hw + 6, 25, 8);
    p.save(); p.font = `400 ${o.size || 120}px ${NF}`; const cw = p.measureText(o.text).width, fit = Math.min(1, (hw * 2 - 30) / cw); p.translate(0, -14); p.scale((o.pop || 1) * fit, (o.pop || 1) * fit); p.textAlign = 'center'; p.textBaseline = 'alphabetic'; p.fillText(o.text, 0, 0); p.restore();
    p.restore();
    if (o.label) plaque(p, { x: o.x, y: o.y + 66 * (o.s || 1), text: o.label, size: 40 });
  }
  function moon(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); });
    const r = o.r; p.fillStyle = INK;
    if (o.burst > 0.01) {
      const L = 50 * o.burst;
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * TAU + 0.1, l = (k % 2 ? 0.6 : 1) * L, w = 0.09;
        p.beginPath(); p.moveTo(Math.cos(a - w) * (r + 12), Math.sin(a - w) * (r + 12)); p.lineTo(Math.cos(a) * (r + 16 + l), Math.sin(a) * (r + 16 + l)); p.lineTo(Math.cos(a + w) * (r + 12), Math.sin(a + w) * (r + 12)); p.fill();
        dot(p, Math.cos(a) * (r + 22 + l), Math.sin(a) * (r + 22 + l), 4 * o.burst);
      }
    }
    dot(p, 0, 0, r + 12);
    for (let k = 0; k < 20; k++) dot(p, Math.cos(k * TAU / 20) * (r + 12), Math.sin(k * TAU / 20) * (r + 12), 5.5);
    cut(p, () => { dot(p, 0, 0, r); for (let k = 0; k < 20; k++) dot(p, Math.cos((k + 0.5) * TAU / 20) * (r + 7), Math.sin((k + 0.5) * TAU / 20) * (r + 7), 1.8); });
    g.fillStyle = o.gel || 'rgb(255,246,214)'; dot(g, 0, 0, r + 1);
    p.fillStyle = INK; [[-0.3, -0.25, 0.16], [0.28, 0.1, 0.22], [-0.1, 0.42, 0.12]].forEach(([x, y, rr]) => { dot(p, x * r, y * r, rr * r); cut(p, () => dot(p, x * r + rr * r * 0.25, y * r - rr * r * 0.2, rr * r * 0.72)); });
    both([p, g], (c) => c.restore());
  }
  function curtains(p, W, Hh, cover, t) {
    const e = cover * (W / 2 + 40);
    for (const sd of [-1, 1]) {
      const wave = (y) => Math.sin(y * 0.018 + t * 2 + sd) * 10 + Math.sin(y * 0.05) * 4;
      const inner = (y) => (sd < 0 ? e - 40 + wave(y) : W - e + 40 + wave(y));
      const outer = sd < 0 ? -60 : W + 60;
      p.fillStyle = INK; p.beginPath(); p.moveTo(outer, -10);
      for (let y = -10; y <= Hh + 10; y += 20) p.lineTo(inner(y), y);
      p.lineTo(outer, Hh + 10); p.closePath(); p.fill();
      for (let y = 30; y < Hh; y += 24) { tear(p, inner(y), y, 18, 9, sd < 0 ? 0 : Math.PI); }
      cut(p, () => {
        for (let k = 1; k < 7; k++) {
          const x = sd < 0 ? inner(0) - k * 64 : inner(0) + k * 64;
          for (let y = 50; y < Hh - 20; y += 22) { const xx = x + wave(y) * 0.6 + Math.sin(y * 0.03 + k) * 6; p.save(); p.translate(xx, y); p.rotate(Math.PI / 4); p.fillRect(-3.4, -3.4, 6.8, 6.8); p.restore(); }
        }
        for (let y = 40; y < Hh - 20; y += 18) dot(p, inner(y) - sd * 18, y, 3);
      });
    }
  }
  // ---------- this story's puppets ----------
  // a fir bough hanging in from a top corner (the island's own frame), cached and blurred: held near the lamp
  function firBranch(st, t, side, a) {
    if (!LAY._fir) {
      const c = H.layer(520, 520), raw = H.layer(520, 520), x = raw.getContext('2d');
      x.fillStyle = INK; x.strokeStyle = INK; x.lineCap = 'round';
      x.lineWidth = 14; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(240, 40, 470, 250); x.stroke();
      for (let k = 0; k < 22; k++) {
        const u = k / 22, px = lerp(10, 450, u), py = lerp(4, 235, u * u * 0.9 + u * 0.1);
        for (const sd of [-1, 1]) { x.lineWidth = 2; for (let n = 0; n < 4; n++) tear(x, px + n * 4, py + n * 2, 34 - n * 4, 5, Math.PI / 2 + sd * (0.5 + n * 0.12)); }
      }
      for (let k = 0; k < 4; k++) { const px = 120 + k * 90, py = 30 + k * k * 14; x.beginPath(); x.ellipse(px, py + 38, 12, 22, 0.2, 0, TAU); x.fill(); }
      const cx = c.getContext('2d'); cx.filter = 'blur(6px)'; cx.drawImage(raw, 0, 0); LAY._fir = c;
    }
    const s = st.S.getContext('2d');
    s.save(); s.globalAlpha = a;
    if (side > 0) { s.translate(st.W, 0); s.scale(-1, 1); }
    s.translate(-40, -30); s.rotate(Math.sin(t * 0.7) * 0.025); s.drawImage(LAY._fir, 0, 0); s.restore();
  }
  // a fir tree: stacked drooping tiers, needles torn along the edges
  function fir(p, x, y, h) {
    p.fillStyle = INK; p.fillRect(x - h * 0.03, y - h * 0.2, h * 0.06, h * 0.2);
    for (let k = 0; k < 5; k++) {
      const top = y - h + k * h * 0.17, w = h * (0.12 + k * 0.07), base = top + h * 0.3;
      p.beginPath(); p.moveTo(x, top); p.quadraticCurveTo(x - w * 0.4, base - h * 0.1, x - w, base); p.lineTo(x + w, base); p.quadraticCurveTo(x + w * 0.4, base - h * 0.1, x, top); p.fill();
      for (let n = -2; n <= 2; n++) tear(p, x + n * w * 0.42, base - 2, h * 0.05, h * 0.02, Math.PI / 2);
    }
  }
  // the island skyline: Mount Baker far off, a line of firs, the shore. gy = ground line.
  function island(p, W, gy, t, o) {
    o = o || {};
    p.fillStyle = INK;
    if (!o.noHills) { p.beginPath(); p.moveTo(0, gy + 10); p.quadraticCurveTo(160, gy - 60, 330, gy - 24); p.quadraticCurveTo(520, gy + 6, W, gy - 70); p.lineTo(W, gy + 30); p.lineTo(0, gy + 30); p.fill(); }
    const r = H.rng(o.seed || 17);
    for (let x = (o.x0 || -20); x < (o.x1 || W + 30); x += 34 + r() * 30) fir(p, x, gy - 10 + r() * 20, 120 + r() * 110);
  }
  function mountain(p, W, gy) {
    p.fillStyle = INK; p.beginPath(); p.moveTo(-20, gy); p.lineTo(170, gy - 150); p.lineTo(300, gy - 330); p.lineTo(350, gy - 360); p.lineTo(410, gy - 320); p.lineTo(560, gy - 140); p.lineTo(W + 20, gy - 40); p.lineTo(W + 20, gy); p.fill();
    cut(p, () => { [[300, -330, 330, -300, 316, -280, 300, -300], [350, -360, 380, -330, 362, -300, 344, -330], [410, -320, 440, -290, 420, -270, 402, -296]].forEach((q) => { p.beginPath(); p.moveTo(q[0], gy + q[1]); p.lineTo(q[2], gy + q[3]); p.lineTo(q[4], gy + q[5]); p.lineTo(q[6], gy + q[7]); p.fill(); }); });
  }
  // the sea: rows of curling wave crests cut from one strip, drifting. y = water line
  function sea(p, W, y, t, h) {
    p.fillStyle = INK; p.fillRect(-10, y + 14, W + 20, h);
    for (let row = 0; row < 3; row++) {
      const yy = y + row * 34, off = ((t * (22 + row * 10)) % 60) - 60;
      for (let x = off + row * 20; x < W + 60; x += 60) { p.beginPath(); p.arc(x, yy + 16, 18, Math.PI, TAU); p.fill(); tear(p, x + 18, yy + 4, 14, 7, Math.PI * 1.2); }
      if (row > 0) cut(p, () => { for (let x = off + row * 20 + 30; x < W + 60; x += 60) { p.lineWidth = 2.4; p.beginPath(); p.arc(x, yy + 20, 10, Math.PI * 1.1, Math.PI * 1.9); p.stroke(); } });
    }
  }
  // a pig in profile facing right, feet at (0,0). o: x,y,s, trot (0..1), ph, root (0..1 snout down), fall (0..1 keels over), flip
  // Cut-work: dotted spots and a belly seam; pink gel in the nostrils and the inner ear.
  function pig(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s * (o.flip ? -1 : 1), o.s); });
    const fall = o.fall || 0;
    if (fall > 0) both([p, g], (c) => { c.translate(0, -60 - fall * 18); c.rotate(fall * Math.PI * 0.92); c.translate(0, 60); });
    const ph = o.ph || 0, tr = o.trot || 0, bob = Math.abs(Math.sin(ph)) * 6 * tr;
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round';
    // legs: four short trotters, the pairs in opposite phase
    [[-70, 0], [-46, Math.PI], [52, Math.PI], [76, 0]].forEach(([lx, off]) => {
      const a = tr * Math.sin(ph + off) * 0.5 + fall * Math.sin(ph * 0.3 + off) * 0.2;
      both([p, g], (c) => { c.save(); c.translate(lx, -52 - bob); c.rotate(a); });
      p.beginPath(); p.roundRect(-11, 0, 22, 52, 8); p.fill(); p.fillRect(-12, 44, 24, 8);
      cut(p, () => { p.fillRect(-1, 46, 2, 8); });
      pin(p, 0, 4, 5);
      both([p, g], (c) => c.restore());
    });
    // body
    p.beginPath(); p.ellipse(0, -96 - bob, 118, 62, 0, 0, TAU); p.fill();
    // curly tail
    p.lineWidth = 6; p.beginPath();
    for (let a = 0; a < 9; a += 0.3) { const rr = 12 * (1 - a / 12); p.lineTo(-118 - a * 2.2 + Math.cos(a) * rr * 0.6, -120 - bob - Math.sin(a) * rr); }
    p.stroke();
    // head (rooting tilts it down)
    const rt = o.root || 0;
    both([p, g], (c) => { c.save(); c.translate(96, -112 - bob); c.rotate(rt * 0.55); });
    p.beginPath(); p.ellipse(34, 6, 52, 44, 0.15, 0, TAU); p.fill();
    p.beginPath(); p.roundRect(68, 6, 40, 38, 10); p.fill();
    p.beginPath(); p.moveTo(6, -30); p.lineTo(26, -78); p.lineTo(46, -32); p.fill();   // ear
    cut(p, () => {
      dot(p, 98, 18, 4.5); dot(p, 98, 33, 4.5);
      p.beginPath(); p.moveTo(18, -36); p.lineTo(26, -62); p.lineTo(36, -36); p.fill();
      if (fall > 0.5) { p.lineWidth = 3; p.beginPath(); p.moveTo(42, -16); p.lineTo(56, -2); p.moveTo(56, -16); p.lineTo(42, -2); p.stroke(); }
      else dot(p, 50, -8, 6.5);
      p.lineWidth = 2; p.beginPath(); p.arc(70, 40, 12, 0.2, 1.4); p.stroke();
    });
    g.fillStyle = 'rgb(255,150,170)'; dot(g, 98, 18, 6); dot(g, 98, 33, 6);
    g.beginPath(); g.moveTo(18, -36); g.lineTo(26, -62); g.lineTo(36, -36); g.fill();
    if (fall <= 0.5) { p.fillStyle = INK; dot(p, 52, -8, 3); if (o.blink) p.fillRect(42, -15, 18, 14 * o.blink); }
    pin(p, 0, 0, 7);
    both([p, g], (c) => c.restore());
    cut(p, () => {
      for (let k = 0; k < 9; k++) dot(p, -86 + k * 20, -60 - bob + Math.sin(k * 1.3) * 3, 2.2);   // belly seam
      [[-50, -120, 9], [-20, -134, 6], [20, -118, 8], [-70, -96, 5], [40, -138, 5]].forEach(([x, y, r]) => dot(p, x, y - bob, r));   // spots
    });
    if (rods && !o.noRods) rods.push([...wpt(p, -10, -90 - bob), 3.2]);
    both([p, g], (c) => c.restore());
  }
  // a man of 1859, feet at (0,0), facing right. o: x,y,s, walk, ph, armR/armL (rad), flip,
  // hat: 'farmer' | 'kepi' | 'shako' | 'bicorne' | 'pickel', rifle (0..1 flash), stache, whiskers, coat ('red'|'blue'|null gel),
  // epaulets, sash, roll (scroll in the front hand)
  function man(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s * (o.flip ? -1 : 1), o.s); });
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round';
    const ph = o.ph || 0, wk = o.walk || 0;
    for (const sd of [-1, 1]) {
      const a = wk * Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.5;
      both([p, g], (c) => { c.save(); c.translate(sd * 14, -170); c.rotate(-a); });
      p.beginPath(); p.roundRect(-14, 0, 28, 100, 10); p.fill();
      p.beginPath(); p.roundRect(-12, 92, 24, 76, 8); p.fill();
      p.beginPath(); p.ellipse(14, 170, 26, 11, 0, 0, TAU); p.fill();
      if (o.hat !== 'farmer') cut(p, () => { p.fillRect(-2, 8, 4, 150); });   // trouser stripe
      pin(p, 0, 96, 5);
      both([p, g], (c) => c.restore());
    }
    // coat: a frock coat with tails; windows cut in its front take a coloured gel
    p.beginPath(); p.moveTo(-50, -150); p.lineTo(-42, -330); p.quadraticCurveTo(0, -350, 40, -330); p.lineTo(50, -170); p.lineTo(20, -190); p.lineTo(-10, -150); p.closePath(); p.fill();
    cut(p, () => {
      p.fillRect(-44, -214, 92, 6);
      if (o.hat === 'farmer') { p.lineWidth = 2.4; for (let k = 0; k < 3; k++) { p.beginPath(); p.moveTo(-34 + k * 26, -320); p.lineTo(-30 + k * 26, -230); p.stroke(); } }
      else {
        for (let k = 0; k < 5; k++) { dot(p, 12, -318 + k * 22, 3.2); dot(p, -12, -318 + k * 22, 3.2); }
        if (o.coat) { p.beginPath(); p.roundRect(-34, -310, 16, 86, 4); p.roundRect(20, -310, 16, 86, 4); p.fill(); }
      }
      if (o.sash) { p.lineWidth = 5; p.beginPath(); p.moveTo(-38, -330); p.lineTo(40, -230); p.stroke(); }
    });
    if (o.coat) { g.fillStyle = o.coat === 'red' ? 'rgb(240,70,52)' : 'rgb(90,130,240)'; g.fillRect(-34, -310, 16, 86); g.fillRect(20, -310, 16, 86); }
    if (o.epaulets) for (const sd of [-1, 1]) { p.beginPath(); p.ellipse(sd * 38, -332, 22, 9, 0, 0, TAU); p.fill(); for (let k = 0; k < 6; k++) tear(p, sd * 38 - 16 + k * 6.4, -326, 16, 4, Math.PI / 2); }
    // arms: back arm first; the front arm holds a rifle, a scroll, or nothing
    for (const sd of [-1, 1]) {
      const a = sd > 0 ? (o.armR == null ? 0.2 : o.armR) : (o.armL == null ? -0.15 : o.armL) + wk * Math.sin(ph) * 0.4;
      both([p, g], (c) => { c.save(); c.translate(sd * 36, -320); c.rotate(-a); });
      p.beginPath(); p.roundRect(-11, 0, 22, 80, 9); p.fill();
      p.beginPath(); p.roundRect(-9, 74, 18, 70, 8); p.fill();
      dot(p, 0, 150, 13);
      pin(p, 0, 0, 7); pin(p, 0, 76, 5);
      if (sd > 0 && o.rifle != null) {
        // a long rifle along the forearm: stock at the hand, barrel well past it
        p.beginPath(); p.moveTo(-10, 96); p.lineTo(10, 96); p.lineTo(8, 170); p.lineTo(-8, 170); p.fill();
        p.fillRect(-4, 160, 8, 220);
        p.beginPath(); p.moveTo(-12, 60); p.lineTo(12, 60); p.lineTo(8, 110); p.lineTo(-8, 110); p.fill();
        cut(p, () => { p.lineWidth = 1.6; p.beginPath(); p.moveTo(0, 176); p.lineTo(0, 360); p.stroke(); });
        if (o.rifle > 0.02) {
          const f = o.rifle, r = 44 * f;
          p.save(); p.translate(0, 400);
          for (let k = 0; k < 8; k++) tear(p, 0, 0, r * (k % 2 ? 0.7 : 1.3), 16 * f, k * TAU / 8);
          cut(p, () => dot(p, 0, 0, r * 0.42));
          p.restore(); g.fillStyle = 'rgb(255,214,96)'; dot(g, 0, 400, r * 0.6);
        }
      }
      if (sd > 0 && o.roll) {
        p.beginPath(); p.roundRect(-40, 138, 80, 22, 10); p.fill();
        cut(p, () => { dot(p, -30, 149, 4); dot(p, 30, 149, 4); });
      }
      if (sd > 0 && rods && !o.noRods) rods.push([...wpt(p, 0, 150), 2.8]);
      both([p, g], (c) => c.restore());
    }
    // head, then hair, whiskers and the hat
    // a human profile: skull, brow, a modest nose, lips, chin, jaw, neck
    p.fillRect(-12, -352, 24, 30);
    p.beginPath(); p.moveTo(-30, -372);
    p.bezierCurveTo(-34, -404, -8, -418, 14, -414);
    p.bezierCurveTo(28, -410, 32, -400, 31, -390);
    p.lineTo(33, -384); p.quadraticCurveTo(41, -372, 38, -368); p.lineTo(32, -367);
    p.quadraticCurveTo(35, -362, 32, -359); p.quadraticCurveTo(35, -355, 31, -351);
    p.quadraticCurveTo(30, -343, 18, -343); p.quadraticCurveTo(4, -344, -6, -352);
    p.quadraticCurveTo(-26, -352, -30, -372); p.closePath(); p.fill();
    cut(p, () => { p.beginPath(); p.ellipse(18, -386, 3.6, 2.4, 0, 0, TAU); p.fill(); p.lineWidth = 2; p.beginPath(); p.arc(-4, -374, 7, -1.2, 1.6); p.stroke(); });
    if (o.stache) { p.beginPath(); p.moveTo(26, -364); p.quadraticCurveTo(48, -366, 58, -352); p.quadraticCurveTo(44, -358, 28, -357); p.fill(); p.beginPath(); p.moveTo(26, -364); p.quadraticCurveTo(12, -360, 6, -348); p.quadraticCurveTo(16, -356, 28, -357); p.fill(); }
    if (o.whiskers) { p.beginPath(); p.moveTo(-14, -380); p.quadraticCurveTo(-20, -330, 8, -316); p.quadraticCurveTo(30, -322, 30, -340); p.quadraticCurveTo(10, -350, -2, -372); p.fill(); for (let k = 0; k < 5; k++) tear(p, -6 + k * 7, -322, 14, 5, Math.PI / 2 + 0.2); }
    if (o.beard) { p.beginPath(); p.moveTo(-10, -366); p.quadraticCurveTo(0, -320, 30, -330); p.lineTo(34, -360); p.fill(); }
    const hat = o.hat;
    if (hat === 'farmer') {   // a wide, flat, battered brim
      p.beginPath(); p.ellipse(4, -408, 74, 11, -0.04, 0, TAU); p.fill();
      p.beginPath(); p.moveTo(-30, -410); p.quadraticCurveTo(-28, -452, 6, -454); p.quadraticCurveTo(38, -452, 38, -410); p.fill();
      cut(p, () => { p.fillRect(-28, -420, 66, 4); dot(p, -50, -406, 2.4); dot(p, 54, -410, 2.4); });
    } else if (hat === 'kepi') {   // a soft cap tipped forward, a short visor
      p.beginPath(); p.moveTo(-30, -400); p.lineTo(-24, -446); p.quadraticCurveTo(10, -460, 44, -438); p.lineTo(34, -398); p.fill();
      p.beginPath(); p.moveTo(28, -402); p.quadraticCurveTo(56, -404, 66, -394); p.lineTo(30, -392); p.fill();
      cut(p, () => { p.fillRect(-24, -414, 56, 3.5); dot(p, 2, -428, 4); });
    } else if (hat === 'shako') {   // a tall flat-topped cylinder with a plume pom
      p.beginPath(); p.moveTo(-30, -400); p.lineTo(-26, -486); p.lineTo(32, -490); p.lineTo(36, -400); p.fill();
      p.beginPath(); p.moveTo(30, -404); p.quadraticCurveTo(58, -404, 66, -394); p.lineTo(32, -394); p.fill();
      dot(p, 4, -500, 13);
      cut(p, () => { p.fillRect(-24, -416, 56, 4); p.fillRect(-24, -478, 54, 3); star(p, 4, -446, 12); for (let k = 0; k < 6; k++) dot(p, 4 + Math.cos(k) * 6, -500 + Math.sin(k) * 6, 2); });
    } else if (hat === 'bicorne') {   // a wide crescent worn side to side, a cockade
      p.beginPath(); p.moveTo(-92, -402); p.quadraticCurveTo(-60, -476, 4, -480); p.quadraticCurveTo(70, -476, 100, -402); p.quadraticCurveTo(4, -420, -92, -402); p.fill();
      cut(p, () => { p.lineWidth = 2.4; p.beginPath(); p.moveTo(-76, -410); p.quadraticCurveTo(4, -466, 84, -410); p.stroke(); dot(p, 4, -446, 9); });
      g.fillStyle = 'rgb(255,214,96)'; dot(g, 4, -446, 9);
      for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) tear(p, sd * (90 - k * 8), -402, 14, 5, Math.PI / 2 + sd * 0.4);
    } else if (hat === 'pickel') {   // the spiked helmet
      p.beginPath(); p.moveTo(-34, -396); p.quadraticCurveTo(-36, -466, 4, -470); p.quadraticCurveTo(44, -466, 42, -396); p.fill();
      p.beginPath(); p.moveTo(-6, -466); p.lineTo(4, -522); p.lineTo(14, -466); p.fill(); dot(p, 4, -470, 11);
      p.beginPath(); p.moveTo(34, -398); p.quadraticCurveTo(60, -398, 64, -388); p.lineTo(36, -388); p.fill();
      cut(p, () => { p.lineWidth = 2.4; p.beginPath(); p.arc(4, -432, 16, 0, TAU); p.stroke(); dot(p, 4, -432, 6); p.fillRect(-28, -408, 66, 3.5); });
      g.fillStyle = 'rgb(255,214,96)'; dot(g, 4, -432, 16);
    }
    if (rods && !o.noRods) rods.push([...wpt(p, -10, -200), 3.4]);
    both([p, g], (c) => c.restore());
  }
  // a flag on a pole, cloth waving. o: x,y (pole foot), h, kind 'us' | 'uk', s, wave phase
  function flag(p, g, o, t) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s || 1, o.s || 1); c.rotate(o.rot || 0); });
    const h = o.h || 300, fw = 150, fh = 96, top = -h;
    p.fillStyle = INK; p.fillRect(-4, top, 8, h); dot(p, 0, top - 6, 9);
    const wv = (x, y) => Math.sin(x * 0.04 - t * 5 + (o.ph || 0)) * 8 * (x / fw);
    const Q = (x, y) => [6 + x, top + 8 + y + wv(x, y)];
    p.beginPath(); for (let x = 0; x <= fw; x += 10) p.lineTo(...Q(x, 0)); for (let x = fw; x >= 0; x -= 10) p.lineTo(...Q(x, fh)); p.closePath(); p.fill();
    const strip = (c, y0, y1, x0, x1) => { c.beginPath(); for (let x = x0; x <= x1; x += 6) c.lineTo(...Q(x, y0)); for (let x = x1; x >= x0; x -= 6) c.lineTo(...Q(x, y1)); c.closePath(); c.fill(); };
    if (o.kind === 'us') {
      // stripes cut out (lit red), stars punched in the canton (lit blue)
      cut(p, () => { for (let k = 1; k < 7; k += 2) strip(p, k * 13.7, k * 13.7 + 8, 62, fw - 6); for (let k = 5; k < 7; k += 2) strip(p, k * 13.7, k * 13.7 + 8, 6, 62); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) dot(p, ...Q(12 + c * 13, 10 + r * 13), 2.6); });
      g.fillStyle = 'rgb(240,70,52)'; strip(g, 0, fh, 6, fw);
      g.fillStyle = 'rgb(110,150,255)'; strip(g, 0, 56, 6, 62);
    } else {
      // the cross cut wide, a thinner red cross inside it; the saltire as slits; blue gel in the quarters' corners
      cut(p, () => { strip(p, fh / 2 - 12, fh / 2 + 12, 4, fw - 4); strip(p, 4, fh - 4, fw / 2 - 12, fw / 2 + 12);
        p.lineWidth = 6; p.beginPath(); p.moveTo(...Q(8, 6)); p.lineTo(...Q(fw - 8, fh - 6)); p.moveTo(...Q(fw - 8, 6)); p.lineTo(...Q(8, fh - 6)); p.stroke(); });
      g.fillStyle = 'rgb(240,70,52)'; strip(g, fh / 2 - 6, fh / 2 + 6, 4, fw - 4); strip(g, 4, fh - 4, fw / 2 - 6, fw / 2 + 6);
      g.fillStyle = 'rgb(140,170,255)'; strip(g, 0, fh / 2 - 6, 0, fw / 2 - 6);
    }
    both([p, g], (c) => c.restore());
  }
  // the potato patch: earth mounds with leafy stalks; dug-up potatoes show as punched ovals. dug (0..1)
  function potatoes(p, x0, x1, y, t, dug) {
    const r = H.rng(88);
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round';
    for (let x = x0; x < x1; x += 70) {
      p.beginPath(); p.ellipse(x, y, 34, 18, 0, Math.PI, TAU); p.fill();
      const gone = r() < dug;
      if (!gone) for (let k = -1; k <= 1; k++) { const sw = Math.sin(t * 1.4 + x * 0.03 + k) * 4; p.lineWidth = 3; p.beginPath(); p.moveTo(x + k * 10, y - 12); p.lineTo(x + k * 16 + sw, y - 52); p.stroke(); tear(p, x + k * 16 + sw, y - 52, 20, 10, -Math.PI / 2 + k * 0.6); tear(p, x + k * 12 + sw * 0.6, y - 34, 16, 8, -Math.PI / 2 + k * 0.6 + (k ? 0.5 : 0.8)); }
      else { for (let k = 0; k < 3; k++) { const px = x - 30 + k * 26, py = y + 4 - (k % 2) * 8; p.beginPath(); p.ellipse(px, py, 11, 8, k, 0, TAU); p.fill(); cut(p, () => { dot(p, px - 3, py - 2, 1.8); dot(p, px + 4, py + 1, 1.5); }); } }
    }
  }
  // a square-rigger: hull with a row of gun-ports (lit orange), three masts, sails as cut lace. Waterline at y=0.
  function ship(p, g, o, t) {
    const roll = Math.sin(t * 1.6 + (o.ph || 0)) * 0.03, heave = Math.sin(t * 1.9 + (o.ph || 0)) * 5;
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y + heave); c.rotate(roll); c.scale(o.s * (o.flip ? -1 : 1), o.s); });
    p.fillStyle = INK; p.strokeStyle = INK;
    p.beginPath(); p.moveTo(-250, -70); p.lineTo(240, -70); p.lineTo(300, -110); p.lineTo(270, -60); p.quadraticCurveTo(220, 20, 140, 26); p.lineTo(-210, 26); p.quadraticCurveTo(-260, 0, -270, -96); p.closePath(); p.fill();
    p.lineWidth = 5; p.beginPath(); p.moveTo(250, -94); p.lineTo(380, -150); p.stroke();
    cut(p, () => { p.fillRect(-240, -48, 470, 3); for (let x = -200; x < 210; x += 34) p.fillRect(x, -36, 16, 14); });
    g.fillStyle = 'rgb(255,170,70)'; for (let x = -200; x < 210; x += 34) g.fillRect(x, -36, 16, 14);
    [[-150, 300], [10, 380], [160, 320]].forEach(([mx, mh]) => {
      p.fillRect(mx - 5, -70 - mh, 10, mh);
      [0.22, 0.52, 0.78].forEach((u, k) => {
        const sy = -70 - mh + u * mh - 30, sw = 120 - k * -10 - (k === 0 ? 34 : 0), sh = mh * 0.24;
        p.lineWidth = 4; p.beginPath(); p.moveTo(mx - sw / 2, sy); p.lineTo(mx + sw / 2, sy); p.stroke();
        p.beginPath(); p.moveTo(mx - sw / 2, sy); p.lineTo(mx + sw / 2, sy); p.quadraticCurveTo(mx + sw / 2 + 14, sy + sh / 2, mx + sw / 2 - 4, sy + sh); p.lineTo(mx - sw / 2 + 4, sy + sh); p.quadraticCurveTo(mx - sw / 2 + 14, sy + sh / 2, mx - sw / 2, sy); p.fill();
        cut(p, () => { for (let rx = -2; rx <= 2; rx++) for (let ry = 0; ry < 3; ry++) dot(p, mx + rx * sw / 6, sy + sh * (0.25 + ry * 0.25), 2.4); });
      });
      p.beginPath(); p.moveTo(mx, -70 - mh - 4); p.lineTo(mx - 40 + Math.sin(t * 6 + mx) * 4, -70 - mh + 6); p.lineTo(mx, -70 - mh + 12); p.fill();
    });
    p.lineWidth = 1.6; p.beginPath(); p.moveTo(-150, -370); p.lineTo(-268, -96); p.moveTo(10, -450); p.lineTo(380, -150); p.moveTo(160, -390); p.lineTo(300, -110); p.stroke();
    both([p, g], (c) => c.restore());
  }
  // a cannon on a field carriage, facing right. o: x,y,s
  function cannon(p, o) {
    p.save(); p.translate(o.x, o.y); p.scale(o.s * (o.flip ? -1 : 1), o.s); p.fillStyle = INK;
    p.save(); p.translate(0, -70); p.rotate(-0.12); p.beginPath(); p.moveTo(-70, -22); p.lineTo(120, -12); p.lineTo(120, 12); p.lineTo(-70, 22); p.closePath(); p.fill(); dot(p, -74, 0, 22); p.restore();
    p.beginPath(); p.moveTo(-130, 0); p.lineTo(-10, -60); p.lineTo(10, -50); p.lineTo(-110, 6); p.fill();
    dot(p, 0, -40, 40); cut(p, () => { for (let k = 0; k < 10; k++) { const a = k * TAU / 10; p.beginPath(); p.moveTo(Math.cos(a) * 8, -40 + Math.sin(a) * 8); p.arc(0, -40, 32, a + 0.1, a + TAU / 10 - 0.1); p.closePath(); p.fill(); } });
    pin(p, 0, -40, 6); p.restore();
  }
  // an army bell tent with a cut door flap and guy ropes
  function tent(p, x, y, s) {
    p.save(); p.translate(x, y); p.scale(s, s); p.fillStyle = INK; p.strokeStyle = INK;
    p.beginPath(); p.moveTo(-90, 0); p.quadraticCurveTo(-40, -70, 0, -160); p.quadraticCurveTo(40, -70, 90, 0); p.fill();
    p.fillRect(-3, -186, 6, 30);
    p.lineWidth = 1.6; p.beginPath(); p.moveTo(-60, -50); p.lineTo(-130, 0); p.moveTo(60, -50); p.lineTo(130, 0); p.stroke();
    cut(p, () => { p.beginPath(); p.moveTo(-26, 0); p.lineTo(0, -80); p.lineTo(12, 0); p.fill(); for (let k = 0; k < 6; k++) dot(p, -62 + k * 25, -14, 2.4); });
    p.restore();
  }
  // a document with a wax seal; the seal lands with `stamp`
  function parchment(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); });
    const w = 420, h = 250;
    p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 2;
    p.beginPath(); p.moveTo(-w * 0.3, -h / 2); p.lineTo(-w * 0.3, -h / 2 - 1400); p.moveTo(w * 0.3, -h / 2); p.lineTo(w * 0.3, -h / 2 - 1400); p.stroke();
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, 6); p.fill();
    for (const sy of [-1, 1]) { p.beginPath(); p.ellipse(0, sy * h / 2, w / 2 + 14, 16, 0, 0, TAU); p.fill(); }
    cut(p, () => {
      p.lineWidth = 2; p.beginPath(); p.roundRect(-w / 2 + 14, -h / 2 + 22, w - 28, h - 44, 4); p.stroke();
      for (const sy of [-1, 1]) dot(p, -w / 2 - 6, sy * h / 2, 4), dot(p, w / 2 + 6, sy * h / 2, 4);
      p.textAlign = 'center'; p.textBaseline = 'middle';
      p.font = `italic 400 34px ${FF}`; p.fillText('San Juan Island', 0, -54);
      p.font = `400 52px ${NF}`; p.fillText('→ U.S.A.', -30, 22);
      p.lineWidth = 1.6; for (let k = 0; k < 3; k++) { p.beginPath(); p.moveTo(-150, 72 + k * 0); p.lineTo(-20 - k * 30, 72); p.stroke(); }
    });
    if (o.stamp > 0.01) {
      const s = o.stamp, sx = 140, sy = 60;
      both([p, g], (c) => { c.save(); c.translate(sx, sy); c.scale(s, s); });
      p.fillStyle = INK; for (let k = 0; k < 14; k++) dot(p, Math.cos(k * TAU / 14) * 40, Math.sin(k * TAU / 14) * 40, 9); dot(p, 0, 0, 42);
      cut(p, () => { dot(p, 0, 0, 32); });
      g.fillStyle = 'rgb(232,46,40)'; dot(g, 0, 0, 34);
      p.fillStyle = INK; p.save(); p.font = `400 38px ${NF}`; p.textAlign = 'center'; p.textBaseline = 'middle'; p.fillText('W', 0, 3); p.restore();
      both([p, g], (c) => c.restore());
    }
    both([p, g], (c) => c.restore());
  }
  // a little grave marker on the ridge, a pig punched out of it
  function grave(p, g, x, y, s) {
    both([p, g], (c) => { c.save(); c.translate(x, y); c.scale(s, s); });
    p.fillStyle = INK; p.beginPath(); p.moveTo(-60, 0); p.lineTo(-60, -120); p.arc(0, -120, 60, Math.PI, TAU); p.lineTo(60, 0); p.fill();
    p.beginPath(); p.ellipse(0, 4, 110, 18, 0, Math.PI, TAU); p.fill();
    cut(p, () => {
      p.beginPath(); p.ellipse(-4, -110, 30, 18, 0, 0, TAU); p.fill(); p.beginPath(); p.ellipse(28, -116, 13, 12, 0, 0, TAU); p.fill(); p.fillRect(36, -118, 10, 10);
      p.fillRect(-26, -96, 7, 14); p.fillRect(14, -96, 7, 14);
      p.lineWidth = 2; p.beginPath(); for (let a = 0; a < 7; a += 0.4) p.lineTo(-38 - a * 1.4 + Math.cos(a) * 4, -116 - Math.sin(a) * 4); p.stroke();
      p.font = `400 26px ${NF}`; p.textAlign = 'center'; p.fillText('1859', 0, -40);
    });
    g.fillStyle = 'rgb(255,150,170)'; g.beginPath(); g.ellipse(-4, -110, 34, 20, 0, 0, TAU); g.fill(); dot(g, 28, -116, 14);
    both([p, g], (c) => c.restore());
  }

  // ---------- the story ----------
  const D0 = 36.5;   // storyboard clock length
  const T = {
    cardDrop: [0.2, 0.85], cardHoist: [2.4, 3.0],
    flagUS: 3.3, flagUK: 3.8, claimPlaque: 4.2,
    pigIn: [4.9, 5.9], pigPlaque: 5.5, spudPlaque: 6.5, farmerIn: [6.8, 7.5],
    aim: [7.6, 8.1], shot: 8.25, pigFall: [8.3, 8.9],
    officerIn: [9.5, 10.2], arrestTag: 10.5,
    lampDown1: [11.6, 12.3],
    march: [12.2, 13.6], soldiersBoard: [13.2, 13.5],
    shipsIn: [14.9, 16.6], shipsBoard: [15.9, 16.2],
    boardsUp: [17.9, 18.4], moreTroops: [18.2, 19.4], hundredsPlaque: 18.7, sailorsBoard: [19.6, 19.9],
    curtains: [21.3, 21.7, 21.85, 22.25],
    admiralIn: [22.2, 22.9], admiralPlaque: 22.7, halt: [23.3, 23.7], quoteCard: [24.1, 24.6],
    lampDown2: [25.2, 25.9],
    years: [26.3, 28.5], yearsPlaque: 27.4,
    kaiserIn: [28.8, 29.6], kaiserPlaque: 29.5, yearBoardUp: [29.9, 30.4], doc: [30.1, 30.6], stamp: 31.1, usaTag: 31.4,
    lampDown3: [32.0, 32.6],
    casPlaque: 32.75, one: 33.6, onePlaque: 33.95, finalUp: [34.4, 34.8], finalCard: [34.6, 35.2],
  };
  const yearAt = (t) => Math.round(1860 + 12 * EIO(sm(T.years[0], T.years[1], t)));

  function sceneHook(st, t) {
    const hp = EIO(sm(T.cardHoist[0], T.cardHoist[1], t));
    if (hp >= 1) return;
    const dropY = lerp(-300, 560, EO(sm(T.cardDrop[0], T.cardDrop[1], t)));
    pup(st, {}, (p, g) => titleCard(p, g, {
      x: 360, y: lerp(dropY, -500, hp), w: 600, h: 420, s: 1,
      rot: swing(t, T.cardDrop[1], 0.08, 2.2, 7),
      lines: [{ text: 'San Juan Island, 1859', size: 44, y: -112, italic: true }, { text: 'The', size: 70, y: -10 }, { text: 'Pig War', size: 116, y: 112, italic: true }],
    }));
  }
  // the island garden: both flags go up, a pig trots in and roots up the potatoes, the farmer comes out with his rifle
  function sceneGarden(st, t) {
    const gy = 1110;
    pup(st, { blur: 4, alpha: 0.4 }, (p) => mountain(p, st.W, 860));
    pup(st, { blur: 2.6, alpha: 0.55 }, (p) => island(p, st.W, 900, t));
    // the two flags, planted either side
    pup(st, {}, (p, g) => {
      const us = EO(sm(T.flagUS, T.flagUS + 0.35, t)), uk = EO(sm(T.flagUK, T.flagUK + 0.35, t));
      if (us > 0) flag(p, g, { x: 110, y: 980 + (1 - us) * 420, h: 340, kind: 'us', rot: swing(t, T.flagUS + 0.35, 0.06, 3, 9) }, t);
      if (uk > 0) flag(p, g, { x: 560, y: 980 + (1 - uk) * 420, h: 340, kind: 'uk', ph: 1, rot: swing(t, T.flagUK + 0.35, 0.06, 3, 9) }, t);
    });
    const dug = sm(T.pigIn[1], T.pigIn[1] + 1.4, t);
    pup(st, {}, (p) => potatoes(p, 250, 720, gy - 20, t, dug * 0.7));
    // the pig: trots in from the right, roots; shot, it keels over
    pup(st, {}, (p, g, rods) => {
      const u = sm(T.pigIn[0], T.pigIn[1], t);
      if (u <= 0) return;
      const fall = EO(sm(T.pigFall[0], T.pigFall[1], t));
      const x = lerp(st.W + 200, 470, EO(u)) + Math.sin(t * 2.3) * 8 * (u >= 1 && !fall ? 1 : 0);
      const rootA = u >= 1 ? 0.5 + 0.5 * Math.sin(t * 5.5) : 0;
      pig(p, g, { x, y: gy - Math.abs(Math.sin(u * Math.PI * 4)) * 14 * (1 - u) + fall * 6, s: 0.95, flip: true, trot: 1 - u, ph: t * 12, root: rootA * (1 - fall), fall, blink: blinkAt(t, [6.2, 7.4]) }, rods);
    });
    // the farmer with his rifle, from the left
    pup(st, {}, (p, g, rods) => {
      const u = EO(sm(T.farmerIn[0], T.farmerIn[1], t));
      if (u <= 0) return;
      const aim = EIO(sm(T.aim[0], T.aim[1], t)), fl = t > T.shot ? Math.exp(-(t - T.shot) * 9) : 0, kick = fl * 10;
      man(p, g, { x: lerp(-200, 130, u) - kick, y: gy + 20, s: 0.66, walk: 1 - u, ph: t * 9, hat: 'farmer', armR: lerp(0.3, 1.5, aim), armL: lerp(-0.1, 1.2, aim), rifle: fl }, rods);
    });
    // labels (all lift away when the farmer aims)
    pup(st, {}, (p) => {
      const lift = 900 * EIO(sm(T.aim[0], T.aim[0] + 0.5, t));
      if (lift > 890) return;
      if (t > T.claimPlaque && t < T.pigPlaque + 0.4) plaque(p, { x: 360, y: lerp(-80, 330, EO(sm(T.claimPlaque, T.claimPlaque + 0.3, t))) - 900 * EIO(sm(T.pigPlaque - 0.3, T.pigPlaque + 0.3, t)), text: 'both claimed it', size: 48, rot: swing(t, T.claimPlaque + 0.3, 0.05, 3, 9), hang: 500 });
      if (t > T.pigPlaque) plaque(p, { x: 470, y: lerp(-80, 420, EO(sm(T.pigPlaque, T.pigPlaque + 0.3, t))) - lift, text: 'a British pig', size: 46, rot: swing(t, T.pigPlaque + 0.3, 0.06, 3, 9), hang: 500 });
      if (t > T.spudPlaque) plaque(p, { x: 330, y: lerp(-80, 560, EO(sm(T.spudPlaque, T.spudPlaque + 0.3, t))) - lift, text: 'American potatoes', size: 44, rot: swing(t, T.spudPlaque + 0.3, 0.06, 3, 9), hang: 600 });
    });
  }
  // the British officer arrives at the farm: "arrest him!"
  function sceneOfficer(st, t) {
    pup(st, {}, (p, g, rods) => {
      const u = EO(sm(T.officerIn[0], T.officerIn[1], t));
      man(p, g, { x: lerp(st.W + 200, 590, u), y: 1130, s: 0.7, flip: true, walk: 1 - u, ph: t * 9, hat: 'shako', coat: 'red', armR: u >= 1 ? 1.2 + Math.sin(t * 7) * 0.12 * sm(T.arrestTag, T.arrestTag + 0.2, t) : 0.2, armL: -0.1 }, rods);
    });
    if (t > T.arrestTag) pup(st, {}, (p, g) => tag(p, g, { x: 400, y: lerp(-80, 300, EO(sm(T.arrestTag, T.arrestTag + 0.25, t))), w: 330, h: 88, text: 'arrest him!', size: 50, rot: swing(t, T.arrestTag + 0.25, 0.08, 2.5, 8) }));
  }
  // the standoff on the shore: U.S. soldiers march in; British warships sail into the bay; it escalates
  function sceneStandoff(st, t) {
    const gy = 1130, wl = 720;
    pup(st, { blur: 4, alpha: 0.4 }, (p) => mountain(p, st.W, wl - 30));
    pup(st, { blur: 2.6, alpha: 0.55 }, (p) => island(p, st.W, wl - 30, t, { noHills: true, x0: -20, x1: 140, seed: 5 }));
    // ships (behind the sea strip), one after another
    pup(st, {}, (p, g) => {
      [[520, 0, 0.46], [250, 0.4, 0.4], [690, 0.8, 0.36]].forEach(([x, d, s], i) => {
        const u = sm(T.shipsIn[0] + d, T.shipsIn[0] + d + 1.0, t);
        if (u <= 0) return;
        ship(p, g, { x: lerp(st.W + 260, x, EO(u)), y: wl + 22 - i * 10, s, flip: true, ph: i * 1.7 }, t);
      });
    });
    pup(st, { alpha: 0.8 }, (p) => sea(p, st.W, wl, t, 70));
    // a cannon dug in on the shore
    if (t > T.moreTroops[0]) pup(st, {}, (p) => cannon(p, { x: lerp(-200, 520, EO(sm(T.moreTroops[0], T.moreTroops[0] + 0.7, t))), y: gy - 30, s: 0.7 }));
    // the back ranks (blurred: held further from the screen) arrive when it escalates
    const more = EO(sm(T.moreTroops[0], T.moreTroops[1], t));
    if (more > 0) pup(st, { blur: 1.6, alpha: 0.85 }, (p, g) => {
      for (let i = 0; i < 6; i++) man(p, g, { x: lerp(-300, 60 + i * 58, more) , y: gy - 120, s: 0.38, walk: 1 - more, ph: t * 9 + i, hat: 'kepi', armR: 2.9, armL: 0.1, rifle: 0, noRods: true }, null);
    });
    // the front rank of U.S. soldiers, rifles on shoulders
    pup(st, {}, (p, g, rods) => {
      for (let i = 0; i < 4; i++) {
        const u = EO(sm(T.march[0] + i * 0.15, T.march[1] + i * 0.15, t));
        man(p, g, { x: lerp(-260 - i * 110, 70 + i * 92, u), y: gy + 20, s: 0.52, walk: 1 - u, ph: t * 9 + i * 0.6, hat: 'kepi', coat: i === 0 ? 'blue' : null, armR: 2.9, armL: -0.1, rifle: 0, noRods: i > 0 }, rods);
      }
    });
    // boards: 64 soldiers (left), 3 warships (right); hoisted away, then hundreds vs 2,000+
    pup(st, {}, (p) => {
      const up = 900 * EIO(sm(T.boardsUp[0], T.boardsUp[1], t));
      if (up < 890) {
        if (t > T.soldiersBoard[0]) board(p, { x: 190, y: lerp(-500, 320, EO(sm(T.soldiersBoard[0], T.soldiersBoard[1], t))) - up, text: '64', size: 120, hw: 140, label: 'U.S. soldiers', rot: swing(t, T.soldiersBoard[1], 0.04, 2.5, 7) });
        if (t > T.shipsBoard[0]) board(p, { x: 530, y: lerp(-500, 320, EO(sm(T.shipsBoard[0], T.shipsBoard[1], t))) - up, text: '3', size: 120, hw: 140, label: 'warships', rot: swing(t, T.shipsBoard[1], 0.04, 2.5, 7) });
      }
      if (t > T.hundredsPlaque) plaque(p, { x: 360, y: lerp(-80, 215, EO(sm(T.hundredsPlaque, T.hundredsPlaque + 0.3, t))), text: 'hundreds of U.S. soldiers', size: 42, rot: swing(t, T.hundredsPlaque + 0.3, 0.05, 3, 9), hang: 400, yy: 0 });
      if (t > T.sailorsBoard[0]) {
        const pop = 1 + 0.12 * Math.exp(-Math.max(0, t - T.sailorsBoard[1]) * 8) * (t > T.sailorsBoard[1] ? 1 : 0);
        board(p, { x: 360, y: lerp(-500, 390, EO(sm(T.sailorsBoard[0], T.sailorsBoard[1], t))), text: '2,000+', size: 124, hw: 220, pop, label: 'British sailors and marines', rot: swing(t, T.sailorsBoard[1], 0.04, 2.5, 7) });
      }
    });
  }
  // the admiral: hand up, no war. "Not over a pig."
  function sceneAdmiral(st, t) {
    const gy = 1130, wl = 700;
    pup(st, { blur: 2.6, alpha: 0.6 }, (p, g) => ship(p, g, { x: 470, y: wl + 10, s: 0.62, flip: true }, t));
    pup(st, { blur: 1.5, alpha: 0.6 }, (p) => sea(p, st.W, wl, t, 60));
    pup(st, {}, (p, g, rods) => {
      const u = EO(sm(T.admiralIn[0], T.admiralIn[1], t)), h = EO(sm(T.halt[0], T.halt[1], t));
      man(p, g, { x: lerp(-200, 250, u), y: gy + 20, s: 0.86, walk: 1 - u, ph: t * 8, hat: 'bicorne', epaulets: true, sash: true, whiskers: true, armR: lerp(0.2, 2.5, h) + Math.sin(t * 2) * 0.04 * h, armL: -0.1 }, rods);
    });
    pup(st, {}, (p, g) => {
      if (t > T.admiralPlaque) plaque(p, { x: 360, y: lerp(-80, 250, EO(sm(T.admiralPlaque, T.admiralPlaque + 0.3, t))), text: 'Rear Admiral Baynes', size: 44, rot: swing(t, T.admiralPlaque + 0.3, 0.05, 3, 9), hang: 400 });
      if (t > T.quoteCard[0]) titleCard(p, g, { x: 400, y: lerp(-300, 470, EO(sm(T.quoteCard[0], T.quoteCard[1], t))), w: 520, h: 230, s: 1, rot: swing(t, T.quoteCard[1], 0.06, 2.2, 6),
        lines: [{ text: '“Not over', size: 64, y: -14, italic: true }, { text: 'a pig.”', size: 64, y: 58, italic: true }] });
    });
  }
  // twelve years of joint occupation: two camps, a year board counting, then the Kaiser decides
  function sceneCamps(st, t) {
    const gy = 1130;
    pup(st, { blur: 4, alpha: 0.4 }, (p) => mountain(p, st.W, 860));
    pup(st, { blur: 2.6, alpha: 0.5 }, (p) => island(p, st.W, 880, t, { seed: 23 }));
    const kz = EO(sm(T.kaiserIn[0], T.kaiserIn[1], t));
    pup(st, { blur: 1.2 * kz, alpha: 1 - 0.25 * kz }, (p, g) => {
      tent(p, 110, gy - 120, 0.62); tent(p, 220, gy - 108, 0.5);
      tent(p, 520, gy - 120, 0.62); tent(p, 620, gy - 108, 0.5);
      flag(p, g, { x: 165, y: gy - 100, h: 300, kind: 'us', s: 0.8 }, t);
      flag(p, g, { x: 570, y: gy - 100, h: 300, kind: 'uk', s: 0.8, ph: 2 }, t);
      // a soldier from each side, waving across at each other
      man(p, g, { x: 300, y: gy, s: 0.42, hat: 'kepi', armR: 2.4 + Math.sin(t * 6) * 0.3, armL: -0.1, noRods: true }, null);
      man(p, g, { x: 430, y: gy, s: 0.42, hat: 'shako', coat: 'red', flip: true, armR: 2.4 + Math.sin(t * 6 + 1) * 0.3, armL: -0.1, noRods: true }, null);
    });
    // the Kaiser rises in front, stamps the ruling
    if (kz > 0) pup(st, {}, (p, g, rods) => {
      const st2 = sm(T.stamp - 0.25, T.stamp, t), hit = t > T.stamp ? Math.exp(-(t - T.stamp) * 6) : 0;
      man(p, g, { x: lerp(-220, 170, kz), y: gy + 40 + hit * 6, s: 0.84, hat: 'pickel', whiskers: true, stache: true, epaulets: true, sash: true, coat: null, armR: lerp(0.3, 1.9, sm(T.doc[0], T.doc[1], t)) - st2 * 0.5 + hit * 0.2, armL: -0.1 }, rods);
    });
    pup(st, {}, (p, g) => {
      const up = 900 * EIO(sm(T.yearBoardUp[0], T.yearBoardUp[1], t));
      if (t > T.years[0] - 0.3 && up < 890) board(p, { x: 360, y: lerp(-500, 400, EO(sm(T.years[0] - 0.3, T.years[0], t))) - up, text: String(yearAt(t)), size: 124, hw: 210, pop: t > T.years[1] ? 1 + 0.1 * Math.exp(-(t - T.years[1]) * 8) : 1, rot: swing(t, T.years[0], 0.04, 2.5, 7) });
      if (t > T.yearsPlaque && up < 890) plaque(p, { x: 360, y: lerp(-80, 560, EO(sm(T.yearsPlaque, T.yearsPlaque + 0.3, t))) - up, text: '12 years, side by side', size: 44, rot: swing(t, T.yearsPlaque + 0.3, 0.05, 3, 9), hang: 600 });
      if (t > T.kaiserPlaque) plaque(p, { x: 360, y: lerp(-80, 250, EO(sm(T.kaiserPlaque, T.kaiserPlaque + 0.3, t))), text: 'Kaiser Wilhelm I · 1872', size: 42, rot: swing(t, T.kaiserPlaque + 0.3, 0.05, 3, 9), hang: 400 });
      if (t > T.doc[0]) parchment(p, g, { x: 420, y: lerp(-300, 520, EO(sm(T.doc[0], T.doc[1], t))), rot: swing(t, T.doc[1], 0.05, 2.5, 7) + (t > T.stamp ? swing(t, T.stamp, 0.03, 4, 14) : 0), stamp: t > T.stamp - 0.05 ? EO(sm(T.stamp - 0.05, T.stamp + 0.1, t)) * (1 + 0.25 * Math.exp(-Math.max(0, t - T.stamp) * 9)) : 0 });
      if (t > T.usaTag) tag(p, g, { x: 520, y: lerp(-60, 700, EO(sm(T.usaTag, T.usaTag + 0.25, t))), w: 320, h: 80, text: 'to America', size: 40, tx: -34, rot: swing(t, T.usaTag + 0.25, 0.08, 2.5, 8), badge: 'v', badgeS: EO(sm(T.usaTag + 0.25, T.usaTag + 0.4, t)) * 0.85 });
    });
  }
  // the ending: night, a little grave on the ridge, "Casualties: 1", the final card
  function sceneEnd(st, t) {
    const gy = 1120;
    pup(st, {}, (p, g) => moon(p, g, { x: 600, y: 300, r: 66, burst: EO(sm(T.finalCard[1], T.finalCard[1] + 0.4, t)) * 0.8 }));
    pup(st, { blur: 2.2, alpha: 0.6 }, (p) => island(p, st.W, 980, t, { seed: 41 }));
    pup(st, {}, (p, g) => { grave(p, g, 360, gy - 10, 0.95); flag(p, g, { x: 150, y: gy, h: 300, kind: 'us', s: 0.7 }, t); });
    const up = 1000 * EIO(sm(T.finalUp[0], T.finalUp[1], t));
    if (up < 990) pup(st, {}, (p) => {
      if (t > T.casPlaque) plaque(p, { x: 360, y: lerp(-80, 300, EO(sm(T.casPlaque, T.casPlaque + 0.3, t))) - up, text: 'casualties', size: 52, rot: swing(t, T.casPlaque + 0.3, 0.05, 3, 9), hang: 400 });
      if (t > T.one - 0.05) {
        const hit = Math.exp(-Math.max(0, t - T.one) * 5), land = EO(sm(T.one - 0.05, T.one + 0.15, t));
        p.save(); p.translate(360, 640 - up); p.scale(lerp(1.7, 1, land) * (1 + hit * 0.12), lerp(1.7, 1, land) * (1 + hit * 0.12));
        p.fillStyle = INK; p.font = `400 260px ${NF}`; p.textAlign = 'center'; p.globalAlpha = land; p.fillText('1', 0, 0); p.restore();
      }
      if (t > T.onePlaque) plaque(p, { x: 360, y: lerp(1300, 740, EO(sm(T.onePlaque, T.onePlaque + 0.3, t))) - up, text: 'one pig', size: 52 });
    });
    if (t > T.finalCard[0]) pup(st, {}, (p, g) => titleCard(p, g, {
      x: 360, y: lerp(-300, 560, EO(sm(T.finalCard[0], T.finalCard[1], t))), w: 600, h: 380, s: 1, rot: swing(t, T.finalCard[1], 0.06, 2.2, 6),
      lines: [{ text: 'The Pig War', size: 80, y: -50 }, { text: 'only casualty:', size: 46, y: 26, italic: true }, { text: 'one pig', size: 64, y: 102, italic: true }],
    }));
  }

  function drawAt(ctx, W, Hh, t) {
    const st = begin(W, Hh);
    let b = sm(0, 0.55, t) * (1 - 0.35 * Math.max(0, NZ.n2(t * 23, 3.3)) * (1 - sm(0.35, 0.7, t)));
    for (const L of [T.lampDown1, T.lampDown2, T.lampDown3]) b *= 1 - 0.93 * Math.sin(Math.PI * cl((t - L[0]) / (L[1] - L[0])));
    const flare = Math.max(t > T.one ? Math.exp(-(t - T.one) * 3) * 0.32 : 0, t > T.stamp ? Math.exp(-(t - T.stamp) * 4) * 0.2 : 0);
    // the night scene runs on a cooler, dimmer lamp
    lamp(ctx, W, Hh, t, (b + flare * 0.3) * (t > 32.3 ? 0.86 : 1), flare);
    // a red gel flashes over the lamp for the shot; a cool blue one hangs over the night ending
    const red = sm(T.shot, T.shot + 0.05, t) * (1 - sm(T.shot + 0.3, T.shot + 0.7, t));
    if (red > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,70,50,${red * 0.7})`; ctx.fillRect(0, 0, W, Hh); ctx.restore(); }
    if (t > 32.3) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(150,170,255,0.38)'; ctx.fillRect(0, 0, W, Hh); ctx.restore(); }
    if (t < 11.95) { if (t > 2.4) sceneGarden(st, t); if (t > T.officerIn[0] - 0.1) sceneOfficer(st, t); sceneHook(st, t); }
    else if (t < 21.75) sceneStandoff(st, t);
    else if (t < 25.55) sceneAdmiral(st, t);
    else if (t < 32.3) sceneCamps(st, t);
    else sceneEnd(st, t);
    const s = st.S.getContext('2d');
    s.drawImage(valance(W), 0, 0); s.drawImage(ground(W), 0, Hh - 110);
    firBranch(st, t, t < 21.75 || t > 32.3 ? 1 : -1, 0.85);
    const cover = EIO(sm(T.curtains[0], T.curtains[1], t)) * (1 - EIO(sm(T.curtains[2], T.curtains[3], t)));
    if (cover > 0.001) pup(st, {}, (p) => curtains(p, W, Hh, cover, t));
    end(ctx, st, t);
  }

  // The beats above were laid out on a 36.5 s storyboard clock; Austin's lines set the real pace. WARP maps
  // real time -> storyboard time piecewise-linearly (one segment per narration line), so each beat starts on its line.
  const WARP = [[0, 0], [0.2, 0.2], [3.29, 2.8], [9.42, 7.6], [11.42, 9.6], [14.12, 12.3], [17.02, 15.2], [19.92, 18.1], [24.5, 22.0], [29.19, 25.8], [32.44, 28.9], [36.27, 32.6], [40.17, 36.5]];
  const pw = (x, a, b) => { for (let i = 1; i < WARP.length; i++) if (x <= WARP[i][a] || i === WARP.length - 1) { const [p, q] = [WARP[i - 1], WARP[i]]; return p[b] + (q[b] - p[b]) * cl((x - p[a]) / (q[a] - p[a])); } };
  const toStory = (t) => pw(t, 0, 1), toReal = (s) => pw(s, 1, 0);
  function explainer(ctx, W, Hh, t) { drawAt(ctx, W, Hh, toStory(t)); }

  window.PIG = { explainer, D: 40.17, T, toReal, toStory, yearAt, fonts: ['400 132px "Libre Baskerville"', '400 70px "IM Fell English"', 'italic 400 44px "IM Fell English"'] };
})();
