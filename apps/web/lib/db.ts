import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || "postgres://mock_user:mock_pass@localhost:5432/mock_db";
  
  // Use PrismaNeon adapter only for Neon databases (e.g. cloud deployments)
  if (connectionString.includes("neon.tech")) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }
  
  // Fall back to standard TCP PrismaClient for local standard PostgreSQL instances (such as local Docker)
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
};

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
