// The sound score for the shadow-play Pig War. Cues are written on the storyboard clock (PIG.T) and mapped to
// real time with PIG.toReal, so each sound lands on the same frame as its picture. Same palette as the Emu War:
// struck bronze, wooden rod taps, hide rustle, the lamp's hum; one gong for the key number. Narration sits on top.
(function () {
  const T = PIG.T, D = PIG.D, R = PIG.toReal;
  function scoreSound(k) {
    const gam = (s, n, g = 1, pan = 0, minor = false) => {
      const t = R(s), f = k.hz(n);
      k.tone(t, { f, dur: 1.9, gain: 0.13 * g, a: 0.002, pan, verb: 0.3, minor });
      k.tone(t, { f: f * 1.007, dur: 1.6, gain: 0.07 * g, a: 0.002, pan, verb: 0.3, minor });
      k.tone(t, { f: f * 2.01, dur: 0.55, gain: 0.04 * g, a: 0.002, pan, minor });
      if (f * 2.95 < 2500) k.tone(t, { f: f * 2.95, dur: 0.22, gain: 0.018 * g, a: 0.002, pan, minor });
      k.noise(t, { dur: 0.02, filter: 'bandpass', f: Math.min(2200, f * 1.6), q: 2, gain: 0.08 * g, pan, minor });
    };
    const gong = (s, g = 1) => {
      const t = R(s);
      k.play('thud', t, { f: 90, gain: 0.7 * g });
      k.tone(t, { f: [[0, 98], [3.6, 95]], dur: 3.6, gain: 0.36 * g, a: 0.012, verb: 0.45 });
      k.tone(t, { f: [[0, 99.2], [3.2, 96]], dur: 3.2, gain: 0.16 * g, a: 0.02 });
      k.tone(t, { f: 202, dur: 2.2, gain: 0.1 * g, a: 0.01, verb: 0.4 });
      k.noise(t, { dur: 0.3, color: 'brown', filter: 'lowpass', f: 450, gain: 0.3 * g });
    };
    const tap = (s, f = 640, g = 0.55, pan = 0, minor = true) => { const t = R(s); k.play('tock', t, { f, gain: g, pan, minor }); k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1700, q: 2.5, gain: 0.32 * g, a: 0.001, pan, minor }); };
    const hide = (s, dur, g = 0.5, pan = 0) => k.play('paper', R(s), { dur, gain: g, pan, minor: true });
    const slide = (s, dur, g = 0.12) => k.noise(R(s), { dur, color: 'brown', filter: 'lowpass', f: [[0, 260], [dur * 0.5, 520], [dur, 240]], gain: g, a: dur * 0.4, minor: true });
    const sigh = (s) => k.noise(R(s), { dur: 0.8, color: 'brown', filter: 'lowpass', f: [[0, 600], [0.4, 140], [0.8, 600]], gain: 0.35, a: 0.05, hold: 0.5 });
    const march = (a, b, pan, g = 0.4) => { for (let s = a; s < b; s += 0.3) tap(s, 300 + ((s * 10) % 3) * 20, g, pan); };
    const grunt = (s, pan = 0.3) => { const t = R(s); k.tone(t, { f: [[0, 150], [0.12, 105]], dur: 0.16, gain: 0.1, a: 0.01, pan, minor: true }); k.noise(t, { dur: 0.12, filter: 'bandpass', f: 380, q: 3, gain: 0.12, a: 0.01, pan, minor: true }); };
    const swell = (s, dur, pan) => k.noise(R(s), { dur, color: 'brown', filter: 'bandpass', f: [[0, 250], [dur * 0.5, 600], [dur, 220]], q: 0.7, gain: 0.12, a: dur * 0.45, pan, minor: true });
    const ticks = (f, a, b) => { let last = -1, prev = f(a); for (let s = a; s < b; s += 0.002) { const v = f(s); if (v !== prev && R(s) - last >= 0.09) { tap(s, 1150, 0.36); last = R(s); } prev = v; } };

    // ---- beds: the lamp's hum and the room
    k.bed('hum', 0.2, D, { gain: 0.5 });
    k.bed('room', 0, D, { gain: 0.7 });
    k.noise(0.04, { dur: 0.45, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.12, 700], [0.45, 180]], gain: 0.4, a: 0.05 });
    [0.18, 0.31, 0.47].forEach((t, i) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1300 + i * 300, q: 1.5, gain: 0.12, minor: true }));

    // ---- 1 HOOK
    hide(0.25, 0.3, 0.7);
    tap(T.cardDrop[1], 520, 0.7, 0, false);
    gam(T.cardDrop[1] + 0.02, 'D4', 1.0);
    slide(T.cardHoist[0], 0.6, 0.14);

    // ---- 2 THE FLAGS
    [[T.flagUS, -0.5], [T.flagUK, 0.5]].forEach(([s, pan]) => { k.play('thud', R(s + 0.35), { f: 140, gain: 0.4, pan }); hide(s + 0.3, 0.35, 0.3, pan); });
    tap(T.claimPlaque + 0.3, 820, 0.5);

    // ---- 3 THE PIG: trots in, roots and grunts
    for (let s = T.pigIn[0]; s < T.pigIn[1]; s += 0.125) tap(s, 900 + ((s * 40) % 2) * 120, 0.22, 0.6);
    [6.0, 6.45, 6.9, 7.3].forEach((s, i) => grunt(s, 0.3 + i * 0.03));
    for (let s = 5.95; s < 7.5; s += 0.32) k.noise(R(s), { dur: 0.1, color: 'brown', filter: 'lowpass', f: 700, gain: 0.08, pan: 0.3, minor: true });
    tap(T.pigPlaque + 0.3, 860, 0.5, 0.2);
    tap(T.spudPlaque + 0.3, 760, 0.5, -0.1);
    hide(T.farmerIn[0], 0.4, 0.3, -0.5);

    // ---- 4 THE SHOT
    k.noise(R(T.shot), { dur: 0.09, filter: 'highpass', f: 900, gain: 0.55, a: 0.001, pan: -0.3 });
    k.play('thud', R(T.shot), { f: 160, gain: 0.6, pan: -0.3 });
    k.noise(R(T.shot) + 0.05, { dur: 0.6, color: 'pink', filter: 'lowpass', f: [[0, 1800], [0.6, 300]], gain: 0.12, a: 0.005, verb: 0.4 });
    grunt(T.pigFall[0] + 0.05, 0.3);
    k.play('thud', R(T.pigFall[1]), { f: 80, gain: 0.5, pan: 0.3 });

    // ---- 5 THE OFFICER, then the lamp down and up
    march(T.officerIn[0], T.officerIn[1], 0.5);
    tap(T.arrestTag + 0.25, 640, 0.6, 0.1, false);
    gam(T.arrestTag + 0.27, 'Eb4', 0.6, 0.1);
    sigh(T.lampDown1[0]);

    // ---- 6 THE SOLDIERS march in
    march(T.march[0], T.march[1] + 0.45, -0.4, 0.45);
    tap(T.soldiersBoard[1], 520, 0.6, -0.3, false);
    gam(T.soldiersBoard[1] + 0.02, 'A3', 0.8, -0.3);

    // ---- 7 THE WARSHIPS sail in on the waves
    [0, 0.7, 1.4, 2.1].forEach((d, i) => swell(T.shipsIn[0] + d, 1.3, i % 2 ? 0.4 : 0.1));
    [0.3, 0.9, 1.6].forEach((d) => k.tone(R(T.shipsIn[0] + d), { f: [[0, 210], [0.35, 180]], dur: 0.4, gain: 0.05, a: 0.05, pan: 0.5, minor: true }));   // timber creaks
    k.tone(R(T.shipsIn[0] + 0.4), { f: 'A2', dur: 1.6, gain: 0.08, a: 0.3, verb: 0.4 });
    tap(T.shipsBoard[1], 520, 0.6, 0.3, false);
    gam(T.shipsBoard[1] + 0.02, 'E4', 0.8, 0.3);

    // ---- 8 ESCALATION: boards hoisted, more troops, a cannon, a drum roll, a heavy hit on 2,000+
    slide(T.boardsUp[0], 0.5, 0.12);
    march(T.moreTroops[0], T.moreTroops[1], -0.5, 0.3);
    k.play('roller', R(T.moreTroops[0]), { dur: 0.7, gain: 0.4, pan: 0.2 });
    tap(T.hundredsPlaque + 0.3, 820, 0.5);
    for (let s = 18.6, i = 0; s < T.curtains[0]; s += 0.07, i++) tap(s, 520 + (i % 2) * 40, 0.12 + 0.2 * (s - 18.6) / (T.curtains[0] - 18.6), (i % 2 ? 0.2 : -0.2));
    tap(T.sailorsBoard[1], 480, 0.7, 0, false);
    gam(T.sailorsBoard[1] + 0.02, 'A2', 1.0); gam(T.sailorsBoard[1] + 0.02, 'Eb4', 0.5);

    // ---- 9 CURTAINS, the admiral: hand up, a calm note
    for (const pan of [-0.7, 0.7]) k.noise(R(T.curtains[0]), { dur: 0.32, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.2, 1500], [0.32, 700]], q: 0.7, gain: 0.25, a: 0.12, pan });
    k.play('thud', R(T.curtains[1]), { f: 110, gain: 0.3 });
    for (const pan of [-0.7, 0.7]) k.noise(R(T.curtains[2]), { dur: 0.36, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.2, 1500], [0.36, 500]], q: 0.7, gain: 0.22, a: 0.12, pan });
    march(T.admiralIn[0], T.admiralIn[1], -0.3, 0.35);
    tap(T.admiralPlaque + 0.3, 860, 0.5);
    k.noise(R(T.halt[0]), { dur: 0.25, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.25, 1200]], q: 0.8, gain: 0.15, a: 0.1 });
    hide(T.quoteCard[0], 0.3, 0.5);
    tap(T.quoteCard[1], 560, 0.7, 0, false);
    gam(T.quoteCard[1] + 0.03, 'D4', 0.8); gam(T.quoteCard[1] + 0.2, 'A4', 0.6);

    // ---- 10 TWELVE YEARS: lamp down and up, the year board counts
    sigh(T.lampDown2[0]);
    tap(T.years[0], 760, 0.5, 0, false);
    ticks(PIG.yearAt, T.years[0] + 0.05, T.years[1] + 0.05);
    gam(T.years[1] + 0.02, 'A4', 0.8);
    tap(T.yearsPlaque + 0.3, 820, 0.5);

    // ---- 11 THE KAISER: slides in, the ruling drops, the stamp
    slide(T.kaiserIn[0], 0.9, 0.18);
    tap(T.kaiserPlaque + 0.3, 860, 0.5);
    slide(T.yearBoardUp[0], 0.5, 0.1);
    hide(T.doc[0], 0.45, 0.6, 0.2);
    tap(T.doc[1], 560, 0.6, 0.2, false);
    k.play('thud', R(T.stamp), { f: 110, gain: 0.8, pan: 0.2 });
    k.noise(R(T.stamp), { dur: 0.08, filter: 'bandpass', f: 900, q: 1, gain: 0.3, pan: 0.2 });
    gam(T.stamp + 0.02, 'D3', 0.9, 0.2);
    tap(T.usaTag + 0.25, 640, 0.55, 0.3, false);
    gam(T.usaTag + 0.4, 'F#5', 0.6, 0.3);

    // ---- 12 NIGHT: lamp down and up; crickets; the 1 and the gong
    sigh(T.lampDown3[0]);
    for (let s = 32.8; s < D0end(); s += 0.55) { const t = R(s); [0, 0.05, 0.1].forEach((d) => k.noise(t + d, { dur: 0.018, filter: 'bandpass', f: 2200, q: 6, gain: 0.04, pan: 0.6, minor: true })); }
    tap(T.casPlaque + 0.3, 860, 0.5);
    gong(T.one, 1.1);
    gam(T.one + 0.02, 'D5', 0.5, 0.3);
    tap(T.onePlaque + 0.3, 820, 0.5);

    // ---- 13 TAKEAWAY
    slide(T.finalUp[0], 0.4, 0.1);
    hide(T.finalCard[0], 0.3, 0.6);
    tap(T.finalCard[1], 520, 0.8, 0, false);
    gam(T.finalCard[1] + 0.1, 'D4', 0.9, -0.2); gam(T.finalCard[1] + 0.24, 'A4', 0.85, 0); gam(T.finalCard[1] + 0.38, 'D5', 0.8, 0.2);
    k.tone(R(T.finalCard[1] + 0.1), { f: 'D3', dur: 2.4, gain: 0.12, a: 0.01, verb: 0.4 });
  }
  const D0end = () => 36.3;
  window.scoreSound = scoreSound;
})();
