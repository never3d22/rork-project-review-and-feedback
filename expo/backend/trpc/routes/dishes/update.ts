import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { dishes } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default protectedProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
    available: z.boolean().optional(),
    weight: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;
    
    const updateData: any = { ...updates };
    if (updates.ingredients) {
      updateData.ingredients = JSON.stringify(updates.ingredients);
    }
    
    await db.update(dishes).set(updateData).where(eq(dishes.id, id));
    
    return { success: true };
  });
