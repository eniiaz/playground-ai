"use client";

import { useState } from "react";

interface BusinessIdea {
  title: string;
  description: string;
  category: string;
  targetMarket: string;
  feasibilityScore: number;
  status: "idea" | "research" | "planning" | "development" | "launched";
  tags: string[];
}

interface IdeaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (idea: BusinessIdea) => void;
}

const ideaTemplates = [
  {
    title: "AI-Powered Personal Finance Assistant",
    description: "A mobile app that uses AI to analyze spending patterns, predict future expenses, and provide personalized financial advice. Features automated budgeting, investment recommendations, and bill payment reminders.",
    category: "FinTech",
    targetMarket: "Young professionals aged 25-35",
    feasibilityScore: 7,
    tags: ["AI", "Mobile App", "Personal Finance", "Machine Learning"],
  },
  {
    title: "Virtual Interior Design Platform",
    description: "An AR-powered platform where users can visualize furniture and decor in their actual space before purchasing. Includes 3D room scanning, virtual furniture placement, and direct shopping integration.",
    category: "Home & Design",
    targetMarket: "Homeowners and renters",
    feasibilityScore: 6,
    tags: ["AR", "Interior Design", "E-commerce", "3D"],
  },
  {
    title: "Sustainable Meal Planning Service",
    description: "A subscription service that creates personalized meal plans based on dietary preferences, local seasonal ingredients, and sustainability goals. Includes recipe delivery and ingredient sourcing from local farms.",
    category: "Food & Sustainability",
    targetMarket: "Health-conscious consumers",
    feasibilityScore: 8,
    tags: ["Sustainability", "Meal Planning", "Subscription", "Health"],
  },
  {
    title: "Remote Team Wellness Platform",
    description: "A comprehensive wellness platform for remote teams featuring virtual yoga sessions, meditation breaks, team challenges, and mental health resources. Integrates with popular work tools.",
    category: "Workplace Wellness",
    targetMarket: "Remote teams and companies",
    feasibilityScore: 7,
    tags: ["Remote Work", "Wellness", "Team Building", "Mental Health"],
  },
  {
    title: "Local Skill Exchange Network",
    description: "A neighborhood-based platform where people can exchange skills and services without money. Trade guitar lessons for web design, cooking for tutoring, etc. Builds community connections.",
    category: "Community",
    targetMarket: "Local communities",
    feasibilityScore: 5,
    tags: ["Skill Exchange", "Community", "Bartering", "Local"],
  },
  {
    title: "Smart Pet Care IoT System",
    description: "An IoT ecosystem for pet owners including smart feeders, activity trackers, health monitors, and automated vet appointment scheduling. Provides insights into pet behavior and health.",
    category: "Pet Tech",
    targetMarket: "Pet owners",
    feasibilityScore: 6,
    tags: ["IoT", "Pet Care", "Health Monitoring", "Smart Home"],
  },
];

export function IdeaGeneratorModal({ isOpen, onClose, onCreate }: IdeaGeneratorModalProps) {
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomIdea = () => {
    setIsGenerating(true);
    
    // Simulate idea generation delay
    setTimeout(() => {
      const randomIdea = ideaTemplates[Math.floor(Math.random() * ideaTemplates.length)];
      setSelectedIdea({
        ...randomIdea,
        status: "idea",
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleCreateIdea = () => {
    if (selectedIdea) {
      onCreate(selectedIdea);
      setSelectedIdea(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedIdea(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">💡 Idea Generator</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Get inspired with AI-generated business ideas tailored to current market trends.
            </p>
            
            <button
              onClick={generateRandomIdea}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generate Idea</span>
                </>
              )}
            </button>
          </div>

          {selectedIdea && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {selectedIdea.title}
              </h3>
              
              <p className="text-gray-700 mb-4">
                {selectedIdea.description}
              </p>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{selectedIdea.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Market:</span>
                  <span className="font-medium">{selectedIdea.targetMarket}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Feasibility:</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < selectedIdea.feasibilityScore ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs">{selectedIdea.feasibilityScore}/10</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedIdea.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateIdea}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Save This Idea
                </button>
                <button
                  onClick={generateRandomIdea}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Generate Another
                </button>
              </div>
            </div>
          )}

          {!selectedIdea && !isGenerating && (
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <p>Click &ldquo;Generate Idea&rdquo; to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
