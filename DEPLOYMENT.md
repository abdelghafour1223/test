# Deployment Guide - Vercel Bot Proxy

This guide provides comprehensive step-by-step instructions for deploying the Vercel Bot Proxy to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel CLI Deployment (Recommended)](#vercel-cli-deployment-recommended)
3. [GitHub Integration Deployment](#github-integration-deployment)
4. [Vercel KV Setup](#vercel-kv-setup)
5. [Environment Configuration](#environment-configuration)
6. [Domain Configuration](#domain-configuration)
7. [Testing Your Deployment](#testing-your-deployment)
8. [Production Checklist](#production-checklist)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- ✅ [Node.js 18+](https://nodejs.org/) installed locally
- ✅ [Git](https://git-scm.com/) installed
- ✅ Basic familiarity with command line

---

## Vercel CLI Deployment (Recommended)

This method gives you the most control and is fastest for iteration.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

### Step 2: Login to Vercel

```bash
vercel login
```

Choose your login method (GitHub, GitLab, Bitbucket, or Email).

### Step 3: Navigate to Project Directory

```bash
cd vercel-bot-proxy
```

### Step 4: Deploy to Preview

First, deploy to a preview environment to test:

```bash
vercel
```

You'll be prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account/team
- **Link to existing project?** → No (first time)
- **Project name?** → `vercel-bot-proxy` (or your preferred name)
- **Directory?** → `.` (current directory)
- **Override settings?** → No

Vercel will build and deploy. You'll receive a preview URL like:
```
https://vercel-bot-proxy-abc123.vercel.app
```

### Step 5: Deploy to Production

Once tested, deploy to production:

```bash
vercel --prod
```

Your production URL will be:
```
https://vercel-bot-proxy.vercel.app
```

---

## GitHub Integration Deployment

This method enables automatic deployments on git push.

### Step 1: Create GitHub Repository

```bash
# Initialize git if not already done
git init

# Create .gitignore (already provided in project)
# Add files
git add .
git commit -m "Initial commit: Vercel Bot Proxy"

# Create repository on GitHub, then:
git remote add origin https://github.com/your-username/vercel-bot-proxy.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
6. Click **"Deploy"**

Vercel will build and deploy. Initial deployment takes 1-2 minutes.

### Step 3: Automatic Deployments

From now on, every push to `main` triggers a production deployment:

```bash
git add .
git commit -m "Update feature"
git push
```

Preview deployments are created for pull requests automatically.

---

## Vercel KV Setup

**Critical**: The application requires Vercel KV storage to function.

### Step 1: Navigate to Storage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **vercel-bot-proxy**
3. Click **"Storage"** tab in the top navigation

### Step 2: Create KV Database

1. Click **"Create Database"**
2. Select **"KV"** (Redis-compatible key-value store)
3. Configure:
   - **Name**: `bot-proxy-kv` (or your preferred name)
   - **Region**: Choose closest to your primary traffic (e.g., `us-east-1` for US)
4. Click **"Create"**

### Step 3: Connect to Project

1. After creation, click **"Connect to Project"**
2. Select **"vercel-bot-proxy"** (your project)
3. Select **"Production"** and **"Preview"** environments
4. Click **"Connect"**

Vercel automatically adds these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Step 4: Redeploy

Trigger a redeployment to apply the KV environment variables:

```bash
vercel --prod
```

Or via dashboard:
1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## Environment Configuration

### Production Environment Variables

Vercel KV variables are automatically set. For additional configuration:

1. Go to **Project Settings** → **"Environment Variables"**
2. Add variables:
   - **Name**: `VARIABLE_NAME`
   - **Value**: `value`
   - **Environment**: Select Production / Preview / Development

Example optional variables:

```bash
# Admin authentication (future enhancement)
ADMIN_PASSWORD=your_secure_password

# Analytics tracking ID
ANALYTICS_ID=UA-XXXXXXXXX-X
```

### Local Development Variables

Pull production environment variables to local:

```bash
vercel env pull .env.local
```

This creates `.env.local` with your KV credentials for local testing.

---

## Domain Configuration

### Using Vercel Subdomain (Default)

Your app is automatically available at:
```
https://vercel-bot-proxy.vercel.app
```

### Using Custom Domain

#### Step 1: Add Domain to Vercel

1. Go to **Project Settings** → **"Domains"**
2. Click **"Add"**
3. Enter your domain (e.g., `botproxy.yourdomain.com`)
4. Click **"Add"**

#### Step 2: Configure DNS

Vercel provides DNS instructions. Typically:

**For subdomain** (e.g., `botproxy.yourdomain.com`):
```
Type: CNAME
Name: botproxy
Value: cname.vercel-dns.com
```

**For apex domain** (e.g., `yourdomain.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

#### Step 3: Wait for Propagation

DNS propagation takes 5 minutes to 48 hours. Vercel shows status:
- ⏳ **Pending**: Waiting for DNS
- ✅ **Valid**: Domain active

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Testing Your Deployment

### 1. Test Admin Dashboard

Visit: `https://your-app.vercel.app/admin`

Expected:
- ✅ Form displays correctly
- ✅ No console errors
- ✅ Responsive on mobile

### 2. Create a Proxy

1. Enter test URLs:
   - **Real URL**: `https://example.com`
   - **Bot URL**: `https://google.com`
2. Click **"Generate Proxy URL"**
3. Copy generated URL (e.g., `https://your-app.vercel.app/p/abc123`)

### 3. Test Legitimate User Flow

Open generated proxy URL in a normal browser:

```bash
# Should redirect to Real URL (example.com)
curl -L https://your-app.vercel.app/p/abc123
```

Expected: Redirects to `https://example.com`

### 4. Test Bot Detection

Simulate TikTok bot with custom User-Agent:

```bash
curl -L -H "User-Agent: TikTok Bot" https://your-app.vercel.app/p/abc123
```

Expected: Redirects to `https://google.com` (Bot URL)

### 5. Verify KV Storage

Check configuration endpoint:

```bash
curl https://your-app.vercel.app/api/config/abc123
```

Expected:
```json
{
  "success": true,
  "proxyId": "abc123",
  "config": {
    "realUrl": "https://example.com",
    "botUrl": "https://google.com",
    "createdAt": 1699999999999
  }
}
```

### 6. Performance Testing

Test edge middleware latency:

```bash
# Measure response time
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s https://your-app.vercel.app/p/abc123
```

Expected: <0.5 seconds (including redirect)

---

## Production Checklist

Before going live, verify:

### Security
- [ ] Vercel KV environment variables are set
- [ ] No sensitive data in git history
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS is enforced (automatic with Vercel)

### Functionality
- [ ] Admin dashboard loads correctly
- [ ] Proxy URL generation works
- [ ] Bot detection redirects to Bot URL
- [ ] Legitimate traffic redirects to Real URL
- [ ] Query parameters are preserved
- [ ] Path segments are preserved

### Performance
- [ ] Edge middleware responds in <50ms
- [ ] No console errors in browser
- [ ] Mobile-responsive design confirmed

### Monitoring
- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking configured (optional: Sentry)
- [ ] Deployment notifications set up

### Documentation
- [ ] README.md updated with your deployment URL
- [ ] Team members have access to Vercel project
- [ ] Admin credentials documented (if auth is added)

---

## Monitoring & Maintenance

### Vercel Dashboard Monitoring

Access insights:
1. Go to **"Analytics"** tab (requires Pro plan)
2. View:
   - Request count
   - Error rate
   - Top paths
   - Geographic distribution

### Function Logs

View Edge Middleware logs:
1. Go to **"Deployments"** tab
2. Click on a deployment
3. Click **"Functions"** tab
4. Select `middleware`
5. View real-time logs

### Error Tracking

For production error tracking, integrate Sentry:

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  // Sentry config
});
```

### Regular Maintenance

**Monthly**:
- [ ] Review Vercel KV usage (Dashboard → Storage)
- [ ] Check for Next.js updates: `npm outdated`
- [ ] Review bot detection patterns, add new ones if needed

**Quarterly**:
- [ ] Audit proxy configurations (cleanup unused ones)
- [ ] Review bot detection effectiveness
- [ ] Update dependencies: `npm update`

### Scaling Considerations

Vercel auto-scales, but monitor:

| Metric | Free Tier Limit | Pro Tier Limit |
|--------|-----------------|----------------|
| Bandwidth | 100 GB/month | 1 TB/month |
| Edge Requests | 100K/day | Unlimited |
| KV Storage | 256 MB | 512 MB |

Upgrade at: **Project Settings** → **"Billing"**

---

## Troubleshooting Deployments

### Build Failures

**Error**: `Module not found: Can't resolve '@vercel/kv'`

**Solution**:
```bash
npm install @vercel/kv
git add package.json package-lock.json
git commit -m "Add @vercel/kv dependency"
git push
```

### Runtime Errors

**Error**: `KV_REST_API_URL is not defined`

**Solution**:
1. Verify KV database is created and connected
2. Redeploy: `vercel --prod`
3. Check environment variables in Project Settings

**Error**: `Proxy not found (404)`

**Solution**:
- Verify proxy ID exists in KV
- Check KV connection in Vercel Dashboard
- Test API endpoint: `curl https://your-app.vercel.app/api/config/your-id`

### Middleware Not Running

**Error**: Requests bypass middleware

**Solution**:
1. Verify `middleware.ts` is in root directory
2. Check matcher config:
   ```typescript
   export const config = {
     matcher: '/p/:path*',
   };
   ```
3. Redeploy

### Performance Issues

**Slow redirects (>1s)**

**Solution**:
- Check KV region matches primary traffic region
- Verify Edge Middleware is enabled (not Node.js runtime)
- Review Vercel Analytics for bottlenecks

---

## Rollback Procedures

### Instant Rollback via Dashboard

1. Go to **"Deployments"** tab
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**
4. Confirm

Changes are live in <30 seconds.

### Rollback via CLI

```bash
# List recent deployments
vercel ls

# Promote specific deployment to production
vercel promote <deployment-url>
```

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **Next.js Documentation**: https://nextjs.org/docs
- **Vercel Support**: support@vercel.com (Pro/Enterprise)
- **Community**: https://github.com/vercel/vercel/discussions

---

**Deployment Complete!** 🎉

Your bot proxy is now protecting your website from unwanted traffic while maintaining a seamless experience for legitimate users.
