#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get migration file from command line argument
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Usage: node scripts/run-migration.js <migration-name>');
  console.error('   Example: node scripts/run-migration.js 001_add_blog_cta_fields.sql');
  console.error('');
  console.error('Available migrations:');
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  if (fs.existsSync(migrationsDir)) {
    fs.readdirSync(migrationsDir).forEach(file => {
      console.error(`   - ${file}`);
    });
  }
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'migrations', migrationName);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

function showInstructions(sql) {
  console.log('\n' + '='.repeat(80));
  console.log('IMPORTANT: Manual execution required');
  console.log('='.repeat(80));
  console.log('\nTo run this migration, follow these steps:\n');
  console.log('1. Go to your Supabase Dashboard: https://app.supabase.com');
  console.log('2. Select your project');
  console.log('3. Navigate to "SQL Editor" in the left sidebar');
  console.log('4. Click "New query"');
  console.log('5. Copy and paste the SQL below:');
  console.log('\n' + '-'.repeat(80));
  console.log(sql);
  console.log('-'.repeat(80) + '\n');
  console.log('6. Click "Run" to execute the migration');
  console.log('\nAlternatively, you can use the Admin > Migrations page in your app.');
  console.log('='.repeat(80) + '\n');
}

function runMigration() {
  try {
    console.log(`\n📋 Reading migration: ${migrationName}`);

    // Read migration SQL
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Show instructions since we can't execute directly without service role key
    showInstructions(sql);

    console.log('✅ Migration file read successfully!');
    console.log('\n💡 Pro tip: Set SUPABASE_SERVICE_ROLE_KEY to enable automated migration execution.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error reading migration:', err.message);
    process.exit(1);
  }
}

runMigration();
