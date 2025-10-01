import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/client';
import { smsCodes } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default publicProcedure
  .input(z.object({
    phone: z.string(),
  }))
  .mutation(async ({ input }) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await db.delete(smsCodes).where(eq(smsCodes.phone, input.phone));
    
    await db.insert(smsCodes).values({
      id: Date.now().toString(),
      phone: input.phone,
      code,
      expiresAt,
    });
    
    console.log(`SMS код для ${input.phone}: ${code}`);
    
    return { success: true };
  });
