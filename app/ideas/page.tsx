import { protectPage } from "@/lib/auth";
import { IdeasContainer } from "@/components/ideas/IdeasContainer";

export default async function IdeasPage() {
  await protectPage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💡 Business Ideas</h1>
        <p className="text-gray-600">Generate, evaluate, and track your innovative concepts</p>
      </div>
      
      <IdeasContainer />
    </div>
  );
}
