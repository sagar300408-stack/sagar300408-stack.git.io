/**
 * Safe Authentication-Only Test for Originyx Multi-Tenant Verification
 * 
 * Verifies:
 * 1. Independent authentication of User A and User B via Supabase Auth
 * 2. Email confirmation status
 * 3. Organization membership discovery via user_roles
 * 4. Tenant distinctness (Org A != Org B)
 * 5. Production safety (Neither org is the production Originyx org)
 * 
 * Security:
 * - NEVER prints passwords, JWT tokens, refresh tokens, or API secrets.
 * - Does NOT perform mutations on any business or platform table.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFiles = ['.env.local', '.env', '.env.test'];
  const env = { ...process.env };
  
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (!env[key]) {
            env[key] = val;
          }
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

const userA_email = env.TEST_USER_A_EMAIL;
const userA_pass = env.TEST_USER_A_PASSWORD;
const userB_email = env.TEST_USER_B_EMAIL;
const userB_pass = env.TEST_USER_B_PASSWORD;

const PRODUCTION_ORIGINYX_ORG_ID = '74287b96-46fe-44b0-99aa-3edb06a77dcd';

function redactEmail(email) {
  if (!email) return '[NOT_SET]';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? name.substring(0, 2) + '***' : '***';
  return `${maskedName}@${domain}`;
}

async function testAuthOnly() {
  console.log('================================================================');
  console.log('SAFE AUTHENTICATION-ONLY PRE-FLIGHT VERIFICATION');
  console.log('Target Remote Database:', supabaseUrl);
  console.log('================================================================\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[FATAL] Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
    process.exit(1);
  }

  // Pre-flight credential check
  console.log('--- CREDENTIAL STATUS ---');
  console.log('User A Email:', redactEmail(userA_email));
  console.log('User A Password:', !userA_pass ? '[MISSING]' : (userA_pass === 'YOUR_PASSWORD' ? '[PLACEHOLDER: "YOUR_PASSWORD"]' : '[CONFIGURED (REDACTED)]'));
  console.log('User B Email:', redactEmail(userB_email));
  console.log('User B Password:', !userB_pass ? '[MISSING]' : (userB_pass === 'YOUR_PASSWORD' ? '[PLACEHOLDER: "YOUR_PASSWORD"]' : '[CONFIGURED (REDACTED)]'));

  if (!userA_email || !userA_pass || userA_pass === 'YOUR_PASSWORD' ||
      !userB_email || !userB_pass || userB_pass === 'YOUR_PASSWORD') {
    console.log('\n[PRE-FLIGHT ABORT] Valid credentials are not configured.');
    console.log('Please set actual passwords in .env.local instead of "YOUR_PASSWORD".');
    process.exit(1);
  }

  const clientA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const clientB = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

  console.log('\n--- TESTING USER A AUTHENTICATION ---');
  const authA = await clientA.auth.signInWithPassword({ email: userA_email, password: userA_pass });
  if (authA.error) {
    console.error(`[FAIL] User A (${redactEmail(userA_email)}) authentication failed:`);
    console.error(`  Status: ${authA.error.status}`);
    console.error(`  Code: ${authA.error.code}`);
    console.error(`  Message: ${authA.error.message}`);
    process.exit(1);
  }
  console.log(`[PASS] User A authenticated successfully.`);
  console.log(`  UID: ${authA.data.user.id}`);
  console.log(`  Confirmed At: ${authA.data.user.email_confirmed_at || 'UNCONFIRMED'}`);

  console.log('\n--- TESTING USER B AUTHENTICATION ---');
  const authB = await clientB.auth.signInWithPassword({ email: userB_email, password: userB_pass });
  if (authB.error) {
    console.error(`[FAIL] User B (${redactEmail(userB_email)}) authentication failed:`);
    console.error(`  Status: ${authB.error.status}`);
    console.error(`  Code: ${authB.error.code}`);
    console.error(`  Message: ${authB.error.message}`);
    process.exit(1);
  }
  console.log(`[PASS] User B authenticated successfully.`);
  console.log(`  UID: ${authB.data.user.id}`);
  console.log(`  Confirmed At: ${authB.data.user.email_confirmed_at || 'UNCONFIRMED'}`);

  console.log('\n--- VERIFYING TENANT ISOLATION PRECONDITIONS ---');
  const { data: rolesA, error: errA } = await clientA.from('user_roles').select('org_id, role');
  const { data: rolesB, error: errB } = await clientB.from('user_roles').select('org_id, role');

  if (errA) console.error('[WARN] User A user_roles lookup error:', errA.message);
  if (errB) console.error('[WARN] User B user_roles lookup error:', errB.message);

  const orgA_id = rolesA?.[0]?.org_id;
  const roleA = rolesA?.[0]?.role;
  const orgB_id = rolesB?.[0]?.org_id;
  const roleB = rolesB?.[0]?.role;

  console.log(`User A Organization: ${orgA_id || '[NO ORG FOUND IN user_roles]'} (Role: ${roleA || 'none'})`);
  console.log(`User B Organization: ${orgB_id || '[NO ORG FOUND IN user_roles]'} (Role: ${roleB || 'none'})`);

  if (!orgA_id || !orgB_id) {
    console.error('[BLOCKER] One or both users do not have an assigned organization in user_roles.');
    console.error('Please assign each test user to a test organization in user_roles.');
    process.exit(1);
  }

  if (orgA_id === orgB_id) {
    console.error('[BLOCKER] User A and User B belong to the SAME organization. Multi-tenant verification requires distinct organizations.');
    process.exit(1);
  }

  if (orgA_id === PRODUCTION_ORIGINYX_ORG_ID || orgB_id === PRODUCTION_ORIGINYX_ORG_ID) {
    console.error('[SAFETY BLOCKER] One of the users belongs to the production Originyx organization.');
    console.error('Dedicated test organizations are strictly required for multi-tenant verification.');
    process.exit(1);
  }

  console.log('\n[PRE-FLIGHT SUCCESS] Both test users authenticated and verified with distinct non-production organizations.');
  console.log('You may now safely run: node scripts/verify_authenticated_multitenancy.cjs');
}

testAuthOnly().catch((err) => {
  console.error('[UNEXPECTED ERROR]', err);
  process.exit(1);
});
