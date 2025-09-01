const YOUTUBE_API_KEY = "AIzaSyAYL-4T4xUeqvixKqlEty7NBZJ8p0cnWyU";
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnail: {
    default: string;
    medium: string;
    high: string;
  };
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  categoryId?: string;
  tags?: string[];
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}

export interface YouTubeVideoDetails extends YouTubeVideo {
  duration: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  categoryId: string;
  tags: string[];
}

interface YouTubeAPIVideoItem {
  id: string | { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    categoryId?: string;
    tags?: string[];
  };
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YouTubeAPIResponse {
  items: YouTubeAPIVideoItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export class YouTubeAPIService {
  // Search for videos
  static async searchVideos(
    query: string,
    maxResults: number = 20,
    pageToken?: string
  ): Promise<YouTubeSearchResult> {
    try {
      const params = new URLSearchParams({
        part: "snippet",
        type: "video",
        q: query,
        maxResults: maxResults.toString(),
        key: YOUTUBE_API_KEY,
        order: "relevance",
        safeSearch: "moderate",
        ...(pageToken && { pageToken }),
      });

      const response = await fetch(`${YOUTUBE_BASE_URL}/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data: YouTubeAPIResponse = await response.json();

      const videos: YouTubeVideo[] = data.items?.map((item: YouTubeAPIVideoItem) => ({
        id: typeof item.id === 'string' ? item.id : item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: {
          default: item.snippet.thumbnails.default?.url || "",
          medium: item.snippet.thumbnails.medium?.url || "",
          high: item.snippet.thumbnails.high?.url || "",
        },
      })) || [];

      return {
        videos,
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo?.totalResults || 0,
      };
    } catch (error) {
      console.error("Error searching YouTube videos:", error);
      throw error;
    }
  }

  // Get detailed video information
  static async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    try {
      const params = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        id: videoId,
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(`${YOUTUBE_BASE_URL}/videos?${params}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: {
          default: item.snippet.thumbnails.default?.url || "",
          medium: item.snippet.thumbnails.medium?.url || "",
          high: item.snippet.thumbnails.high?.url || "",
        },
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount || "0",
        likeCount: item.statistics.likeCount || "0",
        commentCount: item.statistics.commentCount || "0",
        categoryId: item.snippet.categoryId || "",
        tags: item.snippet.tags || [],
      };
    } catch (error) {
      console.error("Error getting video details:", error);
      return null;
    }
  }

  // Get trending videos
  static async getTrendingVideos(
    maxResults: number = 20,
    regionCode: string = "US"
  ): Promise<YouTubeVideo[]> {
    try {
      const params = new URLSearchParams({
        part: "snippet",
        chart: "mostPopular",
        maxResults: maxResults.toString(),
        regionCode,
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(`${YOUTUBE_BASE_URL}/videos?${params}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data: YouTubeAPIResponse = await response.json();

      return data.items?.map((item: YouTubeAPIVideoItem) => ({
        id: typeof item.id === 'string' ? item.id : item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: {
          default: item.snippet.thumbnails.default?.url || "",
          medium: item.snippet.thumbnails.medium?.url || "",
          high: item.snippet.thumbnails.high?.url || "",
        },
      })) || [];
    } catch (error) {
      console.error("Error getting trending videos:", error);
      throw error;
    }
  }

  // Get videos by category
  static async getVideosByCategory(
    categoryId: string,
    maxResults: number = 20
  ): Promise<YouTubeVideo[]> {
    try {
      const params = new URLSearchParams({
        part: "snippet",
        chart: "mostPopular",
        videoCategoryId: categoryId,
        maxResults: maxResults.toString(),
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(`${YOUTUBE_BASE_URL}/videos?${params}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data: YouTubeAPIResponse = await response.json();

      return data.items?.map((item: YouTubeAPIVideoItem) => ({
        id: typeof item.id === 'string' ? item.id : item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: {
          default: item.snippet.thumbnails.default?.url || "",
          medium: item.snippet.thumbnails.medium?.url || "",
          high: item.snippet.thumbnails.high?.url || "",
        },
      })) || [];
    } catch (error) {
      console.error("Error getting videos by category:", error);
      throw error;
    }
  }

  // Parse YouTube duration format (PT4M13S) to readable format
  private static parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    if (!match) return "0:00";
    
    const hours = (match[1] || "").replace("H", "");
    const minutes = (match[2] || "").replace("M", "");
    const seconds = (match[3] || "").replace("S", "");
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    } else {
      return `${minutes || "0"}:${seconds.padStart(2, "0")}`;
    }
  }

  // Format view count
  static formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  // Format published date
  static formatPublishedDate(publishedAt: string): string {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  // Get YouTube embed URL
  static getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Get YouTube watch URL
  static getWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}
