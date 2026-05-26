import { NextResponse } from 'next/server';
import { getAdminOverview } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const overview = await getAdminOverview();
    return NextResponse.json(overview, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        timestamp: new Date().toISOString(),
        summary: {
          projects: 0,
          publishedProjects: 0,
          inReviewProjects: 0,
          draftProjects: 0,
          posts: 0,
          publishedPosts: 0,
          draftPosts: 0,
          featuredPosts: 0,
          services: 0,
          messages: 0,
          unreadMessages: 0,
          repliedMessages: 0,
          archivedMessages: 0,
          clients: 0,
          activeClients: 0,
          pendingClients: 0,
          partners: 0,
          settings: 0,
        },
        systemStatus: {
          apiAvailability: 0,
          contentCompletion: 0,
          seoOptimization: 0,
        },
        recentActivity: [
          {
            title: 'Overview unavailable',
            detail: 'The admin overview API could not read the current data source.',
            time: 'now',
          },
        ],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
