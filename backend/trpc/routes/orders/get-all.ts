import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { orders } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export default protectedProcedure.query(async () => {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  
  return allOrders.map(order => ({
    ...order,
    items: JSON.parse(order.items),
    createdAt: new Date(order.createdAt),
    cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined,
  }));
});
