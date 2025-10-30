"use client";

import { useState } from "react";
import UploadScreen from "@/components/UploadScreen";
import LoadingScreen from "@/components/LoadingScreen";
import QuestionsScreen from "@/components/QuestionsScreen";
import ResultScreen from "@/components/ResultScreen";

// Define types for our state
interface AnalysisData {
  designerNotes: string;
  questions: {
    question: string;
    options: string[];
  }[];
}

export default function HomePage() {
  const [screen, setScreen] = useState('upload'); // upload, analyzing, questions, generating, results
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [variantCount, setVariantCount] = useState(2); // Keep track of variant count

  const handleImageUpload = async (imageData: string) => {
    setImageBase64(imageData);
    setScreen('analyzing');
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisData(data);
      setScreen('questions');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setScreen('upload'); // Go back to upload on error
    }
  };

  const handleQuestionsSubmit = async (answers: Record<string, string>, count: number) => {
    setScreen('generating');
    setError(null);
    setResultImages([]);
    setVariantCount(count); // Set variant count for the loading screen message

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
          return res.json();
        })
      );

      const results = await Promise.all(generationPromises);
      const images = results.map(result => result.image).filter(Boolean);
      
      if (images.length === 0) {
        throw new Error("Image generation failed to produce any results.");
      }

      setResultImages(images);
      setScreen('results');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setScreen('questions'); // Go back to questions on error
    }
  };

  const handleStartOver = () => {
    setScreen('upload');
    setImageBase64(null);
    setAnalysisData(null);
    setResultImages([]);
    setError(null);
  };

  const getScreenContent = () => {
    switch (screen) {
      case 'upload':
        return <UploadScreen onImageUpload={handleImageUpload} />;
      case 'analyzing':
        return <LoadingScreen text="Analyzing Your Room..." subtext="Our AI is getting to know your space." />;
      case 'questions':
        if (analysisData && imageBase64) {
          return <QuestionsScreen analysisData={analysisData} imageData={imageBase64} onSubmit={handleQuestionsSubmit} />;
        }
        // Fallback or error state if data is missing
        handleStartOver();
        return null;
      case 'generating':
        return <LoadingScreen text="Generating Your Designs..." subtext={`Creating ${variantCount} unique option${variantCount > 1 ? 's' : ''}. Please wait.`} />;
      case 'results':
        return <ResultScreen images={resultImages} onStartOver={handleStartOver} />;
      default:
        return <UploadScreen onImageUpload={handleImageUpload} />;
    }
  };

  const containerMaxWidth = screen === 'questions' || screen === 'results' ? 'max-w-7xl' : 'max-w-xl';

  return (
    <main className="text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-900 font-sans">
      <div className="w-full max-w-md text-center mb-8 mt-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          AI Interior Designer
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 mt-2">
          Instantly redesign any room in your home.
        </p>
      </div>

      <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl w-full ${containerMaxWidth} transition-all duration-500`}>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span><strong>Error:</strong> {error}</span>
          </div>
        )}
        
        {getScreenContent()}
      </div>
      
      <footer className="text-center text-gray-500 text-sm mt-8 mb-4">
        <p>&copy; {new Date().getFullYear()} 10x Interior Designer. All rights reserved.</p>
      </footer>
    </main>
  );
}
