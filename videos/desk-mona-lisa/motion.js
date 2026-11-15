// Camera check: screen-space speed per frame (px at 4K). Flags dead stops and sudden jumps in speed.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const pg = await b.newPage(); await pg.goto('file://' + path.resolve('index.html') + '?s=0.1'); await pg.waitForFunction(() => window.__ready === true);
  const v = await pg.evaluate(() => { const out = []; for (let f = 0; f < window.DURATION * 30; f++) { const a = camAt(f / 30), c = camAt((f + 1) / 30); out.push(Math.hypot(c.x - a.x, c.y - a.y) * a.z + Math.abs(Math.log(c.z / a.z)) * 1920); } return out; });
  let stops = 0, jerk = [], mx = 0; for (let i = 1; i < v.length; i++) { if (v[i] < 0.15) stops++; mx = Math.max(mx, v[i]); const d = Math.abs(v[i] - v[i - 1]); if (d > 12) jerk.push([(i / 30).toFixed(2), v[i - 1].toFixed(0), v[i].toFixed(0)]); }
  console.log('frames', v.length, 'near-still frames', stops, 'max px/frame', mx.toFixed(0), 'jumps >12px/frame²:', jerk.length, JSON.stringify(jerk.slice(0, 30))); await b.close(); })();
