// The sound score for the shadow-play Emu War. Every cue is read from the picture's own beat times (EMU.T) so sound
// and image land on the same frame. Medium-true palette: struck bronze (gamelan), wooden rod taps, hide rustle, the
// lamp's hum; one gong for the key number. Effects in front, hum and room underneath, never more than ~3 at once.
(function () {
  const T = EMU.T, D = EMU.D;
  function scoreSound(k) {
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // struck bronze: fundamental + a detuned twin (the beat) + soft partials under 2.5 kHz
    const gam = (t, n, g = 1, pan = 0, minor = false) => {
      const f = k.hz(n);
      k.tone(t, { f, dur: 1.9, gain: 0.13 * g, a: 0.002, pan, verb: 0.3, minor });
      k.tone(t, { f: f * 1.007, dur: 1.6, gain: 0.07 * g, a: 0.002, pan, verb: 0.3, minor });
      k.tone(t, { f: f * 2.01, dur: 0.55, gain: 0.04 * g, a: 0.002, pan, minor });
      if (f * 2.95 < 2500) k.tone(t, { f: f * 2.95, dur: 0.22, gain: 0.018 * g, a: 0.002, pan, minor });
      k.noise(t, { dur: 0.02, filter: 'bandpass', f: Math.min(2200, f * 1.6), q: 2, gain: 0.08 * g, pan, minor });
    };
    const gong = (t, g = 1) => {
      k.play('thud', t, { f: 90, gain: 0.7 * g });
      k.tone(t, { f: [[0, 98], [3.6, 95]], dur: 3.6, gain: 0.36 * g, a: 0.012, verb: 0.45 });
      k.tone(t, { f: [[0, 99.2], [3.2, 96]], dur: 3.2, gain: 0.16 * g, a: 0.02 });
      k.tone(t, { f: 202, dur: 2.2, gain: 0.1 * g, a: 0.01, verb: 0.4 });
      k.tone(t, { f: 277, dur: 1.4, gain: 0.05 * g, a: 0.01 });
      k.noise(t, { dur: 0.3, color: 'brown', filter: 'lowpass', f: 450, gain: 0.3 * g });
    };
    const tap = (t, f = 640, g = 0.55, pan = 0, minor = true) => { k.play('tock', t, { f, gain: g, pan, minor }); k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1700, q: 2.5, gain: 0.32 * g, a: 0.001, pan, minor }); };
    const hide = (t, dur, g = 0.5, pan = 0, minor = true) => k.play('paper', t, { dur, gain: g, pan, minor });
    const slide = (t, dur, g = 0.12, minor = true) => k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 260], [dur * 0.5, 520], [dur, 240]], gain: g, a: dur * 0.4, minor });
    const flap = (t, g = 0.25, pan = 0, minor = true) => k.noise(t, { dur: 0.11, color: 'pink', filter: 'lowpass', f: [[0, 900], [0.11, 300]], gain: g, a: 0.03, pan, minor });
    const sigh = (t) => k.noise(t, { dur: 0.8, color: 'brown', filter: 'lowpass', f: [[0, 600], [0.4, 140], [0.8, 600]], gain: 0.35, a: 0.05, hold: 0.5 });
    // the Lewis gun as a shadow-theatre effect: a hard wooden clack with a gritty rattle, 12 a second at most
    const burst = (t0, t1, pan = 0) => { for (let t = t0; t < t1; t += 1 / 12) { tap(t, 1350, 0.55, pan, false); k.noise(t, { dur: 0.04, filter: 'bandpass', f: 900, q: 1.2, gain: 0.18, pan }); } };
    // counter ticks: wooden, at most ~11 a second, slowing as the number settles
    const ticks = (f, a, b, pan = 0) => { let last = -1, prev = f(a); for (let t = a; t < b; t += 0.002) { const v = f(t); if (v !== prev && t - last >= 0.09) { tap(t, 1150, 0.36, pan); last = t; } prev = v; } };

    // ---- beds: the lamp's hum and the room
    k.bed('hum', 0.2, D, { gain: 0.5 });
    k.bed('room', 0, D, { gain: 0.7 });
    k.noise(0.04, { dur: 0.45, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.12, 700], [0.45, 180]], gain: 0.4, a: 0.05 });
    [0.18, 0.31, 0.47].forEach((t, i) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1300 + i * 300, q: 1.5, gain: 0.12, minor: true }));
    [3.3, 9.6, 15.0, 21.0, 27.9, 30.6].forEach((t, i) => k.noise(t, { dur: 0.01, filter: 'bandpass', f: 1500 + i * 120, q: 1.4, gain: 0.07, minor: true }));

    // ---- 1 HOOK: the title card drops on its strings and lands; hoisted to the top
    hide(0.25, 0.3, 0.7);
    tap(T.cardDrop[1], 520, 0.7, 0, false);
    gam(T.cardDrop[1] + 0.02, 'D4', 1.0);
    slide(T.cardHoist[0], 0.6, 0.14);
    tap(T.cardHoist[1] - 0.03, 700, 0.45, -0.3);

    // ---- 2 THE EMUS: each hops in (landings at u = 1/3, 2/3, 1 of its 0.9 s entry), then the count
    [0, 0.25, 0.5, 0.75, 1.0].forEach((d, i) => {
      const t0 = T.emusIn[0] + d;
      hide(t0, 0.3, 0.35, 0.7);
      [1 / 3, 2 / 3, 1].forEach((u, j) => tap(t0 + 0.9 * u, 380 + i * 25 - j * 20, j === 2 ? 0.55 : 0.4, 0.5));
    });
    hide(T.countEmus[0] - 0.3, 0.25, 0.35);
    tap(T.countEmus[0], 760, 0.5, 0, false);
    ticks(EMU.countEmus, T.countEmus[0] + 0.05, T.countEmus[1] - 0.02);
    gam(T.countEmus[1], 'A4', 0.9);
    k.play('stroke', T.eatPlaque, { material: 'brush', dur: 0.5, gain: 0.7, minor: true });
    tap(T.eatPlaque + 0.5, 820, 0.5, 0.2);

    // ---- 3 THE ARMY: the lamp turned down and up, the soldier slides in, labels drop
    sigh(T.lampDown1[0]);
    slide(T.soldierIn[0], 0.8, 0.16);
    [0.25, 0.5, 0.75].forEach((u) => tap(T.soldierIn[0] + u * 0.8, 300, 0.35, -0.6));
    tap(T.majorPlaque + 0.3, 860, 0.6, 0);
    tap(T.gunTag + 0.25, 640, 0.55, -0.4, false);
    tap(T.roundsBoard[1], 520, 0.6, 0.3, false);
    gam(T.roundsBoard[1] + 0.02, 'A3', 0.8, 0.3);

    // ---- 4 THE SHOOTING: a red gel slides in, the gun clacks, emus scatter, vines split
    k.noise(T.fire[0] - 0.05, { dur: 0.14, filter: 'highpass', f: 1200, gain: 0.08, a: 0.06 });
    burst(T.fire[0], T.fire[1], -0.3);
    [11.6, 11.85, 12.1, 12.35].forEach((t, i) => flap(t, 0.25, i % 2 ? 0.6 : -0.2));
    k.play('stroke', T.splitPlaque - 0.25, { material: 'brush', dur: 0.55, gain: 0.8, minor: true });
    tap(T.splitPlaque + 0.3, 820, 0.6, 0);

    // ---- 5 TRANSITION: an emu runs at the lamp, its shadow fills the screen
    flap(T.flyAt[0] + 0.05, 0.45, 0.3, false); flap(T.flyAt[0] + 0.22, 0.5, 0.1, false);
    k.noise(T.flyAt[0] + 0.1, { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 180], [0.35, 800], [0.75, 160]], q: 0.8, gain: 0.42, a: 0.3, verb: 0.2 });
    k.play('thud', T.flyAt[0] + 0.42, { f: 70, gain: 0.35 });

    // ---- 6 THE CHASE: the truck rumbles, the gun fires on the move, the speed board lands
    k.play('roller', T.truckIn[0], { dur: T.curtains[0] - T.truckIn[0], gain: 0.5, pan: -0.2 });
    burst(T.truckIn[1] + 0.2, 15.4, -0.2);
    tap(T.speedBoard + 0.3, 760, 0.6, 0, false);
    gam(T.speedBoard + 0.32, 'E5', 0.7);
    burst(16.4, T.jam, -0.2);

    // ---- 7 THE JAM: a clunk and a dry click, clashing bronze, smoke puffs, the tag with its X, the lurch
    k.play('thud', T.jam, { f: 200, gain: 0.5, pan: -0.2 });
    k.play('click', T.jam + 0.12, { f: 1500, gain: 0.9, pan: -0.2 });
    gam(T.jam + 0.05, 'Eb4', 0.8); gam(T.jam + 0.05, 'E4', 0.7); gam(T.jam + 0.05, 'A2', 0.9);
    [0.3, 0.55, 0.8].forEach((d) => k.noise(T.jam + d, { dur: 0.25, color: 'pink', filter: 'lowpass', f: 600, gain: 0.08, a: 0.08, pan: -0.2, minor: true }));
    tap(T.jamTag + 0.25, 640, 0.6, -0.3, false);
    k.play('thud', T.lurch, { f: 120, gain: 0.4 });

    // ---- 8 TRANSITION: lace curtains close and part; then the tally boards count
    for (const pan of [-0.7, 0.7]) k.noise(T.curtains[0], { dur: 0.32, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.2, 1500], [0.32, 700]], q: 0.7, gain: 0.25, a: 0.12, pan });
    k.play('thud', T.curtains[1], { f: 110, gain: 0.3 });
    for (const pan of [-0.7, 0.7]) k.noise(T.curtains[2], { dur: 0.36, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.2, 1500], [0.36, 500]], q: 0.7, gain: 0.22, a: 0.12, pan });
    ticks(EMU.countBullets, T.bulletsCount[0] + 0.05, T.bulletsCount[1] - 0.02);
    gam(T.bulletsCount[1], 'D4', 0.8);
    hide(T.killsCount[0] - 0.25, 0.25, 0.35); tap(T.killsCount[0], 520, 0.55, 0, false);
    ticks(EMU.countKills, T.killsCount[0] + 0.05, T.killsCount[1] - 0.02, 0.1);
    gam(T.killsCount[1], 'F4', 0.8);
    k.play('stroke', T.divide[0], { material: 'brush', dur: T.divide[1] - T.divide[0], gain: 0.9, minor: true });

    // ---- 9 THE KEY NUMBER: "10" stamps down, the lamp flares, the gong
    gong(T.ten, 1.1);
    gam(T.ten + 0.02, 'D5', 0.6, 0.3);
    tap(T.ten + 0.5, 820, 0.55, 0);

    // ---- 10 NIGHT: lamp down and up; the soldier marches off left; the emus drum
    sigh(T.lampDown2[0]);
    for (let t = T.retreat[0] + 0.1, i = 0; t < T.retreat[1]; t += 0.35, i++) tap(t, 300, 0.42 * (1 - i / 7), -0.4 - i * 0.07);
    [28.1, 28.5].forEach((t) => k.tone(t, { f: [[0, 70], [0.4, 62]], dur: 0.5, gain: 0.12, a: 0.02, minor: true }));

    // ---- 11 TAKEAWAY: the final card drops; a resolving bronze phrase over a low tone
    hide(T.finalCard[0], 0.3, 0.6);
    tap(T.finalCard[1], 520, 0.8, 0, false);
    gam(T.finalCard[1] + 0.1, 'D4', 0.9, -0.2); gam(T.finalCard[1] + 0.24, 'A4', 0.85, 0); gam(T.finalCard[1] + 0.38, 'D5', 0.8, 0.2);
    k.tone(T.finalCard[1] + 0.1, { f: 'D3', dur: 2.4, gain: 0.12, a: 0.01, verb: 0.4 });
  }
  window.scoreSound = scoreSound;
})();
