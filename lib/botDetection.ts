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
 * These are regularly updated patterns known to be used by TikTok's crawlers
 */
export const TIKTOK_BOT_PATTERNS = [
  'tiktok',
  'bytespider',
  'bytedance',
  'musically',
  'musical_ly',
  'trill',
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
 * TikTok domains to check in referer
 */
export const TIKTOK_DOMAINS = [
  'tiktok.com',
  'musical.ly',
  'bytedance.com',
  'douyin.com', // Chinese version of TikTok
] as const;

/**
 * Checks if user-agent matches TikTok bot patterns
 */
export function isTikTokBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return TIKTOK_BOT_PATTERNS.some(pattern => ua.includes(pattern));
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
  // High confidence: TikTok-specific detection
  if (isTikTokBotUserAgent(userAgent)) {
    return {
      isBot: true,
      reason: 'TikTok bot user-agent detected',
      confidence: 'high',
    };
  }

  if (isTikTokReferer(referer)) {
    return {
      isBot: true,
      reason: 'TikTok referer detected',
      confidence: 'high',
    };
  }

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
