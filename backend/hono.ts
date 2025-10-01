import { Hono } from "hono";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@trpc/server";
import { inferProcedureOutput } from "@trpc/server";
import { json } from "hono/json";
import { createClient } from "libsql"; // Turso client

// Создаем Turso client
const db = createClient({
  url: "libsql://restaurant-app-never3d22.aws-eu-west-1.turso.io",
  authToken: process.env.TURSO_TOKEN,
});

const app = new Hono();

// tRPC router
const trpcRouter = createTRPCRouter({
  createOrder: publicProcedure
    .input(z.object({
      name: z.string(),
      phone: z.string(),
      items: z.array(z.object({ id: z.number(), quantity: z.number() })),
    }))
    .mutation(async ({ input }) => {
      try {
        // Сохраняем заказ в Turso
        const itemsJSON = JSON.stringify(input.items);
        await db.execute(
          "INSERT INTO orders (name, phone, items) VALUES (?, ?, ?)",
          [input.name, input.phone, itemsJSON]
        );

        return { success: true };
      } catch (err) {
        console.error("Ошибка сохранения заказа:", err);
        throw new Error("Failed to save order");
      }
    }),
});

// Обертка tRPC в Hono
app.post("/trpc/:procedure", async (c) => {
  const procedureName = c.req.param("procedure");

  if (!trpcRouter._def.procedures[procedureName]) {
    return c.json({ error: "Procedure not found" }, 404);
  }

  try {
    const body = await c.req.json();
    const result = await trpcRouter._def.procedures[procedureName].resolve({ input: body });
    return c.json(result);
  } catch (err: any) {
    console.error("TRPC error:", err);
    return c.json({ error: err.message || "Internal Server Error" }, 500);
  }
});

export default app;
