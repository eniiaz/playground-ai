import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for OpenAI API
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Create a temporary file object for OpenAI
    const file = new File([buffer], audioFile.name, {
      type: audioFile.type,
    });

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Can be made dynamic based on user preference
      response_format: 'text',
    });

    return NextResponse.json({
      transcription: transcription,
      success: true,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
