"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/AppContext';
import QuestionsScreen from '@/components/QuestionsScreen';
import LoadingScreen from '@/components/LoadingScreen';

export default function QuestionsPage() {
  const { analysisData, imageBase64, setResultImages, setError, setUserAnswers } = useAppContext();
  const router = useRouter();
  
  useEffect(() => {
    if (!analysisData || !imageBase64) {
      router.push('/');
    }
  }, [analysisData, imageBase64, router]);

  const handleQuestionsSubmit = async (answers: Record<string, string>, count: number) => {
    setUserAnswers(answers);
    setError(null);
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

      const results = await Promise.allSettled(generationPromises);
      
      const successfulImages = results
        .filter((result): result is PromiseFulfilledResult<{ image: string }> => result.status === 'fulfilled' && result.value.image)
        .map(result => result.value.image);

      const failedReasons = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason.message);

      if (successfulImages.length > 0) {
        setResultImages(successfulImages);
        if (failedReasons.length > 0) {
          setError(`Could not generate all images. Failed: ${failedReasons.length}`);
        }
        router.push('/results');
      } else {
        setError(`Image generation failed. Reasons: ${failedReasons.join(', ')}`);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (!analysisData || !imageBase64) {
    return <LoadingScreen text="Loading..." />;
  }

  return <QuestionsScreen analysisData={analysisData} imageData={imageBase64} onSubmit={handleQuestionsSubmit} error={error} />;
}
