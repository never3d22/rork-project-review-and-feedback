import { z } from 'zod';
import { publicProcedure } from '../../create-context';

export default publicProcedure
  .input(z.object({
    username: z.string(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.username === 'admin' && input.password === '1234') {
      return {
        success: true,
        token: 'admin-token',
        user: {
          id: 'admin',
          name: 'Администратор',
          email: 'admin@restaurant.com',
          isAdmin: true,
        },
      };
    }
    
    return { success: false };
  });
