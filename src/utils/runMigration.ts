import { supabase } from '@/integrations/supabase/client';

// Migration SQL content (embedded)
const MIGRATIONS: Record<string, string> = {
  '001_add_blog_cta_fields': `
-- Add CTA columns to blog_posts table if they don't exist
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS cta_type VARCHAR(20) DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS cta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS cta_url TEXT,
ADD COLUMN IF NOT EXISTS cta_enabled BOOLEAN DEFAULT true;

-- Add constraints
ALTER TABLE blog_posts
ADD CONSTRAINT valid_cta_type CHECK (cta_type IN ('whatsapp', 'link', 'email', 'phone'));

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

      // Check if it's specifically a function not found error
      const isUnknownFunction =
        rpcError?.message?.includes('Unknown function') ||
        rpcError?.code === '42883' ||
        rpcError?.message?.includes('does not exist') ||
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
        message: '⚠️ Migration via RPC failed. Click "Copy SQL" to run it manually in Supabase SQL Editor.',
        error: `${rpcError?.message || 'RPC execution failed'}`
      };
    }
  } catch (err: any) {
    console.error('Migration error:', err);
    return {
      success: false,
      message: '⚠️ Migration failed. Use the "Copy SQL" button to run it manually in Supabase SQL Editor.',
      error: err?.message || 'Unknown error occurred'
    };
  }
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
