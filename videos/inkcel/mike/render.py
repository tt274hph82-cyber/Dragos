"""Render the 10-second-scene test (captions-only timing: ~1.1 s per caption chunk) to ../out/headless-rooster-test.mp4.
Frames in parallel; a 5-frame zoom-whip at every cut; captions burned on after the finish (dim for 3 frames, then full);
a synthesized effects track (no ElevenLabs key in this container): a whoosh on every whip, the axe, the thud, a bounce,
a sting on the shock, page flutter, a chime on the reveal, coin clinks."""
import sys, math, pathlib, subprocess, wave
import numpy as np
from multiprocessing import Pool
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent)); sys.path.insert(0, str(HERE))
from PIL import Image, ImageFilter
import shots as SH

FPS, CH = 30, 33           # 1.1 s per caption chunk
CHUNKS = [SH.chunks(c) for c in SH.CAPTIONS]
LENS = [len(c) * CH for c in CHUNKS]
STARTS = [sum(LENS[:i]) for i in range(len(LENS))]
TOTAL = sum(LENS)
OUT = HERE / 'frames'
OUT.mkdir(exist_ok=True)


def whip(img, k, inward):
    """zoom-whip: k 0..1 strength; zoom toward the centre with radial-ish blur"""
    if k <= 0:
        return img
    z = 1 + 0.35 * k if inward else 1 + 0.35 * k
    w, h = img.size
    im = img.resize((int(w * z), int(h * z)), Image.BILINEAR)
    im = im.crop(((im.width - w) // 2, (im.height - h) // 2, (im.width - w) // 2 + w, (im.height - h) // 2 + h))
    return im.filter(ImageFilter.GaussianBlur(10 * k))


def frame(f):
    i = max(j for j in range(len(STARTS)) if STARTS[j] <= f)
    lf = f - STARTS[i]
    n = LENS[i]
    img = SH.shot(i, lf / n, lf / FPS)
    # whips: the last 3 frames of a shot zoom in, the first 2 of the next zoom out of the blur
    if i < len(LENS) - 1 and lf >= n - 3:
        img = whip(img, (lf - (n - 4)) / 3, True)
    if i > 0 and lf < 2:
        img = whip(img, (2 - lf) / 2, False)
    k = lf // CH
    cl = lf - k * CH
    img = SH.caption(img, CHUNKS[i][min(k, len(CHUNKS[i]) - 1)], dim=cl < 3)
    img.save(OUT / f'{f:04d}.png')
    return f


# ---------------------------------------------------------------- synthesized sound effects (48 kHz)
SR = 48000


def env(n, a=0.01, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def noise_band(n, lo, hi, seed):
    x = np.random.RandomState(seed).randn(n)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(X, n)


def whoosh(dur=0.35, seed=1):
    n = int(dur * SR)
    x = noise_band(n, 300, 5000, seed)
    t = np.linspace(0, 1, n)
    return x * np.sin(np.pi * t) ** 2 / (np.abs(x).max() + 1e-9) * 0.8


def thud(dur=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (70 - 30 * t) * t) * env(n, 0.002, 0.12) + noise_band(n, 100, 2000, 3) * env(n, 0.001, 0.03) * 0.3)


def bounce(dur=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (500 - 700 * t) * t) * env(n, 0.003, 0.12) * 0.6


def sting(dur=0.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f0 * (1 + 0.25 * t) * t) for f0 in (392, 494, 587)) / 3 * env(n, 0.005, 0.35)


def chime(dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f0 * t) * env(n, 0.002, 0.5 / (j + 1)) for j, f0 in enumerate((1046, 1568, 2093))) / 2


def clink(seed):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    r = np.random.RandomState(seed)
    return sum(np.sin(2 * np.pi * f0 * t) for f0 in r.uniform(2500, 5200, 3)) / 3 * env(n, 0.001, 0.05)


def flutter(dur=0.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return noise_band(n, 800, 6000, 7) / 4 * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t)) * env(n, 0.05, 0.5)


def mix_track():
    tot = int(TOTAL / FPS * SR) + SR
    a = np.zeros(tot)
    s = lambda sh, sec: STARTS[sh] / FPS + sec

    def add(sec, x, g):
        i = int(sec * SR)
        a[i:i + len(x)] += x[: len(a) - i] * g
    for j in range(1, len(STARTS)):
        add(STARTS[j] / FPS - 0.12, whoosh(0.3, j), 0.5)          # a whoosh on every whip
    add(s(0, 0.85), whoosh(0.45, 11), 0.7)                        # the axe comes round
    add(s(0, 1.25), thud(), 0.9)                                  # the chop
    add(s(1, 0.30), bounce(), 0.7)                                # the head bounces
    add(s(2, 0.50), sting(), 0.5)                                 # Lloyd's shock
    add(s(5, 0.10), chime(), 0.45)                                # the sideshow reveal
    add(s(5, 0.40), flutter(), 0.5)                               # calendar pages
    for k in range(6):
        add(s(6, 0.2 + k * 0.28), clink(k), 0.45)                 # coins
    a /= np.abs(a).max() + 1e-9
    a *= 0.7
    with wave.open(str(HERE / 'sfx.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    todo = [f for f in range(TOTAL) if not (OUT / f'{f:04d}.png').exists()]
    with Pool(4) as p:
        for k, _ in enumerate(p.imap_unordered(frame, todo, chunksize=4)):
            if k % 40 == 0:
                print(k, '/', len(todo), flush=True)
    mix_track()
    out = HERE.parent / 'out'
    out.mkdir(exist_ok=True)
    mp4 = out / 'headless-rooster-test.mp4'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-i', str(OUT / '%04d.png'), '-i', str(HERE / 'sfx.wav'),
                    '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
                    '-af', 'loudnorm=I=-16:TP=-1.5', '-shortest', '-movflags', '+faststart', str(mp4)], check=True)
    print('done', mp4, TOTAL, 'frames')
