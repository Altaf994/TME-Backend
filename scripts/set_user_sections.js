const { Pool } = require('pg');
require('dotenv').config();

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    // Distribute 20 students into 4 sections A-D
    const sections = ['A','B','C','D'];
    for (let i = 1; i <= 20; i++) {
      const username = `student_${i}`;
      const sec = sections[(i - 1) % sections.length];
      await pool.query('UPDATE "User" SET section=$1 WHERE username=$2', [sec, username]);
    }
    console.log('Assigned sections A-D to student_1..student_20');
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
