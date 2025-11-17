import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * TikTok Bot Detection and Redirection Middleware
 *
 * PURPOSE:
 * - Redirects TikTok bots (Bytespider, TikTokSpider) to fake URL with 301 Permanent Redirect
 * - Allows legitimate human users (including TikTok WebView) to access real URL
 *
 * IMPORTANT:
 * - TikTok WebView (trill, musical_ly, BytedanceWebview, JsSdk) = HUMAN TRAFFIC (not blocked)
 * - Only Bytespider and TikTokSpider User-Agents are redirected to fake URL
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
 * Implements 301 Permanent Redirect for TikTok bots, allows normal access for humans
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
      console.log('[TikTok Bot Detection]', {
        isBot: isTikTokBot,
        targetUrl: isTikTokBot ? 'FAKE URL (bot)' : 'REAL URL (human)',
        userAgent: userAgent.substring(0, 100),
        path: request.nextUrl.pathname,
      });
    }

    // REDIRECT: Issue HTTP 301 Permanent Redirect
    // This tells bots to update their index with the fake URL
    return NextResponse.redirect(targetUrl, {
      status: 301, // 301 Permanent Redirect
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Bot-Detection': isTikTokBot ? 'bot' : 'human',
      },
    });

  } catch (error) {
    console.error('Middleware error:', error);

    // Fail gracefully - redirect to real URL on error
    return NextResponse.redirect(REAL_URL, {
      status: 302,
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
