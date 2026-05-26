# Free Stack Plan: Next.js + D1 + R2

This portfolio is intentionally kept on a free Cloudflare-friendly stack.

## Goal

Keep the site simple to operate while still making the admin dashboard dynamic.

## Recommended Stack

- **Frontend + backend:** Next.js App Router
- **Database:** Cloudflare D1
- **File storage:** Cloudflare R2
- **Deployment:** Cloudflare free tier through the existing OpenNext path

## Why this stack

- One codebase for the public site and admin panel
- No separate backend server to maintain
- D1 is enough for portfolio content and admin records
- R2 is enough for images, PDFs, and uploaded assets
- Fits a small personal website without premium services

## Data Model

Use D1 tables for structured content:

- `admins` — admin login data and roles
- `projects` — project title, description, stack, live URL, R2 image key, featured flag, status
- `services` — service title, description, price, status, sort order
- `messages` — contact form submissions and reply status
- `settings` — site-wide config such as hero text, social links, and SEO defaults
- `uploads` — metadata for R2 objects, including file name, key, type, and size

## API Plan

Keep the backend inside Next.js Route Handlers.

Suggested routes:

- `GET /api/admin/overview` — summary counts and latest activity
- `GET /api/projects` / `POST /api/projects` — list and create projects
- `GET /api/projects/:id` / `PATCH /api/projects/:id` / `DELETE /api/projects/:id` — project CRUD
- `GET /api/services` / `POST /api/services` — list and create services
- `GET /api/services/:id` / `PATCH /api/services/:id` / `DELETE /api/services/:id` — service CRUD
- `GET /api/messages` / `PATCH /api/messages/:id` — contact inbox management
- `GET /api/settings` / `PATCH /api/settings` — site configuration
- `POST /api/uploads/presign` or `POST /api/uploads` — upload flow for R2 assets

## Admin Workflow

1. Admin logs in through a simple session-based form.
2. Dashboard reads from D1 through server-side route handlers.
3. Admin edits content in the dashboard.
4. Changes are saved to D1.
5. Uploaded files go to R2 and only the object key is stored in D1.
6. Public pages read the latest data from D1 and R2.

## R2 Usage

Store only file assets in R2:

- project thumbnails
- hero/profile images
- resume PDF
- any future downloadable media

Keep metadata in D1, not in the bucket.

## Rollout Plan

### Phase 1: Foundation

- Add D1 binding
- Add R2 binding
- Add basic admin auth
- Create the first read-only API routes

### Phase 2: Content Management

- Wire projects CRUD
- Wire services CRUD
- Wire messages inbox
- Wire settings save/load

### Phase 3: Media Handling

- Add R2 upload flow
- Replace hardcoded image paths with stored asset keys
- Add upload validation for file type and size

### Phase 4: Polish

- Improve dashboard charts and summaries
- Add search/filter/sort controls
- Add basic audit history if needed

## Deployment Steps

1. Configure the Cloudflare project.
2. Create the D1 database.
3. Create the R2 bucket.
4. Add bindings in `wrangler.toml`.
5. Test locally with the Cloudflare development workflow.
6. Deploy through the existing OpenNext path.

## Required Environment Values

For local Next.js route handlers, keep these server-side variables in `.env.local`:

- `CF_ACCOUNT_ID`
- `CF_API_TOKEN`
- `D1_DATABASE_ID`
- `R2_BUCKET_NAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Optional, only if you later add direct S3-compatible R2 access from Node.js:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

## Practical Recommendation

For this portfolio, stay with:

- Next.js route handlers for backend logic
- D1 for all structured data
- R2 for files

This is enough, stays free-friendly, and avoids the overhead of a separate backend stack.