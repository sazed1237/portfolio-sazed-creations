import { NextResponse } from 'next/server';
import { getPublicServices } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const services = await getPublicServices();

    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        items: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}