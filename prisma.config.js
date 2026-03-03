import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma", // Path to your schema file
  migrate: {
    async adapter(env) {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      return new PrismaPg({ connectionString: env.DATABASE_URL });
    },
  },
  migrations: {
    directory: "prisma/migrations", // Directory for migration files
    seed: "npx prisma generate && npx tsx prisma/seed.ts", // Command to run seed script
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // shadowDatabaseUrl: process.env.DATABASE_SHADOW_URL || process.env.DATABASE_URL,
  },
});
