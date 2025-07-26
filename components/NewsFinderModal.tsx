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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900/80 backdrop-blur-md rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/10 shadow-[0_0_25px_rgba(239,68,68,0.3)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">
            AI Content Finder
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full -mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Filter Section */}
        <div className="p-4 border-b border-white/10 flex-shrink-0 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for a topic..."
                    className="w-full bg-black/20 border border-white/10 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <div className="flex-shrink-0 flex items-center bg-black/20 rounded-md p-0.5">
                     <button onClick={() => setRegion('Bangladesh')} className={`px-3 py-1 text-sm rounded-md transition-colors ${region === 'Bangladesh' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Bangladesh</button>
                     <button onClick={() => setRegion('International')} className={`px-3 py-1 text-sm rounded-md transition-colors ${region === 'International' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>International</button>
                </div>
                 <button onClick={() => handleSearch()} disabled={isLoading} className="w-full sm:w-auto flex-shrink-0 justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 transition-all duration-200 hover:-translate-y-0.5">
                    {isLoading && articles.length === 0 ? 'Searching...' : 'Search'}
                </button>
            </div>
            <div className="flex items-center space-x-2 pt-2">
                <span className="text-sm text-gray-400">Time:</span>
                <div className="flex items-center bg-black/20 rounded-md p-0.5">
                    {timeFilterOptions.map(opt => (
                         <button key={opt.value} onClick={() => setTimeFilter(opt.value)} className={`px-3 py-1 text-sm rounded-md transition-colors ${timeFilter === opt.value ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{opt.label}</button>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading && articles.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-center">
              <LoadingSpinnerIcon className="animate-spin h-8 w-8 text-red-400" />
              <span className="ml-4 text-lg mt-4">Finding exciting news topics...</span>
              <span className="text-gray-400 text-sm">The AI is scanning the web, please wait.</span>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {articles.length > 0 ? (
                    articles.map((article, index) => (
                      <li key={`${article.title}-${index}`}>
                        <button 
                          onClick={() => onSelectArticle(article)}
                          className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-600/50 hover:-translate-y-0.5"
                        >
                          <p className="text-white mt-1 text-base font-semibold">{article.title}</p>
                          <p className="text-sm text-gray-400 mt-2">{article.summary}</p>
                        </button>
                      </li>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <p>No articles found. Try a different search term or change the time filter.</p>
                    </div>
                )}
              </ul>
              
              {articles.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <button onClick={() => handleSearch(true)} disabled={isLoading} className="flex justify-center items-center py-2 px-6 border border-white/20 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:bg-gray-500 transition-all duration-200 hover:-translate-y-0.5">
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
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Sources used by AI:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    {sources.map((source, index) => (
                      source.web && <li key={index} className="text-xs text-gray-400 truncate">
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-red-400 hover:underline">
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