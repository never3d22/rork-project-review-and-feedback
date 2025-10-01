import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

console.log('\n========================================');
console.log('🔵 [DB CLIENT] Initializing database connection');
console.log('========================================');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Platform:', process.platform);
console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('TURSO')).join(', '));

const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.STORAGE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

console.log('TURSO_DATABASE_URL from env:', tursoUrl ? 'SET (' + tursoUrl.substring(0, 50) + '...)' : 'NOT SET');
console.log('TURSO_AUTH_TOKEN from env:', tursoAuthToken ? 'SET (length: ' + tursoAuthToken.length + ')' : 'NOT SET');

if (!tursoUrl || !tursoAuthToken) {
  console.error('❌ [DB CLIENT] TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables');
}

console.log('✅ [DB CLIENT] Creating Turso client...');
const client = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

console.log('✅ [DB CLIENT] Creating Drizzle instance...');
export const db = drizzle(client, { schema });

console.log('✅ [DB CLIENT] Database connection initialized successfully');
console.log('========================================\n');
