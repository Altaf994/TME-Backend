const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory fallback store (used when USE_PRISMA != 'true')
const users = [];

const { Pool } = require('pg');

let cachedPool = null;
async function getPrismaOrPg() {
  // Try Prisma first when requested. If Prisma fails at require-time or
  // at runtime (adapter/connect), fall back to a pg Pool that uses the
  // same DATABASE_URL.
  if (process.env.USE_PRISMA === 'true') {
    try {
      const { getPrismaClient } = require('../prisma');
      const prisma = await getPrismaClient();
      // connectivity check
      await prisma.$queryRaw`SELECT 1`;
      return { type: 'prisma', client: prisma };
    } catch (err) {
      // Prisma unavailable — fall back to pg
    }
  }

  if (process.env.USE_PG === 'true' || process.env.USE_PRISMA === 'true') {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL not set');
    if (!cachedPool) {
      cachedPool = new Pool({ connectionString });
      await cachedPool.query('SELECT 1');
    }
    return { type: 'pg', client: cachedPool };
  }

  return null;
}

exports.register = async ({ username, email, firstName, lastName, teacherId, password, role = 'student' }) => {
  const db = await getPrismaOrPg();
  if (db && db.type === 'prisma') {
    const prisma = db.client;
    try {
      const existingByUsername = await prisma.user.findUnique({ where: { username } });
      if (existingByUsername) throw new Error('Username exists');
      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) throw new Error('Email exists');
      if (teacherId) {
        const existingByTeacherId = await prisma.user.findUnique({ where: { teacherId } });
        if (existingByTeacherId) throw new Error('TeacherId exists');
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const user = await prisma.user.create({
        data: { username, email, firstName, lastName, teacherId: teacherId || null, password: hash, role },
        select: { id: true, username: true, email: true, firstName: true, lastName: true, role: true, teacherId: true },
      });
      return user;
    } catch (err) {
      // Prisma failed at runtime (adapter/connect); fall back to pg
    }
  }

  if (db && db.type === 'pg') {
    const pool = db.client;
    // uniqueness checks
    const r1 = await pool.query('SELECT id FROM "User" WHERE username=$1 LIMIT 1', [username]);
    if (r1.rowCount) throw new Error('Username exists');
    const r2 = await pool.query('SELECT id FROM "User" WHERE email=$1 LIMIT 1', [email]);
    if (r2.rowCount) throw new Error('Email exists');
    if (teacherId) {
      const r3 = await pool.query('SELECT id FROM "User" WHERE "teacherId"=$1 LIMIT 1', [teacherId]);
      if (r3.rowCount) throw new Error('TeacherId exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const insert = await pool.query(
      'INSERT INTO "User" (username, email, "firstName", "lastName", "teacherId", password, role, "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id, username, email, "firstName", "lastName", role, "teacherId"',
      [username, email, firstName, lastName, teacherId || null, hash, role]
    );
    return insert.rows[0];
  }

  // fallback: in-memory
  if (users.find(u => u.username === username)) throw new Error('Username exists');
  if (users.find(u => u.email === email)) throw new Error('Email exists');
  if (teacherId && users.find(u => u.teacherId === teacherId)) throw new Error('TeacherId exists');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = { id: users.length + 1, username, email, firstName, lastName, teacherId: teacherId || null, password: hash, role };
  users.push(user);
  return { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, teacherId: user.teacherId };
};

exports.login = async ({ username, password }) => {
  const db = await getPrismaOrPg();
  if (db && db.type === 'prisma') {
    const prisma = db.client;
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) throw new Error('Invalid credentials');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid credentials');
      const secret = process.env.JWT_SECRET || 'dev_secret';
      const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, secret, { expiresIn: '7d' });
      return { token, teacherId: user.teacherId };
    } catch (err) {
      // fall through to pg or in-memory fallback
    }
  }

  if (db && db.type === 'pg') {
    const pool = db.client;
    const res = await pool.query('SELECT * FROM "User" WHERE username=$1 LIMIT 1', [username]);
    const user = res.rows[0];
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, secret, { expiresIn: '7d' });
    return { token, teacherId: user.teacherId };
  }

  // fallback: in-memory
  const user = users.find(u => u.username === username);
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, secret, { expiresIn: '7d' });
  return { token, teacherId: user.teacherId };
};
