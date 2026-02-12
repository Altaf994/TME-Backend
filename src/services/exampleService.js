const { getPrismaClient } = require('../prisma');

exports.getExampleData = () => {
  return { message: 'Example response from service' };
};

exports.getQuestionFilters = async () => {
  const prisma = await getPrismaClient();
  const complexityRows = await prisma.$queryRaw`SELECT DISTINCT complexity FROM "CoreQuestion" WHERE complexity IS NOT NULL ORDER BY complexity ASC`;
  const complexities = complexityRows.map(r => r.complexity);
  const lengthRows = await prisma.$queryRaw`SELECT DISTINCT length FROM "CoreQuestion" WHERE length IS NOT NULL ORDER BY length ASC`;
  const lengths = lengthRows.map(r => String(r.length));
  return { complexities, lengths };
};
