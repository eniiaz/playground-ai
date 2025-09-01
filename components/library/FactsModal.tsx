"use client";

import { useState } from "react";
import Image from "next/image";
import { OpenAIService, GeneratedFact } from "@/lib/openai";

interface FactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle: string;
}

const languages = [
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "kyrgyz", name: "Кыргызча", flag: "🇰🇬" },
  { code: "russian", name: "Русский", flag: "🇷🇺" },
  { code: "turkish", name: "Türkçe", flag: "🇹🇷" },
] as const;

export function FactsModal({ isOpen, onClose, imageUrl, imageTitle }: FactsModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "kyrgyz" | "russian" | "turkish">("english");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFact, setGeneratedFact] = useState<GeneratedFact | null>(null);
  const [error, setError] = useState("");

  const handleGenerateFact = async () => {
    setIsGenerating(true);
    setError("");
    setGeneratedFact(null);

    try {
      const fact = await OpenAIService.generateFact(imageUrl, selectedLanguage);
      setGeneratedFact(fact);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate fact");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setGeneratedFact(null);
    setError("");
    setSelectedLanguage("english");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">🔍 Generate Facts</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Image Preview */}
            <div className="text-center">
              <div className="relative w-full max-w-md h-48 mx-auto">
                <Image
                  src={imageUrl}
                  alt={imageTitle}
                  fill
                  className="object-cover rounded-lg border border-gray-200"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{imageTitle}</p>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Language
              </label>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLanguage === lang.code
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateFact}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Analyzing image...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Generate Fact</span>
                </>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Generated Fact Display */}
            {generatedFact && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">💡</span>
                  <span className="font-semibold text-gray-800">Fun Fact</span>
                  <span className="text-sm text-gray-500">
                    ({languages.find(l => l.code === generatedFact.language)?.name})
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{generatedFact.fact}</p>
                
                {/* Generate Another Button */}
                <button
                  onClick={handleGenerateFact}
                  disabled={isGenerating}
                  className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>🔄</span>
                  <span>Generate another fact</span>
                </button>
              </div>
            )}

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700">
                <strong>💡 Tip:</strong> The AI analyzes the image content and generates educational, 
                interesting facts about what it sees - whether it&apos;s animals, nature, people, or objects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
