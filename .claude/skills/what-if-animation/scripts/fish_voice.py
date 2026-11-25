"""Step 2 with a Fish Audio voice instead of ElevenLabs: one Fish Audio take of the whole script, word times from
ElevenLabs speech-to-text (scribe_v1, the same re-timing the ElevenLabs path uses), cached exactly where voice.py
looks for its take, then voice.py runs as usual (tightens the pauses, re-aligns, writes words.json) without calling
ElevenLabs TTS.

python <skill>/scripts/fish_voice.py <slug> [--force]

episode.json "voice": {"provider": "fish", "id": "<Fish Audio model id>", "model": "s1"}
Keys: FISH_API_KEY (Fish Audio) and ELEVENLABS_API_KEY (speech-to-text) from the environment or the studio's .env.
"""
import hashlib, json, os, pathlib, re, subprocess, sys
import requests

from wi import load_episode, out_dir, pub_dir, save_json, load_json

slug = sys.argv[1]
force = '--force' in sys.argv
ep = load_episode(slug)
# the same signature voice.py computes, so it finds this take and skips its own TTS call
V = {'id': 'TX3LPaxmHKxFdv7VOQHJ', 'model': 'eleven_multilingual_v2', 'settings': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True}}
V.update(ep.get('voice', {}))
assert V.get('provider') == 'fish', 'episode.json voice.provider must be "fish"'
text = ' '.join(b['text'].strip() for b in ep['script'])
sig = hashlib.sha1(json.dumps([text, V], sort_keys=True).encode()).hexdigest()[:12]


def key(name):
    if os.environ.get(name):
        return os.environ[name]
    for line in open('.env'):
        if line.startswith(name + '='):
            return line.split('=', 1)[1].strip().strip('"')
    raise SystemExit(f'{name} not set')


raw_mp3 = pub_dir(slug) / 'voice_raw.mp3'
raw_words = out_dir(slug) / 'words_raw.json'
meta = load_json(out_dir(slug) / 'voice_meta.json', {})
if not force and meta.get('sig') == sig and raw_mp3.exists() and raw_words.exists():
    print('Fish take unchanged: reusing it.')
else:
    print(f'{len(text)} characters to Fish Audio (voice {V["id"]}, model {V.get("model", "s1")})')
    r = requests.post('https://api.fish.audio/v1/tts', headers={'Authorization': 'Bearer ' + key('FISH_API_KEY'), 'model': V.get('model', 's1')},
                      json={'text': text, 'reference_id': V['id'], 'format': 'mp3', 'mp3_bitrate': 128, **V.get('settings', {})}, timeout=600)
    r.raise_for_status()
    raw_mp3.write_bytes(r.content)
    # word times from speech-to-text on the take itself
    s = requests.post('https://api.elevenlabs.io/v1/speech-to-text', headers={'xi-api-key': key('ELEVENLABS_API_KEY')},
                      data={'model_id': 'scribe_v1', 'language_code': 'en'}, files={'file': open(raw_mp3, 'rb')}, timeout=600)
    s.raise_for_status()
    words = []
    for w in s.json()['words']:
        if w['type'] != 'word':
            continue
        m = re.match(r"^(.*?)([^\w'’]*)$", w['text'].strip())
        core, punct = m.group(1), m.group(2)
        for part in re.split(r'[-‐]', core):
            if part:
                words.append({'w': part, 's': round(w['start'], 3), 'e': round(w['end'], 3), 'p': ''})
        if words:
            words[-1]['p'] += punct
    save_json(raw_words, words)
    save_json(out_dir(slug) / 'voice_meta.json', {'sig': sig, 'chars': len(text), 'provider': 'fish'})
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(raw_mp3)]))
    print(f'Fish take: {dur:.2f} s, {len(words)} words')
subprocess.run([sys.executable, str(pathlib.Path(__file__).with_name('voice.py')), slug], check=True)
