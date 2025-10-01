import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

console.log('\n========================================');
console.log('🔵 [HONO] Starting server initialization');
console.log('========================================');

const app = new Hono();

console.log('✅ [HONO] Hono app created');

app.use("*", cors({
  origin: (origin) => {
    const allowedOrigins = [
      'https://rork-project-review-and-feedback.vercel.app',
      'https://rork-project-review-and-feedback-pwy6lkx1a.vercel.app',
      'https://rork-project-review-and-feedback-3ukzrxnx5.vercel.app',
      'http://localhost:8081',
      'http://localhost:19006',
    ];
    
    if (!origin || allowedOrigins.includes(origin) || origin.includes('rork-project-review-and-feedback')) {
      return origin || '*';
    }
    return allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

console.log('✅ [HONO] CORS middleware configured');

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

console.log('✅ [HONO] tRPC server middleware configured');

app.get("/", (c) => {
  console.log('📍 [HONO] Root endpoint hit');
  return c.json({ status: "ok", message: "API is running" });
});

console.log('✅ [HONO] Server initialization complete');
console.log('========================================\n');

export default app;
