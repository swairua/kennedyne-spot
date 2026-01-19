# Supabase Edge Functions

This directory contains serverless functions deployed to Supabase.

## Available Functions

### `run-blog-cta-migration`
**Purpose:** Execute the blog CTA fields migration safely

**File:** `run-blog-cta-migration/index.ts`

**Endpoint:** `POST /functions/v1/run-blog-cta-migration`

**Requirements:**
- User must be authenticated
- Authorization header with valid JWT token

**What it does:**
- Adds `cta_type`, `cta_title`, `cta_url`, `cta_enabled` columns to `blog_posts` table
- Enables custom call-to-action configuration on blog posts

## Deploying Functions

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Deploy to your project
```bash
# Deploy all functions
supabase functions deploy

# Or deploy a specific function
supabase functions deploy run-blog-cta-migration
```

### Deploy to production
```bash
# Set your Supabase project reference
export SUPABASE_PROJECT_ID="your-project-ref"

# Deploy
supabase functions deploy --project-ref=$SUPABASE_PROJECT_ID
```

## Testing Functions Locally

```bash
# Start the local development server
supabase start

# The function will be available at:
# http://localhost:54321/functions/v1/run-blog-cta-migration

# Test with curl
curl -X POST http://localhost:54321/functions/v1/run-blog-cta-migration \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"migration_key":"001_add_blog_cta_fields"}'
```

## Troubleshooting

### Function not found (404)
- Ensure you've run `supabase functions deploy`
- Check that your Supabase project is connected
- The function URL should be: `https://PROJECT_ID.supabase.co/functions/v1/run-blog-cta-migration`

### Permission denied errors
- The function uses `SUPABASE_SERVICE_ROLE_KEY` environment variable
- This is automatically available in deployed Edge Functions
- Ensure the calling user is authenticated

### Migration fails but SQL is correct
- Check Supabase logs: `supabase functions logs run-blog-cta-migration`
- Verify the `exec` or `postgres_query` RPC function exists in your Supabase instance
- As a fallback, use the manual SQL Editor method

## Manual Alternative

If Edge Functions aren't deployed, you can manually run the migration:

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a **New Query**
4. Paste the SQL from `migrations/001_add_blog_cta_fields.sql`
5. Click **Run**

The app will attempt Edge Function first, then guide users to manual method if needed.
