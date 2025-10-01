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
    try {
      console.log('📝 Creating order in database...');
      console.log('Order data:', JSON.stringify({
        userId: input.userId,
        userName: input.userName,
        userPhone: input.userPhone,
        itemsCount: input.items.length,
        total: input.total,
      }, null, 2));
      
      const newOrder = {
        id: Date.now().toString(),
        userId: input.userId || null,
        userName: input.userName || null,
        userPhone: input.userPhone || null,
        items: JSON.stringify(input.items),
        total: input.total,
        utensils: input.utensils,
        utensilsCount: input.utensilsCount,
        paymentMethod: input.paymentMethod,
        deliveryType: input.deliveryType,
        deliveryAddress: input.deliveryAddress || null,
        deliveryTime: input.deliveryTime || null,
        comments: input.comments || '',
        status: 'pending',
      };
      
      console.log('Inserting order into database...');
      await db.insert(orders).values(newOrder);
      console.log('✅ Order inserted successfully!');
      
      return {
        ...newOrder,
        items: input.items,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  });
