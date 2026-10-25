#!/usr/bin/env python3
"""Synthesizes the 10s score: ambient pad, soft pulse, whooshes into each title, riser + impact."""
import numpy as np, wave, sys
SR, DUR = 48000, 10.0
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(7)
out = np.zeros((len(t), 2))

def onepole(x, a):  # simple lowpass; a in (0,1), higher = darker
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += (1 - a) * (v - acc); y[i] = acc
    return y

def env(t0, att, rel, length):
    e = np.zeros_like(t); m = (t >= t0) & (t < t0 + length)
    x = t[m] - t0
    e[m] = np.minimum(x / max(att, 1e-4), 1) * np.exp(-np.maximum(x - att, 0) / rel)
    return e

# pad: A minor add9, detuned pairs, slow tremolo, swells in/out
for f in [110.0, 164.81, 246.94, 261.63, 329.63]:
    for d, pan in [(-0.12, 0.3), (0.12, 0.7)]:
        s = np.sin(2 * np.pi * (f + d) * t) + 0.3 * np.sin(2 * np.pi * 2 * (f + d) * t)
        s *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.25 * t + f)
        out[:, 0] += s * (1 - pan); out[:, 1] += s * pan
pad_env = np.clip(t / 1.8, 0, 1) * np.clip((10 - t) / 1.2, 0, 1)
out *= (0.035 * pad_env)[:, None]

# soft pulse (sub kick) from 3.4s, 100 bpm, ducks pad slightly
for k in np.arange(3.4, 9.0, 0.6):
    e = env(k, 0.004, 0.12, 0.5)
    ph = 2 * np.pi * np.cumsum(55 + 70 * np.exp(-(t - k).clip(0) * 30)) / SR
    out += (0.32 * e * np.sin(ph))[:, None]

# whooshes into each title (filtered noise swell ending on the hit)
noise = rng.standard_normal(len(t))
for hit in [0.6, 3.4, 6.2]:
    m = np.clip(1 - np.abs(t - (hit - 0.25)) / 0.45, 0, 1) ** 2
    w = onepole(noise * m, 0.93) * 0.9
    out[:, 0] += w * np.clip(1 - (t - hit + 0.7) / 0.7, 0.2, 1)
    out[:, 1] += w * np.clip((t - hit + 0.7) / 0.7, 0.2, 1)

# riser 7.2-8.4 then impact at 8.4
r = np.clip((t - 7.2) / 1.2, 0, 1) * (t < 8.4)
rise = np.sin(2 * np.pi * np.cumsum(200 + 900 * r ** 2) / SR) * r ** 2 * 0.06
rise += onepole(noise * r ** 3, 0.85) * 0.5
out += rise[:, None]
e = env(8.4, 0.003, 0.9, 1.6)
boom = np.sin(2 * np.pi * np.cumsum(42 + 60 * np.exp(-(t - 8.4).clip(0) * 18)) / SR) * e * 0.55
boom += onepole(noise, 0.97) * env(8.4, 0.002, 0.25, 0.8) * 2.0
out += boom[:, None]

# chime on the final title
for f, dl in [(880, 0), (1318.5, 0.09), (1760, 0.18)]:
    out += (0.05 * env(8.45 + dl, 0.005, 0.7, 1.5) * np.sin(2 * np.pi * f * t))[:, None]

out *= np.clip((10 - t) / 0.15, 0, 1)[:, None]
out = np.tanh(out * 1.4) / np.tanh(1.4)
out *= 0.89 / np.abs(out).max()
pcm = (out * 32767).astype("<i2")
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "assets/score.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
