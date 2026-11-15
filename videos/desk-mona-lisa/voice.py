"""Narration: one ElevenLabs clip per line (Austin, eleven_v4, 128 kbps), joined with pauses into audio/voice.wav,
then every word re-timed from the audio with speech-to-text (scribe_v1). Writes timing.json and timing.js.
Clips are cached in vo/: delete one to redo it."""
import json, os, pathlib, subprocess, urllib.request, re, difflib
import requests
ROOT = pathlib.Path(__file__).resolve().parent
VOICE, MODEL = 'Bj9UqZbhQsanLzgalpEG', 'eleven_v4'
SET = {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.3, 'use_speaker_boost': True, 'speed': 1.0}
LEAD = 1.6   # silence before the first word (the camera settles on the desk)
TAIL = 3.0
LINES = [  # (id, text, pause after s)
  ('paris', 'Paris. August, nineteen eleven. A Monday. The Louvre is closed.', 0.55),
  ('smock', 'A handyman in a white smock walks up to one small painting.', 0.35),
  ('lift', 'He lifts it off the wall, and walks right out the door.', 0.7),
  ('day', 'Nobody notices for more than a day.', 0.6),
  ('news', "Then it's front-page news, all over the world.", 0.5),
  ('borders', 'Police seal the borders.', 0.45),
  ('picasso', 'They even question a young painter named Pablo Picasso.', 0.6),
  ('crowds', 'Crowds line up just to stare at the empty wall.', 0.7),
  ('miles', 'And the painting? About two miles away.', 0.35),
  ('trunk', "In a trunk, in a handyman's rented room.", 0.5),
  ('years', 'It sits there for over two years.', 0.7),
  ('name', "His name is Vincenzo Peruggia. He'd helped build her glass case.", 0.6),
  ('italy', 'Then he carries her home to Italy, and tries to sell her in Florence.', 0.5),
  ('dealer', 'The dealer calls the police.', 0.6),
  ('months', 'He serves about seven months.', 0.9),
  ('twist', "Now here's the twist. Before all this, most folks couldn't have picked her out of a lineup.", 0.6),
  ('famous', 'The man who stole the Mona Lisa made her the most famous painting on Earth.', 0.8),
  ('real', "That's real.", 0.0),
]
key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    for line in (ROOT.parent / 'what-if-studio/.env').read_text().splitlines():
        if line.startswith('ELEVENLABS_API_KEY='): key = line.split('=', 1)[1].strip().strip('"')
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]))
t, lines, ins, fl = LEAD, [], [], []
for i, (lid, text, pause) in enumerate(LINES):
    f = ROOT / f'vo/{lid}.mp3'
    if not f.exists():
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
            data=json.dumps({'text': text, 'model_id': MODEL, 'voice_settings': SET, 'language_code': 'en'}).encode(),
            headers={'xi-api-key': key, 'Content-Type': 'application/json'})
        f.write_bytes(urllib.request.urlopen(req, timeout=180).read())
    w = ROOT / f'vo/{lid}.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(f), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '48000', '-ac', '2', str(w)], check=True)
    d = dur(w)
    lines.append({'id': lid, 'text': text, 'start': round(t, 3), 'end': round(t + d, 3)})
    ins += ['-i', str(w)]; fl.append(f'[{i}]adelay={int(t * 1000)}:all=1[a{i}]')
    t += d + pause
total = round(t + TAIL, 2)
mix = ''.join(f'[a{i}]' for i in range(len(LINES)))
subprocess.run(['ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', ';'.join(fl) + f';{mix}amix=inputs={len(LINES)}:normalize=0,apad,atrim=0:{total}[o]', '-map', '[o]', str(ROOT / 'audio/voice.wav')], check=True)
# word times from the audio
mp3 = ROOT / 'audio/voice-stt.mp3'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(ROOT / 'audio/voice.wav'), '-b:a', '96k', str(mp3)], check=True)
r = requests.post('https://api.elevenlabs.io/v1/speech-to-text', headers={'xi-api-key': key}, data={'model_id': 'scribe_v1', 'language_code': 'en'}, files={'file': open(mp3, 'rb')}, timeout=300)
r.raise_for_status()
heard = [w for w in r.json()['words'] if w['type'] == 'word']
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
words = []
for ln in lines:
    ws = ln['text'].split(); n = len(ws)
    for k, w in enumerate(ws):  # first guess: spread evenly over the line
        words.append({'w': w, 'line': ln['id'], 's': round(ln['start'] + (ln['end'] - ln['start']) * k / n, 3), 'e': round(ln['start'] + (ln['end'] - ln['start']) * (k + 1) / n, 3), 'ok': False})
sm = difflib.SequenceMatcher(a=[norm(w['w']) for w in words], b=[norm(h['text']) for h in heard], autojunk=False)
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        w, h = words[blk.a + k], heard[blk.b + k]
        w['s'], w['e'], w['ok'] = round(h['start'], 3), round(h['end'], 3), True
out = {'total': total, 'lines': lines, 'words': words}
(ROOT / 'timing.json').write_text(json.dumps(out, indent=1))
(ROOT / 'timing.js').write_text('window.TIMING = ' + json.dumps(out) + ';\n')
print('total', total, 'matched', sum(w['ok'] for w in words), '/', len(words))
for ln in lines: print(f"{ln['start']:6.2f}-{ln['end']:6.2f}  {ln['id']:8s} {ln['text']}")
print('unmatched:', [w['w'] for w in words if not w['ok']])
