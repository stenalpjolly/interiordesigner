"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface AnalysisData {
  designerNotes: string;
  questions: {
    question: string;
    options: string[];
    type: 'single' | 'multiple';
  }[];
}

interface AppState {
  imageBase64: string | null;
  setImageBase64: (image: string | null) => void;
  analysisData: AnalysisData | null;
  setAnalysisData: (data: AnalysisData | null) => void;
  resultImages: string[];
  setResultImages: (images: string[] | ((prev: string[]) => string[])) => void;
  error: string | null;
  setError: (error: string | null) => void;
  userAnswers: Record<string, string | string[]> | null;
  setUserAnswers: (answers: Record<string, string | string[]> | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]> | null>(null);

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
