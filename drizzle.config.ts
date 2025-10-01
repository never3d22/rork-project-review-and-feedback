import type { Config } from 'drizzle-kit';

export default {
  schema: './backend/db/schema.ts',
  out: './backend/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
  },
} satisfies Config;
