// Generate narration, sound effects and music with the ElevenLabs API.
//
//   ELEVENLABS_API_KEY=... node scripts/elevenlabs_audio.mjs [narration] [sfx] [music]
//
// With no arguments it generates all three. Optional env vars:
//   ELEVENLABS_VOICE_ID  narrator voice (default: George, a warm documentary voice)
//   ELEVENLABS_MODEL_ID  TTS model (default: newest "v4" model on the account, else eleven_v3)
//
// It writes public/narration/*.mp3, public/sfx/*.mp3 and public/music/*.mp3,
// then updates src/narration.json (durations) and src/audio.json (what the video plays).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Missing ELEVENLABS_API_KEY");
  process.exit(1);
}
const VOICE = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
const API = "https://api.elevenlabs.io/v1";

// Pick the TTS model: explicit env var, else a "v4" model, else eleven_v3, else multilingual v2.
async function pickModel() {
  if (process.env.ELEVENLABS_MODEL_ID) return process.env.ELEVENLABS_MODEL_ID;
  const res = await fetch(`${API}/models`, { headers: { "xi-api-key": KEY } });
  if (!res.ok) { console.log(`Cannot list models (${res.status}); using eleven_v4`); return "eleven_v4"; }
  const ids = (await res.json()).filter((m) => m.can_do_text_to_speech !== false).map((m) => m.model_id);
  console.log("Available TTS models:", ids.join(", "));
  return ids.find((id) => /v4/i.test(id)) || ids.find((id) => id === "eleven_v3") || "eleven_multilingual_v2";
}
const MODEL = await pickModel();
// v3+ models don't take previous/next text or a speed setting, and use coarse stability steps.
const EXPRESSIVE = /v3|v4/i.test(MODEL);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const P = (...p) => path.join(root, ...p);
const want = new Set(process.argv.slice(2).length ? process.argv.slice(2) : ["narration", "sfx", "music"]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function post(url, body, outFile) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
      return;
    }
    const msg = await res.text();
    if (res.status === 429 || res.status >= 500) {
      console.warn(`  ${res.status}, retrying (${attempt}/5)…`);
      await sleep(4000 * attempt);
      continue;
    }
    throw new Error(`${res.status} ${url}: ${msg.slice(0, 400)}`);
  }
  throw new Error(`Gave up on ${url}`);
}

function duration(file) {
  const out = execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { cwd: root });
  return Math.round(parseFloat(out.toString().trim()) * 1000) / 1000;
}

const segments = JSON.parse(fs.readFileSync(P("src/segments.json"), "utf8"));
const audioCfgPath = P("src/audio.json");
const audioCfg = JSON.parse(fs.readFileSync(audioCfgPath, "utf8"));

/* ---------------- Narration ---------------- */
if (want.has("narration")) {
  console.log(`Narration: voice ${VOICE}, model ${MODEL}`);
  const spoken = segments.filter((s) => s.text);
  const durations = {};
  for (let i = 0; i < spoken.length; i++) {
    const s = spoken[i];
    const out = P("public/narration", `${s.id}.mp3`);
    await post(`${API}/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      text: s.say || s.text,
      model_id: MODEL,
      ...(EXPRESSIVE ? {} : {
        previous_text: spoken[i - 1] ? spoken[i - 1].say || spoken[i - 1].text : undefined,
        next_text: spoken[i + 1] ? spoken[i + 1].say || spoken[i + 1].text : undefined,
      }),
      voice_settings: EXPRESSIVE
        ? { stability: 0.5, similarity_boost: 0.8, use_speaker_boost: true }
        : { stability: 0.55, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true, speed: 0.95 },
    }, out);
    durations[s.id] = duration(out);
    console.log(`  ${s.id} ${durations[s.id]}s`);
  }
  fs.writeFileSync(P("src/narration.json"), JSON.stringify(durations, null, 1));
  audioCfg.narrationExt = "mp3";
}

/* ---------------- Sound effects ---------------- */
// Each effect is generated once and can be placed at several segments.
const SFX = [
  { id: "wind", text: "Cold wind blowing through an abandoned concrete city, distant crows, eerie empty ambience", secs: 22, at: [["s01", 0, 0.22], ["s06", 0, 0.22], ["s42", 0, 0.25], ["s60", 0, 0.22], ["s63", 0, 0.2]] },
  { id: "ferris", text: "Slow metallic creak of a rusty abandoned Ferris wheel swaying in the wind", secs: 8, at: [["s04", 0.3, 0.35], ["title", 0.5, 0.3], ["s64", 0.5, 0.4]] },
  { id: "boom", text: "Deep cinematic boom impact with a long dark reverb tail", secs: 5, at: [["title", 0, 0.55], ["c4", 0, 0.5]] },
  { id: "whoosh", text: "Soft cinematic whoosh transition, airy, subtle", secs: 2, at: [["c1", 0, 0.35], ["c2", 0, 0.35], ["c3", 0, 0.35], ["c5", 0, 0.35], ["c6", 0, 0.35], ["c7", 0, 0.35], ["c8", 0, 0.35], ["c9", 0, 0.35]] },
  { id: "typewriter", text: "Vintage typewriter keys typing quickly, then a carriage bell", secs: 3, at: [["s12", 0.2, 0.35], ["s46", 0.2, 0.35]] },
  { id: "drafting", text: "Pencil drawing straight lines on paper with a ruler, architect drafting table", secs: 6, at: [["s14", 0, 0.35]] },
  { id: "construction", text: "1970s construction site ambience, cranes, distant hammering, concrete mixers", secs: 8, at: [["s11", 0, 0.25]] },
  { id: "children", text: "Distant children playing and laughing in a schoolyard, nostalgic, summer", secs: 10, at: [["s28", 0, 0.18], ["s29", 0, 0.15]] },
  { id: "geiger", text: "Geiger counter clicking irregularly, slowly getting faster", secs: 10, at: [["s33", 0.5, 0.3], ["s35", 0, 0.25]] },
  { id: "explosion", text: "Distant muffled explosion at night, low rumble rolling across a forest", secs: 6, at: [["s34", 1.2, 0.5]] },
  { id: "clock", text: "Old wall clock ticking in a silent empty room", secs: 8, at: [["s36", 0, 0.2]] },
  { id: "radio", text: "Old Soviet radio static and crackle, tuning between stations", secs: 6, at: [["s39", 0, 0.3]] },
  { id: "buses", text: "Many diesel buses idling then driving away down a street, engine rumble", secs: 12, at: [["s41", 0, 0.3]] },
  { id: "door", text: "An apartment door slowly closing and a key turning in the lock, echoing stairwell", secs: 4, at: [["s44", 0.8, 0.35]] },
];

if (want.has("sfx")) {
  console.log("Sound effects");
  audioCfg.sfx = [];
  for (const fx of SFX) {
    const out = P("public/sfx", `${fx.id}.mp3`);
    await post(`${API}/sound-generation?output_format=mp3_44100_128`, { text: fx.text, duration_seconds: fx.secs, prompt_influence: 0.4 }, out);
    console.log(`  ${fx.id}`);
    for (const [segment, offset, volume] of fx.at) audioCfg.sfx.push({ file: `sfx/${fx.id}.mp3`, segment, offset, volume });
  }
}

/* ---------------- Music ---------------- */
// One cue per act, timed from the (possibly new) narration durations.
function segmentStarts() {
  const nar = JSON.parse(fs.readFileSync(P("src/narration.json"), "utf8"));
  let t = 0;
  const starts = {};
  for (const s of segments) {
    starts[s.id] = t;
    t += s.fixed ?? 0.35 + (nar[s.id] ?? 0) + (s.pause ?? 0.55);
  }
  return { starts, total: t };
}
const ACTS = [
  { id: "act1", from: "s01", prompt: "Melancholic cinematic documentary underscore, slow solo piano with soft strings and warm analog pads, nostalgic, 1970s Soviet Ukraine, gentle, no drums, no vocals, sits under narration" },
  { id: "act2", from: "c4", prompt: "Tense dark documentary underscore, low pulsing synth drone, sparse ominous piano notes, distant deep percussion, slow building dread, no vocals, sits under narration" },
  { id: "act3", from: "c6", prompt: "Reflective bittersweet documentary underscore, sparse piano, cello and ambient pads, hopeful but sad, slow, no drums, no vocals, sits under narration" },
];

if (want.has("music")) {
  console.log("Music");
  const { starts, total } = segmentStarts();
  audioCfg.music = [];
  for (let i = 0; i < ACTS.length; i++) {
    const a = ACTS[i];
    const from = starts[a.from];
    const to = i + 1 < ACTS.length ? starts[ACTS[i + 1].from] + 3 : total;
    let len = Math.min(300, Math.ceil(to - from + 2)); // API maximum is 5 minutes per cue
    const out = P("public/music", `${a.id}.mp3`);
    await post(`${API}/music?output_format=mp3_44100_128`, { prompt: a.prompt, music_length_ms: len * 1000, model_id: "music_v1" }, out);
    console.log(`  ${a.id} ${len}s`);
    audioCfg.music.push({ file: `music/${a.id}.mp3`, segment: a.from, until: ACTS[i + 1]?.from ?? null, volume: 0.22 });
  }
}

fs.writeFileSync(audioCfgPath, JSON.stringify(audioCfg, null, 1));
console.log("Done. Updated src/audio.json");
