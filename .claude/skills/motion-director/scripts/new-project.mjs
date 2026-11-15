#!/usr/bin/env node
// Create a motion-director project folder.
//
//   node new-project.mjs "<title>" --format 16:9 [--dir <path>] [--remotion <existing remotion project>]
//
// Layout it creates (the film itself is added by film-init.mjs once the brand
// and the beat grid exist):
//   project.json  brief.md  log.json
//   brand/  ref/  sound/  critique/  out/
import fs from "node:fs";
import path from "node:path";
import { FORMATS, HF_VERSION, HOME, die, logEvent, slugify, writeJSON } from "./lib.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const title = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
if (!title) die('usage: new-project.mjs "<title>" --format 16:9|9:16|1:1 [--dir path] [--remotion path]');

const format = opt("--format", "16:9");
if (!FORMATS[format]) die(`--format must be one of ${Object.keys(FORMATS).join(", ")}`);
const slug = slugify(title);
const dir = path.resolve(opt("--dir", path.join(HOME, "projects", slug)).replace(/^~/, process.env.HOME));
if (fs.existsSync(path.join(dir, "project.json"))) die(`${dir} already holds a project. Pick another --dir, or continue that one.`);

// Remotion is a FALLBACK, used only when the user already has a working
// Remotion project. It is never installed by this skill.
const remotion = opt("--remotion");
if (remotion) {
  const pkg = path.join(path.resolve(remotion), "package.json");
  if (!fs.existsSync(pkg) || !/"remotion"/.test(fs.readFileSync(pkg, "utf8")))
    die(`--remotion ${remotion} is not an existing Remotion project (no "remotion" dependency in package.json)`);
}

for (const d of ["brand", "ref", "sound", "critique", "out"]) fs.mkdirSync(path.join(dir, d), { recursive: true });
const { w, h } = FORMATS[format];
writeJSON(path.join(dir, "project.json"), {
  title, slug, format, width: w, height: h, fps: 30,
  renderer: remotion ? "remotion" : "hyperframes",
  remotionProject: remotion ? path.resolve(remotion) : null,
  hyperframes: HF_VERSION,
  brand: null,
  created: new Date().toISOString(),
});
fs.writeFileSync(path.join(dir, "brief.md"), `# ${title}

<!-- The interview, answered. Keep each answer to a line. -->

- **For:**
- **Length:**
- **Format:** ${format} (${w}x${h})
- **Vibe:**
- **Signature moment:**
- **Source:**
`);
writeJSON(path.join(dir, "log.json"), { events: [] });
logEvent(dir, { phase: "new-project", secs: 0, note: `${format} ${w}x${h}, renderer ${remotion ? "remotion" : "hyperframes"}` });
console.log(dir);
