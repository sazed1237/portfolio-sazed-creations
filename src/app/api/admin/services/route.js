import { NextResponse } from 'next/server';
import { createAdminService, getAdminServices } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const services = await getAdminServices();
    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        summary: {
          total: 0,
          active: 0,
          draft: 0,
          avgConversion: 0,
        },
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
    const result = await createAdminService(payload);
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
