// Focused retry: better queries + robust fetch for bad/missing images.
const fs = require('fs');

const API = 'https://commons.wikimedia.org/w/api.php';
const WIDTH = 1200;
const BLOCK = ['demo', 'protest', 'pro-', 'pro_', 'tartu', 'estonia', 'poster', 'pamphlet', 'schematic', 'blueprint', 'book page', 'map of '];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchImage(query) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const url =
      API +
      '?action=query&generator=search&gsrnamespace=6&gsrsearch=' +
      encodeURIComponent(query) +
      '&gsrlimit=12&prop=imageinfo&iiprop=url|mime&iiurlwidth=' +
      WIDTH +
      '&format=json&origin=*';
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'HilmekUniversityApp/1.0 (contact: dev@hilmek.com)' } });
      if (res.status === 429) { await sleep(2500 * attempt); continue; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const pages = json.query && json.query.pages ? json.query.pages : {};
      for (const p of Object.values(pages)) {
        const title = (p.title || '').toLowerCase();
        const ii = p.imageinfo && p.imageinfo[0];
        if (!ii) continue;
        const mime = ii.mime || '';
        if (mime !== 'image/jpeg' && mime !== 'image/png') continue;
        if (/\.(svg|tif|tiff|gif)$/i.test(ii.url)) continue;
        if (BLOCK.some((b) => title.includes(b))) continue;
        return ii.thumburl || ii.url;
      }
      return null;
    } catch (e) {
      if (attempt === 5) { console.error('FAILED(' + query + '):', e.message); return null; }
      await sleep(1200 * attempt);
    }
  }
  return null;
}

const MAJORS = [
  ['طب الأسنان', 'dentistry dental treatment'],
  ['الصيدلة', 'pharmacist pharmaceutical'],
  ['الهندسة المعلوماتية', 'computer programming code screen'],
  ['تقانة المعلومات', 'laptop network server data'],
  ['الهندسة المدنية', 'construction site workers concrete'],
  ['الهندسة المعمارية', 'modern architecture building glass'],
  ['الهندسة الكهربائية', 'electrical power lines pylons'],
  ['الهندسة الميكانيكية', 'industrial machinery factory gears'],
  ['الهندسة النفطية', 'oil pump petroleum rig'],
  ['هندسة تقانة المعلومات', 'computer circuit motherboard'],
  ['هندسة الميكاترونكس', 'industrial robot arm'],
  ['إدارة الأعمال', 'business meeting conference room'],
  ['المحاسبة', 'accounting finance calculator reports'],
  ['التاريخ', 'ancient ruins roman columns'],
  ['الجغرافيا', 'globe world geography'],
  ['معلم صف', 'school classroom teacher students'],
  ['الشريعة الإسلامية', 'grand mosque islamic architecture'],
  ['الإعلام والاتصال', 'newsroom journalist camera press'],
];

(async () => {
  for (const [name, q] of MAJORS) {
    const url = await searchImage(q);
    console.log(name + ' ==>', url ? url.slice(0, 130) : 'NO IMAGE');
    await sleep(900);
  }
})();
