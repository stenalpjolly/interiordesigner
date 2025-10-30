"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/AppContext';
import ResultScreen from '@/components/ResultScreen';
import LoadingScreen from '@/components/LoadingScreen';

export default function ResultsPage() {
  const { resultImages, setImageBase64, setAnalysisData, setResultImages } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (resultImages.length === 0) {
      router.push('/');
    }
  }, [resultImages, router]);

  const handleStartOver = () => {
    setImageBase64(null);
    setAnalysisData(null);
    setResultImages([]);
    router.push('/');
  };

  if (resultImages.length === 0) {
    return <LoadingScreen text="Loading results..." />;
  }

  return <ResultScreen images={resultImages} onStartOver={handleStartOver} />;
}
