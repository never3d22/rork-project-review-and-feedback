import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { dishes } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }) => {
    await db.delete(dishes).where(eq(dishes.id, input.id));
    return { success: true };
  });
