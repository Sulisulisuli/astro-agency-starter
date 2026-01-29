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
name = "[client-project-name]"
pages_build_output_dir = "dist"
compatibility_date = "2024-05-01"
compatibility_flags = ["nodejs_compat"]  # REQUIRED!

[[d1_databases]]
binding = "DB"
database_name = "[NEW-DB-NAME]" # e.g., flower-shop-db
database_id = "[NEW-DATABASE-ID]"  # Paste ID from Cloudflare

[[r2_buckets]]
binding = "STORAGE"
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

### C. Database Schema & Initial Data
This project uses **direct D1 access** (not astro:db). To set up the database:

1. **Create schema file** `db/schema.sql` with your tables:
```sql
CREATE TABLE IF NOT EXISTS SiteConfig (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS Leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    payload TEXT,
    createdAt TEXT
);

-- Insert default config
INSERT OR REPLACE INTO SiteConfig (key, value) VALUES 
    ('site_info', '{"name":"Client Name","description":"Client Description"}'),
    ('notification_emails', '{"email": "client@example.com"}'),
    ('scripts', '{"head": "", "footer": ""}'),
    ('seo', '{"twitterHandle":"@client"}');
```

2. **Push to D1**:
```bash
npx wrangler d1 execute [DB-NAME] --remote --file db/schema.sql
```

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
Execute schema SQL on the remote D1 database:

```bash
npx wrangler d1 execute [DB-NAME] --remote --file db/schema.sql
```

### Step 2: Configure Cloudflare Pages Bindings
**CRITICAL**: Even if `wrangler.toml` has bindings, you MUST also configure them in the Dashboard:

1. Go to **Cloudflare Dashboard** -> **Workers & Pages** -> Your Project.
2. **Settings** -> **Functions** -> **D1 database bindings**:
   - Variable name: `DB`
   - Database: Select your D1 database
3. **R2 bucket bindings**:
   - Variable name: `STORAGE`
   - Bucket: Select your R2 bucket
4. **Compatibility flags** (if not auto-detected):
   - Add `nodejs_compat` to Production and Preview

### Step 3: Deploy Site
Build and deploy via Git push (auto-deploy) or manually:

```bash
npm run build
npx wrangler pages deploy dist
```
```

## 3A. Admin Security (Custom Auth)

The `/admin` section is protected by a built-in authentication system (Email + OTP).

1.  **First Login**:
    *   Navigate to `/admin`.
    *   Enter your email address (must match the seed user in `Users` table or be added manually).
    *   You will receive a 6-digit code via email (delivered by Resend).
    *   Enter the code to log in.

2.  **Adding Admins**:
    *   Currently, admins are managed via the database `Users` table.
    *   To add a new admin, execute an SQL command:
        ```bash
        npx wrangler d1 execute [DB-NAME] --remote --command "INSERT INTO Users (id, email, role) VALUES ('unique-id', 'new-admin@example.com', 'admin')"
        ```

> **Note**: This system replaces the need for Cloudflare Zero Trust for admin access. Ensure `RESEND_API_KEY` is configured correctly for emails to work.

## 4. Admin Handoff

After deployment:
1.  Go to `https://[PROJECT-DOMAIN].pages.dev/admin`.
2.  Check if the configuration (colors, texts) loaded correctly.
3.  Test logo/image upload in the Media tab.
4.  Test the contact form on the homepage.

**Done! The new client has a fully functional website.**

---

## Troubleshooting

### 500 Error on All Pages
- Check if `nodejs_compat` flag is set in Cloudflare Pages Settings.
- Verify D1 binding is configured in Dashboard (not just wrangler.toml).

### "DB not available" Error
- Ensure binding variable name is exactly `DB` (case-sensitive).
- Check that the database exists and was seeded with schema.


### R2 Upload Fails
- Verify R2 credentials in Environment Variables.
- Check bucket name matches in `src/utils/media.ts`.

### Login Issues / 403 Forbidden
- Ensure your email exists in the `Users` table.
- Check `RESEND_API_KEY` if you are not receiving OTP emails.
- Check server logs for any DB connection errors.
