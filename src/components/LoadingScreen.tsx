"use client";

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  text: string;
}

const messages = [
  "Analyzing room layout...",
  "Identifying key furniture pieces...",
  "Assessing lighting conditions...",
  "Generating creative concepts...",
  "Finalizing design options...",
  "Almost there...",
];

export default function LoadingScreen({ text }: LoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessage, setDisplayedMessage] = useState(messages[0]);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % messages.length;
          setDisplayedMessage(messages[nextIndex]);
          return nextIndex;
        });
        setIsFading(false);
      }, 500); // Half of the interval for fade-out
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-2xl animate-fade-in w-full max-w-lg shadow-2xl border border-gray-700/50">
      <div className="relative h-20 w-20 mb-6">
        <div className="absolute inset-0 border-4 border-blue-400/20 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3 text-center">{text}</h2>
      <div className="h-6">
        <p className={`text-gray-400 text-center transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          {displayedMessage}
        </p>
      </div>
    </div>
  );
}