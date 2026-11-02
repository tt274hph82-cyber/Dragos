"""Re-time words.json from the finished voice.wav with ElevenLabs speech-to-text (scribe_v1).

eleven_v4's character timestamps can drift by half a second or more inside a take, so cuts cued on words land late.
This listens to the cut voice itself and moves every word to where it is really heard. voice.py runs it at the end;
it can also be run alone:  python <skill>/scripts/align.py <slug>
"""
import difflib, json, os, re, sys, urllib.request, uuid

from wi import STUDIO, ep_dir, load_json, save_json


def key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k:
        for d in [STUDIO, *STUDIO.parents]:
            env = d / '.env'
            if env.exists():
                for line in env.read_text().splitlines():
                    if line.startswith('ELEVENLABS_API_KEY='):
                        return line.split('=', 1)[1].strip().strip('"')
    return k


def transcribe(path):
    boundary = uuid.uuid4().hex
    parts = []
    for name, val in [('model_id', 'scribe_v1'), ('timestamps_granularity', 'word'), ('tag_audio_events', 'false')]:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{val}\r\n'.encode())
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="voice.wav"\r\nContent-Type: audio/wav\r\n\r\n'.encode()
                 + path.read_bytes() + b'\r\n')
    body = b''.join(parts) + f'--{boundary}--\r\n'.encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body,
                                 headers={'xi-api-key': key(), 'Content-Type': f'multipart/form-data; boundary={boundary}'})
    return json.loads(urllib.request.urlopen(req, timeout=300).read())


norm = lambda w: re.sub(r"[^\w]", '', w.lower().replace('’', "'"))


def align(slug):
    words = load_json(ep_dir(slug) / 'words.json', [])
    wav = STUDIO / 'public' / slug / 'voice.wav'
    heard = [w for w in transcribe(wav).get('words', []) if w.get('type') == 'word']
    a, b = [norm(w['w']) for w in words], [norm(w['text']) for w in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    moved, shifts = 0, []
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w, h = words[blk.a + k], heard[blk.b + k]
            shifts.append(h['start'] - w['s'])
            w['s'], w['e'] = round(h['start'], 3), round(max(h['end'], h['start'] + 0.04), 3)
            moved += 1
    # words the transcript didn't match keep their place relative to their matched neighbours
    for i, w in enumerate(words):
        if not any(blk.a <= i < blk.a + blk.size for blk in sm.get_matching_blocks()):
            prev = next((words[j] for j in range(i - 1, -1, -1)), None)
            if prev:
                w['s'] = max(w['s'], prev['e'])
                w['e'] = max(w['e'], w['s'] + 0.04)
    save_json(ep_dir(slug) / 'words.json', words)
    worst = max((abs(s) for s in shifts), default=0)
    print(f'aligned {moved}/{len(words)} words to the heard audio; largest correction {worst:.2f} s')


if __name__ == '__main__':
    align(sys.argv[1])
