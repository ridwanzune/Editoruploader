import React, { useState, useEffect, useCallback } from 'react';
import { searchForImagesByQuery } from '../services/geminiService';
import { LoadingSpinnerIcon } from './icons';
import type { GroundingChunk } from '../types';

interface ImageFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  headline: string;
  onSelect: (url: string) => void;
  geminiApiKey: string;
}

const getKeywordsFromHeadline = (headline: string): string => {
  if (!headline) return 'news event';
  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'of', 'for', 'with', 'to', 'is', 'are', 'was', 'were', 'out', 'by', 'at', 'from']);
  const words = headline.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const keywords = words.filter(word => !stopWords.has(word) && word.length > 2);
  // Take up to 3 longest words for a better search query
  const sortedKeywords = keywords.sort((a, b) => b.length - a.length);
  return sortedKeywords.slice(0, 3).join(' ') || 'news event';
};

const ImageFinderModal: React.FC<ImageFinderModalProps> = ({ isOpen, onClose, headline, onSelect, geminiApiKey }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    setSources([]);
    try {
      const { imageUrls, groundingMetadata } = await searchForImagesByQuery(geminiApiKey, searchQuery);
      setResults(imageUrls);
      setSources(groundingMetadata);
      if (imageUrls.length === 0) {
        setError('No images found for this query. Try different keywords.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [geminiApiKey]);

  useEffect(() => {
    if (isOpen) {
      const initialKeywords = getKeywordsFromHeadline(headline);
      setQuery(initialKeywords);
      handleSearch(initialKeywords);
    } else {
      // Reset state when modal is closed
      setResults([]);
      setSources([]);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, headline, handleSearch]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[#87ceeb] rounded-none w-full max-w-5xl max-h-[90vh] flex flex-col border-2 border-gray-900 shadow-neo-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b-2 border-gray-900 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            Find an Image
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors p-1">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b-2 border-gray-900 flex flex-shrink-0 items-center gap-4 bg-white/50">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search for an image..."
            className="w-full bg-white border-2 border-gray-900 rounded-none py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
          />
          <button 
            onClick={() => handleSearch(query)} 
            disabled={isLoading || !query} 
            className="flex-shrink-0 justify-center items-center py-2.5 px-6 border-2 border-gray-900 rounded-none text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <LoadingSpinnerIcon className="animate-spin h-10 w-10 text-red-500" />
              <p className="mt-4 text-lg font-bold">Searching for images...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600 font-bold">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((url, index) => (
                  <button 
                    key={`${url}-${index}`}
                    onClick={() => onSelect(url)} 
                    className="aspect-w-1 aspect-h-1 block bg-gray-200 overflow-hidden group focus:outline-none transition-transform duration-200 hover:scale-105 border-2 border-gray-900 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <img 
                      src={url} 
                      alt={`Search result ${index + 1}`} 
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" 
                      // Hide the button if the image fails to load
                      onError={(e) => { (e.currentTarget.parentElement as HTMLButtonElement).style.display = 'none'; }} 
                    />
                  </button>
                ))}
              </div>
              {results.length > 0 && sources.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-black/20">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Sources used by AI for this image search:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    {sources.map((source, index) => (
                      source.web && <li key={index} className="text-xs text-gray-900/70 truncate">
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 hover:underline">
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

export default ImageFinderModal;