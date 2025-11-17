# Vercel Bot Proxy

🛡️ **Intelligent serverless proxy for bot detection and redirection**

A sophisticated Vercel-hosted application that acts as an intelligent proxy to protect your website from bot traffic (specifically TikTok bots) while maintaining a seamless experience for legitimate users.

> 🇲🇦 **دليل النشر بالدارجة المغربية** متوفر في [DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md)
> **Arabic/Moroccan Darija deployment guide** available in [DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md)

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
- **Runtime**: Vercel Edge Runtime
- **Configuration**: Static environment variables (single-user setup)
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

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Static Proxy Configuration
REAL_URL=https://your-real-website.com
BOT_URL=https://your-decoy-website.com
```

Replace the URLs with your actual website URLs.

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

#### Step 4: Set Environment Variables

Set your environment variables in Vercel:

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:
   - `REAL_URL`: Your real website URL (e.g., `https://your-main-site.com`)
   - `BOT_URL`: Your decoy website URL (e.g., `https://decoy-site.com`)
5. Make sure to set them for **Production**, **Preview**, and **Development** environments

#### Step 5: Redeploy

After adding environment variables, trigger a redeployment:

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

#### Step 3: Set Environment Variables

Follow the same environment variable setup steps as Method 1 (Step 4).

## Environment Variables

The following environment variables are required for the static configuration:

```bash
REAL_URL=https://your-real-website.com
BOT_URL=https://your-decoy-website.com
```

**Note**: These must be set in your Vercel project settings or `.env.local` file for local development.

## Usage Guide

### Using the Proxy

1. Navigate to the **Admin Dashboard**: `https://your-app.vercel.app/admin`

2. View your static configuration:
   - **Real Website URL**: Where legitimate users will go
   - **Bot Redirect URL**: Where bots will be redirected

3. Copy your deployment URL (e.g., `https://your-app.vercel.app`)

4. **Important**: Share your deployment URL instead of your real website URL

5. The middleware will automatically redirect:
   - **Legitimate users** → Real Website URL
   - **Bots** → Bot Redirect URL

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
Deployment URL: https://your-app.vercel.app/products?id=5
                ↓
Real URL:       https://your-site.com/products?id=5
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture and data flow diagrams.

## Configuration

This project uses **static configuration** via environment variables for a simple, single-user setup. No database is required - all configuration is stored in environment variables.

## Project Structure

```
vercel-bot-proxy/
├── middleware.ts              # Edge middleware (bot detection & routing)
├── lib/
│   ├── botDetection.ts        # Bot detection utilities
│   └── supabase.ts            # (Legacy - not used in static config)
├── pages/
│   ├── _app.tsx               # Next.js app wrapper
│   ├── index.tsx              # Homepage
│   ├── admin.tsx              # Admin dashboard (view static config)
│   └── api/
│       ├── config.ts          # (Legacy - not used in static config)
│       └── config/
│           └── [id].ts        # (Legacy - not used in static config)
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

- **Static Configuration**: Environment-based, no dynamic configuration
- **No Database**: No data storage or user input processing
- **No Data Logging**: Zero data storage beyond environment variables
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

### Issue: "Proxy service not configured"

**Symptom**: When you visit your deployed app, you see an error page saying "Proxy service not configured".

**Cause**: Environment variables `REAL_URL` and `BOT_URL` are not set in Vercel.

**Solution**:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add both variables:
   - `REAL_URL` = Your real website URL
   - `BOT_URL` = Your decoy website URL
5. Enable for **Production**, **Preview**, and **Development**
6. **Redeploy** your application

**Detailed instructions**:
- English: See section "Deployment to Vercel" above
- Arabic/Darija: See [DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md) for full guide in Moroccan Arabic

### Issue: "REAL_URL is not defined"

**Solution**: Make sure you've set the environment variables in Vercel and redeployed.

```bash
# For local development, create .env.local with:
REAL_URL=https://your-real-website.com
BOT_URL=https://your-decoy-website.com

# For production, set in Vercel Dashboard and redeploy:
vercel --prod
```

### Issue: Middleware not running

**Solution**: Ensure `middleware.ts` is in the root directory and check the middleware configuration.

### Issue: Bot still reaching real site

**Solution**:
1. Check bot User-Agent in your server logs
2. Add pattern to `middleware.ts` (detectTikTokBot function)
3. Test locally with custom User-Agent:

```bash
curl -H "User-Agent: TikTok Bot" https://your-app.vercel.app/
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
