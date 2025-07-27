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

  const buttonBaseStyle = "w-full flex flex-col items-center justify-center p-2 border-2 border-gray-900 rounded-none shadow-sm text-xs font-bold text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none";

  return (
    <div className="flex-shrink-0 flex flex-col space-y-3 w-36">
      <h4 className="text-sm font-bold text-gray-700 border-b-2 border-gray-900 pb-2 text-center">Image Tools</h4>
      <button
        type="button"
        onClick={onFindImage}
        disabled={isDisabled}
        className={`${buttonBaseStyle} bg-blue-600 hover:bg-blue-500`}
        aria-label="Find new image"
      >
        <CameraIcon className="h-5 w-5 mb-1" />
        <span>Find New Image</span>
      </button>

      <button
        type="button"
        onClick={onGenerateImage}
        disabled={isDisabled || isGenerating}
        className={`${buttonBaseStyle} bg-red-600 hover:bg-red-500`}
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

      <div className="pt-2 mt-1 border-t-2 border-black/20">
        <label htmlFor="external-url" className="block text-center text-xs font-bold text-gray-700 mb-2">
          Or use link
        </label>
        <div className="flex flex-col space-y-2">
           <input
            id="external-url"
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="Paste image URL"
            className="w-full bg-white border-2 border-gray-900 rounded-none shadow-sm py-1 px-2 text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 transition"
          />
          <button
            type="button"
            onClick={handleSetExternalUrl}
            disabled={!externalUrl || isDisabled}
            className={`${buttonBaseStyle} bg-yellow-400 hover:bg-yellow-300 text-gray-900`}
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