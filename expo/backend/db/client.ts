import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

console.log('\n========================================');
console.log('🔵 [DB CLIENT] Initializing MySQL database connection');
console.log('========================================');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Platform:', process.platform);

const dbHost = process.env.DATABASE_HOST;
const dbUser = process.env.DATABASE_USER;
const dbPassword = process.env.DATABASE_PASSWORD;
const dbName = process.env.DATABASE_NAME;
const dbPort = process.env.DATABASE_PORT || '3306';

console.log('DATABASE_HOST:', dbHost ? 'SET' : 'NOT SET');
console.log('DATABASE_USER:', dbUser ? 'SET' : 'NOT SET');
console.log('DATABASE_PASSWORD:', dbPassword ? 'SET (length: ' + dbPassword.length + ')' : 'NOT SET');
console.log('DATABASE_NAME:', dbName ? 'SET' : 'NOT SET');
console.log('DATABASE_PORT:', dbPort);

if (!dbHost || !dbUser || !dbPassword || !dbName) {
  console.error('❌ [DB CLIENT] MySQL credentials must be set');
  throw new Error('DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME must be set in environment variables');
}

console.log('✅ [DB CLIENT] Creating MySQL connection pool...');
const poolConnection = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: parseInt(dbPort),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('✅ [DB CLIENT] Creating Drizzle instance...');
export const db = drizzle(poolConnection, { schema, mode: 'default' });

console.log('✅ [DB CLIENT] Database connection initialized successfully');
console.log('========================================\n');
