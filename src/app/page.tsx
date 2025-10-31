"use client";

import { useState } from 'react';
import { useAppContext } from '@/lib/AppContext';
import UploadScreen from '@/components/UploadScreen';
import LoadingScreen from '@/components/LoadingScreen';
import QuestionsScreen from '@/components/QuestionsScreen';
import ResultScreen from '@/components/ResultScreen';

type Screen = 'upload' | 'loading' | 'questions' | 'results';

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [loadingText, setLoadingText] = useState('Analyzing your image...');
  const {
    imageBase64,
    setImageBase64,
    analysisData,
    setAnalysisData,
    resultImages,
    setResultImages,
    error,
    setError,
    userAnswers,
    setUserAnswers,
  } = useAppContext();

  const handleImageUpload = async (file: File) => {
    setLoadingText('Analyzing your image...');
    setScreen('loading');
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        if (!base64) {
          throw new Error("Missing image data");
        }
        setImageBase64(base64);

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64 }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze image');
        }

        const data = await response.json();
        setAnalysisData(data);
        setScreen('questions');
      };
      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setScreen('upload');
    }
  };

  const handleQuestionsSubmit = async (answers: Record<string, string | string[]>, count: number) => {
    setLoadingText('Generating your designs...');
    setScreen('loading');
    setError(null);
    setUserAnswers(answers);

    try {
      const generationPromises = Array.from({ length: count }, () =>
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalImage: imageBase64,
            designerNotes: analysisData?.designerNotes,
            userAnswers: answers,
          }),
        }).then(async res => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Generation failed: ${res.statusText}`);
          }
          const data = await res.json();
          if (!data.image) {
            throw new Error("Failed to parse image from API response");
          }
          return data;
        })
      );

      const results = await Promise.allSettled(generationPromises);
      
      const successfulImages = results
        .filter((result): result is PromiseFulfilledResult<{ image: string }> => result.status === 'fulfilled' && result.value.image)
        .map(result => result.value.image);

      const failedCount = results.length - successfulImages.length;

      if (successfulImages.length > 0) {
        setResultImages(successfulImages);
        setScreen('results');
        if (failedCount > 0) {
          setError(`${failedCount} image(s) failed to generate.`);
        }
      } else {
        throw new Error("Image generation failed for all requests.");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setScreen('questions');
    }
  };

  const handleStartOver = () => {
    setImageBase64(null);
    setAnalysisData(null);
    setResultImages([]);
    setError(null);
    setUserAnswers(null);
    setScreen('upload');
  };

  const getScreenContent = () => {
    switch (screen) {
      case 'upload':
        return <UploadScreen onImageUpload={handleImageUpload} error={error} />;
      case 'loading':
        return <LoadingScreen text={loadingText} />;
      case 'questions':
        if (analysisData && imageBase64) {
          return <QuestionsScreen analysisData={analysisData} imageData={imageBase64} onSubmit={handleQuestionsSubmit} error={error} />;
        }
        handleStartOver();
        return <UploadScreen onImageUpload={handleImageUpload} error="Something went wrong. Please start over." />;
      case 'results':
        return <ResultScreen images={resultImages} onStartOver={handleStartOver} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gray-900 text-white">
      <div className="absolute top-0 left-0 p-4">
        <h1 className="text-2xl font-bold tracking-tight">10x Interior Designer</h1>
      </div>
      <div className="w-[90%]">
        {getScreenContent()}
      </div>
    </main>
  );
}
