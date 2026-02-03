/**
 * Check existing asset types in database
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkAssetTypes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('🔍 Checking existing asset types...\n');
    
    const result = await client.query(`
      SELECT DISTINCT type, COUNT(*) as count 
      FROM public.assets 
      GROUP BY type 
      ORDER BY count DESC;
    `);
    
    console.log('Found asset types:');
    result.rows.forEach(row => {
      console.log(`  - "${row.type}": ${row.count} records`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAssetTypes();
