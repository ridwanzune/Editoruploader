import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons';

interface WebhookDisplayProps {
    queueWebhookUrl: string;
    onQueueWebhookUrlChange: (url: string) => void;
    postNowWebhookUrl: string;
    onPostNowWebhookUrlChange: (url: string) => void;
    authToken: string;
    onAuthTokenChange: (token: string) => void;
    geminiApiKey: string;
    onGeminiApiKeyChange: (key: string) => void;
}

const WebhookDisplay: React.FC<WebhookDisplayProps> = ({ 
    queueWebhookUrl, 
    onQueueWebhookUrlChange,
    postNowWebhookUrl,
    onPostNowWebhookUrlChange, 
    authToken, 
    onAuthTokenChange,
    geminiApiKey,
    onGeminiApiKeyChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [showGeminiKey, setShowGeminiKey] = useState(false);

  return (
    <div className="bg-white/50 border-2 border-gray-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-xl font-bold text-gray-900">Webhook &amp; API Settings</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-6 h-6 text-gray-700 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 border-t-2 border-gray-900 space-y-4">
          <p className="text-sm text-gray-900/80">
            To send data, create an automation in a service like <a href="https://make.com" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline">Make.com</a>. Use their "Webhook" trigger and connect it to a "Google Sheets - Add a Row" action.
          </p>
           <div>
            <label htmlFor="geminiApiKey" className="block text-sm font-bold text-gray-900/80 mb-1">
              Google Gemini API Key
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="geminiApiKey"
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => onGeminiApiKeyChange(e.target.value)}
                placeholder="Paste your Google Gemini API Key"
                className="flex-grow bg-white text-gray-800 font-mono text-sm py-2 px-3 border-2 border-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
              />
               <button
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="p-2 border-2 border-gray-900 bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  title={showGeminiKey ? "Hide API Key" : "Show API Key"}
              >
                  {showGeminiKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="postNowWebhookUrl" className="block text-sm font-bold text-gray-900/80 mb-1">
              Post Now Webhook URL
            </label>
            <input
              id="postNowWebhookUrl"
              type="url"
              value={postNowWebhookUrl}
              onChange={(e) => onPostNowWebhookUrlChange(e.target.value)}
              placeholder="Paste 'Post Now' webhook URL"
              className="w-full bg-white text-gray-800 font-mono text-sm py-2 px-3 border-2 border-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            />
          </div>
           <div>
            <label htmlFor="queueWebhookUrl" className="block text-sm font-bold text-gray-900/80 mb-1">
              Queue Webhook URL
            </label>
            <input
              id="queueWebhookUrl"
              type="url"
              value={queueWebhookUrl}
              onChange={(e) => onQueueWebhookUrlChange(e.target.value)}
              placeholder="Paste 'Queue' webhook URL"
              className="w-full bg-white text-gray-800 font-mono text-sm py-2 px-3 border-2 border-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            />
          </div>
          <div>
            <label htmlFor="authToken" className="block text-sm font-bold text-gray-900/80 mb-1">
              Make.com API Key (for all webhooks)
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="authToken"
                type={showToken ? 'text' : 'password'}
                value={authToken}
                onChange={(e) => onAuthTokenChange(e.target.value)}
                placeholder="Paste your webhook's API key"
                className="flex-grow bg-white text-gray-800 font-mono text-sm py-2 px-3 border-2 border-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
              />
              <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-2 border-2 border-gray-900 bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  title={showToken ? "Hide Token" : "Show Token"}
              >
                  {showToken ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookDisplay;