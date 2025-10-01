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
    console.log('\n========================================');
    console.log('🔵 [BACKEND] Order creation started');
    console.log('========================================');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Input data:', JSON.stringify(input, null, 2));
    
    try {
      console.log('\n📝 [BACKEND] Step 1: Validating input fields...');
      console.log('paymentMethod type:', typeof input.paymentMethod);
      console.log('paymentMethod value:', input.paymentMethod);
      console.log('paymentMethod is null?', input.paymentMethod === null);
      console.log('paymentMethod is undefined?', input.paymentMethod === undefined);
      console.log('deliveryType type:', typeof input.deliveryType);
      console.log('deliveryType value:', input.deliveryType);
      
      if (!input.paymentMethod) {
        throw new Error('paymentMethod is required but was: ' + input.paymentMethod);
      }
      if (!input.deliveryType) {
        throw new Error('deliveryType is required but was: ' + input.deliveryType);
      }
      
      console.log('\n📝 [BACKEND] Step 2: Preparing order object...');
      
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
      
      console.log('✅ [BACKEND] Order object prepared:', JSON.stringify(newOrder, null, 2));
      
      console.log('\n📝 [BACKEND] Step 2: Checking database connection...');
      console.log('Database URL:', process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET');
      console.log('Auth Token:', process.env.TURSO_AUTH_TOKEN ? 'SET (length: ' + process.env.TURSO_AUTH_TOKEN.length + ')' : 'NOT SET');
      
      console.log('\n📝 [BACKEND] Step 3: Inserting into database...');
      const insertResult = await db.insert(orders).values(newOrder);
      console.log('✅ [BACKEND] Insert result:', insertResult);
      
      console.log('\n📝 [BACKEND] Step 4: Verifying insertion...');
      const allOrders = await db.select().from(orders);
      console.log('✅ [BACKEND] Total orders in DB:', allOrders.length);
      console.log('Latest order:', allOrders[allOrders.length - 1]);
      
      const response = {
        ...newOrder,
        items: input.items,
        createdAt: new Date(),
      };
      
      console.log('\n✅ [BACKEND] Order created successfully!');
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('========================================\n');
      
      return response;
    } catch (error: any) {
      console.error('\n========================================');
      console.error('❌ [BACKEND] Error creating order');
      console.error('========================================');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('========================================\n');
      throw error;
    }
  });
