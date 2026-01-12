import { db, SiteConfig } from 'astro:db';

export default async function seed() {
    await db.insert(SiteConfig).values([
        {
            key: 'site_info',
            value: {
                name: 'Nebula Agency',
                description: 'Building the web of tomorrow, today.',
                url: 'https://nebula.agency'
            }
        },
        {
            key: 'theme',
            value: {
                primary: '#6366f1',
                secondary: '#4338ca',
                accent: '#f43f5e'
            }
        },
        {
            key: 'seo',
            value: {
                twitterHandle: '@nebula_agency',
                ogImage: '/og-default.jpg'
            }
        }
    ]);
}
