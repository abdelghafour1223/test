import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Database Schema
 *
 * Table: proxy_configs
 * - id: text (primary key, the proxy ID from nanoid)
 * - real_url: text (URL for legitimate users)
 * - bot_url: text (URL for detected bots)
 * - created_at: timestamp (when the config was created)
 */

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Supabase client singleton
 * Used for all database operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable session persistence for serverless
  },
});

/**
 * ProxyConfig type matching the database schema
 */
export interface ProxyConfig {
  id: string;
  real_url: string;
  bot_url: string;
  created_at: string;
}
