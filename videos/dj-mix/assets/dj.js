// DJ mix video: an original DJ girl mixing two tracks on a pure black stage.
// Every frame is drawn from time t alone (seek-safe, deterministic).
(function () {
  const W = 1920, H = 1080, DUR = 269.75, TAU = Math.PI * 2;
  const cv = document.getElementById("cv");
  const ctx = cv.getContext("2d");
  const BEAT = 0.47623, OFF = 0.0156, BAR = BEAT * 4;
  const ENV = window.DJ_ENV;
  const ACC = [255, 90, 31];

  // ---------- helpers ----------
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rnd = (i, salt = 0) => mulberry((i * 9973 + salt * 7919 + 12345) | 0)();
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const bt = (k) => OFF + k * BAR;
  const bpos = (t) => (t + 0.03 - OFF) / BEAT; // visuals land ~30 ms early
  const phase = (t) => { const p = bpos(t); return p - Math.floor(p); };
  const kick = (t, d = 0.14) => Math.exp(-phase(t) * BEAT / d);
  function envAt(arr, t) { const f = t * 30, i = Math.floor(f), k = f - i, n = arr.length - 1; const a = arr[clamp(i, 0, n)] || 0, b = arr[clamp(i + 1, 0, n)] || 0; return a + (b - a) * k; }
  function energy(t) { let s = 0; for (let i = 0; i < 8; i++) s += envAt(ENV.m, t - i / 30); return s / 8; }
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

  const PAL = [
    ["#ff5a1f", "#19c8ff"], ["#ff2e88", "#4a6bff"], ["#ff3b30", "#ffb020"], ["#9b5cff", "#22e0c0"],
    ["#ffe9d6", "#ff5a1f"], ["#3cff7a", "#b04bff"], ["#ffcc33", "#ff2e5f"], ["#2fd0ff", "#e8f4ff"],
    ["#ff7a00", "#7a2bff"], ["#00ffc8", "#ff4fa3"], ["#ff4040", "#3a7bff"], ["#c6ff3a", "#ff5a1f"],
  ].map((p) => p.map(hex));
  const SKIN = [118, 74, 50], SKIN_D = [84, 50, 34], HAIR = [14, 11, 18], JACKET = [18, 18, 23], TOP = [10, 10, 12], WHITE = [226, 226, 234];
  let LT = { L: PAL[0][0], R: PAL[0][1], il: 0.6, ir: 0.6, sil: false };

  // ---------- sections (in bars) ----------
  const SEC = [
    [0, 8, "intro"], [8, 16, "groove"], [16, 22, "build"], [22, 24, "brk"], [24, 30, "drop"], [30, 48, "bd"],
    [48, 62, "big"], [62, 70, "trans"], [70, 76, "drop"], [76, 78, "brk"], [78, 85, "drop"], [85, 86, "brk"],
    [86, 92, "groove"], [92, 94, "brk"], [94, 102, "bounce"], [102, 109, "groove"], [109, 112, "build"],
    [112, 118, "groove"], [118, 122, "bd"], [122, 128, "drop"], [128, 130, "brk"], [130, 140, "final"], [140, 142, "end"],
  ];
  function secAt(t) { for (const s of SEC) if (t < bt(s[1])) return s; return SEC[SEC.length - 1]; }
  const barEnergy = (k) => { let s = 0; for (let i = 0; i < 12; i++) s += envAt(ENV.m, bt(k) + (i / 12) * BAR); return s / 12; };

  // ---------- mix automation (matches the real blend) ----------
  const T_SWAP = 133.36, A_END = 140.96, B_IN = 118.04;
  function cf(t) { if (t < bt(62)) return -1; if (t < bt(63)) return lerp(-1, 0, ease((t - bt(62)) / BAR)); if (t < bt(70.5)) return 0; return lerp(0, 1, ease((t - bt(70.5)) / (BAR / 2))); }
  const fA = (t) => (t < T_SWAP ? 1 : clamp(1 - (t - T_SWAP) / (A_END - T_SWAP)));
  const fB = (t) => (t < bt(64) ? 0 : t < bt(70) ? ease((t - bt(64)) / (bt(70) - bt(64))) : 1);
  const lowB = (t) => (t < T_SWAP ? 0 : clamp((t - T_SWAP) / 0.15));
  function deckAngle(d, t) {
    const w = 3.49;
    if (d < 0) { if (t <= A_END) return w * t; const u = Math.min(1, (t - A_END) / 1.5); return w * (A_END + 0.75 * (1 - (1 - u) * (1 - u))); }
    if (t < B_IN) return 0.3 * Math.sin(t * 0.5);
    const u = t - B_IN; return w * (u < 0.3 ? (u * u) / 0.6 : u - 0.15);
  }

  // ---------- choreography ----------
  const OPTS = {
    intro: [["nudge", "ear"], ["platter", "ear"], ["knob", "ear"], ["ear", "knob"]],
    groove: [["knob", "xf"], ["platter", "knob"], ["ear", "knob"], ["fader", "rest"], ["knob", "pump"], ["rest", "knob"], ["nudge", "point"]],
    build: [["filt", "point"], ["filt", "rest"], ["knob", "raise"], ["filt", "ear"]],
    brk: [["raise", "raise"], ["ear", "raise"], ["point", "ear"], ["raise", "rest"]],
    drop: [["pump", "knob"], ["fader", "pump"], ["raise", "xf"], ["knob", "raise"], ["pump", "pump"], ["platter", "pump"], ["point", "knob"]],
    bd: [["ear", "ear"], ["knob", "rest"], ["rest", "knob"], ["ear", "knob"], ["neck", "knob"]],
    big: [["scratch", "xf"], ["scratch", "pump"], ["pump", "knob"], ["scratch", "raise"], ["scratch", "knob"]],
    final: [["raise", "raise"], ["pump", "pump"], ["knob", "raise"], ["raise", "pump"], ["fader", "raise"], ["point", "pump"]],
    end: [["rest", "rest"]],
  };
  const SCRIPT = [
    [62, 63, "ear", "xf"], [63, 64, "ear", "nudge"], [64, 65, "ear", "fadB"], [65, 66, "knob", "fadB"], [66, 67, "ear", "fadB"],
    [67, 68, "knob", "fadB"], [68, 69, "ear", "fadB"], [69, 70, "raise", "lowB"], [70, 70.5, "raise", "raise"],
    [70.5, 71, "fadA", "xf"], [71, 74, "fadA", "pump"],
  ];
  const SEGS = [];
  (function buildSegs() {
    let prev = -1, n = 0;
    for (const [b0, b1, type] of SEC) {
      if (type === "trans") continue;
      const len = type === "bd" || type === "intro" ? 2 : 1;
      for (let k = b0; k < b1; k += len) {
        if (k >= 62 && k < 74) continue;
        let opts = OPTS[type] || OPTS.groove;
        if (type === "bounce") opts = barEnergy(k) > 0.35 ? OPTS.drop : OPTS.bd;
        let idx = Math.floor(rnd(k, 3) * opts.length);
        if (idx === prev && opts.length > 1) idx = (idx + 1) % opts.length;
        prev = idx;
        let [L, R] = opts[idx];
        if (k >= 74) [L, R] = [R, L]; // after the blend the right hand works deck B
        if (k >= 118 && k < 122) { if (L === "ear") L = "neck"; if (R === "ear") R = "neck"; }
        SEGS.push({ t0: k === 0 ? -1 : bt(k), t1: bt(Math.min(k + len, b1)), L, R, row: Math.floor(rnd(k, 5) * 3), type, n: n++ });
      }
    }
    for (const [b0, b1, L, R] of SCRIPT) SEGS.push({ t0: bt(b0), t1: bt(b1), L, R, row: 2, type: "trans", n: n++ });
    SEGS.sort((a, b) => a.t0 - b.t0);
    SEGS[SEGS.length - 1].t1 = DUR + 5;
  })();
  function segIdx(t) { let lo = 0, hi = SEGS.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SEGS[m].t0 <= t) lo = m; else hi = m - 1; } return lo; }

  // hand targets in "deck space": x lateral, z depth (0 = booth front edge), h height above the surface
  function actPos(name, s, t, sg) {
    const p = phase(t), bp = bpos(t);
    switch (name) {
      case "platter": return { x: s * 290 + 6 * Math.sin(t * 1.7 + s), z: 60, h: 2 };
      case "nudge": return { x: s * 300 + 12 * Math.sin(Math.PI * bp), z: 70, h: 2 };
      case "scratch": { const q = (bp * 2) % 4; const k = q < 3 ? Math.sin(Math.PI * (q % 1)) * (Math.floor(q) % 2 ? -1 : 1) : 0; return { x: s * 300 + 42 * k, z: 85, h: 0 }; }
      case "knob": return { x: s * 31 + 3 * Math.sin(t * 6), z: [150, 115, 80][sg.row], h: 6 };
      case "filt": return { x: s * 31 + 4 * Math.sin(t * 4), z: 172, h: 6 };
      case "lowB": return { x: 31, z: 80, h: 6 };
      case "fader": { const dip = Math.floor(bp) % 4 === 3 ? Math.sin(Math.PI * (bp % 1)) * 0.35 : 0; return { x: s * 68, z: 40 + 40 * (1 - dip), h: 4 }; }
      case "fadA": return { x: -68, z: 40 + 40 * fA(t), h: 4 };
      case "fadB": return { x: 68, z: 40 + 40 * fB(t), h: 4 };
      case "xf": return { x: cf(t) * 60 + 3 * Math.sin(t * 5), z: 10, h: 4 };
      case "ear": return { x: s * 92, z: 262, h: 478 };
      case "neck": return { x: s * 58, z: 262, h: 330 };
      case "raise": return { x: s * (250 + 15 * Math.sin(t * 1.3)), z: 240, h: 735 + 25 * Math.sin(Math.PI * bp / 2) };
      case "pump": { const k = Math.pow(0.5 + 0.5 * Math.cos(TAU * p), 2); return { x: s * 215, z: 230, h: 560 + 150 * k }; }
      case "point": return { x: s * 330, z: 50, h: 440 + 30 * kick(t) };
      default: return { x: s * 215, z: 20, h: 0 };
    }
  }
  function hand(t, s) {
    const i = segIdx(t), sg = SEGS[i];
    const nm = s < 0 ? sg.L : sg.R;
    let P = actPos(nm, s, t, sg);
    const bl = 0.26;
    if (i > 0 && t - sg.t0 < bl) {
      const pv = SEGS[i - 1], Q = actPos(s < 0 ? pv.L : pv.R, s, sg.t0, pv), k = ease((t - sg.t0) / bl);
      P = { x: lerp(Q.x, P.x, k), z: lerp(Q.z, P.z, k), h: lerp(Q.h, P.h, k) + Math.sin(Math.PI * k) * 50 };
    }
    P.act = nm;
    return P;
  }

  function pose(t) {
    const s = secAt(t), ty = s[2], bp = bpos(t), p = phase(t);
    const calm = ty === "bd" || ty === "intro" || ty === "end";
    let nod, sway, tilt;
    if (calm) { nod = 8 * (0.5 + 0.5 * Math.cos(Math.PI * bp)); sway = 16 * Math.sin(Math.PI * bp / 4); tilt = 0.06 * Math.sin(Math.PI * bp / 4); }
    else if (ty === "brk") { nod = 3 * Math.cos(TAU * p); sway = 6 * Math.sin(Math.PI * bp / 2); tilt = -0.05 + 0.03 * Math.sin(Math.PI * bp / 2); }
    else { nod = 13 * Math.pow(0.5 + 0.5 * Math.cos(TAU * p), 2); sway = 10 * Math.sin(Math.PI * bp / 2); tilt = 0.04 * Math.sin(Math.PI * bp / 2); }
    if (t > bt(140)) { const k = ease((t - bt(140)) / 2); nod = lerp(nod, 26, k); tilt *= 1 - k; }
    let eyes = calm || ty === "brk" ? 0 : 1;
    const bf = Math.floor(t / 3.7), bo = rnd(bf, 77) * 3; if (eyes && t - bf * 3.7 - bo > 0 && t - bf * 3.7 - bo < 0.12) eyes = 0;
    const phones = (t >= bt(118) && t < bt(122)) || t >= bt(140) ? "neck" : "on";
    return { nod, sway, tilt, eyes, phones, L: hand(t, -1), R: hand(t, 1), ty };
  }

  // ---------- drawing helpers ----------
  function lit(base, x0, x1, extra = 1) {
    const b = LT.sil ? mixc([0, 0, 0], base, 0.25) : base;
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, rgb(mixc(b, LT.L, clamp(LT.il * 0.85 * extra))));
    g.addColorStop(0.32, rgb(mixc(b, LT.L, clamp(LT.il * 0.1 * extra))));
    g.addColorStop(0.68, rgb(mixc(b, LT.R, clamp(LT.ir * 0.1 * extra))));
    g.addColorStop(1, rgb(mixc(b, LT.R, clamp(LT.ir * 0.85 * extra))));
    return g;
  }
  const flat = (base, k = 0.18) => rgb(mixc(LT.sil ? mixc([0, 0, 0], base, 0.25) : base, mixc(LT.L, LT.R, 0.5), clamp((LT.il + LT.ir) * 0.5 * k)));
  function line(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function ell(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); }
  function ik(S, Hd, U, F, prefer) {
    const dx = Hd[0] - S[0], dy = Hd[1] - S[1], d = Math.hypot(dx, dy) || 1;
    const dc = clamp(d, Math.abs(U - F) + 1, U + F - 0.5), th = Math.atan2(dy, dx);
    const a = Math.acos(clamp((U * U + dc * dc - F * F) / (2 * U * dc), -1, 1));
    const e1 = [S[0] + U * Math.cos(th + a), S[1] + U * Math.sin(th + a)], e2 = [S[0] + U * Math.cos(th - a), S[1] + U * Math.sin(th - a)];
    return [prefer(e1) > prefer(e2) ? e1 : e2, d > dc ? [S[0] + (dx / d) * dc, S[1] + (dy / d) * dc] : Hd];
  }
  function limb(A, B, w) {
    ctx.lineCap = "round"; ctx.strokeStyle = flat(JACKET, 0.15); ctx.lineWidth = w; line(A, B);
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    let nx = -dy / L, ny = dx / L; if (nx > 0) { nx = -nx; ny = -ny; }
    const o = w * 0.4, f = Math.abs(nx) * 0.7 + 0.3;
    ctx.lineWidth = Math.max(3, w * 0.09);
    if (LT.il > 0.03) { ctx.strokeStyle = rgb(LT.L, clamp(LT.il * f)); ctx.beginPath(); ctx.moveTo(A[0] + nx * o, A[1] + ny * o); ctx.lineTo(B[0] + nx * o, B[1] + ny * o); ctx.stroke(); }
    if (LT.ir > 0.03) { ctx.strokeStyle = rgb(LT.R, clamp(LT.ir * f)); ctx.beginPath(); ctx.moveTo(A[0] - nx * o, A[1] - ny * o); ctx.lineTo(B[0] - nx * o, B[1] - ny * o); ctx.stroke(); }
  }
  function drawHand(Hp, dir, sc, s) {
    ctx.save(); ctx.translate(Hp[0], Hp[1]); ctx.rotate(dir); ctx.scale(sc, sc);
    const sk = flat(SKIN, 0.3);
    ctx.fillStyle = rgb(ACC); rrect(-14, -25, 12, 50, 4); ctx.fill(); // orange cuff
    ctx.fillStyle = sk; ell(16, 0, 24, 20); ctx.fill();
    for (let i = 0; i < 4; i++) { ell(38 + (i === 0 || i === 3 ? -3 : 0), -12 + i * 8, 12, 4.4); ctx.fill(); }
    ell(14, s * 19, 12, 6, s * 0.6); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = rgb(mixc(LT.L, LT.R, 0.5), clamp((LT.il + LT.ir) * 0.4)); ell(16, 0, 24, 20); ctx.stroke();
    ctx.restore();
  }
  function cam(c) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2, H / 2); ctx.rotate(c.roll); ctx.scale(c.z, c.z); ctx.translate(-c.cx, -c.cy); }
  const projF = (P) => [P.x, -10 - P.z * 0.25 - P.h];
  const projT = (P) => [P.x * 1.47, 200 - 2 * P.z - 0.35 * P.h];
  const projP = (P) => [40 + (260 - P.z) * 1.6 - (P.act === "ear" ? 40 : 0), -10 - P.z * 0.25 - P.h];

  // ---------- LED facade on the booth front ----------
  let marquee = null, marqueeW = 1;
  function buildMarquee() {
    const c = document.createElement("canvas"); c.width = 900; c.height = 15; const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.font = '15px "Archivo Black"'; x.textBaseline = "top";
    const txt = "BAJO PESADO  +  CONTROLLED GROOVE  +  ";
    marqueeW = Math.ceil(x.measureText(txt).width); x.fillText(txt, 0, 0);
    const d = x.getImageData(0, 0, marqueeW, 15).data; marquee = [];
    for (let j = 0; j < 15; j++) for (let i = 0; i < marqueeW; i++) marquee.push(d[(j * marqueeW + i) * 4 + 3] > 110 ? 1 : 0);
  }
  function ledVal(pat, i, j, t, e) {
    switch (pat) {
      case 0: { const n = 0.55 + 0.45 * Math.sin(i * 0.7 + t * 3.1) * Math.sin(i * 1.31 - t * 2.3); const h = e * 22 * n * (0.8 + 0.4 * kick(t)); return 14 - j < h ? 1 : 0; }
      case 1: { const y0 = 7 + 5 * Math.sin(i * 0.22 + t * 2.4), y1 = 7 + 4 * Math.sin(i * 0.31 - t * 1.7 + 2); return Math.exp(-((j - y0) ** 2) / 1.2) + 0.6 * Math.exp(-((j - y1) ** 2) / 1.2); }
      case 2: { const d = Math.hypot(i - 28.5, (j - 7) * 2), r = (bpos(t) % 2) * 18; return Math.exp(-((d - r) ** 2) / 5) + 0.12; }
      case 3: { const v = (Math.abs(i - 28.5) - Math.abs(j - 7) * 1.2 - t * 14) % 9; return ((v + 9) % 9) < 2.5 ? 1 : 0.04; }
      case 4: { const y = (t * 9 + rnd(i, 4) * 20) % 22; return j <= y && j > y - 5 ? 1 - (y - j) / 5 : 0; }
      case 5: { const on = ((i >> 2) + (j >> 2) + Math.floor(bpos(t))) % 2; return on ? 0.25 + 0.75 * kick(t) : 0.03; }
      case 6: { const sy = (t * 7) % 19 - 2, sx = (t * 26) % 72 - 7; return Math.exp(-((j - sy) ** 2)) + 0.7 * Math.exp(-((i - sx) ** 2) / 3); }
      case 7: { if (!marquee) return 0; const c = ((i + Math.floor(t * 12)) % marqueeW + marqueeW) % marqueeW; return marquee[j * marqueeW + c] ? 1 : 0.03; }
      case 8: return rnd(i * 31 + j * 977, Math.floor(t * 15)) < e * 0.35 ? 1 : 0.02;
      default: return 0.5 + 0.5 * Math.sin((Math.abs(i - 28.5) + Math.abs(j - 7) * 2) * 0.6 - t * 5);
    }
  }
  function ledPanel(t, sh, x0, y0, cols, rows, sp, dot) {
    const e = energy(t), g = clamp(0.3 + 1.2 * e);
    for (let i = 0; i < cols; i++) {
      const c = mixc(LT.L, LT.R, i / (cols - 1));
      for (let j = 0; j < rows; j++) {
        const v = clamp(ledVal(sh.led, i, j, t, e)) * g;
        if (v < 0.05) { ctx.fillStyle = "rgba(255,255,255,0.025)"; } else ctx.fillStyle = rgb(c, v);
        ctx.fillRect(x0 + i * sp, y0 + j * sp, dot, dot);
      }
    }
  }

  // ---------- FRONT VIEW ----------
  function torsoPath(bx, sy) {
    ctx.beginPath();
    ctx.moveTo(bx - 42, sy - 10); ctx.lineTo(bx - 124, sy + 6);
    ctx.quadraticCurveTo(bx - 142, sy + 60, bx - 118, sy + 160); ctx.lineTo(bx - 98, -150); ctx.lineTo(bx - 92, 60);
    ctx.lineTo(bx + 92, 60); ctx.lineTo(bx + 98, -150); ctx.lineTo(bx + 118, sy + 160);
    ctx.quadraticCurveTo(bx + 142, sy + 60, bx + 124, sy + 6); ctx.lineTo(bx + 42, sy - 10); ctx.lineTo(bx, sy + 78); ctx.closePath();
  }
  function face(P) {
    const dark = "#1d110b";
    ctx.strokeStyle = dark; ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      const ex = s * 26, ey = -6;
      if (P.eyes > 0.5) {
        ctx.fillStyle = "#efe6e0"; ell(ex, ey, 12, 6); ctx.fill();
        ctx.fillStyle = "#24160f"; ell(ex + 1, ey, 5.5, 5.5); ctx.fill();
        ctx.fillStyle = rgb(s < 0 ? LT.L : LT.R, 0.9); ell(ex + 3, ey - 2, 1.6, 1.6); ctx.fill();
        ctx.lineWidth = 3.4; ctx.beginPath(); ctx.ellipse(ex, ey, 13, 7, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      } else {
        ctx.lineWidth = 3.4; ctx.beginPath(); ctx.ellipse(ex, ey - 2, 12, 5, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
      }
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex + s * 12, ey - 1); ctx.lineTo(ex + s * 17, ey - 5); ctx.stroke();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(s * 12, -30 - P.eyes * 2); ctx.quadraticCurveTo(s * 26, -36 - P.eyes * 2, s * 38, -29); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(40,20,12,0.55)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(3, 4); ctx.quadraticCurveTo(8, 18, 1, 23); ctx.stroke();
    ctx.fillStyle = "#6e2f2b"; ctx.beginPath(); ctx.moveTo(-16, 42); ctx.quadraticCurveTo(0, 36, 16, 42); ctx.quadraticCurveTo(0, 52, -16, 42); ctx.fill();
    ctx.strokeStyle = "rgba(255,200,180,0.25)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, 46); ctx.lineTo(6, 46); ctx.stroke();
  }
  function bangs() {
    ctx.fillStyle = lit(HAIR, -112, 112, 1.1);
    ctx.beginPath();
    ctx.moveTo(-98, 78); ctx.lineTo(-100, -20); ctx.quadraticCurveTo(-100, -116, 0, -118); ctx.quadraticCurveTo(100, -116, 100, -20);
    ctx.lineTo(98, 78); ctx.quadraticCurveTo(84, 84, 62, 74); ctx.lineTo(62, -6); ctx.quadraticCurveTo(60, -34, 42, -36);
    ctx.lineTo(-42, -36); ctx.quadraticCurveTo(-60, -34, -62, -6); ctx.lineTo(-62, 74); ctx.quadraticCurveTo(-84, 84, -98, 78); ctx.fill();
    ctx.strokeStyle = rgb(mixc(LT.L, [255, 255, 255], 0.3), clamp(LT.il * 0.45)); ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0, -16, 88, Math.PI * 1.12, Math.PI * 1.42); ctx.stroke();
    ctx.strokeStyle = rgb(mixc(LT.R, [255, 255, 255], 0.3), clamp(LT.ir * 0.45));
    ctx.beginPath(); ctx.arc(0, -16, 88, Math.PI * 1.58, Math.PI * 1.88); ctx.stroke();
  }
  function cup(x, y, w, h, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = lit(WHITE, -w, w, 0.7); rrect(-w / 2, -h / 2, w, h, w * 0.45); ctx.fill();
    ctx.fillStyle = rgb(ACC); rrect(s > 0 ? w / 2 - 9 : -w / 2, -h / 2 + 8, 9, h - 16, 4); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.35)"; rrect(-w / 2 + (s > 0 ? 2 : 11), -h / 2 + 14, w - 13, h - 28, 6); ctx.fill();
    ctx.restore();
  }
  function phonesOn() {
    ctx.lineCap = "round"; ctx.strokeStyle = flat(WHITE, 0.25); ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(0, -8, 108, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.strokeStyle = "rgba(20,20,26,0.9)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -8, 101, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
    cup(-104, 8, 38, 78, -1); cup(104, 8, 38, 78, 1);
  }
  function phonesNeck(bx, sy) {
    ctx.strokeStyle = flat(WHITE, 0.25); ctx.lineWidth = 12; ctx.beginPath(); ctx.ellipse(bx, sy - 18, 70, 22, 0, 0.1, Math.PI - 0.1); ctx.stroke();
    cup(bx - 70, sy - 4, 44, 60, -1, 1.2); cup(bx + 70, sy - 4, 44, 60, 1, -1.2);
  }
  function deckFront(t, d, P) {
    const cx = d * 320;
    ctx.fillStyle = lit([22, 22, 26], -620, 620, 0.5);
    ctx.beginPath(); ctx.moveTo(cx - 188, -58); ctx.lineTo(cx + 188, -58); ctx.lineTo(cx + 200, -6); ctx.lineTo(cx - 200, -6); ctx.fill();
    ctx.fillStyle = "#050506"; ell(cx, -31, 150, 22); ctx.fill();
    ctx.strokeStyle = rgb(mixc(LT.L, LT.R, (d + 1) / 2), 0.35); ctx.lineWidth = 2; ell(cx, -31, 150, 22); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; for (const r of [0.78, 0.6]) { ell(cx, -31, 150 * r, 22 * r); ctx.stroke(); }
    ctx.fillStyle = d < 0 ? rgb(ACC) : "#19c8ff"; ell(cx, -31, 40, 6.5); ctx.fill();
    const th = deckAngle(d, t) + scratchOff(d, P);
    ctx.fillStyle = "#fff"; ell(cx + Math.cos(th) * 128, -31 + Math.sin(th) * 18.5, 4, 2); ctx.fill();
    ctx.strokeStyle = "#9aa0aa"; ctx.lineWidth = 4; line([cx + 168, -50], [cx + 70, -36]);
  }
  function scratchOff(d, P) { for (const Hn of [P.L, P.R]) if (Hn.act === "scratch" && Math.sign(Hn.x) === d) return (Hn.x - d * 300) / 60; return 0; }
  function mixerState(t, P) {
    let a = fA(t), b = fB(t);
    for (const [Hn, s] of [[P.L, -1], [P.R, 1]]) {
      if (Hn.act === "fadA" || (Hn.act === "fader" && s < 0)) a = clamp((Hn.z - 40) / 40);
      if (Hn.act === "fadB" || (Hn.act === "fader" && s > 0)) b = clamp((Hn.z - 40) / 40);
    }
    return { a, b, cf: cf(t), va: envAt(ENV.a, t), vb: envAt(ENV.b, t) };
  }
  function mixerFront(t, P) {
    const M = mixerState(t, P);
    ctx.fillStyle = lit([26, 26, 30], -620, 620, 0.5);
    ctx.beginPath(); ctx.moveTo(-128, -62); ctx.lineTo(128, -62); ctx.lineTo(136, -6); ctx.lineTo(-136, -6); ctx.fill();
    for (const [v, x] of [[M.va, -12], [M.vb, 12]]) for (let k = 0; k < 9; k++) {
      const on = v * 11 > k; ctx.fillStyle = on ? (k > 7 ? "#ff3b30" : k > 5 ? "#ffb020" : "#3cff7a") : "rgba(255,255,255,0.06)";
      ctx.fillRect(x - 4, -66 - k * 7, 8, 5);
    }
    ctx.fillStyle = "#2a2a30"; for (const ch of [-1, 1]) for (const z of [172, 150, 115, 80]) { ell(ch * 31, -10 - z * 0.25, 9, 4); ctx.fill(); }
    ctx.fillStyle = "#111"; ctx.fillRect(-50, -14, 100, 4); ctx.fillStyle = "#ddd"; ctx.fillRect(M.cf * 45 - 7, -18, 14, 9);
    for (const [v, ch] of [[M.a, -1], [M.b, 1]]) { ctx.fillStyle = "#ddd"; ctx.fillRect(ch * 68 - 8, -10 - (40 + 40 * v) * 0.25 - 3, 16, 6); }
  }
  function drawFront(t, P, sh) {
    const bx = P.sway, by = P.nod, sy = -378 + by * 0.45, hx = bx * 1.3, hy = -555 + by;
    // back hair
    ctx.fillStyle = lit(HAIR, hx - 112, hx + 112);
    ell(hx, hy - 16, 100, 104); ctx.fill(); rrect(hx - 100, hy - 10, 200, 92, 36); ctx.fill();
    // neck + chest
    ctx.fillStyle = lit(SKIN_D, hx - 32, hx + 32); ctx.fillRect(hx - 25, hy + 40, 50, sy - hy - 10);
    ctx.fillStyle = lit(SKIN_D, bx - 44, bx + 44); ctx.beginPath(); ctx.moveTo(bx - 44, sy - 12); ctx.lineTo(bx + 44, sy - 12); ctx.lineTo(bx, sy + 80); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(hx - 25, hy + 40, 50, 26);
    // torso: dark top, cropped jacket over it
    torsoPath(bx, sy); ctx.fillStyle = lit(TOP, bx - 142, bx + 142); ctx.fill();
    ctx.save(); torsoPath(bx, sy); ctx.clip();
    ctx.fillStyle = lit(JACKET, bx - 142, bx + 142); ctx.fillRect(bx - 200, sy - 40, 400, -168 - (sy - 40));
    const glow = clamp(0.25 + 0.6 * kick(t) * energy(t) * 2);
    ctx.fillStyle = rgb(mixc([150, 150, 162], mixc(LT.L, LT.R, 0.5), 0.4), glow); ctx.fillRect(bx - 200, sy + 102, 400, 9);
    ctx.fillStyle = rgb(ACC, 0.9); ctx.fillRect(bx - 200, -176, 400, 7);
    ctx.strokeStyle = rgb([170, 170, 182], glow); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx - 44, sy - 12); ctx.lineTo(bx - 8, sy + 70); ctx.moveTo(bx + 44, sy - 12); ctx.lineTo(bx + 8, sy + 70); ctx.stroke();
    ctx.restore();
    // head
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(P.tilt);
    ctx.fillStyle = lit(SKIN, -68, 68); ell(0, 0, 64, 80); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ell(0, 58, 46, 20); ctx.fill();
    face(P); bangs(); if (P.phones === "on") phonesOn();
    ctx.restore();
    if (P.phones === "neck") phonesNeck(bx, sy);
    // booth top surface
    ctx.fillStyle = lit([12, 12, 14], -640, 640, 0.4);
    ctx.beginPath(); ctx.moveTo(-560, -66); ctx.lineTo(560, -66); ctx.lineTo(620, 0); ctx.lineTo(-620, 0); ctx.fill();
    deckFront(t, -1, P); deckFront(t, 1, P); mixerFront(t, P);
    // arms
    for (const [Hn, s] of [[P.L, -1], [P.R, 1]]) {
      const S = [bx + s * 116, sy + 18], T = projF(Hn);
      const [E, Hp] = ik(S, T, 235, 225, (e) => s * e[0] + 0.4 * e[1]);
      limb(S, E, 58); limb(E, Hp, 48);
      drawHand(Hp, Math.atan2(Hp[1] - E[1], Hp[0] - E[0]), 1, s);
    }
    // booth front with LED facade
    ctx.fillStyle = "#070708"; ctx.fillRect(-620, 0, 1240, 380);
    ctx.fillStyle = rgb(mixc(LT.L, LT.R, 0.5), clamp(0.3 + energy(t))); ctx.fillRect(-620, 0, 1240, 4);
    ledPanel(t, sh, -572, 26, 58, 16, 20, 9);
  }

  // ---------- TOP VIEW ----------
  function knobTop(x, y, ang, r = 17) {
    ctx.fillStyle = "#2b2b31"; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#e8e8ee"; ctx.lineWidth = 3; line([x, y], [x + Math.sin(ang) * r * 0.85, y - Math.cos(ang) * r * 0.85]);
  }
  function drawTop(t, P, sh) {
    const M = mixerState(t, P);
    ctx.fillStyle = "#09090b"; rrect(-830, -300, 1660, 600, 30); ctx.fill();
    ctx.strokeStyle = rgb(mixc(LT.L, LT.R, 0.5), clamp(0.15 + energy(t) * 0.6)); ctx.lineWidth = 3; ctx.stroke();
    for (const d of [-1, 1]) {
      const cx = d * 470, th = deckAngle(d, t) + scratchOff(d, P);
      ctx.fillStyle = lit([20, 20, 24], cx - 270, cx + 270, 0.22); rrect(cx - 262, -235, 524, 470, 22); ctx.fill();
      ctx.fillStyle = "#040405"; ctx.beginPath(); ctx.arc(cx, 0, 226, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.035)"; ctx.lineWidth = 1.5; for (let r = 80; r < 222; r += 8) { ctx.beginPath(); ctx.arc(cx, 0, r, 0, TAU); ctx.stroke(); }
      const cg = ctx.createConicGradient(-0.6, cx, 0);
      cg.addColorStop(0, rgb(LT.L, 0)); cg.addColorStop(0.06, rgb(LT.L, 0.22 * LT.il)); cg.addColorStop(0.12, rgb(LT.L, 0));
      cg.addColorStop(0.5, rgb(LT.R, 0)); cg.addColorStop(0.56, rgb(LT.R, 0.22 * LT.ir)); cg.addColorStop(0.62, rgb(LT.R, 0)); cg.addColorStop(1, rgb(LT.R, 0));
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, 0, 222, 0, TAU); ctx.arc(cx, 0, 70, 0, TAU, true); ctx.fill();
      ctx.save(); ctx.translate(cx, 0); ctx.rotate(th);
      ctx.fillStyle = d < 0 ? rgb(ACC) : "#19c8ff"; ctx.beginPath(); ctx.arc(0, 0, 66, 0, TAU); ctx.fill();
      ctx.fillStyle = "#0b0b0d"; ctx.font = '13px "Archivo Black"'; ctx.textAlign = "center"; ctx.fillText(d < 0 ? "BAJO PESADO" : "CONTROLLED", 0, -22); if (d > 0) ctx.fillText("GROOVE", 0, -7);
      ctx.fillStyle = "#cfd3da"; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -214, 4, 0, TAU); ctx.fill();
      ctx.restore(); ctx.textAlign = "left";
      ctx.fillStyle = "#3a3d44"; ctx.beginPath(); ctx.arc(cx + 210, -180, 24, 0, TAU); ctx.fill();
      ctx.strokeStyle = "#a9afb8"; ctx.lineWidth = 6; ctx.lineCap = "round"; line([cx + 210, -180], [cx + 150, 40]); line([cx + 150, 40], [cx + 118, 72]);
      ctx.fillStyle = "#cfd3da"; rrect(cx + 104, 60, 26, 34, 5); ctx.fill();
      ctx.fillStyle = "#16161a"; rrect(cx + 226, 10, 16, 180, 6); ctx.fill(); ctx.fillStyle = "#ddd"; ctx.fillRect(cx + 222, 96, 24, 8);
      ctx.fillStyle = "#1d1d22"; rrect(cx - 248, 172, 54, 44, 6); ctx.fill(); ctx.fillStyle = (d < 0 ? t < A_END : t >= B_IN) ? "#3cff7a" : "#333"; ctx.fillRect(cx - 230, 190, 18, 6);
    }
    // mixer
    ctx.fillStyle = lit([24, 24, 28], -180, 180, 0.25); rrect(-172, -232, 344, 464, 16); ctx.fill();
    for (const [v, x] of [[M.va, -12], [M.vb, 12]]) for (let k = 0; k < 12; k++) {
      ctx.fillStyle = v * 15 > k ? (k > 9 ? "#ff3b30" : k > 7 ? "#ffb020" : "#3cff7a") : "rgba(255,255,255,0.06)";
      ctx.fillRect(x - 5, -20 - k * 15, 10, 11);
    }
    for (const ch of [-1, 1]) {
      const rows = [172, 150, 115, 80];
      rows.forEach((z, ri) => {
        let ang = 0;
        if (ch > 0 && ri === 3) ang = lerp(-2.4, 0, lowB(t));
        for (const [Hn, s] of [[P.L, -1], [P.R, 1]]) {
          const own = Math.sign(Hn.x) === ch;
          if (own && ((Hn.act === "knob" && Math.abs(Hn.z - z) < 4) || (Hn.act === "filt" && ri === 0) || (Hn.act === "lowB" && ri === 3))) ang += 0.6 * Math.sin(t * 6 + s);
        }
        knobTop(ch * 45, 200 - 2 * z, ang, ri === 0 ? 20 : 16);
      });
      const v = ch < 0 ? M.a : M.b;
      ctx.fillStyle = "#0e0e10"; rrect(ch * 100 - 5, 30, 10, 100, 4); ctx.fill();
      ctx.fillStyle = "#e5e5ea"; rrect(ch * 100 - 16, 200 - 2 * (40 + 40 * v) - 7, 32, 14, 3); ctx.fill();
    }
    ctx.fillStyle = "#0e0e10"; rrect(-96, 175, 192, 10, 4); ctx.fill();
    ctx.fillStyle = "#e5e5ea"; rrect(M.cf * 88 - 8, 166, 16, 28, 3); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = '600 14px "Inter"'; ctx.textAlign = "center"; ctx.fillText("A", -100, 152); ctx.fillText("B", 100, 152); ctx.textAlign = "left";
    // the DJ seen from above
    const bx = P.sway * 1.2, hy = -470 + P.nod * 0.25, hx = bx * 1.3;
    ctx.fillStyle = lit(JACKET, bx - 210, bx + 210); ell(bx, -428, 205, 82); ctx.fill();
    ctx.strokeStyle = rgb([170, 170, 182], 0.4); ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(bx, -428, 160, 60, 0, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillStyle = lit(HAIR, hx - 95, hx + 95, 1.1); ctx.beginPath(); ctx.arc(hx, hy, 88, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgb(mixc(LT.L, [255, 255, 255], 0.3), clamp(LT.il * 0.4)); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(hx, hy, 70, 2.2, 3.4); ctx.stroke();
    if (P.phones === "on") {
      ctx.strokeStyle = flat(WHITE, 0.25); ctx.lineWidth = 15; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(hx - 90, hy + 6); ctx.quadraticCurveTo(hx, hy - 10, hx + 90, hy + 6); ctx.stroke();
      cup(hx - 96, hy + 8, 30, 64, -1); cup(hx + 96, hy + 8, 30, 64, 1);
    } else { cup(hx - 84, hy + 74, 40, 30, -1, 0.4); cup(hx + 84, hy + 74, 40, 30, 1, -0.4); }
    for (const [Hn, s] of [[P.L, -1], [P.R, 1]]) {
      const S = [bx + s * 168, -418], T = projT(Hn);
      const [E, Hp] = ik(S, T, 300, 285, (e) => s * e[0]);
      limb(S, E, 64); limb(E, Hp, 54);
      drawHand(Hp, Math.atan2(Hp[1] - E[1], Hp[0] - E[0]), 1.25 * (1 + Hn.h / 900), s);
    }
  }

  // ---------- PROFILE VIEW (facing right) ----------
  function profileGirl(t, P) {
    const by = P.nod, sy = -378 + by * 0.45, bx = P.sway * 0.6, hx = bx + 14, hy = -555 + by;
    const outline = (fn) => { ctx.save(); ctx.shadowColor = rgb(LT.R); ctx.shadowBlur = 16; ctx.strokeStyle = rgb(LT.R, clamp(LT.ir)); ctx.lineWidth = 3.5; fn(); ctx.stroke(); ctx.restore(); };
    const backline = (fn) => { ctx.strokeStyle = rgb(LT.L, clamp(LT.il * 0.8)); ctx.lineWidth = 3; fn(); ctx.stroke(); };
    // far arm first (darker)
    const armFar = P.L, armNear = P.R;
    const drawArm = (Hn, dim) => {
      const S = [bx + 8, sy + 22], T = projP(Hn);
      const [E, Hp] = ik(S, T, 235, 225, (e) => e[1] - 0.3 * e[0]);
      const keep = LT; if (dim) LT = { ...LT, il: LT.il * 0.35, ir: LT.ir * 0.35 };
      limb(S, E, 58); limb(E, Hp, 48); drawHand(Hp, Math.atan2(Hp[1] - E[1], Hp[0] - E[0]), 1, 1);
      LT = keep;
    };
    drawArm(armFar, true);
    // legs (dark trousers) so the body doesn't stop at the waist
    const legs = () => { ctx.beginPath(); ctx.moveTo(bx - 62, 40); ctx.lineTo(bx + 60, 40); ctx.quadraticCurveTo(bx + 70, 230, bx + 40, 480); ctx.lineTo(bx - 40, 480); ctx.quadraticCurveTo(bx - 72, 240, bx - 62, 40); ctx.closePath(); };
    legs(); ctx.fillStyle = lit([12, 12, 15], bx - 80, bx + 80); ctx.fill(); outline(legs);
    const torso = () => { ctx.beginPath(); ctx.moveTo(bx - 58, sy + 12); ctx.quadraticCurveTo(bx - 82, sy + 130, bx - 64, 60); ctx.lineTo(bx + 62, 60); ctx.lineTo(bx + 66, -160); ctx.quadraticCurveTo(bx + 86, sy + 120, bx + 50, sy + 8); ctx.quadraticCurveTo(bx, sy - 14, bx - 58, sy + 12); ctx.closePath(); };
    ctx.fillStyle = lit(SKIN_D, hx - 20, hx + 30); ctx.fillRect(hx - 18, hy + 40, 40, sy - hy - 20);
    torso(); ctx.fillStyle = lit(JACKET, bx - 80, bx + 80); ctx.fill(); outline(torso); backline(torso);
    ctx.save(); torso(); ctx.clip(); ctx.fillStyle = rgb(ACC, 0.9); ctx.fillRect(bx - 100, -176, 200, 7); ctx.fillStyle = rgb([170, 170, 182], 0.4 + 0.4 * kick(t)); ctx.fillRect(bx - 100, sy + 100, 200, 8); ctx.restore();
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(P.tilt * 0.6 + (P.nod - 6) * 0.004);
    const head = () => { ctx.beginPath(); ctx.moveTo(-10, 78); ctx.bezierCurveTo(-70, 70, -78, -80, 0, -84); ctx.bezierCurveTo(50, -84, 66, -50, 64, -18); ctx.lineTo(80, 8); ctx.lineTo(66, 16); ctx.quadraticCurveTo(74, 26, 66, 34); ctx.quadraticCurveTo(70, 44, 60, 48); ctx.quadraticCurveTo(58, 64, 40, 70); ctx.closePath(); };
    head(); ctx.fillStyle = lit(SKIN, -60, 80); ctx.fill(); outline(head);
    ctx.strokeStyle = "#1d110b"; ctx.lineWidth = 3.4; ctx.beginPath(); if (P.eyes > 0.5) { ctx.moveTo(36, -8); ctx.lineTo(50, -10); } else { ctx.ellipse(44, -8, 9, 4, 0, 0.2, Math.PI - 0.2); } ctx.stroke();
    ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(34, -30); ctx.quadraticCurveTo(46, -34, 58, -28); ctx.stroke();
    ctx.fillStyle = "#6e2f2b"; ell(64, 30, 6, 4); ctx.fill();
    const hair = () => { ctx.beginPath(); ctx.moveTo(62, -34); ctx.bezierCurveTo(70, -96, -40, -122, -82, -40); ctx.quadraticCurveTo(-96, 30, -78, 80); ctx.lineTo(4, 76); ctx.quadraticCurveTo(-6, 20, 10, -10); ctx.quadraticCurveTo(30, -30, 62, -34); ctx.closePath(); };
    hair(); ctx.fillStyle = lit(HAIR, -90, 70, 1.1); ctx.fill(); outline(hair); backline(hair);
    if (P.phones === "on") {
      ctx.strokeStyle = flat(WHITE, 0.25); ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-6, -10); ctx.quadraticCurveTo(-14, -112, -8, -116); ctx.stroke();
      ctx.fillStyle = lit(WHITE, -40, 40, 0.7); ctx.beginPath(); ctx.arc(-8, 6, 38, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgb(ACC); ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(-8, 6, 30, 0, TAU); ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.arc(-8, 6, 18, 0, TAU); ctx.fill();
    }
    ctx.restore();
    if (P.phones === "neck") { ctx.fillStyle = lit(WHITE, bx - 40, bx + 60, 0.7); ell(bx + 20, sy - 6, 34, 22, -0.3); ctx.fill(); ctx.strokeStyle = rgb(ACC); ctx.lineWidth = 6; ell(bx + 20, sy - 6, 26, 15, -0.3); ctx.stroke(); }
    drawArm(armNear, false);
  }
  function drawProfile(t, P, sh) {
    // booth: side panel and top
    ctx.fillStyle = "#070708"; ctx.fillRect(90, 0, 400, 400);
    ctx.fillStyle = rgb(mixc(LT.L, LT.R, 0.5), clamp(0.3 + energy(t))); ctx.fillRect(470, 0, 6, 400);
    ctx.fillStyle = lit([18, 18, 22], 80, 500, 0.6); ctx.fillRect(84, -10, 400, 10);
    profileGirl(t, P);
    // deck slab and spinning record edge (drawn over the far arm, under the near hand area)
    ctx.fillStyle = lit([22, 22, 26], 180, 420, 0.6); ctx.fillRect(176, -34, 250, 24);
    ctx.fillStyle = "#050506"; ctx.fillRect(196, -42, 210, 8);
    const th = deckAngle(-1, t);
    for (let i = 0; i < 6; i++) { const x = 196 + (((th * 40 + i * 35) % 210) + 210) % 210; ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(x, -41, 6, 6); }
    ctx.fillStyle = "#16161a"; ctx.fillRect(330, -52, 60, 18);
    // re-draw the near hand on top so it sits on the record
    const Hn = P.R; const T = projP(Hn); const S = [P.sway * 0.6 + 8, -378 + P.nod * 0.45 + 22];
    const [E, Hp] = ik(S, T, 235, 225, (e) => e[1] - 0.3 * e[0]);
    if (Hp[1] > -80) { limb(E, Hp, 48); drawHand(Hp, Math.atan2(Hp[1] - E[1], Hp[0] - E[0]), 1, 1); }
  }

  // ---------- MACRO: the record up close ----------
  function drawMacro(t, P, sh) {
    const d = sh.deck, cx = 980 + sh.dx * 0.5, cy = 700, R = 860, sq = 0.4, th = deckAngle(d, t) + scratchOff(d, P);
    const zoom = sh.zk;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(zoom, zoom);
    ctx.save(); ctx.scale(1, sq);
    ctx.fillStyle = "#121215"; ctx.beginPath(); ctx.arc(0, 0, R + 40, 0, TAU); ctx.fill();
    for (let i = 0; i < 90; i++) { const a = th * 0.999 + (i / 90) * TAU; ctx.fillStyle = i % 2 ? rgb(ACC, 0.5) : "rgba(255,255,255,0.25)"; ctx.beginPath(); ctx.arc(Math.cos(a) * (R + 22), Math.sin(a) * (R + 22), 5, 0, TAU); ctx.fill(); }
    ctx.fillStyle = "#030304"; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
    ctx.lineWidth = 1.4; for (let r = 300; r < R; r += 7) { ctx.strokeStyle = `rgba(255,255,255,${0.025 + 0.02 * Math.sin(r * 0.3)})`; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
    const cg = ctx.createConicGradient(-1.2, 0, 0);
    cg.addColorStop(0, rgb(LT.L, 0)); cg.addColorStop(0.05, rgb(LT.L, 0.3 * LT.il)); cg.addColorStop(0.1, rgb(LT.L, 0));
    cg.addColorStop(0.45, rgb(LT.R, 0)); cg.addColorStop(0.5, rgb(LT.R, 0.3 * LT.ir)); cg.addColorStop(0.55, rgb(LT.R, 0)); cg.addColorStop(1, rgb(LT.R, 0));
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.arc(0, 0, 290, 0, TAU, true); ctx.fill();
    ctx.rotate(th);
    ctx.fillStyle = d < 0 ? rgb(ACC) : "#19c8ff"; ctx.beginPath(); ctx.arc(0, 0, 270, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.font = '54px "Archivo Black"'; ctx.textAlign = "center";
    ctx.fillText(d < 0 ? "BAJO" : "CONTROLLED", 0, -110); ctx.fillText(d < 0 ? "PESADO" : "GROOVE", 0, -50);
    ctx.font = '600 26px "Inter"'; ctx.fillText(d < 0 ? "SIDE A  ·  33⅓" : "SIDE B  ·  33⅓", 0, 140);
    ctx.fillStyle = "#cfd3da"; ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill();
    ctx.restore();
    // tonearm from the right
    ctx.strokeStyle = "#b9bec7"; ctx.lineWidth = 16; ctx.lineCap = "round"; line([1000, -420], [560, -40]);
    ctx.fillStyle = "#d8dbe0"; ctx.save(); ctx.translate(560, -40); ctx.rotate(0.7); rrect(-30, -18, 90, 40, 8); ctx.fill(); ctx.restore();
    ctx.restore(); ctx.textAlign = "left";
    // the hand on this deck
    for (const [Hn, s] of [[P.L, -1], [P.R, 1]]) {
      if (Math.sign(Hn.x) !== d || !["platter", "nudge", "scratch"].includes(Hn.act)) continue;
      const hxp = cx + (Hn.x - d * 300) * 6 * zoom - 260 * zoom * d, hyp = cy - 120 * zoom;
      const keep = ctx.getTransform();
      ctx.translate(hxp, hyp); ctx.scale(zoom * 2.6, zoom * 2.6);
      limb([d * -60, -260], [0, -30], 52); drawHand([0, -10], Math.PI / 2 - d * 0.25, 1.1, s);
      ctx.setTransform(keep);
    }
  }

  // ---------- shot list ----------
  const PRESET = {
    F_WIDE: { v: "front", cx: 0, cy: -290, z: 0.9 }, F_MED: { v: "front", cx: 0, cy: -385, z: 1.35 },
    F_CLOSE: { v: "front", cx: 0, cy: -560, z: 2.3 }, F_LOW: { v: "front", cx: 0, cy: -210, z: 1.12 },
    F_SIL: { v: "front", cx: 0, cy: -300, z: 0.95, sil: true }, TOP_FULL: { v: "top", cx: 0, cy: -95, z: 0.72 },
    TOP_MIX: { v: "top", cx: 0, cy: 20, z: 1.7 }, TOP_DECK: { v: "top", cx: -470, cy: 10, z: 1.4 },
    PROFILE: { v: "prof", cx: 190, cy: -300, z: 1.0 }, P_CLOSE: { v: "prof", cx: 120, cy: -470, z: 1.85 }, MACRO: { v: "macro" },
  };
  const ALLOW = {
    intro: ["F_CLOSE", "MACRO", "TOP_DECK", "F_MED"],
    groove: ["F_MED", "F_WIDE", "TOP_FULL", "PROFILE", "MACRO", "TOP_MIX", "F_LOW", "P_CLOSE"],
    build: ["F_CLOSE", "TOP_MIX", "PROFILE", "F_MED", "P_CLOSE"],
    brk: ["F_SIL", "PROFILE", "F_LOW", "F_CLOSE"],
    drop: ["F_WIDE", "F_MED", "TOP_FULL", "F_LOW", "PROFILE", "F_CLOSE", "TOP_DECK", "F_SIL"],
    bd: ["PROFILE", "F_CLOSE", "MACRO", "F_MED", "TOP_FULL", "P_CLOSE"],
    big: ["MACRO", "TOP_DECK", "F_WIDE", "F_MED", "F_LOW", "PROFILE", "TOP_FULL"],
    bounce: ["F_WIDE", "F_SIL", "F_CLOSE", "TOP_MIX", "PROFILE", "F_MED"],
    final: ["F_WIDE", "F_MED", "F_LOW", "TOP_FULL", "F_SIL", "PROFILE", "F_CLOSE", "TOP_DECK"],
    end: ["F_WIDE"],
  };
  const LEN = { intro: 4, groove: 4, build: 2, brk: 2, drop: 2, bd: 4, big: 2, bounce: 2, final: 2, end: 2 };
  const FORCED = { 0: ["MACRO", 4, -1], 4: ["F_WIDE", 4], 62: ["TOP_MIX", 1], 63: ["MACRO", 1, 1], 64: ["F_MED", 2], 66: ["TOP_MIX", 2], 68: ["PROFILE", 1], 69: ["F_CLOSE", 1], 70: ["F_WIDE", 2], 72: ["TOP_MIX", 2] };
  const SHOTS = [];
  (function buildShots() {
    let prev = "", prev2 = "", pal = 0, led = 0, n = 0;
    const high = (ty) => ["drop", "big", "final", "bounce"].includes(ty);
    for (const [b0, b1, ty] of SEC) {
      let k = b0;
      while (k < b1) {
        let type, len, deck;
        if (FORCED[k]) { [type, len, deck] = FORCED[k]; }
        else {
          if (ty === "trans") { k++; continue; }
          len = LEN[ty] || 2; if (ty === "build" && b1 - k <= 2) len = 1;
          const all = ALLOW[ty] || ALLOW.groove;
          let c = all.filter((x) => x !== prev && x !== prev2); if (!c.length) c = all.filter((x) => x !== prev); if (!c.length) c = all;
          type = c[Math.floor(rnd(k, 11) * c.length)];
        }
        len = Math.min(len, b1 - k);
        const t0 = k === 0 ? 0 : bt(k), t1 = k + len >= 142 ? DUR + 1 : bt(k + len);
        if (deck === undefined) deck = t0 < T_SWAP ? -1 : 1;
        pal = (pal + 1 + Math.floor(rnd(k, 13) * (PAL.length - 1))) % PAL.length;
        led = (led + 1 + Math.floor(rnd(k, 17) * 9)) % 10;
        const modes = high(ty) ? ["pulse", "alt", "steady", "pulse"] : ["swing", "steady", "swing"];
        const pr = PRESET[type];
        SHOTS.push({
          t0, t1, type, ty, pal, led, deck, n: n++, mode: modes[Math.floor(rnd(k, 19) * modes.length)], seed: rnd(k, 23) * 6,
          sil: !!pr.sil, dz: (rnd(k, 29) - 0.5) * 0.16, dx: (rnd(k, 31) - 0.5) * 120, dy: (rnd(k, 37) - 0.5) * 50,
          r0: (rnd(k, 41) - 0.5) * 0.035, r1: (rnd(k, 43) - 0.5) * 0.035, ox: type === "F_CLOSE" ? (rnd(k, 47) - 0.5) * 120 : 0,
          zk: 0.9 + rnd(k, 53) * 0.35,
        });
        prev2 = prev; prev = type; k += len;
      }
    }
  })();
  function shotAt(t) { for (const s of SHOTS) if (t < s.t1) return s; return SHOTS[SHOTS.length - 1]; }

  function lights(t, sh) {
    const e = energy(t), base = 0.34 + 1.0 * e, k = kick(t), bi = Math.floor(bpos(t));
    let il = base, ir = base;
    if (sh.mode === "pulse") il = ir = base * (0.7 + 0.5 * k);
    else if (sh.mode === "alt") { const on = bi % 2 === 0; il = base * (on ? 1.1 : 0.5); ir = base * (on ? 0.5 : 1.1); }
    else if (sh.mode === "swing") { const s = Math.sin(t * 0.8 + sh.seed); il = base * (0.65 + 0.35 * s); ir = base * (0.65 - 0.35 * s); }
    if (sh.sil) { il *= 1.35; ir *= 1.35; }
    LT = { L: PAL[sh.pal][0], R: PAL[sh.pal][1], il, ir, sil: sh.sil };
  }

  // ---------- overlays ----------
  function lowerThird(t, t0, title) {
    const lt = t - t0; if (lt < 0 || lt > 6) return;
    const a = clamp(lt / 0.5) * clamp((6 - lt) / 0.6);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a;
    const x = 96 - (1 - ease(lt / 0.6)) * 30;
    ctx.fillStyle = rgb(ACC); ctx.fillRect(x, 930, 6, 70);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = '600 22px "Inter"'; ctx.fillText("NOW PLAYING", x + 26, 956);
    ctx.fillStyle = "#fff"; ctx.font = '46px "Archivo Black"'; ctx.fillText(title, x + 24, 1000);
    ctx.globalAlpha = 1;
  }
  function embers(t, sh) {
    if (!(sh.ty === "final" || sh.ty === "big")) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 46; i++) {
      const sp = 40 + rnd(i, 61) * 90, y = H + 40 - ((t * sp + rnd(i, 62) * (H + 80)) % (H + 80)), x = rnd(i, 63) * W + Math.sin(t * 0.7 + i) * 30;
      ctx.fillStyle = rgb(PAL[sh.pal][i % 2], 0.25 + 0.35 * rnd(i, 64)); ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd(i, 65) * 2.5, 0, TAU); ctx.fill();
    }
  }

  function renderAt(t) {
    t = clamp(t, 0, DUR);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    const sh = shotAt(t), P = pose(t);
    lights(t, sh);
    const u = (t - sh.t0) / Math.max(0.5, sh.t1 - sh.t0), pr = PRESET[sh.type];
    const punch = ["drop", "big", "final", "bounce"].includes(sh.ty) ? 0.012 * kick(t) : 0;
    if (pr.v === "macro") drawMacro(t, P, sh);
    else {
      let cx = pr.cx + sh.ox + sh.dx * (u - 0.5);
      if (sh.type === "TOP_DECK") cx = sh.deck * 470 + sh.dx * (u - 0.5);
      cam({ cx, cy: pr.cy + sh.dy * (u - 0.5), z: pr.z * (1 + sh.dz * u + punch), roll: lerp(sh.r0, sh.r1, u) });
      if (pr.v === "front") drawFront(t, P, sh); else if (pr.v === "top") drawTop(t, P, sh); else drawProfile(t, P, sh);
    }
    embers(t, sh);
    lowerThird(t, 2, "Bajo Pesado"); lowerThird(t, 134.2, "Controlled Groove");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const fade = Math.max(clamp(1 - t / 1.4), clamp((t - (DUR - 1.8)) / 1.6));
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  }

  let last = 0;
  const fonts = Promise.all([document.fonts.load('46px "Archivo Black"'), document.fonts.load('600 22px "Inter"')]).then(() => { buildMarquee(); renderAt(last); });
  window.__hf = window.__hf || {};
  window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady.dj = fonts;
  window.addEventListener("hf-seek", (e) => { last = e.detail.time; renderAt(e.detail.time); });
  window.__djShots = SHOTS;
  renderAt(0);
})();
