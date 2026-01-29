# Astro Agency Starter - LLM Context

## Project Overview
This is `astro-agency-starter`, a high-performance, serverless starter kit designed for digital agencies.
- **Stack**: Astro 5 (Server Mode), Cloudflare Pages, Cloudflare D1 (Database), Cloudflare R2 (Storage).
- **Styling**: Tailwind CSS (Lofi/Neo-Brutalist preset).
    - **Global Styles**: `src/styles/global.css`.
    - **Differentiation**: 
        - Public Site = Lofi aesthetic (`BaseLayout.astro` + `paper` theme).
        - Admin Panel = Clean SaaS aesthetic (`AdminLayout.astro` + `Inter` font).
- **Interactivity**: Vanilla JavaScript (0KB framework overhead on public pages).

## Architecture & Conventions

### 1. Database (Direct D1 Access)
> **IMPORTANT**: This project uses **direct Cloudflare D1 bindings**, NOT `@astrojs/db`.

- **Engine**: Cloudflare D1 (SQLite-based, accessed via bindings).
- **Schema**: Defined in `db/schema.sql` (executed via wrangler).
    - `SiteConfig`: Key-Value storage for dynamic site settings (Title, Description, Scripts).
    - `Users` / `Sessions` / `VerificationCodes`: Custom Authentication system.
    - `Leads`: Stores contact form submissions.
    - `SystemLogs`: Optional logging table.
- **Access Pattern**: Use `getDB(Astro)` from `src/utils/db.ts` in pages, or `getDBFromContext(context)` in actions.
- **Queries**: Use D1 prepared statements:
  ```typescript
  const db = getDB(Astro);
  const result = await db.prepare('SELECT * FROM SiteConfig').all();
  ```

### 2. Infrastructure (Cloudflare)
- **Deployment**: Deploys to Cloudflare Pages.
- **Configuration**: `wrangler.toml` manages bindings:
    - `DB`: The D1 database binding (MUST be configured in Pages Settings too!).
    - `STORAGE`: The R2 bucket binding.
- **Compatibility**: `nodejs_compat` flag is required in `wrangler.toml`.
- **Server-Side Rendering**: Enabled via `@astrojs/cloudflare` adapter (`output: 'server'`). Used for:
    - All pages that need database access.
    - Admin Dashboard (`src/pages/admin/*`).
    - API Actions (`src/actions/*`).

### 3. State & Logic
- **Forms**: We use [Astro Actions](https://docs.astro.build/en/guides/actions/) for all form handling (`src/actions/`).
    - **Do NOT** create API routes (`pages/api/...`) unless absolutely necessary for external webhooks.
- **Frontend JS**: Write Vanilla JS inside `<script>` tags in `.astro` components.
    - Avoid adding React/Vue/Alpine.js to keep the site lightweight.
- **DB Utility**: Always import from `src/utils/db.ts`:
  ```typescript
  import { getDB } from '../utils/db';
  const db = getDB(Astro);
  ```

### 4. Admin Panel
- Located at `/admin`.
- Is fully Server-Side Rendered (`prerender = false`).
- Direct access to DB and R2 via server-side logic.

## Key Files
- `src/utils/db.ts`: **D1 database helper** - provides `getDB()` and `getDBFromContext()`.
- `src/layouts/BaseLayout.astro`: The master template. Injects dynamic colors/content from `SiteConfig`.
- `src/actions/media.ts`: Handles R2 uploads using dynamic import of `@aws-sdk/client-s3`.
- `src/actions/index.ts`: The central export for all server actions.
- `wrangler.toml`: Cloudflare bindings (D1, R2, compatibility flags).

## Workflow for LLMs (You)
When asked to modify this project:
1. **Use `src/utils/db.ts`** for any database access - never import from `astro:db`.
2. **Write raw SQL** for queries (D1 prepared statements).
3. **Use Astro Actions** for any backend logic or data mutation.
4. **Respect the "Zero JS" rule** for public-facing components.
5. **Update `wrangler.toml`** if new Cloudflare resources are needed.
6. **Remember**: D1 bindings must be configured BOTH in `wrangler.toml` AND Cloudflare Pages Dashboard.
