"""Ethan (ElevenLabs, eleven_v4, 128 kbps) reads the script; word times come from ElevenLabs speech-to-text (scribe_v1)
on the take itself. Writes voice.mp3, voice.wav and words.json here."""
import json, os, pathlib, subprocess, requests
HERE = pathlib.Path(__file__).resolve().parent
ENV = HERE.parents[1] / 'what-if-studio' / '.env'
key = os.environ.get('ELEVENLABS_API_KEY') or [l.split('=', 1)[1].strip().strip('"') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY=')][0]
TEXT = ("A farmer swings his axe. The head hits the dirt. And the rooster walks away. "
        "Colorado, nineteen forty-five. Lloyd Olsen just wanted dinner. "
        "Instead, Mike lived eighteen more months, and made him a fortune.")
VOICE = 'uB5dGadiIOtRLnqbQl9M'   # Ethan - Energetic YouTube Narrator
mp3 = HERE / 'voice.mp3'
if not mp3.exists():
    r = requests.post(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128', headers={'xi-api-key': key},
                      json={'text': TEXT, 'model_id': 'eleven_v4', 'language_code': 'en',
                            'voice_settings': {'stability': 0.38, 'similarity_boost': 0.8, 'style': 0.55, 'use_speaker_boost': True, 'speed': 1.12}}, timeout=300)
    r.raise_for_status(); mp3.write_bytes(r.content)
wav = HERE / 'voice.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(mp3), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,adelay=120|120,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.4', '-ar', '48000', '-ac', '2', str(wav)], check=True)
s = requests.post('https://api.elevenlabs.io/v1/speech-to-text', headers={'xi-api-key': key}, data={'model_id': 'scribe_v1', 'language_code': 'en'}, files={'file': open(wav, 'rb')}, timeout=300)
s.raise_for_status()
words = [{'w': w['text'], 's': round(w['start'], 3), 'e': round(w['end'], 3)} for w in s.json()['words'] if w['type'] == 'word']
(HERE / 'words.json').write_text(json.dumps(words, indent=0))
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(wav)]))
print(f'{len(words)} words, {dur:.2f} s, {len(words) / dur:.2f} words/s')
print(' '.join(f"{w['w']}@{w['s']}" for w in words))
