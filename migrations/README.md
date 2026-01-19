# Database Migrations

This directory contains SQL migrations for the project. Migrations are used to track and apply schema changes to the Supabase database.

## Available Migrations

### 001_add_blog_cta_fields.sql
**Description:** Add CTA (Call-to-Action) fields to blog posts

**Changes:**
- Adds `cta_type` (varchar) - Type of CTA: 'whatsapp', 'link', 'email', 'phone'
- Adds `cta_title` (varchar) - Button text for the CTA
- Adds `cta_url` (text) - URL or phone number for the CTA
- Adds `cta_enabled` (boolean) - Whether to show the CTA

**Status:** Pending (not yet applied)

## How to Run Migrations

### Method 1: Supabase SQL Editor (Recommended)

The safest way to run migrations:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **"New query"**
5. Open the migration file (e.g., `001_add_blog_cta_fields.sql`) and copy its contents
6. Paste the SQL into the query editor
7. Review the SQL carefully
8. Click **"Run"** to execute

### Method 2: Using the CLI Script

```bash
# This will display the migration SQL with instructions
node scripts/run-migration.js 001_add_blog_cta_fields.sql
```

Then follow the on-screen instructions to paste the SQL into Supabase.

### Method 3: Admin Dashboard

1. Open your app and go to **Admin > Migrations**
2. Find the migration you want to run
3. Click **"Copy SQL"** to copy to clipboard
4. Paste it in Supabase SQL Editor and run

## Migration Naming Convention

Migrations follow this naming pattern:

```
{SEQUENCE}_{DESCRIPTION}.sql
```

Example:
- `001_add_blog_cta_fields.sql`
- `002_add_user_preferences.sql`
- `003_create_blog_archives_table.sql`

## Important Notes

⚠️ **Always:**
- Test migrations in a development environment first
- Back up your database before running migrations in production
- Review the SQL carefully before execution
- Keep migration files immutable (don't edit them after creation)
- Document what each migration does

## Troubleshooting

### Migration fails due to constraint

Check if the column already exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'blog_posts' AND column_name = 'cta_type';
```

The migrations use `IF NOT EXISTS` clauses to prevent errors if columns already exist.

### Want to undo a migration?

Create a new migration to reverse the changes (don't delete the original).

Example: `002_remove_blog_cta_fields.sql`

```sql
ALTER TABLE blog_posts
DROP COLUMN IF EXISTS cta_type,
DROP COLUMN IF EXISTS cta_title,
DROP COLUMN IF EXISTS cta_url,
DROP COLUMN IF EXISTS cta_enabled;
```

## Creating New Migrations

1. Create a new SQL file in this directory
2. Follow the naming convention
3. Add `IF NOT EXISTS` or `IF EXISTS` clauses to make migrations idempotent
4. Document the migration in this README
5. Update the migrations list in `src/pages/AdminMigrations.tsx`
6. Test in development first

Example:
```sql
-- Migration: Add example field
-- Description: Adds an example column to a table
-- Created: 2025-01-19

ALTER TABLE your_table
ADD COLUMN IF NOT EXISTS new_column TEXT;

COMMENT ON COLUMN your_table.new_column IS 'Description of the new column';
```

## Database Version Info

- PostgreSQL: Version 13.0.4 (via Supabase)
- Supabase: Latest stable release
- ORM: Not currently used (direct SQL)
