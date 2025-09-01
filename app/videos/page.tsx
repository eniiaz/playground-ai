import { protectPage } from "@/lib/auth";
import { VideosBrowsingContainer } from "@/components/videos/VideosBrowsingContainer";

export default async function VideosPage() {
  await protectPage();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎥 Video Browsing</h1>
        <p className="text-gray-600">Search, watch, and discover YouTube content</p>
      </div>
      
      <VideosBrowsingContainer />
    </div>
  );
}
