import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        metricCards: [],
        traffic: [],
        highlights: [],
        goals: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
