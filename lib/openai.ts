// OpenAI Service for client-side usage via API routes

export interface MotivationalQuote {
  quote: string;
  author?: string;
  theme?: string;
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  size: string;
}

export interface GeneratedFact {
  fact: string;
  language: string;
  imageUrl: string;
}

export class OpenAIService {
  // Generate a motivational quote using API route
  static async generateMotivationalQuote(): Promise<MotivationalQuote> {
    try {
      const response = await fetch('/api/openai/quote');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating motivational quote:", error);
      
      // Fallback quotes if API fails
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
        }
      ];
      
      return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
  }

  // Generate a theme-based motivational quote
  static async generateThemedQuote(theme: string): Promise<MotivationalQuote> {
    try {
      const response = await fetch(`/api/openai/quote?theme=${encodeURIComponent(theme)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating themed quote:", error);
      return this.generateMotivationalQuote(); // Fallback to general quote
    }
  }

  // Generate image using DALL-E
  static async generateImage(prompt: string, size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"): Promise<GeneratedImage> {
    try {
      const response = await fetch('/api/openai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, size }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }

  // Generate fact about image
  static async generateFact(imageUrl: string, language: "english" | "kyrgyz" | "russian" | "turkish" = "english"): Promise<GeneratedFact> {
    try {
      const response = await fetch('/api/openai/facts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, language }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating fact:", error);
      throw error;
    }
  }

  // Generate creative writing suggestions
  static async generateCreativePrompt(type: 'note' | 'idea' | 'project' = 'note'): Promise<string> {
    try {
      // For now, use fallback prompts. Can be enhanced with API route later
      const fallbacks = {
        note: "What's the most important lesson you learned today?",
        idea: "What problem in your daily life could you solve with technology?",
        project: "If you could build anything without limitations, what would it be?"
      };
      
      return fallbacks[type];
    } catch (error) {
      console.error("Error generating creative prompt:", error);
      return "What amazing thing will you create today?";
    }
  }
}
