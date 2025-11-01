"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/AppContext';
import QuestionsScreen from '@/components/QuestionsScreen';
import LoadingScreen from '@/components/LoadingScreen';

export default function QuestionsPage() {
  const { analysisData, imageBase64, setResultImages, setError, userAnswers, setUserAnswers, setAnalysisData } = useAppContext();
  const router = useRouter();
  const [isLoadingMoreQuestions, setIsLoadingMoreQuestions] = useState(false);
  
  useEffect(() => {
    if (!analysisData || !imageBase64) {
      router.push('/');
    }
  }, [analysisData, imageBase64, router]);

  const handleGenerateMoreQuestions = async () => {
    setIsLoadingMoreQuestions(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          bypassCache: true,
          existingQuestions: analysisData?.questions.map(q => q.question) || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
      }

      const newData = await response.json();
      
      setAnalysisData(prevData => {
        if (!prevData) return newData;
        
        const existingQuestions = new Set(prevData.questions.map(q => q.question));
        const newQuestions = newData.questions.filter((q: any) => !existingQuestions.has(q.question));
        
        return {
          ...prevData,
          questions: [...prevData.questions, ...newQuestions],
        };
      });

    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoadingMoreQuestions(false);
    }
  };

  const handleQuestionsSubmit = async (answers: Record<string, string>, count: number) => {
    // setUserAnswers is now handled via onAnswerChange, but we can keep this to save the final answers if needed
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

  const handleAnswerChange = (question: string, newAnswers: string[]) => {
    setUserAnswers(prev => ({ ...prev, [question]: newAnswers }));
  };

  const handleDeleteQuestion = (index: number) => {
    if (!analysisData) return;
    const newQuestions = [...analysisData.questions];
    const deletedQuestion = newQuestions.splice(index, 1)[0];
    
    setAnalysisData({ ...analysisData, questions: newQuestions });
    
    // Also remove the answer for the deleted question
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      if (deletedQuestion) {
        delete newAnswers[deletedQuestion.question];
      }
      return newAnswers;
    });
  };

  if (!analysisData || !imageBase64 || isLoadingMoreQuestions) {
    return <LoadingScreen text={isLoadingMoreQuestions ? "Generating more questions..." : "Loading..."} />;
  }

  return (
    <QuestionsScreen 
      analysisData={analysisData} 
      imageData={imageBase64} 
      onSubmit={handleQuestionsSubmit} 
      onGenerateMoreQuestions={handleGenerateMoreQuestions}
      onDeleteQuestion={handleDeleteQuestion}
      answers={userAnswers || {}}
      onAnswerChange={handleAnswerChange}
      error={error} 
    />
  );
