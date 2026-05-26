import { NextResponse } from 'next/server';
import { deleteMessage, getAdminMessages, updateMessageStatus } from '@/lib/cloudflare-d1';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || 10);
    const messages = await getAdminMessages(Number.isFinite(limit) ? limit : 10);

    return NextResponse.json(messages, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'error',
        items: [],
        error: error instanceof Error ? error.message : 'Failed to load messages',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    const status = String(body?.status || '').trim();

    if (!id || !status) {
      return NextResponse.json({ error: 'Message id and status are required' }, { status: 400 });
    }

    await updateMessageStatus(id, status);

    return NextResponse.json({ saved: true, id, status });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update message',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);

    if (!id) {
      return NextResponse.json({ error: 'Message id is required' }, { status: 400 });
    }

    await deleteMessage(id);

    return NextResponse.json({ saved: true, id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete message',
      },
      { status: 500 }
    );
  }
}