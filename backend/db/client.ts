import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

console.log('\n========================================');
console.log('🔵 [DB CLIENT] Initializing database connection');
console.log('========================================');

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io';
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag';

console.log('TURSO_DATABASE_URL:', tursoUrl ? 'SET (' + tursoUrl.substring(0, 30) + '...)' : 'NOT SET');
console.log('TURSO_AUTH_TOKEN:', tursoAuthToken ? 'SET (length: ' + tursoAuthToken.length + ')' : 'NOT SET');
console.log('Using fallback values:', !process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN);

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
