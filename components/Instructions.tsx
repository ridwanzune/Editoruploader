import React from 'react';

const Instructions: React.FC = () => {
    return (
        <div className="space-y-4 pt-4 border-t-2 border-black/20">
            <h3 className="text-xl font-bold text-gray-900">How to Use</h3>
            <div className="space-y-3 text-sm text-gray-900">
                <div>
                    <h4 className="font-bold text-gray-900">1. Get Content (2 Ways):</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1 mt-1 text-gray-900/80">
                        <li><strong className="bg-yellow-400 text-gray-900 px-1 py-0.5 font-bold">Auto-Find:</strong> Click "Auto-Find Content" to get the latest news topics. Select one to automatically populate the headline, summary, and images.</li>
                        <li><strong className="bg-red-600 text-white px-1 py-0.5 font-bold">Manual:</strong> Paste a news article URL and click "Generate Content". The AI will read the article and create the content for you.</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">2. Edit & Refine:</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1 mt-1 text-gray-900/80">
                        <li>Manually edit the headline for maximum impact.</li>
                        <li>Use the "Image Tools" to find a different stock photo, generate a unique AI image, or paste your own image URL.</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">3. Publish:</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1 mt-1 text-gray-900/80">
                        <li><strong className="bg-blue-600 text-white px-1 py-0.5 font-bold">Post Now:</strong> Sends the content to your social media immediately.</li>
                        <li><strong className="bg-red-600 text-white px-1 py-0.5 font-bold">Queue:</strong> Adds the content to the publishing queue. Posts are made daily at 3 PM & 7 PM.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Instructions;