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
  origin: '*',
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

app.get("/api", (c) => {
  console.log('📍 [HONO] /api endpoint hit');
  return c.json({ status: "ok", message: "API is running" });
});

app.all("/trpc/*", (c) => {
  console.log('📍 [HONO] tRPC endpoint hit:', c.req.url);
  console.log('Method:', c.req.method);
  console.log('Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  return c.json({ error: "This should be handled by tRPC middleware" }, 500);
});

console.log('✅ [HONO] Server initialization complete');
console.log('========================================\n');

export default app;
