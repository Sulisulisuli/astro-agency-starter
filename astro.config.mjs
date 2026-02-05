// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: cloudflare({
        platformProxy: {
            enabled: true,
        },
    }),
    integrations: [
        tailwind(),
        sitemap({
            filter: (page) => page !== "https://example.com/design-system",
            customPages: [], // Ensure no manual addition
            i18n: {
                defaultLocale: 'en',
                locales: { en: 'en' },
            },
            // Note: Astro sitemap logic might need full URL matching or relative path depends on version, usually absolute URL in filter.
            // Simplified filter:
            filter: (page) => !page.includes('/design-system'),
        })
    ],
    site: process.env.PUBLIC_SITE_URL || 'https://example.com', // To be updated by user
});

