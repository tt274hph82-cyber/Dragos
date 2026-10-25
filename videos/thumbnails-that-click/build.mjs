// Builds compositions/*.html and index.html from src/ and script/timings.json.
// Run: node build.mjs   (re-run after editing anything in src/ or regenerating the voice)
import fs from "node:fs";

const T = JSON.parse(fs.readFileSync("script/timings.json", "utf8"));
const sharedCss = fs.readFileSync("src/shared.css", "utf8");
const sharedJs = fs.readFileSync("src/shared.js", "utf8");
const CARD_LEAD = 2.3; // host starts this long before a chapter's first word
const OVERLAP = 0.45; // previous scene stays under the incoming card wipe
const CARD_OUT = 1.85;
const r3 = (v) => Math.round(v * 1000) / 1000;

const chs = T.chapters;
const starts = chs.map((c, i) => (i === 0 ? 0 : r3(c.beats[0].start - CARD_LEAD)));
const total = r3(T.total);
const sfx = [];
const whooshes = ["whoosh.mp3", "whoosh-short.mp3", "whoosh.mp3"];
const hosts = [];

chs.forEach((ch, i) => {
  const start = starts[i];
  const end = i + 1 < chs.length ? r3(starts[i + 1] + OVERLAP) : total;
  const D = r3(end - start);
  const C = {}, E = {};
  ch.beats.forEach((b) => {
    C[b.id] = r3(b.start - start);
    E[b.id] = r3(b.end - start);
  });
  const src = fs.readFileSync(`src/scenes/${ch.id}.html`, "utf8");
  const style = (src.match(/<style>([\s\S]*?)<\/style>/) || [, ""])[1];
  const script = (src.match(/<script>([\s\S]*?)<\/script>/) || [, ""])[1];
  const sfxDecl = src.match(/<!--SFX([\s\S]*?)-->/);
  const markup = src
    .replace(/<!--SFX[\s\S]*?-->/, "")
    .replace(/<style>[\s\S]*?<\/style>/, "")
    .replace(/<script>[\s\S]*?<\/script>/, "")
    .trim();
  const cardHtml =
    i === 0
      ? ""
      : `<div id="${ch.id}-card" class="card"><div class="num">Lesson ${i}</div><div class="ttl">${ch.title}</div></div>`;
  if (i > 0) sfx.push({ f: whooshes[i % 3], t: start + 0.02, v: 0.5 });
  if (sfxDecl) {
    for (const [f, cue, off = 0, v = 0.6] of JSON.parse(sfxDecl[1])) {
      const local = typeof cue === "number" ? cue : C[cue];
      if (local === undefined) throw new Error(`${ch.id}: unknown sfx cue ${cue}`);
      sfx.push({ f, t: start + local + off, v });
    }
  }
  const html = `<template>
  <style>
${sharedCss}
${style}
  </style>
  <div id="root" data-composition-id="${ch.id}" data-width="1920" data-height="1080">
    ${markup}
    ${cardHtml}
  </div>
  <script>
    (function () {
      const C = ${JSON.stringify(C)};
      const E = ${JSON.stringify(E)};
      const D = ${D};
      const tl = gsap.timeline({ paused: true });
${sharedJs}
      ${i === 0 ? "" : `card(${JSON.stringify(ch.id)}, ${CARD_OUT});`}
${script}
      window.__timelines = window.__timelines || {};
      window.__timelines[${JSON.stringify(ch.id)}] = tl;
    })();
  </script>
</template>
`;
  fs.writeFileSync(`compositions/${ch.id}.html`, html);
  hosts.push(
    `      <div id="${ch.id}" class="clip" data-composition-id="${ch.id}" data-composition-src="compositions/${ch.id}.html" data-start="${start}" data-duration="${D}" data-track-index="${1 + (i % 2)}" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`,
  );
});

const music = fs.existsSync("assets/music/bed.mp3")
  ? `      <audio id="bgm" class="clip" src="assets/music/bed.mp3" data-start="0" data-duration="${total}" data-track-index="11" data-volume="0.13"></audio>\n`
  : "";
const SFX_LEN = JSON.parse(fs.readFileSync("assets/sfx/durations.json", "utf8"));
const laneEnds = [];
const sfxTags = sfx
  .sort((a, b) => a.t - b.t)
  .map((s, k) => {
    const f = s.f.endsWith(".mp3") ? s.f : s.f + ".mp3";
    const d = SFX_LEN[f];
    if (!d) throw new Error("unknown sfx " + f);
    let lane = laneEnds.findIndex((e) => e <= s.t);
    if (lane < 0) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = s.t + d + 0.05;
    return `      <audio id="sfx${k}" class="clip" src="assets/sfx/${f}" data-start="${r3(s.t)}" data-duration="${r3(d)}" data-track-index="${12 + lane}" data-volume="${s.v}"></audio>`;
  })
  .join("\n");

const index = `<!doctype html>
<html lang="en" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #16110e; }
      #main { position: relative; width: 1920px; height: 1080px; overflow: hidden; }
      #ground { position: absolute; inset: 0; background: #3a2a20; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
      <div id="ground"></div>
${hosts.join("\n")}
      <audio id="vo" class="clip" src="assets/voice/voice.mp3" data-start="0" data-duration="${total}" data-track-index="10" data-volume="1"></audio>
${music}${sfxTags}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync("index.html", index);
console.log(`built ${chs.length} scenes, ${sfx.length} sfx, total ${total}s`);
chs.forEach((c, i) => console.log(`  ${c.id.padEnd(7)} start ${starts[i].toFixed(2)}  beats ${c.beats.length}`));
