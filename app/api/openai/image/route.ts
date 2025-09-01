import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = "1024x1024" } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt.trim(),
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL received from OpenAI");
    }

    return NextResponse.json({
      imageUrl,
      prompt: prompt.trim(),
      size,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
