"""ElevenLabs narration, one mp3 per segment, then src/narration.json (seconds). Cached: re-runs only changed lines.
Key: ELEVENLABS_API_KEY from the environment or videos/what-if-studio/.env. python3 scripts/narration.py"""
import json, os, pathlib, subprocess, hashlib, urllib.request
ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE, MODEL = 'jvcMcno3QtjOzGtfpjoI', 'eleven_v4'  # David, British documentary
SET = {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.2, 'use_speaker_boost': True}
key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    for line in (ROOT.parent / 'what-if-studio/.env').read_text().splitlines():
        if line.startswith('ELEVENLABS_API_KEY='): key = line.split('=', 1)[1].strip().strip('"')
segs = json.loads((ROOT / 'src/segments.json').read_text())
cache_p = ROOT / 'public/narration/cache.json'
cache = json.loads(cache_p.read_text()) if cache_p.exists() else {}
dur = {}
for s in segs:
    text = s.get('say') or s['text']
    if not text: continue
    out = ROOT / f"public/narration/{s['id']}.mp3"
    sig = hashlib.sha1(json.dumps([text, VOICE, MODEL, SET]).encode()).hexdigest()[:12]
    if not (out.exists() and cache.get(s['id']) == sig):
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
            data=json.dumps({'text': text, 'model_id': MODEL, 'voice_settings': SET, 'language_code': 'en'}).encode(),
            headers={'xi-api-key': key, 'Content-Type': 'application/json'})
        out.write_bytes(urllib.request.urlopen(req, timeout=180).read())
        cache[s['id']] = sig; cache_p.write_text(json.dumps(cache, indent=1))
        print('voiced', s['id'])
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)]))
    dur[s['id']] = round(d, 3)
(ROOT / 'src/narration.json').write_text(json.dumps(dur, indent=1))
print(f'{len(dur)} lines, {sum(dur.values()):.1f} s of speech')
