import { useState } from 'react';
import Head from 'next/head';

interface ProxyResponse {
  success: boolean;
  proxyId: string;
  proxyUrl: string;
  config: {
    realUrl: string;
    botUrl: string;
    createdAt: number;
  };
}

export default function AdminDashboard() {
  const [realUrl, setRealUrl] = useState('');
  const [botUrl, setBotUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProxyUrl('');
    setLoading(true);

    try {
      // Validate URLs
      if (!realUrl || !botUrl) {
        throw new Error('Both URLs are required');
      }

      // Basic URL validation
      try {
        new URL(realUrl);
        new URL(botUrl);
      } catch {
        throw new Error('Please enter valid URLs (including http:// or https://)');
      }

      // Call API to create proxy configuration
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          realUrl: realUrl.trim(),
          botUrl: botUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create proxy');
      }

      // Success! Display the generated proxy URL
      setProxyUrl(data.proxyUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(proxyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetForm = () => {
    setRealUrl('');
    setBotUrl('');
    setProxyUrl('');
    setError('');
  };

  return (
    <>
      <Head>
        <title>Bot Proxy - Admin Dashboard</title>
        <meta name="description" content="Configure intelligent bot detection and redirection" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              🛡️ Bot Proxy
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Intelligent serverless proxy to protect your website from bot traffic
            </p>
          </div>

          {/* Main Card */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up">

              {!proxyUrl ? (
                /* Configuration Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                      Create New Proxy
                    </h2>
                  </div>

                  {/* Real Website URL */}
                  <div>
                    <label htmlFor="realUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Real Website URL
                      <span className="text-gray-500 font-normal ml-2">(where legitimate users go)</span>
                    </label>
                    <input
                      id="realUrl"
                      type="url"
                      value={realUrl}
                      onChange={(e) => setRealUrl(e.target.value)}
                      placeholder="https://your-main-site.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Bot Redirect URL */}
                  <div>
                    <label htmlFor="botUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Bot Redirect URL
                      <span className="text-gray-500 font-normal ml-2">(decoy site for bots)</span>
                    </label>
                    <input
                      id="botUrl"
                      type="url"
                      value={botUrl}
                      onChange={(e) => setBotUrl(e.target.value)}
                      placeholder="https://decoy-site.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>TikTok bots are redirected to the Bot URL</li>
                          <li>Legitimate users go to the Real URL</li>
                          <li>Detection is silent and seamless</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Proxy...
                      </span>
                    ) : (
                      'Generate Proxy URL'
                    )}
                  </button>
                </form>
              ) : (
                /* Success Screen */
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Proxy Created Successfully!
                    </h2>
                    <p className="text-gray-600">
                      Use this URL to protect your website from bots
                    </p>
                  </div>

                  {/* Generated Proxy URL */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Proxy URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={proxyUrl}
                        readOnly
                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm md:text-base select-all"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-green-600 text-sm mt-2 animate-fade-in">
                        Copied to clipboard!
                      </p>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>Share this proxy URL instead of your real website URL</li>
                      <li>TikTok bots will be redirected to: <code className="bg-blue-100 px-1 rounded text-xs">{botUrl}</code></li>
                      <li>Legitimate users will see: <code className="bg-blue-100 px-1 rounded text-xs">{realUrl}</code></li>
                    </ol>
                  </div>

                  {/* Create Another Button */}
                  <button
                    onClick={resetForm}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Create Another Proxy
                  </button>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>Powered by Vercel Edge Functions • Ultra-fast bot detection</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
