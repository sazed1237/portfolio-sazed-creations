import { NextResponse } from 'next/server';
import { getAdminPost, updateAdminPost, deleteAdminPost } from '@/lib/cloudflare-d1';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const post = await getAdminPost(id);
    return NextResponse.json(post, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ source: 'error', item: null, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const result = await updateAdminPost(id, payload);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ source: 'error', saved: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const result = await deleteAdminPost(id);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ source: 'error', deleted: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
