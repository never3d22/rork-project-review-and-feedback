const { serve } = require('@hono/node-server');
const { app } = require('./api/index.ts');

const port = process.env.PORT || 3000;

console.log('🚀 Starting server on port', port);

serve({
  fetch: app.fetch,
  port: port,
});

console.log(`✅ Server running at http://localhost:${port}`);
