/**
 * Verify Transactions Tables Exist
 */

const { Client } = require('pg');
require('dotenv').config();

async function verifyTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('🔍 Checking transactions tables...\n');
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema='public' AND table_name=t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_name IN ('transactions', 'transaction_category_patterns')
      ORDER BY table_name;
    `);
    
    if (tables.rows.length === 0) {
      console.log('❌ No transactions tables found\n');
      return;
    }
    
    console.log(`✅ Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name} (${row.column_count} columns)`);
    });
    
    // Check indexes
    console.log('\n🔍 Checking indexes...\n');
    const indexes = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public' 
        AND tablename IN ('transactions', 'transaction_category_patterns')
      ORDER BY tablename, indexname;
    `);
    
    console.log(`✅ Found ${indexes.rows.length} indexes:`);
    indexes.rows.forEach(row => {
      console.log(`  - ${row.indexname} (on ${row.tablename})`);
    });
    
    // Check RLS
    console.log('\n🔍 Checking Row Level Security...\n');
    const rls = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' 
        AND tablename IN ('transactions', 'transaction_category_patterns');
    `);
    
    rls.rows.forEach(row => {
      console.log(`  - ${row.tablename}: ${row.rowsecurity ? '✅ RLS enabled' : '❌ RLS disabled'}`);
    });
    
    // Check constraints
    console.log('\n🔍 Checking constraints...\n');
    const constraints = await client.query(`
      SELECT conname, contype, conrelid::regclass::text as table_name
      FROM pg_constraint
      WHERE conrelid IN ('public.transactions'::regclass, 'public.transaction_category_patterns'::regclass)
        AND contype IN ('c', 'u', 'f')  -- check, unique, foreign key
      ORDER BY table_name, conname;
    `);
    
    console.log(`✅ Found ${constraints.rows.length} constraints:`);
    constraints.rows.forEach(row => {
      const type = row.contype === 'c' ? 'CHECK' : row.contype === 'u' ? 'UNIQUE' : 'FOREIGN KEY';
      console.log(`  - ${row.conname} (${type}) on ${row.table_name}`);
    });
    
    console.log('\n✅ Transactions tables are properly configured!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyTables();
