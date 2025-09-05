'use client';

import { useState } from 'react';

interface EditPromptProps {
  onSubmit: (prompt: string, numImages: number, outputFormat: 'jpeg' | 'png') => void;
  isLoading: boolean;
  disabled: boolean;
}

const EXAMPLE_PROMPTS = [
  "make a photo of the man driving the car down the california coastline",
  "turn this into a vintage photograph with sepia tones",
  "add dramatic lighting and shadows to create a moody atmosphere",
  "transform this into a watercolor painting style",
  "make the background a beautiful sunset sky",
  "add snow falling in the scene",
  "convert to black and white with high contrast",
  "add magical sparkles and fairy lights throughout the image"
];

export default function EditPrompt({ onSubmit, isLoading, disabled }: EditPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [numImages, setNumImages] = useState(1);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Please enter a prompt describing how you want to edit the image');
      return;
    }
    onSubmit(prompt.trim(), numImages, outputFormat);
  };

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setShowExamples(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt Input */}
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Editing Prompt *
        </label>
        <div className="relative">
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want to edit your image... (e.g., 'make a photo of the man driving the car down the california coastline')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={disabled || isLoading}
            required
          />
        </div>
        
        {/* Example Prompts */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-purple-600 hover:text-purple-800 underline"
          >
            {showExamples ? 'Hide' : 'Show'} example prompts
          </button>
          
          {showExamples && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">Click any example to use it:</p>
              <div className="grid gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => useExamplePrompt(example)}
                    className="text-left text-sm text-gray-700 hover:text-purple-600 hover:bg-white p-2 rounded border border-transparent hover:border-purple-200 transition-colors"
                  >
                    &quot;{example}&quot;
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Number of Images */}
        <div>
          <label htmlFor="numImages" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Images
          </label>
          <select
            id="numImages"
            value={numImages}
            onChange={(e) => setNumImages(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={disabled || isLoading}
          >
            <option value={1}>1 image</option>
            <option value={2}>2 images</option>
            <option value={3}>3 images</option>
            <option value={4}>4 images</option>
          </select>
        </div>

        {/* Output Format */}
        <div>
          <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Output Format
          </label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={disabled || isLoading}
          >
            <option value="jpeg">JPEG (smaller file size)</option>
            <option value="png">PNG (higher quality)</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={disabled || isLoading || !prompt.trim()}
          className="px-8 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Editing Images...
            </span>
          ) : (
            'Generate Edited Images'
          )}
        </button>
      </div>
    </form>
  );
}
