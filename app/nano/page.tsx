import NanoImageEditor from '@/components/nano/NanoImageEditor';

export default function NanoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nano Banana Image Editor</h1>
          <p className="text-lg text-gray-600">
            Upload images and transform them with AI-powered editing using Google&apos;s state-of-the-art model
          </p>
        </div>
        <NanoImageEditor />
      </div>
    </div>
  );
}
