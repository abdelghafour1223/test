import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './lib/supabase';

/**
 * Bot Detection Middleware
 * Runs at the Edge for ultra-fast bot detection and redirection
 * This middleware intercepts all requests to /p/* paths and redirects based on bot detection
 */

// Configuration interface for proxy settings
interface ProxyConfig {
  realUrl: string;
  botUrl: string;
  createdAt: number;
}

/**
 * Detects if the request is from a TikTok bot
 * @param request - The incoming Next.js request
 * @returns true if bot detected, false otherwise
 */
function detectTikTokBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const referer = request.headers.get('referer')?.toLowerCase() || '';

  // TikTok bot user-agent patterns
  const tikTokBotPatterns = [
    'tiktok',
    'bytespider',
    'bytedance',
    'musically',
    'musical_ly',
    'trill', // TikTok's previous name in some regions
  ];

  // Check if user-agent contains any TikTok bot patterns
  const isTikTokUserAgent = tikTokBotPatterns.some(pattern =>
    userAgent.includes(pattern)
  );

  // Check if request is from TikTok domain
  const isTikTokReferer = referer.includes('tiktok.com') ||
                          referer.includes('musical.ly') ||
                          referer.includes('bytedance.com');

  // Additional bot indicators
  const genericBotIndicators = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests',
    'java/',
    'go-http-client',
    'headlesschrome',
    'phantomjs',
    'selenium',
    'puppeteer',
  ];

  // Check for generic bot patterns (less aggressive)
  const hasGenericBotPattern = genericBotIndicators.some(pattern =>
    userAgent.includes(pattern)
  );

  // Missing common browser headers (headless detection)
  const hasAcceptLanguage = request.headers.has('accept-language');
  const hasAcceptEncoding = request.headers.has('accept-encoding');
  const hasAccept = request.headers.has('accept');

  // Suspicious if missing multiple standard browser headers
  const suspiciousHeaders = !hasAcceptLanguage && !hasAcceptEncoding;

  // Decision logic: Prioritize TikTok-specific detection
  // Then consider generic bot patterns combined with missing headers
  if (isTikTokUserAgent || isTikTokReferer) {
    return true; // Definitely a TikTok bot
  }

  // Generic bot with missing headers is likely automated
  if (hasGenericBotPattern && suspiciousHeaders) {
    return true;
  }

  // Very suspicious: generic bot pattern + no Accept header (strong indicator)
  if (hasGenericBotPattern && !hasAccept) {
    return true;
  }

  return false; // Likely a legitimate user
}

/**
 * Preserves original URL path and query parameters in the redirect
 * @param baseUrl - The base URL to redirect to
 * @param request - The original request
 * @returns Full URL with preserved path and query
 */
function buildRedirectUrl(baseUrl: string, request: NextRequest): string {
  try {
    const url = new URL(baseUrl);

    // Extract any additional path segments after /p/{proxyId}
    // Example: /p/abc123/extra/path -> /extra/path
    const pathParts = request.nextUrl.pathname.split('/');
    const additionalPath = pathParts.slice(3).join('/'); // Skip '', 'p', '{proxyId}'

    if (additionalPath) {
      // Append additional path to the base URL
      url.pathname = url.pathname.replace(/\/$/, '') + '/' + additionalPath;
    }

    // Preserve all query parameters from original request
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  } catch (error) {
    // Fallback to base URL if URL construction fails
    console.error('Error building redirect URL:', error);
    return baseUrl;
  }
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only process requests to proxy URLs (/p/*)
  if (!pathname.startsWith('/p/')) {
    return NextResponse.next();
  }

  try {
    // Extract proxy ID from path: /p/{proxyId}
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length < 2 || pathSegments[0] !== 'p') {
      // Invalid proxy URL format
      return new NextResponse('Invalid proxy URL', { status: 400 });
    }

    const proxyId = pathSegments[1];

    // Fetch configuration from Supabase
    const { data, error } = await supabase
      .from('proxy_configs')
      .select('*')
      .eq('id', proxyId)
      .single();

    if (error || !data) {
      // Configuration not found - proxy doesn't exist
      return new NextResponse('Proxy not found', { status: 404 });
    }

    // Convert database format to ProxyConfig format
    const config: ProxyConfig = {
      realUrl: data.real_url,
      botUrl: data.bot_url,
      createdAt: new Date(data.created_at).getTime(),
    };

    // Validate configuration
    if (!config.realUrl || !config.botUrl) {
      return new NextResponse('Invalid proxy configuration', { status: 500 });
    }

    // Run bot detection
    const isBot = detectTikTokBot(request);

    // Build redirect URL with preserved path and query parameters
    const targetUrl = isBot ? config.botUrl : config.realUrl;
    const redirectUrl = buildRedirectUrl(targetUrl, request);

    // Perform redirect (302 = temporary redirect, appropriate for proxying)
    // Using 302 instead of 301 to avoid browser caching
    return NextResponse.redirect(redirectUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Middleware error:', error);

    // Fail gracefully - return error but don't expose internal details
    return new NextResponse('Proxy service error', {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}

/**
 * Middleware configuration
 * Only run middleware on /p/* paths for efficiency
 */
export const config = {
  matcher: '/p/:path*',
};
