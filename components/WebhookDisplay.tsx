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
    onGeminiApiKeyChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [showGeminiKey, setShowGeminiKey] = useState(false);

  return (
    <div className="bg-black/20 rounded-lg border border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-xl font-semibold text-gray-200">Webhook &amp; API Settings</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-6 h-6 text-gray-400 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-white/10 space-y-4">
          <p className="text-sm text-gray-400">
            To send data, create an automation in a service like <a href="https://make.com" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Make.com</a>. Use their "Webhook" trigger and connect it to a "Google Sheets - Add a Row" action.
          </p>
          <div>
            <label htmlFor="postNowWebhookUrl" className="block text-sm font-medium text-gray-400 mb-1">
              Post Now Webhook URL
            </label>
            <input
              id="postNowWebhookUrl"
              type="url"
              value={postNowWebhookUrl}
              onChange={(e) => onPostNowWebhookUrlChange(e.target.value)}
              placeholder="Paste 'Post Now' webhook URL"
              className="w-full bg-black/20 text-gray-300 font-mono text-sm rounded-md py-2 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
           <div>
            <label htmlFor="queueWebhookUrl" className="block text-sm font-medium text-gray-400 mb-1">
              Queue Webhook URL
            </label>
            <input
              id="queueWebhookUrl"
              type="url"
              value={queueWebhookUrl}
              onChange={(e) => onQueueWebhookUrlChange(e.target.value)}
              placeholder="Paste 'Queue' webhook URL"
              className="w-full bg-black/20 text-gray-300 font-mono text-sm rounded-md py-2 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
          <div>
            <label htmlFor="authToken" className="block text-sm font-medium text-gray-400 mb-1">
              Make.com API Key (for all webhooks)
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="authToken"
                type={showToken ? 'text' : 'password'}
                value={authToken}
                onChange={(e) => onAuthTokenChange(e.target.value)}
                placeholder="Paste your webhook's API key"
                className="flex-grow bg-black/20 text-gray-300 font-mono text-sm rounded-md py-2 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
              <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 transition"
                  title={showToken ? "Hide Token" : "Show Token"}
              >
                  {showToken ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
           <div>
                <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-400 mb-1">
                    Gemini API Key
                </label>
                <div className="flex items-center space-x-2">
                    <input
                      id="geminiApiKey"
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => onGeminiApiKeyChange(e.target.value)}
                      placeholder="Paste your Gemini API key"
                      className="flex-grow bg-black/20 text-gray-300 font-mono text-sm rounded-md py-2 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    />
                    <button
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 transition"
                        title={showGeminiKey ? "Hide Key" : "Show Key"}
                    >
                        {showGeminiKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default WebhookDisplay;