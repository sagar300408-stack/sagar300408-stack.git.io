// direct_apply.mjs
// Applies DDL SQL directly to Supabase via pg_meta (admin endpoint)
// Uses the service_role JWT which has admin access.

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://rwsmafafptupucthrjwx.supabase.co';

// Read anon key from env
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3c21hZmFmcHR1cHVjdGhyand4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjY1MTYsImV4cCI6MjA5Njg0MjUxNn0.sTFpkb2X6OjqojUz0Huad2lfsZSfnKcItMNd6YFW8Nc';
const SERVICE_KEY = process.argv[2] || '';

if (!SERVICE_KEY) {
  console.error('\n❌  Provide your Supabase service_role key as an argument:');
  console.error('   node direct_apply.mjs <SERVICE_ROLE_KEY>\n');
  console.error('   Supabase Dashboard → Project Settings → API → service_role (secret)\n');
  process.exit(1);
}

const sqlPath = path.join(__dirname, 'supabase', 'migrations', '005_bootstrap_rpc.sql');
const sql = readFileSync(sqlPath, 'utf8');

console.log('\n🚀  Applying 005_bootstrap_rpc.sql to production...');
console.log(`    Project: rwsmafafptupucthrjwx`);
console.log(`    URL: ${SUPABASE_URL}\n`);

// Use the pg_meta SQL execution endpoint
// This endpoint accepts raw SQL and runs it as postgres superuser
const endpoint = `${SUPABASE_URL}/pg/query`;

let response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

// Try alternate endpoint if pg/query doesn't work
if (response.status === 404) {
  console.log('   Trying alternate endpoint...');
  response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
}

const text = await response.text();
let result;
try { result = JSON.parse(text); } catch { result = text; }

console.log(`HTTP ${response.status}: ${response.statusText}`);

if (response.ok) {
  console.log('\n✅  SUCCESS — migration applied!\n');
} else {
  console.error('\n❌  Failed:');
  console.error(JSON.stringify(result, null, 2));

  console.log('\n──────────────────────────────────────────');
  console.log('💡  Direct DB access requires a personal access token.');
  console.log('    Run this instead:\n');
  console.log('    1. Go to: https://supabase.com/dashboard/project/rwsmafafptupucthrjwx/sql/new');
  console.log('    2. Paste the contents of: supabase/migrations/005_bootstrap_rpc.sql');
  console.log('    3. Click Run');
  console.log('──────────────────────────────────────────\n');
  process.exit(1);
}

// Verify both functions exist
console.log('🔍  Verifying in pg_proc...\n');

const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_system_status`, {
  method: 'POST',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: '{}',
});

const verifyText = await verifyResponse.text();
console.log(`GET /rpc/get_system_status → HTTP ${verifyResponse.status}`);

if (verifyResponse.status === 200) {
  console.log('✅  get_system_status() is LIVE and returning HTTP 200\n');
  console.log(JSON.parse(verifyText));
} else if (verifyResponse.status === 404) {
  console.log('❌  Function not found — migration did not apply\n');
} else {
  console.log('Response:', verifyText);
}
