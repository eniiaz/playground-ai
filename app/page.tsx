import { SignedIn, SignedOut } from "@clerk/nextjs";
import { getUserMetadata } from "@/lib/auth";
import { MotivationalQuote } from "@/components/MotivationalQuote";
import Link from "next/link";

export default async function Home() {
  const user = await getUserMetadata();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SignedOut>
        <div className="text-center py-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">Playground</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your personal digital workspace for notes, ideas, and knowledge management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-12">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Notes</h3>
                <p className="text-gray-600">Capture and organize your thoughts with rich text editing</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Ideas</h3>
                <p className="text-gray-600">Generate and track innovative business concepts</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Library</h3>
                <p className="text-gray-600">Curate resources, bookmarks, and references</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Video Browsing</h3>
                <p className="text-gray-600">Search and explore YouTube content seamlessly</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nano Editor</h3>
                <p className="text-gray-600">Transform images with AI-powered editing using Google&apos;s Nano Banana</p>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-gray-600">Ready to explore?</p>
        </div>

        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Quick Actions Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Link href="/notes" className="group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
                  <p className="text-sm text-gray-600">Capture your thoughts</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Quick notes and ideas • Rich text editing
              </div>
            </div>
          </Link>

          <Link href="/ideas" className="group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💡</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Business Ideas</h3>
                  <p className="text-sm text-gray-600">Innovation workspace</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Generate • Evaluate • Track progress
              </div>
            </div>
          </Link>

          <Link href="/library" className="group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Library</h3>
                  <p className="text-sm text-gray-600">Knowledge collection</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Bookmarks • Resources • References
              </div>
            </div>
          </Link>

          <Link href="/videos" className="group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎥</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Video Browsing</h3>
                  <p className="text-sm text-gray-600">YouTube exploration</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Search • Watch • Discover content
              </div>
            </div>
          </Link>

          <Link href="/nano" className="group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎨</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">Nano Editor</h3>
                  <p className="text-sm text-gray-600">AI image editing</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Upload • Edit • Transform with AI
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <p>Start creating to see your recent activity here</p>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
