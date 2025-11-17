# Embedded Database Integration Guide

**A Comprehensive, Beginner-Friendly Guide for Next.js/TypeScript Projects**

---

## 🎯 What You'll Learn

This guide will help you integrate an embedded database into your Next.js application **without**:
- ❌ Manual database server installation
- ❌ Complex connection setup
- ❌ Cloud service configuration
- ❌ Environment variable headaches

Instead, you'll get:
- ✅ A database that lives inside your project
- ✅ Zero external dependencies
- ✅ Simple file-based storage
- ✅ Easy-to-understand code examples

---

## 📖 Table of Contents

1. [Understanding Embedded Databases](#understanding-embedded-databases)
2. [Why Choose an Embedded Database?](#why-choose-an-embedded-database)
3. [Quick Start: SQLite with better-sqlite3](#quick-start-sqlite-with-better-sqlite3)
4. [Alternative Option: LowDB (JSON-based)](#alternative-option-lowdb-json-based)
5. [Migrating from Supabase](#migrating-from-supabase)
6. [Troubleshooting](#troubleshooting)
7. [When NOT to Use Embedded Databases](#when-not-to-use-embedded-databases)

---

## Understanding Embedded Databases

### What is an Embedded Database?

An **embedded database** is a database that runs **inside** your application, not as a separate server. Think of it like this:

```
Traditional Database (e.g., PostgreSQL, Supabase):
┌──────────────┐         Network          ┌──────────────┐
│ Your App     │ ◄──── Connection ────►   │ Database     │
│ (localhost)  │                          │ Server       │
└──────────────┘                          └──────────────┘
Requires setup, credentials, network config

Embedded Database (e.g., SQLite):
┌────────────────────────────┐
│ Your App                   │
│  ├── Code                  │
│  └── database.db (file)    │  ← Database is just a file!
└────────────────────────────┘
No setup, no network, no credentials
```

### How Does It Work?

Instead of connecting to an external database server:
- Your database is stored as a **single file** (e.g., `database.db`)
- Your application reads and writes to this file directly
- No network requests, no authentication, no complex setup

---

## Why Choose an Embedded Database?

### Perfect For:
- 🚀 **Rapid prototyping** - Get started in seconds
- 🧪 **Local development** - No cloud services needed
- 📦 **Portable applications** - Database travels with your code
- 🎓 **Learning projects** - Minimal complexity
- 💻 **Edge deployments** - Single binary with data
- 🔒 **Privacy-focused apps** - All data stays local

### Real-World Use Cases:
- **Your bot proxy project**: Store proxy configurations locally
- Mobile apps (React Native with SQLite)
- Desktop applications (Electron + SQLite)
- CLI tools that need to persist data
- Static site generators with build-time data

---

## Quick Start: SQLite with better-sqlite3

### Why SQLite + better-sqlite3?

- **SQLite**: The world's most deployed database engine
- **better-sqlite3**: The fastest, most reliable SQLite library for Node.js
- **Zero configuration**: Works out of the box
- **Battle-tested**: Used by VS Code, Apple, Android, and millions of apps

### Step 1: Install the Library

**You don't need to manually "add files"!** Modern JavaScript uses package managers that handle this automatically.

Open your terminal in your project directory and run:

```bash
npm install better-sqlite3
```

Or if you use Yarn:

```bash
yarn add better-sqlite3
```

**For TypeScript users** (recommended for this project):

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

That's it! The library is now integrated into your project. No manual file copying needed.

---

### Step 2: Create Your Database Module

Create a new file: `lib/database.ts`

```typescript
import Database from 'better-sqlite3';
import path from 'path';

/**
 * Database configuration
 * The database file will be stored in the project root
 */
const DB_PATH = path.join(process.cwd(), 'proxy-configs.db');

/**
 * Initialize database connection
 * This creates the database file if it doesn't exist
 */
export const db = new Database(DB_PATH, {
  verbose: console.log, // Optional: logs SQL queries (remove in production)
});

/**
 * Proxy configuration interface matching our schema
 */
export interface ProxyConfig {
  id: string;
  real_url: string;
  bot_url: string;
  created_at: number;
}

/**
 * Initialize database schema
 * Creates the proxy_configs table if it doesn't exist
 */
export function initializeDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS proxy_configs (
      id TEXT PRIMARY KEY,
      real_url TEXT NOT NULL,
      bot_url TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `;

  db.exec(createTableSQL);

  // Create index for faster lookups
  db.exec('CREATE INDEX IF NOT EXISTS idx_created_at ON proxy_configs(created_at)');

  console.log('✅ Database initialized successfully');
}

/**
 * Database operations
 */
export const dbOperations = {
  /**
   * Insert a new proxy configuration
   */
  insertProxyConfig: (config: ProxyConfig) => {
    const stmt = db.prepare(`
      INSERT INTO proxy_configs (id, real_url, bot_url, created_at)
      VALUES (?, ?, ?, ?)
    `);

    return stmt.run(config.id, config.real_url, config.bot_url, config.created_at);
  },

  /**
   * Get a proxy configuration by ID
   */
  getProxyConfig: (id: string): ProxyConfig | undefined => {
    const stmt = db.prepare('SELECT * FROM proxy_configs WHERE id = ?');
    return stmt.get(id) as ProxyConfig | undefined;
  },

  /**
   * Get all proxy configurations
   */
  getAllProxyConfigs: (): ProxyConfig[] => {
    const stmt = db.prepare('SELECT * FROM proxy_configs ORDER BY created_at DESC');
    return stmt.all() as ProxyConfig[];
  },

  /**
   * Delete a proxy configuration
   */
  deleteProxyConfig: (id: string) => {
    const stmt = db.prepare('DELETE FROM proxy_configs WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Update a proxy configuration
   */
  updateProxyConfig: (id: string, realUrl: string, botUrl: string) => {
    const stmt = db.prepare(`
      UPDATE proxy_configs
      SET real_url = ?, bot_url = ?
      WHERE id = ?
    `);
    return stmt.run(realUrl, botUrl, id);
  },
};

// Initialize database on module load
initializeDatabase();

// Cleanup on process exit
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
```

**What just happened?**
- ✅ Created a database file (`proxy-configs.db`) in your project root
- ✅ Defined the table schema (same structure as your Supabase table)
- ✅ Created reusable functions for CRUD operations
- ✅ Added proper cleanup to close the database on exit

---

### Step 3: Update Your API Routes

Replace your Supabase calls with the new embedded database.

**Before (with Supabase):** `pages/api/config.ts`

```typescript
import { supabase } from '../../lib/supabase';

// Store in Supabase
const { error } = await supabase
  .from('proxy_configs')
  .insert({
    id: proxyId,
    real_url: config.realUrl,
    bot_url: config.botUrl,
  });
```

**After (with SQLite):** `pages/api/config.ts`

```typescript
import { dbOperations } from '../../lib/database';

// Store in SQLite
dbOperations.insertProxyConfig({
  id: proxyId,
  real_url: config.realUrl,
  bot_url: config.botUrl,
  created_at: Date.now(),
});
```

**Complete updated API route:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '../../lib/database';
import { nanoid } from 'nanoid';

interface ProxyConfig {
  realUrl: string;
  botUrl: string;
  createdAt: number;
}

interface ConfigResponse {
  success: boolean;
  proxyId: string;
  proxyUrl: string;
  config: ProxyConfig;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateProxyUrl(proxyId: string, request: NextApiRequest): string {
  const host = request.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl}/p/${proxyId}`;
  }

  return `${protocol}://${host}/p/${proxyId}`;
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse | ErrorResponse>
) {
  try {
    const { realUrl, botUrl } = req.body;

    // Validation
    if (!realUrl || !botUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: 'Both realUrl and botUrl are required',
      });
    }

    if (!isValidUrl(realUrl) || !isValidUrl(botUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        details: 'Both URLs must be valid HTTP or HTTPS URLs',
      });
    }

    // Generate unique proxy ID
    const proxyId = nanoid();

    // Create configuration object
    const config: ProxyConfig = {
      realUrl: realUrl.trim(),
      botUrl: botUrl.trim(),
      createdAt: Date.now(),
    };

    // Store in SQLite database
    dbOperations.insertProxyConfig({
      id: proxyId,
      real_url: config.realUrl,
      bot_url: config.botUrl,
      created_at: config.createdAt,
    });

    // Generate full proxy URL
    const proxyUrl = generateProxyUrl(proxyId, req);

    // Return success response
    return res.status(201).json({
      success: true,
      proxyId,
      proxyUrl,
      config,
    });

  } catch (error) {
    console.error('Error creating proxy config:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to create proxy configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}
```

---

### Step 4: Update the Config Retrieval Route

Update `pages/api/config/[id].ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbOperations } from '../../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid proxy ID',
      });
    }

    // Retrieve from SQLite database
    const config = dbOperations.getProxyConfig(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Proxy configuration not found',
      });
    }

    return res.status(200).json({
      success: true,
      proxyId: id,
      config: {
        realUrl: config.real_url,
        botUrl: config.bot_url,
        createdAt: config.created_at,
      },
    });

  } catch (error) {
    console.error('Error retrieving proxy config:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve proxy configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
```

---

### Step 5: Update Your Middleware

The middleware needs to fetch configs from the database. Update `middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTikTokBot, isGenericBot } from './lib/botDetection';

// Note: better-sqlite3 doesn't work in Edge Runtime
// For middleware, we need to fetch from an API route
async function getProxyConfig(proxyId: string, request: NextRequest) {
  try {
    // Call our API route to get the config
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/config/${proxyId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.config : null;
  } catch (error) {
    console.error('Error fetching proxy config:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process /p/* routes
  if (!pathname.startsWith('/p/')) {
    return NextResponse.next();
  }

  // Extract proxy ID from path
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) {
    return NextResponse.json(
      { error: 'Invalid proxy URL' },
      { status: 400 }
    );
  }

  const proxyId = segments[1];

  // Fetch proxy configuration
  const config = await getProxyConfig(proxyId, request);

  if (!config) {
    return NextResponse.json(
      { error: 'Proxy not found' },
      { status: 404 }
    );
  }

  // Extract additional path and query parameters
  const additionalPath = segments.slice(2).join('/');
  const queryString = request.nextUrl.search;

  // Determine if the request is from a bot
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  const isTikTok = isTikTokBot(userAgent, referer);
  const isBot = isTikTok || isGenericBot(userAgent);

  // Choose redirect URL based on bot detection
  const targetUrl = isBot ? config.botUrl : config.realUrl;

  // Build final redirect URL
  let redirectUrl = targetUrl;
  if (additionalPath) {
    redirectUrl += (redirectUrl.endsWith('/') ? '' : '/') + additionalPath;
  }
  if (queryString) {
    redirectUrl += queryString;
  }

  // Perform the redirect
  return NextResponse.redirect(redirectUrl, {
    status: 307, // Temporary redirect
  });
}

export const config = {
  matcher: '/p/:path*',
};
```

---

### Step 6: Test Your Implementation

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Create a test proxy configuration:**
   ```bash
   curl -X POST http://localhost:3000/api/config \
     -H "Content-Type: application/json" \
     -d '{
       "realUrl": "https://example.com",
       "botUrl": "https://decoy.com"
     }'
   ```

3. **Verify the database file was created:**
   ```bash
   ls -la proxy-configs.db
   ```

4. **Test retrieval:**
   Visit the proxy URL returned from step 2 in your browser.

---

### Step 7: Add to .gitignore

**Important:** Don't commit your database file to Git (it contains user data).

Add to `.gitignore`:
```
# Embedded database
*.db
*.db-shm
*.db-wal
```

---

## Alternative Option: LowDB (JSON-based)

If you prefer a **super simple** JSON file-based database (even simpler than SQLite), consider LowDB.

### When to use LowDB:
- 🎯 Very small datasets (< 1,000 records)
- 📝 Human-readable data (JSON format)
- 🚀 Extreme simplicity
- 🧪 Prototyping and testing

### Quick Setup:

```bash
npm install lowdb
```

Create `lib/lowdb-database.ts`:

```typescript
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

interface ProxyConfig {
  id: string;
  real_url: string;
  bot_url: string;
  created_at: number;
}

interface DatabaseSchema {
  proxyConfigs: ProxyConfig[];
}

// Database file path
const DB_PATH = path.join(process.cwd(), 'proxy-configs.json');

// Initialize database
const adapter = new JSONFile<DatabaseSchema>(DB_PATH);
const db = new Low<DatabaseSchema>(adapter, { proxyConfigs: [] });

/**
 * Initialize database
 */
export async function initializeDatabase() {
  await db.read();

  // Set default data if file is empty
  db.data ||= { proxyConfigs: [] };

  await db.write();
  console.log('✅ LowDB initialized successfully');
}

/**
 * Database operations
 */
export const dbOperations = {
  /**
   * Insert a new proxy configuration
   */
  insertProxyConfig: async (config: ProxyConfig) => {
    await db.read();
    db.data.proxyConfigs.push(config);
    await db.write();
  },

  /**
   * Get a proxy configuration by ID
   */
  getProxyConfig: async (id: string): Promise<ProxyConfig | undefined> => {
    await db.read();
    return db.data.proxyConfigs.find(c => c.id === id);
  },

  /**
   * Get all proxy configurations
   */
  getAllProxyConfigs: async (): Promise<ProxyConfig[]> => {
    await db.read();
    return db.data.proxyConfigs.sort((a, b) => b.created_at - a.created_at);
  },

  /**
   * Delete a proxy configuration
   */
  deleteProxyConfig: async (id: string) => {
    await db.read();
    const index = db.data.proxyConfigs.findIndex(c => c.id === id);
    if (index !== -1) {
      db.data.proxyConfigs.splice(index, 1);
      await db.write();
    }
  },
};

// Initialize on module load
initializeDatabase();
```

**Usage is almost identical**, but note that LowDB operations are `async`:

```typescript
// Insert (note the await)
await dbOperations.insertProxyConfig({
  id: proxyId,
  real_url: config.realUrl,
  bot_url: config.botUrl,
  created_at: Date.now(),
});

// Get
const config = await dbOperations.getProxyConfig(id);
```

---

## Migrating from Supabase

### Step-by-Step Migration Plan

1. **Keep Supabase running** (don't break production)
2. **Install SQLite** (`npm install better-sqlite3`)
3. **Create new database module** (`lib/database.ts`)
4. **Create a migration script** to copy data from Supabase to SQLite
5. **Update API routes** one at a time
6. **Test thoroughly** in development
7. **Deploy** when confident
8. **Remove Supabase dependencies** (optional, keep as backup initially)

### Data Migration Script

Create `scripts/migrate-supabase-to-sqlite.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { dbOperations, initializeDatabase } from '../lib/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 Starting migration from Supabase to SQLite...\n');

  try {
    // Initialize SQLite database
    initializeDatabase();

    // Fetch all data from Supabase
    console.log('📥 Fetching data from Supabase...');
    const { data, error } = await supabase
      .from('proxy_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No data found in Supabase');
      return;
    }

    console.log(`✅ Found ${data.length} records\n`);

    // Insert into SQLite
    console.log('💾 Migrating to SQLite...');
    let successCount = 0;
    let errorCount = 0;

    for (const record of data) {
      try {
        dbOperations.insertProxyConfig({
          id: record.id,
          real_url: record.real_url,
          bot_url: record.bot_url,
          created_at: new Date(record.created_at).getTime(),
        });
        successCount++;
        console.log(`  ✓ Migrated: ${record.id}`);
      } catch (err) {
        errorCount++;
        console.error(`  ✗ Failed: ${record.id}`, err);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
```

**Run the migration:**

```bash
npx ts-node scripts/migrate-supabase-to-sqlite.ts
```

---

## Troubleshooting

### Problem: "Cannot find module 'better-sqlite3'"

**Solution:** Make sure you installed the package:
```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

---

### Problem: "Database file not created"

**Solution:** Check file permissions and ensure the directory is writable:
```bash
# Check current directory permissions
ls -la

# Make sure Node.js has write permissions
chmod 755 .
```

---

### Problem: "better-sqlite3 installation fails (node-gyp errors)"

**Solution:** better-sqlite3 is a native module. Ensure you have build tools:

**On macOS:**
```bash
xcode-select --install
```

**On Windows:**
```bash
npm install --global --production windows-build-tools
```

**On Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential python3
```

**Alternative:** Use the `--build-from-source` flag:
```bash
npm install better-sqlite3 --build-from-source
```

---

### Problem: "Database locked" error

**Solution:** SQLite allows multiple readers but only one writer at a time.

```typescript
// Add WAL mode for better concurrency
db.pragma('journal_mode = WAL');
```

---

### Problem: "Module not found in Edge Runtime"

**Solution:** Vercel Edge Runtime doesn't support native Node.js modules like better-sqlite3.

**Options:**
1. Use API routes (Node.js runtime) for database access (recommended)
2. Use Cloudflare D1 or Turso for edge-compatible SQLite
3. Use Vercel KV or Upstash Redis instead

**For this project:** The middleware calls an API route to fetch configs (which is already implemented above).

---

## When NOT to Use Embedded Databases

### ❌ Avoid embedded databases if you need:

1. **Multi-server deployments**
   - Embedded databases are single-file, can't sync across servers
   - Use: PostgreSQL, MySQL, Supabase, PlanetScale

2. **Real-time collaboration**
   - Multiple users need simultaneous write access
   - Use: Firebase, Supabase with real-time subscriptions

3. **Very large datasets (> 100GB)**
   - While SQLite can handle large data, performance degrades
   - Use: PostgreSQL, MySQL, MongoDB

4. **Edge/Serverless functions (AWS Lambda, Vercel Edge)**
   - Ephemeral file systems, no persistent storage
   - Use: Cloud databases, edge-compatible solutions (D1, Turso)

5. **Complex analytics and reporting**
   - Need advanced query optimization, materialized views
   - Use: PostgreSQL, ClickHouse, BigQuery

### ✅ Perfect for:

- Local-first applications
- Desktop applications (Electron, Tauri)
- Mobile apps (React Native)
- Development and testing
- Small-to-medium web apps with single server
- CLI tools
- Static site generators (build-time data)

---

## Summary: What You've Learned

✅ **What embedded databases are** and why they're simpler
✅ **How to install** libraries using npm (no manual file copying!)
✅ **How to create** a database module with TypeScript
✅ **How to perform** CRUD operations (Create, Read, Update, Delete)
✅ **How to integrate** into Next.js API routes
✅ **How to migrate** from cloud databases (Supabase) to embedded databases
✅ **When to use** (and when NOT to use) embedded databases

---

## Additional Resources

### Official Documentation
- **better-sqlite3**: https://github.com/WiseLibs/better-sqlite3
- **SQLite**: https://www.sqlite.org/docs.html
- **LowDB**: https://github.com/typicode/lowdb

### Learning Resources
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Alternative Embedded Databases
- **Turso** (SQLite for the edge): https://turso.tech/
- **Drizzle ORM** (Type-safe ORM for SQLite): https://orm.drizzle.team/
- **PouchDB** (CouchDB-compatible, browser + Node.js): https://pouchdb.com/
- **Realm** (Mobile-first database): https://www.mongodb.com/docs/realm/

---

## Getting More Specific Help

If you need customized guidance for your specific situation, please provide:

1. **Your tech stack** (Next.js, React, Node.js, etc.)
2. **Deployment platform** (Vercel, Netlify, AWS, self-hosted)
3. **Data size expectations** (100 records? 1 million?)
4. **Use case** (web app, mobile, desktop, CLI)

---

**You've got this!** 🚀

Embedded databases remove the complexity of external services while giving you full control over your data. Start with SQLite, experiment with the examples in this guide, and you'll have a working database in minutes, not hours.

---

*Last updated: 2025-11-17*
*Compatible with: Next.js 14+, TypeScript 5+, Node.js 18+*
