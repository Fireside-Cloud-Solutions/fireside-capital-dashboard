/**
 * Deploy Database Constraints Migration
 * Executes 003_add_data_validation_constraints.sql against Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployMigration() {
  console.log('🚀 Deploying database constraints migration...\n');

  // Read migration file (v2 - without enum constraints)
  const migrationPath = path.join(__dirname, 'Supabase', '003_add_data_validation_constraints_v2.sql');
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
    console.log('📝 Applying constraints...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify constraints were added
    console.log('🔍 Verifying constraints...');
    const verifyQuery = `
      SELECT 
        conname AS constraint_name,
        conrelid::regclass AS table_name
      FROM pg_constraint 
      WHERE conname LIKE '%_non_negative' 
         OR conname LIKE '%_valid' 
         OR conname LIKE '%_not_future'
         OR conname LIKE '%_positive'
         OR conname LIKE '%_reasonable'
      ORDER BY conrelid::regclass, conname;
    `;
    
    const result = await client.query(verifyQuery);
    console.log(`✅ ${result.rows.length} constraints added:\n`);
    
    // Group by table
    const byTable = {};
    result.rows.forEach(row => {
      const table = row.table_name;
      if (!byTable[table]) byTable[table] = [];
      byTable[table].push(row.constraint_name);
    });

    Object.keys(byTable).sort().forEach(table => {
      console.log(`  ${table}: ${byTable[table].length} constraints`);
    });

    console.log('\n🎉 Deployment complete!\n');

    // Test a constraint (should fail)
    console.log('🧪 Testing constraint enforcement...');
    try {
      await client.query(`
        INSERT INTO public.bills (user_id, name, amount) 
        VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Bill', -10)
      `);
      console.log('❌ ERROR: Negative amount was allowed (constraint not working)');
    } catch (err) {
      if (err.message.includes('bills_amount_non_negative')) {
        console.log('✅ Test passed: Negative amount blocked by constraint\n');
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
