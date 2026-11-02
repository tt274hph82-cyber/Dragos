"""Narration for the shadow-play Pig War: one ElevenLabs clip per beat (Austin, eleven_v4, 128 kbps), placed at the
beat's start time. Writes vo/<n>.mp3 and vo.json [{start, dur, file, text}]. Cached: delete a clip to redo it."""
import json, os, pathlib, subprocess, urllib.request
ROOT = pathlib.Path(__file__).resolve().parent
VOICE, MODEL = 'Bj9UqZbhQsanLzgalpEG', 'eleven_v4'
SET = {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True, 'speed': 1.12}
LINES = [  # (start s, window end s, text)
  (0.2, 3.09, 'San Juan Island, 1859.'),
  (3.29, 9.22, "Britain and America both claimed it. Then a British pig ate an American's potatoes."),
  (9.42, 11.22, 'So he shot the pig.'),
  (11.42, 13.92, 'The British threatened to arrest him.'),
  (14.12, 16.82, 'America sent in sixty-four soldiers.'),
  (17.02, 19.72, 'Britain sent three warships.'),
  (19.92, 24.3, 'Soon, hundreds of soldiers faced two thousand British sailors.'),
  (24.5, 28.99, 'But the British admiral refused to start a war. Not over a pig.'),
  (29.19, 32.24, 'Both armies shared the island for twelve years.'),
  (32.44, 36.07, 'Then the German Kaiser decided: America gets it.'),
  (36.27, 38.27, 'Casualties? One pig.'),
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
