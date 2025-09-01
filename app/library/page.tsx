import { protectPage } from "@/lib/auth";
import { LibraryContainer } from "@/components/library/LibraryContainer";

export default async function LibraryPage() {
  await protectPage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Library</h1>
        <p className="text-gray-600">Curate your knowledge collection with bookmarks and resources</p>
      </div>
      
      <LibraryContainer />
    </div>
  );
}
