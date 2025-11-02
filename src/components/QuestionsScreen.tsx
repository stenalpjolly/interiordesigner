import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface AnalysisData {
  designerNotes: string;
  questions: {
    question: string;
    options: string[];
    type: 'single' | 'multiple';
    coordinates: {
      x: number;
      y: number;
    };
  }[];
}

interface QuestionsScreenProps {
  analysisData: AnalysisData;
  imageData: string;
  onSubmit: (answers: Record<string, string>, variantCount: number) => void;
  onGenerateMoreQuestions: () => void;
  onDeleteQuestion: (index: number) => void;
  answers: Record<string, string[]>;
  onAnswerChange: (question: string, newAnswers: string[]) => void;
  error?: string | null;
}

export default function QuestionsScreen({ 
  analysisData, 
  imageData, 
  onSubmit, 
  onGenerateMoreQuestions, 
  onDeleteQuestion,
  answers,
  onAnswerChange,
  error 
}: QuestionsScreenProps) {
  const [variantCount, setVariantCount] = useState(2);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageData) {
      const img = new window.Image();
      img.src = imageData;
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
    }
  }, [imageData]);

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (container) {
        setContainerSize({ width: container.offsetWidth, height: container.offsetHeight });
      }
    });

    resizeObserver.observe(container);
    setContainerSize({ width: container.offsetWidth, height: container.offsetHeight });


    return () => resizeObserver.disconnect();
  }, []);

  const getHotspotPosition = (coord: { x: number; y: number }) => {
    if (!containerSize.width || !containerSize.height || !imageSize.width || !imageSize.height) {
      return { left: `${coord.x}%`, top: `${coord.y}%` };
    }

    const containerRatio = containerSize.width / containerSize.height;
    const imageRatio = imageSize.width / imageSize.height;

    if (imageRatio > containerRatio) { // Wider image -> vertical letterbox
      const scale = containerSize.width / imageSize.width;
      const scaledHeight = imageSize.height * scale;
      const yOffset = (containerSize.height - scaledHeight) / 2;
      
      const top = yOffset + (coord.y / 100) * scaledHeight;
      
      return { left: `${coord.x}%`, top: `${(top / containerSize.height) * 100}%` };
    } else { // Taller image -> horizontal letterbox
      const scale = containerSize.height / imageSize.height;
      const scaledWidth = imageSize.width * scale;
      const xOffset = (containerSize.width - scaledWidth) / 2;

      const left = xOffset + (coord.x / 100) * scaledWidth;

      return { left: `${(left / containerSize.width) * 100}%`, top: `${coord.y}%` };
    }
  };

  const handleHotspotClick = (index: number) => {
    const questionElement = questionRefs.current[index];
    const scrollContainer = scrollContainerRef.current;

    if (questionElement && scrollContainer) {
      const offsetTop = questionElement.offsetTop;
      scrollContainer.scrollTo({
        top: offsetTop - 20, // A small offset from the top
        behavior: 'smooth',
      });

      questionElement.classList.add('highlight');
      setTimeout(() => {
        questionElement.classList.remove('highlight');
      }, 1500);
    }
  };

  const handleOptionChange = (question: string, option: string, type: 'single' | 'multiple') => {
    const currentAnswers = answers[question] || [];
    let newAnswers: string[];

    if (type === 'single') {
      newAnswers = [option];
    } else { // multiple
      if (currentAnswers.includes(option)) {
        newAnswers = currentAnswers.filter(a => a !== option);
      } else {
        newAnswers = [...currentAnswers, option];
      }
    }
    onAnswerChange(question, newAnswers);
  };

  const handleCustomAnswerChange = (question: string, value: string) => {
    const currentAnswers = answers[question] || [];
    const otherAnswers = currentAnswers.filter(a => !a.startsWith('custom:'));
    const newAnswers = value.trim() ? [...otherAnswers, `custom:${value}`] : otherAnswers;
    onAnswerChange(question, newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedAnswers: Record<string, string> = {};
    for (const question in answers) {
      const answerList = answers[question];
      if (answerList && answerList.length > 0) {
        processedAnswers[question] = answerList
          .map(a => a.startsWith('custom:') ? a.substring(7).trim() : a)
          .join(', ');
      }
    }

    onSubmit(processedAnswers, variantCount);
  };

  return (
    <div className="w-full mx-auto animate-fade-in">
      <style jsx>{`
        .highlight {
          animation: highlight-anim 1.5s ease-out;
        }
        @keyframes highlight-anim {
          0% {
            transform: scale(1.02);
            border-color: rgba(59, 130, 246, 0.7);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
          100% {
            transform: scale(1);
            border-color: #4B5563;
            box-shadow: none;
          }
        }
      `}</style>
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Refine Your Vision</h2>
          <p className="mt-2 text-lg text-gray-400">Your answers will guide the AI's creative process. All questions are optional.</p>
        </div>

        <div className="bg-gray-800/30 p-4 rounded-lg flex items-center justify-end gap-4 mb-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <label htmlFor="variant-count" className="font-semibold text-gray-300 text-sm">How many designs?</label>
            <select
              id="variant-count"
              value={variantCount}
              onChange={(e) => setVariantCount(parseInt(e.target.value, 10))}
              className="bg-gray-700 border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-blue-500/50">
            Generate
          </button>
          <button
            type="button"
            onClick={onGenerateMoreQuestions}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-gray-500/50"
          >
            Generate More Questions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ height: 'calc(80vh - 80px)' }}>
          {/* Left Column: Image & Notes */}
          <div className="flex flex-col gap-6 h-full">
            <div ref={imageContainerRef} className="relative flex-1 min-h-0 rounded-lg border border-gray-700/50">
              <Image src={imageData} alt="Room preview" layout="fill" objectFit="contain" className="rounded-lg" />
              {analysisData.questions.map((q, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleHotspotClick(index)}
                  className="absolute w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 bg-blue-500/80 backdrop-blur-sm border-2 border-white/50 hover:scale-125 transition-transform duration-200 animate-pulse"
                  style={getHotspotPosition(q.coordinates)}
                  aria-label={`Go to question ${index + 1}`}
                >
                  <span className="font-bold text-white text-sm">{index + 1}</span>
                </button>
              ))}
            </div>
            <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50 flex-shrink-0 max-h-[25%] overflow-y-auto">
              <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                AI Designer&apos;s Notes
              </h3>
              <p className="text-gray-300 italic text-sm">{analysisData.designerNotes}</p>
            </div>
          </div>
          
          {/* Right Column: Questions */}
          <div ref={scrollContainerRef} className="h-full overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData.questions.map((q, index) => {
                const customOptionId = `custom-input-${index}`;
                const currentAnswers = answers[q.question] || [];
                const customAnswerValue = currentAnswers.find(a => a.startsWith('custom:'))?.substring(7) || '';

                return (
                  <div 
                    key={q.question} 
                    ref={el => questionRefs.current[index] = el}
                    className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 h-fit"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold mb-1 text-lg text-gray-200 flex-1">{index + 1}. {q.question}</p>
                      <button 
                        type="button" 
                        onClick={() => onDeleteQuestion(index)}
                        className="text-gray-500 hover:text-red-400 transition-colors duration-200"
                        aria-label="Delete question"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    {q.type === 'multiple' && <p className="text-xs text-gray-400 mb-4">(Select all that apply)</p>}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((option, optIndex) => (
                        <label key={optIndex} className="block">
                          <input
                            type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                            name={`question-${index}`}
                            value={option}
                            checked={currentAnswers.includes(option)}
                            onChange={() => handleOptionChange(q.question, option, q.type)}
                            className="hidden peer"
                          />
                          <span className="flex items-center justify-center w-full text-center py-3 px-4 rounded-md bg-gray-700/50 text-gray-300 cursor-pointer transition-all duration-150 border-2 border-transparent hover:border-blue-500/50 active:scale-95 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:font-semibold peer-checked:border-blue-400">
                            {option}
                          </span>
                        </label>
                      ))}
                      <label className="block">
                        <input
                          type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                          name={`question-${index}`}
                          value="custom"
                          checked={!!customAnswerValue}
                          onChange={() => {
                            // This checkbox toggles the custom answer state
                            if (customAnswerValue) {
                              handleCustomAnswerChange(q.question, '');
                            } else {
                              // Focus the input, maybe set a default custom value if needed
                            }
                          }}
                          className="hidden peer"
                          id={`custom-checkbox-${index}`}
                        />
                        <span className="flex items-center justify-center w-full text-center py-3 px-4 rounded-md bg-gray-700/50 text-gray-300 cursor-pointer transition-all duration-150 border-2 border-transparent hover:border-blue-500/50 active:scale-95 peer-checked:bg-yellow-600 peer-checked:text-white peer-checked:font-semibold peer-checked:border-yellow-400">
                          Other...
                        </span>
                      </label>
                    </div>
                    
                    <div className="mt-3">
                      <input
                        type="text"
                        id={customOptionId}
                        value={customAnswerValue}
                        onChange={(e) => handleCustomAnswerChange(q.question, e.target.value)}
                        onClick={() => {
                          const customCheckbox = document.getElementById(`custom-checkbox-${index}`) as HTMLInputElement;
                          if (customCheckbox) customCheckbox.checked = true;
                        }}
                        placeholder="Type your custom answer..."
                        className="w-full bg-gray-700 border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}