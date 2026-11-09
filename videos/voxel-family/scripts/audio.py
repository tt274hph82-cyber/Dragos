"""Effects, music and the final mix for the voxel-family short. Needs ELEVENLABS_API_KEY.
    python3 scripts/audio.py   ->  public/audio/mix.mp3 (voice on top, -14 LUFS)"""
import json, os, subprocess, urllib.request, pathlib
key = os.environ['ELEVENLABS_API_KEY']
A = pathlib.Path('public/audio')
def api(path, body, timeout=300):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    return urllib.request.urlopen(req, timeout=timeout).read()
SFX = {
    'join': ('a bright retro video game player joined chime with sparkle', 1.2),
    'build': ('rapid wooden blocks being placed one after another, video game building, fast', 1.6),
    'stomp': ('a cartoon foot stomp with a stern huff, short', 0.8),
    'sword': ('a sword being drawn with a bright metallic shing', 1.0),
    'rimshot': ('a rimshot ba dum tss drum joke sting', 1.0),
    'groan': ('a family groaning at a bad joke, ugh, no words', 1.2),
    'cluck': ('a big flock of chickens clucking excitedly', 2.0),
    'night': ('a deep ominous gong with a dark whoosh, night falls', 2.0),
    'monsters': ('a crowd of cartoon monsters groaning and shuffling closer, not too scary', 2.5),
    'horn': ('a short heroic battle horn, video game', 1.4),
    'throw': ('a fast throw whoosh then a cartoon bonk hit', 1.0),
    'runaway': ('cartoon monsters yelping and running away, comedic', 1.6),
    'flap': ('a flock of chickens flapping and charging, wings and clucks, comedic', 1.6),
    'fanfare': ('a short triumphant video game victory fanfare with chimes', 2.0),
    'whoosh': ('a very short punchy swish pop for a hard cut, cartoon, crisp', 0.6),
    'pop': ('a cartoon speech bubble pop, short and bright', 0.6),
}
for n, (p, s) in SFX.items():
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/sound-generation?output_format=mp3_44100_128', {'text': p, 'duration_seconds': s, 'prompt_influence': 0.45, 'model_id': 'eleven_text_to_sound_v3'})); print('made', n)
MUSIC = [('m_day', 'happy bouncy 8-bit chiptune adventure music, playful family comedy, square wave melody and light drums, 145 bpm, no vocals', 24000),
         ('m_night', 'epic but funny 8-bit chiptune battle music, fast drums, heroic and silly, 160 bpm, no vocals', 13000),
         ('m_win', 'happy triumphant 8-bit chiptune victory music, bright and celebratory, no vocals', 7000)]
for n, p, ms in MUSIC:
    f = A / f'{n}.mp3'
    if not f.exists():
        f.write_bytes(api('/v1/music?output_format=mp3_44100_128', {'prompt': p, 'music_length_ms': ms, 'model_id': 'music_v2_5'}, timeout=600)); print('made', n)
CUTS = json.load(open('public/cuts.json'))
EV = [('join', 2.2, -8), ('join', 8.7, -8), ('join', 16.3, -8), ('build', 4.1, -9), ('stomp', 6.75, -8), ('sword', 11.5, -8), ('rimshot', 15.95, -7),
      ('groan', 16.0, -12), ('cluck', 18.9, -11), ('cluck', 21.9, -13), ('night', 22.4, -7), ('monsters', 24.3, -10), ('horn', 26.0, -10),
      ('throw', 28.5, -6), ('runaway', 31.7, -9), ('flap', 32.8, -8), ('fanfare', 34.1, -8), ('pop', 37.5, -10)]
EV += [('whoosh', c, -16) for c in CUTS]
MUS = [('m_day', 0.0, -17, 0.2, 21.6, 0.9), ('m_night', 22.4, -17, 0.4, 11.0, 0.8), ('m_win', 34.0, -15, 0.2, 5.4, 0.8)]
TOTAL = 40.0
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', str(A / 'voice.wav')]
fl = ['[0]apad,atrim=0:%s[v]' % TOTAL]; mix = '[v]'; n = 1
for name, st, g in EV:
    cmd += ['-i', str(A / f'{name}.mp3')]; fl.append(f'[{n}]volume={g}dB,adelay={int(st * 1000)}:all=1[a{n}]'); mix += f'[a{n}]'; n += 1
for name, st, g, fi, fo, fd in MUS:
    cmd += ['-i', str(A / f'{name}.mp3')]; fl.append(f'[{n}]volume={g}dB,afade=t=in:st=0:d={fi},afade=t=out:st={fo}:d={fd},adelay={int(st * 1000)}:all=1[a{n}]'); mix += f'[a{n}]'; n += 1
fl.append(f'{mix}amix=inputs={n}:normalize=0:duration=longest,atrim=0:{TOTAL},loudnorm=I=-14:TP=-1.5:LRA=11[o]')
subprocess.run(cmd + ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '44100', '-b:a', '192k', str(A / 'mix.mp3')], check=True)
print('mix.mp3 written')
