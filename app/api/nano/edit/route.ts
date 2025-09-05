import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, imageUrls, numImages = 1, outputFormat = 'jpeg' } = await request.json();

    if (!prompt || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Prompt and image URLs are required' },
        { status: 400 }
      );
    }

    const falApiKey = process.env.FAL_AI_API_KEY;
    if (!falApiKey) {
      return NextResponse.json(
        { error: 'FAL AI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://fal.run/fal-ai/nano-banana/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_urls: imageUrls,
        num_images: numImages,
        output_format: outputFormat,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('FAL AI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to process image editing request' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in nano edit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
