"""Cast narration for the voxel-family short: one ElevenLabs take per line (eleven_v4, 128 kbps), joined with a small gap,
sped up a little (pitch kept), then every word re-timed with speech-to-text. Needs ELEVENLABS_API_KEY.
    python3 scripts/voice.py   ->  public/audio/voice.wav, public/words.json (each word has "who")"""
import json, os, subprocess, urllib.request, hashlib, pathlib, array, wave
key = os.environ['ELEVENLABS_API_KEY']
A = pathlib.Path('public/audio'); L = A / 'lines'; L.mkdir(parents=True, exist_ok=True)
V = {'narrator': 'Bj9UqZbhQsanLzgalpEG', 'kid': 'TxGEqnHWrfWFTfGW9XjX', 'mom': '21m00Tcm4TlvDq8ikWAM', 'dad': 'pNInz6obpgDQGcFmaJgB', 'sis': 'MF3mGyEYCl7XYWbV9V6O'}
SET = {'narrator': (0.35, 0.6, 1.1), 'kid': (0.35, 0.6, 1.1), 'mom': (0.35, 0.65, 1.1), 'dad': (0.35, 0.6, 1.05), 'sis': (0.3, 0.7, 1.1)}
SCRIPT = [
    ('narrator', "What if your whole family joined your game?"),
    ('narrator', "Player two. Mom. She builds a house in four seconds."),
    ('mom', "Shoes off! This is a clean server!"),
    ('narrator', "Player three. Dad. He finds one sword and won't stop telling jokes."),
    ('dad', "What's a block's favorite drink? Square-ade!"),
    ('narrator', "Player four. Your little sister. She tames every chicken in the world."),
    ('sis', "They're all named Gerald!"),
    ('narrator', "Then night falls. Monsters surround the house."),
    ('kid', "Everybody! Battle stations!"),
    ('narrator', "Mom throws her slipper. Dad tells a joke so bad, the monsters run away. And the chickens finish the rest."),
    ('narrator', "Family wins."),
    ('kid', "Okay. That was actually awesome."),
    ('narrator', "Comment family if yours would win."),
]
SR, GAP, TEMPO = 44100, 0.05, 1.12
out, spans = array.array('h'), []
for i, (who, text) in enumerate(SCRIPT):
    st, sty, sp = SET[who]
    body = {'text': text, 'model_id': 'eleven_v4', 'language_code': 'en', 'voice_settings': {'stability': st, 'similarity_boost': 0.8, 'style': sty, 'use_speaker_boost': True, 'speed': sp}}
    f = L / (hashlib.sha1(json.dumps([V[who], body]).encode()).hexdigest()[:12] + '.mp3')
    if not f.exists():
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V[who]}?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
        f.write_bytes(urllib.request.urlopen(req, timeout=180).read())
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(f), '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={TEMPO}', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    if i: out.extend([0] * int(GAP * SR))
    a = len(out) / SR; out.extend(array.array('h', raw)); spans.append((a, len(out) / SR, who))
with wave.open(str(A / 'voice.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
d = json.loads(subprocess.run(['curl', '-s', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', f'xi-api-key: {key}', '-F', 'model_id=scribe_v1', '-F', f'file=@{A / "voice.wav"}'], capture_output=True, text=True).stdout)
words = []
for x in d['words']:
    if x['type'] != 'word': continue
    who = next((s[2] for s in spans if s[0] - 0.05 <= x['start'] < s[1] + 0.05), 'narrator')
    words.append({'w': x['text'], 's': round(x['start'], 2), 'e': round(x['end'], 2), 'who': who})
json.dump(words, open('public/words.json', 'w'))
print(f'{len(out) / SR:.2f} s');
for s in spans: print(f'{s[0]:6.2f}-{s[1]:6.2f} {s[2]}')
print(' '.join(f"{w['w']}@{w['s']}" for w in words))
