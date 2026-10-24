#!/usr/bin/env python3
"""10s score for the reflex-arc animation. Hits: tap 1.5, spinal relay 3.4, kick 5.6, resolve 6.4."""
import numpy as np, wave, sys
SR, DUR = 48000, 10.0
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(11)
noise = rng.standard_normal(len(t))
out = np.zeros((len(t), 2))

def onepole(x, a):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += (1 - a) * (v - acc); y[i] = acc
    return y

def env(t0, att, rel, length):
    e = np.zeros_like(t); m = (t >= t0) & (t < t0 + length); x = t[m] - t0
    e[m] = np.minimum(x / max(att, 1e-4), 1) * np.exp(-np.maximum(x - att, 0) / rel)
    return e

def add(sig, pan=0.5):
    out[:, 0] += sig * (1 - pan); out[:, 1] += sig * pan

# clinical ambient pad (D major add9), swells in, lifts at the resolve
for f in [146.83, 220.0, 293.66, 329.63, 440.0]:
    for d, pan in [(-0.15, 0.3), (0.15, 0.7)]:
        add(np.sin(2 * np.pi * (f + d) * t) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.2 * t + f)), pan)
out *= (0.03 * np.clip(t / 1.5, 0, 1) * (1 + 0.8 * np.clip((t - 6.2) / 1.0, 0, 1)) * np.clip((10 - t) / 1.0, 0, 1))[:, None]

# 1.5s reflex-hammer tap: rubber knock + low thump
add(np.sin(2 * np.pi * 900 * t) * env(1.5, 0.001, 0.02, 0.1) * 0.35, 0.4)
add(onepole(noise, 0.6) * env(1.5, 0.001, 0.015, 0.08) * 0.8, 0.4)
add(np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-(t - 1.5).clip(0) * 25)) / SR) * env(1.5, 0.002, 0.18, 0.6) * 0.5, 0.45)

# nerve signal: crackling electric zip whose pitch follows the pulse
def zip_(t0, t1, f0, f1, pan0, pan1, gain):
    m = (t >= t0) & (t < t1); p = np.clip((t - t0) / (t1 - t0), 0, 1)
    f = f0 * (f1 / f0) ** p
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.4
    crackle = (rng.random(len(t)) > 0.996) * rng.standard_normal(len(t)) * 3
    e = m * np.sin(np.pi * p) ** 0.5
    sig = onepole((tone + crackle) * e, 0.55) * gain
    out[:, 0] += sig * (1 - (pan0 + (pan1 - pan0) * p)); out[:, 1] += sig * (pan0 + (pan1 - pan0) * p)
zip_(1.6, 3.4, 220, 880, 0.35, 0.8, 0.22)   # sensory: up to the spine
zip_(3.6, 5.6, 700, 180, 0.8, 0.2, 0.22)    # motor: back down to the foot
zip_(3.6, 6.0, 500, 1400, 0.75, 0.75, 0.05) # faint copy up to the brain

# 3.4s spinal relay: bright zap
add((np.sin(2 * np.pi * 1760 * t) + 0.6 * np.sin(2 * np.pi * 2637 * t)) * env(3.4, 0.002, 0.25, 0.8) * 0.12, 0.75)
add(onepole(noise, 0.3) * env(3.4, 0.001, 0.04, 0.2) * 0.35, 0.75)

# 5.6s kick: whoosh + thump
add(onepole(noise * np.clip(1 - np.abs(t - 5.55) / 0.25, 0, 1) ** 2, 0.9) * 1.6, 0.3)
add(np.sin(2 * np.pi * np.cumsum(50 + 80 * np.exp(-(t - 5.6).clip(0) * 20)) / SR) * env(5.6, 0.002, 0.3, 0.9) * 0.6, 0.35)

# 6.4s resolve shimmer
for f, dl in [(587.33, 0), (880, 0.08), (1174.7, 0.16), (1760, 0.24)]:
    add(np.sin(2 * np.pi * f * t) * env(6.4 + dl, 0.01, 1.0, 3.0) * 0.045, 0.3 + dl * 2)

out *= np.clip((10 - t) / 0.2, 0, 1)[:, None]
out = np.tanh(out * 1.4) / np.tanh(1.4)
out *= 0.89 / np.abs(out).max()
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "assets/score.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype("<i2").tobytes())
