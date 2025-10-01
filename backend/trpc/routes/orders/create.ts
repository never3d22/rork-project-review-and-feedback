import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { orders } from '../../../db/schema';

export default publicProcedure
  .input(z.object({
    userId: z.string().optional(),
    userName: z.string().optional(),
    userPhone: z.string().optional(),
    items: z.array(z.object({
      dish: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        image: z.string(),
        category: z.string(),
        available: z.boolean(),
        weight: z.string().optional(),
        ingredients: z.array(z.string()).optional(),
      }),
      quantity: z.number(),
    })),
    total: z.number(),
    utensils: z.boolean(),
    utensilsCount: z.number(),
    paymentMethod: z.enum(['card', 'sberpay', 'cash', 'sbp']),
    deliveryType: z.enum(['pickup', 'delivery']),
    deliveryAddress: z.string().optional(),
    deliveryTime: z.string().optional(),
    comments: z.string(),
  }))
  .mutation(async ({ input }) => {
    const newOrder = {
      id: Date.now().toString(),
      ...input,
      items: JSON.stringify(input.items),
      status: 'pending',
    };
    
    await db.insert(orders).values(newOrder);
    
    return {
      ...newOrder,
      items: input.items,
      createdAt: new Date(),
    };
  });
