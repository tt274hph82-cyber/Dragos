"""Flicker finder: per frame, mean |2*f - prev - next| (temporal 2nd derivative) on a small grey copy.
Smooth motion scores low; z-fighting / shadow crawl / popping scores high. usage: flicker.py video.mp4 [cuts.json]"""
import sys, subprocess, numpy as np
w, h = 135, 240
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d2 = np.abs(2 * F[1:-1] - F[:-2] - F[2:]).mean(axis=(1, 2)); d1 = np.abs(F[1:] - F[:-1]).mean(axis=(1, 2))
# a cut is one big d1 jump; flicker is d2 high while d1 on both sides is similar (back-and-forth)
fl = d2 - np.abs(d1[1:] - d1[:-1])
idx = np.argsort(-fl)[:25] + 1
print('median d2', round(float(np.median(d2)), 2), ' frames', len(F))
for i in sorted(idx): print(i, round(float(fl[i - 1]), 2), round(float(d1[i - 1]), 2), round(float(d1[i]), 2))
