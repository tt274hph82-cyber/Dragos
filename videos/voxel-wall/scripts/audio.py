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
    'scratch': ('claws scratching slowly inside a wooden wall, muffled, creepy, close', 3.0),
    'clock': ('a quiet bedside clock ticking in a silent room at night', 3.0),
    'knock': ('three soft knocks on a wooden wall with a knuckle', 1.5),
    'knockback': ('three loud hollow knocks from inside a wall, muffled thuds, scary', 1.5),
    'sting': ('a sudden dark cinematic horror sting hit, short', 2.0),
    'blanket': ('a blanket rustling quickly, fabric pulled over, close', 1.2),
    'birds': ('morning birds chirping outside a window, calm', 3.0),
    'saw': ('a hand saw cutting through a wooden wall, a few strokes', 2.0),
    'meow': ('tiny kittens meowing softly with one cat purring, cute', 3.0),
}
for n, (p, s) in SFX.items():
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/sound-generation?output_format=mp3_44100_128', {'text': p, 'duration_seconds': s, 'prompt_influence': 0.45, 'model_id': 'eleven_text_to_sound_v3'})); print('made', n)
MUSIC = [('m_dark', 'dark tense ambient horror drone, low strings and a slow heartbeat pulse, eerie night, no melody, no vocals', 16000),
         ('m_warm', 'gentle warm relieved music, soft piano and light strings, sweet and heartwarming morning, no vocals', 10000)]
for n, p, ms in MUSIC:
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/music?output_format=mp3_44100_128', {'prompt': p, 'music_length_ms': ms, 'model_id': 'music_v2_5'}, timeout=600)); print('made', n)
# (clip, start s, gain dB): hits land just after the word they illustrate
EV = [('scratch', 1.6, -10), ('clock', 4.4, -14), ('scratch', 5.2, -14), ('knock', 9.3, -6), ('knockback', 10.9, -3), ('sting', 10.95, -8),
      ('blanket', 12.2, -8), ('birds', 14.4, -12), ('saw', 16.2, -8), ('meow', 19.3, -5), ('meow', 21.3, -8),
      ('m_dark', 0.0, -13), ('m_warm', 14.6, -11)]
TOTAL = 23.0
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(A / 'voice.mp3')]
fl = ['[0]apad,atrim=0:%s,volume=1.0[v]' % TOTAL]; mix = '[v]'
for i, (n, st, g) in enumerate(EV, 1):
    cmd += ['-i', str(A / f'{n}.mp3')]
    extra = ',afade=t=out:st=13.6:d=1.4' if n == 'm_dark' else (',afade=t=in:st=0:d=0.8,afade=t=out:st=7.4:d=1.0' if n == 'm_warm' else '')
    fl.append(f'[{i}]volume={g}dB{extra},adelay={int(st * 1000)}:all=1[a{i}]'); mix += f'[a{i}]'
fl.append(f'{mix}amix=inputs={len(EV) + 1}:normalize=0:duration=longest,atrim=0:{TOTAL},loudnorm=I=-14:TP=-1.5:LRA=11[o]')
subprocess.run(cmd + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '44100', '-b:a', '192k', str(A / 'mix.mp3')], check=True)
print('mix.mp3 written')
