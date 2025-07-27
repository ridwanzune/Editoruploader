import React, { useState } from 'react';
import type { FoundArticle, GroundingChunk } from '../types';
import { LoadingSpinnerIcon } from './icons';

interface NewsFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: FoundArticle[];
  sources: GroundingChunk[];
  onSelectArticle: (article: FoundArticle) => void;
  onFindNews: (params: { query?: string; region?: 'Bangladesh' | 'International', timeFilter?: string }, loadMore?: boolean) => void;
  isLoading: boolean;
}

const formatDateAgo = (dateString?: string): string | null => {
  if (!dateString) return null;

  // Handles YYYY-MM-DD format by ensuring it's parsed as UTC
  const date = new Date(`${dateString}T00:00:00Z`);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  
  // Compare dates only, ignoring time
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfArticleDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  const diffTime = startOfToday.getTime() - startOfArticleDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Future';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};


const NewsFinderModal: React.FC<NewsFinderModalProps> = ({ isOpen, onClose, articles, sources, onSelectArticle, onFindNews, isLoading }) => {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<'Bangladesh' | 'International'>('Bangladesh');
  const [timeFilter, setTimeFilter] = useState('10d'); // Default: 10 days

  if (!isOpen) return null;

  const handleSearch = (loadMore = false) => {
    onFindNews({ query, region, timeFilter }, loadMore);
  };
  
  const timeFilterOptions = [
      { label: 'Last 10 Days', value: '10d' },
      { label: 'Last 7 Days', value: '7d' },
      { label: '24 Hours', value: '1d' },
      { label: 'Any Time', value: '' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[#ff6b6b] rounded-none w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-gray-900 shadow-neo-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b-2 border-gray-900 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            AI Content Finder
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Filter Section */}
        <div className="p-4 border-b-2 border-gray-900 flex-shrink-0 space-y-3 bg-white/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for a topic..."
                    className="w-full bg-white border-2 border-gray-900 rounded-none py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                />
                <div className="flex-shrink-0 flex items-center border-2 border-gray-900 p-0.5">
                     <button onClick={() => setRegion('Bangladesh')} className={`px-3 py-1.5 text-sm font-bold rounded-none transition-colors ${region === 'Bangladesh' ? 'bg-red-500 text-white' : 'text-gray-800 hover:bg-gray-200'}`}>Bangladesh</button>
                     <button onClick={() => setRegion('International')} className={`px-3 py-1.5 text-sm font-bold rounded-none transition-colors ${region === 'International' ? 'bg-red-500 text-white' : 'text-gray-800 hover:bg-gray-200'}`}>International</button>
                </div>
                 <button onClick={() => handleSearch()} disabled={isLoading} className="w-full sm:w-auto flex-shrink-0 justify-center items-center py-2.5 px-4 border-2 border-gray-900 rounded-none text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 transition-all duration-200 shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-none">
                    {isLoading && articles.length === 0 ? 'Searching...' : 'Search'}
                </button>
            </div>
            <div className="flex items-center space-x-2 pt-2">
                <span className="text-sm font-bold text-gray-900/80">Time:</span>
                <div className="flex items-center border-2 border-gray-900 p-0.5">
                    {timeFilterOptions.map(opt => (
                         <button key={opt.value} onClick={() => setTimeFilter(opt.value)} className={`px-3 py-1 text-sm rounded-none font-bold transition-colors ${timeFilter === opt.value ? 'bg-red-500 text-white' : 'text-gray-800 hover:bg-gray-200'}`}>{opt.label}</button>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading && articles.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-center">
              <LoadingSpinnerIcon className="animate-spin h-8 w-8 text-red-500" />
              <span className="ml-4 text-lg mt-4 font-bold">Finding exciting news topics...</span>
              <span className="text-gray-900/70 text-sm">The AI is scanning the web, please wait.</span>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {articles.length > 0 ? (
                    articles.map((article, index) => {
                      const dateAgo = formatDateAgo(article.publicationDate);
                      return (
                        <li key={`${article.title}-${index}`}>
                          <button 
                            onClick={() => onSelectArticle(article)}
                            className="w-full text-left p-4 bg-white hover:bg-red-100 rounded-none transition-all duration-200 border-2 border-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 hover:shadow-neo-sm"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <p className="text-gray-900 text-base font-bold">{article.title}</p>
                              {dateAgo && (
                                <span className="flex-shrink-0 text-xs font-semibold text-gray-800 bg-yellow-300/80 px-2 py-1 border border-gray-900/50 whitespace-nowrap">
                                  {dateAgo}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900/80 mt-2">{article.summary}</p>
                          </button>
                        </li>
                      );
                    })
                ) : (
                    <div className="text-center text-gray-900/70 py-10">
                        <p className="font-bold">No articles found.</p>
                        <p>Try a different search term or change the time filter.</p>
                    </div>
                )}
              </ul>
              
              {articles.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <button onClick={() => handleSearch(true)} disabled={isLoading} className="flex justify-center items-center py-2 px-6 border-2 border-gray-900 rounded-none shadow-sm text-sm font-bold text-gray-900 bg-white hover:bg-gray-100 disabled:bg-gray-300 transition-all duration-200 shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none">
                        {isLoading ? (
                            <>
                                <LoadingSpinnerIcon className="animate-spin h-5 w-5 mr-2" />
                                Loading...
                            </>
                        ) : 'Load More'}
                    </button>
                </div>
              )}

              {sources && sources.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-black/20">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Sources used by AI:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    {sources.map((source, index) => (
                      source.web && <li key={index} className="text-xs text-gray-900/70 truncate">
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                          {source.web.title || source.web.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFinderModal;
