"use client";

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Prepend https:// if not present
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = `https://${url}`;
      }

      // Simulate downloading the webpage content
      // In a real implementation, this would involve:
      // 1. Making a server-side request to fetch the URL content
      // 2. Extracting the text content from the HTML
      // 3. Sending that content to the Novita API
      
      // For demo purposes, we'll simulate the downloaded content
      const mockContent = `
        <html>
        <head><title>Sample Page</title></head>
        <body>
          <h1>Welcome to our Technology Blog</h1>
          <p>This page discusses artificial intelligence, machine learning, and software development.</p>
          <p>We cover topics like neural networks, deep learning algorithms, and programming frameworks.</p>
          <p>Our articles are written by experts in the field of computer science and technology.</p>
        </body>
        </html>
      `;

      // In a real implementation, you would send mockContent to Novita API
      // For now, we'll simulate the API response
      const mockResponse = {
        classification: "Technology",
        confidence: 95,
        factors: [
          "Contains technical terms like AI and machine learning",
          "Has programming-related content",
          "Mentions software development frameworks"
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult(mockResponse);
    } catch (err) {
      setError('Failed to analyze the page. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3">
            Web Page Classifier
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter a URL below to analyze and classify its content using AI
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com or https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-600"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm py-2">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Classify Page'
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Classification Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Classification</h3>
                  <p className="text-lg font-bold text-gray-900">{result.classification}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Confidence</h3>
                  <p className="text-lg font-bold text-gray-900">{result.confidence}%</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wide mb-1">Factors</h3>
                  <p className="text-lg font-bold text-gray-900">{result.factors.length}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Factors</h3>
                <ul className="space-y-2">
                  {result.factors.map((factor: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-4 w-4 text-blue-500 mt-0.5">•</span>
                      <p className="ml-2 text-gray-700 text-sm">{factor}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Analysis performed on: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
