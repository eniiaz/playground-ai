'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';
import EditPrompt from './EditPrompt';
import EditedImageDisplay from './EditedImageDisplay';

interface EditedImage {
  url: string;
}

interface EditResult {
  images: EditedImage[];
  description: string;
}

export default function NanoImageEditor() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [editResult, setEditResult] = useState<EditResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImagesUploaded = (imageUrls: string[]) => {
    setUploadedImages(imageUrls);
    setEditResult(null);
  };

  const handleEditSubmit = async (prompt: string, numImages: number, outputFormat: 'jpeg' | 'png') => {
    if (uploadedImages.length === 0) {
      alert('Please upload at least one image first');
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch('/api/nano/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageUrls: uploadedImages,
          numImages,
          outputFormat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit images');
      }

      const result = await response.json();
      setEditResult(result);
    } catch (error) {
      console.error('Error editing images:', error);
      alert(error instanceof Error ? error.message : 'Failed to edit images');
    } finally {
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    setUploadedImages([]);
    setEditResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Image Upload */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Step 1: Upload Images</h2>
        <ImageUpload 
          onImagesUploaded={handleImagesUploaded}
          uploadedImages={uploadedImages}
        />
      </div>

      {/* Step 2: Edit Prompt */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Step 2: Describe Your Edit</h2>
          <EditPrompt 
            onSubmit={handleEditSubmit}
            isLoading={isEditing}
            disabled={uploadedImages.length === 0}
          />
        </div>
      )}

      {/* Step 3: Results */}
      {editResult && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Step 3: Edited Results</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Start Over
            </button>
          </div>
          <EditedImageDisplay result={editResult} />
        </div>
      )}

      {/* Loading State */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-lg text-gray-600">Processing your image edit...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
}
