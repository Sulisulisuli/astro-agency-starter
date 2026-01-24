import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    // Only apply to /admin routes
    if (context.url.pathname.startsWith('/admin')) {

        // Skip check in development mode
        if (import.meta.env.DEV) {
            return next();
        }

        // In Production (Cloudflare), check for Access header
        const email = context.request.headers.get('CF-Access-Authenticated-User-Email');

        if (!email) {
            // Request didn't go through Cloudflare Access or user not logged in
            return new Response('Forbidden: Access Denied', { status: 403 });
        }

        // Optional: Check against a disallowed list if you needed stricter control here
        // const allowedEmails = context.locals.runtime.env.ALLOWED_EMAILS?.split(',') || [];
        // if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
        //    return new Response('Forbidden: Unauthorized User', { status: 403 });
        // }
    }

    return next();
});
