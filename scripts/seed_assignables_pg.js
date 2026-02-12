require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    // Create class if not exists
    const clsRes = await pool.query("SELECT id FROM \"Class\" WHERE name=$1 AND section=$2 LIMIT 1", ['Grade 1', 'A']);
    let classId;
    if (clsRes.rowCount) classId = clsRes.rows[0].id;
    else {
      const ins = await pool.query('INSERT INTO "Class" (name, section, "createdAt", "updatedAt") VALUES ($1,$2,NOW(),NOW()) RETURNING id', ['Grade 1', 'A']);
      classId = ins.rows[0].id;
    }

    for (let i = 1; i <= 20; i++) {
      const username = `student_${i}`;
      const email = `student${i}@example.com`;
      const firstName = 'Student';
      const lastName = String(i).padStart(2, '0');
      const password = `Student${i}@123`;

      // Skip if exists
      const exists = await pool.query('SELECT id FROM "User" WHERE username=$1 LIMIT 1', [username]);
      let userId;
      if (exists.rowCount) {
        userId = exists.rows[0].id;
      } else {
        const hash = await bcrypt.hash(password, 10);
        const ins = await pool.query('INSERT INTO "User" (username, email, "firstName", "lastName", password, role, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) RETURNING id', [username, email, firstName, lastName, hash, 'student']);
        userId = ins.rows[0].id;
      }

      // Link to class in join table, avoid duplicates
      const linked = await pool.query('SELECT 1 FROM "_ClassToUser" WHERE "A"=$1 AND "B"=$2 LIMIT 1', [classId, userId]);
      if (!linked.rowCount) {
        await pool.query('INSERT INTO "_ClassToUser" ("A","B") VALUES ($1,$2)', [classId, userId]);
      }
    }

    console.log('Seeded 20 students and linked to class id', classId);
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
