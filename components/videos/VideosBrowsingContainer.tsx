"use client";

import { useState, useEffect } from "react";
import { YouTubeAPIService, YouTubeVideo } from "@/lib/youtube-api";
import { VideoGrid } from "./VideoGrid";
import { VideoPlayer } from "./VideoPlayer";
import { VideoSearch } from "./VideoSearch";

export function VideosBrowsingContainer() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [totalResults, setTotalResults] = useState(0);

  // Load trending videos on mount
  useEffect(() => {
    loadTrendingVideos();
  }, []);

  const loadTrendingVideos = async () => {
    setLoading(true);
    try {
      const trendingVideos = await YouTubeAPIService.getTrendingVideos(20);
      setVideos(trendingVideos);
      setSearchQuery("");
      setNextPageToken(undefined);
      setTotalResults(trendingVideos.length);
    } catch (error) {
      console.error("Error loading trending videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadTrendingVideos();
      return;
    }

    setLoading(true);
    setSearchQuery(query);
    
    try {
      const result = await YouTubeAPIService.searchVideos(query, 20);
      setVideos(result.videos);
      setNextPageToken(result.nextPageToken);
      setTotalResults(result.totalResults);
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVideos = async () => {
    if (!nextPageToken || loading) return;

    setLoading(true);
    try {
      const result = await YouTubeAPIService.searchVideos(
        searchQuery || "trending",
        20,
        nextPageToken
      );
      setVideos(prev => [...prev, ...result.videos]);
      setNextPageToken(result.nextPageToken);
    } catch (error) {
      console.error("Error loading more videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <VideoSearch onSearch={handleSearch} loading={loading} />

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {searchQuery ? (
            <>
              Search results for &ldquo;<strong>{searchQuery}</strong>&rdquo; • {totalResults.toLocaleString()} videos found
            </>
          ) : (
            <>Trending videos • {totalResults} videos</>
          )}
        </div>
        
        {searchQuery && (
          <button
            onClick={loadTrendingVideos}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            ← Back to Trending
          </button>
        )}
      </div>

      {/* Video Grid */}
      <VideoGrid
        videos={videos}
        loading={loading}
        onVideoSelect={handleVideoSelect}
        onLoadMore={loadMoreVideos}
        hasMore={!!nextPageToken}
      />

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}
