# Vercel Bot Proxy - Architecture Overview

## System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Incoming Traffic                         │
│                    (All requests to Proxy URL)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Middleware                        │
│            (Ultra-fast, runs at Edge Locations)                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Parse Request Headers (User-Agent, Referer, etc.)   │   │
│  │  2. Extract Proxy ID from URL path                       │   │
│  │  3. Fetch Config from Vercel KV (cached)                 │   │
│  │  4. Run Bot Detection Algorithm                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
     Bot Detected?                        Legitimate User
             │                                  │
             ▼                                  ▼
┌────────────────────────┐         ┌──────────────────────────┐
│  302 Redirect to       │         │  302 Redirect to         │
│  Bot Redirect URL      │         │  Real Website URL        │
│  (Decoy/Honeypot)      │         │  (Original Destination)  │
└────────────────────────┘         └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                       Admin Dashboard                            │
│                   (Next.js Pages /admin)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User Input Form:                                         │  │
│  │  - Real Website URL                                       │  │
│  │  - Bot Redirect URL                                       │  │
│  │  - Submit Button                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/config                                         │  │
│  │  - Generate unique Proxy ID (nanoid)                      │  │
│  │  - Store config in Vercel KV                              │  │
│  │  - Return generated Proxy URL                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Display Generated Proxy URL:                             │  │
│  │  https://your-app.vercel.app/p/{unique-id}               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      Vercel KV Storage                           │
│                  (Redis-compatible Key-Value)                    │
│                                                                   │
│  Key Pattern: proxy:{proxyId}                                    │
│  Value: {                                                        │
│    realUrl: "https://real-site.com",                            │
│    botUrl: "https://decoy-site.com",                            │
│    createdAt: 1699999999999                                     │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Configuration Flow
1. User accesses Admin Dashboard (`/admin`)
2. User enters Real Website URL and Bot Redirect URL
3. Frontend calls `POST /api/config` with payload
4. API Route generates unique Proxy ID (e.g., `a3Kj9x2p`)
5. API Route stores configuration in Vercel KV with key `proxy:a3Kj9x2p`
6. API Route returns generated Proxy URL: `https://your-app.vercel.app/p/a3Kj9x2p`
7. User receives Proxy URL to distribute instead of real URL

### 2. Request Proxy Flow
1. Bot/User accesses Proxy URL: `https://your-app.vercel.app/p/a3Kj9x2p`
2. Vercel Edge Middleware intercepts request (runs globally at edge)
3. Middleware extracts Proxy ID (`a3Kj9x2p`) from URL path
4. Middleware fetches configuration from Vercel KV (with caching)
5. Middleware analyzes request headers for bot signatures:
   - User-Agent patterns (TikTok bot signatures)
   - Referer header analysis
   - Request rate patterns (optional advanced)
6. Decision made:
   - **Bot Detected**: 302 redirect to `botUrl` (decoy)
   - **Legitimate User**: 302 redirect to `realUrl` (actual site)
7. Original query parameters and path are preserved in redirect

## Component Details

### Edge Middleware (`/middleware.ts`)
- **Runtime**: Edge (ultra-fast, global distribution)
- **Responsibilities**:
  - Request interception
  - Bot detection logic
  - Configuration retrieval from KV
  - HTTP redirects (302/307)
- **Performance**: <50ms latency for detection + redirect

### API Routes (`/pages/api/`)
- **`/api/config` (POST)**: Create new proxy configuration
- **`/api/config` (GET)**: Retrieve existing configuration (optional)
- **Runtime**: Node.js Serverless Functions

### Admin Dashboard (`/pages/admin/`)
- **Technology**: Next.js React page
- **Features**:
  - Form validation
  - URL input fields
  - Generated Proxy URL display with copy button
  - Mobile-responsive design

### Vercel KV Storage
- **Type**: Redis-compatible key-value store
- **Data Structure**:
  ```json
  {
    "proxy:a3Kj9x2p": {
      "realUrl": "https://real-site.com",
      "botUrl": "https://decoy-site.com",
      "createdAt": 1699999999999
    }
  }
  ```
- **TTL**: No expiration (persistent configurations)

## Bot Detection Strategy

### TikTok Bot Signatures
1. **User-Agent Patterns**:
   - `TikTok`
   - `ByteSpider`
   - `Bytedance`
   - Mobile app user agents with TikTok identifiers

2. **Referer Analysis**:
   - Requests from `*.tiktok.com` domains
   - Missing or suspicious referer patterns

3. **Request Characteristics**:
   - Headless browser signatures
   - Missing standard browser headers
   - Automated tool patterns (curl, wget, python-requests)

### Detection Philosophy
- **Silent Redirection**: No blocking errors (403/404)
- **Seamless for Bots**: Bots receive valid 302 redirect to decoy
- **Zero Impact on Users**: Legitimate users unaffected
- **Stealth**: Bot operators don't know they're detected

## Scalability & Performance

### Edge Computing Benefits
- **Global Distribution**: Middleware runs at 100+ edge locations
- **Low Latency**: <50ms detection overhead
- **Automatic Scaling**: Handles millions of requests
- **Cost-Effective**: Pay per request, no idle costs

### Caching Strategy
- Vercel KV provides automatic caching at edge
- Configuration lookups are ultra-fast (sub-millisecond)
- No database round-trips for cached configs

## Security Considerations

### Proxy ID Generation
- Uses `nanoid` for cryptographically secure random IDs
- 21-character alphanumeric strings
- Collision probability: ~1 million years at 1000 IDs/hour

### Access Control
- Admin dashboard can be protected with Vercel Password Protection
- Optional: Add authentication layer for production

### Data Privacy
- No user tracking or logging
- Minimal data storage (only config URLs)
- GDPR-compliant design

## Deployment Architecture

```
Vercel Project
├── Edge Network (Global)
│   └── Middleware (Bot Detection)
├── Serverless Functions (Regional)
│   └── API Routes (Config Management)
├── Vercel KV (Global with Edge Caching)
│   └── Configuration Storage
└── Static Assets
    └── Admin Dashboard
```

## Monitoring & Analytics (Future Enhancement)

Potential additions:
- Request analytics (bot vs. user ratio)
- Geographic distribution tracking
- Bot pattern learning (ML-based)
- Real-time dashboard with metrics

## Technology Stack

- **Framework**: Next.js 14+ (App Router or Pages Router)
- **Runtime**: Vercel Edge Runtime + Node.js
- **Storage**: Vercel KV (Redis)
- **Deployment**: Vercel Platform
- **Language**: TypeScript/JavaScript
- **Styling**: Tailwind CSS (lightweight, mobile-first)
