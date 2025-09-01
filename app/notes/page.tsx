import { protectPage } from "@/lib/auth";
import { NotesContainer } from "@/components/notes/NotesContainer";

export default async function NotesPage() {
  await protectPage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Notes</h1>
        <p className="text-gray-600">Capture and organize your thoughts</p>
      </div>
      
      <NotesContainer />
    </div>
  );
}
