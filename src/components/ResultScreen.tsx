"use client";

import { useState } from 'react';

interface ResultScreenProps {
  images: string[];
  onStartOver: () => void;
}

export default function ResultScreen({ images, onStartOver }: ResultScreenProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">Here are your new designs!</h2>
      <p className="text-center text-gray-400 mb-6">The structure of your room has been preserved.</p>
      
      <div className={`grid gap-6 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {images.map((image, index) => (
          <div key={index} className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <img
              src={image}
              alt={`Generated Design ${index + 1}`}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => setZoomedImage(image)}
            />
            <div className="p-4 flex gap-4">
              <button onClick={() => setZoomedImage(image)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                Zoom
              </button>
              <a href={image} download={`interior-design-${index + 1}.png`} className="flex-1 text-center bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition">
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <button type="button" onClick={onStartOver} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-8">
        Start Over
      </button>

      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed design"
            className="rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-4xl font-bold"
            onClick={() => setZoomedImage(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}