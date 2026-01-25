# Start Prompt

Skopiuj poniższy prompt i wklej go do swojego asystenta AI, aby skonfigurować nowy projekt na bazie tego startera.

---

**Prompt:**

Start a new project using this `astro-agency-starter` template.
Your goal is to configure the project variables and environment.

Please set up the following configuration files with the provided variables.
Do NOT run any build commands (`npm install`, `pnpm install`, `npm run build`, etc.). ONLY update the files.

**1. Update `.env` file:**
Please populate `.env` with the following values:

```env

# Storage (Cloudflare R2)
R2_ACCESS_KEY=var
R2_SECRET_KEY=var
R2_ENDPOINT=var
PUBLIC_R2_URL=var

# Email (Resend)
RESEND_API_KEY=var


# Site Configuration
PUBLIC_SITE_URL=var
```

**2. Update `wrangler.toml` file:**
Please update the following fields in `wrangler.toml`:

```toml
name = "var" # (Project Name)

[[d1_databases]]
binding = "DB"
database_name = "var"
database_id = "var"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "var"
```

**3. Update `package.json` file:**
Update the project name:
```json
"name": "var"
```

**4. Update `astro.config.mjs` file:**
Update the site URL (should match PUBLIC_SITE_URL):
```javascript
site: 'var'
```

**5. Update `src/utils/media.ts` file:**
Update the hardcoded R2 bucket name to match your new bucket:
```typescript
// Look for lines containing the bucket name and update them
// e.g. url += 'astro-agency-starter-bucket?list-type=2...';
url += 'var?list-type=2&max-keys=50'; 
// AND
url += `var/${encodeURIComponent(key)}`;
```

**6. Update `db/schema.sql` file:**
Update the default seed data with the new client's information:
```sql
INSERT OR REPLACE INTO SiteConfig (key, value) VALUES 
    ('site_info', '{"name":"var","description":"var"}'),
    ('owner_email', '{"email": "var"}'),
    -- ... other values
```

**Instructions for AI:**
1.  Ask me for the values for each `var` listed above if I haven't provided them yet.
2.  Once you have the values, update the respective files (`.env`, `wrangler.toml`, `package.json`, `astro.config.mjs`).
3.  Confirm when the files are updated.
