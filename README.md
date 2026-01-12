# Astro Agency Starter (v1.3).1

A production-ready starter kit for agencies, built with Astro (Hybrid), Cloudflare Pages, Astro DB, and R2.

![Astro](https://img.shields.io/badge/astro-v5.0-orange) ![Cloudflare](https://img.shields.io/badge/cloudflare-pages-orange) ![Status](https://img.shields.io/badge/status-stable-green)

## Features

- **Framework**: Astro (Hybrid Mode)
- **Database**: Astro DB (backed by D1 on Cloudflare, SQLite locally)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Styling**: Tailwind CSS with Dual-Theme System:
    - **Public**: Lofi / Neo-Brutalism (Mono font, sharp borders, noise texture).
    - **Admin**: Clean SaaS / Corporate (Inter font, clean UI).
- **Admin**: SSR Dashboard for content & lead management
- **SEO**: Dynamic JSON-LD, Sitemap, Robots.txt
- **Zero JS Frontend**: Public pages use 0kb client-side JS (except progressive forms)

## Prerequisites

- Node.js v20+
- Cloudflare Account
- Wrangler CLI (`npm install -g wrangler`)

## Quick Start (Local)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and fill in necessary keys for R2 (required for Media Upload).
   ```bash
   cp .env.example .env
   ```
   *Note: For local development without R2, the Media Upload feature will fail unless you provide R2/S3 keys.*

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Astro DB will automatically initialize a local SQLite database and seed it with `db/seed.ts`.

4. **Access Admin**
   Navigate to `http://localhost:4321/admin`.

## Deployment (Cloudflare)

### 1. Cloudflare Resources
Create your resources in the Cloudflare Dashboard:
- **D1 Database**: Create a DB named `astro-agency-db`.
- **R2 Bucket**: Create a bucket named `astro-agency-assets`.

### 2. Configure Wrangler
Update `wrangler.toml` with your IDs:
```toml
[[d1_databases]]
binding = "DB"
database_name = "astro-agency-db"
database_id = "YOUR_D1_DATABASE_ID" # <--- Update this

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "astro-agency-assets"
```

### 3. Deploy
You can deploy using Wrangler or connect your Git repo to Cloudflare Pages.

**Option A: Direct Upload (Wrangler)**
```bash
# Push database schema to Cloudflare D1
npx astro db push --remote

# Build the project
npm run build

# Deploy to Pages
npx wrangler pages deploy dist
```

**Option B: Git Integration (Recommended)**
1. Push code to GitHub/GitLab.
2. Create a Cloudflare Pages project.
3. Connect repository.
4. Settings > Functions > Compatibility Flags: Ensure `nodejs_compat` is enabled if needed (usually handled by adapter).
5. **Environment Variables**: Add `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_ENDPOINT`, `PUBLIC_R2_URL` to Pages Settings.
6. **Bindings**: Link D1 and R2 in Pages Settings > Functions > D1 Database Bindings / R2 Bucket Bindings.

## Structure

- `src/layouts/BaseLayout.astro`: Public layout with Lofi styling.
- `src/layouts/AdminLayout.astro`: Admin layout with clean SaaS styling.
- `src/styles/`: Contains `global.css` (Tailwind directives).
- `src/pages/admin/`: SSR Admin dashboard (protected by Cloudflare Access recommended).
- `db/config.ts`: Database Schema.
- `src/actions/`: Server Actions for Forms & Uploads.

## Architecture Notes

- **Hybrid Mode**: `prerender = true` is default. Admin pages are `prerender = false`.
- **Site Config**: Stored in DB table `SiteConfig`. Modify via Admin.
- **Leads**: Contact forms save to `Leads` table.

## License

MIT
