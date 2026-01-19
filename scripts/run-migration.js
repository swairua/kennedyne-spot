#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dbtyzloscmhaskjlbyvl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   This is a sensitive key. Use it only for migrations in secure environments.');
  process.exit(1);
}

// Get migration file from command line argument
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Usage: node scripts/run-migration.js <migration-name>');
  console.error('   Example: node scripts/run-migration.js 001_add_blog_cta_fields.sql');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'migrations', migrationName);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

async function runMigration() {
  try {
    console.log(`🚀 Running migration: ${migrationName}`);
    
    // Create Supabase admin client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // Read migration SQL
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error running migration:', err.message);
    process.exit(1);
  }
}

runMigration();
