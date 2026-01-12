# Astro Agency Starter - LLM Context

## Project Overview
This is `astro-agency-starter`, a high-performance, serverless starter kit designed for digital agencies.
- **Stack**: Astro 5 (Static/Hybrid), Cloudflare Pages, Cloudflare D1 (Database), Cloudflare R2 (Storage).
- **Styling**: Tailwind CSS (Lofi/Neo-Brutalist preset).
    - **Global Styles**: `src/styles/global.css`.
    - **Differentiation**: 
        - Public Site = Lofi aesthetic (`BaseLayout.astro` + `paper` theme).
        - Admin Panel = Clean SaaS aesthetic (`AdminLayout.astro` + `Inter` font).
- **Interactivity**: Vanilla JavaScript (0KB framework overhead on public pages).

## Architecture & Conventions

### 1. Database (Astro DB)
- **Engine**: We use `@astrojs/db` which maps to SQLite locally and Cloudflare D1 in production.
- **Schema**: Defined in `db/config.ts`.
    - `SiteConfig`: Key-Value storage for dynamic site settings (Title, Description, Colors).
    - `Leads`: Stores contact form submissions.
- **Migration**: Changes to schema require `npx astro db push`.
- **Seeding**: Initial data is in `db/seed.ts`.

### 2. Infrastructure (Cloudflare)
- **Deployment**: Deploys to Cloudflare Pages.
- **Configuration**: `wrangler.toml` manages bindings found in code.
    - `DB`: The D1 database binding.
    - `ASSETS`: The R2 bucket binding.
- **Server-Side Rendering**: Enabled via `@astrojs/cloudflare` adapter. Used primarily for:
    - Admin Dashboard (`src/pages/admin/*`).
    - API Actions (`src/actions/*`).
    - Contact Form processing.

### 3. State & Logic
- **Forms**: We use [Astro Actions](https://docs.astro.build/en/guides/actions/) for all form handling (`src/actions/`).
    - **Do NOT** create API routes (`pages/api/...`) unless absolutely necessary for external webhooks.
- **Frontend JS**: Write Vanilla JS inside `<script>` tags in `.astro` components.
    - Avoid adding React/Vue/Alpine.js to keep the site lightweight.

### 4. Admin Panel
- Located at `/admin`.
- Is fully Server-Side Rendered (`prerender = false`).
- Direct access to DB and R2 via server-side logic.

## Key Files
- `src/layouts/BaseLayout.astro`: The master template. Injects dynamic colors/content from `SiteConfig`.
- `src/actions/media.ts`: Handles R2 uploads using `@aws-sdk/client-s3`.
- `src/actions/index.ts`: The central export for all server actions.

## Workflow for LLMs (You)
When asked to modify this project:
1. **Check `db/config.ts`** first if the request involves data storage.
2. **Use Astro Actions** for any backend logic or data mutation.
3. **Respect the "Zero JS" rule** for public-facing components.
4. **Update `wrangler.toml`** if new Cloudflare resources are needed.
