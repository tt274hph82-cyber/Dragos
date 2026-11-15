"""Sound effects (ElevenLabs SFX v3), score (Music v2.5) and the final mix: narration on top, effects and music under it,
-14 LUFS. Reads cues.json (node cues.js). Clips are cached in audio/: delete one to redo it. Writes audio/mix.wav."""
import json, os, pathlib, subprocess, urllib.request, re
ROOT = pathlib.Path(__file__).resolve().parent; A = ROOT / 'audio'
key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    for line in (ROOT.parents[1] / 'what-if-studio/.env').read_text().splitlines():
        if line.startswith('ELEVENLABS_API_KEY='): key = line.split('=', 1)[1].strip().strip('"')
def api(path, body, timeout=600):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    return urllib.request.urlopen(req, timeout=timeout).read()
SFX = {  # name: (prompt, seconds, gain dB after peak-normalising)
    'whoosh': ('a quick clean airy swoosh transition, modern social media, short', 0.7, -11),
    'pop': ('a bright soft UI pop, bubbly, short, clean', 0.5, -10),
    'rip': ('paper calendar pages torn off quickly one after another, fast flurry', 2.0, -13),
    'heart': ('a cute soft notification like sound with a tiny sparkle', 0.8, -12),
    'ding': ('a satisfying success chime ding, bright, short', 1.2, -9),
    'click': ('a soft mouse click on a button, one click', 0.5, -9),
    'unlock': ('a small padlock clicking open, crisp metallic', 0.6, -10),
}
for n, (p, s, g) in SFX.items():
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/sound-generation?output_format=mp3_44100_128', {'text': p, 'duration_seconds': s, 'prompt_influence': 0.5, 'model_id': 'eleven_text_to_sound_v3'})); print('made', n)
C = json.loads((ROOT / 'cues.json').read_text()); TOTAL = C['total']
mus = A / 'music.mp3'
if not mus.exists():
    mus.write_bytes(api('/v1/music?output_format=mp3_44100_128', {'prompt': 'Upbeat modern creator-tips background track for a social media reel: bouncy plucked synths, light claps, warm bass, positive and motivating, steady groove at about 115 BPM, clean and minimal, instrumental only, no vocals.', 'music_length_ms': int(TOTAL * 1000) + 1500, 'model_id': 'music_v2_5'})); print('made music')
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
