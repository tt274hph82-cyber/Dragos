"""Generate narration WAVs (Piper TTS) + manifest of durations for each segment.

Usage: python3 scripts/make_narration.py <piper-binary> <voice.onnx>
"""
import json, subprocess, sys, wave, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
piper, voice = sys.argv[1], sys.argv[2]
segments = json.loads((root / "src/segments.json").read_text())
outdir = root / "public/narration"
outdir.mkdir(parents=True, exist_ok=True)
manifest = {}
for s in segments:
    text = s.get("say") or s["text"]
    if not text:
        continue
    wav = outdir / f"{s['id']}.wav"
    subprocess.run([piper, "-m", voice, "--length_scale", "1.12", "--sentence_silence", "0.45",
                    "-f", str(wav)], input=text.encode(), check=True, capture_output=True)
    with wave.open(str(wav)) as w:
        manifest[s["id"]] = round(w.getnframes() / w.getframerate(), 3)
    print(s["id"], manifest[s["id"]])
(root / "src/narration.json").write_text(json.dumps(manifest, indent=1))
print("total narration seconds:", round(sum(manifest.values()), 1))
