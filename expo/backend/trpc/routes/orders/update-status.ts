import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { orders } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default protectedProcedure
  .input(z.object({
    id: z.string(),
    status: z.enum(['pending', 'preparing', 'ready', 'delivered', 'cancelled', 'paid']),
  }))
  .mutation(async ({ input }) => {
    await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
    return { success: true };
  });
