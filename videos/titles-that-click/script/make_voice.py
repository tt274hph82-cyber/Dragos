"""Generate the narration with Kokoro and write cue timings.

Usage: python3 -I script/make_voice.py  (run from the project root)
Writes assets/voice/voice.mp3 and script/timings.json.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.getcwd()
CACHE = os.path.expanduser("~/.cache/hyperframes/tts")
script = json.load(open(os.path.join(ROOT, "script/script.json")))

kokoro = Kokoro(f"{CACHE}/models/kokoro-v1.0.onnx", f"{CACHE}/voices/voices-v1.0.bin")
SR = 24000
LEAD_IN = 0.6  # silence before the first word

pieces = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
t = LEAD_IN
chapters = []
for ci, ch in enumerate(script["chapters"]):
    ch_start = t if ci == 0 else t
    beats = []
    for bi, (bid, text) in enumerate(ch["beats"]):
        samples, sr = kokoro.create(text, voice=script["voice"], speed=script["speed"], lang="en-us")
        assert sr == SR
        # trim leading/trailing near-silence so cues sit on the words
        mask = np.abs(samples) > 0.01
        if mask.any():
            first, last = np.argmax(mask), len(mask) - np.argmax(mask[::-1])
            samples = samples[max(0, first - 240): min(len(samples), last + 1200)]
        dur = len(samples) / SR
        beats.append({"id": bid, "text": text, "start": round(t, 3), "end": round(t + dur, 3)})
        pieces.append(samples.astype(np.float32))
        t += dur
        last_beat = bi == len(ch["beats"]) - 1
        gap = script["chapter_gap_s"] if last_beat else script["gap_s"]
        pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
        t += gap
        print(f"{bid:4s} {dur:5.2f}s  t={t:6.1f}", file=sys.stderr)
    chapters.append({"id": ch["id"], "title": ch["title"], "start": round(ch_start, 3), "beats": beats})

# Chapter n ends where chapter n+1 starts; the first chapter starts at 0.
chapters[0]["start"] = 0.0
for i, ch in enumerate(chapters):
    ch["end"] = round(chapters[i + 1]["start"], 3) if i + 1 < len(chapters) else round(t + 1.0, 3)
    ch["duration"] = round(ch["end"] - ch["start"], 3)
    for b in ch["beats"]:
        b["local"] = round(b["start"] - ch["start"], 3)
        b["localEnd"] = round(b["end"] - ch["start"], 3)

audio = np.concatenate(pieces + [np.zeros(int(1.0 * SR), dtype=np.float32)])
peak = np.max(np.abs(audio))
audio = audio * (0.89 / peak)  # about -1 dBFS peak
os.makedirs(os.path.join(ROOT, "assets/voice"), exist_ok=True)
wav = os.path.join(ROOT, "assets/voice/voice.wav")
sf.write(wav, audio, SR)
import subprocess
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "160k", os.path.join(ROOT, "assets/voice/voice.mp3")], check=True)
os.remove(wav)
total = len(audio) / SR
json.dump({"total": round(total, 3), "chapters": chapters}, open(os.path.join(ROOT, "script/timings.json"), "w"), indent=1)
words = sum(len(b["text"].split()) for c in chapters for b in c["beats"])
print(f"TOTAL {total:.1f}s  ({total/60:.2f} min), {words} words", file=sys.stderr)
