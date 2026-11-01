"""ElevenLabs music (three acts) and sound effects for the hippo documentary. Cached by file: delete a file to redo it.
python3 scripts/audio.py"""
import json, os, pathlib, urllib.request
ROOT = pathlib.Path(__file__).resolve().parent.parent
key = os.environ.get('ELEVENLABS_API_KEY')
if not key:
    for line in (ROOT.parent / 'what-if-studio/.env').read_text().splitlines():
        if line.startswith('ELEVENLABS_API_KEY='): key = line.split('=', 1)[1].strip().strip('"')
def post(url, body, out):
    if out.exists(): return
    req = urllib.request.Request('https://api.elevenlabs.io/v1' + url, data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    out.write_bytes(urllib.request.urlopen(req, timeout=600).read()); print('made', out.name)
MUSIC = {
 'act1': ('Cinematic nature documentary score, warm and curious, African kalimba and soft marimba over gentle strings and light hand percussion, sunrise over a river, wonder, no vocals', 150),
 'act2': ('Cinematic nature documentary score, tense and powerful, low taiko drums, deep strings and African percussion building suspense, danger at the river, no vocals', 130),
 'act3': ('Cinematic nature documentary score, emotional and hopeful, soft strings, piano and a gentle African choir hum, sunset over the savanna, reflective ending, no vocals', 160),
}
SFX = {
 'river': ('a calm African river ambience, flowing water, distant birds and insects, no voices', 22),
 'hippo': ('a hippopotamus grunting and honking loudly from the water, deep wheezing hippo call', 4),
 'night': ('African savanna at night ambience, crickets and frogs, distant hyena, no voices', 22),
 'splash': ('a huge heavy animal plunging into a river, big deep splash', 2.5),
 'eagle': ('an African fish eagle calling over a river, clear high wild cry', 3),
 'whoosh': ('a soft cinematic whoosh transition, low and airy', 1.5),
 'boom': ('a deep cinematic boom impact with a long low tail', 3),
 'roar': ('a lion roaring in the distance across the savanna at dusk', 4),
}
for k, (p, sec) in MUSIC.items():
    post('/music?output_format=mp3_44100_128', {'prompt': p, 'music_length_ms': sec * 1000, 'model_id': 'music_v1'}, ROOT / f'public/music/{k}.mp3')
for k, (p, sec) in SFX.items():
    post('/sound-generation?output_format=mp3_44100_128', {'text': p, 'duration_seconds': sec, 'prompt_influence': 0.4, 'model_id': 'eleven_text_to_sound_v3'}, ROOT / f'public/sfx/{k}.mp3')
