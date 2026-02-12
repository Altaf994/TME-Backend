const { getPrismaClient } = require('../src/prisma');
const bcrypt = require('bcryptjs');

let prisma;

async function main() {
  prisma = await getPrismaClient();
  // Create 20 students (skip if username/email already exists)
  const createdStudents = [];
  for (let i = 1; i <= 20; i++) {
    const username = `student_${i}`;
    const email = `student${i}@example.com`;
    const firstName = 'Student';
    const lastName = String(i).padStart(2, '0');
    const password = `Student${i}@123`;
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      createdStudents.push(exists);
      continue;
    }
    const hash = await bcrypt.hash(password, 10);
    const u = await prisma.user.create({ data: { username, email, firstName, lastName, password: hash, role: 'student' } });
    createdStudents.push(u);
  }

  // Create a class if not exists
  let cls = await prisma.class.findFirst({ where: { name: 'Grade 1', section: 'A' } });
  if (!cls) {
    cls = await prisma.class.create({ data: { name: 'Grade 1', section: 'A' } });
  }

  // Connect students to class
  for (const u of createdStudents) {
    await prisma.user.update({ where: { id: u.id }, data: { classes: { connect: { id: cls.id } } } });
  }

  console.log('Seed complete:', { students: createdStudents.map(s => ({ id: s.id, username: s.username })), classId: cls.id });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
