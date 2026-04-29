"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [metaData, setMetaData] = useState<any>(null);
  const [llmResponse, setLlmResponse] = useState('');
  const [llmStats, setLlmStats] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setExtractedText('');
    setMetaData(null);
    setLlmResponse('');
    setLlmStats(null);

    try {
      // Prepend https:// if not present
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = `https://${url}`;
      }

      // Make request to our API endpoint to fetch and process the URL
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fullUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Store the extracted text and metadata for debug display
      setExtractedText(data.text);
      setMetaData(data.metaData);
      setLlmResponse(data.llmResponse);
      
      // Extract stats from the LLM response if available
      if (data.llmResponse) {
        // Parse the response to extract stats
        const stats = {
          model: data.model || 'zai-org/glm-4.7-flash',
          responseTime: data.response_time || 'N/A',
          promptTokens: data.usage?.prompt_tokens || 'N/A',
          reasoningTokens: data.usage?.completion_tokens || 'N/A'
        };
        setLlmStats(stats);
      }

      // Use the classification result from Novita API
      // Move this to a useEffect to avoid rendering issues
      setTimeout(() => {
        setResult(data.classificationResult);
      }, 0);
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
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

        {/* Debug section - hidden by default, shown when chevron is clicked */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${showDebug ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              <span className="ml-2 text-sm font-medium">Show debug information</span>
            </button>
            
            {showDebug && (
              <div className="mt-4 space-y-6 border-t border-gray-200 pt-6">
                {/* LLM Stats Table */}
                {llmStats && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">LLM Statistics</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">Model</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{llmStats.model}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">Response Time</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{llmStats.responseTime}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">Prompt Tokens</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{llmStats.promptTokens}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">Completion Tokens</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{llmStats.reasoningTokens}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Prompt sent to LLM:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">{extractedText}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">LLM Response:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto">
                    <ReactMarkdown className="text-sm text-gray-800">
                      {llmResponse}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {metaData && Object.keys(metaData).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Meta Data Extracted:</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="text-sm text-gray-800">
                        {JSON.stringify(metaData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
