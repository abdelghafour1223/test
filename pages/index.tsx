import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Vercel Bot Proxy - Intelligent Bot Detection</title>
        <meta name="description" content="Serverless bot detection and redirection for your website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12 md:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="text-6xl mb-6">🛡️</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Vercel Bot Proxy
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Intelligent serverless proxy to protect your website from bot traffic while maintaining a seamless user experience
            </p>
            <Link
              href="/admin"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-lg shadow-lg"
            >
              Get Started →
            </Link>
          </div>

          {/* Features Grid */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 animate-slide-up">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ultra-Fast Detection
              </h3>
              <p className="text-gray-600">
                Powered by Vercel Edge Functions. Bot detection happens in &lt;50ms at 100+ global edge locations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Targeting
              </h3>
              <p className="text-gray-600">
                Specifically detects TikTok bots and automated crawlers while ensuring zero impact on legitimate users.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Stealth Mode
              </h3>
              <p className="text-gray-600">
                Bots are silently redirected to decoy sites. No blocking errors, no detection alerts - completely invisible.
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              How It Works
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Configure Your URLs</h4>
                  <p className="text-gray-600">
                    Enter your real website URL (for legitimate users) and a decoy URL (for bots).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Get Your Proxy URL</h4>
                  <p className="text-gray-600">
                    Receive a unique, secure proxy URL to share instead of your real website.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Automatic Bot Detection</h4>
                  <p className="text-gray-600">
                    Our Edge middleware analyzes every request, detecting TikTok bots and automated tools.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Smart Redirection</h4>
                  <p className="text-gray-600">
                    Bots go to your decoy site, real users go to your actual website - seamlessly and silently.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Highlights */}
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Technical Highlights
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <h4 className="font-semibold mb-1">Vercel Edge Runtime</h4>
                  <p className="text-gray-300 text-sm">Global distribution for minimal latency</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <h4 className="font-semibold mb-1">Vercel KV Storage</h4>
                  <p className="text-gray-300 text-sm">Redis-compatible, edge-cached configuration</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <h4 className="font-semibold mb-1">Advanced Pattern Matching</h4>
                  <p className="text-gray-300 text-sm">User-Agent, Referer, and header analysis</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <h4 className="font-semibold mb-1">Mobile-First Design</h4>
                  <p className="text-gray-300 text-sm">Optimized for all devices and screen sizes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <h4 className="font-semibold mb-1">TypeScript & Next.js</h4>
                  <p className="text-gray-300 text-sm">Type-safe, modern web framework</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <h4 className="font-semibold mb-1">Zero Configuration</h4>
                  <p className="text-gray-300 text-sm">Deploy to Vercel in seconds</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Link
              href="/admin"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-lg shadow-lg"
            >
              Create Your First Proxy →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
