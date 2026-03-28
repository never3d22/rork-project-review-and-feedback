const { serve } = require('@hono/node-server');

async function startServer() {
  try {
    console.log('🔵 Loading backend application...');
    const { default: backendApp } = await import('./backend/hono.ts');
    
    const port = process.env.PORT || 3000;
    
    console.log('🚀 Starting server on port', port);
    console.log('Environment:', process.env.NODE_ENV || 'production');
    
    serve({
      fetch: backendApp.fetch,
      port: port,
    });
    
    console.log(`✅ Server running at http://localhost:${port}`);
    console.log('✅ API available at /api/trpc');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
