import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { smsCodes, users } from '../../../db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';

export default publicProcedure
  .input(z.object({
    phone: z.string(),
    code: z.string(),
  }))
  .mutation(async ({ input }) => {
    const result = await db.select()
      .from(smsCodes)
      .where(
        and(
          eq(smsCodes.phone, input.phone),
          eq(smsCodes.code, input.code),
          gt(smsCodes.expiresAt, sql`(unixepoch())`)
        )
      )
      .limit(1);
    
    if (result.length === 0) {
      return { success: false };
    }
    
    await db.delete(smsCodes).where(eq(smsCodes.phone, input.phone));
    
    let user = await db.select().from(users).where(eq(users.phone, input.phone)).limit(1);
    
    if (user.length === 0) {
      const newUser = {
        id: Date.now().toString(),
        name: 'Пользователь',
        email: input.phone,
        phone: input.phone,
        isAdmin: false,
        addresses: JSON.stringify([]),
      };
      
      await db.insert(users).values(newUser);
      
      return {
        success: true,
        user: {
          ...newUser,
          addresses: [],
        },
      };
    }
    
    return {
      success: true,
      user: {
        ...user[0],
        addresses: user[0].addresses ? JSON.parse(user[0].addresses) : [],
      },
    };
  });
