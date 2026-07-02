import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Render PostgreSQL requires SSL in production
// rejectUnauthorized: false accepts Render's self-signed certificate
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const prisma = new PrismaClient({ adapter });

export default prisma;