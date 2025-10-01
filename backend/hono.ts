import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from './trpc/app-router';
import { db } from './db/client';
import { orders } from './db/schema';

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

console.log('🔵 [HONO] Using MySQL database from Beget');
console.log('✅ [HONO] Database client initialized');

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

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(orders).values({
      id: orderId,
      userId: body.userId || null,
      userName: body.userName || null,
      userPhone: body.userPhone || null,
      items: JSON.stringify(body.items),
      total: body.total.toString(),
      utensils: body.utensils || false,
      utensilsCount: body.utensilsCount || 0,
      paymentMethod: body.paymentMethod || 'cash',
      deliveryType: body.deliveryType || 'delivery',
      deliveryAddress: body.deliveryAddress || null,
      deliveryTime: body.deliveryTime || null,
      comments: body.comments || null,
      status: 'pending',
    });

    return c.json({ success: true, orderId });
  } catch (err) {
    console.error('Error saving order:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage });
  }
});

export default app;
