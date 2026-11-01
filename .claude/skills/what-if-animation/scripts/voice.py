"""Step 2: the voice. ElevenLabs text-to-speech with character timestamps, then the pauses tightened to the genre's pace.

python <skill>/scripts/voice.py <slug> [--force]
Reads  src/episodes/<slug>/episode.json  (script, voice, gaps)
Writes public/<slug>/voice_raw.mp3, public/<slug>/voice.wav (tightened), src/episodes/<slug>/words.json (word timings
       after tightening, used by plan.py) and out/<slug>/words_raw.json. Prints the credits it used.
The API is only called when the text or the voice settings change (cached by a hash), so re-running to retune the
gaps is free.

episode.json "voice" (all optional): {"id": "TX3LPaxmHKxFdv7VOQHJ", "model": "eleven_multilingual_v2",
  "settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": true}}
episode.json "gaps" (seconds, all optional): {"word": 0.12, "comma": 0.2, "sentence": 0.3, "question": 0.45,
  "pairs": {"anything|One": 0.6}}  -> every pause longer than its limit is cut to the limit, from its middle; a pair
  set longer than the take's pause gets silence inserted (chapter breaks, dramatic holds in long episodes).
"""
import base64, hashlib, json, re, sys, time

import numpy as np

from wi import SR, api, spent_since, decode, ep_dir, load_episode, load_json, log_cost, out_dir, pub_dir, save_json, write_wav

slug = sys.argv[1]
force = '--force' in sys.argv
ep = load_episode(slug)
V = {'id': 'TX3LPaxmHKxFdv7VOQHJ', 'model': 'eleven_multilingual_v2', 'settings': {'stability': 0.4, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True}}
V.update(ep.get('voice', {}))
text = ' '.join(b['text'].strip() for b in ep['script'])
sig = hashlib.sha1(json.dumps([text, V], sort_keys=True).encode()).hexdigest()[:12]
raw_mp3 = pub_dir(slug) / 'voice_raw.mp3'
raw_words = out_dir(slug) / 'words_raw.json'
meta = load_json(out_dir(slug) / 'voice_meta.json', {})

if force or meta.get('sig') != sig or not raw_mp3.exists() or not raw_words.exists():
    print(f'{len(text)} characters to ElevenLabs (voice {V["id"]})')
    t0 = time.time()
    res = json.loads(api(f'/v1/text-to-speech/{V["id"]}/with-timestamps?output_format=mp3_44100_128', {'text': text, 'model_id': V['model'], 'voice_settings': V['settings'], **({'language_code': V['language']} if V.get('language') else {})}))
    raw_mp3.write_bytes(base64.b64decode(res['audio_base64']))
    al = res['alignment']
    words, cur = [], None
    for ch, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if re.match(r"[\w'’]", ch):
            if cur is None:
                cur = {'w': '', 's': s, 'e': e, 'p': ''}
            cur['w'] += ch
            cur['e'] = e
        else:
            if cur is not None:
                words.append(cur)
                cur = None
            if words and ch.strip():
                words[-1]['p'] += ch  # punctuation after the word decides how long its pause may be
    if cur:
        words.append(cur)
    for w in words:
        w['s'], w['e'] = round(w['s'], 3), round(w['e'], 3)
    save_json(raw_words, words)
    save_json(out_dir(slug) / 'voice_meta.json', {'sig': sig, 'chars': len(text)})
    used, n = spent_since(t0, expect=1)
    log_cost(slug, 'voice', used, f'{len(text)} characters' + ('' if n else '; not in the history yet, check the usage page'))
else:
    print('Voice unchanged since the last call: reusing it (no credits).')

# ---------------------------------------------------------------- tighten the pauses
words = load_json(raw_words)
x = decode(raw_mp3)


def real_silences(sig, min_len=0.09, rel=0.06):
    """Spans where the take is actually quiet: a 10 ms energy envelope under rel x its 95th percentile, at least min_len long."""
    hop = int(0.01 * SR)
    env = np.sqrt(np.convolve(sig[: len(sig) // hop * hop].reshape(-1, hop).__pow__(2).mean(1), np.ones(3) / 3, mode='same'))
    thr = rel * np.percentile(env, 95)
    quiet = env < thr
    out, start = [], None
    for i, q in enumerate(np.append(quiet, False)):
        if q and start is None:
            start = i
        elif not q and start is not None:
            if (i - start) * 0.01 >= min_len:
                out.append([start * 0.01, i * 0.01])
            start = None
    return out


# ElevenLabs' character timestamps can drift (by ~0.4 s late in a long eleven_v4 take), so cutting pauses at the
# reported word gaps sliced through real words. Re-anchor every reported gap to the nearest real silence in the audio,
# then warp all word times between those anchors, so cuts only ever happen inside actual silence.
sil = real_silences(x)
anchors, used = [(0.0, 0.0)], -1
for a, b in zip(words, words[1:]):
    if b['s'] - a['e'] < 0.06:
        continue
    c = (a['e'] + b['s']) / 2
    best = None
    for k in range(used + 1, len(sil)):
        sc = (sil[k][0] + sil[k][1]) / 2
        if abs(sc - c) <= 0.7 and (best is None or abs(sc - c) < abs((sil[best][0] + sil[best][1]) / 2 - c)):
            best = k
        if sc > c + 0.7:
            break
    if best is not None:
        anchors += [(a['e'], sil[best][0]), (b['s'], sil[best][1])]
        used = best
anchors.append((max(words[-1]['e'], anchors[-1][0]) + 0.01, max(len(x) / SR, anchors[-1][1]) + 0.01))
anchors.sort()
ax, ay = [p[0] for p in anchors], [p[1] for p in anchors]
for w in words:
    w['s'], w['e'] = float(np.interp(w['s'], ax, ay)), float(np.interp(w['e'], ax, ay))
G = {'word': 0.12, 'comma': 0.2, 'sentence': 0.3, 'question': 0.45, 'pairs': {}}
G.update(ep.get('gaps', {}))
cuts = []


def bare(w):
    return re.sub(r'[^\w]', '', w)


ops = []  # (start, end, kind): 'cut' removes [start, end); 'pad' inserts (end - start) seconds of silence at start
for a, b in zip(words, words[1:]):
    gap = b['s'] - a['e']
    key = bare(a['w']) + '|' + bare(b['w'])
    if key in G['pairs']:
        keep = G['pairs'][key]
    elif '?' in a['p'] or '!' in a['p']:
        keep = G['question']
    elif '.' in a['p'] or ':' in a['p'] or ';' in a['p'] or '…' in a['p']:
        keep = G['sentence']
    elif ',' in a['p'] or '—' in a['p'] or '-' in a['p']:
        keep = G['comma']
    else:
        keep = G['word']
    mid = (a['e'] + b['s']) / 2
    if gap > keep:
        rm = gap - keep
        # only ever cut inside a real silence (30 ms in from its edges); no silence under the gap means no cut
        span = next((q for q in sil if q[0] - 0.05 <= mid <= q[1] + 0.05), None)
        if span is not None:
            lo, hi = span[0] + 0.03, span[1] - 0.03
            room = hi - lo - keep
            if room > 0.02:
                rm = min(rm, room)
                c0 = max(lo, min(mid - rm / 2, hi - rm))
                ops.append((c0, c0 + rm, 'cut'))
    elif key in G['pairs'] and keep > gap + 0.02:
        # a pair asked for a longer pause than the take has: insert silence (chapter breaks, dramatic holds)
        ops.append((mid, mid + (keep - gap), 'pad'))
cuts = [(s0, e0) for s0, e0, k in ops if k == 'cut']
parts, last = [], 0.0
for s0, e0, kind in ops:
    parts.append(x[int(last * SR):int(s0 * SR)])
    if kind == 'cut':
        last = e0
    else:
        parts.append(np.zeros(int((e0 - s0) * SR), dtype=x.dtype))
        last = s0
parts.append(x[int(last * SR):])
fade = int(0.004 * SR)  # a 4 ms fade either side of each join, so no click
for i, part in enumerate(parts):
    part = part.copy()
    if i > 0 and len(part) > fade:
        part[:fade] *= np.linspace(0, 1, fade)
    if i < len(parts) - 1 and len(part) > fade:
        part[-fade:] *= np.linspace(1, 0, fade)
    parts[i] = part
y = np.concatenate(parts)
write_wav(pub_dir(slug) / 'voice.wav', y)


def shift(t):
    removed = sum(min(e0, t) - s0 for s0, e0, k in ops if k == 'cut' and t > s0)
    added = sum(e0 - s0 for s0, e0, k in ops if k == 'pad' and t > s0)
    return t - removed + added


out = [{'w': w['w'], 's': round(shift(w['s']), 3), 'e': round(shift(w['e']), 3), 'p': w.get('p', '')} for w in words]
save_json(ep_dir(slug) / 'words.json', out)
pads = [(s0, e0) for s0, e0, k in ops if k == 'pad']
print(f'Tightened {len(cuts)} pauses (-{sum(e0 - s0 for s0, e0 in cuts):.2f} s), held {len(pads)} (+{sum(e0 - s0 for s0, e0 in pads):.2f} s): {len(x) / SR:.2f} s -> {len(y) / SR:.2f} s')
print(' '.join(f"{w['w']}@{w['s']}" for w in out))
