import Image from 'next/image';
import { useState } from 'react';

interface ResultScreenProps {
  images: string[];
  onStartOver: () => void;
}

export default function ResultScreen({ images, onStartOver }: ResultScreenProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your New Designs Are Ready!</h2>
        <p className="mt-2 text-lg text-gray-400">The core structure of your room has been preserved for a realistic comparison.</p>
      </div>
      
      <div className={`grid gap-8 ${images.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
        {images.map((image, index) => (
          <div key={index} className="group relative bg-gray-800/50 rounded-xl shadow-lg overflow-hidden">
            <Image
              src={image}
              alt={`Generated Design ${index + 1}`}
              width={500}
              height={500}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <button onClick={() => setZoomedImage(image)} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-2 px-5 rounded-lg transition">
                Zoom
              </button>
              <a href={image} download={`interior-design-${index + 1}.png`} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-2 px-5 rounded-lg transition">
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <button type="button" onClick={onStartOver} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200">
          Create Another Design
        </button>
      </div>

      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative">
            <Image
              src={zoomedImage}
              alt="Zoomed design"
              width={1200}
              height={1200}
              className="rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              className="absolute -top-2 -right-2 text-white bg-gray-800/50 rounded-full p-1 hover:bg-gray-700"
              onClick={() => setZoomedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}