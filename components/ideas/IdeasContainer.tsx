"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { FirestoreService, queryHelpers } from "@/lib/firestore";
import { UserSyncService } from "@/lib/user-sync";
import { IdeaCard } from "./IdeaCard";
import { CreateIdeaModal } from "./CreateIdeaModal";
import { IdeaGeneratorModal } from "./IdeaGeneratorModal";

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

export function IdeasContainer() {
  const { user } = useUser();
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  const fetchIdeas = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userIdeas = await FirestoreService.getAll("businessIdeas", [
        queryHelpers.where("userId", "==", user.id),
        queryHelpers.orderBy("updatedAt", "desc"),
      ]);
      setIdeas(userIdeas as BusinessIdea[]);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchIdeas();
  }, [user?.id, fetchIdeas]);

  const handleCreateIdea = async (ideaData: Omit<BusinessIdea, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user?.id) return;

    try {
      const newIdea = await FirestoreService.create("businessIdeas", {
        ...ideaData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setIdeas(prev => [newIdea as BusinessIdea, ...prev]);
      setIsCreateModalOpen(false);
      
      // Update user stats
      await UserSyncService.updateUserStats(user.id, "ideas", 1);
    } catch (error) {
      console.error("Error creating idea:", error);
    }
  };

  const handleUpdateIdea = async (id: string, updates: Partial<BusinessIdea>) => {
    try {
      await FirestoreService.update("businessIdeas", id, {
        ...updates,
        updatedAt: new Date(),
      });
      
      setIdeas(prev => prev.map(idea => 
        idea.id === id ? { ...idea, ...updates, updatedAt: new Date() } : idea
      ));
    } catch (error) {
      console.error("Error updating idea:", error);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await FirestoreService.delete("businessIdeas", id);
      setIdeas(prev => prev.filter(idea => idea.id !== id));
      
      // Update user stats
      if (user?.id) {
        await UserSyncService.updateUserStats(user.id, "ideas", -1);
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Idea</span>
        </button>
        <button
          onClick={() => setIsGeneratorModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <span>✨</span>
          <span>Generate Ideas</span>
        </button>
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No business ideas yet</h3>
          <p className="text-gray-600 mb-4">Start building your entrepreneurial portfolio</p>
          <div className="space-x-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Idea
            </button>
            <button
              onClick={() => setIsGeneratorModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Generate Ideas
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpdate={handleUpdateIdea}
              onDelete={handleDeleteIdea}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateIdeaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateIdea}
      />
      
      <IdeaGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onCreate={handleCreateIdea}
      />
    </div>
  );
}
