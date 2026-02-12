#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { getPrismaClient } = require('../src/prisma');

const filePath = process.argv[2] || '/Users/altafhassan/Downloads/Question DB.csv';

(async () => {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const lines = txt.split(/\r?\n/).filter(Boolean);

    // find header line (contains Serial and ANSWER)
    let headerIdx = lines.findIndex((l) => /Serial/i.test(l) && /ANSWER/i.test(l));
    if (headerIdx === -1) headerIdx = 0;
    const header = lines[headerIdx].split(',').map((h) => h.trim());
    const dataLines = lines.slice(headerIdx + 1);

    const rows = dataLines.map((line) => {
      const cols = line.split(',');
      const obj = {};
      header.forEach((h, i) => {
        const key = h.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        let val = cols[i] === undefined ? '' : cols[i].trim();
        if (val === '') val = null;
        obj[key] = val;
      });
      return obj;
    }).filter(r => r.Serial || r.serial);

    const records = rows.map((r) => {
      const serialStr = r.Serial || r.serial || null;
      const serial = serialStr ? (String(serialStr).match(/-?\d+/) ? parseInt(String(serialStr).match(/-?\d+/)[0], 10) : null) : null;
      const ans = r.ANSWER || r.answer || r.Answer || null;
      const complexity = r.Complexity || r.complexity || null;
      const lengthStr = r.Length || r.length || null;
      const length = lengthStr ? parseInt(lengthStr, 10) : null;

      return {
        serial: serial,
        A: r.A || null,
        B: r.B || null,
        C: r.C || null,
        D: r.D || null,
        E: r.E || null,
        F: r.F || null,
        G: r.G || null,
        H: r.H || null,
        I: r.I || null,
        J: r.J || null,
        K: r.K || null,
        L: r.L || null,
        M: r.M || null,
        N: r.N || null,
        O: r.O || null,
        P: r.P || null,
        Q: r.Q || null,
        R: r.R || null,
        S: r.S || null,
        T: r.T || null,
        answer: ans || '',
        complexity: complexity,
        length: length,
      };
    });

    const prisma = await getPrismaClient();
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await prisma.coreQuestion.createMany({ data: batch });
      console.log(`Inserted ${i + batch.length}/${records.length}`);
    }

    console.log('Import finished.');
    await prisma.$disconnect();
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
})();
