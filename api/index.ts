import { handle } from 'hono/vercel';
import { Hono } from 'hono';
import backendApp from '../backend/hono';

export const config = {
  runtime: 'nodejs',
};

const app = new Hono().basePath('/api');
app.route('/', backendApp);

export default handle(app);
