// Coastlines and borders for the desk map, from Natural Earth (world-atlas, 50m). node build-map.js -> map-data.js
const topo = require('topojson-client'), fs = require('fs');
const w = require('world-atlas/countries-50m.json');
const B = [-9, 38, 22, 54];
const inB = (r) => r.some(([x, y]) => x > B[0] && x < B[2] && y > B[1] && y < B[3]);
const rnd = (r) => r.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);
const out = { land: [], france: [], italy: [], borders: [] };
for (const f of topo.feature(w, w.objects.countries).features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const p of polys) {
    if (!inB(p[0])) continue;
    out.land.push(rnd(p[0]));
    if (f.properties.name === 'France' && p[0].length > 200) out.france.push(rnd(p[0]));
    if (f.properties.name === 'Italy' && p[0].length > 200) out.italy.push(rnd(p[0]));
  }
}
const mesh = topo.mesh(w, w.objects.countries, (a, b) => a !== b);
for (const l of mesh.coordinates) if (inB(l)) out.borders.push(rnd(l));
fs.writeFileSync('map-data.js', 'window.MAP = ' + JSON.stringify(out) + ';\n');
console.log(out.land.length, out.france.map(r => r.length), out.italy.map(r => r.length), out.borders.length, fs.statSync('map-data.js').size);
