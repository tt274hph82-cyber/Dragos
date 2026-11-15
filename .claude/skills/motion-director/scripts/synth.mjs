#!/usr/bin/env node
// An original score and UI sounds, synthesised in code from the beat grid.
//
//   node synth.mjs --project <dir>
//
// Reads sound/beats.json (written by beatgrid.mjs) and writes:
//   sound/music.wav  sound/sfx.wav     stems, for checking
//   film/assets/score.wav              the mix the film plays, -14 LUFS, -1 dBTP
//   sound/sound.json                   what was placed, and the measured levels
//
// No samples, no downloads, no copyrighted music: every sound below is maths
// over a seeded random generator, so the same grid always gives the same file.
//
// Rules carried over from a long run of edits:
//   - a sound effect is a VISIBLE event, never a beat (beats steer motion too)
//   - one sound per role; variants inside a sequence read as unstable
//   - an effect's PEAK lands on its picture frame, not its first sample
//   - effects sit a few dB over the bed; the bed must carry mids, because a
//     bed that lives under 150 Hz plays as nothing on a phone speaker
import fs from "node:fs";
import { die, logEvent, project, readJSON, run, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const P = project(argv.includes("--project") ? argv[argv.indexOf("--project") + 1] : ".");
const G = readJSON(P.file("sound", "beats.json"));
const t0 = Date.now();

const SR = 48000;
const N = Math.ceil((G.length + 0.05) * SR);
const bus = () => [new Float32Array(N), new Float32Array(N)];
const drums = bus(), music = bus(), fx = bus(), send = new Float32Array(N);
let sfx = bus(); // the effect being drawn; each one gets its own layer and its own gain
const duck = new Float32Array(N); // the kick's envelope, used to pump the music bus

/* ------------------------------------------------------------- basics */

let seed = (G.seed ?? 7) >>> 0;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const I = (t) => Math.round(t * SR);
const put = (b, i, v, pan = 0, sendAmt = 0) => {
  if (i < 0 || i >= N) return;
  const l = Math.cos((pan + 1) * Math.PI / 4), r = Math.sin((pan + 1) * Math.PI / 4);
  b[0][i] += v * l * 1.4142;
  b[1][i] += v * r * 1.4142;
  if (sendAmt) send[i] += v * sendAmt;
};
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

class Biquad {
  constructor(type, f, q = 0.707) { this.type = type; this.q = q; this.z1 = this.z2 = 0; this.set(f); }
  set(f) {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * this.q);
    let b0, b1, b2;
    if (this.type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
    else if (this.type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
    else { b0 = a; b1 = 0; b2 = -a; } // band-pass, 0 dB peak
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * c) / a0; this.a2 = (1 - a) / a0;
  }
  run(x) { const y = this.b0 * x + this.z1; this.z1 = this.b1 * x - this.a1 * y + this.z2; this.z2 = this.b2 * x - this.a2 * y; return y; }
}
const blep = (p, dt) => (p < dt ? ((p /= dt), p + p - p * p - 1) : p > 1 - dt ? ((p = (p - 1) / dt), p * p + p + p + 1) : 0);

/* --------------------------------------------------------------- drums */

// the big hit owns its downbeat: a kick under it halves its impact
const HITS = (G.sfx || []).filter((x) => x.type === "hit").map((x) => x.t);
// ...and every small UI sound owns its instant: plucks and hats step aside,
// a kick there plays at half velocity
const OWN = (G.sfx || []).filter((x) => ["pop", "click", "tick", "type"].includes(x.type)).map((x) => x.t);
const owned = (t) => OWN.some((h) => Math.abs(h - t) < 0.07);
function kick(t, vel = 1) {
  if (HITS.some((h) => Math.abs(h - t) < 0.08)) return;
  if (owned(t)) vel *= 0.5;
  let ph = 0;
  const n = I(0.42), s = I(t);
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    const f = 46 + 120 * Math.exp(-x / 0.03);
    ph += f / SR;
    const v = Math.sin(2 * Math.PI * ph) * Math.exp(-x / 0.17) * vel + noise() * Math.exp(-x / 0.0025) * 0.35 * vel + Math.sin(2 * Math.PI * 2800 * x) * Math.exp(-x / 0.004) * 0.12 * vel;
    put(drums, s + k, v * 0.62);
    duck[s + k] = Math.max(duck[s + k] || 0, Math.exp(-x / 0.11) * vel);
  }
}
function clap(t, vel = 1) {
  const bp = new Biquad("bp", 1250, 0.9), n = I(0.32), s = I(t);
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    const burst = [0, 0.011, 0.023].reduce((a, o) => a + (x >= o ? Math.exp(-(x - o) / 0.006) : 0), 0);
    const env = 0.55 * burst + Math.exp(-x / 0.085) * 0.6;
    put(drums, s + k, bp.run(noise()) * env * vel * 1.5, (k % 2 ? 0.08 : -0.08), 0.22);
  }
}
function hat(t, vel = 1, open = false, pan = 0) {
  if (owned(t)) return;
  const hp = new Biquad("hp", 7600, 0.8), n = I(open ? 0.22 : 0.05), s = I(t);
  for (let k = 0; k < n; k++) put(drums, s + k, hp.run(noise()) * Math.exp(-(k / SR) / (open ? 0.07 : 0.014)) * vel * 0.7, pan);
}

/* --------------------------------------------------------------- tonal */

function bass(t, dur, f, vel = 1) {
  const lp = new Biquad("lp", 400, 1.1), n = I(dur), s = I(t);
  let p = 0;
  const dt = f / SR;
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    p += dt; if (p >= 1) p -= 1;
    lp.set(180 + 1100 * Math.exp(-x / 0.07));
    const saw = 2 * p - 1 - blep(p, dt);
    const env = Math.min(1, x / 0.004) * Math.min(1, (dur - x) / 0.03);
    put(music, s + k, (lp.run(saw) * 0.75 + Math.sin(2 * Math.PI * p) * 0.22) * env * vel * 0.55);
  }
}
function pad(t, dur, notes, vel, cutoff) {
  const n = I(dur + 0.6), s = I(t);
  notes.forEach((m, vi) => {
    [-7, 7].forEach((cents, side) => {
      const f = mtof(m) * 2 ** (cents / 1200), dt = f / SR, lp = new Biquad("lp", cutoff, 0.6);
      let p = rnd();
      for (let k = 0; k < n; k++) {
        const x = k / SR;
        p += dt; if (p >= 1) p -= 1;
        const env = Math.min(1, x / 0.35) * (x > dur ? Math.exp(-(x - dur) / 0.25) : 1);
        put(music, s + k, lp.run(2 * p - 1 - blep(p, dt)) * env * vel * 0.13, (side ? 0.55 : -0.55) * (0.4 + vi * 0.2), 0.3);
      }
    });
  });
}
// Karplus-Strong: a plucked string from a burst of noise
function pluck(t, f, vel = 1, pan = 0) {
  if (owned(t)) return;
  const L = Math.max(2, Math.round(SR / f)), buf = new Float32Array(L), n = I(0.6), s = I(t);
  for (let k = 0; k < L; k++) buf[k] = noise();
  let j = 0;
  for (let k = 0; k < n; k++) {
    const nx = (j + 1) % L, v = buf[j];
    buf[j] = 0.5 * (buf[j] + buf[nx]) * 0.994;
    j = nx;
    put(music, s + k, v * vel * 0.45 * Math.min(1, k / 40), pan, 0.28);
  }
}
function riser(t1, len) {
  const bp = new Biquad("bp", 300, 2.2), a = t1 - len, n = I(len), s = I(a);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const x = k / n;
    bp.set(300 * 20 ** x);
    ph += (180 * 6 ** x) / SR;
    const v = (bp.run(noise()) * 1.6 + Math.sin(2 * Math.PI * ph) * 0.12) * x * x;
    put(fx, s + k, v * 0.5, Math.sin(x * 6) * 0.3, 0.4);
  }
}
function impact(t, vel = 1, len = 1.2) {
  const hp = new Biquad("hp", 3000, 0.7), n = I(len), s = I(t);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const x = k / SR;
    ph += (36 + 34 * Math.exp(-x / 0.12)) / SR;
    const sub = Math.sin(2 * Math.PI * ph) * Math.exp(-x / 0.3) * 0.7;
    const air = hp.run(noise()) * Math.exp(-x / 0.35) * 0.45;
    put(fx, s + k, (sub * 0.85 + air) * vel, 0, 0.5);
  }
  for (let k = 0; k < I(0.3); k++) duck[s + k] = Math.max(duck[s + k], Math.exp(-(k / SR) / 0.3));
}

/* --------------------------------------------------- UI sounds (sfx) */
// Each returns where its peak sits, so the PEAK can be put on the frame.

// a small effect must not share its instant with a pluck or a hat: pull the
// music bus down briefly around it (the same duck the kick drives)
const duckFor = (s, len) => { for (let k = 0; k < I(len); k++) if (s + k >= 0 && s + k < N) duck[s + k] = Math.max(duck[s + k], 0.85 * Math.exp(-(k / SR) / (len / 2))); };

const SFX = {
  click(s) {
    duckFor(s, 0.1);
    const bp = new Biquad("bp", 3400, 1.4);
    for (let k = 0; k < I(0.05); k++) {
      const x = k / SR;
      put(sfx, s + k, bp.run(noise()) * Math.exp(-x / 0.0025) * 1.2 + Math.sin(2 * Math.PI * 1900 * x) * Math.exp(-x / 0.01) * 0.35, 0.05);
    }
    return 0.001;
  },
  tick(s) {
    const bp = new Biquad("bp", 2600, 1.6);
    for (let k = 0; k < I(0.03); k++) {
      const x = k / SR;
      put(sfx, s + k, bp.run(noise()) * Math.exp(-x / 0.0018) * 0.7 + Math.sin(2 * Math.PI * 2200 * x) * Math.exp(-x / 0.005) * 0.12);
    }
    return 0.0008;
  },
  pop(s) {
    duckFor(s, 0.12);
    let ph = 0;
    for (let k = 0; k < I(0.16); k++) {
      const x = k / SR;
      ph += (480 + 420 * Math.min(1, x / 0.045)) / SR;
      const env = Math.min(1, x / 0.003) * Math.exp(-x / 0.06);
      put(sfx, s + k, (Math.sin(2 * Math.PI * ph) + 0.25 * Math.sin(4 * Math.PI * ph)) * env * 0.55, 0, 0.12);
    }
    return 0.004;
  },
  whoosh(s) {
    const bp = new Biquad("bp", 350, 1.1), len = 0.5, n = I(len), pk = 0.68;
    for (let k = 0; k < n; k++) {
      const x = k / n;
      bp.set(350 * 9 ** x);
      const env = x < pk ? (x / pk) ** 2 : Math.exp(-(x - pk) / 0.08);
      put(sfx, s + k, bp.run(noise()) * env * 1.6, -0.7 + 1.4 * x, 0.15);
    }
    return pk * len;
  },
  hit(s) {
    const hp = new Biquad("hp", 4200, 0.7);
    let ph = 0;
    const parts = [1318.5, 1975.5, 2637.0];
    for (let k = 0; k < I(2.0); k++) {
      const x = k / SR;
      ph += (38 + 40 * Math.exp(-x / 0.06)) / SR;
      const sub = Math.sin(2 * Math.PI * ph) * Math.exp(-x / 0.6) * 0.9;
      const crash = hp.run(noise()) * Math.exp(-x / 0.5) * 0.35 + noise() * Math.exp(-x / 0.004) * 0.9 + Math.sin(2 * Math.PI * 180 * x) * Math.exp(-x / 0.05) * 0.5;
      const shine = parts.reduce((a, f, i) => a + Math.sin(2 * Math.PI * f * x + i) * Math.exp(-x / (1.1 - i * 0.2)), 0) * 0.06 * Math.min(1, x / 0.01);
      put(sfx, s + k, sub + crash + shine, 0, 0.55);
    }
    for (let k = 0; k < I(0.5); k++) if (s + k < N) duck[s + k] = Math.max(duck[s + k], Math.exp(-(k / SR) / 0.4));
    return 0.006;
  },
  shimmer(s) {
    const parts = [1567.98, 2349.3, 3135.96, 4698.6];
    for (let k = 0; k < I(1.3); k++) {
      const x = k / SR;
      const v = parts.reduce((a, f, i) => a + Math.sin(2 * Math.PI * f * x + i * 1.3) * Math.exp(-x / (0.7 - i * 0.1)), 0);
      put(sfx, s + k, v * 0.22 * Math.min(1, x / 0.03), Math.sin(x * 9) * 0.4, 0.4);
    }
    return 0.03;
  },
  riser(s) { return 0; }, // placed below, it ends ON its time rather than starting there
  type(s) { return SFX.tick(s); },
};

/* ---------------------------------------------------------- arrangement */

const VIBES = {
  driving: { mode: "minor", tonic: 57, prog: [[0, "m"], [8, "M"], [3, "M"], [10, "M"]], four: true, arp: 16 },
  dark: { mode: "minor", tonic: 52, prog: [[0, "m"], [0, "m"], [8, "M"], [7, "m"]], four: false, arp: 8 },
  warm: { mode: "major", tonic: 60, prog: [[0, "M"], [7, "M"], [9, "m"], [5, "M"]], four: false, arp: 8 },
  playful: { mode: "major", tonic: 62, prog: [[0, "M"], [9, "m"], [5, "M"], [7, "M"]], four: true, arp: 8, bounce: true },
  cinematic: { mode: "minor", tonic: 50, prog: [[0, "m"], [8, "M"], [10, "M"], [7, "m"]], four: false, arp: 16, slow: true },
  minimal: { mode: "minor", tonic: 55, prog: [[0, "m"], [0, "m"], [8, "M"], [10, "M"]], four: false, arp: 8 },
};
const V = VIBES[G.vibe] || VIBES.driving;
const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
let tonic = V.tonic;
if (G.key) {
  const m = String(G.key).match(/^([A-G][#b]?)/);
  if (m) tonic = 48 + NOTE[m[1]] + (NOTE[m[1]] < 4 ? 12 : 0);
}
const chord = (bar) => {
  const [deg, q] = V.prog[Math.floor(bar / (V.slow ? 2 : 1)) % V.prog.length];
  const r = tonic + deg;
  return { root: r, notes: [r, r + (q === "m" ? 3 : 4), r + 7, r + 12] };
};
const spb = G.spb, bpb = G.beatsPerBar;
const sectionAt = (t) => G.sections.find((s) => t >= s.a - 1e-6 && t < s.b - 1e-6) || G.sections[G.sections.length - 1];

for (let bar = 0; bar < G.bars; bar++) {
  const t = bar * bpb * spb;
  const sec = sectionAt(t);
  const e = sec.energy;
  const c = chord(bar);
  const lastBarOfSec = Math.abs(t + bpb * spb - sec.b) < 1e-3;
  const final = bar === G.bars - 1;
  pad(t, bpb * spb + (final ? G.tail : 0), c.notes.map((m) => m + 12), 0.45 + 0.35 * e, 500 + 2600 * e);
  for (let b = 0; b < bpb; b++) {
    const tb = t + b * spb;
    if (e >= 0.45 && !(sec.riser && lastBarOfSec && b === bpb - 1)) {
      if ((V.four && e >= 0.7) || b === 0 || (b === 2 && e >= 0.55)) kick(tb, b === 0 ? 1 : 0.92);
      if (V.bounce && e >= 0.7 && b === 2) kick(tb + spb * 0.5, 0.7);
    }
    if (e >= 0.7 && (b === 1 || b === 3)) clap(tb, 0.9);
    if (e >= 0.3) {
      const div = e >= 0.75 ? 4 : 2;
      for (let h = 0; h < div; h++) hat(tb + (h * spb) / div, (h % 2 ? 0.5 : 0.85) * (0.4 + 0.5 * e), e >= 0.75 && h === 2 && b % 2 === 1, h % 2 ? 0.25 : -0.15);
    }
    if (e >= 0.4) {
      const f = mtof(c.root - 12);
      if (V.mode === "minor" || V.four) bass(tb + spb / 2, spb / 2 * 0.9, f, 0.9);
      if (b === 0 || e >= 0.7) bass(tb, spb / 2 * 0.85, f, 0.8);
    }
    if (e >= 0.55) {
      const div = V.arp === 16 ? 4 : 2;
      for (let a = 0; a < div; a++) {
        const step = b * div + a;
        const m = c.notes[[0, 2, 1, 3, 2, 1, 3, 2][step % 8]] + 24;
        pluck(tb + (a * spb) / div, mtof(m), (a === 0 ? 0.9 : 0.6) * (0.5 + 0.5 * e), ((step % 4) - 1.5) * 0.25);
      }
    }
  }
  // a build: riser into the section's end, and a roll that tightens
  if (sec.riser && lastBarOfSec) {
    riser(sec.b, bpb * spb);
    for (let k = 0; k < 8; k++) clap(t + (k * spb) / 2, 0.25 + k * 0.07);
    for (let k = 0; k < 8; k++) clap(t + bpb * spb / 2 + (k * spb) / 4, 0.4 + k * 0.06);
  }
  if (final) kick(t + bpb * spb, 1); // the downbeat the last chord rings on
}
for (const s of G.sections) if (s.drop) impact(s.a, 1);

/* ------------------------------------------------------- place the sfx */

const placed = [];
const FRAME = 1 / 30;
for (const x of G.sfx) {
  if (x.type === "riser") { riser(x.t, 1.6); placed.push({ ...x, peak: x.t }); continue; }
  // render once into a scratch slot to learn the peak offset, then for real
  const peak = SFX[x.type](I(x.t + FRAME * 0.5) - I(0)) ; // provisional placement
  placed.push({ ...x, peakOffset: peak });
}
// SFX[type] draws at the sample index it is given, so the peak now sits
// peakOffset after (picture time + half a frame). Shift those whose peak is
// late: re-render the sfx bus with the start moved earlier by the peak offset.
const layers = [];
for (const x of placed) if (x.type !== "riser") { sfx = bus(); SFX[x.type](I(x.t + FRAME * 0.5 - x.peakOffset)); layers.push({ x, b: sfx }); }

/* ------------------------------------------------------------ the mix */

// reverb on the send (Freeverb-style), stereo out
function reverb(input) {
  const sc = SR / 44100, out = bus();
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], aps = [556, 441, 341, 225];
  for (const [ch, spread] of [[0, 0], [1, 23]]) {
    const cs = combs.map((d) => ({ b: new Float32Array(Math.round((d + spread) * sc)), i: 0, f: 0 }));
    const as = aps.map((d) => ({ b: new Float32Array(Math.round((d + spread) * sc)), i: 0 }));
    for (let k = 0; k < N; k++) {
      const x = input[k] * 0.015;
      let y = 0;
      for (const c of cs) {
        const o = c.b[c.i];
        c.f = o * 0.8 + c.f * 0.2;
        c.b[c.i] = x + c.f * 0.84;
        c.i = (c.i + 1) % c.b.length;
        y += o;
      }
      for (const a of as) {
        const o = a.b[a.i];
        a.b[a.i] = y + o * 0.5;
        a.i = (a.i + 1) % a.b.length;
        y = o - y;
      }
      out[ch][k] = y;
    }
  }
  return out;
}
const wet = reverb(send);

// the breath before the big hit: the whole bed dips over the last 0.3 s, so
// the hit lands into space instead of on top of a full mix
const breath = new Float32Array(N);
for (const h of HITS) for (let k = I(h - 0.3); k < I(h); k++) if (k >= 0 && k < N) breath[k] = (k - I(h - 0.3)) / I(0.3);
const musicL = new Float32Array(N), musicR = new Float32Array(N);
for (let k = 0; k < N; k++) {
  const g = 1 - 0.55 * Math.min(1, duck[k] || 0);
  const b = 1 - 0.85 * breath[k];
  musicL[k] = (drums[0][k] * 0.9 + music[0][k] * g * 0.8 + fx[0][k] * 0.8 + wet[0][k] * 0.6) * b;
  musicR[k] = (drums[1][k] * 0.9 + music[1][k] * g * 0.8 + fx[1][k] * 0.8 + wet[1][k] * 0.6) * b;
}
// a short fade so the file never ends on a click
const fadeN = I(0.25);
for (let k = 0; k < fadeN; k++) { const g = k / fadeN; musicL[N - 1 - k] *= g; musicR[N - 1 - k] *= g; }

// effects over the bed: EACH effect is gained against the bed around it, so
// it peaks ~5 dB over the local RMS whether the bed there is sparse or busy
const rms = (a, b, from, to) => { let s = 0, n = 0; for (let k = Math.max(0, from); k < Math.min(N, to); k++) { s += a[k] * a[k] + b[k] * b[k]; n += 2; } return Math.sqrt(s / Math.max(1, n)); };
const peakOf = (a, b, from, to) => { let p = 0; for (let k = Math.max(0, from); k < Math.min(N, to); k++) p = Math.max(p, Math.abs(a[k]), Math.abs(b[k])); return p; };
const db = (x) => 20 * Math.log10(Math.max(x, 1e-9));
const sL = new Float32Array(N), sR = new Float32Array(N);
for (const { x, b } of layers) {
  const i = I(x.t);
  const over = db(peakOf(b[0], b[1], i - I(0.05), i + I(0.3))) - db(rms(musicL, musicR, i - I(0.25), i + I(0.25)) * 1.4142);
  // the one big hit is a sustained boom that must clear a full drop: it gets
  // its own, higher target; every other effect sits ~5 dB over its bed
  x.gainDb = +Math.max(-12, Math.min(14, (x.type === "hit" ? 11 : 5) - over)).toFixed(1);
  const g = 10 ** (x.gainDb / 20);
  for (let k = 0; k < N; k++) { sL[k] += b[0][k] * g; sR[k] += b[1][k] * g; }
}
for (let k = 0; k < fadeN; k++) { const g = k / fadeN; sL[N - 1 - k] *= g; sR[N - 1 - k] *= g; }

const wav = (file, L, R) => {
  const data = Buffer.alloc(N * 8);
  for (let k = 0; k < N; k++) { data.writeFloatLE(L[k], k * 8); data.writeFloatLE(R[k], k * 8 + 4); }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
};
const mixL = new Float32Array(N), mixR = new Float32Array(N);
for (let k = 0; k < N; k++) { mixL[k] = Math.tanh((musicL[k] + sL[k]) * 0.9) / 0.9; mixR[k] = Math.tanh((musicR[k] + sR[k]) * 0.9) / 0.9; }

fs.mkdirSync(P.file("sound"), { recursive: true });
wav(P.file("sound", "music.wav"), musicL, musicR);
wav(P.file("sound", "sfx.wav"), sL, sR);
wav(P.file("sound", "mix_raw.wav"), mixL, mixR);

// loudness: two-pass loudnorm to -14 LUFS integrated, -1 dBTP
const raw = P.file("sound", "mix_raw.wav");
const p1 = run("ffmpeg", ["-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-3:LRA=11:print_format=json", "-f", "null", "-"]);
const m = (p1.err.match(/\{[\s\S]*?\}/g) || []).pop();
if (!m) die("loudnorm measurement failed");
const L1 = JSON.parse(m);
const outFile = fs.existsSync(P.file("film", "assets")) ? P.file("film", "assets", "score.wav") : P.file("sound", "score.wav");
const p2 = run("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af",
  `loudnorm=I=-14:TP=-3:LRA=11:measured_I=${L1.input_i}:measured_TP=${L1.input_tp}:measured_LRA=${L1.input_lra}:measured_thresh=${L1.input_thresh}:offset=${L1.target_offset}:linear=true`,
  "-ar", "48000", "-c:a", "pcm_s24le", outFile]);
if (p2.code) die(`loudnorm write failed: ${p2.err}`);
const p3 = run("ffmpeg", ["-hide_banner", "-i", outFile, "-af", "ebur128=peak=true", "-f", "null", "-"]);
const lufs = parseFloat((p3.err.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop()?.match(/-?[\d.]+/)[0]);
const tp = parseFloat((p3.err.match(/Peak:\s+(-?[\d.]+) dBFS/g) || []).pop()?.match(/-?[\d.]+/)[0]);
// share of energy under 150 Hz: a bed that is all sub plays as nothing on a phone
const low = run("ffmpeg", ["-hide_banner", "-i", P.file("sound", "music.wav"), "-af", "lowpass=f=150,volumedetect", "-f", "null", "-"]);
const all = run("ffmpeg", ["-hide_banner", "-i", P.file("sound", "music.wav"), "-af", "volumedetect", "-f", "null", "-"]);
const mv = (s) => parseFloat((s.match(/mean_volume:\s+(-?[\d.]+)/) || [])[1]);
const lowShare = 10 ** ((mv(low.err) - mv(all.err)) / 10);
if (fs.existsSync(outFile) && outFile.includes("film")) fs.copyFileSync(outFile, P.file("sound", "score.wav"));

const report = {
  file: outFile, seconds: G.length, vibe: G.vibe, bpm: G.bpm, key: G.key || null,
  lufs, truePeak: tp, lowShareUnder150Hz: +lowShare.toFixed(2),
  sfxOverBedDb: 5,
  sfx: placed.map((x) => ({ type: x.type, event: x.event, t: +x.t.toFixed(3), peakAt: +(x.t + FRAME * 0.5).toFixed(3), gainDb: x.gainDb })),
};
writeJSON(P.file("sound", "sound.json"), report);
const secs = +((Date.now() - t0) / 1000).toFixed(1);
logEvent(P.dir, { phase: "synth", secs, note: `${G.vibe} ${G.bpm}bpm, ${placed.length} sfx, ${lufs} LUFS` });
console.log(`score: ${outFile}
  ${G.length.toFixed(2)}s, ${G.vibe} at ${G.bpm} BPM, ${placed.length} sound effect(s)
  ${lufs} LUFS integrated, true peak ${tp} dBFS, ${Math.round(lowShare * 100)}% of the bed's energy under 150 Hz${lowShare > 0.6 ? "  !! too bass-heavy for a phone speaker" : ""}
  effects peak ~${report.sfxOverBedDb} dB over the bed (target 3-6)
  built in ${secs}s`);
