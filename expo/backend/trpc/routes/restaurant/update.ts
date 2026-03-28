import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { restaurant } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export default protectedProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    workingHours: z.string().optional(),
    deliveryTime: z.string().optional(),
    pickupTime: z.string().optional(),
    deliveryMinTime: z.number().optional(),
    deliveryMaxTime: z.number().optional(),
    pickupMinTime: z.number().optional(),
    pickupMaxTime: z.number().optional(),
    logo: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;
    
    await db.update(restaurant)
      .set({ ...updates, updatedAt: sql`(unixepoch())` })
      .where(eq(restaurant.id, id));
    
    return { success: true };
  });
