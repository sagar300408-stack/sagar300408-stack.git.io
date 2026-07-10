// apply_migration.mjs
// Applies 005_bootstrap_rpc.sql directly to the live Supabase project
// using the pg REST query endpoint.
//
// Usage: node apply_migration.mjs <SERVICE_ROLE_KEY>
//
// Get your service role key from:
// Supabase Dashboard → Project Settings → API → service_role (secret)

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://rwsmafafptupucthrjwx.supabase.co';
const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌  Usage: node apply_migration.mjs <SERVICE_ROLE_KEY>');
  console.error('   Get it from: Supabase Dashboard → Project Settings → API → service_role\n');
  process.exit(1);
}

const sqlPath = path.join(__dirname, 'supabase', 'migrations', '005_bootstrap_rpc.sql');
const sql = readFileSync(sqlPath, 'utf8');

console.log('\n🚀  Applying migration 005_bootstrap_rpc.sql to live database...\n');

// Use the pg REST query endpoint (available on all Supabase projects)
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

// The Supabase REST API doesn't have a /query endpoint on the anon role.
// We need to use the pg connection directly, which requires the Supabase
// Management API. Let's use that instead.

const MGMT_URL = `https://api.supabase.com/v1/projects/rwsmafafptupucthrjwx/database/query`;

console.log('📡  Using Supabase Management API...\n');

const mgmtResponse = await fetch(MGMT_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await mgmtResponse.text();
console.log(`HTTP ${mgmtResponse.status}: ${mgmtResponse.statusText}`);

let result;
try { result = JSON.parse(text); } catch { result = text; }

if (mgmtResponse.ok) {
  console.log('\n✅  Migration applied successfully!\n');
  console.log(JSON.stringify(result, null, 2));
} else {
  console.error('\n❌  Migration failed:');
  console.error(JSON.stringify(result, null, 2));
  console.error('\n💡  The Management API requires a personal access token, not the service_role key.');
  console.error('   Get it from: https://supabase.com/dashboard/account/tokens\n');
  process.exit(1);
}

// Verify the functions exist
console.log('\n🔍  Verifying functions exist in pg_proc...\n');

const verifyResponse = await fetch(MGMT_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      SELECT proname, pronargs, prosecdef
      FROM pg_proc
      WHERE proname IN ('get_system_status', 'initialize_cms')
      ORDER BY proname;
    `
  }),
});

const verifyText = await verifyResponse.text();
let verifyResult;
try { verifyResult = JSON.parse(verifyText); } catch { verifyResult = verifyText; }

if (verifyResponse.ok) {
  console.log('Functions found in pg_proc:');
  console.table(verifyResult);
} else {
  console.error('Verification failed:', verifyResult);
}
