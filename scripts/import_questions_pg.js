#!/usr/bin/env node
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

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

function toRecord(header, cols) {
  const map = {};
  header.forEach((h, i) => {
    const key = h.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    map[key] = cols[i] === undefined ? null : cols[i];
  });
  function parseNullableInt(v) {
    if (!v) return null;
    const m = String(v).match(/-?\d+/);
    if (!m) return null;
    const n = parseInt(m[0], 10);
    return Number.isNaN(n) ? null : n;
  }

  return {
    serial: parseNullableInt(map.Serial),
    A: map.A || null, B: map.B || null, C: map.C || null, D: map.D || null,
    E: map.E || null, F: map.F || null, G: map.G || null, H: map.H || null,
    I: map.I || null, J: map.J || null, K: map.K || null, L: map.L || null,
    M: map.M || null, N: map.N || null, O: map.O || null, P: map.P || null,
    Q: map.Q || null, R: map.R || null, S: map.S || null, T: map.T || null,
    answer: map.ANSWER || map.answer || '',
    complexity: map.Complexity || null,
    length: parseNullableInt(map.Length),
  };
}

(async () => {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const { header, data } = parseCSV(txt);
    const records = data.map(cols => toRecord(header, cols));

    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    // create table if not exists (match Prisma model)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "CoreQuestion" (
        id SERIAL PRIMARY KEY,
        serial INTEGER,
        "A" TEXT, "B" TEXT, "C" TEXT, "D" TEXT, "E" TEXT, "F" TEXT, "G" TEXT, "H" TEXT,
        "I" TEXT, "J" TEXT, "K" TEXT, "L" TEXT, "M" TEXT, "N" TEXT, "O" TEXT, "P" TEXT,
        "Q" TEXT, "R" TEXT, "S" TEXT, "T" TEXT,
        answer TEXT NOT NULL,
        complexity TEXT,
        length INTEGER
      );
    `);

    const batchSize = 500;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = [];
      const placeholders = batch.map((r, idx) => {
        const base = idx * 24;
        values.push(
          r.serial, r.A, r.B, r.C, r.D, r.E, r.F, r.G, r.H,
          r.I, r.J, r.K, r.L, r.M, r.N, r.O, r.P, r.Q, r.R, r.S, r.T,
          r.answer, r.complexity, r.length
        );
        const ph = [];
        for (let j = 1; j <= 24; j++) ph.push(`$${base + j}`);
        return `(${ph.join(',')})`;
      }).join(',');

      // there are 24 columns excluding id
      const sql = `INSERT INTO "CoreQuestion" (serial,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T",answer,complexity,length) VALUES ${placeholders}`;
      await client.query(sql, values);
      console.log(`Inserted ${i + batch.length}/${records.length}`);
    }

    await client.end();
    console.log('Import finished.');
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
})();
