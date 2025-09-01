"use client";

import { useState } from "react";

interface LibraryResource {
  title: string;
  url: string;
  description: string;
  type: "article" | "video" | "book" | "podcast" | "tool" | "course" | "image" | "other";
  category: string;
  tags: string[];
  isFavorite: boolean;
}

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (resource: LibraryResource) => void;
}

export function CreateResourceModal({ isOpen, onClose, onCreate }: CreateResourceModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    type: "article" as const,
    category: "",
    tags: "",
    isFavorite: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) return;

    onCreate({
      title: formData.title.trim(),
      url: formData.url.trim(),
      description: formData.description.trim(),
      type: formData.type,
      category: formData.category.trim(),
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      isFavorite: formData.isFavorite,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      type: "article",
      category: "",
      tags: "",
      isFavorite: false,
    });
    onClose();
  };

  // Auto-populate title from URL
  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, url }));
    
    // Simple title extraction from URL
    if (url && !formData.title) {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          const titleGuess = lastPart
            .replace(/[-_]/g, ' ')
            .replace(/\.[^/.]+$/, '') // Remove file extension
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
          
          if (titleGuess.length > 3) {
            setFormData(prev => ({ ...prev, title: titleGuess }));
          }
        }
      } catch {
        // Invalid URL, ignore
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Add Resource</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Resource title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Brief description of the resource..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="article">📄 Article</option>
                  <option value="video">🎥 Video</option>
                  <option value="book">📖 Book</option>
                  <option value="podcast">🎙️ Podcast</option>
                  <option value="tool">🛠️ Tool</option>
                  <option value="course">🎓 Course</option>
                  <option value="image">🖼️ Image</option>
                  <option value="other">📎 Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Programming, Design"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="javascript, tutorial, beginner (comma separated)"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFavorite"
                checked={formData.isFavorite}
                onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isFavorite" className="ml-2 block text-sm text-gray-700">
                ⭐ Mark as favorite
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Add Resource
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
