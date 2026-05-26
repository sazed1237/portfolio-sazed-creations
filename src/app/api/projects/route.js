import { NextResponse } from 'next/server';
import { getPublicProjects } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const projects = await getPublicProjects();

    return NextResponse.json(projects, {
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