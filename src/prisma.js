// Export a lazy initializer for PrismaClient so requiring this module
// does not instantiate the client immediately (which previously caused
// runtime adapter/initialization errors and crashed the server).
let prisma = null;
async function getPrismaClient() {
	if (prisma) return prisma;
	const { PrismaClient } = require('@prisma/client');
	const { PrismaPg } = require('@prisma/adapter-pg');
	const { Pool } = require('pg');
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const adapter = new PrismaPg(pool);
	// Prisma v7 client in this repo requires passing a non-empty options object
	// (even if no options are needed).
	prisma = new PrismaClient({ adapter });
	// try to connect; caller may catch failures
	await prisma.$connect();
	return prisma;
}

module.exports = { getPrismaClient };
