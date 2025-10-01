import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context as HonoContext } from "hono";

export const createContext = (c: HonoContext) => {
  return {
    req: c.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAdmin = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.header('authorization');
  
  if (!authHeader || authHeader !== 'Bearer admin-token') {
    throw new Error('Unauthorized');
  }
  
  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAdmin);
