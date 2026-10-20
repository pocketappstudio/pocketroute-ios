// Bundles the PocketRoute PWA for the native shell. Source: ../plan-bot/app (or $POCKETROUTE_SRC; CI uses ./web).
// Native build = paid-upfront App Store app: everything unlocked, no Gumroad gate or purchase links, no service worker.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const src = process.env.POCKETROUTE_SRC || (existsSync('web') ? 'web' : '../plan-bot/app');
const out = 'www';
rmSync(out, { recursive: true, force: true }); mkdirSync(out);
cpSync(src, out, { recursive: true, filter: f => !/(^|\/)(sw\.js|\.git)$/.test(f) });
const edit = (f, pairs) => { let s = readFileSync(`${out}/${f}`, 'utf8');
  for (const [a, b] of pairs) { if (!(typeof a === 'string' ? s.includes(a) : a.test(s))) throw new Error(`${f}: pattern not found: ${a}`); s = s.replace(a, b); }
  writeFileSync(`${out}/${f}`, s); };
edit('app.js', [
  [/const GUMROAD_PRODUCT_ID='.*?';/, "const GUMROAD_PRODUCT_ID='';"],
  [/const GUMROAD_URL='.*?';.*\n/, "const GUMROAD_URL='';\n"],
  ["ok(){return localStorage.getItem('itp-unlocked')==='1'}", 'ok(){return true}'],
  [/\n <button class="tile" data-go="unlock">.*?<\/button>/, ''],
  [/\/\/ === Store config.*\n/, ''],
  [/try\{const r=await fetch\('https:\/\/api\.gumroad\.com[^']*'/, "try{const r=await fetch('about:blank'"],
  ['From your Gumroad receipt', 'License key'],
  [/if\('serviceWorker' in navigator\)navigator\.serviceWorker\.register\('sw\.js'\)\.catch\(\(\)=>\{\}\);/, ''],
]);
writeFileSync(`${out}/app.js`, readFileSync(`${out}/app.js`, 'utf8').replaceAll('GUMROAD_', 'STORE_'));
edit('privacy.html', [
  [/<h2>Purchases<\/h2><p>.*?<\/p>/, '<h2>Purchases</h2><p>PocketRoute is a one-time purchase through the App Store. Apple processes the payment under its own privacy policy. We do not receive your payment details.</p>'],
  [/<h2>Hosting<\/h2><p>.*?<\/p>/, '<h2>Hosting</h2><p>The app runs from files inside the app on your device. It does not send your plans anywhere.</p>'],
  [/<h2>Questions<\/h2><p>.*?<\/p>/, '<h2>Questions</h2><p>Use the support link on the App Store page.</p>'],
]);
edit('terms.html', [[/<h2>Refunds and support<\/h2><p>.*?<\/p>/, '<h2>Refunds and support</h2><p>Refunds for App Store purchases are handled by Apple. Support is available through the support link on the App Store page.</p>']]);
console.log('www ready from', src);
