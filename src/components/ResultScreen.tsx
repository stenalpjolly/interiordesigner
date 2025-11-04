import Image from 'next/image';
import { useState } from 'react';
import { useAppContext } from '@/lib/AppContext';
import LoadingScreen from './LoadingScreen';
import SkeletonLoader from './SkeletonLoader';
import ImageComparison from './ImageComparison';
import ThreeSixtyViewer from './ThreeSixtyViewer';

interface ResultScreenProps {
  images: string[];
  onStartOver: () => void;
}

export default function ResultScreen({ images, onStartOver }: ResultScreenProps) {
  const [zoomedImageForComparison, setZoomedImageForComparison] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(0);
  const [cacheStatus, setCacheStatus] = useState('');
  const { userAnswers, analysisData, resultImages, setResultImages, error, setError, imageBase64 } = useAppContext();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [generating360, setGenerating360] = useState<Record<string, boolean>>({});
  const [threeSixtyImages, setThreeSixtyImages] = useState<Record<string, string>>({});
  const [showThreeSixtyViewer, setShowThreeSixtyViewer] = useState<string | null>(null);

  const handleSelectImage = (image: string) => {
    setSelectedImages(prev => {
      if (prev.includes(image)) {
        return prev.filter(i => i !== image);
      }
      if (prev.length < 2) {
        return [...prev, image];
      }
      return prev;
    });
  };
  
  const handleGenerateMore = async () => {
    if (!images[0] || !analysisData || !analysisData.designerNotes || !userAnswers) {
      setError("Could not generate more designs because the session data is incomplete. Please start over.");
      return;
    }

    const numToGenerate = 4;
    setLoadingMore(numToGenerate);
    setError(null);

    try {
      const generationPromises = Array.from({ length: numToGenerate }).map(() =>
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalImage: images[0], // Use the first generated image as the base
            designerNotes: analysisData.designerNotes,
            userAnswers: userAnswers,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to generate more images');
          }
          return res.json();
        })
      );

      const results = await Promise.all(generationPromises);
      const newImages = results.map(data => data.image).filter(Boolean);
      
      if (newImages.length > 0) {
        setResultImages(prevImages => [...prevImages, ...newImages]);
      }
      if (newImages.length < numToGenerate) {
        setError(`Successfully generated ${newImages.length} new designs, but ${numToGenerate - newImages.length} failed.`);
      }

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoadingMore(0);
    }
  };

  const handleGenerateVariation = async (baseImage: string) => {
    if (!userAnswers) {
      setError("Could not generate a variation. Please start over.");
      return;
    }
    const numToGenerate = 4;
    setLoadingMore(numToGenerate);
    setError(null);
    try {
      const generationPromises = Array.from({ length: numToGenerate }).map(() =>
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalImage: baseImage,
            designerNotes: "Generate a variation of this design.",
            userAnswers: userAnswers,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to generate variation');
          }
          return res.json();
        })
      );

      const results = await Promise.all(generationPromises);
      const newImages = results.map(data => data.image).filter(Boolean);

      if (newImages.length > 0) {
        setResultImages(prevImages => [...prevImages, ...newImages]);
      }
      if (newImages.length < numToGenerate) {
        setError(`Successfully generated ${newImages.length} new variations, but ${numToGenerate - newImages.length} failed.`);
      }

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoadingMore(0);
    }
  };

  const handleGenerate360 = async (baseImage: string) => {
    setGenerating360(prev => ({ ...prev, [baseImage]: true }));
    setError(null);
    try {
      const response = await fetch('/api/generate-360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redesignedImage: baseImage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate 360 view');
      }

      const data = await response.json();
      setThreeSixtyImages(prev => ({ ...prev, [baseImage]: data.image }));
      setShowThreeSixtyViewer(data.image);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setGenerating360(prev => ({ ...prev, [baseImage]: false }));
    }
  };

  const handleClearCache = async () => {
    setCacheStatus('Clearing...');
    try {
      const response = await fetch('/api/clearcache', { method: 'POST' });
      if (response.ok) {
        setCacheStatus('Cache Cleared!');
      } else {
        setCacheStatus('Failed to clear cache.');
      }
    } catch (error) {
      setCacheStatus('Failed to clear cache.');
    }
    setTimeout(() => setCacheStatus(''), 3000);
  };

  return (
    <div className="w-full mx-auto z-10 relative px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your New Designs Are Ready!</h2>
        <p className="mt-2 text-lg text-gray-400">The core structure of your room has been preserved for a realistic comparison.</p>
      </div>
      
      <div className={`grid gap-8 ${images.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {images.map((image, index) => (
          <div key={index} className="group relative bg-gray-800/50 rounded-xl shadow-lg overflow-hidden cursor-pointer" onClick={() => setZoomedImageForComparison(image)}>
             <div 
              className="absolute top-2 right-2 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <input 
                type="checkbox" 
                className="h-6 w-6 rounded bg-gray-700/50 border-gray-500 text-blue-500 focus:ring-blue-500/50"
                checked={selectedImages.includes(image)}
                onChange={() => handleSelectImage(image)}
                disabled={selectedImages.length >= 2 && !selectedImages.includes(image)}
              />
            </div>
            <Image
              src={image}
              alt={`Generated Design ${index + 1}`}
              width={500}
              height={500}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <a href={image} download={`interior-design-${index + 1}.png`} title="Download" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold p-3 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
              <button onClick={(e) => { e.stopPropagation(); handleGenerateVariation(image); }} title="Generate Variations" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold p-3 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </button>
              {threeSixtyImages[image] ? (
                <button onClick={(e) => { e.stopPropagation(); setShowThreeSixtyViewer(threeSixtyImages[image]); }} title="View 360" className="bg-green-500/50 backdrop-blur-sm hover:bg-green-500/70 text-white font-semibold p-3 rounded-full transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5h-2zm0 7h2v2h-2z"/></svg>
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); handleGenerate360(image); }} title="Generate 360 View" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold p-3 rounded-full transition" disabled={generating360[image]}>
                  {generating360[image] ? (
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {Array.from({ length: loadingMore }).map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
      
      <div className="text-center mt-10 flex justify-center gap-4">
        <button type="button" onClick={onStartOver} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200">
          Start Over
        </button>
        {selectedImages.length === 2 && (
          <button type="button" onClick={() => setShowComparison(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200">
            Compare Selected
          </button>
        )}
        <button type="button" onClick={handleGenerateMore} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200">
          Generate More
        </button>
        <button type="button" onClick={handleClearCache} disabled={!!cacheStatus} className="bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 disabled:opacity-50">
          {cacheStatus || 'Clear Cache'}
        </button>
      </div>

      {zoomedImageForComparison && imageBase64 && (
        <ImageComparison 
          images={[imageBase64, zoomedImageForComparison]} 
          onClose={() => setZoomedImageForComparison(null)} 
        />
      )}
      
      {showComparison && selectedImages.length === 2 && (
        <ImageComparison 
          images={selectedImages as [string, string]} 
          onClose={() => {
            setShowComparison(false);
            setSelectedImages([]);
          }} 
        />
      )}

      {showThreeSixtyViewer && (
        <div>
          <button 
            onClick={() => setShowThreeSixtyViewer(null)} 
            className="fixed top-4 right-4 z-[60] bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold p-3 rounded-full transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ThreeSixtyViewer imageUrl={showThreeSixtyViewer} />
        </div>
      )}
    </div>
  );
}