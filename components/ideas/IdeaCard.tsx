"use client";

import { useState } from "react";

interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  targetMarket: string;
  feasibilityScore: number;
  status: "idea" | "research" | "planning" | "development" | "launched";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface IdeaCardProps {
  idea: BusinessIdea;
  onUpdate: (id: string, updates: Partial<BusinessIdea>) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  idea: "bg-gray-100 text-gray-800",
  research: "bg-blue-100 text-blue-800",
  planning: "bg-yellow-100 text-yellow-800",
  development: "bg-orange-100 text-orange-800",
  launched: "bg-green-100 text-green-800",
};

const statusLabels = {
  idea: "💭 Idea",
  research: "🔍 Research",
  planning: "📋 Planning",
  development: "🚧 Development",
  launched: "🚀 Launched",
};

export function IdeaCard({ idea, onUpdate, onDelete }: IdeaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: idea.title,
    description: idea.description,
    category: idea.category,
    targetMarket: idea.targetMarket,
    feasibilityScore: idea.feasibilityScore,
    status: idea.status,
    tags: idea.tags.join(", "),
  });

  const handleSave = () => {
    onUpdate(idea.id, {
      ...editData,
      tags: editData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      targetMarket: idea.targetMarket,
      feasibilityScore: idea.feasibilityScore,
      status: idea.status,
      tags: idea.tags.join(", "),
    });
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as any).toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full font-semibold text-lg border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Category"
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                value={editData.targetMarket}
                onChange={(e) => setEditData(prev => ({ ...prev, targetMarket: e.target.value }))}
                placeholder="Target Market"
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Feasibility (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editData.feasibilityScore}
                  onChange={(e) => setEditData(prev => ({ ...prev, feasibilityScore: parseInt(e.target.value) }))}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as BusinessIdea["status"] }))}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="idea">Idea</option>
                  <option value="research">Research</option>
                  <option value="planning">Planning</option>
                  <option value="development">Development</option>
                  <option value="launched">Launched</option>
                </select>
              </div>
            </div>
            <input
              type="text"
              value={editData.tags}
              onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Tags (comma separated)"
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                {idea.title}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-green-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(idea.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">
              {idea.description}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[idea.status]}`}>
                  {statusLabels[idea.status]}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600">Feasibility:</span>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full mr-1 ${
                          i < idea.feasibilityScore ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">{idea.feasibilityScore}/10</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600">
                <div><strong>Category:</strong> {idea.category}</div>
                <div><strong>Target:</strong> {idea.targetMarket}</div>
              </div>
            </div>
            
            {idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {idea.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Updated {formatDate(idea.updatedAt)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
