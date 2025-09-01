"use client";

import { useState } from "react";
import { FactsModal } from "./FactsModal";

interface LibraryResource {
  id: string;
  title: string;
  url: string;
  description: string;
  type: "article" | "video" | "book" | "podcast" | "tool" | "course" | "image" | "other";
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface ResourceCardProps {
  resource: LibraryResource;
  onUpdate: (id: string, updates: Partial<LibraryResource>) => void;
  onDelete: (id: string) => void;
}

const typeIcons = {
  article: "📄",
  video: "🎥",
  book: "📖",
  podcast: "🎙️",
  tool: "🛠️",
  course: "🎓",
  image: "🖼️",
  other: "📎",
};

const typeColors = {
  article: "bg-blue-100 text-blue-800",
  video: "bg-red-100 text-red-800",
  book: "bg-green-100 text-green-800",
  podcast: "bg-purple-100 text-purple-800",
  tool: "bg-orange-100 text-orange-800",
  course: "bg-indigo-100 text-indigo-800",
  image: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

export function ResourceCard({ resource, onUpdate, onDelete }: ResourceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showFactsModal, setShowFactsModal] = useState(false);
  const [editData, setEditData] = useState({
    title: resource.title,
    url: resource.url,
    description: resource.description,
    type: resource.type,
    category: resource.category,
    tags: resource.tags.join(", "),
  });

  const toggleFavorite = () => {
    onUpdate(resource.id, { isFavorite: !resource.isFavorite });
  };

  const handleSave = () => {
    onUpdate(resource.id, {
      ...editData,
      tags: editData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: resource.title,
      url: resource.url,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      tags: resource.tags.join(", "),
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

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full font-semibold text-lg border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="url"
                value={editData.url}
                onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://..."
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editData.type}
                  onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as LibraryResource["type"] }))}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="book">Book</option>
                  <option value="podcast">Podcast</option>
                  <option value="tool">Tool</option>
                  <option value="course">Course</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  value={editData.category}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Category"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <input
                type="text"
                value={editData.tags}
                onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags (comma separated)"
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium"
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
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-2xl">{typeIcons[resource.type]}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                      {resource.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {resource.type === "image" ? "AI Generated Image" : getDomainFromUrl(resource.url)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={toggleFavorite}
                    className={`p-1 ${resource.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  >
                    <svg className="w-4 h-4" fill={resource.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-purple-600 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(resource.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Image Preview for Image Type */}
              {resource.type === "image" && (
                <div className="mb-4">
                  <img
                    src={resource.url}
                    alt={resource.title}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
              
              <p className="text-gray-700 mb-4 line-clamp-3">
                {resource.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full ${typeColors[resource.type]}`}>
                  {resource.type}
                </span>
                {resource.category && (
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {resource.category}
                  </span>
                )}
              </div>
              
              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Added {formatDate(resource.createdAt)}</span>
                <div className="flex space-x-2">
                  {/* Facts Button for Image Resources */}
                  {resource.type === "image" && (
                    <button
                      onClick={() => setShowFactsModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1"
                    >
                      <span>🔍</span>
                      <span>Facts</span>
                    </button>
                  )}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1"
                  >
                    <span>Visit</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Facts Modal */}
      <FactsModal
        isOpen={showFactsModal}
        onClose={() => setShowFactsModal(false)}
        imageUrl={resource.url}
        imageTitle={resource.title}
      />
    </>
  );
}
