require('dotenv').config();
const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const r1 = await pool.query('SELECT COUNT(*) AS cnt FROM "CoreQuestion" WHERE complexity = $1 AND length = $2', [3, 3]);
    console.log('count where complexity=3 and length=3 ->', r1.rows[0].cnt);
    const r2 = await pool.query('SELECT COUNT(*) AS cnt FROM "CoreQuestion" WHERE complexity_text = $1 AND length = $2', ['Junior +3', 3]);
    console.log('count where complexity_text="Junior +3" and length=3 ->', r2.rows[0].cnt);
    const r3 = await pool.query('SELECT COUNT(*) AS cnt FROM "CoreQuestion" WHERE complexity_text ILIKE $1 AND length = $2', ['%3%', 3]);
    console.log('count where complexity_text ILIKE "%3%" and length=3 ->', r3.rows[0].cnt);
    const r4 = await pool.query('SELECT complexity, complexity_text, length, serial FROM "CoreQuestion" WHERE length = $1 LIMIT 10', [3]);
    console.log('sample rows (length=3):', r4.rows.slice(0,10));
      const r5 = await pool.query('SELECT COUNT(*) AS cnt, MIN(length) as minlen, MAX(length) as maxlen FROM "CoreQuestion" WHERE complexity_text = $1', ['Junior +3']);
      console.log('stats for complexity_text="Junior +3":', r5.rows[0]);
      const r6 = await pool.query('SELECT complexity, complexity_text, length, serial FROM "CoreQuestion" WHERE complexity_text = $1 LIMIT 20', ['Junior +3']);
      console.log('sample rows for Junior +3:', r6.rows.slice(0,20));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();