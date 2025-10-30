"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AnalysisData {
  designerNotes: string;
  questions: {
    question: string;
    options: string[];
  }[];
}

interface AppState {
  imageBase64: string | null;
  setImageBase64: (image: string | null) => void;
  analysisData: AnalysisData | null;
  setAnalysisData: (data: AnalysisData | null) => void;
  resultImages: string[];
  setResultImages: (images: string[]) => void;
  error: string | null;
  setError: (error: string | null) => void;
  userAnswers: Record<string, string> | null;
  setUserAnswers: (answers: Record<string, string> | null) => void;
  isHydrated: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string> | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('appState');
      if (savedState) {
        const { imageBase64, analysisData, resultImages, userAnswers } = JSON.parse(savedState);
        setImageBase64(imageBase64);
        setAnalysisData(analysisData);
        setResultImages(resultImages);
        setUserAnswers(userAnswers);
      }
    } catch (error) {
      console.error("Failed to parse sessionStorage data", error);
    }
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage on change
  useEffect(() => {
    if (isHydrated) {
      try {
        const appState = {
          imageBase64,
          analysisData,
          resultImages,
          userAnswers,
        };
        sessionStorage.setItem('appState', JSON.stringify(appState));
      } catch (error) {
        console.error("Failed to save to sessionStorage", error);
      }
    }
  }, [imageBase64, analysisData, resultImages, userAnswers, isHydrated]);

  const value = {
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
    isHydrated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
