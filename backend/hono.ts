import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@libsql/client';

const app = new Hono();

app.use('*', cors());

const client = createClient({
  url: 'libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTkyOTg2NjAsImlkIjoiNmFhZWM3NjQtYWI0MS00NTdlLTg3MjEtODY5ZjIyMDE5OTc5IiwicmlkIjoiMzc3MWNjMDAtNGNmMy00Y2FlLTk4ZjQtN2E1OWYxNTU4MGQ2In0.b2OyNKShbcaa7ae8LnhjHX0jSH0GFxk_J55isBqrQqG5rfAXrPBjOxmdAS5YKNzX511MA-OZdEqMzp-mC6f9Ag'
});

app.get('/', (c) => c.text('API is working!'));

app.post('/order', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Received order:', body);

    // Сохраняем заказ в Turso
    const { items, total } = body;
    const result = await client.execute(`
      INSERT INTO orders (items, total) VALUES (?, ?)
    `, [JSON.stringify(items), total]);

    return c.json({ success: true, orderId: result.insertId });
  } catch (err) {
    console.error('Error saving order:', err);
    return c.json({ success: false, error: err.message });
  }
});

export default app;
