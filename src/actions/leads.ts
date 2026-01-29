import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { getDBFromContext } from '../utils/db';
import { Resend } from 'resend';



export const create = defineAction({
    accept: 'form',
    input: z.object({
        email: z.string().email(),
        message: z.string().min(2),
        'bot-field': z.string().optional(),
    }),
    handler: async (input, context) => {
        // Honeypot check
        if (input['bot-field']) {
            console.warn(`Spam detected (honeypot): ${input.email}`);
            // Return fake success to confuse bots
            return { success: true, message: 'Message received!' };
        }

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
                .bind('contact_form', JSON.stringify({ email: input.email, message: input.message }), new Date().toISOString())
                .run();

            // Get vars from Cloudflare runtime or local env
            // Get vars from Cloudflare runtime or local env
            const runtimeEnv = (context.locals as any)?.runtime?.env || {};
            const resendApiKey = runtimeEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

            // Fetch notification emails from DB setting
            let ownerEmail = 'delivered@resend.dev'; // Default fallback
            try {
                const configResult = await db.prepare("SELECT value FROM SiteConfig WHERE key = 'notification_emails'").first();
                if (configResult && configResult.value) {
                    const parsed = JSON.parse(configResult.value as string);
                    if (parsed.email) ownerEmail = parsed.email;
                } else {
                    console.warn('No notification_emails config found in DB.');
                }
            } catch (e) {
                console.warn('Could not fetch notification_emails from DB, using fallback.');
            }

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
                to: ownerEmail ? ownerEmail.split(',').map((e: string) => e.trim()) : ['delivered@resend.dev'],
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
