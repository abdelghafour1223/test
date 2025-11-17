import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

/**
 * Proxy configuration interface
 */
interface ProxyConfig {
  realUrl: string;
  botUrl: string;
  createdAt: number;
}

/**
 * API response for successful config creation
 */
interface ConfigResponse {
  success: boolean;
  proxyId: string;
  proxyUrl: string;
  config: ProxyConfig;
}

/**
 * API error response
 */
interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generates the full proxy URL
 */
function generateProxyUrl(proxyId: string, request: NextApiRequest): string {
  // Try to determine the deployment URL
  const host = request.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';

  // If running on Vercel, use VERCEL_URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}/p/${proxyId}`;
  }

  return `${protocol}://${host}/p/${proxyId}`;
}

/**
 * POST /api/config
 * Creates a new proxy configuration
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse | ErrorResponse>
) {
  try {
    const { realUrl, botUrl } = req.body;

    // Validate required fields
    if (!realUrl || !botUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: 'Both realUrl and botUrl are required',
      });
    }

    // Validate URL formats
    if (!isValidUrl(realUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        details: 'realUrl must be a valid HTTP or HTTPS URL',
      });
    }

    if (!isValidUrl(botUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        details: 'botUrl must be a valid HTTP or HTTPS URL',
      });
    }

    // Generate unique proxy ID (21 characters, URL-safe)
    const proxyId = nanoid();

    // Create configuration object
    const config: ProxyConfig = {
      realUrl: realUrl.trim(),
      botUrl: botUrl.trim(),
      createdAt: Date.now(),
    };

    // Store in Vercel KV with pattern: proxy:{proxyId}
    await kv.set(`proxy:${proxyId}`, config);

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

/**
 * GET /api/config
 * Lists all proxy configurations (optional feature)
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // This is an optional feature to list all proxies
    // For simplicity, we'll return a message indicating this is not implemented
    // In production, you could scan KV keys and return all configs

    return res.status(200).json({
      success: true,
      message: 'To retrieve a specific config, use GET /api/config/[proxyId]',
    });

  } catch (error) {
    console.error('Error listing configs:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to list configurations',
    });
  }
}

/**
 * Main API route handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers (if needed for your use case)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Accept'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route to appropriate handler
  switch (req.method) {
    case 'POST':
      return handlePost(req, res);

    case 'GET':
      return handleGet(req, res);

    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        details: `Method ${req.method} is not supported`,
      });
  }
}
