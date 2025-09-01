"use client";

import { useState, useEffect, useRef } from "react";

interface VideoSearchProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

const searchSuggestions = [
  "React tutorials",
  "JavaScript basics", 
  "Web development",
  "Next.js guide",
  "TypeScript tutorial",
  "UI/UX design",
  "Programming tips",
  "Tech reviews",
  "Coding interviews",
  "Software engineering",
  "Python programming",
  "Node.js backend",
  "Database design",
  "Machine learning",
  "AI development",
];

export function VideoSearch({ onSearch, loading }: VideoSearchProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search for smooth experience
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim() && query.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(query);
        setIsSearching(false);
      }, 800); // Wait 800ms after user stops typing
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      setIsSearching(false);
      onSearch(query);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = searchSuggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase()) && 
      suggestion.toLowerCase() !== query.toLowerCase()
    )
    .slice(0, 6);

  return (
    <div className="relative max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search videos on YouTube..."
            className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-gray-300"
            disabled={loading}
          />

          {/* Loading indicator */}
          {(loading || isSearching) && (
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            </div>
          )}

          {/* Clear button */}
          {query && !(loading || isSearching) && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && query && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-100 rounded-xl shadow-xl z-20 mt-2 overflow-hidden animate-fadeIn">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-6 py-3 hover:bg-red-50 transition-all duration-200 border-b border-gray-50 last:border-b-0 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <span className="text-red-600 text-sm">🎥</span>
                </div>
                <span className="text-gray-800 font-medium">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Search Tags */}
      <div className="mt-6 text-center">
        <div className="inline-flex flex-wrap gap-3 items-center justify-center">
          <span className="text-sm font-medium text-gray-600 mb-1">Popular searches:</span>
          {searchSuggestions.slice(0, 8).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-sm bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 px-4 py-2 rounded-full transition-all duration-200 border border-red-100 hover:border-red-200 hover:shadow-sm transform hover:scale-105"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
