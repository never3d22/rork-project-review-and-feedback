import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { dishes } from '../../../db/schema';

export default protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    image: z.string(),
    category: z.string(),
    available: z.boolean().default(true),
    weight: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input }) => {
    const newDish = {
      id: Date.now().toString(),
      ...input,
      ingredients: input.ingredients ? JSON.stringify(input.ingredients) : undefined,
    };
    
    await db.insert(dishes).values(newDish);
    
    return {
      ...newDish,
      ingredients: input.ingredients,
    };
  });
