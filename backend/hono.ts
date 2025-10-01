import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@libsql/client';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';

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

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag'
});

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
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
