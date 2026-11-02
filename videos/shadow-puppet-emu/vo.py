"""Narration for the shadow-play Emu War: one ElevenLabs clip per beat (Austin, eleven_v4, 128 kbps), placed at the
beat's start time. Writes vo/<n>.mp3 and vo.json [{start, dur, file, text}]. Cached: delete a clip to redo it."""
import json, os, pathlib, subprocess, urllib.request
ROOT = pathlib.Path(__file__).resolve().parent
VOICE, MODEL = 'Bj9UqZbhQsanLzgalpEG', 'eleven_v4'
SET = {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True, 'speed': 1.12}
LINES = [  # (start s, window end s, text)
  (0.2, 2.8, 'Western Australia, 1932.'),
  (2.9, 7.4, "Twenty thousand emus were eating the farmers' wheat."),
  (7.7, 11.4, 'So the army sent two machine guns, and ten thousand bullets.'),
  (11.7, 13.7, 'But the emus split up and ran.'),
  (14.3, 17.2, 'Fifty kilometres an hour. No truck could keep up.'),
  (17.55, 19.4, 'Then a gun jammed.'),
  (19.85, 24.5, 'Nearly ten thousand bullets. Nine hundred and eighty-six emus.'),
  (24.8, 26.4, 'Ten bullets per bird.'),
  (27.4, 29.0, 'The army went home.'),
  (29.6, 32.0, 'The emus won.'),
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
