"""A voice take with a cast: each script line can name its speaker, so a story can have a narrator and characters.

    python <skill>/scripts/cast_voice.py <slug>

episode.json:
  "voice": {...the narrator, as for voice.py...},
  "cast": {"mom": {"id": "<voice id>", "settings": {...}}},
  "script": [{"text": "...", "who": "mom"}, ...]      (no "who" = the narrator)
  "gap": 0.12                                          (seconds between lines)
  "tempo": 1.15                                        (speed every line up, pitch kept; match a reference pace)

Each line is generated on its own (eleven_v4, 128 kbps, cached by voice and text in public/<slug>/lines/), trimmed of
silence, joined with `gap` into public/<slug>/voice.wav, then every word is timed from the joined audio with
speech-to-text (align.py), as voice.py does. Writes src/episodes/<slug>/words.json; each word also gets "who".
"""
import hashlib, json, subprocess, sys, urllib.request, wave, array, pathlib

from wi import ep_dir, pub_dir, load_json, save_json
import align

slug = sys.argv[1]
ep = load_json(ep_dir(slug) / 'episode.json')
NARR = {'model': 'eleven_v4', 'language': 'en', 'settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True}}
NARR.update(ep.get('voice', {}))
CAST = {'narrator': NARR, **{k: {**NARR, **v} for k, v in ep.get('cast', {}).items()}}
GAP = ep.get('gap', 0.12)
TEMPO = ep.get('tempo', 1.0)   # speed every line up (pitch kept) after generation, e.g. 1.15
SR = 44100
lines_dir = pub_dir(slug) / 'lines'
lines_dir.mkdir(parents=True, exist_ok=True)
key = align.key()


def tts(text, v):
    h = hashlib.sha1(json.dumps([v['id'], v['model'], v.get('settings'), text]).encode()).hexdigest()[:12]
    mp3 = lines_dir / f'{h}.mp3'
    if not mp3.exists():
        body = {'text': text, 'model_id': v['model'], 'voice_settings': v.get('settings', {})}
        if v.get('language'):
            body['language_code'] = v['language']
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['id']}?output_format=mp3_44100_128",
                                     data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
        mp3.write_bytes(urllib.request.urlopen(req, timeout=180).read())
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(mp3), '-af',
                          'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse' + (f',atempo={TEMPO}' if TEMPO != 1 else ''),
                          '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return array.array('h', raw)


out, spans = array.array('h'), []
for i, b in enumerate(ep['script']):
    who = b.get('who', 'narrator')
    pcm = tts(b['text'].strip(), CAST[who])
    if i:
        out.extend([0] * int(GAP * SR))
    a = len(out) / SR
    out.extend(pcm)
    spans.append((a, len(out) / SR, who, b['text'].strip()))
    print(f'{i + 1:2d} {who:9s} {a:6.2f}-{len(out) / SR:6.2f}  {b["text"].strip()}')
wav = pub_dir(slug) / 'voice.wav'
with wave.open(str(wav), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())

# rough word times (spread through each line), then the real ones from speech-to-text
words = []
for a, b, who, text in spans:
    toks = text.split()
    for k, tok in enumerate(toks):
        core = tok.strip('.,!?;:"“”…')
        p = tok[len(tok.rstrip('.,!?;:"“”…')):]
        s = a + (b - a) * k / len(toks)
        words.append({'w': core or tok, 's': round(s, 3), 'e': round(s + (b - a) / len(toks) * 0.9, 3), 'p': p, 'who': who})
save_json(ep_dir(slug) / 'words.json', words)
subprocess.run([sys.executable, str(pathlib.Path(__file__).with_name('align.py')), slug], check=True)
fixed = load_json(ep_dir(slug) / 'words.json')
for w, o in zip(fixed, words):
    w['who'] = o['who']
save_json(ep_dir(slug) / 'words.json', fixed)
print(f'{len(out) / SR:.2f} s, {len(fixed)} words -> voice.wav, words.json')
