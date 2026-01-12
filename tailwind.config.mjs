/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                paper: '#fcfbf9',
                dark: '#1a1a1a',
            },
            fontFamily: {
                mono: ['"Courier New"', 'Courier', 'monospace'],
                sans: ['"Inter"', 'system-ui', 'sans-serif'], // Or keep system default
            },
            boxShadow: {
                'lofi': '4px 4px 0px 0px rgba(0,0,0,1)',
                'lofi-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
            }
        },
    },
    plugins: [],
}
