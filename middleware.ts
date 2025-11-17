import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Bot Detection Middleware
 * Runs at the Edge for ultra-fast bot detection and redirection
 * This middleware intercepts all requests and redirects based on bot detection
 *
 * Uses static configuration from environment variables (single-user setup)
 */

// Static configuration from environment variables
const REAL_URL = process.env.REAL_URL;
const BOT_URL = process.env.BOT_URL;

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
  try {
    // Validate static configuration
    if (!REAL_URL || !BOT_URL) {
      console.error('Missing environment variables: REAL_URL and BOT_URL must be set');

      // Return helpful error page with instructions
      const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proxy Not Configured</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        h1 { color: #333; margin-bottom: 16px; font-size: 28px; }
        .icon { font-size: 48px; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; margin-bottom: 24px; }
        .steps {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .steps h2 {
            color: #667eea;
            font-size: 18px;
            margin-bottom: 16px;
        }
        .steps ol {
            margin-left: 20px;
        }
        .steps li {
            color: #555;
            margin-bottom: 12px;
            line-height: 1.5;
        }
        code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
            font-size: 14px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .warning strong {
            color: #856404;
        }
        a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">⚠️</div>
        <h1>Proxy Service Not Configured</h1>
        <p>The proxy service requires environment variables to be configured before it can work.</p>

        <div class="steps">
            <h2>Setup Instructions:</h2>
            <ol>
                <li>Go to <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a></li>
                <li>Select your project</li>
                <li>Navigate to <strong>Settings → Environment Variables</strong></li>
                <li>Add the following variables:
                    <ul style="margin: 8px 0 0 20px;">
                        <li><code>REAL_URL</code> - Your real website URL (e.g., https://your-site.com)</li>
                        <li><code>BOT_URL</code> - Your decoy website URL (e.g., https://decoy-site.com)</li>
                    </ul>
                </li>
                <li>Set them for <strong>Production</strong>, <strong>Preview</strong>, and <strong>Development</strong></li>
                <li>Trigger a new deployment (or push a commit to redeploy)</li>
            </ol>
        </div>

        <div class="warning">
            <strong>Arabic Instructions (تعليمات بالعربية):</strong><br>
            زيد المتغيرات ديال البيئة في Vercel:<br>
            <code>REAL_URL</code> (الموقع الحقيقي) و <code>BOT_URL</code> (الموقع المزيف للبوتات)<br>
            شوف الملف <code>DEPLOYMENT_AR.md</code> للتفاصيل الكاملة.
        </div>

        <p style="margin-top: 24px; font-size: 14px; color: #999;">
            Need help? Check the <code>README.md</code> or <code>DEPLOYMENT_AR.md</code> files in your repository.
        </p>
    </div>
</body>
</html>
      `;

      return new NextResponse(errorHtml, {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Run bot detection
    const isBot = detectTikTokBot(request);

    // Build redirect URL with preserved path and query parameters
    const targetUrl = isBot ? BOT_URL : REAL_URL;
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
