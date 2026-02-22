const { getPrismaClient } = require('../src/prisma');

(async () => {
  try {
    const p = await getPrismaClient();
    const res = await p.$queryRaw`SELECT 1 as result`;
    console.log('DB test result:', res);
    await p.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB test failed:', err);
    process.exit(1);
  }
})();
