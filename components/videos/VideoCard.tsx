"use client";

import { useState } from "react";
import { YouTubeVideo, YouTubeAPIService } from "@/lib/youtube-api";
import { UserSyncService } from "@/lib/user-sync";
import { FirestoreService } from "@/lib/firestore";
import { useUser } from "@clerk/nextjs";

interface VideoCardProps {
  video: YouTubeVideo;
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveToLibrary = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video player from opening
    
    if (!user?.id || isSaving) return;

    setIsSaving(true);
    try {
      // Save video to library as a resource
      await FirestoreService.create("libraryResources", {
        title: video.title,
        url: YouTubeAPIService.getWatchUrl(video.id),
        description: video.description.substring(0, 300) + (video.description.length > 300 ? "..." : ""),
        type: "video",
        category: "YouTube",
        tags: ["youtube", "video", video.channelTitle.toLowerCase().replace(/\s+/g, "-")],
        isFavorite: false,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update user stats
      await UserSyncService.updateUserStats(user.id, "resources", 1);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Error saving video to library:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const truncateTitle = (title: string, maxLength: number = 60) => {
    return title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    return description.length > maxLength ? description.substring(0, maxLength) + "..." : description;
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 hover:border-red-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={video.thumbnail.medium || video.thumbnail.high}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Duration badge (if available) */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Video
        </div>

        {/* Save to Library Button */}
        <button
          onClick={handleSaveToLibrary}
          disabled={isSaving}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 transform ${
            saved 
              ? "bg-green-500 text-white scale-100 opacity-100" 
              : "bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-red-600 opacity-0 group-hover:opacity-100 scale-90 hover:scale-100 shadow-lg"
          }`}
          title="Save to Library"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Video Info */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 leading-tight text-lg group-hover:text-red-700 transition-colors duration-200">
          {truncateTitle(video.title, 70)}
        </h3>
        
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-sm font-bold">
              {video.channelTitle.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{video.channelTitle}</p>
            <p className="text-xs text-gray-500 mt-1">
              {YouTubeAPIService.formatPublishedDate(video.publishedAt)}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {truncateDescription(video.description, 120)}
        </p>
      </div>
    </div>
  );
}
