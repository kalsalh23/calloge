const fs = require('fs');
(async () => {
  const arg = process.argv[2];
  let sql = fs.existsSync(arg) ? fs.readFileSync(arg, 'utf8') : arg;
  sql = sql.replace(/^\uFEFF/, '');
  const res = await fetch('https://api.supabase.com/v1/projects/' + process.env.PROJECT_REF + '/database/query', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.SUPABASE_ACCESS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text.slice(0, 3000));
})();
