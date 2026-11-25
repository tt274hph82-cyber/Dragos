// Dumps every camera/sound cue of the current VIDEO as JSON (for scripts/audio.py).
import {TAKES, KICKS, WHIPS, FLASHES} from '@story/takes';
import {SHOT_REAL, WORDS, END_REAL} from '@story/timeline';
const keys: {t: number; move: string; shot: string}[] = [];
for (const tk of TAKES) tk.keys.forEach((k: any, i: number) => { if (i > 0) keys.push({t: k.at ?? k.t, move: k.move ?? k.o?.move ?? 'push', shot: tk.name}); });
console.log(JSON.stringify({shots: SHOT_REAL, keys, kicks: KICKS, whips: WHIPS, flashes: FLASHES, words: WORDS, end: END_REAL}));
