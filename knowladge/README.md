# Astro Agency Starter (v2.0)

A production-ready starter kit for agencies, built with Astro (Server Mode), Cloudflare Pages, D1, and R2.

![Astro](https://img.shields.io/badge/astro-v5.0-orange) ![Cloudflare](https://img.shields.io/badge/cloudflare-pages-orange) ![Status](https://img.shields.io/badge/status-stable-green)

## Features

- **Framework**: Astro (Server Mode with SSR)
- **Database**: Cloudflare D1 (direct bindings, raw SQL)
- **Storage**: Cloudflare R2 (S3-compatible, via AWS SDK)
- **Styling**: Tailwind CSS (Lofi/Neo-Brutalism). Colors managed via code/Tailwind config.
- **Admin**: SSR Dashboard with **Custom Auth (Email via Resend)**.
- **Custom Scripts**: Inject Head/Footer code (GTM, Analytics) via Admin.
- **Privacy-First Analytics**: Built-in, cookie-less analytics (Pageviews, Unique Visitors, UTMs, Custom Events) stored in D1.
- **Global Open Graph**: Configure default social share image in Admin.
- **SEO**: Dynamic JSON-LD, Sitemap, Robots.txt
- **Zero JS Frontend**: Public pages use 0kb client-side JS (except progressive forms)
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

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The Cloudflare adapter's `platformProxy` will simulate D1/R2 bindings locally.

4. **Access Admin**
   Navigate to `http://localhost:4321/admin`.

## Deployment (Cloudflare)

### 1. Create Cloudflare Resources
In the Cloudflare Dashboard:
- **D1 Database**: Create a DB named `[your-project]-db`.
- **R2 Bucket**: Create a bucket named `[your-project]-assets`.

### 2. Configure Wrangler
Update `wrangler.toml` with your IDs:
```toml
name = "your-project-name"
pages_build_output_dir = "dist"
compatibility_date = "2024-05-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "your-project-db"
database_id = "YOUR_D1_DATABASE_ID"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "your-project-assets"
```

### 3. Initialize Database
Create `db/schema.sql` with your schema and seed data, then run:
```bash
npx wrangler d1 execute your-project-db --remote --file db/schema.sql
```

### 4. Configure Cloudflare Pages Bindings
**CRITICAL**: You MUST configure bindings in Cloudflare Dashboard:

1. **Settings** -> **Functions** -> **D1 database bindings**:
   - Variable name: `DB`
   - Select your D1 database
2. **R2 bucket bindings**:
   - Variable name: `STORAGE`
   - Select your R2 bucket
3. **Environment Variables**: Add `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_ENDPOINT`, `PUBLIC_R2_URL`.

### 5. Deploy
**Option A: Git Integration (Recommended)**
1. Push code to GitHub.
2. Create a Cloudflare Pages project and connect repository.
3. Build command: `npm run build`
4. Output directory: `dist`

**Option B: Direct Upload**
```bash
npm run build
npx wrangler pages deploy dist
```

## Structure

```
src/
├── utils/
│   └── db.ts          # D1 database helper (getDB, getDBFromContext)
├── layouts/
│   ├── BaseLayout.astro   # Public layout with Lofi styling
│   └── AdminLayout.astro  # Admin layout with SaaS styling
├── pages/
│   ├── admin/         # SSR Admin dashboard
│   └── index.astro    # Homepage
├── actions/           # Server Actions (config, leads, media)
└── styles/
    └── global.css     # Tailwind directives
```

## Database Access

This project uses **direct D1 bindings** (not astro:db). Access the database using:

```typescript
// In .astro pages:
import { getDB } from '../utils/db';
const db = getDB(Astro);
const result = await db.prepare('SELECT * FROM SiteConfig').all();

// In actions:
import { getDBFromContext } from '../utils/db';
const db = getDBFromContext(context);
```

## Architecture Notes

- **Server Mode**: All dynamic pages use `output: 'server'` for SSR.
- **Static Pages**: Use `export const prerender = true` for static generation.
- **Site Config**: Stored in D1 table `SiteConfig`. Modify via Admin. Support for Global Scripts and Open Graph image.
- **Analytics**: Privacy-friendly event tracking logic in `src/pages/api/analytics/track.ts` and `BaseLayout.astro`. Data stored in `AnalyticsEvents` table.
- **Leads**: Contact forms save to `Leads` table.
- **R2 Uploads**: Use lazy-loaded AWS SDK (`await import('@aws-sdk/client-s3')`).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 on all pages | Add `nodejs_compat` to Compatibility Flags in Cloudflare Dashboard |
| "DB not available" | Configure D1 binding in Pages Settings (variable name: `DB`) |
| R2 upload fails | Check R2 credentials in Environment Variables |

## License

MIT
