# clipper

Turns long-form videos (links or files) into **12-second 9:16 clips**: it finds the strongest moments and gives each one a reframe, a hook title, word-by-word captions, a progress bar and a source credit.

## Install
Needs Python 3.9+ and ffmpeg.
```bash
pip install -r requirements.txt          # yt-dlp
pip install faster-whisper               # optional: transcribes videos that have no subtitles
```

## Use
```bash
python clipper.py "https://www.youtube.com/watch?v=..." --clips 3
python clipper.py link1 link2 link3 --clips 2 --layout crop
python clipper.py talk.mp4 --subs talk.srt --hook "Nobody tells you this" --voiceover my_take.m4a
```
Clips land in `clips/` with a `manifest.json` (source, timestamps, score, transcript of each clip).

| Option | What it does |
|---|---|
| `--clips N` | clips per source (default 3) |
| `--length S` | clip length (default 12) |
| `--layout fit\|crop` | `fit` = whole frame over a blurred fill (default); `crop` = full-screen 9:16 crop |
| `--focus 0..1` | crop position, left to right (default 0.5); use it to keep the speaker in frame |
| `--hook "…"` | your own title, repeat once per clip; default is the clip's first sentence |
| `--voiceover file` | your commentary, mixed over the clip with the original ducked |
| `--grade punch\|warm\|cool\|none` | color look |
| `--start 312` | force a clip at 312s (repeatable) instead of auto-picking |
| `--credit "…"` | credit line; default `Source: <uploader>` |
| `--no-captions`, `--no-hook` | turn those off |

## How it picks moments
Every sentence start after the intro is scored on speech density, loudness and its variation, a moderate number of scene cuts, hook words ("why", "secret", "mistake"…), and whether the 12s starts and ends on a sentence boundary. Silence is penalised. The best non-overlapping windows win.

## Rights
Clip videos you own, or have permission or a license to reuse. Captions, titles and credits make clips better, but they don't by themselves make reusing someone else's video legal, and platforms demote reposted content. Your own commentary (`--voiceover`, `--hook`) is what makes a clip transformative.
