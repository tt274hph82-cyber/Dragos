// The sound score for the shadow-play Dancing Plague. Cues read the picture's beat times (DANCE.T), which follow
// Austin's lines. Palette: struck bronze, wooden rod taps, hide rustle, the lamp's hum; a small tabor-and-pipe tune
// for the band; one gong for 400 and one for the ?. Kept well under the narration (voiceover mode).
(function () {
  const T = DANCE.T, D = DANCE.D;
  function scoreSound(k) {
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
      k.noise(t, { dur: 0.3, color: 'brown', filter: 'lowpass', f: 450, gain: 0.3 * g });
    };
    const tap = (t, f = 640, g = 0.55, pan = 0, minor = true) => { k.play('tock', t, { f, gain: g, pan, minor }); k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1700, q: 2.5, gain: 0.32 * g, a: 0.001, pan, minor }); };
    const hide = (t, dur, g = 0.5, pan = 0) => k.play('paper', t, { dur, gain: g, pan, minor: true });
    const slide = (t, dur, g = 0.12) => k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 260], [dur * 0.5, 520], [dur, 240]], gain: g, a: dur * 0.4, minor: true });
    const sigh = (t) => k.noise(t, { dur: 0.8, color: 'brown', filter: 'lowpass', f: [[0, 600], [0.4, 140], [0.8, 600]], gain: 0.35, a: 0.05, hold: 0.5 });
    const jingle = (t, g = 0.06, pan = 0) => { for (let i = 0; i < 4; i++) k.noise(t + i * 0.018, { dur: 0.05, filter: 'bandpass', f: 4200 + i * 500, q: 5, gain: g, pan, minor: true }); };
    // dancing feet: light wooden taps on the beat; `rate` taps a second; amplitude follows the dance
    const feet = (a, b, rate, g, pan, fade) => { for (let t = a, i = 0; t < b; t += 1 / rate, i++) { const amp = fade ? fade(t) : 1; if (amp > 0.05) tap(t, 820 + (i % 2) * 140, g * amp, pan + (i % 2 ? 0.1 : -0.1)); } };
    const danceAmt = (t) => H.smooth(T.danceStart - 0.3, T.danceStart + 0.4, t) * (1 - 0.92 * H.smooth(T.slow[0], T.slow[1], t));
    const ticks = (f, a, b) => { let last = -1, prev = f(a); for (let t = a; t < b; t += 0.002) { const v = f(t); if (v !== prev && t - last >= 0.09) { tap(t, 1150, 0.34); last = t; } prev = v; } };

    // ---- beds
    k.bed('hum', 0.2, D, { gain: 0.5 });
    k.bed('room', 0, D, { gain: 0.7 });
    k.noise(0.04, { dur: 0.45, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.12, 700], [0.45, 180]], gain: 0.4, a: 0.05 });
    [0.18, 0.31, 0.47].forEach((t, i) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1300 + i * 300, q: 1.5, gain: 0.12, minor: true }));

    // ---- 1 HOOK
    hide(0.25, 0.3, 0.7);
    tap(T.cardDrop[1], 520, 0.7, 0, false);
    gam(T.cardDrop[1] + 0.02, 'D4', 1.0);
    slide(T.cardHoist[0], 0.6, 0.14);

    // ---- 2 FRAU TROFFEA walks in, then dances
    for (let t = T.womanIn[0] + 0.1; t < T.womanIn[1]; t += 0.32) tap(t, 360, 0.35, -0.4);
    tap(T.namePlaque + 0.3, 860, 0.5);
    jingle(T.danceStart, 0.1);
    feet(T.danceStart, T.joinIn[0], 3, 0.32, 0, danceAmt);

    // ---- 3 DAYS: a soft chime at each dawn
    for (let d = 0; d < 6; d++) gam(T.days[0] + d * (T.days[1] - T.days[0]) / 6, d % 2 ? 'A4' : 'E4', 0.35, 0.4, true);
    tap(T.daysBoard[1], 520, 0.55, 0, false);

    // ---- 4 THIRTY JOIN: more feet, the board
    feet(T.joinIn[0], T.crowd[0], 5, 0.3, 0.2);
    tap(T.joinBoard[1], 520, 0.6, 0, false);
    gam(T.joinBoard[1] + 0.02, 'A3', 0.8);

    // ---- 5 FOUR HUNDRED: crowd rattle rising, count ticks, gong
    feet(T.crowd[0], T.curtains[0], 7, 0.26, -0.1);
    k.noise(T.crowd[0], { dur: T.countPop - T.crowd[0], color: 'pink', filter: 'bandpass', f: [[0, 400], [T.countPop - T.crowd[0], 1400]], q: 0.8, gain: 0.1, a: 2.5, minor: true });
    ticks(DANCE.countAt, T.count[0] + 0.05, T.count[1] - 0.02);
    gong(T.countPop + 0.05, 1.0);

    // ---- 6 CURTAINS, the doctors
    for (const pan of [-0.7, 0.7]) k.noise(T.curtains[0], { dur: 0.32, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.2, 1500], [0.32, 700]], q: 0.7, gain: 0.25, a: 0.12, pan });
    k.play('thud', T.curtains[1], { f: 110, gain: 0.3 });
    for (const pan of [-0.7, 0.7]) k.noise(T.curtains[2], { dur: 0.36, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.2, 1500], [0.36, 500]], q: 0.7, gain: 0.22, a: 0.12, pan });
    for (let t = T.doctorsIn[0]; t < T.doctorsIn[1]; t += 0.3) tap(t, 300, 0.35, 0);
    tap(T.curePlaque + 0.3, 860, 0.5);
    tap(T.cureTag + 0.25, 640, 0.6, 0, false);
    gam(T.cureTag + 0.3, 'E5', 0.6);

    // ---- 7 THE STAGE AND THE BAND: a tabor beat and a little pipe tune until it goes wrong
    k.play('thud', T.stageUp[1], { f: 120, gain: 0.4 });
    const tune = ['D5', 'E5', 'F#5', 'A5', 'F#5', 'E5', 'D5', 'A4'];
    for (let t = T.bandIn[1], i = 0; t < T.worse; t += 0.25, i++) {
      tap(t, i % 2 ? 300 : 220, 0.32, -0.5);
      if (i % 2 === 0) k.tone(t, { f: tune[(i / 2) % tune.length], dur: 0.22, gain: 0.035, a: 0.02, pan: 0.5, minor: true });
    }
    feet(T.bandIn[1], T.worse, 6, 0.22, 0.1);
    tap(T.bandPlaque + 0.3, 860, 0.5);

    // ---- 8 WORSE: clash, the music stops, two dancers fall
    gam(T.worse + 0.02, 'Eb4', 0.8); gam(T.worse + 0.02, 'E4', 0.7); gam(T.worse + 0.02, 'A2', 0.9);
    tap(T.worseTag + 0.25, 640, 0.6, 0, false);
    feet(T.worse + 0.3, T.lampDown[0], 3, 0.2, 0, (t) => 1 - H.smooth(T.worse, T.lampDown[0], t));
    k.play('thud', T.fall1[1], { f: 80, gain: 0.5, pan: -0.3 });
    k.play('thud', T.fall2[1], { f: 75, gain: 0.5, pan: 0.3 });

    // ---- 9 THE SHRINE: lamp sigh, slow steps, a distant bell
    sigh(T.lampDown[0]);
    for (let t = T.procession[0], i = 0; t < T.procession[1]; t += 0.55, i++) tap(t, 260, 0.18, -0.3 + (i % 2) * 0.1);
    [T.procession[0] + 0.6, T.procession[0] + 2.4].forEach((t) => { k.tone(t, { f: 'A4', dur: 2.2, gain: 0.05, a: 0.002, verb: 0.6, minor: true }); k.tone(t, { f: 1240, dur: 1.2, gain: 0.02, a: 0.002, verb: 0.6, minor: true }); });
    tap(T.shrinePlaque + 0.3, 860, 0.5);

    // ---- 10 SHE SLOWS AND STOPS
    feet(T.slow[0] - 0.4, T.slow[1], 3, 0.3, 0.3, (t) => danceAmt(t));

    // ---- 11 THE CAUSE: the ?
    tap(T.causePlaque + 0.3, 860, 0.5);
    gong(T.mark + 0.04, 1.0);
    gam(T.mark + 0.06, 'C#5', 0.45, 0.3);

    // ---- 12 TAKEAWAY
    slide(T.finalUp[0], 0.4, 0.1);
    hide(T.finalCard[0], 0.3, 0.6);
    tap(T.finalCard[1], 520, 0.8, 0, false);
    gam(T.finalCard[1] + 0.1, 'D4', 0.9, -0.2); gam(T.finalCard[1] + 0.24, 'A4', 0.85, 0); gam(T.finalCard[1] + 0.38, 'D5', 0.8, 0.2);
    k.tone(T.finalCard[1] + 0.1, { f: 'D3', dur: 2.4, gain: 0.12, a: 0.01, verb: 0.4 });
  }
  window.scoreSound = scoreSound;
})();
