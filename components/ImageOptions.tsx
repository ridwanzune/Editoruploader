import React, { useState } from 'react';
import { CameraIcon, SparklesIcon, LoadingSpinnerIcon, LinkIcon } from './icons';

interface ImageOptionsProps {
  onFindImage: () => void;
  onGenerateImage: () => void;
  isDisabled: boolean;
  isGenerating: boolean;
  onImageUrlChange: (url: string) => void;
}

const ImageOptions: React.FC<ImageOptionsProps> = ({
  onFindImage,
  onGenerateImage,
  isDisabled,
  isGenerating,
  onImageUrlChange,
}) => {
  const [externalUrl, setExternalUrl] = useState('');

  const handleSetExternalUrl = () => {
    if (externalUrl) {
      onImageUrlChange(externalUrl);
      setExternalUrl('');
    }
  };

  return (
    <div className="flex-shrink-0 flex flex-col space-y-3 w-36">
      <h4 className="text-sm font-semibold text-gray-400 border-b border-white/20 pb-2 text-center">Image Tools</h4>
      <button
        type="button"
        onClick={onFindImage}
        disabled={isDisabled}
        className="w-full flex flex-col items-center justify-center p-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(244,63,94,0.7)]"
        aria-label="Find new image"
      >
        <CameraIcon className="h-5 w-5 mb-1" />
        <span>Find New Image</span>
      </button>

      <button
        type="button"
        onClick={onGenerateImage}
        disabled={isDisabled || isGenerating}
        className="w-full flex flex-col items-center justify-center p-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(220,38,38,0.7)]"
        aria-label="Generate AI image"
      >
        {isGenerating ? (
            <>
              <LoadingSpinnerIcon className="animate-spin h-5 w-5 mb-1" />
              <span>Generating...</span>
            </>
        ) : (
            <>
                <SparklesIcon className="h-5 w-5 mb-1" />
                <span>Generate AI Image</span>
            </>
        )}
      </button>

      <div className="pt-2 mt-1 border-t border-white/20">
        <label htmlFor="external-url" className="block text-center text-xs font-medium text-gray-400 mb-2">
          Or use link
        </label>
        <div className="flex flex-col space-y-2">
           <input
            id="external-url"
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="Paste image URL"
            className="w-full bg-black/20 border border-white/10 rounded-md shadow-sm py-1 px-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500 transition"
          />
          <button
            type="button"
            onClick={handleSetExternalUrl}
            disabled={!externalUrl || isDisabled}
            className="w-full flex items-center justify-center p-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(217,119,6,0.7)]"
            aria-label="Set image from external URL"
          >
            <LinkIcon className="h-4 w-4 mr-1" />
            <span>Set Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageOptions;