// Render emu-war.html to MP4: seek every frame at 30 fps, pipe the canvas into ffmpeg, render the score offline
// with SOUND.renderOffline and mux it in.  node render.js <html> <out.mp4>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
(async () => {
  const [html, out] = process.argv.slice(2);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 800, height: 1400 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + require('path').resolve(html));
  await pg.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  // audio first
  const wav = out.replace(/\.mp4$/, '.wav');
  const aud = await pg.evaluate(async () => {
    const r = await SOUND.renderOffline(window.scoreSound, window.DURATION, 48000, { voiceover: false });
    const n = r.inter.length, i16 = new Int16Array(n), norm = r.peak > 0.98 ? 0.98 / r.peak : 1;
    for (let i = 0; i < n; i++) i16[i] = Math.max(-32767, Math.min(32767, Math.round(r.inter[i] * norm * 32767)));
    let s = ''; const u8 = new Uint8Array(i16.buffer); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return { b64: btoa(s), peak: r.peak, frames: r.frames };
  });
  const pcm = Buffer.from(aud.b64, 'base64'), hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
  hdr.writeUInt32LE(48000, 24); hdr.writeUInt32LE(48000 * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(wav, Buffer.concat([hdr, pcm]));
  console.log('audio peak', aud.peak.toFixed(3));
  // frames
  const N = Math.round((await pg.evaluate(() => window.DURATION)) * 30);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-i', wav, '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-vf', 'scale=1080:1920:flags=lanczos', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const data = await pg.evaluate((tt) => { window.seek(tt); return document.getElementById('screen').toDataURL('image/jpeg', 0.95).split(',')[1]; }, i / 30);
    if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 120 === 0) console.log(`frame ${i}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('done', out, 'errors:', errs.slice(0, 3));
  await b.close();
})();
