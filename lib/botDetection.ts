/**
 * Bot Detection Library
 * Centralized bot detection patterns and utilities
 */

export interface BotDetectionResult {
  isBot: boolean;
  reason?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * TikTok bot user-agent patterns
 * IMPORTANT: Only targets actual TikTok crawler bots (Bytespider and TikTokSpider)
 * Does NOT include TikTok WebView patterns (trill, musical_ly, BytedanceWebview)
 * as those represent legitimate human users browsing in TikTok's in-app browser
 *
 * Based on: Complete Technical Analysis: TikTok and ByteDance Crawlers (2025)
 */
export const TIKTOK_BOT_PATTERNS = [
  'Bytespider',      // AI data scraper for LLM training
  'TikTokSpider',    // Link preview fetcher
] as const;

/**
 * ChatGPT and AI bot user-agent patterns
 * These patterns detect crawlers from ChatGPT, Claude, and other AI services
 */
export const CHATGPT_AI_BOT_PATTERNS = [
  'chatgpt-user',
  'gptbot',
  'openai',
  'claude-web',
  'anthropic-ai',
  'anthropic',
  'perplexitybot',
  'perplexity',
  'coherebot',
  'cohere',
  'bingbot', // Microsoft's crawler, sometimes used by ChatGPT plugins
  'google-extended', // Google's AI crawler
  'omgilibot',
  'omgili',
  'facebookexternalhit', // Meta AI crawlers
  'meta-externalagent',
] as const;

/**
 * Generic bot patterns (use cautiously to avoid false positives)
 */
export const GENERIC_BOT_PATTERNS = [
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
  'playwright',
  'scrapy',
  'mechanize',
] as const;

/**
 * TikTok WebView identifiers (LEGITIMATE HUMAN TRAFFIC - DO NOT BLOCK)
 * These patterns indicate real users browsing via TikTok's in-app browser
 */
export const TIKTOK_WEBVIEW_PATTERNS = [
  'trill',              // TikTok WebView identifier
  'musical_ly',         // TikTok WebView identifier
  'BytedanceWebview',   // TikTok WebView identifier
  'JsSdk/1.0',          // TikTok WebView SDK
  'JsSdk/2.0',          // TikTok WebView SDK
] as const;

/**
 * TikTok domains to check in referer (REMOVED - causes false positives)
 * Referer-based detection blocks legitimate users clicking links from TikTok
 */
export const TIKTOK_DOMAINS = [] as const;

/**
 * Checks if user-agent matches TikTok bot patterns
 * Uses case-sensitive matching as official User-Agents use specific capitalization
 */
export function isTikTokBotUserAgent(userAgent: string): boolean {
  // Case-sensitive matching for precise bot detection
  return TIKTOK_BOT_PATTERNS.some(pattern => userAgent.includes(pattern));
}

/**
 * Checks if user-agent is TikTok WebView (legitimate human user)
 * These users should NOT be blocked or redirected to fake content
 */
export function isTikTokWebView(userAgent: string): boolean {
  return TIKTOK_WEBVIEW_PATTERNS.some(pattern => userAgent.includes(pattern));
}

/**
 * Checks if user-agent matches ChatGPT or AI bot patterns
 */
export function isChatGPTBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return CHATGPT_AI_BOT_PATTERNS.some(pattern => ua.includes(pattern));
}

/**
 * Checks if referer is from TikTok domains
 */
export function isTikTokReferer(referer: string): boolean {
  const ref = referer.toLowerCase();
  return TIKTOK_DOMAINS.some(domain => ref.includes(domain));
}

/**
 * Checks if user-agent matches generic bot patterns
 */
export function isGenericBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return GENERIC_BOT_PATTERNS.some(pattern => ua.includes(pattern));
}

/**
 * Analyzes request headers to detect headless browsers
 */
export function detectHeadlessBrowser(headers: {
  get: (name: string) => string | null;
}): boolean {
  const hasAcceptLanguage = !!headers.get('accept-language');
  const hasAcceptEncoding = !!headers.get('accept-encoding');
  const hasAccept = !!headers.get('accept');
  const hasConnection = !!headers.get('connection');

  // Typical browsers send all these headers
  // Missing multiple is suspicious
  const missingCount = [
    hasAcceptLanguage,
    hasAcceptEncoding,
    hasAccept,
    hasConnection,
  ].filter(h => !h).length;

  return missingCount >= 2;
}

/**
 * Advanced bot detection with detailed results
 */
export function detectBot(
  userAgent: string,
  referer: string = '',
  headers?: { get: (name: string) => string | null }
): BotDetectionResult {
  // CRITICAL: Check if this is TikTok WebView (legitimate human user) FIRST
  // WebView users must NOT be treated as bots
  if (isTikTokWebView(userAgent)) {
    return {
      isBot: false,
      reason: 'TikTok WebView - legitimate human user',
      confidence: 'high',
    };
  }

  // High confidence: TikTok bot detection (Bytespider or TikTokSpider ONLY)
  if (isTikTokBotUserAgent(userAgent)) {
    return {
      isBot: true,
      reason: 'TikTok bot user-agent detected (Bytespider or TikTokSpider)',
      confidence: 'high',
    };
  }

  // Referer-based detection REMOVED - causes false positives
  // Users clicking links from TikTok are legitimate human traffic

  // High confidence: ChatGPT and AI bot detection
  if (isChatGPTBotUserAgent(userAgent)) {
    return {
      isBot: true,
      reason: 'ChatGPT/AI bot user-agent detected',
      confidence: 'high',
    };
  }

  // Medium confidence: Generic bot + suspicious headers
  if (headers && isGenericBot(userAgent) && detectHeadlessBrowser(headers)) {
    return {
      isBot: true,
      reason: 'Generic bot pattern with headless browser indicators',
      confidence: 'medium',
    };
  }

  // Low-medium confidence: Just generic bot pattern
  if (isGenericBot(userAgent)) {
    const ua = userAgent.toLowerCase();

    // Very obvious automated tools = higher confidence
    const obviousTools = ['curl', 'wget', 'python-requests', 'scrapy'];
    if (obviousTools.some(tool => ua.includes(tool))) {
      return {
        isBot: true,
        reason: 'Automated tool detected',
        confidence: 'medium',
      };
    }

    return {
      isBot: true,
      reason: 'Generic bot pattern detected',
      confidence: 'low',
    };
  }

  // Not a bot
  return {
    isBot: false,
    confidence: 'high',
  };
}

/**
 * Simple boolean bot detection (for middleware use)
 * Uses conservative approach to minimize false positives
 */
export function isBotRequest(
  userAgent: string,
  referer: string = '',
  headers?: { get: (name: string) => string | null }
): boolean {
  const result = detectBot(userAgent, referer, headers);

  // Only return true for high and medium confidence detections
  return result.isBot && (result.confidence === 'high' || result.confidence === 'medium');
}

/**
 * Logs bot detection for analytics (can be extended)
 */
export function logBotDetection(
  result: BotDetectionResult,
  userAgent: string,
  path: string
): void {
  // In production, you could send this to an analytics service
  // For now, just console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Bot Detection]', {
      isBot: result.isBot,
      reason: result.reason,
      confidence: result.confidence,
      userAgent: userAgent.substring(0, 100), // Truncate for readability
      path,
      timestamp: new Date().toISOString(),
    });
  }
}
