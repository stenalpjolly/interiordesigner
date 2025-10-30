"use client";

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
    <div>
      <h2 className="text-2xl font-bold mb-4">Designer's Analysis & Questions</h2>
      <div className="mb-4 p-4 bg-gray-900 rounded-lg">
        <h3 className="font-semibold text-blue-300">Designer's Notes:</h3>
        <p className="text-gray-300 italic">{analysisData.designerNotes}</p>
      </div>
      <img src={imageData} alt="Room preview" className="rounded-lg w-full max-h-64 object-contain bg-gray-700 mb-6" />
      
      <form id="questions-form" onSubmit={handleSubmit}>
        <div className="space-y-6">
          {analysisData.questions.map((q, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-inner">
              <p className="font-semibold mb-3 text-lg">{q.question}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    <span className="block w-full text-center p-3 rounded-lg bg-gray-800 text-gray-300 cursor-pointer transition duration-200 hover:bg-gray-600 peer-checked:bg-blue-600 peer-checked:text-white">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="variant-count" className="text-lg font-semibold text-gray-300">Number of Designs:</label>
            <select
              id="variant-count"
              value={variantCount}
              onChange={(e) => setVariantCount(parseInt(e.target.value, 10))}
              className="bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
            Generate My Designs
          </button>
        </div>
      </form>
    </div>
  );
}