// Check frames. node stills.js beats  -> one still per beat (1.2 s after arrival) + a contact sheet
//               node stills.js seq <from> <to> <step>  -> a run of frames to judge a camera move;  node stills.js at 12.3 40
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
(async () => {
  const [mode, ...a] = process.argv.slice(2); const s = mode === 'at' ? 0.5 : 0.25;
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const pg = await b.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.resolve('index.html') + '?s=' + s); await pg.waitForFunction(() => window.__ready === true, null, { timeout: 120000 }).catch(() => {});
  if (errs.length) { console.log(errs); process.exit(1); }
  const dir = 'out/' + mode; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  let ts; if (mode === 'beats') ts = await pg.evaluate(() => window.HEROS); else if (mode === 'seq') { ts = []; for (let t = +a[0]; t <= +a[1]; t += +a[2]) ts.push(t); } else ts = a.map(Number);
  for (let i = 0; i < ts.length; i++) { const d = await pg.evaluate((t) => { window.seek(t); return document.getElementById('screen').toDataURL('image/jpeg', 0.9).split(',')[1]; }, ts[i]); fs.writeFileSync(`${dir}/${String(i).padStart(3, '0')}_${ts[i].toFixed(2)}.jpg`, Buffer.from(d, 'base64')); }
  if (mode !== 'at') execSync(`ffmpeg -y -v error -pattern_type glob -i '${dir}/*.jpg' -vf "scale=640:-1,tile=3x${Math.ceil(ts.length / 3)}:padding=6" -frames:v 1 ${dir}.jpg`);
  console.log('ok', ts.length, errs); await b.close();
})();
