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
    console.log('🔍 [CORS] Request from origin:', origin);
    
    if (!origin) {
      console.log('✅ [CORS] No origin header, allowing request');
      return '*';
    }
    
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isVercel = origin.includes('.vercel.app') || origin.includes('rork-project-review-and-feedback');
    const isExpoDev = origin.includes('.exp.direct');
    
    if (isLocalhost || isVercel || isExpoDev) {
      console.log('✅ [CORS] Allowed origin:', origin);
      return origin;
    }
    
    console.log('⚠️ [CORS] Unknown origin, allowing anyway:', origin);
    return origin;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-trpc-source'],
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
