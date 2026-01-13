import type { AstroGlobal } from 'astro';

/**
 * Gets the D1 database binding from Astro context.
 * Works in both Cloudflare Pages runtime and local development with wrangler.
 */
export function getDB(Astro: AstroGlobal): any {
    try {
        // @ts-ignore - runtime.env is injected by Cloudflare adapter
        return Astro.locals?.runtime?.env?.DB || null;
    } catch {
        return null;
    }
}

/**
 * Helper to get D1 from action context
 */
export function getDBFromContext(context: any): any {
    try {
        return context.locals?.runtime?.env?.DB || null;
    } catch {
        return null;
    }
}
