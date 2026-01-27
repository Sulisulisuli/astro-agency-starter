
import type { APIRoute } from 'astro';
import {
    createVerificationCode,
    verifyOTP,
    getUserByEmail,
    createSession,
    invalidateSession,
    createUser
} from '../../../lib/auth';
import { sendLoginEmail } from '../../../lib/email';

export const POST: APIRoute = async ({ request, locals, cookies, params }) => {
    const action = params.action;
    const env = locals.runtime.env;

    // 1. Send Code
    if (action === 'send-code') {
        try {
            const data = await request.json();
            const email = data.email;

            if (!email || typeof email !== 'string') {
                return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
            }

            // Check if user exists allowed
            console.log(`[AUTH] Attempting login for email: ${email}`);
            let user = await getUserByEmail(env.DB, email);

            // OPTIONAL: For this starter, we might want to auto-create user directly if they don't exist
            // OR stricter: only allow if manually added to DB.
            // Let's implement Strict Mode by default: User must exist in Users table.
            // BUT for first setup, checking if it's the OWNER email from config might be good?
            // Simpler: Just check Users table. If null, reject.

            if (!user) {
                console.log(`[AUTH] User NOT found in DB: ${email}. Strict mode active.`);
                // Security: Don't reveal if user exists. Fake success delay.
                await new Promise(r => setTimeout(r, 1000));
                return new Response(JSON.stringify({ success: true }), { status: 200 });
            }

            console.log(`[AUTH] User found: ${user.id}. Generating code...`);
            const code = await createVerificationCode(env.DB, email);

            // Get Resend config
            // We'll use binding RESEND_API_KEY from env
            const apiKey = env.RESEND_API_KEY;
            const fromEmail = "system@notifications.niuans.studio"; // Default Resend testing email or configured domain

            if (!apiKey) {
                console.error("[AUTH] Missing RESEND_API_KEY");
                return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
            }

            console.log(`[AUTH] Sending email via Resend...`);
            await sendLoginEmail(email, code, apiKey, fromEmail);
            console.log(`[AUTH] Email sent successfully.`);

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            console.error('[AUTH] Error:', e);
            return new Response(JSON.stringify({ error: 'Internal Error' }), { status: 500 });
        }
    }

    // 2. Verify Code
    if (action === 'verify-code') {
        try {
            const data = await request.json();
            const { email, code } = data;

            if (!email || !code) {
                return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
            }

            const isValid = await verifyOTP(env.DB, email, code);
            if (!isValid) {
                return new Response(JSON.stringify({ error: 'Invalid or expired code' }), { status: 401 });
            }

            const user = await getUserByEmail(env.DB, email);
            if (!user) {
                return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 });
            }

            const session = await createSession(env.DB, user.id);

            // Set Cookie
            cookies.set('session_id', session.id, {
                path: '/',
                httpOnly: true,
                secure: true, // Always true in Cloudflare Pages (HTTPS)
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            return new Response(JSON.stringify({ success: true }), { status: 200 });

        } catch (e) {
            console.error(e);
            return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 500 });
        }
    }

    // 3. Logout
    if (action === 'logout') {
        const sessionId = cookies.get('session_id')?.value;
        if (sessionId) {
            await invalidateSession(env.DB, sessionId);
            cookies.delete('session_id', { path: '/' });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response('Not found', { status: 404 });
};
