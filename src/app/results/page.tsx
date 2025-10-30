"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/AppContext';
import ResultScreen from '@/components/ResultScreen';
import LoadingScreen from '@/components/LoadingScreen';

export default function ResultsPage() {
  const { resultImages, setImageBase64, setAnalysisData, setResultImages, isHydrated } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && resultImages.length === 0) {
      router.push('/');
    }
  }, [resultImages, router, isHydrated]);

  const handleStartOver = () => {
    setImageBase64(null);
    setAnalysisData(null);
    setResultImages([]);
    sessionStorage.removeItem('appState');
    router.push('/');
  };

  if (!isHydrated || resultImages.length === 0) {
    return <LoadingScreen text="Loading results..." />;
  }

  return <ResultScreen images={resultImages} onStartOver={handleStartOver} />;
}
