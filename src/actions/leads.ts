import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Leads } from 'astro:db';

export const create = defineAction({
    accept: 'form',
    input: z.object({
        email: z.string().email(),
        message: z.string().min(2),
    }),
    handler: async (input) => {
        try {
            await db.insert(Leads).values({
                type: 'contact_form',
                payload: input,
                createdAt: new Date(),
            });
            return { success: true, message: 'Message received!' };
        } catch (error) {
            console.error(error);
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Could not save lead.',
            });
        }
    },
});
