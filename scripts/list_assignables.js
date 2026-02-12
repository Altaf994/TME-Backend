require('dotenv').config();
const { Pool } = require('pg');
(async()=>{
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const users = await pool.query('SELECT id, username, "firstName", "lastName", role FROM "User" ORDER BY id');
    console.log('USERS_COUNT=' + users.rowCount);
    console.log(users.rows);
    const students = users.rows.filter(u => u.role === 'student');
    console.log('STUDENTS_COUNT=' + students.length);

    const classes = await pool.query('SELECT id, name, section FROM "Class" ORDER BY id');
    console.log('CLASSES_COUNT=' + classes.rowCount);
    console.log(classes.rows);
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
