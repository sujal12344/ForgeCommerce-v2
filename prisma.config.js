import { defineConfig } from 'prisma/config';
import path from 'node:path';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter(env) {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      return new PrismaPg({ connectionString: env.DATABASE_URL });
    },
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // shadowDatabaseUrl: process.env.DATABASE_SHADOW_URL || process.env.DATABASE_URL,
  }
});
