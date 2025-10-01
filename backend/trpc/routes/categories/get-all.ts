import { publicProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { categories } from '../../../db/schema';
import { asc } from 'drizzle-orm';

export default publicProcedure.query(async () => {
  return await db.select().from(categories).orderBy(asc(categories.order));
});
