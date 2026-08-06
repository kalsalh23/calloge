// Verifies every cover_url in supabase/images-update.sql resolves (HTTP 200).
// Waits a warm-up, then checks each URL with delays to respect rate limits.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SQL = path.join(__dirname, '..', 'supabase', 'images-update.sql');
const content = fs.readFileSync(SQL, 'utf8');
const urls = [...content.matchAll(/'(https?:\/\/[^']+)'/g)].map((m) => m[1]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('waiting 120s warm-up for rate-limit window...');
  await sleep(120000);
  let ok = 0, bad = 0, limited = 0;
  for (const u of urls) {
    let status = '?';
    try {
      const out = execFileSync(
        'curl.exe',
        ['-s', '-o', 'NUL', '-w', '%{http_code}', '--max-time', '20', u],
        { encoding: 'utf8' }
      ).trim();
      status = out;
    } catch (e) {
      status = 'ERR';
    }
    if (status === '200') ok++;
    else if (status === '429') limited++;
    else bad++;
    if (status !== '200') {
      console.log(`${status}  ${u}`);
    }
    await sleep(2500);
  }
  console.log(`\nDONE  ok=${ok} bad=${bad} rateLimited=${limited} total=${urls.length}`);
})();
