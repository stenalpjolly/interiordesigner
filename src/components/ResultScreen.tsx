import Image from 'next/image';
import { useState } from 'react';
import { useAppContext } from '@/lib/AppContext';
import LoadingScreen from './LoadingScreen';

interface ResultScreenProps {
  images: string[];
  onStartOver: () => void;
}

export default function ResultScreen({ images, onStartOver }: ResultScreenProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { userAnswers, analysisData, resultImages, setResultImages, error, setError } = useAppContext();

  const handleGenerateMore = async () => {
    if (!images[0] || !analysisData || !userAnswers) {
      setError("Could not generate more designs. Please start over.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage: images[0], // Use the first generated image as the base
          designerNotes: analysisData.designerNotes,
          userAnswers: userAnswers,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate more images');
      }
      const data = await response.json();
      setResultImages(prevImages => [...prevImages, data.image]);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVariation = async (baseImage: string) => {
    if (!userAnswers) {
      setError("Could not generate a variation. Please start over.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage: baseImage,
          designerNotes: "Generate a variation of this design.",
          userAnswers: userAnswers,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate variation');
      }
      const data = await response.json();
      if (data.image) {
        setResultImages(prevImages => [...prevImages, data.image]);
      } else {
        throw new Error("Failed to parse image from API response");
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen text="Generating more designs..." />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
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
              <button onClick={() => handleGenerateVariation(image)} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-2 px-5 rounded-lg transition">
                Variations
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10 flex justify-center gap-4">
        <button type="button" onClick={onStartOver} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200">
          Start Over
        </button>
        <button type="button" onClick={handleGenerateMore} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200">
          Generate More
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