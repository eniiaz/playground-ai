"use client";

import { useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  audioUrl?: string;
}

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState(note.tags.join(", "));

  const handleSave = () => {
    onUpdate(note.id, {
      title: editTitle,
      content: editContent,
      tags: editTags.split(",").map(tag => tag.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(", "));
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    // Handle Firestore timestamp
    if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as { toDate: () => Date }).toDate().toLocaleDateString();
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
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full font-semibold text-lg border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
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
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                  {note.title}
                </h3>
                {note.audioUrl && (
                  <span className="text-purple-600" title="Voice Note">
                    🎤
                  </span>
                )}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-blue-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(note.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">
              {note.content}
            </p>

            {/* Audio Player for Voice Notes */}
            {note.audioUrl && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-purple-600">🎤</span>
                  <span className="text-sm font-medium text-purple-800">Voice Recording</span>
                </div>
                <audio controls className="w-full">
                  <source src={note.audioUrl} type="audio/webm" />
                  <source src={note.audioUrl} type="audio/mp4" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Updated {formatDate(note.updatedAt)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
