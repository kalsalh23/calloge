// Probe: Arabic Wikipedia pageimages for the 7 gap universities + better
// Commons searches for weak majors. Prints candidates for manual curation.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { 'User-Agent': 'HilmekUniversityApp/1.0 (Syrian admissions platform)' };

async function arWikiPageImage(title) {
  const url =
    'https://ar.wikipedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent(title) +
    '&prop=pageimages&pithumbsize=1200&format=json&origin=*';
  try {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) return 'HTTP ' + res.status;
    const json = await res.json();
    const pages = json.query && json.query.pages ? json.query.pages : {};
    for (const p of Object.values(pages)) {
      if (p.missing) return 'MISSING';
      if (p.thumbnail && p.thumbnail.source) return p.thumbnail.source;
      return 'no-pageimage';
    }
    return 'none';
  } catch (e) {
    return 'ERR ' + e.message;
  }
}

const COMMONS = 'https://commons.wikimedia.org/w/api.php';
async function commonsSearch(query, n = 8) {
  const url =
    COMMONS +
    '?action=query&generator=search&gsrnamespace=6&gsrsearch=' +
    encodeURIComponent(query) +
    '&gsrlimit=' + n +
    '&prop=imageinfo&iiprop=url|mime&iiurlwidth=1200&format=json&origin=*';
  try {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) return ['HTTP ' + res.status];
    const json = await res.json();
    const pages = json.query && json.query.pages ? json.query.pages : {};
    const list = [];
    for (const p of Object.values(pages)) {
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii) continue;
      const title = (p.title || '').toLowerCase();
      if (!/^image\/(jpeg|png)$/.test(ii.mime || '')) continue;
      if (/\.(svg|gif)$/i.test(ii.url)) continue;
      if (/demo|protest|poster|pamphlet|schematic|tartu|estonia/.test(title)) continue;
      list.push(p.title + '  ||  ' + (ii.thumburl || ii.url).split('?')[0]);
    }
    return list.slice(0, n);
  } catch (e) {
    return ['ERR ' + e.message];
  }
}

(async () => {
  const univs = [
    'جامعة طرطوس',
    'جامعة القلمون الخاصة',
    'جامعة قاسيون الخاصة',
    'الجامعة الدولية للعلوم والتكنولوجيا',
    'جامعة الحواش الخاصة',
    'جامعة الاتحاد الخاصة',
    'جامعة حلب الحرة',
  ];
  console.log('===== ARABIC WIKIPEDIA UNIVERSITIES =====');
  for (const t of univs) {
    const r = await arWikiPageImage(t);
    console.log(t, '=>', typeof r === 'string' && r.startsWith('http') ? r.split('?')[0] : r);
    await sleep(400);
  }

  const majors = [
    ['طب الأسنان', 'dentist patient dental clinic'],
    ['الهندسة المعلوماتية', 'programming computer code laptop'],
    ['تقانة المعلومات', 'computer server data center'],
    ['الهندسة النفطية', 'oil rig offshore platform'],
    ['إدارة الأعمال', 'business skyscrapers city skyline'],
    ['الشريعة الإسلامية', 'mosque minaret'],
    ['العلوم السياسية', 'united nations general assembly'],
    ['الإعلام والاتصال', 'television studio broadcast'],
    ['اللغة الإنجليزية', 'english books library'],
    ['الهندسة المدنية', 'bridge construction crane'],
    ['الفيزياء', ''],
  ];
  console.log('===== COMMONS SEARCH PROBES =====');
  for (const [name, q] of majors) {
    console.log('\n--- ' + name + ' [ ' + q + ' ]');
    const list = await commonsSearch(q);
    list.forEach((l) => console.log('   ' + l.slice(0, 160)));
    await sleep(500);
  }
})();
