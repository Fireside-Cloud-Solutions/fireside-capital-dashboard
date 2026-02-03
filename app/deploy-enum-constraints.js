/**
 * Deploy Enum Constraints Migration
 * Executes 004_add_enum_constraints.sql against Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployMigration() {
  console.log('🚀 Deploying enum constraints migration...\n');

  // Read migration file
  const migrationPath = path.join(__dirname, 'Supabase', '004_add_enum_constraints.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Connect to database
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database\n');

    // Execute migration
    console.log('📝 Applying enum constraints...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify constraints were added
    console.log('🔍 Verifying constraints...');
    const verifyQuery = `
      SELECT 
        conname AS constraint_name,
        conrelid::regclass AS table_name
      FROM pg_constraint 
      WHERE conname LIKE '%_type_valid' 
         OR conname LIKE '%_frequency_valid'
         OR conname LIKE '%_item_type_valid'
      ORDER BY conrelid::regclass, conname;
    `;
    
    const result = await client.query(verifyQuery);
    console.log(`✅ ${result.rows.length} enum constraints added:\n`);
    
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}: ${row.constraint_name}`);
    });

    console.log('\n🎉 Deployment complete!\n');

    // Test a constraint (should fail)
    console.log('🧪 Testing constraint enforcement...');
    try {
      await client.query(`
        INSERT INTO public.bills (user_id, name, type) 
        VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Bill', 'INVALID')
      `);
      console.log('❌ ERROR: Invalid type was allowed (constraint not working)');
    } catch (err) {
      if (err.message.includes('bills_type_valid')) {
        console.log('✅ Test passed: Invalid type blocked by constraint\n');
      } else {
        console.log(`⚠️ Unexpected error: ${err.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deployMigration();
