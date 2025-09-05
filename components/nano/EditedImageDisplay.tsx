'use client';

import { useState } from 'react';
import Image from 'next/image';

interface EditedImage {
  url: string;
}

interface EditResult {
  images: EditedImage[];
  description: string;
}

interface EditedImageDisplayProps {
  result: EditResult;
}

export default function EditedImageDisplay({ result }: EditedImageDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `nano-edited-image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const openModal = (url: string) => {
    setSelectedImage(url);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      {result.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">AI Description</h3>
          <p className="text-blue-800">{result.description}</p>
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.images.map((image, index) => (
          <div key={index} className="group relative bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={image.url}
                alt={`Edited result ${index + 1}`}
                fill
                className="object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => openModal(image.url)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button
                    onClick={() => openModal(image.url)}
                    className="px-3 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    View Full Size
                  </button>
                  <button
                    onClick={() => downloadImage(image.url, index)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
            
            {/* Image Info */}
            <div className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Result {index + 1}
                </span>
                <button
                  onClick={() => downloadImage(image.url, index)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
              <Image
                src={selectedImage}
                alt="Full size edited image"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
                unoptimized
              />
            </div>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Download All Button */}
      {result.images.length > 1 && (
        <div className="text-center">
          <button
            onClick={() => {
              result.images.forEach((image, index) => {
                setTimeout(() => downloadImage(image.url, index), index * 500);
              });
            }}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Download All Images
          </button>
        </div>
      )}
    </div>
  );
}
