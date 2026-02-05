/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                // Semantic System (Mapped to CSS Variables)
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                background: 'var(--color-background)',
                surface: 'var(--color-surface)',
                'text-main': 'var(--color-text-main)',
                'text-muted': 'var(--color-text-muted)',

                // Legacy / Admin Support
                dark: '#1a1a1a',
                paper: '#fcfbf9',
            },
            fontFamily: {
                // Semantic Typography
                heading: ['var(--font-heading)', 'sans-serif'],
                body: ['var(--font-body)', 'sans-serif'],

                // Legacy / Admin Support
                mono: ['"Courier New"', 'Courier', 'monospace'],
                sans: ['"Inter"', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'lofi': '4px 4px 0px 0px rgba(0,0,0,1)',
                'lofi-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
            }
        },
    },
    plugins: [],
}
