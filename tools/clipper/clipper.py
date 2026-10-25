#!/usr/bin/env python3
"""
clipper — turn long-form videos into 12s vertical (9:16) clips.

For each source (URL or local file) it:
  1. downloads it (yt-dlp) along with its subtitles when available,
  2. gets a transcript: --subs file > downloaded subtitles > faster-whisper (if installed) > none,
  3. scores every window of --length seconds (speech density, loudness, scene cuts, clean sentence edges),
  4. picks the best non-overlapping windows,
  5. renders each one as 1080x1920 with: reframing, a hook title, word-by-word captions,
     a progress bar, a source credit, and an optional commentary voice-over.

Usage:
  python clipper.py "https://youtu.be/..." [more links/files] --clips 3
  python clipper.py talk.mp4 --subs talk.srt --hook "Nobody tells you this" --layout crop
"""
import argparse, json, math, os, re, shutil, subprocess, sys, textwrap
from pathlib import Path

W, H = 1080, 1920

# ---------- helpers ----------
def run(cmd, **kw):
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kw)

def ffprobe(path):
    out = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)]).stdout
    d = json.loads(out)
    v = next(s for s in d["streams"] if s["codec_type"] == "video")
    has_audio = any(s["codec_type"] == "audio" for s in d["streams"])
    return float(d["format"]["duration"]), int(v["width"]), int(v["height"]), has_audio

def log(*a):
    print("[clipper]", *a, file=sys.stderr, flush=True)

# ---------- 1. fetch ----------
def fetch(src, workdir, sub_lang):
    if Path(src).exists():
        return Path(src), None, {"title": Path(src).stem, "uploader": None, "url": None}
    try:
        import yt_dlp
    except ImportError:
        sys.exit("yt-dlp is needed for links: pip install yt-dlp")
    opts = {
        "outtmpl": str(workdir / "%(id)s.%(ext)s"),
        "format": "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/bv*[height<=1080]+ba/b",
        "merge_output_format": "mp4",
        "writesubtitles": True, "writeautomaticsub": True,
        "subtitleslangs": [sub_lang, f"{sub_lang}.*"], "subtitlesformat": "vtt",
        "quiet": True, "no_warnings": True, "noplaylist": True,
    }
    with yt_dlp.YoutubeDL(opts) as y:
        info = y.extract_info(src, download=True)
    vid = Path(y.prepare_filename(info)).with_suffix(".mp4")
    subs = sorted(workdir.glob(f"{info['id']}*.vtt"))
    meta = {"title": info.get("title"), "uploader": info.get("uploader") or info.get("channel"), "url": info.get("webpage_url")}
    return vid, (subs[0] if subs else None), meta

# ---------- 2. transcript -> list of words {w, s, e} ----------
TS = re.compile(r"(?:(\d+):)?(\d+):(\d+)[.,](\d+)")
def _ts(s):
    h, m, sec, ms = TS.match(s.strip()).groups()
    return int(h or 0) * 3600 + int(m) * 60 + int(sec) + int(ms.ljust(3, "0")[:3]) / 1000

def parse_subs(path):
    """SRT or VTT -> words. Uses YouTube's inline <00:00:01.234> word timings when present,
    otherwise spreads a cue's words evenly over the cue. Dedupes YouTube's rolling captions."""
    text = Path(path).read_text(encoding="utf-8", errors="ignore")
    words, last_end = [], -1.0
    for block in re.split(r"\n\s*\n", text):
        m = re.search(r"([\d:.,]+)\s*-->\s*([\d:.,]+)", block)
        if not m:
            continue
        s, e = _ts(m.group(1)), _ts(m.group(2))
        body = "\n".join(l for l in block.split("\n")[block.split("\n").index(next(l for l in block.split("\n") if "-->" in l)) + 1:])
        if "<" in body and re.search(r"<\d", body):          # word-timed VTT line
            line = [l for l in body.split("\n") if re.search(r"<\d", l)][-1]
            parts = re.split(r"<(\d[\d:.]+)>", line)
            t = s
            for i in range(0, len(parts), 2):
                for w in re.sub(r"<[^>]+>", "", parts[i]).split():
                    nt = _ts(parts[i + 1]) if i + 1 < len(parts) else e
                    if t >= last_end - 0.01:
                        words.append({"w": w, "s": t, "e": max(nt, t + 0.05)})
                if i + 1 < len(parts):
                    t = _ts(parts[i + 1])
            last_end = max(last_end, e if words and words[-1]["e"] <= e else last_end)
            continue
        clean = re.sub(r"<[^>]+>|\{[^}]+\}", "", body).split()
        if not clean or e <= last_end:                          # skip repeated rolling cues
            continue
        s = max(s, last_end)
        step = (e - s) / len(clean)
        for i, w in enumerate(clean):
            words.append({"w": w, "s": s + i * step, "e": s + (i + 1) * step})
        last_end = e
    return words

def whisper_words(video, model_size):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None
    log(f"transcribing with faster-whisper ({model_size}) …")
    model = WhisperModel(model_size, compute_type="int8")
    segs, _ = model.transcribe(str(video), word_timestamps=True, vad_filter=True)
    return [{"w": w.word.strip(), "s": w.start, "e": w.end} for seg in segs for w in (seg.words or []) if w.word.strip()]

# ---------- 3. signals ----------
def loudness(video, dur, has_audio, hop=0.5):
    n = int(dur / hop) + 1
    if not has_audio:
        return [0.0] * n
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(video), "-vn", "-af",
                        f"asetnsamples=n={int(16000*hop)}:p=0,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level",
                        "-ar", "16000", "-f", "null", "-"], text=True, capture_output=True)
    vals = [float(x) if x not in ("-inf", "inf") else -90.0 for x in re.findall(r"RMS_level=(\S+)", p.stderr)]
    vals = (vals + [-90.0] * n)[:n]
    return [max(0.0, (v + 60) / 60) for v in vals]      # -60..0 dB -> 0..1

def scene_cuts(video, thresh=0.3):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(video), "-an", "-vf",
                        f"scale=320:-2,select='gt(scene,{thresh})',showinfo", "-f", "null", "-"], text=True, capture_output=True)
    return [float(x) for x in re.findall(r"pts_time:([\d.]+)", p.stderr)]

# ---------- 4. choose windows ----------
HOOK_WORDS = set("why how what secret mistake never always nobody everyone truth actually biggest worst best stop".split())
def choose(dur, words, loud, cuts, length, n, hop=0.5, skip_intro=0.0):
    cands = []
    sent_ends = [w["e"] for w in words if re.search(r"[.!?]$", w["w"])]
    if words:   # only start where a sentence starts, slightly early so the first syllable isn't clipped
        starts = [max(0.0, w["s"] - 0.15) for i, w in enumerate(words)
                  if i == 0 or re.search(r"[.!?]$", words[i - 1]["w"]) or w["s"] - words[i - 1]["e"] > 1.0]
    else:
        starts = [skip_intro + i for i in range(int(max(0, dur - length - skip_intro)) + 1)]
    for t in starts:
        if t < skip_intro or t + length > dur:
            continue
        s, e = t, t + length
        ws = [w for w in words if w["s"] >= s and w["e"] <= e]
        lv = loud[int(s / hop):int(e / hop)] or [0]
        mean = sum(lv) / len(lv)
        var = sum((x - mean) ** 2 for x in lv) / len(lv)
        nc = sum(1 for c in cuts if s < c < e)
        score = 0.0
        score += min(len(ws) / length, 3.5) / 3.5 * (2.0 if words else 0)          # talking density
        score += mean * 1.5 + min(var * 8, 0.6)                                     # energy + dynamics
        score += 0.4 if 1 <= nc <= 5 else (-0.3 if nc > 8 else 0)                  # some visual change, not chaos
        score += 0.3 * sum(1 for w in ws[:12] if w["w"].lower().strip(",.?!") in HOOK_WORDS)
        if words:
            if any(abs(se - s) < 0.6 for se in sent_ends) or not [w for w in words if w["s"] < s <= w["e"]]:
                score += 0.4                                                        # starts on a sentence boundary
            if any(abs(se - e) < 0.8 for se in sent_ends):
                score += 0.4                                                        # ends on one
        silence = sum(1 for x in lv if x < 0.15) / len(lv)
        score -= silence * 1.5
        cands.append((score, s))
    cands.sort(reverse=True)
    picked = []
    for sc, s in cands:
        if all(abs(s - p) >= length + 2 for _, p in picked):
            picked.append((sc, s))
        if len(picked) == n:
            break
    return sorted(picked, key=lambda x: x[1])

# ---------- 5. render ----------
def ass_time(t):
    t = max(0, t); return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"

def esc_ass(s):
    return s.replace("\\", "").replace("{", "(").replace("}", ")")

def build_ass(path, words, start, length, hook, credit, font, accent):
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{font},88,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,7,3,2,80,80,520,1
Style: Hook,{font},78,&H00FFFFFF,&H00FFFFFF,&H00000000,&HB4000000,-1,0,0,0,100,100,0,0,3,26,0,8,90,90,210,1
Style: Credit,{font},34,&H00DDDDDD,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,2,1,2,60,60,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    if hook:
        wrapped = r"\N".join(textwrap.wrap(esc_ass(hook.upper()), 20))
        ev.append(f"Dialogue: 2,{ass_time(0.15)},{ass_time(length)},Hook,,0,0,0,,{{\\fad(250,0)\\t(0,250,\\fscx100\\fscy100)\\fscx85\\fscy85}}{wrapped}")
    if credit:
        ev.append(f"Dialogue: 1,{ass_time(0)},{ass_time(length)},Credit,,0,0,0,,{esc_ass(credit)}")
    # captions: groups of up to 3 words, current word highlighted + popped
    ws = [dict(w, s=w["s"] - start, e=w["e"] - start) for w in words if w["e"] > start and w["s"] < start + length]
    groups, cur = [], []
    for w in ws:
        cur.append(w)
        if len(cur) == 3 or re.search(r"[.!?,]$", w["w"]):
            groups.append(cur); cur = []
    if cur:
        groups.append(cur)
    for gi, g in enumerate(groups):
        g_end = groups[gi + 1][0]["s"] if gi + 1 < len(groups) else min(length, g[-1]["e"] + 0.4)
        for i, w in enumerate(g):
            ws_ = max(0, w["s"]); we = g[i + 1]["s"] if i + 1 < len(g) else g_end
            if we <= ws_:
                continue
            txt = " ".join((f"{{\\c{accent}\\fscx112\\fscy112}}{esc_ass(x['w'].upper())}{{\\r}}" if j == i else esc_ass(x["w"].upper())) for j, x in enumerate(g))
            ev.append(f"Dialogue: 0,{ass_time(ws_)},{ass_time(min(we, length))},Cap,,0,0,0,,{txt}")
    Path(path).write_text(hdr + "\n".join(ev) + "\n", encoding="utf-8")

def render(video, has_audio, start, length, out, ass, layout, focus, grade, vo, srcw, srch):
    fade = 0.25
    if layout == "crop":
        # center-crop to 9:16 (focus = horizontal position 0..1)
        cw = min(srcw, int(srch * 9 / 16)) // 2 * 2
        graph = f"[0:v]crop={cw}:{srch}:{int((srcw - cw) * focus)}:0,scale={W}:{H},setsar=1[base]"
    else:
        # "fit": full frame centered over a blurred, darkened copy of itself
        graph = (f"[0:v]split[a][b];"
                 f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30:3,eq=brightness=-0.18:saturation=1.2[bg];"
                 f"[b]scale={W}:-2[fg];[bg][fg]overlay=0:(H-h)/2-80[base]")
    looks = {"none": "null", "punch": "eq=contrast=1.08:saturation=1.18,unsharp=5:5:0.6",
             "warm": "eq=contrast=1.05:saturation=1.1,colorbalance=rs=0.05:bs=-0.05", "cool": "eq=contrast=1.06,colorbalance=bs=0.06:rs=-0.04"}
    ass_esc = str(ass).replace("\\", "/").replace(":", r"\:").replace("'", r"\'")
    graph += (f";[base]{looks[grade]},"
              f"drawbox=x=0:y=ih-14:w=iw:h=14:color=black@0.45:t=fill,"
              f"drawbox=x=0:y=ih-14:w='iw*t/{length}':h=14:color=0xFFC832@0.95:t=fill,"
              f"ass='{ass_esc}',fade=t=in:st=0:d={fade},fade=t=out:st={length - fade}:d={fade},format=yuv420p[v]")
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{start:.3f}", "-t", f"{length}", "-i", str(video)]
    if vo:
        cmd += ["-i", str(vo)]
    cmd += ["-filter_complex", graph]
    if has_audio and vo:
        cmd[cmd.index("-filter_complex") + 1] += (f";[0:a]volume=0.35,afade=t=in:d={fade},afade=t=out:st={length - fade}:d={fade}[a0];"
                                                 f"[1:a]apad,atrim=0:{length}[a1];[a0][a1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[a]")
        amap = ["-map", "[a]"]
    elif has_audio:
        cmd[cmd.index("-filter_complex") + 1] += f";[0:a]afade=t=in:d={fade},afade=t=out:st={length - fade}:d={fade},loudnorm=I=-14:TP=-1.5[a]"
        amap = ["-map", "[a]"]
    elif vo:
        amap = ["-map", "1:a"]
    else:
        amap = []
    cmd += ["-map", "[v]", *amap, "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{length}", str(out)]
    run(cmd)

# ---------- main ----------
def main():
    ap = argparse.ArgumentParser(description="Clip long-form videos into 12s vertical shorts.")
    ap.add_argument("sources", nargs="+", help="video URLs or local files")
    ap.add_argument("--clips", type=int, default=3, help="clips per source (default 3)")
    ap.add_argument("--length", type=float, default=12.0, help="clip length in seconds (default 12)")
    ap.add_argument("--out", default="clips", help="output folder")
    ap.add_argument("--layout", choices=["fit", "crop"], default="fit", help="fit = full frame over blurred fill; crop = 9:16 center crop")
    ap.add_argument("--focus", type=float, default=0.5, help="crop layout: horizontal focus 0 (left) .. 1 (right)")
    ap.add_argument("--hook", action="append", help="hook title (repeat once per clip; default: from the transcript)")
    ap.add_argument("--no-hook", action="store_true", help="no hook title")
    ap.add_argument("--subs", help="SRT/VTT transcript for a local file")
    ap.add_argument("--sub-lang", default="en")
    ap.add_argument("--whisper", default="small", help="faster-whisper model if no subtitles (tiny/base/small/medium)")
    ap.add_argument("--no-captions", action="store_true")
    ap.add_argument("--credit", help='credit line, e.g. "Source: @channel" (default: from the video uploader)')
    ap.add_argument("--grade", choices=["none", "punch", "warm", "cool"], default="punch")
    ap.add_argument("--voiceover", help="audio file of your commentary, mixed over the clip")
    ap.add_argument("--skip-intro", type=float, default=15.0, help="ignore the first N seconds (default 15)")
    ap.add_argument("--start", type=float, action="append", help="force a clip start time (seconds); repeatable")
    ap.add_argument("--font", default="Inter Display ExtraBold")
    ap.add_argument("--accent", default="&H0032C8FF", help="ASS colour (&HBBGGRR) for the active caption word")
    a = ap.parse_args()

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required")
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    work = out / ".cache"; work.mkdir(exist_ok=True)
    manifest = []
    hooks = list(a.hook or [])
    for si, src in enumerate(a.sources, 1):
        log(f"source {si}: {src}")
        video, subs, meta = fetch(src, work, a.sub_lang)
        dur, sw, sh, has_audio = ffprobe(video)
        words = []
        if not a.no_captions or not a.start:
            if a.subs and len(a.sources) == 1:
                words = parse_subs(a.subs)
            elif subs:
                words = parse_subs(subs)
            else:
                words = whisper_words(video, a.whisper) or []
        log(f"  {dur:.0f}s, {sw}x{sh}, {len(words)} transcript words")
        if a.start:
            picks = [(None, s) for s in a.start if s + a.length <= dur]
        else:
            loud = loudness(video, dur, has_audio)
            cuts = scene_cuts(video)
            picks = choose(dur, words, loud, cuts, a.length, a.clips, skip_intro=min(a.skip_intro, max(0, dur - a.length)))
        credit = a.credit if a.credit is not None else (f"Source: {meta['uploader']}" if meta.get("uploader") else None)
        for ci, (score, start) in enumerate(picks, 1):
            inside = [w for w in words if w["s"] <= start < w["e"]]   # forced --start: back up to the word's start
            if inside and score is None:
                start = inside[0]["s"]
            span = [w for w in words if w["s"] >= start - 0.01 and w["e"] <= start + a.length]
            if a.no_hook:
                hook = None
            elif hooks:
                hook = hooks.pop(0)
            else:
                first = re.split(r"(?<=[.!?])\s", " ".join(w["w"] for w in span))[0]
                hook = " ".join(first.split()[:7]) + ("…" if len(first.split()) > 7 else "") if first else None
            name = f"{si:02d}_{ci:02d}_{int(start)//60:02d}m{int(start)%60:02d}s"
            ass = work / f"{name}.ass"
            build_ass(ass, [] if a.no_captions else words, start, a.length, hook, credit, a.font, a.accent)
            dst = out / f"{name}.mp4"
            log(f"  clip {ci}: {start:.1f}s → {dst.name}" + (f" (score {score:.2f})" if score is not None else ""))
            render(video, has_audio, start, a.length, dst, ass, a.layout, a.focus, a.grade, a.voiceover, sw, sh)
            manifest.append({"file": str(dst), "source": meta.get("url") or str(src), "title": meta.get("title"),
                             "start": round(start, 2), "end": round(start + a.length, 2), "score": score and round(score, 3),
                             "hook": hook, "text": " ".join(w["w"] for w in span)})
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    log(f"done: {len(manifest)} clips in {out}/ (see manifest.json)")

if __name__ == "__main__":
    main()
