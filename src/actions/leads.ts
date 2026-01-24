import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { getDBFromContext } from '../utils/db';
import { Resend } from 'resend';



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
            // 1. Save to Database
            await db.prepare('INSERT INTO Leads (type, payload, createdAt) VALUES (?, ?, ?)')
                .bind('contact_form', JSON.stringify(input), new Date().toISOString())
                .run();

            // Get vars from Cloudflare runtime or local env
            const runtimeEnv = (context.locals as any)?.runtime?.env || {};
            const ownerEmail = runtimeEnv.OWNER_EMAIL || import.meta.env.OWNER_EMAIL;
            const resendApiKey = runtimeEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

            if (!resendApiKey) {
                console.error('RESEND_API_KEY is missing. Skipping email sending.');
                return { success: true, message: 'Message received (Email skipped)' };
            }

            const resend = new Resend(resendApiKey);

            console.log('Attempting to send email to:', ownerEmail || 'fallback (delivered@resend.dev)');
            console.log('Sending from:', 'Your Website lead <system@notifications.niuans.studio>');

            // 2. Send Email Notification
            const { data, error } = await resend.emails.send({
                from: 'Your Website lead <system@notifications.niuans.studio>', // Change to your verified domain in production
                to: [ownerEmail || 'delivered@resend.dev'],
                subject: `New Lead: ${input.email}`,
                html: `
                    <h1>New contact form message</h1>
                    <p><strong>From:</strong> ${input.email}</p>
                    <p><strong>Message:</strong></p>
                    <p>${input.message}</p>
                `,
            });

            if (error) {
                console.error('Resend Error:', error);
                // Optional: throw error if email is critical
                // throw new Error(error.message);
            }

            return { success: true, message: 'Message received and email sent!' };
        } catch (error) {
            console.error(error);
            throw new ActionError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Could not save lead or send email.',
            });
        }
    },
});
