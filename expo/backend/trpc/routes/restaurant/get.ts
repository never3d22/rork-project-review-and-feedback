import { publicProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { restaurant } from '../../../db/schema';

export default publicProcedure.query(async () => {
  const result = await db.select().from(restaurant).limit(1);
  return result[0] || null;
});
