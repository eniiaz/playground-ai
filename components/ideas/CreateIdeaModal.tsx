"use client";

import { useState } from "react";

interface BusinessIdea {
  title: string;
  description: string;
  category: string;
  targetMarket: string;
  feasibilityScore: number;
  status: "idea" | "research" | "planning" | "development" | "launched";
  tags: string[];
}

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (idea: BusinessIdea) => void;
}

export function CreateIdeaModal({ isOpen, onClose, onCreate }: CreateIdeaModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    targetMarket: "",
    feasibilityScore: 5,
    status: "idea" as const,
    tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    onCreate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      targetMarket: formData.targetMarket.trim(),
      feasibilityScore: formData.feasibilityScore,
      status: formData.status,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      targetMarket: "",
      feasibilityScore: 5,
      status: "idea",
      tags: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Create Business Idea</h2>
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your business idea title"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Describe your business idea..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Tech, Health, Education"
                />
              </div>

              <div>
                <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Market
                </label>
                <input
                  type="text"
                  id="targetMarket"
                  value={formData.targetMarket}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Young professionals"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="feasibilityScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Feasibility Score (1-10)
                </label>
                <input
                  type="number"
                  id="feasibilityScore"
                  min="1"
                  max="10"
                  value={formData.feasibilityScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, feasibilityScore: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="idea">💭 Idea</option>
                  <option value="research">🔍 Research</option>
                  <option value="planning">📋 Planning</option>
                  <option value="development">🚧 Development</option>
                  <option value="launched">🚀 Launched</option>
                </select>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. mobile app, saas, marketplace (comma separated)"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Create Idea
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
