// Guards for the native bundle: no Gumroad, no service worker, no private names.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
const walk = d => readdirSync(d).flatMap(f => statSync(`${d}/${f}`).isDirectory() ? walk(`${d}/${f}`) : [`${d}/${f}`]);
const BLOCKED = new Set(['12d43dfb8a4350bd','1eb21c5181e3975a','46ba1d4239be59c9']);
let bad = [];
for (const f of walk('www').filter(f => /\.(js|html|json|webmanifest|css)$/.test(f))) {
  const s = readFileSync(f, 'utf8');
  if (/gumroad/i.test(s)) bad.push(`${f}: gumroad`);
  if (/serviceWorker\.register/.test(s)) bad.push(`${f}: service worker`);
  // Private names are stored only as hashes so the repo never contains them.
  const words = s.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const grams = new Set([...words, ...words.slice(1).map((w, i) => words[i] + ' ' + w)]);
  for (const g of grams) if (BLOCKED.has(createHash('sha256').update(g).digest('hex').slice(0, 16))) bad.push(`${f}: private name`);
}
for (const f of ['index.html', 'app.js', 'engine.js', 'examples.js', 'present.js', 'render.js', 'land-data.js', 'privacy.html', 'terms.html']) statSync(`www/${f}`);
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log('www checks passed');
