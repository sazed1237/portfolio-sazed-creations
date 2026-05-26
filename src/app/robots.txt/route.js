import { NextResponse } from 'next/server';

export function GET() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sazedulislam.me';
  const sitemapUrl = SITE_URL.replace(/\/$/, '') + '/sitemap.xml';
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n\n# If you need private paths, disallow them here, e.g.\n# Disallow: /admin\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
