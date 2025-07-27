import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { NewsData, WebhookPayload, FoundArticle, ProcessedArticle, GroundingChunk } from './types';
import { findHotNews, processNewsUrl, generateSummary, generateAIImage, searchForImagesByQuery } from './services/geminiService';
import { sendToWebhook } from './services/webhookService';
import { uploadImage } from './services/cloudinaryService';
import InputForm from './components/InputForm';
import Preview from './components/Preview';
import WebhookDisplay from './components/WebhookDisplay';
import NewsFinderModal from './components/NewsFinderModal';
import AIPromptModal from './components/AIPromptModal';
import ImageFinderModal from './components/ImageFinderModal';
import Instructions from './components/Instructions';
import { CheckCircleIcon, ExclamationTriangleIcon, LoadingSpinnerIcon, FacebookIcon, EyeIcon, EyeSlashIcon } from './components/icons';
import { DEFAULT_AUTH_TOKEN, DEFAULT_QUEUE_WEBHOOK_URL, DEFAULT_POST_NOW_WEBHOOK_URL, DEFAULT_GEMINI_API_KEY } from './constants';

// --- Inlined Login Component ---
interface LoginProps {
  onLoginSuccess: () => void;
}

const VALID_PASSWORDS = ['Dhakadispatch11@', 'Dhakadispatch@@11'];

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (VALID_PASSWORDS.includes(password)) {
      onLoginSuccess();
    } else {
      setPassword('');
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#87ceeb] p-8 border-2 border-gray-900 shadow-neo-lg">
        <img
          src="https://res.cloudinary.com/dy80ftu9k/image/upload/v1753507647/scs_cqidjz.png"
          alt="Dhaka Dispatch Logo"
          className="h-20 w-auto mx-auto mb-6"
        />
        <h1 className="text-2xl font-anton uppercase text-gray-900 text-center mb-2">
          Editorial Board Access
        </h1>
        <p className="text-center text-gray-800 mb-8">
          Please enter the password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-gray-900 rounded-none shadow-sm py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition pr-12"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-900"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center font-bold">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-900 rounded-none text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Configuration State
  const [queueWebhookUrl, setQueueWebhookUrl] = useState(() => localStorage.getItem('queueWebhookUrl') || DEFAULT_QUEUE_WEBHOOK_URL);
  const [postNowWebhookUrl, setPostNowWebhookUrl] = useState(() => localStorage.getItem('postNowWebhookUrl') || DEFAULT_POST_NOW_WEBHOOK_URL);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || DEFAULT_AUTH_TOKEN);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('geminiApiKey') || DEFAULT_GEMINI_API_KEY);
  
  // Content State (for controlled form)
  const [headline, setHeadline] = useState('');
  const [headlineFontSize, setHeadlineFontSize] = useState<number>(48);
  const [imageUrl, setImageUrl] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [summary, setSummary] = useState<string | null>(null);

  // UI/Workflow State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-Content-Finder State
  const [isNewsFinderOpen, setIsNewsFinderOpen] = useState(false);
  const [isFindingNews, setIsFindingNews] = useState(false);
  const [isProcessingNews, setIsProcessingNews] = useState(false);
  const [foundArticles, setFoundArticles] = useState<FoundArticle[]>([]);
  const [foundSources, setFoundSources] = useState<GroundingChunk[]>([]);

  // Image Editing State
  const [imageUrlOptions, setImageUrlOptions] = useState<string[]>([]);
  const [isImageFinderOpen, setIsImageFinderOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAIPromptModalOpen, setIsAIPromptModalOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');


  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for an active session on component mount.
    // sessionStorage is used so that the login is forgotten when the tab is closed.
    const sessionActive = sessionStorage.getItem('dd-auth-session');
    if (sessionActive === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('queueWebhookUrl', queueWebhookUrl);
  }, [queueWebhookUrl]);

  useEffect(() => {
    localStorage.setItem('postNowWebhookUrl', postNowWebhookUrl);
  }, [postNowWebhookUrl]);

  useEffect(() => {
    localStorage.setItem('authToken', authToken);
  }, [authToken]);
  
  useEffect(() => {
    localStorage.setItem('geminiApiKey', geminiApiKey);
  }, [geminiApiKey]);

  const clearResults = () => {
    setSummary(null);
    setIsApproved(false);
    setError(null);
    setImageUrlOptions([]);
  }

  // --- Login Handler ---
  const handleLoginSuccess = () => {
    sessionStorage.setItem('dd-auth-session', 'true');
    setIsAuthenticated(true);
  };

  // --- Manual Content Generation ---
  const handleGenerate = useCallback(async () => {
    if (!newsUrl) {
      setError("News Article URL is required to generate content.");
      return;
    }
    setIsLoading(true);
    clearResults();

    // If headline and imageUrl are also provided, just generate the summary (classic manual mode)
    if (headline && imageUrl) {
        try {
            const generatedSummary = await generateSummary(geminiApiKey, newsUrl, headline);
            setSummary(generatedSummary);
            setImageUrlOptions([imageUrl]); // Set the manual URL as the only option
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while generating the summary.';
            setError(`Failed to generate summary. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    } else {
        // Otherwise, process the URL to get everything (new streamlined manual mode)
        try {
            const processedData = await processNewsUrl(geminiApiKey, newsUrl);
            setHeadline(processedData.headline);
            const firstImage = processedData.imageUrls[0] || '';
            setImageUrl(firstImage);
            setImageUrlOptions(processedData.imageUrls);
            setSummary(processedData.summary);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while processing the URL.';
            setError(`Failed to process article URL. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }
  }, [headline, imageUrl, newsUrl, geminiApiKey]);

  // --- Auto Content Finder ---
  const handleFindNewsClick = async (
    params: { query?: string; region?: 'Bangladesh' | 'International', timeFilter?: string },
    loadMore = false
  ) => {
    if (!loadMore) {
        setIsNewsFinderOpen(true);
        setFoundArticles([]);
        setFoundSources([]);
    }
    setIsFindingNews(true);
    setError(null);
    
    try {
        const existingTitles = foundArticles.map(a => a.title);
        const { articles, groundingMetadata } = await findHotNews(geminiApiKey, { ...params, existingTitles });
        setFoundArticles(prev => loadMore ? [...prev, ...articles] : articles);
        setFoundSources(prev => loadMore ? [...prev, ...groundingMetadata] : groundingMetadata);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to find news. ${errorMessage}`);
        if (!loadMore) {
           setIsNewsFinderOpen(false);
        }
    } finally {
        setIsFindingNews(false);
    }
  }

  const handleSelectArticle = async (article: FoundArticle) => {
    const PLACEHOLDER_IMAGE_URL = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1740&auto=format&fit=crop';

    setIsNewsFinderOpen(false);
    setIsProcessingNews(true);
    setError(null);
    clearResults();

    // Set text content immediately
    setHeadline(article.title);
    setSummary(article.summary);
    setNewsUrl(''); // AI-generated content has no source URL

    // Set a placeholder image initially so the preview renders, allowing the user to see the text content.
    setImageUrl(PLACEHOLDER_IMAGE_URL);
    setImageUrlOptions([PLACEHOLDER_IMAGE_URL]);

    try {
      // Auto-search for real images using the query from the found topic
      const { imageUrls } = await searchForImagesByQuery(geminiApiKey, article.imageQuery);
      if (imageUrls && imageUrls.length > 0) {
        // Preload the first image for a smoother transition before updating the state
        const firstImage = imageUrls[0];
        const img = new Image();
        img.crossOrigin = 'anonymous'; // CRITICAL: Ensures cached image can be used by the <img crossOrigin> tag
        img.src = firstImage;
        img.onload = () => {
          // Once the image is loaded into the browser cache, update the UI
          setImageUrl(firstImage);
          setImageUrlOptions(imageUrls);
          setError(null); // Clear any previous error messages if search succeeds
        };
        img.onerror = () => {
          // If the primary image fails to load, keep the placeholder and show a non-blocking message
           setError("AI couldn't find any images for this topic. A placeholder has been set. You can find an image manually or generate one.");
        };
      } else {
        // If no images are found, keep the placeholder and show a non-blocking message
        setError("AI couldn't find any images for this topic. A placeholder has been set. You can find an image manually or generate one.");
      }
    } catch (err) {
      // If the search itself fails, keep the placeholder and show an error
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to find images for the article. A placeholder has been set. ${errorMessage}`);
    } finally {
      setIsProcessingNews(false);
    }
  }


  // --- Image Editing ---
  const handleOpenImageFinder = () => {
    if (!headline) {
      setError("Cannot find an image without a headline for context.");
      return;
    }
    setError(null);
    setIsImageFinderOpen(true);
  };

  const handleSelectImageFromFinder = (url: string) => {
    setImageUrl(url);
    // Add the selected image to the top of the options list, ensuring no duplicates.
    setImageUrlOptions(prev => [url, ...prev.filter(u => u !== url)]);
    setIsImageFinderOpen(false);
  };


  const handleGenerateAIImage = useCallback(() => {
    if (!headline) {
      setError("Cannot generate an image without a headline for context.");
      return;
    }
    // Use the headline directly as a concise, user-editable prompt.
    // The service is responsible for adding technical formatting details.
    const initialPrompt = headline;
    setAIPrompt(initialPrompt);
    setIsAIPromptModalOpen(true);
  }, [headline]);

  const handleConfirmGenerateAIImage = useCallback(async (prompt: string) => {
    setIsGeneratingImage(true);
    setError(null);
    try {
        const generatedImageUrl = await generateAIImage(geminiApiKey, prompt);
        setImageUrl(generatedImageUrl);
        // Add the new AI image to the list of options, making it the selected one
        setImageUrlOptions(prev => [generatedImageUrl, ...prev.filter(url => !url.startsWith('data:'))]);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate AI image. ${errorMessage}`);
    } finally {
        setIsGeneratingImage(false);
        setIsAIPromptModalOpen(false);
    }
  }, [geminiApiKey]);


  // --- Publishing ---
  const handleApprovalProcess = useCallback(async (payload: Omit<WebhookPayload, 'imageUrl'>, targetWebhookUrl: string) => {
    if (!previewRef.current) {
        setError('Preview element is not available to capture.');
        return;
    }
    
    setIsSending(true);
    setError(null);

    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff', // Ensure white background is captured
      });

      const cloudinaryUrl = await uploadImage(dataUrl);

      const finalPayload: WebhookPayload = {
        ...payload,
        imageUrl: cloudinaryUrl,
      };

      await sendToWebhook(finalPayload, targetWebhookUrl, authToken);

      setIsApproved(true);
      setTimeout(() => setIsApproved(false), 10000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process and send data. ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  }, [authToken]);

  const handleQueue = useCallback(async () => {
    if (!headline || !summary) {
      setError('Cannot queue without a headline and summary.');
      return;
    }

    const payload: Omit<WebhookPayload, 'imageUrl'> = {
      headline,
      summary,
      newsLink: newsUrl,
      status: 'Queue',
    };
    
    handleApprovalProcess(payload, queueWebhookUrl);

  }, [headline, summary, newsUrl, queueWebhookUrl, authToken, handleApprovalProcess]);

  const handlePostNow = useCallback(async () => {
    if (!headline || !summary) {
      setError('Cannot post without a headline and summary.');
      return;
    }

    const payload: Omit<WebhookPayload, 'imageUrl'> = {
        headline,
        summary,
        newsLink: newsUrl,
        status: 'Post',
    };
    
    handleApprovalProcess(payload, postNowWebhookUrl);

  }, [headline, summary, newsUrl, postNowWebhookUrl, authToken, handleApprovalProcess]);

  const newsDataForPreview: NewsData | null = (headline && imageUrl) ? { headline, imageUrl, newsUrl } : null;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <NewsFinderModal 
        isOpen={isNewsFinderOpen} 
        onClose={() => setIsNewsFinderOpen(false)}
        articles={foundArticles}
        sources={foundSources}
        onSelectArticle={handleSelectArticle}
        onFindNews={handleFindNewsClick}
        isLoading={isFindingNews}
      />
      <AIPromptModal 
        isOpen={isAIPromptModalOpen}
        onClose={() => setIsAIPromptModalOpen(false)}
        initialPrompt={aiPrompt}
        onSubmit={handleConfirmGenerateAIImage}
        isGenerating={isGeneratingImage}
      />
      <ImageFinderModal
        isOpen={isImageFinderOpen}
        onClose={() => setIsImageFinderOpen(false)}
        headline={headline}
        onSelect={handleSelectImageFromFinder}
        geminiApiKey={geminiApiKey}
      />
      {isProcessingNews && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center z-[100]">
          <LoadingSpinnerIcon className="animate-spin h-10 w-10 text-red-500 mb-4" />
          <p className="text-xl text-white">AI is preparing content...</p>
          <p className="text-gray-300">Generating headline, summary, and finding image options.</p>
        </div>
      )}
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center relative">
             <a 
              href="https://www.facebook.com/dispatchdhaka/" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Dhaka Dispatch on Facebook"
              className="absolute top-0 right-0 text-gray-900 hover:text-white transition-colors"
            >
              <FacebookIcon className="h-8 w-8" />
            </a>
            <img 
              src="https://res.cloudinary.com/dy80ftu9k/image/upload/v1753507647/scs_cqidjz.png" 
              alt="Dhaka Dispatch Logo" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-4xl sm:text-5xl font-anton uppercase text-gray-900">
              Dhaka Dispatch Editorial Board
            </h1>
            <p className="mt-2 text-lg text-gray-800">
              Generate, schedule, and publish news snippets directly to socials.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="bg-[#a388ee] p-6 border-2 border-gray-900 shadow-neo-lg lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 text-black">1. Configuration & Input</h2>
              
              <WebhookDisplay
                queueWebhookUrl={queueWebhookUrl}
                onQueueWebhookUrlChange={setQueueWebhookUrl}
                postNowWebhookUrl={postNowWebhookUrl}
                onPostNowWebhookUrlChange={setPostNowWebhookUrl}
                authToken={authToken}
                onAuthTokenChange={setAuthToken}
                geminiApiKey={geminiApiKey}
                onGeminiApiKeyChange={setGeminiApiKey}
              />

              <Instructions />
              
              <InputForm
                headline={headline}
                onHeadlineChange={setHeadline}
                imageUrl={imageUrl}
                onImageUrlChange={setImageUrl}
                newsUrl={newsUrl}
                onNewsUrlChange={setNewsUrl}
                onSubmit={handleGenerate}
                onAutoFindClick={() => handleFindNewsClick({ region: 'Bangladesh', timeFilter: '10d'})}
                isLoading={isLoading}
              />
            </div>

            <div className="bg-[#f4d738] p-6 border-2 border-gray-900 shadow-neo-lg lg:col-span-3">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-900 pb-2 text-black">2. Preview & Publish</h2>
              {error && (
                <div className="flex items-start bg-red-100 text-red-700 p-4 mb-4 border-2 border-red-700">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5"/>
                    <span className="font-semibold">{error}</span>
                </div>
              )}
              {isApproved && (
                  <div className="flex items-center bg-green-100 text-green-700 p-4 mb-4 border-2 border-green-700">
                      <CheckCircleIcon className="h-6 w-6 mr-3" />
                      <span className="font-semibold">Content sent successfully! Buttons will be re-enabled shortly.</span>
                  </div>
              )}
              <Preview
                ref={previewRef}
                newsData={newsDataForPreview}
                summary={summary}
                onSummaryChange={setSummary}
                onQueue={handleQueue}
                onPostNow={handlePostNow}
                isLoading={isLoading}
                isSending={isSending}
                isApproved={isApproved}
                onFindAlternativeImage={handleOpenImageFinder}
                onGenerateAIImage={handleGenerateAIImage}
                isGeneratingImage={isGeneratingImage}
                headline={headline}
                onHeadlineChange={setHeadline}
                headlineFontSize={headlineFontSize}
                onHeadlineFontSizeChange={setHeadlineFontSize}
                imageUrlOptions={imageUrlOptions}
                onImageUrlChange={setImageUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
