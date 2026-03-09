import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

// Lazy singleton – initialized on first use (runtime), not at import time (build).
// Prevents Next.js from throwing during `next build` when DATABASE_URL isn't
// available in the Docker build stage.
const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getClient()[prop as keyof PrismaClient];
  },
});

export default prisma;
