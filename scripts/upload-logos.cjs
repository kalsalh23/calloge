// Downloads the 5 missing university logos from official sites and uploads
// them to Supabase Storage (public bucket) for stable hotlinking.
const fs = require('fs');
const path = require('path');

const KEYS = JSON.parse(
  fs.readFileSync(path.join(process.env.TEMP || '', 'opencode', 'supabase-keys.json'), 'utf8').replace(/^\uFEFF/, '')
);
const REF = 'smpumryithpdeipkdtap';
const SR = KEYS.service_role;
const BUCKET = 'university-images';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LOGOS = [
  {
    slug: 'qalamoun-private',
    name: 'qalamoun-logo.png',
    url: 'http://www.uok.edu.sy/wp-content/uploads/2018/11/Logo.png',
  },
  {
    slug: 'qasioun-private',
    name: 'qasioun-logo.png',
    url: 'https://qpu.edu.sy/images/logo-wide.png',
  },
  {
    slug: 'iust',
    name: 'iust-logo.png',
    url: 'https://iust.edu.sy/wp-content/uploads/2023/05/IUST-logo-3.png',
  },
  {
    slug: 'hawash-private',
    name: 'hawash-logo.png',
    url: 'https://hpu.edu.sy/wp-content/uploads/2024/01/logo1.png',
  },
  {
    slug: 'ittihad-private',
    name: 'ittihad-logo.gif',
    url: 'https://www.ipu.edu.sy/photo/logo/logo1.gif',
  },
];

async function ensureBucket() {
  const res = await fetch(`https://${REF}.supabase.co/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      apikey: SR,
      Authorization: 'Bearer ' + SR,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  const text = await res.text();
  console.log('create bucket:', res.status, text.slice(0, 200));
}

async function upload(name, buf, mime) {
  const res = await fetch(`https://${REF}.supabase.co/storage/v1/object/${BUCKET}/${name}`, {
    method: 'POST',
    headers: {
      apikey: SR,
      Authorization: 'Bearer ' + SR,
      'Content-Type': mime,
    },
    body: buf,
  });
  const text = await res.text();
  if (!res.ok) {
    console.log('upload FAIL', name, res.status, text.slice(0, 300));
    return null;
  }
  const publicUrl = `https://${REF}.supabase.co/storage/v1/object/public/${BUCKET}/${name}`;
  console.log('uploaded', name, res.status, '->', publicUrl);
  return publicUrl;
}

(async () => {
  await ensureBucket();
  await sleep(800);
  const out = [];
  for (const l of LOGOS) {
    try {
      const res = await fetch(l.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        console.log('download FAIL', l.slug, res.status);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = (res.headers.get('content-type') || 'image/png').split(';')[0];
      console.log('downloaded', l.slug, buf.length, 'bytes', mime);
      const url = await upload(l.name, buf, mime);
      if (url) out.push(`update public.universities set cover_url = '${url}' where slug = '${l.slug}';`);
      await sleep(500);
    } catch (e) {
      console.log('ERR', l.slug, e.message);
    }
  }
  const f = path.join(__dirname, '..', 'supabase', 'logos-update.sql');
  fs.writeFileSync(f, out.join('\n') + '\n', 'utf8');
  console.log('\nWrote logos-update.sql with', out.length, 'lines');
})();
