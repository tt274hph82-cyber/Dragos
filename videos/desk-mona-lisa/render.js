// Render the film: every frame is drawn in the page at 3840x1646 and piped into ffmpeg with audio/mix.wav.
// node render.js <out.mp4> [fromFrame toFrame]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path');
(async () => {
  const [out, f0 = 0, f1] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const pg = await b.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + path.resolve('index.html')); await pg.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  const N = f1 ? +f1 : Math.round((await pg.evaluate(() => window.DURATION)) * 30);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-i', 'audio/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-maxrate', '10M', '-bufsize', '20M', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = +f0; i < N; i++) {
    const d = await pg.evaluate((t) => { window.seek(t); return document.getElementById('screen').toDataURL('image/jpeg', 0.95).split(',')[1]; }, i / 30);
    if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('done', out, errs.slice(0, 3)); await b.close();
})();
