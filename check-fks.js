const { Client } = require('./app/node_modules/pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres:HUVa66E_7nLk%2B_L@db.qqtiofdqplwycnwplmen.supabase.co:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});

(async () => {
  await client.connect();
  
  // Get all foreign key constraints for connections and bill_shares tables
  const fks = await client.query(`
    SELECT 
      tc.table_name, 
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('connections', 'bill_shares')
    ORDER BY tc.table_name, tc.constraint_name
  `);
  
  console.log('Foreign Key Constraints:');
  console.log('========================');
  fks.rows.forEach(r => {
    console.log(`  ${r.table_name}.${r.column_name} → ${r.foreign_table_name}.${r.foreign_column_name}  [FK: ${r.constraint_name}]`);
  });

  await client.end();
})();
