import { NextResponse } from 'next/server';
import { deleteAdminClient, updateAdminClient } from '@/lib/cloudflare-d1';

export async function PATCH(request, { params }) {
  try {
    const payload = await request.json();
    const result = await updateAdminClient(params.id, payload);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        saved: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const result = await deleteAdminClient(params.id);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        saved: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
