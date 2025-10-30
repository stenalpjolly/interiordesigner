import Image from 'next/image';
import { useState } from 'react';

interface AnalysisData {
  designerNotes: string;
  questions: {
    question: string;
    options: string[];
    type: 'single' | 'multiple';
  }[];
}

interface QuestionsScreenProps {
  analysisData: AnalysisData;
  imageData: string;
  onSubmit: (answers: Record<string, string>, variantCount: number) => void;
  error?: string | null;
}

export default function QuestionsScreen({ analysisData, imageData, onSubmit, error }: QuestionsScreenProps) {
  const [variantCount, setVariantCount] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const answers: Record<string, string> = {};
    analysisData.questions.forEach((q, index) => {
      const questionId = `question-${index}`;
      if (q.type === 'multiple') {
        const selectedOptions = formData.getAll(questionId) as string[];
        if (selectedOptions.length > 0) {
          answers[q.question] = selectedOptions.join(', ');
        }
      } else {
        const answer = formData.get(questionId) as string;
        if (answer) {
          answers[q.question] = answer;
        }
      }
    });
    onSubmit(answers, variantCount);
  };

  return (
    <div className="w-full mx-auto animate-fade-in">
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 text-red-300 rounded-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Refine Your Vision</h2>
        <p className="mt-2 text-lg text-gray-400">Your answers will guide the AI's creative process.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Notes and Image */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-10 lg:self-start">
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
            <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
              AI Designer&apos;s Notes
            </h3>
            <p className="text-gray-300 italic text-sm">{analysisData.designerNotes}</p>
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
            <div className="p-2">
              <Image src={imageData} alt="Room preview" width={800} height={800} className="rounded-md w-full h-auto object-contain bg-gray-800" />
            </div>
          </div>
        </div>
        
        {/* Right Column: Questions Form */}
        <form id="questions-form" onSubmit={handleSubmit} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {analysisData.questions.map((q, index) => (
            <div key={index} className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 transform transition-transform duration-200 hover:scale-[1.02] hover:border-blue-500/70">
              <p className="font-semibold mb-1 text-lg text-gray-200">{index + 1}. {q.question}</p>
              {q.type === 'multiple' && <p className="text-xs text-gray-400 mb-4"> (Select all that apply)</p>}
              
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} htmlFor={`q-${index}-o-${optIndex}`} className="block">
                    <input
                      type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                      id={`q-${index}-o-${optIndex}`}
                      name={`question-${index}`}
                      value={option}
                      defaultChecked={q.type === 'single' && optIndex === 0}
                      className="hidden peer"
                    />
                    <span className="flex items-center justify-center w-full text-center py-3 px-4 rounded-md bg-gray-700/50 text-gray-300 cursor-pointer transition-all duration-150 border-2 border-transparent hover:border-blue-500/50 active:scale-95 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:font-semibold peer-checked:border-blue-400">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="sm:col-span-2 bg-gray-800/50 p-4 rounded-lg flex items-center justify-between border border-gray-700/50">
            <label htmlFor="variant-count" className="font-semibold text-gray-300">How many designs?</label>
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

          <button type="submit" className="sm:col-span-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-lg shadow-lg hover:shadow-blue-500/50">
            Generate My Designs
          </button>
        </form>
      </div>
    </div>
  );
}