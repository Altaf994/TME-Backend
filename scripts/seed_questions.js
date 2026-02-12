require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    // Sample questions
    const questions = [
      {
        serial: 1,
        A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D',
        answer: 'A',
        complexity: 'Junior +3',
        length: 3
      },
      {
        serial: 2,
        A: 'Choice A', B: 'Choice B', C: 'Choice C', D: 'Choice D',
        answer: 'B',
        complexity: 'Junior +3',
        length: 4
      },
      {
        serial: 3,
        A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D',
        answer: 'C',
        complexity: 'Triple Digit Without Formula',
        length: 3
      }
    ];

    for (const q of questions) {
      await pool.query(
        'INSERT INTO "CoreQuestion" (serial, "A","B","C","D", answer, complexity, length) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [q.serial, q.A, q.B, q.C, q.D, q.answer, q.complexity, q.length]
      );
    }

    console.log('Sample questions inserted successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();