// Import recurring bills from data/recurring-bills.json into Supabase
const SUPABASE_URL = 'https://qqtiofdqplwycnwplmen.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g';
const USER_ID = '8b6aca68-6072-457d-8053-7e81e41bfef3';

async function main() {
  // 1. Sign in
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'matt@firesidecloudsolutions.com', password: 'Fireside2025!' })
  });
  const authData = await authRes.json();
  if (!authData.access_token) { console.error('Auth failed:', authData); return; }
  const token = authData.access_token;
  console.log('✅ Authenticated');

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // 2. Load JSON data
  const fs = require('fs');
  const jsonData = JSON.parse(fs.readFileSync('data/recurring-bills.json', 'utf8'));
  const bills = jsonData.recurring_bills;

  // 3. Fetch existing bills
  const existingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bills?select=*&user_id=eq.${USER_ID}`,
    { headers }
  );
  const existingBills = await existingRes.json();
  console.log(`Found ${existingBills.length} existing bills in DB`);

  // 4. Check if new columns exist by attempting to read them
  let hasNewColumns = false;
  try {
    const testRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bills?select=id,status,is_auto_draft,is_variable,total_amount,end_date,notes,payments_made&limit=1&user_id=eq.${USER_ID}`,
      { headers }
    );
    if (testRes.ok) {
      hasNewColumns = true;
      console.log('✅ New schema columns detected (Architect migration applied)');
    } else {
      console.log('⚠️ New columns not yet available, using basic schema');
    }
  } catch (e) {
    console.log('⚠️ New columns not yet available, using basic schema');
  }

  // 5. Build name-matching map for existing bills
  const existingByName = {};
  for (const bill of existingBills) {
    existingByName[bill.name.toLowerCase()] = bill;
  }

  // Map JSON names to existing DB names
  const nameMap = {
    'water': 'american water',
    'electric': 'west penn power',
    'peoples gas': "people's gas"
  };

  // Assign next due dates for Feb 2026 based on typical billing
  const dueDateMap = {
    'Mortgage': '2026-02-01',
    'BMW Payment': '2026-02-05',
    'BMW 430i': '2026-02-10',
    'Chevy Tahoe': '2026-02-15',
    'HOA Fees': '2026-02-01',
    'Cell Phone': '2026-02-20',
    'Internet': '2026-02-15',
    'Electric': '2026-02-09',
    'Water': '2026-02-02',
    'Sewage': '2026-02-01',
    'Peoples Gas': '2026-02-07',
    'Big Green Egg': '2026-02-10',
    'XGIMI': '2026-02-10',
    'Golf Clubs': '2026-02-10',
    'GLP-1': '2026-02-01',
    'USC Rec': '2026-02-01'
  };

  const toInsert = [];
  const toUpdate = [];
  const skipped = [];

  for (const bill of bills) {
    const jsonNameLower = bill.name.toLowerCase();
    const mappedName = nameMap[jsonNameLower] || jsonNameLower;
    const existingBill = existingByName[mappedName];

    // Build the record
    const record = {
      name: bill.name,
      type: bill.type,
      amount: Math.abs(bill.amount),
      frequency: 'monthly',
      nextDueDate: dueDateMap[bill.name] || '2026-02-01',
      user_id: USER_ID
    };

    // Add new columns if schema supports them
    if (hasNewColumns) {
      record.is_auto_draft = bill.auto_draft || false;
      record.is_variable = bill.is_variable || false;
      record.notes = bill.notes || null;
      record.status = bill.status === 'PAID_OFF' ? 'paid_off' : 'active';
      
      if (bill.is_finite) {
        // For financing items, set total_amount estimates
        if (bill.name === 'Golf Clubs') {
          record.total_amount = 2501.04; // ~12 months of $208.42
          record.payments_made = 12;
          record.end_date = '2025-12-01';
        } else if (bill.name === 'Big Green Egg') {
          record.total_amount = 7788.48; // ~24 months of $324.52
          record.payments_made = 8;
        } else if (bill.name === 'XGIMI') {
          record.total_amount = 1636.32; // ~12 months of $136.36
          record.payments_made = 10;
        } else if (bill.name === 'BMW Payment') {
          record.total_amount = 92040; // ~60 months of $1534
          record.payments_made = 24;
        } else if (bill.name === 'BMW 430i') {
          record.total_amount = 24660; // ~60 months of $411
          record.payments_made = 24;
        } else if (bill.name === 'Chevy Tahoe') {
          record.total_amount = 45855.36; // ~72 months of $636.88
          record.payments_made = 12;
        }
      }
    }

    if (existingBill) {
      // Check if this is one of the specific "do not duplicate" entries
      if (mappedName === 'american water' || mappedName === 'west penn power') {
        skipped.push({ name: bill.name, reason: `Already exists as "${existingBill.name}"` });
        continue;
      }
      // For other matches, update the existing record
      toUpdate.push({ id: existingBill.id, record });
    } else {
      toInsert.push(record);
    }
  }

  console.log(`\n📊 Import Plan:`);
  console.log(`   Insert: ${toInsert.length} new bills`);
  console.log(`   Update: ${toUpdate.length} existing bills`);
  console.log(`   Skip: ${skipped.length} (already exist)`);
  skipped.forEach(s => console.log(`     → ${s.name}: ${s.reason}`));

  // 6. Execute inserts
  if (toInsert.length > 0) {
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/bills`, {
      method: 'POST',
      headers,
      body: JSON.stringify(toInsert)
    });
    if (insertRes.ok) {
      const inserted = await insertRes.json();
      console.log(`\n✅ Inserted ${inserted.length} bills:`);
      inserted.forEach(b => console.log(`   + ${b.name} (${b.type}) - $${b.amount}`));
    } else {
      const err = await insertRes.text();
      console.error('❌ Insert failed:', err);
      
      // Fallback: try without new columns
      if (hasNewColumns) {
        console.log('Retrying with basic columns only...');
        const basicInserts = toInsert.map(r => ({
          name: r.name, type: r.type, amount: r.amount,
          frequency: r.frequency, nextDueDate: r.nextDueDate, user_id: r.user_id
        }));
        const retryRes = await fetch(`${SUPABASE_URL}/rest/v1/bills`, {
          method: 'POST',
          headers,
          body: JSON.stringify(basicInserts)
        });
        if (retryRes.ok) {
          const inserted = await retryRes.json();
          console.log(`✅ Inserted ${inserted.length} bills (basic columns)`);
        } else {
          console.error('❌ Retry also failed:', await retryRes.text());
        }
      }
    }
  }

  // 7. Execute updates
  for (const { id, record } of toUpdate) {
    delete record.user_id; // Don't update user_id
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/bills?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(record)
    });
    if (updateRes.ok) {
      console.log(`✅ Updated: ${record.name}`);
    } else {
      const err = await updateRes.text();
      console.error(`❌ Update failed for ${record.name}:`, err);
      
      // Fallback to basic columns
      const basicUpdate = {
        name: record.name, type: record.type, amount: record.amount,
        frequency: record.frequency, nextDueDate: record.nextDueDate
      };
      const retryRes = await fetch(`${SUPABASE_URL}/rest/v1/bills?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(basicUpdate)
      });
      if (retryRes.ok) {
        console.log(`✅ Updated (basic): ${record.name}`);
      }
    }
  }

  // 8. Verify final state
  const finalRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bills?select=name,type,amount,frequency,nextDueDate&user_id=eq.${USER_ID}&order=name`,
    { headers }
  );
  const finalBills = await finalRes.json();
  console.log(`\n📋 Final bills table (${finalBills.length} rows):`);
  finalBills.forEach(b => console.log(`   ${b.name.padEnd(20)} ${(b.type || '').padEnd(15)} $${String(b.amount).padStart(8)} ${b.frequency.padEnd(10)} ${b.nextDueDate}`));
}

main().catch(console.error);
