"use client";

import { YouTubeVideo, YouTubeAPIService } from "@/lib/youtube-api";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: YouTubeVideo[];
  loading: boolean;
  onVideoSelect: (video: YouTubeVideo) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function VideoGrid({ videos, loading, onVideoSelect, onLoadMore, hasMore }: VideoGridProps) {
  if (loading && videos.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 aspect-video rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎥</span>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No videos found</h3>
        <p className="text-gray-600">Try searching for something else</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => onVideoSelect(video)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More Videos</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading indicator for load more */}
      {loading && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={`loading-${index}`} className="animate-pulse">
              <div className="bg-gray-300 aspect-video rounded-lg mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
