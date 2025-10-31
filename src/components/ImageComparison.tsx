import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageComparisonProps {
  images: [string, string];
  onClose: () => void;
}

export default function ImageComparison({ images, onClose }: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <style jsx>{`
        .no-select {
          user-select: none;
        }
      `}</style>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <div 
          ref={containerRef}
          className="relative w-[80vw] h-[80vh] max-w-6xl max-h-6xl rounded-lg overflow-hidden shadow-2xl no-select"
          onMouseMove={handleMouseMove}
        >
          <div className="absolute inset-0">
            <Image src={images[0]} layout="fill" objectFit="contain" alt="Comparison Image 1" />
          </div>
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <Image src={images[1]} layout="fill" objectFit="contain" alt="Comparison Image 2" />
          </div>
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
            </div>
          </div>
        </div>
        <button
          className="absolute -top-2 -right-2 text-white bg-gray-800/50 rounded-full p-1 hover:bg-gray-700"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
