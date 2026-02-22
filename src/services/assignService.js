const { Pool } = require('pg');
require('dotenv').config();

let cachedPool = null;
async function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL not set');
  if (!cachedPool) {
    cachedPool = new Pool({ connectionString });
    await cachedPool.query('SELECT 1');
  }
  return cachedPool;
}

exports.listAssignables = async () => {
  const pool = await getPool();
  // Get students only (exclude teachers) and include section
  const usersRes = await pool.query('SELECT id, "firstName", "lastName", role, section FROM "User" WHERE role=$1 ORDER BY "firstName"', ['student']);
  const users = usersRes.rows.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim(), role: u.role, section: u.section }));

  // Get classes if table exists (Prisma migration may be required)
  let classes = [];
  try {
    // Build sections from User.section (no extra table required)
    const sectionsMap = {};
    for (const u of users) {
      const sec = u.section || 'Unassigned';
      if (!sectionsMap[sec]) sectionsMap[sec] = [];
      sectionsMap[sec].push({ id: u.id, name: u.name });
    }
    classes = Object.keys(sectionsMap).map(sec => ({ id: `section:${sec}`, name: sec === 'Unassigned' ? sec : `Section ${sec}`, students: sectionsMap[sec] }));
  } catch (err) {
    // Table might not exist yet; return empty classes array
  }

  return { users, classes };
};

exports.createAssignment = async ({ complexity, length, numQuestions, speed, title, userId, section, teacherId }) => {
  const pool = await getPool();

  // Parse and validate inputs (allow labelled complexity like "Junior +3" and float speed)
  const parsedNum = parseInt(numQuestions, 10);
  const parsedSpeed = parseFloat(speed);
  const parsedLength = parseInt(length, 10);
  const parsedUserId = userId ? parseInt(userId, 10) : null;

  // Complexity: map numbers to text, or use as is
  const complexityMap = {
    '1': 'Triple Digit Without Formula',
    '3': 'Junior +3'
  };
  const compRaw = String(complexity).trim();
  let parsedComplexity = compRaw;
  if (complexityMap[parsedComplexity]) {
    parsedComplexity = complexityMap[parsedComplexity];
  }

  if (!Number.isFinite(parsedSpeed) || !Number.isFinite(parsedNum) || parsedNum <= 0) {
    console.error('Validation failed: speed or numQuestions invalid', { parsedSpeed, parsedNum, speed, numQuestions });
    const err = new Error('Invalid speed or numQuestions');
    err.status = 400;
    throw err;
  }
  if (parsedComplexity === null || !Number.isFinite(parsedLength)) {
    console.error('Validation failed: complexity or length invalid', { parsedComplexity, parsedLength, complexity, length });
    const err = new Error('Invalid complexity or length');
    err.status = 400;
    throw err;
  }

  const baseSelect = 'SELECT serial, "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T", answer, complexity, length FROM "CoreQuestion"';

  // First try: match exact complexity
  let questionsRes = await pool.query(
    `${baseSelect} WHERE complexity=$1 AND length=$2 ORDER BY RANDOM() LIMIT $3`,
    [parsedComplexity, parsedLength, parsedNum]
  );
  let questions = questionsRes.rows;

  // Fallback: if nothing found, try ILIKE match
  if (!questions || questions.length === 0) {
    questionsRes = await pool.query(
      `${baseSelect} WHERE complexity ILIKE $1 AND length=$2 ORDER BY RANDOM() LIMIT $3`,
      [`%${parsedComplexity}%`, parsedLength, parsedNum]
    );
    questions = questionsRes.rows;
    // If still empty, try exact match with original input
    if ((!questions || questions.length === 0) && compRaw) {
      questionsRes = await pool.query(
        `${baseSelect} WHERE complexity = $1 AND length=$2 ORDER BY RANDOM() LIMIT $3`,
        [compRaw, parsedLength, parsedNum]
      );
      questions = questionsRes.rows;
    }
  }

  if (!questions || questions.length < parsedNum) {
    const err = new Error(`Not enough questions found. Found ${questions ? questions.length : 0}, requested ${parsedNum}`);
    err.status = 400;
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const q of questions) {
      await client.query(
        'INSERT INTO "AssignedQuestion" (title, speed, "userId", "teacherId", section, "studentId", "studentsection", serial, "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T", answer, complexity, length) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)',
        [
          title,
          parsedSpeed,
          parsedUserId,
          teacherId || null,
          section || null,
          parsedUserId,
          section || null,
          q.serial,
          q.A, q.B, q.C, q.D, q.E, q.F, q.G, q.H,
          q.I, q.J, q.K, q.L, q.M, q.N, q.O, q.P,
          q.Q, q.R, q.S, q.T,
          q.answer,
          q.complexity,
          q.length,
        ]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return { message: 'Assignment created successfully', count: questions.length };
};

// Fetch all assigned questions grouped by title
exports.getAllAssignedQuestionsGroupedByTitle = async () => {
  const pool = await getPool();
  const res = await pool.query('SELECT * FROM "AssignedQuestion"');
  const rows = res.rows;
  // Group by title
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.title]) grouped[row.title] = [];
    grouped[row.title].push(row);
  }
  // Convert to array of objects: [{ title, questions: [...] }]
  return Object.entries(grouped).map(([title, questions]) => ({ title, questions }));
};
