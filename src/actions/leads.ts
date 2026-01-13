import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { getDBFromContext } from '../utils/db';

export const create = defineAction({
    accept: 'form',
    input: z.object({
        email: z.string().email(),
        message: z.string().min(2),
    }),
    handler: async (input, context) => {
        const db = getDBFromContext(context);
        if (!db) {
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Database not available',
            });
        }

        try {
            await db.prepare('INSERT INTO Leads (type, payload, createdAt) VALUES (?, ?, ?)')
                .bind('contact_form', JSON.stringify(input), new Date().toISOString())
                .run();
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
