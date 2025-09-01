import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const languagePrompts = {
  english: "Generate a fun, interesting fact about this image. Make it educational and engaging. Keep it under 100 words.",
  kyrgyz: "Бул сүрөт жөнүндө кызыктуу, көңүл ачуучу факт жазыңыз. Билим берүүчү жана кызыктуу болсун. 100 сөзмөн аз болсун.",
  russian: "Создайте интересный, увлекательный факт об этом изображении. Сделайте его познавательным и захватывающим. Не более 100 слов.",
  turkish: "Bu görsel hakkında eğlenceli, ilginç bir gerçek oluşturun. Eğitici ve ilgi çekici olsun. 100 kelimeden az olsun."
};

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, language = "english" } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.english;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const fact = response.choices[0]?.message?.content;

    if (!fact) {
      throw new Error("No fact generated from OpenAI");
    }

    return NextResponse.json({
      fact: fact.trim(),
      language,
      imageUrl
    });
  } catch (error) {
    console.error("Error generating fact:", error);
    
    return NextResponse.json(
      { error: "Failed to generate fact" },
      { status: 500 }
    );
  }
}
