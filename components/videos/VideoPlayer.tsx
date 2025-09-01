"use client";

import { useState, useEffect } from "react";
import { YouTubeVideo, YouTubeAPIService, YouTubeVideoDetails } from "@/lib/youtube-api";
import { UserSyncService } from "@/lib/user-sync";
import { FirestoreService } from "@/lib/firestore";
import { useUser } from "@clerk/nextjs";

interface VideoPlayerProps {
  video: YouTubeVideo;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { user } = useUser();
  const [videoDetails, setVideoDetails] = useState<YouTubeVideoDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoDetails();
  }, [video.id]);

  const loadVideoDetails = async () => {
    setLoading(true);
    try {
      const details = await YouTubeAPIService.getVideoDetails(video.id);
      setVideoDetails(details);
    } catch (error) {
      console.error("Error loading video details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!user?.id || isSaving) return;

    setIsSaving(true);
    try {
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

      await UserSyncService.updateUserStats(user.id, "resources", 1);
      
      setSaved(true);
    } catch (error) {
      console.error("Error saving video to library:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transform animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 truncate flex-1">
              {video.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          {/* Video Player */}
          <div className="p-6 pb-0">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={YouTubeAPIService.getEmbedUrl(video.id)}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>

          {/* Video Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-3 space-y-6">
                {/* Video Header */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{video.title}</h1>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {video.channelTitle.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{video.channelTitle}</p>
                        <p className="text-sm text-gray-600">
                          Published {YouTubeAPIService.formatPublishedDate(video.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Video Stats */}
                  {loading ? (
                    <div className="flex space-x-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                          <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : videoDetails && (
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        <span className="font-medium">{YouTubeAPIService.formatViewCount(videoDetails.viewCount)} views</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2 20h20v-4H2v4zm3.5-3c.83 0 1.5.67 1.5 1.5S6.33 19 5.5 19 4 18.33 4 17.5 4.67 17 5.5 17zM2 4v4h20V4H2zm3.5 3C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm6.5-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z"/>
                        </svg>
                        <span className="font-medium">{YouTubeAPIService.formatViewCount(videoDetails.likeCount)} likes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span className="font-medium">{videoDetails.duration}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={isSaving || saved}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                      saved 
                        ? "bg-green-500 text-white shadow-lg" 
                        : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : saved ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span>Saved to Library</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Save to Library</span>
                      </>
                    )}
                  </button>

                  <a
                    href={YouTubeAPIService.getWatchUrl(video.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Watch on YouTube</span>
                  </a>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h3>
                  <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                    {video.description || "No description available for this video."}
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {/* Video Statistics */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4v4h4V4h-4zm2 2h-2V5h2v1zm2 6c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5 5-2.24 5-5zm-5-3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
                    </svg>
                    Video Statistics
                  </h3>
                  
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                            <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : videoDetails ? (
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/>
                          </svg>
                          <span className="text-gray-600 font-medium">Views</span>
                        </div>
                        <span className="font-bold text-gray-900">{YouTubeAPIService.formatViewCount(videoDetails.viewCount)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 20h20v-4H2v4zm3.5-3c.83 0 1.5.67 1.5 1.5S6.33 19 5.5 19 4 18.33 4 17.5 4.67 17 5.5 17z"/>
                          </svg>
                          <span className="text-gray-600 font-medium">Likes</span>
                        </div>
                        <span className="font-bold text-gray-900">{YouTubeAPIService.formatViewCount(videoDetails.likeCount)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                          </svg>
                          <span className="text-gray-600 font-medium">Comments</span>
                        </div>
                        <span className="font-bold text-gray-900">{YouTubeAPIService.formatViewCount(videoDetails.commentCount)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span className="text-gray-600 font-medium">Duration</span>
                        </div>
                        <span className="font-bold text-gray-900">{videoDetails.duration}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-6 text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">Unable to load statistics</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {videoDetails?.tags && videoDetails.tags.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {videoDetails.tags.slice(0, 12).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-white text-blue-700 text-xs px-3 py-2 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
