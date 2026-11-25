"""Sound for a kit video: a whoosh/swell/whip on every cut and camera move, story effects on their words,
an ElevenLabs score, then the mix (effects ~14 LU and music ~17 LU under the voice) mastered to -14 LUFS.
usage: python3 scripts/audio.py <video id> <cues.json>     (cues.json from scripts/cues.ts)
Effects: SFX v3 (eleven_text_to_sound_v3); music: Music v2.5 (music_v2_5). Clips are cached by model + prompt."""
import json, os, re, subprocess, sys, pathlib, hashlib, requests
vid, cj = sys.argv[1], sys.argv[2]; R = pathlib.Path(__file__).resolve().parents[1]; P = R / 'public' / vid; C = P / 'sfx'; C.mkdir(parents=True, exist_ok=True)
key = os.environ.get('ELEVENLABS_API_KEY') or [l.split('=', 1)[1].strip().strip('"') for l in open(R.parent / 'what-if-studio/.env') if l.startswith('ELEVENLABS_API_KEY=')][0]
SFX, MUS = 'eleven_text_to_sound_v3', 'music_v2_5'
D = json.load(open(cj)); END = D['end']; WORDS = D['words']; SH = D['shots']
STORY = json.load(open(R / 'src/videos' / vid / 'sound.json'))

def clip(prompt, secs, music=False):
    model = MUS if music else SFX; h = hashlib.sha1(f'{model}|{prompt}|{secs}'.encode()).hexdigest()[:12]; p = C / f'{h}.mp3'
    if not p.exists():
        if music: url, body = '/v1/music?output_format=mp3_44100_128', {'prompt': prompt, 'music_length_ms': int(secs * 1000), 'model_id': model}
        else: url, body = '/v1/sound-generation?output_format=mp3_44100_128', {'text': prompt, 'duration_seconds': max(0.5, secs), 'prompt_influence': 0.45, 'model_id': model}
        r = requests.post('https://api.elevenlabs.io' + url, headers={'xi-api-key': key}, json=body, timeout=600); r.raise_for_status(); p.write_bytes(r.content)
    return p

def word_t(shot, w, n=1):
    """start time of the n-th word starting with w inside the shot (after its start)"""
    t0 = SH[shot]; nxt = min([v for v in SH.values() if v > t0] + [END]); k = 0
    for x in WORDS:
        if t0 - 0.05 <= x[1] < nxt and re.sub(r"[^a-z']", '', x[0].lower()).startswith(w.lower()):
            k += 1
            if k == n: return x[1]
    raise SystemExit(f'word {w} not found in {shot}')

ev = []   # (t, prompt, secs, gain)
MOVE = {'cut': ('fast cinematic whoosh transition, short airy swish', 0.7, 0.9),
        'arc': ('smooth cinematic camera swell whoosh, soft rising air', 1.0, 0.6),
        'pullpush': ('deep cinematic swoosh pull back, soft low whoosh', 1.0, 0.7),
        'dolly': ('accelerating cinematic riser whoosh, building air rush', 1.4, 0.7),
        'pan': ('quick soft swish pan, light air movement', 0.6, 0.6),
        'whip': ('very fast whip pan swish, sharp air cut', 0.5, 0.9)}
for name, t in SH.items():
    if t > 0: ev.append((max(0, t - 0.15), *MOVE['cut']))
for k in D['keys']:
    pr, s, g = MOVE.get(k['move'], MOVE['arc']); ev.append((max(0, k['t'] - 0.1), pr, s, g))
for k in D['kicks']: ev.append((k['t'] + 0.05, 'deep cinematic boom hit, short punchy low impact', 0.8, 0.8))
for k in D['flashes']: ev.append((k['t'] + 0.05, 'bright magical sparkle ding, idea chime', 1.0, 0.8))
for s in STORY['sfx']: ev.append((word_t(s['shot'], s['word'], s.get('n', 1)) + s.get('off', 0.12), s['prompt'], s.get('secs', 1.0), s.get('gain', 1.0)))
ev.sort()
print(len(ev), 'effects')

# effects bus: every clip placed with adelay, then amix
ins, fl = [], []
for i, (t, pr, s, g) in enumerate(ev):
    ins += ['-i', str(clip(pr, s))]; fl.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={int(t * 1000)}|{int(t * 1000)}[e{i}]')
fx = P / 'fx.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', ';'.join(fl) + ';' + ''.join(f'[e{i}]' for i in range(len(ev))) + f'amix=inputs={len(ev)}:normalize=0,apad,atrim=0:{END}[o]', '-map', '[o]', '-ar', '48000', str(fx)], check=True)
mus = clip(STORY['music'], round(END + 1.5), music=True)

def lufs(p):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', str(p), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])
v = P / 'voice.wav'; lv, lf, lm = lufs(v), lufs(fx), lufs(mus)
gf, gm = (lv + STORY.get('sfx_lu', -14)) - lf, (lv + STORY.get('music_lu', -17)) - lm
print(f'voice {lv:.1f}  fx {lf:.1f} -> {gf:+.1f} dB  music {lm:.1f} -> {gm:+.1f} dB')
mix = P / 'mix.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(v), '-i', str(fx), '-i', str(mus), '-filter_complex',
  f'[1:a]volume={gf}dB[f];[2:a]aresample=48000,volume={gm}dB,afade=t=in:d=0.3,afade=t=out:st={END - 2.5}:d=2.5,atrim=0:{END}[m];'
  f'[0:a][f][m]amix=inputs=3:normalize=0,atrim=0:{END},loudnorm=I=-14:TP=-1.0:LRA=11[o]', '-map', '[o]', '-ar', '48000', '-ac', '2', str(mix)], check=True)
print('mix', mix, f'{lufs(mix):.1f} LUFS')
