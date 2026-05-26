import { NextResponse } from 'next/server';
import { createAdminClient, getAdminUsers } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const users = await getAdminUsers();
    return NextResponse.json(users, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        summary: { total: 0, active: 0, pending: 0, partners: 0 },
        items: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await createAdminClient(payload);
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
