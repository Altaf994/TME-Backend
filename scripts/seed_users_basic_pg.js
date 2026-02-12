#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const students = parseInt(process.env.SEED_STUDENTS || '20', 10);
const section = process.env.SEED_SECTION || 'A';
const createTeacher = (process.env.SEED_TEACHER || 'true').toLowerCase() !== 'false';

async function upsertUser(pool, { username, email, firstName, lastName, password, role, section }) {
  const exists = await pool.query('SELECT id FROM "User" WHERE username=$1 LIMIT 1', [username]);
  if (exists.rowCount) return exists.rows[0].id;

  const hash = await bcrypt.hash(password, 10);
  const ins = await pool.query(
    'INSERT INTO "User" (username, email, "firstName", "lastName", password, role, section, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING id',
    [username, email, firstName, lastName, hash, role, section]
  );
  return ins.rows[0].id;
}

(async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  try {
    if (createTeacher) {
      await upsertUser(pool, {
        username: 'teacher_1',
        email: 'teacher1@example.com',
        firstName: 'Teacher',
        lastName: 'One',
        teacherId: 'T001',
        password: 'Teacher@123',
        role: 'teacher',
        section: null
      });
    }

    for (let i = 1; i <= students; i++) {
      await upsertUser(pool, {
        username: `student_${i}`,
        email: `student${i}@example.com`,
        firstName: 'Student',
        lastName: String(i).padStart(2, '0'),
        password: `Student${i}@123`,
        role: 'student',
        section
      });
    }

    console.log(`Seeded users OK (students=${students}, section=${section}, teacher=${createTeacher})`);
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
