// "The Great Emu War" as a shadow play, 9:16 (720 x 1280). Built on the Shadow Puppet Theatre reference:
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
  // An emu in profile facing right; feet at (0,0). o: x,y,s, flip, run (0..1), ph (gait phase), peck (0..1), blink.
  // Cut-work: rows of drooping feather slits on the shaggy body, a dotted neck stripe; amber gel in the eye.
  function emu(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s * (o.flip ? -1 : 1), o.s); });
    const ph = o.ph || 0, run = o.run || 0, bob = Math.abs(Math.sin(ph)) * 14 * run;
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round'; p.lineJoin = 'round';
    // legs: pinned at the hip, jointed at the ankle (an emu's "backward knee"), three forward toes
    for (const sd of [-1, 1]) {
      const a = run * Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.75 + (run ? 0 : sd * 0.08);
      const hip = [sd * 10, -170 - bob], kneeL = 95, shinL = 90;
      const kx = hip[0] + Math.sin(a) * kneeL, ky = hip[1] + Math.cos(a) * kneeL;
      const b = a - 0.55 - run * 0.4 * Math.max(0, Math.sin(ph + (sd > 0 ? 0 : Math.PI)));
      const fx = kx + Math.sin(b) * shinL, fy = ky + Math.cos(b) * shinL;
      p.lineWidth = 16; p.beginPath(); p.moveTo(hip[0], hip[1]); p.lineTo(kx, ky); p.stroke();
      p.lineWidth = 10; p.beginPath(); p.moveTo(kx, ky); p.lineTo(fx, fy); p.stroke();
      [-0.35, 0, 0.35].forEach((da) => tear(p, fx, fy, 26, 8, da));
      tear(p, fx, fy, 12, 6, Math.PI - 0.3);
      pin(p, kx, ky, 6);
    }
    // the body: a big shaggy drop, the tail end hanging lower
    p.beginPath(); p.moveTo(-150, -200 - bob);
    p.bezierCurveTo(-160, -300 - bob, -40, -330 - bob, 60, -300 - bob);
    p.bezierCurveTo(130, -280 - bob, 120, -200 - bob, 70, -170 - bob);
    p.bezierCurveTo(10, -140 - bob, -90, -140 - bob, -150, -200 - bob); p.fill();
    for (let k = 0; k < 9; k++) tear(p, -140 + k * 24, -160 - bob + Math.sin(k) * 6, 46 + (k % 3) * 8, 14, Math.PI / 2 + 0.25);   // shaggy fringe
    cut(p, () => {
      for (let row = 0; row < 4; row++) for (let k = 0; k < 7 - row; k++) tear(p, -110 + k * 32 + row * 16, -280 + row * 28 - bob, 22, 8, Math.PI / 2 + 0.35);
      for (let k = 0; k < 18; k++) { const u = k / 18; dot(p, lerp(-130, 90, u), -300 + Math.sin(u * Math.PI) * -12 - bob + 8, 2.2); }
    });
    // neck and head (pecking lowers it toward the ground)
    const pk = o.peck || 0;
    both([p, g], (c) => { c.save(); c.translate(80, -280 - bob); c.rotate(pk * 1.25 - run * 0.35); });
    p.lineWidth = 26; p.beginPath(); p.moveTo(0, 0); p.quadraticCurveTo(40, -80, 34, -170); p.stroke();
    p.lineWidth = 18; p.beginPath(); p.moveTo(34, -170); p.lineTo(36, -200); p.stroke();
    p.beginPath(); p.ellipse(44, -214, 34, 24, -0.15, 0, TAU); p.fill();
    p.beginPath(); p.moveTo(70, -222); p.quadraticCurveTo(110, -214, 112, -208); p.quadraticCurveTo(96, -200, 70, -204); p.fill();
    cut(p, () => {
      for (let k = 0; k < 9; k++) { const u = k / 9; dot(p, lerp(8, 34, u) + Math.sin(u * 3) * 10, -20 - u * 150, 2.6); }
      dot(p, 50, -220, 9);
      p.lineWidth = 1.6; p.beginPath(); p.moveTo(76, -213); p.lineTo(104, -210); p.stroke();
    });
    g.fillStyle = 'rgb(255,178,60)'; dot(g, 50, -220, 10);
    p.fillStyle = INK; dot(p, 53, -220, 4.5);
    const bl = o.blink || 0; if (bl > 0) { p.fillRect(40, -230, 20, 20 * bl); }
    pin(p, 0, 0, 8);
    both([p, g], (c) => c.restore());
    if (rods && !o.noRods) rods.push([...wpt(p, -20, -170 - bob), 3.2]);
    both([p, g], (c) => c.restore());
  }
  // An Australian soldier of 1932: slouch hat with the side brim turned up, tunic with punched buttons and belt,
  // puttees on the shins, jointed arms. Feet at (0,0), facing right. o: x,y,s, walk (0..1), ph, armR (rad), flip.
  function soldier(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s * (o.flip ? -1 : 1), o.s); });
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round';
    const ph = o.ph || 0, wk = o.walk || 0;
    for (const sd of [-1, 1]) {
      const a = wk * Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.5;
      both([p, g], (c) => { c.save(); c.translate(sd * 14, -170); c.rotate(-a); });
      p.beginPath(); p.roundRect(-14, 0, 28, 100, 10); p.fill();
      p.beginPath(); p.roundRect(-11, 92, 22, 76, 8); p.fill();
      p.beginPath(); p.ellipse(14, 170, 26, 11, 0, 0, TAU); p.fill();
      cut(p, () => { p.lineWidth = 2; for (let y = 102; y < 160; y += 9) { p.beginPath(); p.moveTo(-10, y); p.lineTo(10, y + 5); p.stroke(); } });
      pin(p, 0, 96, 5);
      both([p, g], (c) => c.restore());
    }
    // tunic
    p.beginPath(); p.moveTo(-46, -180); p.lineTo(-40, -330); p.quadraticCurveTo(0, -350, 40, -330); p.lineTo(48, -180); p.closePath(); p.fill();
    cut(p, () => {
      p.fillRect(-44, -214, 92, 6);
      for (let k = 0; k < 4; k++) dot(p, 4, -318 + k * 28, 3.4);
      for (const sd of [-1, 1]) { p.lineWidth = 2; p.beginPath(); p.roundRect(sd * 22 - 12, -300, 24, 20, 3); p.stroke(); }
    });
    // arms: back arm, then front arm (armR angle)
    for (const sd of [-1, 1]) {
      const a = sd > 0 ? (o.armR == null ? 0.2 : o.armR) : (o.armL == null ? -0.15 : o.armL) + wk * Math.sin(ph) * 0.4;
      both([p, g], (c) => { c.save(); c.translate(sd * 36, -320); c.rotate(-a); });
      p.beginPath(); p.roundRect(-11, 0, 22, 80, 9); p.fill();
      p.beginPath(); p.roundRect(-9, 74, 18, 70, 8); p.fill();
      dot(p, 0, 150, 13);
      pin(p, 0, 0, 7); pin(p, 0, 76, 5);
      if (sd > 0 && rods && !o.noRods) rods.push([...wpt(p, 0, 150), 2.8]);
      both([p, g], (c) => c.restore());
    }
    // head and slouch hat (left brim turned up, a punched badge on it)
    p.beginPath(); p.ellipse(4, -380, 30, 34, 0, 0, TAU); p.fill();
    p.beginPath(); p.moveTo(34, -380); p.lineTo(46, -372); p.lineTo(32, -366); p.fill();
    p.beginPath(); p.moveTo(-70, -404); p.quadraticCurveTo(0, -396, 74, -404); p.lineTo(70, -394); p.quadraticCurveTo(0, -384, -64, -396); p.fill();
    p.beginPath(); p.moveTo(-28, -404); p.quadraticCurveTo(-24, -448, 4, -452); p.quadraticCurveTo(32, -448, 34, -404); p.fill();
    p.beginPath(); p.moveTo(-70, -404); p.quadraticCurveTo(-78, -446, -40, -462); p.lineTo(-30, -410); p.fill();
    cut(p, () => { p.fillRect(-26, -414, 60, 4); star(p, -50, -432, 9); dot(p, 18, -386, 3.2); });
    if (rods && !o.noRods) rods.push([...wpt(p, -10, -200), 3.4]);
    both([p, g], (c) => c.restore());
  }
  // The Lewis gun on its bipod: finned barrel shroud, round pan magazine with punched spokes, wooden stock.
  // o: x,y,s, rot, fire (0..1 flash), jam (0..1 smoke), pan (rotation)
  function lewis(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.scale(o.s, o.s); });
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round';
    p.beginPath(); p.roundRect(-150, -24, 290, 48, 14); p.fill();
    p.fillRect(130, -9, 120, 18);
    p.beginPath(); p.moveTo(-150, -14); p.lineTo(-280, 20); p.lineTo(-280, 58); p.lineTo(-140, 20); p.closePath(); p.fill();
    p.fillRect(-60, 18, 20, 44);
    p.lineWidth = 8; p.beginPath(); p.moveTo(160, 6); p.lineTo(120, 140); p.moveTo(160, 6); p.lineTo(210, 140); p.stroke();
    cut(p, () => {
      for (let x = -130; x < 130; x += 18) { p.fillRect(x, -16, 6, 32); }
      p.lineWidth = 2; p.beginPath(); p.moveTo(-250, 26); p.lineTo(-160, 4); p.stroke();
    });
    // the pan magazine
    both([p, g], (c) => { c.save(); c.translate(-20, -54); });
    p.beginPath(); p.ellipse(0, 0, 92, 24, 0, 0, TAU); p.fill();
    cut(p, () => { for (let k = 0; k < 14; k++) { const a = (o.pan || 0) + k * TAU / 14; p.beginPath(); p.ellipse(Math.cos(a) * 60, Math.sin(a) * 14, 7, 3.4, 0, 0, TAU); p.fill(); } });
    pin(p, 0, 0, 7);
    both([p, g], (c) => c.restore());
    // muzzle flash: a punched star, lit by a hot gel
    if ((o.fire || 0) > 0.02) {
      const f = o.fire, r = 48 * f;
      p.save(); p.translate(276, 0);
      for (let k = 0; k < 8; k++) tear(p, 0, 0, r * (k % 2 ? 0.7 : 1.3), 18 * f, k * TAU / 8);
      cut(p, () => dot(p, 0, 0, r * 0.42));
      p.restore();
      g.fillStyle = 'rgb(255,214,96)'; dot(g, 276, 0, r * 0.6);
    }
    // jammed: puffs of smoke cut as lace rings rising from the breech
    if ((o.jam || 0) > 0.02) {
      for (let k = 0; k < 3; k++) {
        const u = cl(o.jam * 1.4 - k * 0.2), rr = 20 + u * 34;
        if (u <= 0) continue;
        p.save(); p.globalAlpha = 1 - u * 0.6; p.fillStyle = INK; dot(p, -40 + k * 26, -100 - u * 120 - k * 30, rr);
        cut(p, () => { dot(p, -40 + k * 26, -100 - u * 120 - k * 30, rr * 0.7); for (let i = 0; i < 8; i++) dot(p, -40 + k * 26 + Math.cos(i * TAU / 8) * rr * 0.85, -100 - u * 120 - k * 30 + Math.sin(i * TAU / 8) * rr * 0.85, 2.4); });
        p.restore();
      }
    }
    if (rods && !o.noRods) rods.push([...wpt(p, -40, 40), 3.2]);
    both([p, g], (c) => c.restore());
  }
  // A 1930s army truck (open tray), wheels with punched spokes that turn. Wheels sit on y = 0. o: x,y,s,spin,tilt
  function truck(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.tilt || 0); c.scale(o.s, o.s); });
    p.fillStyle = INK; p.strokeStyle = INK;
    p.beginPath(); p.moveTo(-260, -60); p.lineTo(-260, -150); p.lineTo(40, -150); p.lineTo(40, -60); p.closePath(); p.fill();
    p.beginPath(); p.moveTo(40, -60); p.lineTo(40, -230); p.lineTo(140, -230); p.lineTo(150, -150); p.lineTo(240, -130); p.lineTo(250, -60); p.closePath(); p.fill();
    p.fillRect(-270, -70, 530, 22);
    cut(p, () => {
      p.beginPath(); p.roundRect(58, -214, 70, 56, 6); p.fill();
      for (let x = -240; x < 30; x += 30) { p.lineWidth = 3; p.beginPath(); p.moveTo(x, -140); p.lineTo(x, -76); p.stroke(); }
      for (let x = 160; x < 236; x += 12) p.fillRect(x, -120, 5, 40);
    });
    g.fillStyle = 'rgb(255,200,110)'; g.fillRect(58, -214, 70, 56);
    for (const wx of [-170, 160]) {
      both([p, g], (c) => { c.save(); c.translate(wx, -20); c.rotate(o.spin || 0); });
      p.fillStyle = INK; dot(p, 0, 0, 52);
      cut(p, () => { for (let k = 0; k < 8; k++) { const a = k * TAU / 8; p.beginPath(); p.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); p.arc(0, 0, 38, a + 0.12, a + TAU / 8 - 0.12); p.closePath(); p.fill(); } });
      pin(p, 0, 0, 8);
      both([p, g], (c) => c.restore());
    }
    if (rods && !o.noRods) rods.push([...wpt(p, -60, -60), 3.4]);
    both([p, g], (c) => c.restore());
  }
  // A cut-hide wheat crop along the bottom, ears swaying; `eaten` gnaws gaps into it.
  function wheat(p, W, y0, t, eaten) {
    const r = H.rng(55);
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round';
    for (let x = -10; x < W + 10; x += 18 + r() * 10) {
      const h = 120 + r() * 70, sw = Math.sin(t * 1.3 + x * 0.02) * 8, gone = eaten && r() < eaten;
      const hh = gone ? h * 0.35 : h;
      p.lineWidth = 3.5; p.beginPath(); p.moveTo(x, y0); p.quadraticCurveTo(x + sw * 0.4, y0 - hh * 0.6, x + sw, y0 - hh); p.stroke();
      if (!gone) for (let k = 0; k < 6; k++) { const yy = y0 - hh + k * 9; tear(p, x + sw, yy, 15, 6.5, -Math.PI / 2 - 0.5); tear(p, x + sw, yy, 15, 6.5, -Math.PI / 2 + 0.5); }
      if (!gone) { p.lineWidth = 1.4; p.beginPath(); p.moveTo(x + sw, y0 - hh); p.lineTo(x + sw * 1.1, y0 - hh - 26); p.stroke(); }
    }
  }
  // the outback skyline: low hills, a windmill whose sails turn, a fence (cut from one long strip)
  function outback(p, W, Hh, t, gy) {
    p.fillStyle = INK; p.strokeStyle = INK;
    p.beginPath(); p.moveTo(0, gy); p.quadraticCurveTo(140, gy - 70, 300, gy - 30); p.quadraticCurveTo(460, gy + 4, 560, gy - 50); p.quadraticCurveTo(650, gy - 90, W, gy - 40); p.lineTo(W, gy + 20); p.lineTo(0, gy + 20); p.fill();
    // windmill
    const mx = 590, my = gy - 260;
    p.lineWidth = 6; p.beginPath(); p.moveTo(mx - 40, gy - 40); p.lineTo(mx, my); p.lineTo(mx + 40, gy - 50); p.stroke();
    p.lineWidth = 3; for (let y = my + 40; y < gy - 50; y += 40) { p.beginPath(); p.moveTo(mx - (y - my) * 0.18, y); p.lineTo(mx + (y - my) * 0.18, y); p.stroke(); }
    p.save(); p.translate(mx, my); p.rotate(t * 1.2);
    for (let k = 0; k < 12; k++) { p.save(); p.rotate(k * TAU / 12); p.beginPath(); p.moveTo(6, -5); p.lineTo(60, -11); p.lineTo(60, 11); p.lineTo(6, 5); p.fill(); p.restore(); }
    cut(p, () => { for (let k = 0; k < 12; k++) { const a = k * TAU / 12; dot(p, Math.cos(a) * 44, Math.sin(a) * 44, 2.6); } });
    p.restore(); pin(p, mx, my, 7);
    p.beginPath(); p.moveTo(mx + 6, my); p.lineTo(mx + 70, my - 14); p.lineTo(mx + 84, my + 14); p.closePath(); p.fill();
    // fence
    p.lineWidth = 3; for (let x = 20; x < W; x += 70) p.fillRect(x, gy - 46, 8, 50);
    p.beginPath(); p.moveTo(0, gy - 36); p.lineTo(W, gy - 36); p.moveTo(0, gy - 16); p.lineTo(W, gy - 16); p.stroke();
  }

  // ---------- the story ----------
  const D = 32;
  const fmt = (n) => n.toLocaleString('en-US');
  // shared beat times (the sound score reads these too)
  const T = {
    cardDrop: [0.2, 0.85], cardHoist: [2.3, 2.9],
    emusIn: [2.6, 4.4], countEmus: [4.3, 6.2], eatPlaque: 6.4,
    lampDown1: [7.4, 8.2],
    soldierIn: [8.2, 9.0], majorPlaque: 9.1, gunTag: 9.7, roundsBoard: [10.3, 10.6],
    fire: [11.3, 12.4], scatter: [11.5, 13.0], splitPlaque: 12.5,
    flyAt: [13.4, 14.3],
    truckIn: [14.3, 15.1], speedBoard: 15.6, jam: 17.2, jamTag: 17.35, lurch: 18.5,
    curtains: [19.4, 19.75, 19.9, 20.3],
    bulletsCount: [20.6, 22.3], killsCount: [22.6, 23.7], divide: [23.9, 24.4], ten: 24.5,
    lampDown2: [26.4, 27.2],
    retreat: [27.2, 29.0], finalCard: [28.9, 29.4],
  };
  const countEmus = (t) => Math.round(20000 * EO(sm(T.countEmus[0], T.countEmus[1], t)));
  const countBullets = (t) => Math.round(9860 * EO(sm(T.bulletsCount[0], T.bulletsCount[1], t)));
  const countKills = (t) => Math.round(986 * EO(sm(T.killsCount[0], T.killsCount[1], t)));

  // the hook: the title card drops on its strings, then is hoisted to the top
  function sceneHook(st, t) {
    const hp = EIO(sm(T.cardHoist[0], T.cardHoist[1], t));
    const dropY = lerp(-300, 560, EO(sm(T.cardDrop[0], T.cardDrop[1], t)));
    pup(st, {}, (p, g) => titleCard(p, g, {
      x: 360, y: lerp(dropY, 150, hp), w: 600, h: 420, s: lerp(1, 0.46, hp),
      rot: swing(t, T.cardDrop[1], 0.08, 2.2, 7) + swing(t, T.cardHoist[1], 0.05, 2.5, 8),
      lines: [{ text: 'Western Australia, 1932', size: 44, y: -112, italic: true }, { text: 'The Great', size: 70, y: -10 }, { text: 'Emu War', size: 108, y: 112, italic: true }],
    }));
  }
  // the wheat field: emus hop in on their rods and eat; the counter board counts them
  const EMUS = [{ x: 470, d: 0 }, { x: 610, d: 0.25 }, { x: 340, d: 0.5 }, { x: 210, d: 0.75 }, { x: 560, d: 1.0 }];
  function sceneField(st, t) {
    const gy = 1050;
    pup(st, { blur: 1.4, alpha: 0.85 }, (p) => outback(p, st.W, st.Hh, t, 900));
    // emus (behind the wheat)
    pup(st, {}, (p, g, rods) => {
      EMUS.forEach((e, i) => {
        const u = sm(T.emusIn[0] + e.d, T.emusIn[0] + e.d + 0.9, t);
        if (u <= 0) return;
        const x = lerp(st.W + 220, e.x, EO(u)), hop = Math.abs(Math.sin(u * Math.PI * 3)) * 26 * (1 - u);
        const peck = u >= 1 ? 0.5 + 0.5 * Math.sin(t * 3.2 + i * 1.7) : 0;
        emu(p, g, { x, y: gy - hop, s: 0.58 + (i % 2) * 0.06, run: 1 - u, ph: t * 9 + i, peck: peck * (i % 2 ? 1 : 0.7), flip: true, blink: blinkAt(t, [5.1 + i * 0.4]) }, rods);
      });
    });
    pup(st, {}, (p) => wheat(p, st.W, st.Hh - 96, t, 0.55 * sm(5.5, 7.2, t)));
    // counter board: "20,000 emus"
    if (t > T.countEmus[0] - 0.3) {
      const dy = lerp(-700, 0, EO(sm(T.countEmus[0] - 0.3, T.countEmus[0], t))), v = countEmus(t);
      const pop = t > T.countEmus[1] ? 1 + 0.1 * Math.exp(-(t - T.countEmus[1]) * 8) : 1;
      pup(st, {}, (p) => board(p, { x: 360, y: 420 + dy, text: fmt(v), size: 132, pop, label: 'emus', rot: swing(t, T.countEmus[0], 0.04, 2.5, 7) }));
    }
    // "eating the wheat": a plaque on a string, a vine from the board down to the crop
    if (t > T.eatPlaque) {
      pup(st, {}, (p) => {
        vine(p, [[140, 560], [90, 700], [130, 820], [230, 930]], EIO(sm(T.eatPlaque, T.eatPlaque + 0.5, t)), 7);
        plaque(p, { x: 470, y: lerp(-80, 640, EO(sm(T.eatPlaque + 0.2, T.eatPlaque + 0.5, t))), text: 'eating the wheat', size: 40, rot: swing(t, T.eatPlaque + 0.5, 0.06, 3, 9), hang: 500 });
      });
    }
  }
  // the army: the soldier slides in with his gun; then the guns fire and the emus scatter in small groups
  function sceneArmy(st, t) {
    const gy = 1100;
    pup(st, { blur: 1.4, alpha: 0.85 }, (p) => outback(p, st.W, st.Hh, t, 900));
    const firing = sm(T.fire[0], T.fire[0] + 0.05, t) * (1 - sm(T.fire[1], T.fire[1] + 0.1, t));
    const fl = firing * (Math.floor(t * 14) % 2 ? 1 : 0.35);
    // emus: standing about, then scattering in three directions in small groups
    pup(st, {}, (p, g, rods) => {
      const sc = sm(T.scatter[0], T.scatter[1], t);
      [[560, -1, 0], [640, -1, 0.3], [470, 1, 0.15], [520, 1, 0.45], [660, 0, 0.6]].forEach(([x0, dir, d], i) => {
        const u = cl((sc - d * 0.3) / 0.7);
        const x = x0 + dir * EO(u) * 420 + (dir === 0 ? EO(u) * 300 : 0), y = gy - 180 + (dir === 0 ? -EO(u) * 240 : dir * EO(u) * 40) + (i % 2) * 24;
        emu(p, g, { x, y, s: 0.42, run: u > 0 ? 1 : 0, ph: t * 14 + i, flip: dir < 0 || dir === 0, peck: u > 0 ? 0 : 0.4 + 0.4 * Math.sin(t * 3 + i) }, rods);
      });
    });
    // the soldier and his Lewis gun
    const inU = EO(sm(T.soldierIn[0], T.soldierIn[1], t));
    pup(st, {}, (p, g, rods) => {
      const x = lerp(-240, 170, inU), recoil = fl * 6;
      soldier(p, g, { x: x - recoil, y: gy, s: 0.78, walk: 1 - inU, ph: t * 9, armR: 1.0 - firing * 0.1, armL: 0.6 }, rods);
      lewis(p, g, { x: x + 170 - recoil, y: gy - 150, s: 0.62, fire: fl, pan: t * 8 * firing }, rods);
    });
    // labels
    pup(st, {}, (p, g) => {
      if (t > T.majorPlaque) plaque(p, { x: 360, y: lerp(-80, 360, EO(sm(T.majorPlaque, T.majorPlaque + 0.3, t))), text: 'Major Meredith', size: 46, rot: swing(t, T.majorPlaque + 0.3, 0.05, 3, 9), hang: 500 });
      if (t > T.gunTag) tag(p, g, { x: 190, y: lerp(-60, 450, EO(sm(T.gunTag, T.gunTag + 0.25, t))), w: 300, h: 76, text: '2 machine guns', size: 36, rot: swing(t, T.gunTag + 0.25, 0.08, 2.5, 8) });
      if (t > T.roundsBoard[0] && t < T.fire[0] + 0.9) board(p, { x: 520, y: lerp(-500, 640, EO(sm(T.roundsBoard[0], T.roundsBoard[1], t))) - 900 * EIO(sm(T.fire[0] + 0.2, T.fire[0] + 0.8, t)), text: '10,000', size: 96, hw: 170, label: 'rounds', rot: swing(t, T.roundsBoard[1], 0.04, 2.5, 7) });
      if (t > T.splitPlaque) {
        const vp = EIO(sm(T.splitPlaque - 0.25, T.splitPlaque + 0.3, t));
        vine(p, [[560, 880], [520, 800], [420, 760], [300, 790]], vp, 6);
        vine(p, [[580, 880], [640, 820], [700, 760], [690, 680]], vp, 6);
        plaque(p, { x: 360, y: lerp(-80, 560, EO(sm(T.splitPlaque, T.splitPlaque + 0.3, t))), text: 'they split up', size: 44, rot: swing(t, T.splitPlaque + 0.3, 0.06, 3, 9), hang: 500 });
      }
    });
  }
  // the transition: an emu runs right at the lamp; its shadow swells until it fills the screen
  function flyAt(st, t) {
    const q = sm(T.flyAt[0], T.flyAt[1], t), s = lerp(0.42, 6.5, Math.pow(q, 1.25));
    pup(st, { blur: 1 + 24 * q, alpha: 1 - 0.08 * q }, (p, g) => emu(p, g, { x: lerp(560, 760, q), y: lerp(920, 1900, q), s, run: 1, ph: t * 16, noRods: true }, null));
    const cover = sm(0.3, 0.45, q) * (1 - sm(0.62, 0.85, q));
    if (cover > 0) { const s2 = st.S.getContext('2d'); s2.save(); s2.globalAlpha = cover * 0.93; s2.fillStyle = INK; s2.fillRect(0, 0, st.W, st.Hh); s2.restore(); }
  }
  // the chase: the truck can't keep up, the gun jams
  function sceneChase(st, t) {
    const gy = 1120;
    pup(st, { blur: 2, alpha: 0.8 }, (p) => { p.save(); p.translate(-(t * 120) % 720, 0); outback(p, st.W * 2, st.Hh, t, 930); p.restore(); });
    const inU = EO(sm(T.truckIn[0], T.truckIn[1], t)), bump = Math.abs(Math.sin(t * 9)) * 10;
    const lurch = swing(t, T.lurch, 0.12, 2.5, 9);
    const jamU = sm(T.jam, T.jam + 1.4, t), firing = t > T.truckIn[1] + 0.2 && t < T.jam ? (Math.floor(t * 14) % 2 ? 1 : 0.3) : 0;
    // emus racing ahead, far off
    pup(st, { blur: 0.8 }, (p, g, rods) => { [0, 1, 2].forEach((i) => emu(p, g, { x: 520 + i * 70 + Math.sin(t * 2 + i) * 20 + EO(sm(T.lurch, T.lurch + 1, t)) * 120, y: gy - 30 - i * 16, s: 0.34, run: 1, ph: t * 15 + i * 1.3, noRods: true }, rods)); });
    pup(st, {}, (p, g, rods) => {
      const x = lerp(-420, 250, inU) - EO(sm(T.lurch, T.lurch + 1.2, t)) * 40;
      truck(p, g, { x, y: gy - bump, s: 0.72, spin: t * 9, tilt: lurch - 0.02 }, rods);
      soldier(p, g, { x: x - 90, y: gy - bump - 108, s: 0.5, armR: 1.0, armL: 0.6, noRods: true }, null);
      lewis(p, g, { x: x + 10, y: gy - bump - 210, s: 0.44, fire: firing, jam: jamU, pan: firing ? t * 8 : 0, noRods: true }, null);
    });
    pup(st, {}, (p, g) => {
      if (t > T.speedBoard) board(p, { x: 360, y: lerp(-500, 420, EO(sm(T.speedBoard, T.speedBoard + 0.3, t))), text: '50 km/h', size: 112, label: 'an emu at full speed', rot: swing(t, T.speedBoard + 0.3, 0.04, 2.5, 7) });
      if (t > T.jamTag) tag(p, g, { x: 230, y: lerp(-60, 620, EO(sm(T.jamTag, T.jamTag + 0.25, t))), w: 280, h: 80, text: 'jammed!', size: 46, tx: -30, rot: swing(t, T.jamTag + 0.25, 0.1, 2.5, 8), badge: 'x', badgeS: EO(sm(T.jamTag + 0.25, T.jamTag + 0.4, t)) * 0.9 });
    });
  }
  // the tally: bullets and kills count up, a vine divides them, and "10 per bird" lands with a gong
  function sceneTally(st, t) {
    pup(st, {}, (p, g, rods) => {
      board(p, { x: 360, y: 380, text: fmt(countBullets(t)), size: 128, label: 'bullets fired', rot: swing(t, T.bulletsCount[0], 0.04, 2.5, 7) * 0 + Math.sin(t * 1.3) * 0.01 });
      if (t > T.killsCount[0] - 0.25) board(p, { x: 360, y: lerp(-400, 650, EO(sm(T.killsCount[0] - 0.25, T.killsCount[0], t))), text: fmt(countKills(t)), size: 128, label: 'emus reported killed', rot: swing(t, T.killsCount[0], 0.04, 2.5, 7) });
      const vp = EIO(sm(T.divide[0], T.divide[1], t));
      vine(p, [[620, 380], [700, 520], [700, 760], [560, 860]], vp, 7);
      vine(p, [[100, 650], [40, 760], [80, 840], [180, 880]], vp, 7);
    });
    if (t > T.ten - 0.05) {
      const hit = Math.exp(-Math.max(0, t - T.ten) * 5), land = EO(sm(T.ten - 0.05, T.ten + 0.15, t));
      pup(st, {}, (p, g) => {
        p.save(); p.translate(360, 1010); p.scale(lerp(1.6, 1, land) * (1 + hit * 0.12), lerp(1.6, 1, land) * (1 + hit * 0.12));
        p.fillStyle = INK; p.font = `400 220px ${NF}`; p.textAlign = 'center'; p.textBaseline = 'alphabetic'; p.globalAlpha = land; p.fillText('10', 0, 0);
        p.restore();
        if (t > T.ten + 0.25) plaque(p, { x: 360, y: lerp(1300, 1090, EO(sm(T.ten + 0.25, T.ten + 0.5, t))), text: 'bullets per bird', size: 44 });
      });
    }
  }
  // the ending: the soldier marches off; the emus stand on the ridge under a full moon; the final card drops
  function sceneEnd(st, t) {
    const gy = 1120;
    pup(st, {}, (p, g) => moon(p, g, { x: 520, y: 330, r: 90, burst: EO(sm(T.finalCard[1], T.finalCard[1] + 0.4, t)) * 0.8 }));
    pup(st, { blur: 1.2, alpha: 0.9 }, (p) => outback(p, st.W, st.Hh, t, 960));
    pup(st, {}, (p, g, rods) => {
      [[430, 0], [560, 1], [300, 2]].forEach(([x, i]) => emu(p, g, { x, y: gy - 20 - i * 6, s: 0.5 - i * 0.04, flip: i === 1, peck: i === 2 ? 0.5 + 0.5 * Math.sin(t * 3) : 0, blink: blinkAt(t, [30.2 + i * 0.3]) }, rods));
      const u = sm(T.retreat[0], T.retreat[1], t);
      if (u < 1) {
        soldier(p, g, { x: lerp(160, -280, u), y: gy + 10, s: 0.7, walk: 1, ph: t * 9, flip: true, armR: 0.9, armL: 0.2 }, rods);
        lewis(p, g, { x: lerp(160, -280, u) - 40, y: gy - 270, s: 0.4, rot: -0.5, noRods: true }, null);
      }
    });
    if (t > T.finalCard[0]) pup(st, {}, (p, g) => titleCard(p, g, {
      x: 360, y: lerp(-300, 590, EO(sm(T.finalCard[0], T.finalCard[1], t))), w: 600, h: 330, s: 1, rot: swing(t, T.finalCard[1], 0.06, 2.2, 6),
      lines: [{ text: 'Emus 1', size: 84, y: -30, num: true }, { text: 'Army 0', size: 84, y: 78, num: true }],
    }));
  }

  function explainer(ctx, W, Hh, t) {
    const st = begin(W, Hh);
    let b = sm(0, 0.55, t) * (1 - 0.35 * Math.max(0, NZ.n2(t * 23, 3.3)) * (1 - sm(0.35, 0.7, t)));
    b *= 1 - 0.93 * Math.sin(Math.PI * cl((t - T.lampDown1[0]) / (T.lampDown1[1] - T.lampDown1[0])));
    b *= 1 - 0.93 * Math.sin(Math.PI * cl((t - T.lampDown2[0]) / (T.lampDown2[1] - T.lampDown2[0])));
    const flare = t > T.ten ? Math.exp(-(t - T.ten) * 3) * 0.32 : 0;
    lamp(ctx, W, Hh, t, b + flare * 0.3, flare);
    // a red gel slides in front of the lamp while the guns fire, and when one jams
    const red = Math.max(sm(T.fire[0], T.fire[0] + 0.1, t) * (1 - sm(T.fire[1], T.fire[1] + 0.3, t)) * 0.5, sm(T.jam, T.jam + 0.1, t) * (1 - sm(T.jam + 0.5, T.jam + 0.8, t)));
    if (red > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,70,50,${red * 0.75})`; ctx.fillRect(0, 0, W, Hh); ctx.restore(); }
    if (t < 7.8) { if (t > T.emusIn[0] - 0.4) sceneField(st, t); sceneHook(st, t); }
    else if (t < T.flyAt[0] + 0.5) sceneArmy(st, t);
    else if (t < 19.75) sceneChase(st, t);
    else if (t < 26.8) sceneTally(st, t);
    else sceneEnd(st, t);
    if (t > T.flyAt[0] && t < T.flyAt[1]) flyAt(st, t);
    const s = st.S.getContext('2d');
    s.drawImage(valance(W), 0, 0); s.drawImage(ground(W), 0, Hh - 110);
    if (t < 19.75) gumBranch(st, t, 1, 0.85); else if (t > 26.8) gumBranch(st, t, -1, 0.85);
    const cover = EIO(sm(T.curtains[0], T.curtains[1], t)) * (1 - EIO(sm(T.curtains[2], T.curtains[3], t)));
    if (cover > 0.001) pup(st, {}, (p) => curtains(p, W, Hh, cover, t));
    end(ctx, st, t);
  }

  window.EMU = { explainer, D, T, countEmus, countBullets, countKills, fonts: ['400 132px "Libre Baskerville"', '400 70px "IM Fell English"', 'italic 400 44px "IM Fell English"'] };
})();
