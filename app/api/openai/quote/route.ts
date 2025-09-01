import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fallbackQuotes = [
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  },
  {
    quote: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein"
  },
  {
    quote: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const theme = searchParams.get('theme') || 'general';

    const userPrompt = theme === 'general'
      ? "Generate a powerful motivational quote for someone working on their personal projects and goals."
      : `Generate a motivational quote about ${theme} for someone working on their personal growth.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a motivational coach. Generate a short, powerful motivational quote (under 120 characters). Respond with ONLY the quote text, no JSON, no formatting, no quotation marks around the entire response. Example: The future belongs to those who believe in the beauty of their dreams."
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 100,
      temperature: 0.9,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Clean up the response - remove any extra formatting
    let cleanQuote = content.trim();
    
    // Remove common formatting artifacts
    cleanQuote = cleanQuote.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
    cleanQuote = cleanQuote.replace(/^`+|`+$/g, ''); // Remove backticks
    cleanQuote = cleanQuote.replace(/^json\s*/i, ''); // Remove "json" prefix
    cleanQuote = cleanQuote.replace(/^\{.*?\}/, ''); // Remove JSON objects
    cleanQuote = cleanQuote.replace(/quote:\s*/i, ''); // Remove "quote:" prefix
    cleanQuote = cleanQuote.replace(/author:\s*.*$/i, ''); // Remove author suffix
    cleanQuote = cleanQuote.replace(/[,\s]*$/, ''); // Remove trailing commas and spaces

    // If the quote is too short or seems malformed, use a fallback
    if (cleanQuote.length < 10 || cleanQuote.includes('{') || cleanQuote.includes('}')) {
      const fallbackQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      return NextResponse.json(fallbackQuote);
    }

    return NextResponse.json({
      quote: cleanQuote,
      author: "Anonymous",
      theme: theme === 'general' ? undefined : theme,
    });
  } catch (error) {
    console.error("Error generating motivational quote:", error);
    
    // Return fallback quote
    const fallbackQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    return NextResponse.json(fallbackQuote);
  }
}
