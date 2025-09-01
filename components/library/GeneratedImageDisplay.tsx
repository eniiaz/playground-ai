"use client";

import { useState } from "react";
import { GeneratedImage } from "@/lib/openai";

interface GeneratedImageDisplayProps {
  image: GeneratedImage;
  onSaveAsResource: (imageData: {
    title: string;
    url: string;
    description: string;
    type: "image";
    category: string;
    tags: string[];
  }) => void;
  onClose: () => void;
}

export function GeneratedImageDisplay({ 
  image, 
  onSaveAsResource, 
  onClose 
}: GeneratedImageDisplayProps) {
  const [title, setTitle] = useState("AI Generated Image");
  const [description, setDescription] = useState(image.prompt);
  const [category, setCategory] = useState("AI Generated");
  const [tags, setTags] = useState("ai-generated, image, creative");

  const handleSave = () => {
    onSaveAsResource({
      title: title.trim() || "AI Generated Image",
      url: image.imageUrl,
      description: description.trim() || image.prompt,
      type: "image" as any,
      category: category.trim() || "AI Generated",
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Generated Image</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Display */}
            <div>
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p><strong>Size:</strong> {image.size}</p>
                <p><strong>Prompt:</strong> {image.prompt}</p>
              </div>
            </div>

            {/* Save Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a title for this image"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe this image"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., AI Generated, Art, Design"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ai-generated, art, creative, design"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Save to Library
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
