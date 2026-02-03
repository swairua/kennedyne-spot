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
 * Run a migration using Supabase Edge Function
 * This is more reliable than RPC as it's deployed serverless
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

    // Get the session for auth header
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: '🔐 You must be logged in to run migrations.',
        error: 'Not authenticated'
      };
    }

    // Call the Edge Function
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/run-blog-cta-migration`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'x-client-info': 'supabase-js-web'
          },
          body: JSON.stringify({
            migration_key: migrationKey
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData);

        return {
          success: false,
          message: '⚠️ Edge Function failed. Use the "Copy SQL" button to manually run it in Supabase SQL Editor.',
          error: errorMessage || `HTTP ${response.status}`
        };
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          message: '✅ Migration executed successfully! CTA fields have been added to blog posts.'
        };
      } else {
        return {
          success: false,
          message: '⚠️ Migration execution failed. Use the "Copy SQL" button to manually run it in Supabase SQL Editor.',
          error: result.error || 'Migration failed'
        };
      }
    } catch (fetchError: any) {
      console.error('Edge Function call error:', fetchError);

      // Check if it's a network or Edge Function not deployed error
      if (fetchError.message?.includes('fetch') || fetchError.message?.includes('Failed to fetch')) {
        return {
          success: false,
          message: '📌 Edge Function not deployed yet. Use the "Copy SQL" button to manually run it in Supabase SQL Editor.',
          error: 'Edge Function not available'
        };
      }

      return {
        success: false,
        message: '⚠️ Migration request failed. Use the "Copy SQL" button to manually run it in Supabase SQL Editor.',
        error: fetchError.message || 'Request failed'
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
