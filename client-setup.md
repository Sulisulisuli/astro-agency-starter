# Client Setup Guide

This document describes the step-by-step process of configuring `astro-agency-starter` for a new client.

## 1. Cloudflare Setup (Infrastructure)

Before you start working with the code, you must prepare the infrastructure in Cloudflare.

1.  **Log in to the Cloudflare Dashboard**.
2.  **Workers & Pages** -> **D1 SQL Database**:
    *   Create a new database.
    *   **Name**: `[client-name]-db` (e.g., `flower-shop-db`).
    *   Copy the `Database ID`.
3.  **R2 Object Storage**:
    *   Create a new bucket.
    *   **Name**: `[client-name]-assets` (e.g., `flower-shop-assets`).
    *   In the bucket settings, add CORS configuration (allow access from the public domain or `*` for testing).

## 2. Project Configuration (Find & Replace)

Here is the list of files you need to edit to adapt the project for a new client.

### A. `wrangler.toml` (Key Bindings)
Update the configuration so the project connects to the new client's resources.

```toml
[[d1_databases]]
binding = "DB"
database_name = "[NEW-DB-NAME]" # e.g., flower-shop-db
database_id = "[NEW-DATABASE-ID]"  # Paste ID from Cloudflare

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "[NEW-BUCKET-NAME]" # e.g., flower-shop-assets
```

### B. `astro.config.mjs` (Site URL)
Change the domain so that the sitemap and SEO work correctly.

```javascript
export default defineConfig({
  // ...
  site: 'https://[CLIENT-DOMAIN].com',
});
```

### C. `db/seed.ts` (Default Content)
This is the most important file. It defines the 'Starter' state of the site after deployment. Edit it to match the client's branding.

*   `site_info`: Change `name` (Company Name) and `description`.
*   `theme`: Change colors (`primary`, `secondary`) to the client's brand colors.
*   `seo`: Change `twitterHandle`, leads, etc.

### D. `.env` (Secrets)
Copy `.env.example` to `.env` and fill in the API keys.
*   `R2_ACCESS_KEY` / `SECRET`: Required for file uploads (generate in Cloudflare R2 -> Manage API Tokens).
*   `RESEND_API_KEY`: If you are configuring email sending.

### E. `tailwind.config.mjs` (Colors & Branding)
This project uses a "Lofi / Neo-Brutalism" aesthetic by default.
- To change the primary/background colors, update the `colors` object in `tailwind.config.mjs`.
- The **Public Site** uses the `paper` color and `mono` fonts.
- The **Admin Panel** uses standard Tailwind grays and `sans` (Inter) fonts.

## 3. Deployment

### Step 1: Push Database Schema
You must inform D1 about the table structure.

```bash
npx astro db push --remote
```

*You will be asked to confirm the creation of the database in production.*

### Step 2: Seed Initial Data
Populate the empty database with data defined in `db/seed.ts`.

```bash
npx astro db execute db/seed.ts --remote
```

### Step 3: Publish Site
Build and deploy the files to Cloudflare Pages.

```bash
npm run build
npx wrangler pages deploy dist
```

## 4. Admin Handoff

After deployment:
1.  Go to `https://[PROJECT-DOMAIN].pages.dev/admin`.
2.  Check if the configuration (colors, texts) loaded correctly.
3.  Test logo/image upload in the Media tab.
4.  Test the contact form on the homepage.

**Done! The new client has a fully functional website.**
