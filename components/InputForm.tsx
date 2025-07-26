import React from 'react';
import { LoadingSpinnerIcon, SparklesIcon, NewspaperIcon } from './icons';

interface InputFormProps {
  headline: string;
  onHeadlineChange: (value: string) => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  newsUrl: string;
  onNewsUrlChange: (value: string) => void;
  onSubmit: () => void;
  onAutoFindClick: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  headline,
  onHeadlineChange,
  imageUrl,
  onImageUrlChange,
  newsUrl,
  onNewsUrlChange,
  onSubmit,
  onAutoFindClick,
  isLoading
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const canSubmit = !!newsUrl && !isLoading;

  return (
    <div className="space-y-6 pt-4 border-t border-white/20">
      <h3 className="text-xl font-semibold text-gray-200">Content Input</h3>
       <button
        type="button"
        onClick={onAutoFindClick}
        className="w-full flex justify-center items-center py-3 px-4 border border-dashed border-red-500 rounded-md shadow-sm text-sm font-medium text-red-300 bg-red-900/20 hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
      >
        <NewspaperIcon className="h-5 w-5 mr-2" />
        Auto-Find Content
      </button>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-white/20"></div>
        <span className="flex-shrink mx-4 text-gray-300 text-sm">OR</span>
        <div className="flex-grow border-t border-white/20"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="newsUrl" className="block text-sm font-medium text-gray-300 mb-1">
            News Article URL (Required)
          </label>
          <input
            id="newsUrl"
            type="url"
            value={newsUrl}
            onChange={(e) => onNewsUrlChange(e.target.value)}
            placeholder="https://example.com/news-article"
            className="w-full bg-black/20 border border-white/10 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            required
          />
        </div>
         <div>
          <label htmlFor="headline" className="block text-sm font-medium text-gray-300 mb-1">
            Headline (Optional)
          </label>
          <input
            id="headline"
            type="text"
            value={headline}
            onChange={(e) => onHeadlineChange(e.target.value)}
            placeholder="Leave blank to auto-generate from URL"
            className="w-full bg-black/20 border border-white/10 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">
            Image URL (Optional)
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="Leave blank to auto-generate from URL"
            className="w-full bg-black/20 border border-white/10 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]"
        >
          {isLoading ? (
            <>
              <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-3" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Content
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;