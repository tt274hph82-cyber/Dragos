"""Narration for the shadow-play Dancing Plague: one ElevenLabs clip per beat (Austin, eleven_v4, 128 kbps), placed at the
beat's start time. Writes vo/<n>.mp3 and vo.json [{start, dur, file, text}]. Cached: delete a clip to redo it."""
import json, os, pathlib, subprocess, urllib.request
ROOT = pathlib.Path(__file__).resolve().parent
VOICE, MODEL = 'Bj9UqZbhQsanLzgalpEG', 'eleven_v4'
SET = {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True, 'speed': 1.12}
LINES = [  # (start s, window end s, text): starts are laid out from the clip lengths
  (0.25, 2.85, 'Strasbourg, 1518.'),
  (3.0, 9.18, 'One July day, a woman named Frau Troffea stepped into the street, and began to dance.'),
  (9.33, 11.93, "She didn't stop. For days."),
  (12.08, 14.89, 'Within a week, thirty more had joined her.'),
  (15.04, 20.15, 'By the end of summer, some accounts say four hundred people were dancing.'),
  (20.3, 23.71, "The city's doctors had a cure: more dancing."),
  (23.86, 27.01, 'So they hired musicians, and built a stage.'),
  (27.16, 32.11, 'It only made things worse. Dancers collapsed in the streets.'),
  (32.26, 36.17, 'At last, they were carried to a mountain shrine, to pray.'),
  (36.32, 39.38, 'And slowly, the dancing stopped.'),
  (39.53, 43.0, 'To this day, nobody knows why it started.'),
]
key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    for line in (ROOT.parent / 'what-if-studio/.env').read_text().splitlines():
        if line.startswith('ELEVENLABS_API_KEY='): key = line.split('=', 1)[1].strip().strip('"')
out = []
for i, (start, end, text) in enumerate(LINES):
    f = ROOT / f'vo/{i + 1:02d}.mp3'
    if not f.exists():
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
            data=json.dumps({'text': text, 'model_id': MODEL, 'voice_settings': SET, 'language_code': 'en'}).encode(),
            headers={'xi-api-key': key, 'Content-Type': 'application/json'})
        f.write_bytes(urllib.request.urlopen(req, timeout=180).read())
    # trim the clip's leading/trailing silence so it lands on its time
    t = ROOT / f'vo/{i + 1:02d}t.mp3'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(f), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-b:a', '128k', str(t)], check=True)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(t)]))
    out.append({'start': start, 'dur': round(d, 3), 'file': f'vo/{i + 1:02d}t.mp3', 'text': text})
    flag = '  ! runs past its beat' if start + d > end + 0.15 else ''
    print(f'{i + 1:2d} {start:5.1f}-{start + d:5.1f} (beat ends {end})  {text}{flag}')
(ROOT / 'vo.json').write_text(json.dumps(out, indent=1))
