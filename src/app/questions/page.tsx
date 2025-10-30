"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/AppContext';
import QuestionsScreen from '@/components/QuestionsScreen';
import LoadingScreen from '@/components/LoadingScreen';

export default function QuestionsPage() {
  const { analysisData, imageBase64, setResultImages, setError } = useAppContext();
  const router = useRouter();
  
  useEffect(() => {
    if (!analysisData || !imageBase64) {
      router.push('/');
    }
  }, [analysisData, imageBase64, router]);

  const handleQuestionsSubmit = async (answers: Record<string, string>, count: number) => {
    // TODO: Implement loading state management
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
      router.push('/results');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (!analysisData || !imageBase64) {
    return <LoadingScreen text="Loading..." />;
  }

  return <QuestionsScreen analysisData={analysisData} imageData={imageBase64} onSubmit={handleQuestionsSubmit} />;
}
