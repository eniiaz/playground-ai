"use client";

import { useState } from "react";
import { OpenAIService, GeneratedImage } from "@/lib/openai";

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

export function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1792x1024" | "1024x1792">("1024x1024");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const generatedImage = await OpenAIService.generateImage(prompt.trim(), size);
      onImageGenerated(generatedImage);
      setPrompt(""); // Clear prompt after successful generation
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 AI Image Generator</h3>
        <p className="text-sm text-gray-600">
          Create stunning images with AI. Use Cmd/Ctrl + Enter to generate quickly.
        </p>
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your image
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="A serene mountain landscape at sunset with a crystal clear lake reflecting the sky..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Size Selection */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
            Image Size
          </label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value as "1024x1024" | "1792x1024" | "1024x1792")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isGenerating}
          >
            <option value="1024x1024">Square (1024x1024)</option>
            <option value="1792x1024">Landscape (1792x1024)</option>
            <option value="1024x1792">Portrait (1024x1792)</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Image</span>
            </>
          )}
        </button>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Be specific and descriptive in your prompt for better results. 
            Include details about style, mood, lighting, and composition.
          </p>
        </div>
      </div>
    </div>
  );
}
