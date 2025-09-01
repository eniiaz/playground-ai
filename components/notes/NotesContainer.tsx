"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { FirestoreService, queryHelpers } from "@/lib/firestore";
import { UserSyncService } from "@/lib/user-sync";
import { NoteCard } from "./NoteCard";
import { CreateNoteModal } from "./CreateNoteModal";
import { VoiceRecordingModal } from "./VoiceRecordingModal";

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

export function NotesContainer() {
  const { user } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userNotes = await FirestoreService.getAll("notes", [
        queryHelpers.where("userId", "==", user.id),
        queryHelpers.orderBy("updatedAt", "desc"),
      ]);
      setNotes(userNotes as Note[]);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (noteData: { title: string; content: string; tags: string[]; audioUrl?: string }) => {
    if (!user?.id) return;

    try {
      const newNote = await FirestoreService.create("notes", {
        ...noteData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setNotes(prev => [newNote as Note, ...prev]);
      setIsCreateModalOpen(false);
      setIsVoiceModalOpen(false);
      
      // Update user stats
      await UserSyncService.updateUserStats(user.id, "notes", 1);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await FirestoreService.update("notes", id, {
        ...updates,
        updatedAt: new Date(),
      });
      
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      ));
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await FirestoreService.delete("notes", id);
      setNotes(prev => prev.filter(note => note.id !== id));
      
      // Update user stats
      if (user?.id) {
        await UserSyncService.updateUserStats(user.id, "notes", -1);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Create Note Buttons */}
      <div className="mb-6 flex space-x-3">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Note</span>
        </button>
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <span>🎤</span>
          <span>Voice Note</span>
        </button>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No notes yet</h3>
          <p className="text-gray-600 mb-4">Create your first note to get started</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Note
            </button>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <span>🎤</span>
              <span>Voice Note</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateNote}
      />

      {/* Voice Recording Modal */}
      <VoiceRecordingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onCreate={handleCreateNote}
      />
    </div>
  );
}
