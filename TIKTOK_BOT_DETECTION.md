# TikTok Bot Detection and Redirection

## Overview

This tool implements intelligent traffic routing to differentiate between TikTok bot crawlers and legitimate human users, including those browsing via TikTok's in-app browser (WebView).

## How It Works

```
┌─────────────────┐
│ Incoming Request│
└────────┬────────┘
         │
         ▼
   [User-Agent Check]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
WebView?   Bot Pattern?
(trill,    (Bytespider,
musical_ly, TikTokSpider)
JsSdk)
    │         │
    │ YES     │ YES
    ▼         ▼
┌─────┐   ┌─────┐
│HUMAN│   │ BOT │
└──┬──┘   └──┬──┘
   │         │
   ▼         ▼
REAL URL  FAKE URL
(301)     (301)
```

## Detection Logic

### Priority 1: Identify Legitimate Human Users (TikTok WebView)

**CRITICAL**: Users browsing via TikTok's in-app browser are real humans and must NEVER be redirected to fake content.

**TikTok WebView Identifiers:**
- `trill` - TikTok WebView identifier
- `musical_ly` - TikTok WebView identifier
- `BytedanceWebview` - TikTok WebView identifier
- `JsSdk/1.0` or `JsSdk/2.0` - TikTok WebView SDK

**Example User-Agent (Android):**
```
Mozilla/5.0 (Linux; Android 8.1.0; CPH1901) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 trill_200005 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/trill
```

**Example User-Agent (iOS):**
```
Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_21.7.0 JsSdk/2.0 NetType/4G Channel/App Store
```

### Priority 2: Identify TikTok Bots (Crawlers)

Only these specific User-Agent patterns are treated as bots:

**1. Bytespider** (AI Data Scraper)
```
Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.0.0 Safari/537.36
```

**Purpose:** AI data scraping for LLM training (ByteDance's Doubao AI system)
**Robots.txt Compliance:** Poor - ignores directives
**Contact:** spider-feedback@bytedance.com

**2. TikTokSpider** (Link Preview Fetcher)
```
Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; TikTokSpider; ttspider-feedback@tiktok.com)
```

**Purpose:** Link preview generation for URLs shared on TikTok
**Robots.txt Compliance:** Good - respects directives
**Contact:** ttspider-feedback@tiktok.com

### Priority 3: All Other Traffic

Any traffic that doesn't match the above patterns is treated as legitimate human traffic and allowed to access the real URL.

## Target URLs

### Fake URL (for Bots)
```
https://storelhata.com/pages/miroir
```
- TikTok bots (Bytespider and TikTokSpider) are redirected here with HTTP 301 Permanent Redirect
- This tells bots to update their index with the fake URL

### Real URL (for Humans)
```
https://ecoshopin.store/products/propolis-%D8%A7%D9%84%D8%A3%D8%B5%D9%84%D9%8A-%D8%A3%D9%82%D9%88%D9%89-%D9%85%D9%83%D9%85%D9%84-%D8%B7%D8%A8%D9%8A%D8%B9%D9%8A-%D9%83%D9%8A%D8%AD%D9%85%D9%8A-%D9%85%D9%86%D8%A7%D8%B9%D8%AA%D9%83-%D9%88%D9%8A%D8%B9%D8%B7%D9%8A%D9%83-%D9%85%D9%86-%D8%A7%D9%84%D9%82%D9%88%D9%85%D9%86-%D8%A7%D9%84%D8%AF%D8%A7%D8%AE%D9%84-%F0%9F%90%9D%E2%9C%A8
```
- Legitimate human users (including TikTok WebView) are redirected here
- HTTP 301 Permanent Redirect

## Technical Implementation

### Redirection Method: HTTP 301 Permanent Redirect

**Why 301 instead of reverse proxy?**
- ✅ More efficient - no content fetching required
- ✅ Lower latency - simple redirect vs fetch + serve
- ✅ SEO-friendly - bots update their index with the target URL
- ✅ Simpler implementation - less code, fewer failure points
- ✅ Lower cost - reduced edge function execution time

### Edge Middleware Benefits

- **Ultra-fast**: Runs on Vercel Edge Network (<50ms latency)
- **Global**: Executes at 100+ edge locations worldwide
- **Scalable**: Handles millions of requests automatically
- **Secure**: Executes before reaching origin, protecting your infrastructure

## Configuration

### Environment Variables (Optional)

You can override the default URLs by setting environment variables in Vercel:

```bash
REAL_URL=https://your-real-website.com
BOT_URL=https://your-fake-website.com
```

**Note:** If not set, the middleware uses the hardcoded URLs shown above.

### Setting Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add variables:
   - `REAL_URL` - Your real website URL
   - `BOT_URL` - Your fake/decoy website URL
5. Set for **Production**, **Preview**, and **Development**
6. Redeploy your application

## Testing

### Using the Test Script

Run the comprehensive test suite to verify bot detection:

```bash
# Test local development server
./test-bot-detection.sh http://localhost:3000

# Test production deployment
./test-bot-detection.sh https://your-app.vercel.app
```

The test script validates:
- ✅ Bytespider is detected as bot → redirects to fake URL
- ✅ TikTokSpider is detected as bot → redirects to fake URL
- ✅ TikTok WebView is detected as human → redirects to real URL
- ✅ Regular browsers are detected as human → redirects to real URL

### Manual Testing with cURL

**Test Bytespider (should redirect to FAKE URL):**
```bash
curl -I -A "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)" https://your-app.vercel.app
# Expected: HTTP 301, Location: https://storelhata.com/pages/miroir
```

**Test TikTokSpider (should redirect to FAKE URL):**
```bash
curl -I -A "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; TikTokSpider; ttspider-feedback@tiktok.com)" https://your-app.vercel.app
# Expected: HTTP 301, Location: https://storelhata.com/pages/miroir
```

**Test TikTok WebView (should redirect to REAL URL):**
```bash
curl -I -A "Mozilla/5.0 (Linux; Android 8.1.0) AppleWebKit/537.36 Chrome/91.0.4472.120 Mobile Safari/537.36 trill_200005 JsSdk/1.0" https://your-app.vercel.app
# Expected: HTTP 301, Location: https://ecoshopin.store/products/...
```

**Test Regular Browser (should redirect to REAL URL):**
```bash
curl -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" https://your-app.vercel.app
# Expected: HTTP 301, Location: https://ecoshopin.store/products/...
```

### Browser Developer Tools Testing

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Navigate to **Network conditions** (three-dot menu → More tools)
4. Uncheck "Use browser default" under User agent
5. Select "Custom..." and enter a test User-Agent
6. Reload the page (F5)
7. Verify the redirect location

## Debugging

### Development Mode Logging

In development mode (`NODE_ENV=development`), the middleware logs each request:

```javascript
[TikTok Bot Detection] {
  isBot: false,
  targetUrl: 'REAL URL (human)',
  userAgent: 'Mozilla/5.0 (Linux; Android 8.1.0) AppleWebKit/537.36 ... trill_200005 JsSdk/1.0',
  path: '/'
}
```

### Response Headers

The middleware adds a custom header for debugging:

```
X-Bot-Detection: bot       # Redirected to fake URL
X-Bot-Detection: human     # Redirected to real URL
```

Check this header with cURL:
```bash
curl -I -A "<user-agent>" https://your-app.vercel.app | grep "X-Bot-Detection"
```

## Performance

| Metric | Value |
|--------|-------|
| **Latency** | <50ms (edge execution) |
| **Global Coverage** | 100+ edge locations |
| **Scalability** | Millions of requests |
| **Execution Time** | ~5-10ms per request |
| **Cold Start** | None (edge functions always warm) |

## Security Considerations

### User-Agent Spoofing

**Important:** This implementation relies on User-Agent detection, which can be spoofed by sophisticated actors.

**What this protects against:**
- ✅ Legitimate TikTok crawlers (Bytespider, TikTokSpider)
- ✅ Bots using official User-Agent strings
- ✅ Automated tools that don't modify User-Agent

**What this does NOT protect against:**
- ❌ Malicious actors intentionally spoofing User-Agent
- ❌ Advanced scraping tools with custom User-Agents
- ❌ Headless browsers configured to mimic regular browsers

**For Enhanced Security:**
- Combine with IP range filtering (AS396986, AS138699)
- Implement rate limiting (Vercel Edge Config + KV)
- Use behavioral analysis (Cloudflare Bot Management, DataDome)
- Add CAPTCHA for suspicious traffic

### SEO Impact

**301 Permanent Redirect** has specific SEO implications:

**For TikTok Bots:**
- Bots will index the FAKE URL as the canonical location
- Any "link juice" or authority is transferred to the fake URL
- TikTokSpider generates link previews from the fake URL

**For Human Users:**
- Users are seamlessly redirected to the REAL URL
- Real website receives human traffic and engagement
- TikTok in-app browser users see the real product page

## Troubleshooting

### Issue: TikTok WebView users being redirected to fake URL

**Cause:** User-Agent doesn't contain expected WebView identifiers

**Solution:** Check the User-Agent in your logs and add missing patterns to `TIKTOK_WEBVIEW_PATTERNS` in `middleware.ts`

### Issue: Bots reaching real URL

**Cause:** Bot using non-standard User-Agent

**Solution:**
1. Check your logs for the bot's User-Agent
2. Add the pattern to `TIKTOK_BOT_PATTERNS` in `middleware.ts`
3. Redeploy

### Issue: All traffic being redirected to fake URL

**Cause:** Logic error in bot detection

**Solution:**
1. Review the detection order in `detectTikTokBot()`
2. Ensure WebView check happens BEFORE bot check
3. Test locally with the test script

### Issue: 301 redirects being cached

**Cause:** Browser caching 301 redirects

**Solution:**
- Clear browser cache
- Use incognito/private browsing mode
- Add cache-busting query parameters: `?test=1234`

## Source Attribution

This implementation is based on:

**Complete Technical Analysis: TikTok and ByteDance Crawlers and Bots (2025)**

Key sources:
- Dark Visitors (darkvisitors.com) - Bot database
- DataDome - Bot detection analysis
- Cloudflare Radar - 2024 bot traffic analysis
- F5 Networks - Bytespider behavior case studies
- IPinfo.io & PeeringDB - Network infrastructure data

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue in this repository
- Check the main README.md for general setup
- Review test-bot-detection.sh for testing examples

---

**Built with ❤️ using Vercel Edge Functions and Next.js 14**
