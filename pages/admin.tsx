import { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

interface AdminProps {
  realUrl: string;
  botUrl: string;
  deploymentUrl: string;
}

export default function AdminDashboard({ realUrl, botUrl, deploymentUrl }: AdminProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deploymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Bot Proxy - Configuration</title>
        <meta name="description" content="View your static bot proxy configuration" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              🛡️ Bot Proxy Configuration
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Static configuration - Single user setup
            </p>
          </div>

          {/* Configuration Display */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up space-y-6">

              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Active Configuration</span>
                </div>
              </div>

              {/* Proxy URL */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Proxy URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deploymentUrl}
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

              {/* Configuration Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Configuration Details
                </h3>

                {/* Real URL */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Real Website URL (Legitimate Users)
                  </label>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <code className="text-gray-800 break-all">{realUrl}</code>
                  </div>
                </div>

                {/* Bot URL */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Bot Redirect URL (Decoy Site)
                  </label>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <code className="text-gray-800 break-all">{botUrl}</code>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Share your proxy URL instead of your real website</li>
                      <li>TikTok bots are automatically redirected to the decoy site</li>
                      <li>Legitimate users go to your real website</li>
                      <li>Detection is silent and seamless</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Configuration Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Static Configuration:</p>
                    <p className="text-yellow-700">
                      This is a static configuration. To change the URLs, update the <code className="bg-yellow-100 px-1 rounded">REAL_URL</code> and <code className="bg-yellow-100 px-1 rounded">BOT_URL</code> environment variables in your deployment settings and redeploy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>Powered by Vercel Edge Functions • Ultra-fast bot detection</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AdminProps> = async (context) => {
  const realUrl = process.env.REAL_URL || 'Not configured';
  const botUrl = process.env.BOT_URL || 'Not configured';

  // Determine deployment URL
  const host = context.req.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const vercelUrl = process.env.VERCEL_URL;
  const deploymentUrl = vercelUrl ? `https://${vercelUrl}` : `${protocol}://${host}`;

  return {
    props: {
      realUrl,
      botUrl,
      deploymentUrl,
    },
  };
};
