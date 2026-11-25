"""After a new voice take: move punch/bloom/shake fx and named story sounds to just after their key words.
python <skill>/scripts/retime_hits.py <slug> <keys.json>   keys.json: {"fx": {"S4": "ton"}, "events": [["fuse", "S4", "dynamite", 2, false]]}
(event = clip, shot, word, frame offset, from the word's start instead of its end)"""
import json, re, sys
slug, kp = sys.argv[1], sys.argv[2]
d = f'src/episodes/{slug}'
w = json.load(open(f'{d}/words.json')); tl = json.load(open(f'{d}/timeline.json')); K = json.load(open(kp))
S = {s['shot']: (s['a'], s['b']) for s in tl['segments']}
n = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
def at(sh, word, off=2, start=False):
    a, b = S[sh]
    for x in w:
        if a - 3 <= x['s'] * 30 < b and n(x['w']) == n(word):
            return f"{sh}+{max(0, round((x['s'] if start else x['e']) * 30 - a) + off)}"
    raise SystemExit(f'{word} not in {sh}')
e = json.load(open(f'{d}/episode.json'))
for fx in e.get('fx', []):
    sh = fx['at'].split('+')[0]
    if sh in K['fx'] and fx['kind'] in ('punch', 'bloom', 'shake'): fx['at'] = at(sh, K['fx'][sh])
place = {(c, sh): at(sh, wd, off, st) for c, sh, wd, off, st in K['events']}
e['sound']['events'] = [[place[(x[1], x[0].split('+')[0])], *x[1:]] if (x[1], x[0].split('+')[0]) in place else x for x in e['sound']['events']]
json.dump(e, open(f'{d}/episode.json', 'w'), indent=1); print('retimed', len(place), 'sounds and', len(K['fx']), 'fx shots')
