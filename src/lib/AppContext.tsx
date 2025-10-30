"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

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
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const value = {
    imageBase64,
    setImageBase64,
    analysisData,
    setAnalysisData,
    resultImages,
    setResultImages,
    error,
    setError,
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
