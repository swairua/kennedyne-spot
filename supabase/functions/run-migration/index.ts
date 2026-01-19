import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of allowed migrations
const ALLOWED_MIGRATIONS = [
  '001_add_blog_cta_fields.sql'
]

// SQL migration contents (embedded for security)
const MIGRATIONS: Record<string, string> = {
  '001_add_blog_cta_fields.sql': `
    ALTER TABLE blog_posts
    ADD COLUMN IF NOT EXISTS cta_type VARCHAR(20) DEFAULT 'whatsapp',
    ADD COLUMN IF NOT EXISTS cta_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cta_url TEXT,
    ADD COLUMN IF NOT EXISTS cta_enabled BOOLEAN DEFAULT true;

    ALTER TABLE blog_posts
    ADD CONSTRAINT valid_cta_type CHECK (cta_type IN ('whatsapp', 'link', 'email', 'phone'));

    COMMENT ON COLUMN blog_posts.cta_type IS 'Type of CTA: whatsapp, link, email, phone (default: whatsapp)';
    COMMENT ON COLUMN blog_posts.cta_title IS 'Button text for the CTA (e.g., "Contact on WhatsApp")';
    COMMENT ON COLUMN blog_posts.cta_url IS 'URL or phone number for the CTA destination';
    COMMENT ON COLUMN blog_posts.cta_enabled IS 'Whether to show the CTA on this post (default: true)';
  `
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { migration_name } = await req.json()

    if (!migration_name) {
      return new Response(
        JSON.stringify({ error: 'migration_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if migration is allowed
    if (!ALLOWED_MIGRATIONS.includes(migration_name)) {
      return new Response(
        JSON.stringify({ error: 'Migration not found or not allowed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get migration SQL
    const sql = MIGRATIONS[migration_name]

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )

    // Execute the migration
    const { error } = await supabaseAdmin.rpc('exec', {
      sql_query: sql
    }).catch(() => {
      // Fallback: If RPC doesn't exist, we'll need manual execution
      // For now, we return an error
      return { error: { message: 'Database execution not configured' } }
    })

    if (error) {
      console.error('Migration error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Migration failed',
          details: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Migration ${migration_name} executed successfully`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Function error:', err)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: err.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
