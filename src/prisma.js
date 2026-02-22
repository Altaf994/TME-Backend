// Export a lazy initializer for PrismaClient so requiring this module
// does not instantiate the client immediately (which previously caused
// runtime adapter/initialization errors and crashed the server).
let prisma = null;
async function getPrismaClient() {
	if (prisma) return prisma;
	const { PrismaClient } = require('@prisma/client');
	// Use Prisma Accelerate for serverless deployments
	// Provide an explicit options object to avoid runtime initialization errors
	prisma = new PrismaClient({ errorFormat: 'pretty' });
	// try to connect; caller may catch failures
	await prisma.$connect();
	return prisma;
}

module.exports = { getPrismaClient };
