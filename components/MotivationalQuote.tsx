"use client";

import { useState, useEffect } from "react";
import { OpenAIService, MotivationalQuote as Quote } from "@/lib/openai";

export function MotivationalQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuote = async () => {
    try {
      const newQuote = await OpenAIService.generateMotivationalQuote();
      
      // Clean up the quote text if needed
      if (newQuote.quote) {
        let cleanQuote = newQuote.quote.trim();
        
        // Remove any JSON formatting artifacts that might have slipped through
        cleanQuote = cleanQuote.replace(/^["']|["']$/g, '');
        cleanQuote = cleanQuote.replace(/^`+|`+$/g, '');
        cleanQuote = cleanQuote.replace(/^\{.*?\}/, '');
        cleanQuote = cleanQuote.replace(/quote:\s*/i, '');
        cleanQuote = cleanQuote.replace(/author:\s*.*$/i, '');
        cleanQuote = cleanQuote.replace(/[,\s]*$/, '');
        
        setQuote({
          ...newQuote,
          quote: cleanQuote || newQuote.quote
        });
      } else {
        setQuote(newQuote);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      // Set a fallback quote
      setQuote({
        quote: "Every great achievement was once considered impossible.",
        author: "Anonymous"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuote();
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-white/30 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded-lg w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 shadow-xl group hover:shadow-2xl transition-all duration-300">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24 group-hover:scale-110 transition-transform duration-700"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Daily Motivation</h3>
              <p className="text-white/80 text-sm">Powered by AI</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 group/button disabled:opacity-50"
            title="Get new quote"
          >
            <svg 
              className={`w-5 h-5 text-white transition-transform duration-500 ${refreshing ? 'animate-spin' : 'group-hover/button:rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <blockquote className="text-white text-xl md:text-2xl font-medium leading-relaxed">
            "{quote.quote}"
          </blockquote>
          
          {quote.author && (
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-white/50 rounded-full"></div>
              <cite className="text-white/90 text-sm font-medium not-italic">
                — {quote.author}
              </cite>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
          </svg>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
}
