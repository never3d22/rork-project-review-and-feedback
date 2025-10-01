import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@libsql/client';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from './trpc/app-router';

const app = new Hono();

app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'https://rork-project-review-and-feedback.vercel.app',
      'http://localhost:8081'
    ];
    if (!origin || allowed.includes(origin) || 
        origin.includes('vercel.app') || 
        origin.includes('exp.direct')) {
      return origin || '*';
    }
    return allowed[0];
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

console.log('🔵 [HONO] Initializing Turso client');

const tursoUrl = process.env.STORAGE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.STORAGE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

console.log('TURSO_DATABASE_URL:', tursoUrl ? 'SET' : 'NOT SET');
console.log('TURSO_AUTH_TOKEN:', tursoAuthToken ? 'SET' : 'NOT SET');

if (!tursoUrl || !tursoAuthToken) {
  console.error('❌ [HONO] Missing Turso credentials!');
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in Vercel environment variables');
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

console.log('✅ [HONO] Turso client initialized');

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (opts) => ({
      req: opts.req,
    }),
  })
);

app.get('/', (c) => {
  console.log('✅ Health check endpoint hit');
  return c.json({ status: 'ok', message: 'API is working!' });
});

app.post('/order', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Received order:', body);

    // Сохраняем заказ в Turso
    const { items, total } = body;
    const result = await client.execute(`
      INSERT INTO orders (items, total) VALUES (?, ?)
    `, [JSON.stringify(items), total]);

    return c.json({ success: true, orderId: result.lastInsertRowid?.toString() || 'unknown' });
  } catch (err) {
    console.error('Error saving order:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage });
  }
});

export default app;
