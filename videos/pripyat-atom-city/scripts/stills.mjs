// Render preview stills at given frames: node scripts/stills.mjs 120 300 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "Documentary", inputProps: { subtitles: true } });
for (const frame of frames) {
  await renderStill({ composition, serveUrl, frame, output: `out/still-${frame}.jpg`, imageFormat: "jpeg", jpegQuality: 80, inputProps: { subtitles: true } });
  console.log("still", frame);
}
