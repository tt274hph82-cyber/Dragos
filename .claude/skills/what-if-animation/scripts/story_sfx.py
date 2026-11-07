"""Story Reels: a sound for every cut (hard cuts too), camera move, keyword and hit, like the reference Reels (whoosh on each transition, a
riser on a dive, a boom on punches and blooms, a thunder crack on the cold open).

    python <skill>/scripts/story_sfx.py <slug> [--thunder]

Rewrites the `tr_*` clips and events in episode.json's `sound` (your own events are kept), so run it after every
edit change, then sfx.py. The camera and transition rotation mirrors src/engine/episode.tsx (AUTO_CAM / AUTO_TR).
"""
import json, sys, pathlib

slug = sys.argv[1]
thunder = '--thunder' in sys.argv
p = pathlib.Path('src/episodes') / slug / 'episode.json'
ep = json.loads(p.read_text())
AUTO_CAM = ['push', 'panL', 'dive', 'pull', 'panR', 'push', 'rise']
AUTO_TR = ['ghost', 'dissolve', 'zoom', 'dissolve', 'ghost', 'whip', 'dissolve']
CLIPS = {
    'tr_whoosh': ['a fast airy cinematic whoosh, a short swoosh transition', 0.8],
    'tr_zoom': ['a fast zoom-in whoosh rising in pitch, a cinematic swoosh transition, short', 1.0],
    'tr_flash': ['a bright camera flash pop with a shimmering reverse whoosh, a cinematic transition hit, short', 1.2],
    'tr_whip': ['a very quick whip pan swish, short', 0.5],
    'tr_ghost': ['a soft breathy reverse whoosh, gentle and airy, short', 1.0],
    'tr_riser': ['a short tense whoosh riser swelling up, cinematic, short', 1.4],
    'tr_impact': ['a deep punchy cinematic boom impact hit for a title, short', 1.2],
    'tr_tick': ['a fast mechanical counter ticking up, short', 1.2],
    'tr_cut': ['a very short punchy swish pop for a hard cut, cartoon, crisp', 0.6],
    'tr_hit': ['a short punchy cartoon impact thump with a tiny whoosh, crisp, for a key word', 0.6],
    'tr_thunder': ['a huge close thunder crack with a long rolling thunder rumble, cinematic storm', 6.0],
}
GAIN = {'tr_cut': 0.16, 'tr_hit': 0.2, 'tr_whoosh': 0.22, 'tr_zoom': 0.26, 'tr_flash': 0.3, 'tr_whip': 0.22, 'tr_ghost': 0.16, 'tr_riser': 0.13, 'tr_impact': 0.32, 'tr_tick': 0.18}
TR_CLIP = {'cut': 'tr_cut', 'ghost': 'tr_ghost', 'zoom': 'tr_zoom', 'flash': 'tr_flash', 'whip': 'tr_whip', 'dissolve': 'tr_whoosh'}

snd = ep.setdefault('sound', {'clips': {}, 'events': []})
snd['clips'] = {k: v for k, v in snd.get('clips', {}).items() if not k.startswith('tr_')}
snd['clips'].update(CLIPS)
events = [e for e in snd.get('events', []) if not str(e[1]).startswith('tr_')]
auto = []
count = {}
for i, e in enumerate(ep['edit']):
    shot = e['shot']
    count[shot] = count.get(shot, 0) + 1
    cue = shot if count[shot] == 1 else None   # sfx cues name a shot's first appearance
    if cue is None:
        continue
    tr = e.get('tr') or (AUTO_TR[i % len(AUTO_TR)] if i else 'none')
    cam = e.get('cam') or AUTO_CAM[i % len(AUTO_CAM)]
    if tr in TR_CLIP:
        c = TR_CLIP[tr]
        auto.append([cue, c, GAIN[c], 'peak'])
    if cam == 'dive':
        auto.append([f'{cue}+4', 'tr_riser', GAIN['tr_riser']])
for f in ep.get('fx', []):
    if f['kind'] in ('punch', 'bloom'):
        auto.append([f['at'], 'tr_impact', GAIN['tr_impact'] * (1.2 if f['kind'] == 'bloom' else 1), 'onset'])
    if f['kind'] == 'rewind':
        auto.append([f['at'], 'tr_tick', 0.25])
# a hit on every coloured caption keyword (episode.json "captions": {"colors": {...}}), just after the word starts
cols = (ep.get('captions') or {}).get('colors') or {}
if cols:
    wpath = pathlib.Path('src/episodes') / slug / 'words.json'
    for w in json.loads(wpath.read_text()) if wpath.exists() else []:
        if w['w'].lower() in cols:
            auto.append([f"s:{w['s'] + 0.05:.2f}", 'tr_hit', GAIN['tr_hit']])
if thunder:
    auto.insert(0, [ep['edit'][0]['shot'], 'tr_thunder', 0.55])
# one impact per cue at most
seen, ded = set(), []
for a in auto:
    k = (a[0], a[1])
    if k not in seen:
        seen.add(k); ded.append(a)
snd['events'] = ded + events
p.write_text(json.dumps(ep, indent=1))
print(f'{len(ded)} automatic sound events ({sum(1 for a in ded if a[1] != "tr_impact")} on cuts and moves, {sum(1 for a in ded if a[1] == "tr_impact")} hits){" + thunder" if thunder else ""}')
