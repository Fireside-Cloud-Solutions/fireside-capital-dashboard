/**
 * Deploy Onboarding Columns Migration
 * Adds onboarding_completed and tour_completed to settings table
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployMigration() {
  console.log('🚀 Deploying onboarding migration...\n');

  const migrationPath = path.join(__dirname, 'migrations', '001_add_onboarding_columns.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database\n');

    console.log('📝 Adding onboarding columns to settings table...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify columns were added
    console.log('🔍 Verifying columns...');
    const verifyQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'settings' 
        AND column_name IN ('onboarding_completed', 'tour_completed')
      ORDER BY column_name;
    `;
    
    const result = await client.query(verifyQuery);
    console.log(`✅ ${result.rows.length} columns added:\n`);
    
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n🎉 Deployment complete!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deployMigration();
