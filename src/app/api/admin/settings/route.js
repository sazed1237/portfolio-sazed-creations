import { NextResponse } from 'next/server';
import { getAdminSettings, saveAdminSettings } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const settings = await getAdminSettings();
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        profile: {},
        notifications: {},
        security: {},
        actionLog: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await saveAdminSettings(payload);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
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
