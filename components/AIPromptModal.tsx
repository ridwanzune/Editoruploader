import React, { useState, useEffect } from 'react';
import { LoadingSpinnerIcon, SparklesIcon } from './icons';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ isOpen, onClose, initialPrompt, onSubmit, isGenerating }) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl w-full max-w-2xl border border-white/10 shadow-[0_0_25px_rgba(239,68,68,0.3)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Edit AI Image Prompt
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full -mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-300 mb-2">
              You can edit the prompt below before generating the image. The AI has been instructed to create a landscape image with no text.
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-48 bg-black/20 border border-white/10 rounded-md shadow-sm p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating || !prompt}
              className="flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-3" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIPromptModal;