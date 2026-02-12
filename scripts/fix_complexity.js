require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  const pool = await new Pool({ connectionString: process.env.DATABASE_URL }).connect();

  try {
    // Set complexity to the full complexity_text
    await pool.query('UPDATE "CoreQuestion" SET complexity = complexity_text WHERE complexity_text IS NOT NULL');

    console.log('Complexity updated to full text values.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
})();