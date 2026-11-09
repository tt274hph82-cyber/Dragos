"""Sound effects, music and the final mix for the voxel-wall short. Needs ELEVENLABS_API_KEY.
    python3 scripts/audio.py        (clips are cached in public/audio/)
Writes public/audio/mix.mp3: narration on top, effects and music under it, -14 LUFS."""
import json, os, subprocess, urllib.request, pathlib
key = os.environ['ELEVENLABS_API_KEY']
A = pathlib.Path('public/audio')
def api(path, body, timeout=300):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    return urllib.request.urlopen(req, timeout=timeout).read()
SFX = {  # name: (prompt, seconds)
    'creak': ('an old wooden closet door creaking open very slowly in a silent room, creepy', 3.0),
    'clock': ('a quiet bedside clock ticking in a silent room at night', 3.0),
    'sting': ('a sudden dark cinematic horror sting hit, short', 2.0),
    'heart': ('a slow loud heartbeat, tense, close', 3.0),
    'blanket': ('a blanket rustling quickly, fabric pulled over, close', 1.2),
    'birds': ('morning birds chirping outside a window, calm', 3.0),
    'dooropen': ('a closet door opened normally in the morning, light wooden creak', 1.2),
    'snore': ('a small old dog snoring softly and happily, cute', 3.0),
}
for n, (p, s) in SFX.items():
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/sound-generation?output_format=mp3_44100_128', {'text': p, 'duration_seconds': s, 'prompt_influence': 0.45, 'model_id': 'eleven_text_to_sound_v3'})); print('made', n)
MUSIC = [('m_dark', 'dark tense ambient horror drone, low strings, eerie music box notes, creepy night, no vocals', 16000),
         ('m_warm', 'gentle warm relieved music, soft piano and light strings, sweet and heartwarming morning, no vocals', 10000)]
for n, p, ms in MUSIC:
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/music?output_format=mp3_44100_128', {'prompt': p, 'music_length_ms': ms, 'model_id': 'music_v2_5'}, timeout=600)); print('made', n)
# (clip, start s, gain dB): hits land just after the word they illustrate
EV = [('clock', 0.0, -16), ('creak', 1.9, -8), ('creak', 4.2, -12), ('heart', 6.8, -12), ('sting', 7.45, -7),
      ('blanket', 11.0, -8), ('heart', 11.6, -15), ('birds', 13.8, -12), ('dooropen', 15.0, -8), ('snore', 16.6, -6), ('snore', 19.4, -9),
      ('m_dark', 0.0, -13), ('m_warm', 14.0, -11)]
TOTAL = 22.0
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(A / 'voice.mp3')]
fl = ['[0]apad,atrim=0:%s,volume=1.0[v]' % TOTAL]; mix = '[v]'
for i, (n, st, g) in enumerate(EV, 1):
    cmd += ['-i', str(A / f'{n}.mp3')]
    extra = ',afade=t=out:st=13.0:d=1.4' if n == 'm_dark' else (',afade=t=in:st=0:d=0.8,afade=t=out:st=7.0:d=1.0' if n == 'm_warm' else '')
    fl.append(f'[{i}]volume={g}dB{extra},adelay={int(st * 1000)}:all=1[a{i}]'); mix += f'[a{i}]'
fl.append(f'{mix}amix=inputs={len(EV) + 1}:normalize=0:duration=longest,atrim=0:{TOTAL},loudnorm=I=-14:TP=-1.5:LRA=11[o]')
subprocess.run(cmd + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '44100', '-b:a', '192k', str(A / 'mix.mp3')], check=True)
print('mix.mp3 written')
