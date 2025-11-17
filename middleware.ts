import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * TikTok Bot Detection and Server-Side Rendering Middleware
 *
 * PURPOSE:
 * - Serves fake content to TikTok bots (Bytespider, TikTokSpider) WITHOUT redirect (SSR)
 * - Serves real content to legitimate human users (including TikTok WebView) WITHOUT redirect (SSR)
 *
 * HOW IT WORKS:
 * - Uses reverse proxy to fetch and render content from target URLs
 * - Original URL stays the same in browser (no redirect visible to user/bot)
 * - Bots see fake content, humans see real content, same URL for both
 *
 * IMPORTANT:
 * - TikTok WebView (trill, musical_ly, BytedanceWebview, JsSdk) = HUMAN TRAFFIC (not blocked)
 * - Only Bytespider and TikTokSpider User-Agents receive fake content
 * - All rendering happens server-side at Vercel Edge
 *
 * Based on: Complete Technical Analysis: TikTok and ByteDance Crawlers (2025)
 */

// Static configuration from environment variables
// Fallback to specific URLs if env vars not set
const REAL_URL = process.env.REAL_URL || 'https://ecoshopin.store/products/propolis-%D8%A7%D9%84%D8%A3%D8%B5%D9%84%D9%8A-%D8%A3%D9%82%D9%88%D9%89-%D9%85%D9%83%D9%85%D9%84-%D8%B7%D8%A8%D9%8A%D8%B9%D9%8A-%D9%83%D9%8A%D8%AD%D9%85%D9%8A-%D9%85%D9%86%D8%A7%D8%B9%D8%AA%D9%83-%D9%88%D9%8A%D8%B9%D8%B7%D9%8A%D9%83-%D9%85%D9%86-%D8%A7%D9%84%D9%82%D9%88%D9%85%D9%86-%D8%A7%D9%84%D8%AF%D8%A7%D8%AE%D9%84-%F0%9F%90%9D%E2%9C%A8';
const BOT_URL = process.env.BOT_URL || 'https://storelhata.com/pages/miroir';

/**
 * TikTok WebView patterns (LEGITIMATE HUMAN TRAFFIC - must NOT be blocked)
 */
const TIKTOK_WEBVIEW_PATTERNS = [
  'trill',
  'musical_ly',
  'BytedanceWebview',
  'JsSdk/1.0',
  'JsSdk/2.0',
];

/**
 * TikTok Bot User-Agent patterns (ONLY these should be redirected)
 */
const TIKTOK_BOT_PATTERNS = [
  'Bytespider',      // AI data scraper
  'TikTokSpider',    // Link preview fetcher
];

/**
 * Detects if request is from TikTok bots (Bytespider or TikTokSpider)
 *
 * CRITICAL LOGIC:
 * 1. If TikTok WebView detected → NOT a bot (legitimate human user)
 * 2. If Bytespider or TikTokSpider detected → IS a bot (redirect to fake URL)
 * 3. All other traffic → NOT a bot (allow access to real URL)
 *
 * @param request - The incoming Next.js request
 * @returns true if TikTok bot detected (Bytespider/TikTokSpider), false otherwise
 */
function detectTikTokBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';

  // STEP 1: Check if this is TikTok WebView (legitimate human user)
  // These users must NEVER be redirected to fake URL
  const isTikTokWebView = TIKTOK_WEBVIEW_PATTERNS.some(pattern =>
    userAgent.includes(pattern)
  );

  if (isTikTokWebView) {
    // This is a real human user browsing via TikTok in-app browser
    // Allow them to access the real URL
    return false;
  }

  // STEP 2: Check if this is an actual TikTok bot (Bytespider or TikTokSpider)
  // Use case-sensitive matching for precision
  const isTikTokBot = TIKTOK_BOT_PATTERNS.some(pattern =>
    userAgent.includes(pattern)
  );

  if (isTikTokBot) {
    // This is a TikTok crawler bot - redirect to fake URL
    return true;
  }

  // STEP 3: All other traffic is allowed to access real URL
  return false;
}


/**
 * Main middleware function
 * Implements Server-Side Rendering (Reverse Proxy) for TikTok bots and regular users
 * - Bots see fake content WITHOUT redirect (URL stays the same)
 * - Users see real content WITHOUT redirect (URL stays the same)
 */
export async function middleware(request: NextRequest) {
  try {
    // Run TikTok bot detection
    const isTikTokBot = detectTikTokBot(request);

    // Select target URL based on bot detection
    const targetUrl = isTikTokBot ? BOT_URL : REAL_URL;

    // Log detection for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      const userAgent = request.headers.get('user-agent') || 'unknown';
      console.log('[TikTok Bot Detection - SSR]', {
        isBot: isTikTokBot,
        targetUrl: isTikTokBot ? 'FAKE URL (bot)' : 'REAL URL (human)',
        userAgent: userAgent.substring(0, 100),
        path: request.nextUrl.pathname,
        method: 'REVERSE_PROXY',
      });
    }

    // REVERSE PROXY: Fetch content from target URL and serve it directly
    // This keeps the original URL in the browser while showing different content
    try {
      const proxyResponse = await fetch(targetUrl, {
        method: request.method,
        headers: {
          // Forward important headers
          'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (compatible; VercelProxy/1.0)',
          'Accept': request.headers.get('accept') || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
          'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
          // Don't forward: host, origin, referer (to avoid CORS and host mismatch issues)
        },
        // Forward body for POST/PUT requests
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
        // Follow redirects automatically
        redirect: 'follow',
      });

      // Get the response body
      const body = await proxyResponse.text();

      // Create response headers
      const responseHeaders = new Headers();

      // Copy relevant headers from the proxied response
      const headersToForward = [
        'content-type',
        'content-language',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
      ];

      headersToForward.forEach(header => {
        const value = proxyResponse.headers.get(header);
        if (value) {
          responseHeaders.set(header, value);
        }
      });

      // Set cache control to prevent caching of proxied content
      responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
      responseHeaders.set('Pragma', 'no-cache');
      responseHeaders.set('Expires', '0');

      // Add custom headers for debugging
      responseHeaders.set('X-Bot-Detection', isTikTokBot ? 'bot' : 'human');
      responseHeaders.set('X-Proxy-Target', isTikTokBot ? 'fake-url' : 'real-url');
      responseHeaders.set('X-Render-Mode', 'server-side');

      // Return the proxied content with original URL preserved
      return new NextResponse(body, {
        status: proxyResponse.status,
        headers: responseHeaders,
      });

    } catch (fetchError) {
      console.error('Reverse proxy fetch error:', fetchError);

      // Fallback: Return error page if proxy fails
      const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Temporarily Unavailable</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            text-align: center;
        }
        h1 { color: #333; margin-bottom: 16px; }
        p { color: #666; line-height: 1.6; }
        .error-code { color: #999; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚠️ Service Temporarily Unavailable</h1>
        <p>We're experiencing technical difficulties. Please try again in a few moments.</p>
        <p class="error-code">Error: Proxy connection failed</p>
    </div>
</body>
</html>
      `;

      return new NextResponse(errorHtml, {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Retry-After': '60',
        },
      });
    }

  } catch (error) {
    console.error('Middleware error:', error);

    // Fail gracefully - return generic error
    return new NextResponse('Service Error', {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}


/**
 * Middleware configuration
 * Run middleware on all paths except static files and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin dashboard)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};
