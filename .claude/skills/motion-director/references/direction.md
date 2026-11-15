# Direction: how to make it jaw-dropping, not just correct

Read this BEFORE writing the beat grid. A film can pass every check and still
be boring: correct type over a flat ground, screenshots panned around, one
thing happening every three seconds. The first versions of this skill's test
films did exactly that and were rejected as "boring, slow, nothing
jaw-dropping"; the rebuilt versions below this line were not. The difference
was never polish. It was these decisions, made up front, as numbers.

## 1. Three storylines, then one (write STORYLINES.md)

Sketch five ideas, each a DEVICE paired with a FORM; keep the three that differ
most; make one the bold one you would not have picked first. Recommend one in
a sentence. For each write: the device and form, two sentences of what the
viewer sees and feels, the EXACT first two seconds, the beats in one line, the
look in one line, the sound in one line.

| device | what the viewer sees |
|---|---|
| one object across the system | a single thing (a recording, a prompt, a buyer) travels through every stage of the product |
| the result first | the finished output plays, then the camera pulls back to show where it came from |
| a word that opens worlds | one changing word (a slot, a pill) and each value opens its own scene |
| life before and after | the old way churns, the new way moves calmly, then takes the frame |
| a number lands | a real number earned by a scene, then made physical |
| type carries the argument | giant kinetic type and colour fields cutting on the beat |

| form | what the camera does |
|---|---|
| one continuous camera | never cuts; pushes, dives and travels from one world into the next |
| object-to-object chain | every shot ends on the thing that opens the next (the card becomes the page) |
| endless zoom | dives into a detail that turns out to be the next world |
| flight through one world | stations on a rail or a set, each idea a stop |
| one frame that rebuilds | a single composition keeps rearranging itself |

A pitch where all three are plain cuts between scenes has not tried the forms.

## 2. Adjectives become numbers (write SPEC.md)

```text
GOAL:    what the viewer feels or does at the end, one sentence
OUTPUT:  W x H, fps
TIME:    seconds x fps = frames; BPM, frames per beat; "a new visual event every beat"
LOOK:    ground hex under a silk of <accent> light with <highlight> crests (intensity 0.3, 0.6 on the drop);
         ink hex; accent on ONE word per shot, as light; display face + weight + px + tracking;
         glass: fill a%->b% white, 1px rim 45%, blur 22px, drop 0 40 90 -30 45%, glow accent 35%;
         grain %, vignette %
OBJECTS: every recognisable thing, with the material that makes it read without a label
MOTION:  enter expo.out 0.45-0.9s; camera power2.inOut 0.6s; exits power3.in 0.25s; staggers 60-90ms;
         perspective 1600px, arrivals from z -900; depth of field = 7-10px blur off-focus
SHOTS:   frame ranges, the one hero move per shot, the handoff to the next
BANNED:  the defaults below plus whatever the first render shows
QA:      the frames to check, and what each must show
```

"premium" is a material with numbers. "cinematic" is a lens and a light.
"dynamic" is cuts on the beat and a layout change on the bar.

## 3. The jaw-drop checklist (every film, every item)

1. **A world, not a page.** A moving ground made of the brand's own colours
   (`MD.silk`, intensity 0.3 behind copy, 0.6-1.0 on the drop) under glass
   (`.md-glass`, `.md-glass.is-light` on light brands). Never a flat fill,
   never website screenshots as the picture.
2. **One continuous camera.** Rigs (`.md-rig`) move: fly-ins from depth
   (`MD.fly`), pushes into the thing that matters (`MD.camera`), dives
   through one shot into the next (scale 2.6-3.4 + blur, power3.in), whips.
3. **Something new every beat.** At 96-128 BPM that is every 0.5-0.6s:
   a word lands, a card lands, a bar fills, a highlight steps, the camera
   moves, light sweeps. A still frame over 1s before the end card is a bug.
4. **Real brand material, made physical.** Its client marks as a 3D wall, its
   video thumbnails in a glass player, its product video in a big window
   punched in on the part that moves, its real numbers counted and stamped,
   its own copy as kinetic type. Rebuilt UI only from the brand's own copy
   and tokens; never invented numbers.
5. **The hero fills 40%+ of the frame.** Type 9-21% of frame height for
   hero lines. Small things in a big frame are the "boring" look.
6. **Depth of field.** Whatever is not the subject sits back: 7-10px blur,
   35-55% opacity, in step with the camera.
7. **One signature moment, on the drop.** The music builds to it (riser),
   the ground gets louder, the camera does its biggest move.
8. **Light moves, objects land.** A specular sweep (`MD.sweep`) across a
   pane once when it lands; a landed title is dead still.
9. **Every handoff is clean.** The outgoing beat finishes exactly when the
   incoming one starts; a collapse goes to opacity 0; nothing ghosts.
10. **The end card performs.** The mark lands on the one big hit (scale
    1.7 to 1 from a blur, then a stamp), the wordmark wipes in on the
    shimmer, a real button sweeps; it holds 2-3.5s.

## 4. BANNED (grows with every render)

- website screenshots panned or zoomed as the picture; a title over a dimmed screenshot
- centred text on a plain or gradient ground with nothing else
- small elements floating in a big empty frame; three cards in a row
- everything fading and sliding up; the same ease on everything
- breathing, floating or pulsing loops on titles or UI; slow creeping scales
- an accent colour on an accent ground (red text on red silk disappears)
- stock icons, emoji, lettermarks where a logo belongs, invented numbers
- glass over a flat void (it reads as grey plastic); glow on everything
- letter-spacing, width, top or left tweens (they snap to pixels and judder)
- the logo docked in a corner

After each render, name every default the frames show, add it here for the
film, and fix it before anything else.

## 5. Ready-made HyperFrames blocks worth knowing (tested)

`npx hyperframes catalog --json` lists ~450 blocks. These render reliably on a
laptop and are the fastest route to a 3D or liquid-glass moment; install with
`hyperframes add <name>` into the film, then rewrite their colours, copy and
screen content to the brand (never ship the demo content):

| block | what it is | rendered 1080p |
|---|---|---|
| `vfx-iphone-device` | real GLTF iPhone + MacBook, live HTML on their screens; `device-init.mjs` wraps its models with three presets (macbook, duo, iphone) and the brand's real site on screen | 15s in 26s; a 4s device shot adds ~10-20s to a render |
| `macos-tahoe-liquid-glass` | 3D MacBook with a glass desktop and windows | 15s in 26s |
| `liquid-glass-widgets` | refractive glass cards over a fluid shader | 8s in 17s |
| `glass-hero` | a glass object turning in front of a giant headline | 5s in 7s |
| `glass-shard-title` | glass shards fly in through fog and tile into a headline | |
| `parallax-device-dive` | a phone rises, the camera pushes through its screen into the UI | |

## 6. Prompt patterns that measurably raise quality

1. "Write three storylines that are three different films (device x form), make one the bold one, recommend one."
2. "Write SPEC.md. Wherever you would write an adjective, write a number."
3. "Name every default you used anyway, add it to BANNED, fix it." (Banning a default only moves the model to the next default, so the list keeps growing.)
4. "Name a medium, not a mood: smoked glass panes lit by one red rim over a silk of the brand's red."
5. "Every shot must advance the one task; delete any shot that does not."
6. "One hero move per shot; secondary moves travel 50-70% as far and start 100-200ms later."
7. "Spend the boldness in one place: the signature moment on the drop. Before finishing, remove one accessory."
8. "Critique the frames, not the code: read the dense half-second sheet and describe each frame as a stranger would."
9. Scoped fixes with fixed mappings: "too fast" = slow camera moves to 0.7x and nothing else; "feels like slides" = enter the next scene through an object on screen; "titles move" = land and hold. End every fix with "change nothing else".
