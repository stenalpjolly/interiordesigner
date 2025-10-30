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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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

  return (
    <main className="text-white min-h-screen flex items-center justify-center p-4 bg-gray-900 font-sans">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-400">10x Interior Designer</h1>
        <p className="text-center text-gray-400 mb-6">Upload a photo of your room to begin</p>

        {error && (
          <div className="mt-4 p-4 bg-red-800 border border-red-700 text-red-200 rounded-lg">
            {`Error: ${error}`}
          </div>
        )}

        {screen === 'upload' && <UploadScreen onImageUpload={handleImageUpload} />}
        
        {screen === 'analyzing' && <LoadingScreen text="Analyzing your room..." subtext="Our 10x designer is getting to know your space." />}
        
        {screen === 'questions' && analysisData && imageBase64 && (
          <QuestionsScreen 
            analysisData={analysisData} 
            imageData={imageBase64}
            onSubmit={handleQuestionsSubmit} 
          />
        )}
        
        {screen === 'generating' && <LoadingScreen text="Generating your designs..." subtext={`Creating ${variantCount} unique option${variantCount > 1 ? 's' : ''}. Please wait.`} />}
        
        {screen === 'results' && resultImages.length > 0 && (
          <ResultScreen images={resultImages} onStartOver={handleStartOver} />
        )}

      </div>
    </main>
  );
}
