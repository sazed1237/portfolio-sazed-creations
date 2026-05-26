import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'IMGBB_API_KEY is not configured',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image');
    const name = String(formData.get('name') || 'project-image');

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image file is required',
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString('base64');

    const uploadBody = new URLSearchParams();
    uploadBody.set('image', base64Image);
    uploadBody.set('name', name);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: uploadBody,
    });

    const payload = await response.json();

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error?.message || 'Failed to upload image to imgBB');
    }

    return NextResponse.json(
      {
        success: true,
        imageUrl: payload?.data?.url || '',
        displayUrl: payload?.data?.display_url || '',
        deleteUrl: payload?.data?.delete_url || '',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}