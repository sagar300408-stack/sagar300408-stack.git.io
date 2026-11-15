/**
 * Production-Connected Multi-Tenant Runtime Security Verification Suite
 * 
 * Verifies:
 * - Test A: Authenticated Read Isolation across tenants
 * - Test B: Authenticated Write Isolation across tenants (positive CRUD + negative cross-tenant writes)
 * - Test C: Role Security & Privilege Escalation Prevention
 * - Test D: Existing Module Regression (CRM, Operations, CMS, Growth) under authenticated sessions
 * 
 * Safety:
 * - Redacts all credentials and JWT tokens.
 * - Never touches production Originyx data.
 * - Cleans up only ephemeral test records created during execution.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Environment & Credential Resolution
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[FATAL] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

// Credentials for User A & User B
const userA_email = env.TEST_USER_A_EMAIL || env.TEST_USER_1_EMAIL || env.TEST_ADMIN_EMAIL;
const userA_pass = env.TEST_USER_A_PASSWORD || env.TEST_USER_1_PASSWORD || env.TEST_ADMIN_PASSWORD;

const userB_email = env.TEST_USER_B_EMAIL || env.TEST_USER_2_EMAIL || env.TEST_MEMBER_EMAIL;
const userB_pass = env.TEST_USER_B_PASSWORD || env.TEST_USER_2_PASSWORD || env.TEST_MEMBER_PASSWORD;

const PRODUCTION_ORIGINYX_ORG_ID = '74287b96-46fe-44b0-99aa-3edb06a77dcd';

const MARKETING_TABLES = [
  {
    table: 'marketing_objectives',
    sample: { title: 'Audit Test Objective', target_metric: 'Leads', target_value: 50, target_date: '2026-12-31' },
    update: { target_value: 75 }
  },
  {
    table: 'marketing_audiences',
    sample: { name: 'Audit Test Audience', industry: 'SaaS', company_size: '11-50', geographic_market: 'North America', business_type: 'B2B' },
    update: { industry: 'Enterprise SaaS' }
  },
  {
    table: 'marketing_icp_profiles',
    sample: { name: 'Audit Test ICP', industry: 'FinTech', company_size: '51-200', geography: 'Global', technology_maturity: 'High' },
    update: { company_size: '100-500' }
  },
  {
    table: 'marketing_channels',
    sample: { name: 'Audit Channel ' + Date.now(), slug: 'audit-chan-' + Date.now(), category: 'Inbound' },
    update: { category: 'Direct' }
  },
  {
    table: 'marketing_experiments',
    sample: { name: 'Audit Test Experiment', hypothesis: 'Testing conversion rate', success_metric: 'Conversions', target_value: '15%' },
    update: { target_value: '20%' }
  },
  {
    table: 'marketing_initiatives',
    sample: { name: 'Audit Test Initiative', priority: 'High' },
    update: { priority: 'Urgent' }
  }
];

function redact(str) {
  if (!str) return '[NOT_SET]';
  if (str.length <= 4) return '***';
  return str.substring(0, 2) + '***' + str.substring(str.length - 2);
}

async function run() {
  console.log('================================================================');
  console.log('ORIGINYX CONTROL CENTER: MULTI-TENANT RUNTIME SECURITY SUITE');
  console.log('Target Remote Database:', supabaseUrl);
  console.log('================================================================\n');

  console.log('--- CREDENTIAL DISCOVERY ---');
  console.log('TEST_USER_A_EMAIL:', userA_email ? redact(userA_email) : '[MISSING]');
  console.log('TEST_USER_A_PASSWORD:', userA_pass ? '[CONFIGURED (REDACTED)]' : '[MISSING]');
  console.log('TEST_USER_B_EMAIL:', userB_email ? redact(userB_email) : '[MISSING]');
  console.log('TEST_USER_B_PASSWORD:', userB_pass ? '[CONFIGURED (REDACTED)]' : '[MISSING]');

  if (!userA_email || !userA_pass || !userB_email || !userB_pass) {
    console.log('\n[PRECONDITION DEFICIT] Missing environment variables for test users.');
    console.log('The test suite requires two independent authenticated users in separate organizations.');
    console.log('Required Environment Variables:');
    console.log('  TEST_USER_A_EMAIL');
    console.log('  TEST_USER_A_PASSWORD');
    console.log('  TEST_USER_B_EMAIL');
    console.log('  TEST_USER_B_PASSWORD');
    console.log('\nPlease supply these variables in .env.local or process environment.');
    
    // Perform Unauthenticated & Schema baseline checks to maintain full traceability
    await runBaselineVerification();
    return;
  }

  // Both user credentials supplied -> Proceed to Authenticated Tests
  await runAuthenticatedVerification();
}

async function runBaselineVerification() {
  console.log('\n--- BASELINE REMOTE VERIFICATION (UNAUTHENTICATED & SCHEMA) ---');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  // Check 1: RPC is_org_member overload elimination
  const twoArgRpc = await anonClient.rpc('is_org_member', {
    _user_id: '00000000-0000-0000-0000-000000000001',
    _org_id: PRODUCTION_ORIGINYX_ORG_ID
  });
  console.log('Legacy 2-arg is_org_member RPC:', 
    twoArgRpc.error?.code === 'PGRST202' ? '[PASS: REMOVED (PGRST202)]' : `[UNEXPECTED: ${twoArgRpc.error?.message || 'EXISTS'}]`);

  // Check 2: Canonical 1-arg is_org_member RPC
  const oneArgRpc = await anonClient.rpc('is_org_member', {
    _org_id: PRODUCTION_ORIGINYX_ORG_ID
  });
  console.log('Canonical 1-arg is_org_member RPC:', 
    oneArgRpc.data === false ? '[PASS: DERIVES FROM JWT (false for anon)]' : `[UNEXPECTED: ${oneArgRpc.error?.message || oneArgRpc.data}]`);

  // Check 3: Unauthenticated write rejection on marketing tables
  let allWriteRejected = true;
  for (const t of MARKETING_TABLES) {
    const res = await anonClient.from(t.table).insert({ org_id: PRODUCTION_ORIGINYX_ORG_ID, ...t.sample });
    if (res.error?.code !== '42501') {
      allWriteRejected = false;
      console.log(`[ALERT] Table ${t.table} write not rejected with 42501:`, res.error);
    }
  }
  console.log('All Marketing tables reject unauthorized write with 42501:', allWriteRejected ? '[PASS]' : '[FAIL]');

  // Check 4: Unauthenticated privilege escalation on user_roles
  const roleInsert = await anonClient.from('user_roles').insert({
    user_id: '00000000-0000-0000-0000-000000000001',
    org_id: PRODUCTION_ORIGINYX_ORG_ID,
    role: 'owner'
  });
  console.log('user_roles privilege escalation rejection:', 
    roleInsert.error?.code === '42501' ? '[PASS: REJECTED (42501)]' : `[ALERT: ${roleInsert.error?.message}]`);

  console.log('\n--- VERDICT ---');
  console.log('Verdict: BLOCKED (Authenticated multi-tenant tests blocked until credentials are set).');
}

async function runAuthenticatedVerification() {
  console.log('\n--- AUTHENTICATING TEST USERS ---');
  const clientA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const clientB = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

  const authA = await clientA.auth.signInWithPassword({ email: userA_email, password: userA_pass });
  if (authA.error) {
    console.error('[FAIL] User A authentication failed:', authA.error.status, authA.error.message);
    return;
  }
  console.log('[PASS] User A authenticated successfully. UID:', authA.data.user.id);

  const authB = await clientB.auth.signInWithPassword({ email: userB_email, password: userB_pass });
  if (authB.error) {
    console.error('[FAIL] User B authentication failed:', authB.error.status, authB.error.message);
    return;
  }
  console.log('[PASS] User B authenticated successfully. UID:', authB.data.user.id);

  // Discover organizations
  const { data: rolesA } = await clientA.from('user_roles').select('org_id, role');
  const { data: rolesB } = await clientB.from('user_roles').select('org_id, role');

  const orgA_id = rolesA?.[0]?.org_id;
  const roleA = rolesA?.[0]?.role;
  const orgB_id = rolesB?.[0]?.org_id;
  const roleB = rolesB?.[0]?.role;

  console.log('\n--- TENANT IDENTIFICATION ---');
  console.log('User A Organization:', orgA_id, 'Role:', roleA);
  console.log('User B Organization:', orgB_id, 'Role:', roleB);

  if (!orgA_id || !orgB_id) {
    console.error('[BLOCKED] One or both users do not have an assigned organization in user_roles.');
    return;
  }

  if (orgA_id === orgB_id) {
    console.error('[BLOCKED] User A and User B belong to the SAME organization. Cross-tenant testing requires distinct orgs.');
    return;
  }

  if (orgA_id === PRODUCTION_ORIGINYX_ORG_ID || orgB_id === PRODUCTION_ORIGINYX_ORG_ID) {
    console.error('[SAFETY BLOCK] One of the test organizations is the production Originyx org. Dedicated test orgs required.');
    return;
  }

  console.log('[PASS] Confirmed distinct test organizations. Safe to proceed.\n');

  // =========================================================================
  // TEST A: AUTHENTICATED READ ISOLATION
  // =========================================================================
  console.log('--- TEST A: AUTHENTICATED READ ISOLATION ---');
  
  // 1. Organizations table
  const a_read_orgA = await clientA.from('organizations').select('id, name').eq('id', orgA_id);
  const a_read_orgB = await clientA.from('organizations').select('id, name').eq('id', orgB_id);
  console.log('User A reading Org A:', a_read_orgA.data?.length === 1 ? '[PASS]' : '[FAIL]');
  console.log('User A reading Org B (Cross-tenant):', a_read_orgB.data?.length === 0 ? '[PASS: BLOCKED (0 rows)]' : '[FAIL: LEAK]');

  const b_read_orgB = await clientB.from('organizations').select('id, name').eq('id', orgB_id);
  const b_read_orgA = await clientB.from('organizations').select('id, name').eq('id', orgA_id);
  console.log('User B reading Org B:', b_read_orgB.data?.length === 1 ? '[PASS]' : '[FAIL]');
  console.log('User B reading Org A (Cross-tenant):', b_read_orgA.data?.length === 0 ? '[PASS: BLOCKED (0 rows)]' : '[FAIL: LEAK]');

  // 2. Workspaces table
  const a_read_wsB = await clientA.from('workspaces').select('id').eq('org_id', orgB_id);
  console.log('User A reading Org B workspaces:', a_read_wsB.data?.length === 0 ? '[PASS: BLOCKED (0 rows)]' : '[FAIL: LEAK]');

  // 3. User roles table
  const a_read_rolesB = await clientA.from('user_roles').select('id').eq('org_id', orgB_id);
  console.log('User A reading Org B user_roles:', a_read_rolesB.data?.length === 0 ? '[PASS: BLOCKED (0 rows)]' : '[FAIL: LEAK]');

  // 4. Growth module settings
  const a_read_growthB = await clientA.from('growth_module_settings').select('id').eq('org_id', orgB_id);
  console.log('User A reading Org B growth_module_settings:', a_read_growthB.data?.length === 0 ? '[PASS: BLOCKED (0 rows)]' : '[FAIL: LEAK]');

  // 5. All Marketing Tables
  for (const t of MARKETING_TABLES) {
    const resA = await clientA.from(t.table).select('id').eq('org_id', orgB_id);
    console.log(`User A reading Org B ${t.table}:`, resA.data?.length === 0 ? '[PASS: 0 rows]' : '[FAIL: LEAK]');
  }

  // =========================================================================
  // TEST B: AUTHENTICATED WRITE ISOLATION & CRUD
  // =========================================================================
  console.log('\n--- TEST B: AUTHENTICATED WRITE ISOLATION & CRUD ---');
  for (const t of MARKETING_TABLES) {
    console.log(`\nTesting table: ${t.table}`);

    // 1. Create in User A's own org
    const insertRes = await clientA.from(t.table).insert({ org_id: orgA_id, ...t.sample }).select().single();
    if (insertRes.error || !insertRes.data) {
      console.error(`[FAIL] User A failed to create record in ${t.table}:`, insertRes.error);
      continue;
    }
    const createdId = insertRes.data.id;
    console.log(`  1. User A create in Org A: [PASS] (ID: ${createdId})`);

    // 2. Read back
    const readRes = await clientA.from(t.table).select('*').eq('id', createdId).single();
    console.log(`  2. User A read back:`, readRes.data ? '[PASS]' : '[FAIL]');

    // 3. Update
    const updateRes = await clientA.from(t.table).update(t.update).eq('id', createdId).select().single();
    console.log(`  3. User A update:`, updateRes.data ? '[PASS]' : '[FAIL]');

    // 4. Cross-tenant Read by User B
    const crossRead = await clientB.from(t.table).select('*').eq('id', createdId);
    console.log(`  4. User B cross-tenant read:`, crossRead.data?.length === 0 ? '[PASS: BLOCKED (0 rows)]' : '[FAIL: LEAK]');

    // 5. Cross-tenant Update by User B
    const crossUpdate = await clientB.from(t.table).update({ ...t.update, updated_at: new Date().toISOString() }).eq('id', createdId);
    console.log(`  5. User B cross-tenant update:`, (crossUpdate.error || crossUpdate.data?.length === 0) ? '[PASS: BLOCKED]' : '[FAIL: TAMPERED]');

    // 6. Cross-tenant Delete by User B
    const crossDelete = await clientB.from(t.table).delete().eq('id', createdId);
    console.log(`  6. User B cross-tenant delete:`, (crossDelete.error || crossDelete.data?.length === 0) ? '[PASS: BLOCKED]' : '[FAIL: DELETED]');

    // 7. Cross-tenant Insert by User B into Org A
    const crossInsert = await clientB.from(t.table).insert({ org_id: orgA_id, ...t.sample });
    console.log(`  7. User B cross-tenant insert into Org A:`, crossInsert.error?.code === '42501' ? '[PASS: REJECTED (42501)]' : '[FAIL: WRITTEN]');

    // 8. Cleanup record by User A
    const deleteRes = await clientA.from(t.table).delete().eq('id', createdId);
    console.log(`  8. User A cleanup record:`, !deleteRes.error ? '[PASS: CLEANED]' : '[ALERT: CLEANUP FAILED]');
  }

  // =========================================================================
  // TEST C: ROLE SECURITY & PRIVILEGE ESCALATION
  // =========================================================================
  console.log('\n--- TEST C: ROLE SECURITY ---');

  // Attempt 1: User B tries to insert an 'owner' role for themselves in Org A
  const crossRoleInsert = await clientB.from('user_roles').insert({
    user_id: authB.data.user.id,
    org_id: orgA_id,
    role: 'owner'
  });
  console.log('Cross-tenant role insertion into Org A:', 
    crossRoleInsert.error?.code === '42501' ? '[PASS: REJECTED (42501)]' : '[FAIL: ELEVATED]');

  // Attempt 2: User B tries to elevate role in own org if not owner
  const selfRoleUpdate = await clientB.from('user_roles').update({ role: 'owner' }).eq('user_id', authB.data.user.id);
  console.log('Self-role escalation in user_roles:', 
    (selfRoleUpdate.error || selfRoleUpdate.data?.length === 0) ? '[PASS: REJECTED/NO-OP]' : '[FAIL]');

  // =========================================================================
  // TEST D: EXISTING MODULE REGRESSION
  // =========================================================================
  console.log('\n--- TEST D: EXISTING MODULE REGRESSION ---');
  const crmLeads = await clientA.from('leads').select('id').eq('org_id', orgA_id).limit(5);
  console.log('CRM leads query under session:', !crmLeads.error ? '[PASS]' : `[FAIL: ${crmLeads.error.message}]`);

  const crmOpps = await clientA.from('opportunities').select('id').eq('org_id', orgA_id).limit(5);
  console.log('CRM opportunities query under session:', !crmOpps.error ? '[PASS]' : `[FAIL: ${crmOpps.error.message}]`);

  const opsTasks = await clientA.from('internal_tasks').select('id').eq('org_id', orgA_id).limit(5);
  console.log('Operations internal_tasks query under session:', !opsTasks.error ? '[PASS]' : `[FAIL: ${opsTasks.error.message}]`);

  const cmsLogs = await clientA.from('cms_activity_log').select('id').eq('org_id', orgA_id).limit(5);
  console.log('CMS activity logs query under session:', !cmsLogs.error ? '[PASS]' : `[FAIL: ${cmsLogs.error.message}]`);

  console.log('\n================================================================');
  console.log('AUTHENTICATED MULTI-TENANT VERIFICATION COMPLETED SUCCESSFULLY');
  console.log('================================================================\n');
}

run().catch(console.error);
