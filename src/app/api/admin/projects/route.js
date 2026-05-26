import { NextResponse } from 'next/server';
import { createAdminProject, getAdminProjects } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const projects = await getAdminProjects();
    return NextResponse.json(projects, {
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
          published: 0,
          inReview: 0,
          drafts: 0,
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
    const result = await createAdminProject(payload);
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
