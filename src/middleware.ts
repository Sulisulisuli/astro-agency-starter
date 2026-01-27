
import { defineMiddleware } from 'astro/middleware';
import { validateSession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, locals, cookies } = context;
    const runtime = locals.runtime;

    // 1. D1 Availability check (important for local dev without dev server running properly)
    if (!runtime?.env?.DB) {
        // If no DB binding (e.g. static build or misconfig), pass through but log warning 
        // real protection happens at runtime.
        return next();
    }

    // 2. Protected Routes Logic
    // Protect everything under /admin, EXCEPT:
    // - /admin/login (infinite redirect loop otherwise)
    // - /api/auth/* (login endpoints)
    if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {

        const sessionId = cookies.get('session_id')?.value;

        if (!sessionId) {
            return context.redirect('/admin/login');
        }

        const { session, user } = await validateSession(runtime.env.DB, sessionId);

        if (!session || !user) {
            // Invalid or expired session
            cookies.delete('session_id', { path: '/' });
            return context.redirect('/admin/login');
        }

        // Attach user to locals so pages can access it
        locals.user = user;
        locals.session = session;
    }

    return next();
});
