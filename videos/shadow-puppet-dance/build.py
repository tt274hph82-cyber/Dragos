"""Build the Dancing Plague pages: storyboard.html (720 panels) and dancing-plague.html (the 1080 player).
Templates hold /*HARNESS*/ /*SOUND*/ /*DANCE*/ /*SCORE*/ /*VO*/ placeholders; this inlines the scripts."""
import base64, json, pathlib
R = pathlib.Path(__file__).resolve().parent
rd = lambda f: (R / f).read_text()
vo = json.loads(rd('vo.json'))
pathlib.Path(R / 'vo-data.js').write_text('window.VO=' + json.dumps([{'start': v['start'], 'dur': v['dur'], 'b64': base64.b64encode((R / v['file']).read_bytes()).decode()} for v in vo]) + ';')
fill = lambda t: t.replace('/*HARNESS*/', rd('lib-harness.js')).replace('/*SOUND*/', rd('lib-sound.js')).replace('/*DANCE*/', rd('dance.js')).replace('/*SCORE*/', rd('score.js') if (R / 'score.js').exists() else '').replace('/*VO*/', rd('vo-data.js'))

L = [v['text'] for v in vo]
B = [
 (1.7, 0, 3.0, 'Strasbourg, 1518 · The Dancing · Plague', 0, '<b>Opening.</b> The lamp sputters alight; the title card drops on its strings, then is hoisted out.', 'lamp catching, hide rustle, rod tap, a bronze note.'),
 (6.5, 3.0, 9.3, 'Frau Troffea', 1, '<b>Continuous.</b> The street rises: half-timbered houses with lit windows and chimney smoke, the cathedral spire behind. A woman (red gel in her skirt) walks in and starts to dance.', 'footsteps, plaque tap, then a jingle as she begins.'),
 (11.0, 9.3, 12.1, 'day 1 → day 6', 2, '<b>Continuous.</b> Sun and moon swing across the sky; the lamp dips each night; the board counts the days.', 'a soft chime per day, her feet tapping steadily underneath.'),
 (13.9, 12.1, 15.0, '30+ · joined her', 3, '<b>Continuous.</b> Townsfolk dance in from both sides; the board drops.', 'more feet taps, board tap and a bronze note.'),
 (18.9, 15.0, 19.4, '400 · dancing', 4, '<b>Continuous, escalating.</b> A blurred crowd rises behind; the board counts 30 to 400 and pops; the lamp flares.', 'counter ticks, a rising rattle, a gong when it lands on 400.'),
 (21.5, 19.4, 23.8, "the doctors' cure: · more dancing!", 5, '<b>Scene change: lace curtains.</b> Two physicians in long robes and tall hats; a plaque, then the tag.', 'curtain swish, plaque and tag taps, a bright bronze.'),
 (26.0, 23.8, 27.1, 'a stage and a band', 6, '<b>Continuous.</b> A trestle stage with bunting rises; a drummer and a piper slide in; the dancers go faster.', 'a drum beat and a pipe-like tune, stage thunk.'),
 (30.6, 27.1, 31.3, 'worse ✕', 7, '<b>Continuous.</b> A red gel washes the screen; the tag drops with a red X; two dancers collapse on the stage.', 'clashing bronze, two soft thuds, the music stops.'),
 (34.5, 31.3, 36.3, 'shrine of St. Vitus', 8, '<b>Scene change: lamp down and up</b> into night (cool blue gel). A procession climbs the path to a chapel with a lit window.', 'lamp sigh, slow steps, a distant bell.'),
 (37.6, 36.3, 39.5, '(none)', 9, '<b>Continuous.</b> In front, Frau Troffea’s dance winds down until she stands still.', 'her taps slowing to silence.'),
 (41.8, 39.5, 42.4, 'the cause · ?', 10, '<b>Continuous.</b> The hill fades back; the plaque drops; a big ? stamps down in a ring.', 'plaque tap, a low gong under the ?.'),
 (44.5, 42.4, 45.0, 'The Dancing Plague · 1518 · still unexplained', None, '<b>Takeaway.</b> The final card drops; the moon bursts into rays; held about 2 s.', 'card tap, a resolving three-note bronze phrase.'),
]
beats = ',\n'.join('  ' + json.dumps({'t': t, 'a': a, 'b': b, 'text': x, 'vo': L[v] if v is not None else '(held, no line)', 'flow': f, 'sound': s}, ensure_ascii=False) for t, a, b, x, v, f, s in B)

src = rd('../shadow-puppet-pig/storyboard.template.html')
head = src[:src.index('<header>')].replace('The Pig War Storyboard', 'The Dancing Plague Storyboard')
scr = src[src.index('(async () => {'):].replace('PIG.', 'DANCE.').replace('0–36.5 s', '0–45 s')
body = '''<header>
  <div class="meta">Shadow Puppet Theatre · 9:16 · native 1080 × 1920 · 45 s · Austin narration · storyboard (standing approval)</div>
  <h1>The <em>Dancing Plague</em></h1>
  <p class="lede">Strasbourg, July 1518: one woman starts dancing in the street and can't stop. Hundreds join her, and the city's cure is more dancing. Each panel is drawn by the real animation code at that beat's key moment.</p>
  <div class="status" id="status">Drawing panels…</div>
</header>
<main class="grid" id="grid"></main>
<section class="facts">
  <h2>Facts and numbers I assumed</h2>
  <ul>
    <li>It began in July 1518 in Strasbourg with a woman recorded as Frau Troffea, who danced in the street for days.</li>
    <li>About 30 or more people had joined within a week (some sources say 34).</li>
    <li>"Some accounts say 400" by late summer: a chroniclers' figure, not a firm count, so the narration hedges it.</li>
    <li>Physicians blamed "hot blood" and prescribed more dancing; the council opened guild halls, built a stage and hired musicians.</li>
    <li>Reports of many deaths are disputed, so the film only shows dancers collapsing.</li>
    <li>The dancers were taken to a shrine of St. Vitus in the hills near Saverne, and the outbreak faded by September. The cause is still debated.</li>
  </ul>
</section>

<script>/*HARNESS*/</script>
<script>/*DANCE*/</script>
<script>
const BEATS = [
''' + beats + '''
];
'''
(R / 'storyboard.template.html').write_text(head + body + scr)
(R / 'storyboard.html').write_text(fill(head + body + scr))
if (R / 'score.js').exists():
    (R / 'dancing-plague.html').write_text(fill(rd('player.template.html')))
print('built')
