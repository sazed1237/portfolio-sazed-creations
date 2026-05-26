# SEO Audit Report — Sazedul Islam Portfolio

Date: 2026-05-26

## Summary
- Pages scanned: /, /projects, /projects/[slug], /blog, /blog/[slug], /services, /resume, /contact, admin dashboard pages.
- Global metadata: root layout provides site metadata, OpenGraph, Twitter, robots and JSON-LD WebSite.
- Dynamic sitemap: implemented at `/sitemap.xml` (server route).

## Per-page checklist
- Columns: Page | Metadata | OpenGraph/Twitter | JSON-LD | H1 present | Images with ALT | Notes

- / (Home)
  - Metadata: `generateMetadata` present
  - OpenGraph/Twitter: present
  - JSON-LD: global WebSite JSON-LD included
  - H1 present: yes (`Sazedul Islam` in Home component)
  - Images with ALT: main photo has `alt`
  - Notes: Good.

- /projects (listing)
  - Metadata: `generateMetadata` present
  - OpenGraph/Twitter: present
  - JSON-LD: not per-listing (ok)
  - H1 present: listing component shows H2/H3; project detail pages have H1
  - Images with ALT: `next/image` usages include `alt`
  - Notes: Consider adding brief meta description for individual project cards.

- /projects/[slug] (detail)
  - Metadata: `generateMetadata` implemented
  - OpenGraph/Twitter: implemented
  - JSON-LD: `CreativeWork` JSON-LD injected
  - H1 present: yes
  - Images with ALT: project thumb has `alt`
  - Notes: Good.

- /blog (listing)
  - Metadata: `generateMetadata` implemented
  - OpenGraph/Twitter: implemented
  - JSON-LD: global WebSite JSON-LD covers site; consider adding `BreadcrumbList` for posts
  - H1 present: yes
  - Images with ALT: listing cards use `alt` where `thumb` exists
  - Notes: Good.

- /blog/[slug] (post)
  - Metadata: `generateMetadata` implemented
  - OpenGraph/Twitter: implemented per-post
  - JSON-LD: `BlogPosting` JSON-LD injected
  - H1 present: yes
  - Images with ALT: cover and injected blog images use `alt` ("Blog content image" or post title)
  - Notes: Good; consider improving `alt` on in-body images if they convey meaning (stored content still needs editorial control).

- /services, /resume, /contact
  - Metadata: `generateMetadata` added
  - OpenGraph/Twitter: basic
  - JSON-LD: global WebSite JSON-LD present
  - H1 present: varies inside components (Resume has H1)
  - Images with ALT: reviewed — OK

- Admin pages
  - Not intended for indexing; ensure `robots` disallow if you want them private.

## Automatic fixes applied
- Added global metadata + OpenGraph/Twitter in `src/app/layout.jsx`
- Added per-page `generateMetadata` to major pages: home, blog, blog post, projects listing and detail, services, resume, contact
- Injected `BlogPosting` JSON-LD into blog post pages and `CreativeWork` JSON-LD into project pages
- Implemented dynamic sitemap at `src/app/sitemap.xml/route.js` that lists static pages, projects, and blog posts
- Added `/blog` to `public/sitemap.xml` (static) — consider removing static file to avoid duplicates

## Remaining recommendations (optional, high priority)
1. Remove or update the static `public/sitemap.xml` to avoid duplicate sitemap entries (or update `robots.txt` to point to the dynamic sitemap only).
2. Create `BreadcrumbList` JSON-LD for multi-level pages (project and blog detail pages).
3. Generate programmatic OpenGraph images per post (og-image) for better social previews.
4. Consider canonical link headers for pages that can be accessed with multiple parameters.
5. Set `noindex` for `/admin` pages if you don't want search engines to index them.
6. Run Lighthouse SEO audits and fix any accessibility/SEO flagged items (contrast, link text, etc.).

## Actions I can take next (select):
- Remove static sitemap or update `robots.txt` to point to dynamic sitemap only.
- Add `BreadcrumbList` JSON-LD to posts and projects.
- Generate an automated Lighthouse audit report in CI.
- Create per-post OG images automatically using a template.


---

If you want me to proceed with any of the remaining recommendations, tell me which and I will implement it next.
