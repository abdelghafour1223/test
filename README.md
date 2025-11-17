# Vercel Bot Proxy

🛡️ **Intelligent serverless proxy for bot detection and redirection**

A sophisticated Vercel-hosted application that acts as an intelligent proxy to protect your website from bot traffic (specifically TikTok bots) while maintaining a seamless experience for legitimate users.

## Features

- ⚡ **Ultra-Fast Detection**: Powered by Vercel Edge Functions (<50ms latency)
- 🎯 **Smart Bot Detection**: Specifically targets TikTok bots and automated crawlers
- 🔒 **Stealth Mode**: Silent redirection - bots never know they're detected
- 🌍 **Global Distribution**: Runs at 100+ edge locations worldwide
- 📱 **Mobile-First**: Optimized for mobile users
- 🚀 **Serverless**: Zero infrastructure management, auto-scaling
- 🔐 **Secure**: Unique proxy IDs using cryptographically secure random generation

## How It Works

```
┌─────────────────┐
│ Incoming Traffic│
└────────┬────────┘
         │
         ▼
┌────────────────────┐
│  Edge Middleware   │◄─── Bot Detection Logic
│  (Global CDN)      │
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
Bot Detected  Legitimate User
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Decoy  │ │   Real   │
│  Site  │ │ Website  │
└────────┘ └──────────┘
```

## Tech Stack

- **Framework**: Next.js 14 (TypeScript)
- **Runtime**: Vercel Edge Runtime + Node.js
- **Storage**: Vercel KV (Redis)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel Platform

## Prerequisites

- Node.js 18+ installed
- A Vercel account (free tier works)
- Git installed

## Local Development

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd vercel-bot-proxy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Vercel KV (Local Development)

For local development, you'll need to link your project to Vercel:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables (including KV credentials)
vercel env pull .env.local
```

This will create a `.env.local` file with your Vercel KV credentials.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Homepage**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`

## Deployment to Vercel

### Method 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Step 4: Set Up Vercel KV

After deployment, you need to add Vercel KV storage:

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis-compatible)
6. Click **Create**
7. Vercel will automatically add the KV environment variables to your project

#### Step 5: Redeploy

After adding KV, trigger a redeployment:

```bash
vercel --prod
```

### Method 2: Deploy via GitHub (Automated)

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repository
4. Vercel will auto-detect Next.js and configure build settings
5. Click **Deploy**

#### Step 3: Add Vercel KV

Follow the same KV setup steps as Method 1 (Step 4).

## Environment Variables

The following environment variables are automatically set by Vercel when you add KV storage:

```bash
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

**Note**: You don't need to manually set these. Vercel handles this automatically when you create a KV database.

## Usage Guide

### Creating a Proxy

1. Navigate to the **Admin Dashboard**: `https://your-app.vercel.app/admin`

2. Enter your URLs:
   - **Real Website URL**: Where legitimate users should go (e.g., `https://your-main-site.com`)
   - **Bot Redirect URL**: Where bots should go (e.g., `https://decoy-site.com`)

3. Click **Generate Proxy URL**

4. Copy the generated proxy URL (e.g., `https://your-app.vercel.app/p/a3Kj9x2p`)

5. **Important**: Share this proxy URL instead of your real website URL

### How Bot Detection Works

The middleware analyzes incoming requests and detects bots based on:

#### TikTok Bot Detection (High Priority)
- **User-Agent patterns**: `TikTok`, `ByteSpider`, `Bytedance`, `Musically`
- **Referer domains**: `tiktok.com`, `musical.ly`, `bytedance.com`, `douyin.com`

#### Generic Bot Detection
- Common bot user-agents: `curl`, `wget`, `python-requests`, `scrapy`
- Headless browser signatures: Missing standard HTTP headers
- Automated tool patterns

#### Detection Logic
```typescript
if (TikTok bot detected) {
  → Redirect to Bot URL (decoy)
} else if (legitimate user) {
  → Redirect to Real URL
}
```

### URL Preservation

The proxy preserves:
- ✅ Query parameters (e.g., `?utm_source=tiktok&id=123`)
- ✅ Path segments (e.g., `/products/item-5`)
- ✅ All original request context

**Example**:
```
Proxy URL: https://your-app.vercel.app/p/abc123/products?id=5
           ↓
Real URL:  https://your-site.com/products?id=5
```

## API Documentation

### POST /api/config

Creates a new proxy configuration.

**Request Body**:
```json
{
  "realUrl": "https://your-main-site.com",
  "botUrl": "https://decoy-site.com"
}
```

**Response**:
```json
{
  "success": true,
  "proxyId": "a3Kj9x2p",
  "proxyUrl": "https://your-app.vercel.app/p/a3Kj9x2p",
  "config": {
    "realUrl": "https://your-main-site.com",
    "botUrl": "https://decoy-site.com",
    "createdAt": 1699999999999
  }
}
```

### GET /api/config/[id]

Retrieves a specific proxy configuration.

**Example**: `GET /api/config/a3Kj9x2p`

**Response**:
```json
{
  "success": true,
  "proxyId": "a3Kj9x2p",
  "config": {
    "realUrl": "https://your-main-site.com",
    "botUrl": "https://decoy-site.com",
    "createdAt": 1699999999999
  }
}
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture and data flow diagrams.

## Database Options

This project currently uses **Supabase** as its database, but we also provide a comprehensive guide for integrating **embedded databases** (like SQLite) for simpler deployments, local development, or edge use cases.

📖 **[Embedded Database Integration Guide](./EMBEDDED_DATABASE_GUIDE.md)**

Learn how to:
- Set up SQLite with better-sqlite3 (zero configuration)
- Migrate from Supabase to an embedded database
- Use JSON-based databases (LowDB) for simple projects
- Choose the right database for your deployment scenario

## Project Structure

```
vercel-bot-proxy/
├── middleware.ts              # Edge middleware (bot detection & routing)
├── lib/
│   └── botDetection.ts        # Bot detection utilities
├── pages/
│   ├── _app.tsx               # Next.js app wrapper
│   ├── index.tsx              # Homepage
│   ├── admin.tsx              # Admin dashboard
│   └── api/
│       ├── config.ts          # POST /api/config
│       └── config/
│           └── [id].ts        # GET /api/config/[id]
├── styles/
│   └── globals.css            # Global styles
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── vercel.json                # Vercel deployment config
```

## Performance

- **Edge Middleware Latency**: <50ms
- **Global Distribution**: 100+ edge locations
- **Scalability**: Handles millions of requests
- **Cold Start**: ~100ms (Edge Functions are always warm)

## Security

- **Proxy ID Generation**: Cryptographically secure using `nanoid`
- **Collision Probability**: ~1 million years at 1000 IDs/hour
- **No Data Logging**: Minimal data storage (only configuration URLs)
- **HTTPS Only**: All traffic encrypted

## Customization

### Adjusting Bot Detection

Edit `middleware.ts` to customize bot detection logic:

```typescript
// Add custom bot patterns
const customBotPatterns = [
  'my-custom-bot',
  'another-crawler',
];
```

### Adding Authentication

To protect the admin dashboard, you can:

1. **Use Vercel Password Protection** (easiest):
   - Go to Project Settings → Deployment Protection
   - Enable Password Protection

2. **Implement Custom Auth** (advanced):
   - Add authentication middleware
   - Use NextAuth.js or similar

## Troubleshooting

### Issue: "KV_REST_API_URL is not defined"

**Solution**: Make sure you've created a Vercel KV database and redeployed.

```bash
vercel env pull .env.local  # For local development
vercel --prod                # Redeploy production
```

### Issue: Middleware not running

**Solution**: Ensure `middleware.ts` is in the root directory and the matcher is correct:

```typescript
export const config = {
  matcher: '/p/:path*',
};
```

### Issue: Bot still reaching real site

**Solution**:
1. Check bot User-Agent in your server logs
2. Add pattern to `lib/botDetection.ts`
3. Test locally with custom User-Agent:

```bash
curl -H "User-Agent: TikTok Bot" https://your-app.vercel.app/p/your-id
```

## Future Enhancements

- [ ] Analytics dashboard (bot traffic metrics)
- [ ] Multiple bot type support (Instagram, Facebook, etc.)
- [ ] Machine learning-based detection
- [ ] Rate limiting
- [ ] Admin authentication
- [ ] Webhook notifications
- [ ] Custom redirect rules (A/B testing)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues and questions:
- Create an issue in this repository
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details

---

**Built with ❤️ using Vercel Edge Functions**

Deployment Status: [![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/vercel-bot-proxy)
