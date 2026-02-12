#!/usr/bin/env node
const fs = require('fs');
const { Client } = require('pg');

const filePath = process.argv[2] || '/Users/altafhassan/Downloads/Question DB.csv';
const dbUrl = process.env.DATABASE_URL || process.argv[3];
if (!dbUrl) {
  console.error('Please provide DATABASE_URL via env or as 2nd arg.');
  process.exit(1);
}

function parseCSV(txt) {
  const lines = txt.split(/\r?\n/).filter(Boolean);
  const headerIdx = lines.findIndex((l) => /Serial/i.test(l) && /ANSWER/i.test(l));
  const header = lines[headerIdx].split(',').map(h => h.trim());
  const data = lines.slice(headerIdx + 1).map(line => line.split(',').map(c => (c === '' ? null : c.trim())));
  return { header, data };
}

function toMap(header, cols) {
  const map = {};
  header.forEach((h, i) => {
    const key = h.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    map[key] = cols[i] === undefined ? null : cols[i];
  });
  return map;
}

(async () => {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const { header, data } = parseCSV(txt);
    const maps = data.map(cols => toMap(header, cols));

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    // add column if missing
    await client.query(`ALTER TABLE "CoreQuestion" ADD COLUMN IF NOT EXISTS complexity_text TEXT;`);

    // prepare updates by serial
    const batchSize = 500;
    for (let i = 0; i < maps.length; i += batchSize) {
      const batch = maps.slice(i, i + batchSize);
      function parseNullableInt(v) {
        if (v === undefined || v === null) return null;
        const s = String(v).trim();
        if (s === '') return null;
        const m = s.match(/-?\d+/);
        if (!m) return null;
        const n = parseInt(m[0], 10);
        return Number.isNaN(n) ? null : n;
      }

      const updates = [];
      for (const m of batch) {
        const serialRaw = m.Serial || m.serial;
        const serialNum = parseNullableInt(serialRaw);
        const complexityStr = (m.Complexity || m.complexity || '').trim();
        const complexityInt = parseNullableInt(complexityStr);
        if (serialNum === null) continue;
        updates.push({ serial: serialNum, complexityStr, complexityInt });
      }
      // perform updates in a transaction
      await client.query('BEGIN');
      for (const u of updates) {
        await client.query('UPDATE "CoreQuestion" SET complexity_text = $1, complexity = $2 WHERE serial = $3', [u.complexityStr, u.complexityInt, u.serial]);
      }
      await client.query('COMMIT');
      console.log(`Updated ${Math.min(i + batch.length, maps.length)}/${maps.length}`);
    }

    await client.end();
    console.log('Backfill finished.');
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
})();
