import { handle } from "hono/vercel";
import app from "../backend/hono";

console.log('\n========================================');
console.log('🔵 [API HANDLER] Initializing Vercel handler');
console.log('========================================\n');

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default handle(app);
