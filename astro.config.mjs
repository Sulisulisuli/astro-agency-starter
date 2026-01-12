// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import db from '@astrojs/db';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    adapter: cloudflare({
        platformProxy: {
            enabled: true,
        },
    }),
    integrations: [
        db(),
        tailwind(),
        sitemap()
    ],
    site: 'https://example.com', // To be updated by user
});
