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
    headlineFontSize: number;
    onHeadlineFontSizeChange: (size: number) => void;
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
    headlineFontSize,
    onHeadlineFontSizeChange,
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
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <LoadingSpinnerIcon className="animate-spin h-10 w-10 mb-4 text-red-500" />
        <p className="text-lg font-bold">Generating content with Gemini AI...</p>
        <p className="text-sm">This might take a moment.</p>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 border-2 border-dashed border-gray-400 p-8">
        <PhotographIcon className="h-16 w-16 mb-4" />
        <p className="text-lg text-center font-bold">Your preview will appear here once you generate it.</p>
      </div>
    );
  }

  const canApprove = summary && !isSending && !isApproved;
  const isPublishing = isSending || isApproved;

  return (
    <div className="space-y-6">
       {newsData && (
        <div className="space-y-4 mb-4">
            <div>
                <label htmlFor="preview-headline" className="block text-sm font-bold text-gray-700 mb-1">
                    Edit Headline
                </label>
                <input
                    id="preview-headline"
                    type="text"
                    value={headline}
                    onChange={(e) => onHeadlineChange(e.target.value)}
                    placeholder="e.g., Groundbreaking Discovery on Mars"
                    className="w-full bg-white border-2 border-gray-900 rounded-none shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                />
            </div>
            <div>
                <label htmlFor="headline-size" className="block text-sm font-bold text-gray-700 mb-1">
                    Headline Size: <span className="font-mono bg-white/70 px-1 py-0.5 border border-gray-900">{headlineFontSize}px</span>
                </label>
                <input
                    id="headline-size"
                    type="range"
                    min="24"
                    max="72"
                    step="1"
                    value={headlineFontSize}
                    onChange={(e) => onHeadlineFontSizeChange(Number(e.target.value))}
                    className="w-full h-3 bg-white appearance-none cursor-pointer border-2 border-gray-900 accent-red-600"
                />
            </div>
        </div>
     )}
       <div className="flex flex-row items-start gap-4">
            {/* The ref is applied to the main content container that will be captured as an image */}
            <div ref={ref} className="bg-white shadow-lg aspect-square flex flex-col overflow-hidden flex-grow border-2 border-gray-900">
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
                        className="font-anton text-black text-center leading-tight tracking-wide uppercase"
                        style={{ fontSize: `${headlineFontSize}px` }}
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
          <h4 className="text-sm font-bold text-gray-700 mb-2">Image Options:</h4>
          <div className="flex gap-2 flex-wrap bg-white/70 p-2 border-2 border-gray-900">
            {imageUrlOptions.map((url) => (
              <button
                key={url}
                onClick={() => onImageUrlChange(url)}
                className={`rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-red-500 transition-all duration-200 hover:scale-105 border-2 ${
                  newsData.imageUrl === url ? 'border-red-500' : 'border-transparent'
                }`}
                aria-label="Select this image"
              >
                <img
                  src={url}
                  alt="Alternative news visual"
                  className="w-24 h-16 object-cover cursor-pointer"
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
        <h4 className="text-lg font-bold text-gray-900 mb-2">AI Generated Summary:</h4>
        <div className="bg-white p-4 border-2 border-gray-900 min-h-[100px]">
          {summary ? (
             <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          ) : (
            <p className="text-gray-500">No summary generated yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-black/20">
        <button
          onClick={onPostNow}
          disabled={!canApprove}
          className={`w-full flex justify-center items-center py-3 px-4 border-2 border-gray-900 rounded-none text-sm font-bold transition-all duration-200 ${
            isApproved
              ? 'bg-green-500 text-white cursor-default'
              : 'text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none'
          }`}
        >
          {isPublishing ? (
            <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-3" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
          )}
          {isApproved ? 'Sent!' : 'Post Now'}
        </button>
        <button
          onClick={onQueue}
          disabled={!canApprove}
          className={`w-full flex justify-center items-center py-3 px-4 border-2 border-gray-900 rounded-none text-sm font-bold transition-all duration-200 ${
            isApproved
              ? 'bg-green-500 text-white cursor-default'
              : 'text-white bg-red-600 hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none'
          }`}
        >
          {isPublishing ? (
            <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-3" />
          ) : (
            <ClockIcon className="h-5 w-5 mr-2" />
          )}
          {isApproved ? 'Sent!' : 'Queue'}
        </button>
      </div>
      <p className="text-xs text-center text-gray-800 mt-2">
        Queued posts are published twice daily at <strong>3 PM</strong> and <strong>7 PM</strong>.
      </p>
    </div>
  );
};

export default React.forwardRef(Preview);