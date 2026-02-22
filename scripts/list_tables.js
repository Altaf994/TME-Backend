require('dotenv').config();
const { Client } = require('pg');

async function listTables() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set in environment or .env');
    process.exit(2);
  }
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type='BASE TABLE'
        AND table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name;
    `);
    if (res.rows.length === 0) {
      console.log('No non-system tables found.');
    } else {
      console.log('Tables:');
      res.rows.forEach(r => console.log(`${r.table_schema}.${r.table_name}`));
    }
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error listing tables:', err.message || err);
    process.exit(1);
  }
}

listTables();
