import { NextResponse } from 'next/server';
import { getAdminPosts, createAdminPost } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const posts = await getAdminPosts();
    return NextResponse.json(posts, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ source: 'error', items: [], summary: {}, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await createAdminPost(payload);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ source: 'error', saved: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
