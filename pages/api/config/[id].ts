import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

/**
 * Proxy configuration interface
 */
interface ProxyConfig {
  realUrl: string;
  botUrl: string;
  createdAt: number;
}

/**
 * API response for config retrieval
 */
interface GetConfigResponse {
  success: boolean;
  proxyId: string;
  config: ProxyConfig | null;
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
 * GET /api/config/[id]
 * Retrieves a specific proxy configuration
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetConfigResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      details: 'Only GET requests are supported',
    });
  }

  try {
    const { id } = req.query;

    // Validate proxy ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid proxy ID',
        details: 'Proxy ID must be provided in the URL',
      });
    }

    // Fetch configuration from Vercel KV
    const config = await kv.get<ProxyConfig>(`proxy:${id}`);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Proxy configuration not found',
        details: `No configuration found for proxy ID: ${id}`,
      });
    }

    // Return configuration (Note: In production, you might want to add
    // authentication to prevent unauthorized access to configurations)
    return res.status(200).json({
      success: true,
      proxyId: id,
      config,
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
