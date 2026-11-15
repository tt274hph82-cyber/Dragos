// Dump the sound cues (times come from the film's own timeline). node cues.js -> cues.json
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const pg = await b.newPage(); await pg.goto('file://' + path.resolve('index.html') + '?s=0.1'); await pg.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const c = await pg.evaluate(() => ({ total: window.DURATION, cues: window.CUES })); fs.writeFileSync('cues.json', JSON.stringify(c, null, 1)); console.log(c.cues.length, 'cues'); await b.close(); })();
