import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { getDBFromContext } from '../utils/db';

export const update = defineAction({
    accept: 'form',
    input: z.object({
        key: z.string(),
        value: z.string(), // We accept string and try to parse it as JSON
    }),
    handler: async ({ key, value }, context) => {
        const db = getDBFromContext(context);
        if (!db) {
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Database not available',
            });
        }

        let finalValue = value;
        try {
            // Validate JSON
            JSON.parse(value);
            finalValue = value; // Keep as JSON string for storage
        } catch (e) {
            // Not valid JSON, wrap as string
            finalValue = JSON.stringify(value);
        }

        try {
            await db.prepare('UPDATE SiteConfig SET value = ? WHERE key = ?')
                .bind(finalValue, key)
                .run();
            return { success: true };
        } catch (error) {
            console.error(error);
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update config.',
            });
        }
    },
});
