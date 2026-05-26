import { NextResponse } from 'next/server';
import { getPublicProjects, getPublicPosts } from '@/lib/cloudflare-d1';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sazedulislam.me';

  const [projectsRes, postsRes] = await Promise.all([getPublicProjects(), getPublicPosts(1000)]);
  const projects = (projectsRes?.items) || [];
  const posts = (postsRes?.items) || [];

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.00' },
    { loc: `${SITE_URL}/projects`, priority: '0.80' },
    { loc: `${SITE_URL}/blog`, priority: '0.80' },
    { loc: `${SITE_URL}/services`, priority: '0.70' },
    { loc: `${SITE_URL}/resume`, priority: '0.70' },
    { loc: `${SITE_URL}/contact`, priority: '0.70' },
  ];

  const projectUrls = projects.map((p) => ({
    loc: `${SITE_URL}/projects/${encodeURIComponent((p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')))}`,
    lastmod: p.updatedAt || p.updated_at || undefined,
    priority: '0.65',
  }));

  const postUrls = posts.map((p) => ({
    loc: `${SITE_URL}/blog/${encodeURIComponent((p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')))}`,
    lastmod: p.updatedAt || p.updated_at || undefined,
    priority: '0.70',
  }));

  const urls = [...staticUrls, ...projectUrls, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => {
      return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${escapeXml(new Date(u.lastmod).toISOString())}</lastmod>` : ''}\n    <priority>${u.priority}</priority>\n  </url>`;
    })
    .join('\n')}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
