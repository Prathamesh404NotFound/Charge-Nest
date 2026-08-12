// Tiny bridge: strip src/lib/cities.ts down to slug+active for Node consumers
// (sitemap generator). Run after editing cities.ts.
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../src/lib/cities.ts'), 'utf8');
const cities = [];
const re = /\{\s*slug:\s*"([^"]+)"[^}]*active:\s*(true|false)/g;
let m;
while ((m = re.exec(src)) !== null) cities.push({ slug: m[1], active: m[2] === 'true' });
fs.writeFileSync(path.join(__dirname, '../src/lib/cities.json'), JSON.stringify(cities, null, 1));
console.log(`cities.json synced with ${cities.length} entries`);
