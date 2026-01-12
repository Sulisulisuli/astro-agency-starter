import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, SiteConfig, eq } from 'astro:db';

export const update = defineAction({
    accept: 'form',
    input: z.object({
        key: z.string(),
        value: z.string(), // We accept string and try to parse it as JSON
    }),
    handler: async ({ key, value }) => {
        let finalValue = value;
        try {
            finalValue = JSON.parse(value);
        } catch (e) {
            // Not valid JSON, save as string
        }

        try {
            await db.update(SiteConfig)
                .set({ value: finalValue })
                .where(eq(SiteConfig.key, key));
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
