"""Pick and download Wikimedia Commons photos for each image key; writes src/credits.json.
python3 scripts/photos.py            (all keys missing a file)
python3 scripts/photos.py key=Title  (force a specific Commons file for a key)"""
import json, sys, time, re, html, urllib.request, urllib.parse, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = {'User-Agent': 'WildAfricaDoc/1.0 (educational documentary; Wikimedia Commons reuse with attribution)'}
PICKS = {  # key: "File:..." (exact) or a search query
 'pod_nile': 'File:Hippopotamuses in the Nile at Murchison Falls National Park.jpg',
 'eyes_water': 'hippopotamus eyes above water',
 'yawn_big': 'File:Hippo Tilting Its Head While Yawning.jpg',
 'face': 'hippopotamus head close-up',
 'whale': 'humpback whale breaching',
 'bank': 'hippos resting on sandbank river Africa',
 'walking': 'Dainty hippo - Flickr - Matt Biddulph.jpg',
 'skin': 'hippopotamus close up Kruger',
 'pod_water': 'hippo pool Tanzania',
 'underwater': 'hippopotamus underwater',
 'ears': 'hippopotamus head water Botswana',
 'surface': 'hippopotamus surfacing water head',
 'red_sweat': 'hippopotamus out of water Uganda',
 'red_sweat2': 'hippopotamus out of water sun',
 'sunset': 'unused',
 'grazing': 'hippopotamus eating grass',
 'dawn': 'hippos river morning Zambia',
 'mara_river': 'Mara River hippos',
 'charge': 'hippopotamus aggressive Hippopotamus amphibius',
 'bull': 'hippopotamus male river Africa',
 'yawn2': 'File:Yawning hippopotamus (28021668971).jpg',
 'teeth': 'File:See My fangs.jpg',
 'canoe': 'dugout canoe Okavango',
 'pod_big': 'hippopotamus group Serengeti',
 'fight': 'hippopotamus fighting',
 'behind': 'hippopotamus walking out of water',
 'calf': 'hippopotamus baby Hippopotamus amphibius',
 'calf2': 'baby hippo mother water',
 'croc': 'Crocodylus niloticus Kenya',
 'croc_hippo': 'hippopotamus crocodile river',
 'lone': 'hippopotamus Kenya',
 'dry_river': 'dry riverbed Africa drought',
 'village': 'fishermen canoes Lake Victoria',
 'yawn3': 'File:Hippo (Hippopotamus amphibius) yawning ... (31187613621).jpg',
 'golden': 'hippopotamus evening light',
 'title_bg': 'hippopotamus river dusk',
}
def api(params):
    params.update(format='json')
    u = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    for i in range(10):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
        except Exception as e:
            print('  api retry', e); time.sleep(10 * (i + 1))
    raise SystemExit('Commons API failed')
PROPS = dict(prop='imageinfo', iiprop='size|extmetadata|url', iiurlwidth=1920)
BAD = re.compile(r'zoo|tiergarten|zoolog|museum|skull|skelet|drawing|illustration|painting|\(1[89]\d\d\)|stamp|map|guide to|antiqu|kuhnert|statue|toy|figurine|pygmy|1956|19[0-5]\d|disney|animal kingdom|giraffen', re.I)
def info(p):
    ii = p['imageinfo'][0]; m = ii.get('extmetadata', {})
    strip = lambda s: re.sub('<[^>]+>', '', html.unescape(s or '')).strip()
    return dict(title=p['title'][5:], w=ii['width'], h=ii['height'], url=ii.get('thumburl') or ii['url'],
                license=strip(m.get('LicenseShortName', {}).get('value')), artist=strip(m.get('Artist', {}).get('value')) or 'Unknown',
                page=ii.get('descriptionurl', ''))
def choose(q, used):
    if q == 'unused': return None
    if q.startswith('File:') or q.endswith('.jpg'):
        q = q if q.startswith('File:') else 'File:' + q
        r = api(dict(action='query', titles=q, **PROPS))
        return info(next(iter(r['query']['pages'].values())))
    r = api(dict(action='query', generator='search', gsrsearch=q + ' filetype:bitmap', gsrnamespace=6, gsrlimit=40, **PROPS))
    pages = sorted((r.get('query', {}).get('pages', {}) or {}).values(), key=lambda p: p.get('index', 99))
    for p in pages:
        if 'imageinfo' not in p: continue
        c = info(p)
        ok_lic = re.search(r'CC BY|CC0', c['license'], re.I) and 'NC' not in c['license']
        needs_hippo = 'hippo' in q.lower()
        if needs_hippo and not re.search(r'hippo|flodh|nijlpaard|nilpferd', c['title'], re.I): continue
        if c['w'] >= 1600 and c['w'] / c['h'] >= 1.25 and ok_lic and not BAD.search(c['title']) and c['title'] not in used:
            return c
    if 'hippo' in q.lower() and q != 'Hippopotamus amphibius wild':
        print('  fallback for', q)
        return choose('Hippopotamus amphibius wild', used)
    return None
force = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
cpath = ROOT / 'src/credits.json'
credits = {c['key']: c for c in json.loads(cpath.read_text())} if cpath.exists() else {}
used = {c['title'] for c in credits.values()}
for key, q in PICKS.items():
    if key in force: q = force[key] if force[key].startswith('File:') else force[key]
    out = ROOT / f'public/photos/{key}.jpg'
    if out.exists() and key not in force: continue
    c = choose(q, used)
    if c is None:
        print('  NO PHOTO for', key, q); continue
    used.add(c['title'])
    data = None
    for i in range(6):
        try:
            data = urllib.request.urlopen(urllib.request.Request(c['url'], headers=UA), timeout=120).read(); break
        except Exception as e:
            print('  retry', key, e); time.sleep(6 * (i + 1))
    if data is None:
        print('  download failed:', key); continue
    out.write_bytes(data)
    credits[key] = dict(key=key, file=f'{key}.jpg', title=c['title'], artist=c['artist'][:90], license=c['license'], page=c['page'])
    print(f'{key:12s} {c["license"]:14s} {c["title"][:70]}')
    cpath.write_text(json.dumps(list(credits.values()), indent=1, ensure_ascii=False))
    time.sleep(4)
