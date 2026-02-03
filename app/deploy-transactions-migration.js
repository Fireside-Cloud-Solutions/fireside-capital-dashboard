/**
 * Deploy Transactions Migration
 * Executes 005_create_transactions_table.sql against Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployMigration() {
  console.log('🚀 Deploying transactions migration...\n');

  const migrationPath = path.join(__dirname, 'migrations', '005_create_transactions_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database\n');

    console.log('📝 Creating transactions tables...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const verifyQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_name IN ('transactions', 'transaction_category_patterns')
      ORDER BY table_name;
    `;
    
    const result = await client.query(verifyQuery);
    console.log(`✅ ${result.rows.length} tables created:\n`);
    
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verify indexes
    console.log('\n🔍 Verifying indexes...');
    const indexQuery = `
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public' 
        AND tablename IN ('transactions', 'transaction_category_patterns')
      ORDER BY indexname;
    `;
    
    const indexes = await client.query(indexQuery);
    console.log(`✅ ${indexes.rows.length} indexes created\n`);

    console.log('🎉 Deployment complete!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deployMigration();
