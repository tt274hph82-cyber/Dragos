"""Narration for a kit video: one ElevenLabs take of the whole script (Austin, eleven_v4, 128 kbps), loudnormed to voice.wav,
word times from ElevenLabs speech-to-text (scribe_v1) into words.json, then the kit's timeline.py builds timeline.ts.
usage: python3 scripts/voice.py <video id>     (reads src/videos/<id>/script.txt; [shot] markers are stripped for the voice)"""
import json, os, re, subprocess, sys, urllib.request, pathlib
import requests
vid = sys.argv[1]; R = pathlib.Path(__file__).resolve().parents[1]; V = R / 'src/videos' / vid; P = R / 'public' / vid; P.mkdir(parents=True, exist_ok=True)
key = os.environ.get('ELEVENLABS_API_KEY') or [l.split('=', 1)[1].strip().strip('"') for l in open(R.parent / 'what-if-studio/.env') if l.startswith('ELEVENLABS_API_KEY=')][0]
text = re.sub(r'\[\w+\]\s*', '', (V / 'script.txt').read_text()).replace('\n', ' ').strip()
mp3 = P / 'voice_raw.mp3'
if not mp3.exists():
    body = {'text': text, 'model_id': 'eleven_v4', 'language_code': 'en', 'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True, 'speed': 1.12}}
    req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/Bj9UqZbhQsanLzgalpEG?output_format=mp3_44100_128', data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    mp3.write_bytes(urllib.request.urlopen(req, timeout=300).read())
wav = P / 'voice.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(mp3), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,adelay=150|150,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.35,loudnorm=I=-16:TP=-1.5', '-ar', '48000', '-ac', '2', str(wav)], check=True)
r = requests.post('https://api.elevenlabs.io/v1/speech-to-text', headers={'xi-api-key': key}, data={'model_id': 'scribe_v1', 'language_code': 'en'}, files={'file': open(mp3 if False else wav, 'rb')}, timeout=300)
r.raise_for_status()
words = [{'w': w['text'], 's': w['start'], 'e': w['end']} for w in r.json()['words'] if w['type'] == 'word']
(V / 'words.json').write_text(json.dumps(words, indent=0))
subprocess.run(['python3', str(R / 'src/engine/tools/timeline.py'), str(V / 'script.txt'), str(V / 'words.json'), str(wav), str(V / 'timeline.ts')], check=True)
d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(wav)]))
print(f'{len(words)} words, {d:.2f} s, {len(words) / d:.2f} words/s')
