import Image from 'next/image';
import { useState } from 'react';

interface AnalysisData {
  designerNotes: string;
  questions: {
    question: string;
    options: string[];
  }[];
}

interface QuestionsScreenProps {
  analysisData: AnalysisData;
  imageData: string;
  onSubmit: (answers: Record<string, string>, variantCount: number) => void;
}

export default function QuestionsScreen({ analysisData, imageData, onSubmit }: QuestionsScreenProps) {
  const [variantCount, setVariantCount] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const answers: Record<string, string> = {};
    analysisData.questions.forEach((q, index) => {
      const questionId = `question-${index}`;
      const answer = formData.get(questionId) as string;
      if (answer) {
        answers[q.question] = answer;
      }
    });
    onSubmit(answers, variantCount);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
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
            <div key={index} className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 transform transition-transform duration-300 hover:scale-105 hover:border-blue-500">
              <p className="font-semibold mb-4 text-lg text-gray-200">{index + 1}. {q.question}</p>
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} htmlFor={`q-${index}-o-${optIndex}`} className="block">
                    <input
                      type="radio"
                      id={`q-${index}-o-${optIndex}`}
                      name={`question-${index}`}
                      value={option}
                      defaultChecked={optIndex === 0}
                      className="hidden peer"
                    />
                    <span className="block w-full text-center py-3 px-2 rounded-md bg-gray-700/50 text-gray-300 cursor-pointer transition duration-200 border border-transparent hover:bg-gray-600/50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:font-semibold peer-checked:border-blue-400">
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