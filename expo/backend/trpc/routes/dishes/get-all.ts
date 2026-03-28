import { publicProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { dishes } from '../../../db/schema';

export default publicProcedure.query(async () => {
  const allDishes = await db.select().from(dishes);
  
  return allDishes.map(dish => ({
    ...dish,
    ingredients: dish.ingredients ? JSON.parse(dish.ingredients) : undefined,
  }));
});
