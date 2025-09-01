"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { FirestoreService, queryHelpers } from "@/lib/firestore";
import { UserSyncService } from "@/lib/user-sync";
import { GeneratedImage } from "@/lib/openai";
import { ResourceCard } from "./ResourceCard";
import { CreateResourceModal } from "./CreateResourceModal";
import { ImageGenerator } from "./ImageGenerator";
import { GeneratedImageDisplay } from "./GeneratedImageDisplay";

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

export function LibraryContainer() {
  const { user } = useUser();
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const fetchResources = async () => {
    if (!user?.id) return;
    
    try {
      const userResources = await FirestoreService.getAll("libraryResources", [
        queryHelpers.where("userId", "==", user.id),
        queryHelpers.orderBy("updatedAt", "desc"),
      ]);
      setResources(userResources as LibraryResource[]);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [user?.id]);

  const handleCreateResource = async (resourceData: Omit<LibraryResource, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user?.id) return;

    try {
      const newResource = await FirestoreService.create("libraryResources", {
        ...resourceData,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setResources(prev => [newResource as LibraryResource, ...prev]);
      setIsCreateModalOpen(false);
      
      // Update user stats
      await UserSyncService.updateUserStats(user.id, "resources", 1);
    } catch (error) {
      console.error("Error creating resource:", error);
    }
  };

  const handleUpdateResource = async (id: string, updates: Partial<LibraryResource>) => {
    try {
      await FirestoreService.update("libraryResources", id, {
        ...updates,
        updatedAt: new Date(),
      });
      
      setResources(prev => prev.map(resource => 
        resource.id === id ? { ...resource, ...updates, updatedAt: new Date() } : resource
      ));
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await FirestoreService.delete("libraryResources", id);
      setResources(prev => prev.filter(resource => resource.id !== id));
      
      // Update user stats
      if (user?.id) {
        await UserSyncService.updateUserStats(user.id, "resources", -1);
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleImageGenerated = (image: GeneratedImage) => {
    setGeneratedImage(image);
  };

  const handleSaveGeneratedImage = async (imageData: {
    title: string;
    url: string;
    description: string;
    type: "image";
    category: string;
    tags: string[];
  }) => {
    await handleCreateResource({
      ...imageData,
      isFavorite: false,
    });
    setGeneratedImage(null);
  };

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(resources.map(r => r.category).filter(Boolean)))];

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Resource</span>
          </button>
          
          <button
            onClick={() => setShowImageGenerator(!showImageGenerator)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <span>🎨</span>
            <span>{showImageGenerator ? "Hide" : "AI Image Generator"}</span>
          </button>
        </div>
        
        <div className="flex-1 flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Generator */}
      {showImageGenerator && (
        <div className="mb-6">
          <ImageGenerator onImageGenerated={handleImageGenerated} />
        </div>
      )}

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {resources.length === 0 ? "No resources yet" : "No matching resources"}
          </h3>
          <p className="text-gray-600 mb-4">
            {resources.length === 0 
              ? "Start building your knowledge library" 
              : "Try adjusting your search or category filter"
            }
          </p>
          {resources.length === 0 && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add Resource
              </button>
              <button
                onClick={() => setShowImageGenerator(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Generate Image
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Resource Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{resources.length}</div>
              <div className="text-sm text-gray-600">Total Resources</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {resources.filter(r => r.isFavorite).length}
              </div>
              <div className="text-sm text-gray-600">Favorites</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(resources.flatMap(r => r.tags)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Tags</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onUpdate={handleUpdateResource}
                onDelete={handleDeleteResource}
              />
            ))}
          </div>
        </>
      )}

      {/* Create Resource Modal */}
      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateResource}
      />

      {/* Generated Image Display Modal */}
      {generatedImage && (
        <GeneratedImageDisplay
          image={generatedImage}
          onSaveAsResource={handleSaveGeneratedImage}
          onClose={() => setGeneratedImage(null)}
        />
      )}
    </div>
  );
}
