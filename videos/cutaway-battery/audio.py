"""Sound effects (ElevenLabs SFX v3), score (Music v2.5) and the final mix: narration on top, effects and music under it,
-14 LUFS. Reads cues.json (node cues.js). Clips are cached in audio/: delete one to redo it. Writes audio/mix.wav."""
import json, os, pathlib, subprocess, urllib.request, re
ROOT = pathlib.Path(__file__).resolve().parent; A = ROOT / 'audio'
key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    for line in (ROOT.parent / 'what-if-studio/.env').read_text().splitlines():
        if line.startswith('ELEVENLABS_API_KEY='): key = line.split('=', 1)[1].strip().strip('"')
def api(path, body, timeout=600):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    return urllib.request.urlopen(req, timeout=timeout).read()
SFX = {  # name: (prompt, seconds, gain dB after peak-normalising)
    'plug': ('a USB cable plugged firmly into a phone, one soft click', 0.6, -8),
    'tick': ('a soft clean digital UI tick, short', 0.5, -12),
    'dive': ('a deep smooth cinematic whoosh diving inward, low, airy, with a soft sub hit at the end', 2.0, -9),
    'hum': ('a gentle electrical hum with tiny sparkling energy particles flowing, soft, high tech', 5.0, -16),
    'sizzle': ('electric sizzling and crackling, small sparks, tense', 3.0, -11),
    'zap': ('one sharp electric zap with a short crackle', 0.8, -8),
    'down': ('a machine powering down slowly, descending electronic tone, soft', 1.8, -11),
    'whoosh': ('a fast smooth airy whoosh pulling back, cinematic', 1.2, -10),
}
for n, (p, s, g) in SFX.items():
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/sound-generation?output_format=mp3_44100_128', {'text': p, 'duration_seconds': s, 'prompt_influence': 0.5, 'model_id': 'eleven_text_to_sound_v3'})); print('made', n)
C = json.loads((ROOT / 'cues.json').read_text()); TOTAL = C['total']
mus = A / 'music.mp3'
if not mus.exists():
    mus.write_bytes(api('/v1/music?output_format=mp3_44100_128', {'prompt': 'Minimal dark tech explainer underscore: a soft pulsing analog synth bass, sparse glassy plucks, light ticking percussion, calm and curious with gentle forward motion, a little tension in the middle, resolving at the end. Clean, modern, instrumental only, no vocals.', 'music_length_ms': int(TOTAL * 1000) + 1500, 'model_id': 'music_v2_5'})); print('made music')
def peak(f):
    out = subprocess.run(['ffmpeg', '-i', str(f), '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.search(r'max_volume: (-?[\d.]+)', out).group(1))
def lufs(f):
    out = subprocess.run(['ffmpeg', '-i', str(f), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])
voice = A / 'voice.wav'; vl = lufs(voice); pk = {n: peak(A / f'{n}.mp3') for n in SFX}
mg = (vl - 17) - lufs(mus)   # music 17 LU under the voice
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(voice), '-i', str(mus)]
fl = [f'[1]volume={mg:.1f}dB,afade=t=in:d=0.4,afade=t=out:st={TOTAL - 1.2}:d=1.2[m]']; mix = '[0][m]'
vpk = peak(voice)
for i, c in enumerate(C['cues'], 2):
    n = c['name']; cmd += ['-i', str(A / f'{n}.mp3')]
    g = vpk - pk[n] + SFX[n][2] + c.get('gain', 0)   # peak-match to the voice, then the clip's own level
    fl.append(f"[{i}]volume={g:.1f}dB,afade=t=out:st={SFX[n][1] - 0.25}:d=0.25,adelay={int(c['t'] * 1000)}:all=1[s{i}]"); mix += f'[s{i}]'
fl.append(f"{mix}amix=inputs={len(C['cues']) + 2}:normalize=0:duration=first,atrim=0:{TOTAL},loudnorm=I=-14:TP=-1.5:LRA=11[o]")
subprocess.run(cmd + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '48000', str(A / 'mix.wav')], check=True)
print('voice', vl, 'LUFS; music gain', round(mg, 1), 'dB; mix', lufs(A / 'mix.wav'), 'LUFS')
