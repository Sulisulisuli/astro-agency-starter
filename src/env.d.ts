
/// <reference path="../.astro/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
    DB: import('@cloudflare/workers-types').D1Database;
    RESEND_API_KEY: string;
    EMAIL_DOMAIN: string;
    STORAGE: import('@cloudflare/workers-types').R2Bucket;
    PUBLIC_R2_URL?: string;
    R2_BUCKET_DOMAIN?: string;
}

declare namespace App {
    interface Locals extends Runtime {
        user?: import('./lib/auth').User;
        session?: import('./lib/auth').Session;
    }
}
