import React from 'react';
import type { NewsData } from '../types';
import { CheckCircleIcon, LoadingSpinnerIcon, PaperAirplaneIcon, PhotographIcon, ClockIcon } from './icons';
import ImageOptions from './ImageOptions';

interface PreviewProps {
    newsData: NewsData | null;
    summary: string | null;
    onQueue: () => void;
    onPostNow: () => void;
    isLoading: boolean;
    isSending: boolean;
    isApproved: boolean;
    onFindAlternativeImage: () => void;
    onGenerateAIImage: () => void;
    isGeneratingImage: boolean;
    headline: string;
    onHeadlineChange: (value: string) => void;
    imageUrlOptions: string[];
    onImageUrlChange: (value: string) => void;
}

const renderHeadline = (headline: string) => {
    /*
    AI Content Generation Guidelines:
    The headline above the image should adhere to the following structure for visual consistency and impact.
    It can be one, two, or three lines long.
    Each line should contain between 2 to 4 words.
    The last 1 or 2 words of the final line must be highlighted with a red background.
    This structure ensures readability and creates a strong focal point.
    Example:
    MILSTONE TRAGEDY:
    7TH GRADER MAHTAB
    PASSES AWAY (highlighted)
    */
    const words = headline.toUpperCase().split(' ');
    if (words.length === 0) return null;

    const lines = [];
    // Create chunks of 2-4 words. We'll aim for 3 as a baseline.
    for (let i = 0; i < words.length; i += 3) {
        lines.push(words.slice(i, i + 3));
    }
    
    // Balance the last line: if it has 1 word and there's a previous line, borrow a word.
    if (lines.length > 1 && lines[lines.length - 1].length === 1) {
        const prevLine = lines[lines.length - 2];
        const wordToMove = prevLine.pop();
        if (wordToMove) {
            lines[lines.length - 1].unshift(wordToMove);
        }
    }

    const joinedLines = lines.map(chunk => chunk.join(' ')).filter(Boolean);
    if (joinedLines.length === 0) return null;
    
    const lastLineText = joinedLines.pop() || '';
    const lastLineWords = lastLineText.split(' ');

    // Highlight the last word or two of the very last line
    const highlightCount = lastLineWords.length > 2 ? 2 : lastLineWords.length;
    const mainPart = lastLineWords.slice(0, lastLineWords.length - highlightCount).join(' ');
    const highlightedPart = lastLineWords.slice(lastLineWords.length - highlightCount).join(' ');

    return (
        <>
            {joinedLines.map((line, index) => (
                <React.Fragment key={index}>{line}<br /></React.Fragment>
            ))}
            {mainPart}
            {mainPart && ' '}
            <span className="bg-red-600 text-white px-2 box-decoration-clone whitespace-nowrap py-[2px] inline-block align-middle">
                {highlightedPart}
            </span>
        </>
    );
};


const Preview: React.ForwardRefRenderFunction<HTMLDivElement, PreviewProps> = (
  {
    newsData,
    summary,
    onQueue,
    onPostNow,
    isLoading,
    isSending,
    isApproved,
    onFindAlternativeImage,
    onGenerateAIImage,
    isGeneratingImage,
    headline,
    onHeadlineChange,
    imageUrlOptions,
    onImageUrlChange
  },
  ref
) => {
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  // Whenever the image URL changes, reset the loading state to trigger the fade-in effect.
  React.useEffect(() => {
      if (newsData?.imageUrl) {
          setIsImageLoading(true);
      }
  }, [newsData?.imageUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <LoadingSpinnerIcon className="animate-spin h-10 w-10 mb-4 text-red-400" />
        <p className="text-lg">Generating content with Gemini AI...</p>
        <p className="text-sm">This might take a moment.</p>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 border-2 border-dashed border-white/20 rounded-lg p-8">
        <PhotographIcon className="h-16 w-16 mb-4" />
        <p className="text-lg text-center">Your preview will appear here once you generate it.</p>
      </div>
    );
  }

  const canApprove = summary && !isSending && !isApproved;

  return (
    <div className="space-y-6">
       {newsData && (
        <div className="mb-4">
            <label htmlFor="preview-headline" className="block text-sm font-medium text-gray-300 mb-1">
                Edit Headline
            </label>
            <input
                id="preview-headline"
                type="text"
                value={headline}
                onChange={(e) => onHeadlineChange(e.target.value)}
                placeholder="e.g., Groundbreaking Discovery on Mars"
                className="w-full bg-black/20 border border-white/10 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
        </div>
     )}
       <div className="flex flex-row items-center gap-4">
            {/* The ref is applied to the main content container that will be captured as an image */}
            <div ref={ref} className="bg-white shadow-lg aspect-square flex flex-col overflow-hidden flex-grow">
                {/* 
                  AI Content Generation Guidelines:
                  The final image will be a square.
                  The top 30% of this square is a white space reserved for text.
                  The bottom 70% is for the main image (found or generated).
                  The logo is placed on the bottom-left.
                  "Dhaka Dispatch" text is on the bottom-right.
                */}
                <div className="h-[30%] bg-white p-4 flex flex-col justify-center relative">
                    <h3 
                        className="font-anton text-3xl sm:text-4xl lg:text-5xl text-black text-center leading-tight tracking-wide uppercase"
                    >
                        {renderHeadline(newsData.headline)}
                    </h3>
                </div>

                {/* Bottom 70%: Image Area */}
                <div className="h-[70%] w-full relative bg-gray-300">
                    <img
                        src={newsData.imageUrl}
                        alt="News visual"
                        className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                        crossOrigin={newsData.imageUrl.startsWith('data:') ? undefined : 'anonymous'}
                        onLoad={() => setIsImageLoading(false)}
                        onError={(e) => {
                            setIsImageLoading(false); // Also stop loading on error
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1740&auto=format&fit=crop';
                        }}
                    />
                    {/* Overlays */}
                    <img 
                        src="https://res.cloudinary.com/dy80ftu9k/image/upload/v1753507647/scs_cqidjz.png" 
                        alt="Logo" 
                        className="absolute bottom-4 left-4 h-16 md:h-24 w-auto"
                        crossOrigin="anonymous" 
                    />
                    <p 
                        className="absolute bottom-3 right-3 font-oswald text-sm font-bold text-white uppercase tracking-wider" 
                        style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}
                    >
                        Dhaka Dispatch
                    </p>
                </div>
            </div>
            <ImageOptions
                onFindImage={onFindAlternativeImage}
                onGenerateImage={onGenerateAIImage}
                isDisabled={!newsData || isGeneratingImage}
                isGenerating={isGeneratingImage}
                onImageUrlChange={onImageUrlChange}
            />
       </div>

      {imageUrlOptions && imageUrlOptions.length > 1 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Image Options:</h4>
          <div className="flex gap-2 flex-wrap bg-black/20 p-2 rounded-md border border-white/10">
            {imageUrlOptions.map((url) => (
              <button
                key={url}
                onClick={() => onImageUrlChange(url)}
                className={`rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-all duration-200 hover:scale-105 ${
                  newsData.imageUrl === url ? 'ring-2 ring-red-500' : ''
                }`}
                aria-label="Select this image"
              >
                <img
                  src={url}
                  alt="Alternative news visual"
                  className="w-24 h-16 object-cover rounded-md cursor-pointer hover:opacity-80"
                   onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none'; // Hide broken images in options
                    }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-lg font-semibold text-gray-300 mb-2">AI Generated Summary:</h4>
        <div className="bg-black/20 p-4 rounded-md border border-white/10 min-h-[100px]">
          {summary ? (
             <p className="text-gray-300 italic whitespace-pre-wrap">{summary}</p>
          ) : (
            <p className="text-gray-500">No summary generated yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <button
          onClick={onPostNow}
          disabled={!canApprove}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
            isApproved
              ? 'bg-green-600 text-white cursor-default'
              : 'text-white bg-rose-600 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(244,63,94,0.6)]'
          }`}
        >
          {isSending ? (
            <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-3" />
          ) : isApproved ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
          )}
          {isApproved ? 'Sent!' : 'Post Now'}
        </button>
        <button
          onClick={onQueue}
          disabled={!canApprove}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
            isApproved
              ? 'bg-green-600 text-white cursor-default'
              : 'text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]'
          }`}
        >
          {isSending ? (
            <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-3" />
          ) : isApproved ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <ClockIcon className="h-5 w-5 mr-2" />
          )}
          {isApproved ? 'Sent!' : 'Queue'}
        </button>
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">
        Queued posts are published twice daily at <strong>3 PM</strong> and <strong>7 PM</strong>.
      </p>
    </div>
  );
};

export default React.forwardRef(Preview);