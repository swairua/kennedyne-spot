import { supabase } from '@/integrations/supabase/client';

// Supabase URL for Edge Function calls
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dbtyzloscmhaskjlbyvl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Migration SQL content (embedded)
const MIGRATIONS: Record<string, string> = {
  '001_add_blog_cta_fields': `
-- Add CTA columns to blog_posts table if they don't exist
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS cta_type VARCHAR(20) DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS cta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS cta_url TEXT,
ADD COLUMN IF NOT EXISTS cta_enabled BOOLEAN DEFAULT true;

-- Add comments for clarity
COMMENT ON COLUMN blog_posts.cta_type IS 'Type of CTA: whatsapp, link, email, phone (default: whatsapp)';
COMMENT ON COLUMN blog_posts.cta_title IS 'Button text for the CTA (e.g., "Contact on WhatsApp")';
COMMENT ON COLUMN blog_posts.cta_url IS 'URL or phone number for the CTA destination';
COMMENT ON COLUMN blog_posts.cta_enabled IS 'Whether to show the CTA on this post (default: true)';
  `
};

export interface MigrationResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Run a migration using Supabase RPC function
 * Falls back to manual instructions if RPC fails
 */
export async function runMigration(migrationKey: string): Promise<MigrationResult> {
  try {
    const sql = MIGRATIONS[migrationKey];

    if (!sql) {
      return {
        success: false,
        message: `Migration not found: ${migrationKey}`,
        error: `Migration not found: ${migrationKey}`
      };
    }

    // Try using the exec function (if it exists)
    try {
      const { error, data } = await supabase.rpc('exec', {
        sql_query: sql
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      return {
        success: true,
        message: 'Migration executed successfully! CTA fields have been added to blog posts.'
      };
    } catch (rpcError: any) {
      console.error('RPC Error Details:', rpcError);

      // Extract error message safely
      const errorMessage = extractErrorMessage(rpcError);

      // Check if it's specifically a function not found error
      const isUnknownFunction =
        errorMessage?.includes('Unknown function') ||
        errorMessage?.includes('does not exist') ||
        errorMessage?.includes('42883') ||
        rpcError?.status === 404;

      if (isUnknownFunction) {
        return {
          success: false,
          message: 'ℹ️ RPC function not available. Use the "Copy SQL" button to manually run it in Supabase SQL Editor.',
          error: 'RPC not configured'
        };
      }

      // For any other RPC error
      return {
        success: false,
        message: '⚠️ RPC execution failed. Use the "Copy SQL" button to manually run it in Supabase SQL Editor instead.',
        error: errorMessage || 'RPC execution failed'
      };
    }
  } catch (err: any) {
    console.error('Migration error:', err);
    const errorMessage = extractErrorMessage(err);
    return {
      success: false,
      message: '⚠️ Migration failed. Use the "Copy SQL" button to run it manually in Supabase SQL Editor.',
      error: errorMessage || 'Unknown error occurred'
    };
  }
}

/**
 * Helper function to safely extract error message from various error object structures
 */
function extractErrorMessage(error: any): string {
  if (!error) return '';

  // If it's a string, return it
  if (typeof error === 'string') return error;

  // Try common error object properties
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  if (error.msg) return error.msg;
  if (error.hint) return error.hint;
  if (error.details) return error.details;

  // If it's a Supabase error object, check its structure
  if (error.status && error.code) {
    return `Error ${error.status}: ${error.code}`;
  }

  // Last resort: try to stringify and clean it up
  const str = String(error);
  if (str !== '[object Object]') return str;

  return '';
}

/**
 * Get migration SQL for display/copy
 */
export function getMigrationSQL(migrationKey: string): string | null {
  return MIGRATIONS[migrationKey] || null;
}

/**
 * List all available migrations
 */
export function listMigrations(): string[] {
  return Object.keys(MIGRATIONS);
}
