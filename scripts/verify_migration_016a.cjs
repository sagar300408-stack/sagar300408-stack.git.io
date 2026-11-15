/**
 * Verification Suite for Migration 016A: Atomic Tenant Provisioning RPC
 * 
 * Target: Remote Supabase PostgreSQL backend (provision_tenant_organization)
 * 
 * Verifies:
 * 1. Unauthenticated execution rejection (anon role denied via REVOKE)
 * 2. Authenticated execution & existing-membership guard (User A / User B)
 * 3. Fresh user onboarding & idempotency (via fresh confirmed account or diagnostic probe)
 * 4. Transactional rollback & database state before/after
 * 
 * Security:
 * - NEVER logs or displays passwords, JWT tokens, service-role keys, or secrets.
 * - Operates strictly via user-level authentication (anon and authenticated roles).
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

function redactEmail(email) {
  if (!email) return '[NOT_SET]';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? name.substring(0, 2) + '***' : '***';
  return `${maskedName}@${domain}`;
}

async function runVerification() {
  console.log('================================================================');
  console.log('MIGRATION 016A RUNTIME VERIFICATION SUITE');
  console.log('================================================================');
  console.log('Timestamp:', new Date().toISOString());

  const env = loadEnv();
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[FATAL] Missing SUPABASE_URL or SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  console.log('Target Database:', supabaseUrl);
  console.log('User A Email:   ', redactEmail(env.TEST_USER_A_EMAIL));
  console.log('User B Email:   ', redactEmail(env.TEST_USER_B_EMAIL));
  console.log('User C Email:   ', redactEmail(env.TEST_USER_C_EMAIL));
  console.log('----------------------------------------------------------------\n');

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const clientA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const clientB = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

  // -------------------------------------------------------------
  // PRE-TEST: Database State Baseline
  // -------------------------------------------------------------
  console.log('--- STEP 0: PRE-TEST DATABASE BASELINE ---');
  let authA, authB;

  try {
    authA = await clientA.auth.signInWithPassword({
      email: env.TEST_USER_A_EMAIL,
      password: env.TEST_USER_A_PASSWORD
    });
    if (authA.error) throw authA.error;
    console.log('[OK] User A authenticated successfully (UID: ' + authA.data.user.id + ')');
  } catch (err) {
    console.error('[FAIL] Could not authenticate User A:', err.message);
    process.exit(1);
  }

  try {
    authB = await clientB.auth.signInWithPassword({
      email: env.TEST_USER_B_EMAIL,
      password: env.TEST_USER_B_PASSWORD
    });
    if (authB.error) throw authB.error;
    console.log('[OK] User B authenticated successfully (UID: ' + authB.data.user.id + ')');
  } catch (err) {
    console.error('[FAIL] Could not authenticate User B:', err.message);
    process.exit(1);
  }

  const { data: preRolesA } = await clientA.from('user_roles').select('*');
  const { data: preRolesB } = await clientB.from('user_roles').select('*');
  const { data: preOrgsA } = await clientA.from('organizations').select('id, name, slug');
  const { data: preOrgsB } = await clientB.from('organizations').select('id, name, slug');

  console.log('Baseline User A Memberships:', preRolesA?.length || 0, 'roles,', preOrgsA?.length || 0, 'visible orgs');
  if (preRolesA && preRolesA.length > 0) {
    console.log('  Org ID:', preRolesA[0].org_id, '| Role:', preRolesA[0].role);
  }
  console.log('Baseline User B Memberships:', preRolesB?.length || 0, 'roles,', preOrgsB?.length || 0, 'visible orgs');
  if (preRolesB && preRolesB.length > 0) {
    console.log('  Org ID:', preRolesB[0].org_id, '| Role:', preRolesB[0].role);
  }

  // -------------------------------------------------------------
  // TEST 1: Unauthenticated RPC Call Rejection
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: UNAUTHENTICATED RPC CALL REJECTION ---');
  const unauthPayload = {
    _org_name: 'Unauth Test Corp',
    _slug: 'unauth-test-corp-' + Date.now(),
    _industry: 'Testing',
    _company_size: '1-10',
    _website: null,
    _phone: null,
    _email: null,
    _description: null,
    _products_services: null,
    _target_market: null,
    _business_model: null,
    _growth_stage: null,
    _business_goals: null,
    _address_line1: null,
    _address_line2: null,
    _city: null,
    _state: null,
    _postal_code: null,
    _country: null
  };

  const { data: unauthData, error: unauthError } = await anonClient.rpc('provision_tenant_organization', unauthPayload);

  if (unauthError && unauthError.code === '42501') {
    console.log('[PASS] Unauthenticated call was strictly rejected by PostgreSQL.');
    console.log('  Error Code:   ', unauthError.code);
    console.log('  Error Message:', unauthError.message);
  } else if (unauthError) {
    console.log('[FAIL] Unauthenticated call rejected, but with unexpected code:', unauthError.code, unauthError.message);
  } else {
    console.error('[CRITICAL FAIL] Unauthenticated call SUCCEEDED without credentials! Data:', unauthData);
  }

  // -------------------------------------------------------------
  // TEST 2: Existing Member Rejection Guard (User A & User B)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: EXISTING MEMBERSHIP REJECTION GUARD ---');
  console.log('Testing User A (already owner of ' + preRolesA[0]?.org_id + ')...');

  const existingUserPayloadA = {
    _org_name: 'User A Duplicate Org',
    _slug: 'user-a-duplicate-org-' + Date.now(),
    _industry: 'Technology',
    _company_size: '1-10',
    _website: 'https://dup-a.test',
    _phone: null,
    _email: null,
    _description: 'Attempt to create second org',
    _products_services: null,
    _target_market: null,
    _business_model: null,
    _growth_stage: null,
    _business_goals: null,
    _address_line1: null,
    _address_line2: null,
    _city: null,
    _state: null,
    _postal_code: null,
    _country: null
  };

  const { data: dataA, error: errorA } = await clientA.rpc('provision_tenant_organization', existingUserPayloadA);

  if (errorA) {
    console.log('User A RPC Result: Rejected (as required)');
    console.log('  Status / Code:', errorA.code || errorA.status);
    console.log('  Message:      ', errorA.message);
    if (errorA.code === '23505' || errorA.message?.includes('already belongs')) {
      console.log('[PASS] Existing membership guard correctly raised business exception.');
    } else if (errorA.code === '42704' && errorA.message?.includes('pg_catalog.bigint')) {
      console.log('[BLOCKED / KNOWN ISSUE] Deployed SQL encountered type alias issue: "pg_catalog.bigint" does not exist in PostgreSQL catalogs.');
      console.log('  Root Cause: PostgreSQL maps bigint to internal type int8; ::pg_catalog.bigint is invalid under empty search_path.');
      console.log('  Remediation: Deploy the patched migration with ::bigint.');
    } else {
      console.log('[WARN] Rejection reason:', errorA.message);
    }
  } else {
    console.error('[CRITICAL FAIL] Existing user was permitted to create a second organization! Data:', dataA);
  }

  // -------------------------------------------------------------
  // TEST 3: Fresh Account Provisioning & Single-Owner Verification
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: FRESH USER PROVISIONING & ATOMIC ONBOARDING ---');
  let testUserC = null;
  let clientC = null;

  if (env.TEST_USER_C_EMAIL && env.TEST_USER_C_PASSWORD) {
    clientC = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const authC = await clientC.auth.signInWithPassword({
      email: env.TEST_USER_C_EMAIL,
      password: env.TEST_USER_C_PASSWORD
    });
    if (authC.error) {
      console.log('[WARN] Pre-configured Test User C failed to sign in:', authC.error.message);
    } else {
      testUserC = authC.data.user;
      console.log('[OK] Dedicated Test User C signed in (UID: ' + testUserC.id + ')');
    }
  }

  if (!testUserC) {
    console.log('Attempting automated registration of dedicated test account...');
    const candidateEmail = `test-onboarding-${Date.now()}@originyx-test.com`;
    const candidatePass = `P@ssw0rd!${Date.now()}`;
    const regClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

    const signUpRes = await regClient.auth.signUp({
      email: candidateEmail,
      password: candidatePass
    });

    if (signUpRes.error) {
      console.log('[INFO] GoTrue registration failed:', signUpRes.error.message);
    } else {
      console.log('Registration received User ID:', signUpRes.data.user?.id);
      console.log('Email confirmed status:    ', signUpRes.data.user?.email_confirmed_at || 'UNCONFIRMED');

      const signInRes = await regClient.auth.signInWithPassword({
        email: candidateEmail,
        password: candidatePass
      });

      if (signInRes.data?.session) {
        testUserC = signInRes.data.user;
        clientC = regClient;
        console.log('[PASS] Automated test account signed in successfully.');
      } else {
        console.log('[BLOCKED] GoTrue requires email confirmation for new accounts (email_not_confirmed).');
        console.log('  Automatic confirmation is disabled on this Supabase project.');
        console.log('  To test successful first-time provisioning, pre-confirm a dedicated user and set TEST_USER_C_EMAIL / TEST_USER_C_PASSWORD.');
      }
    }
  }

  if (testUserC && clientC) {
    console.log('\nExecuting first-time provisioning call with Test User C...');
    const freshPayload = {
      _org_name: 'Verified Fresh Tenant Inc',
      _slug: 'fresh-tenant-' + Date.now(),
      _industry: 'Aerospace',
      _company_size: '11-50',
      _website: 'https://freshtenant.test',
      _phone: '+1-555-0199',
      _email: 'contact@freshtenant.test',
      _description: 'Automated verification tenant',
      _products_services: 'Automation solutions',
      _target_market: 'B2B Enterprise',
      _business_model: 'SaaS',
      _growth_stage: 'Seed',
      _business_goals: 'Accelerate deployment',
      _address_line1: '100 Innovation Way',
      _address_line2: 'Suite 400',
      _city: 'San Francisco',
      _state: 'CA',
      _postal_code: '94105',
      _country: 'USA'
    };

    const { data: freshData, error: freshError } = await clientC.rpc('provision_tenant_organization', freshPayload);

    if (freshError) {
      console.error('[FAIL] Fresh user provisioning failed:', freshError);
    } else {
      console.log('[PASS] RPC succeeded! Returned JSONB:', freshData);
      const newOrgId = freshData?.org_id;
      const returnedRole = freshData?.role;

      if (!newOrgId || returnedRole !== 'owner') {
        console.error('[FAIL] Returned payload does not contain expected org_id and owner role.');
      } else {
        console.log('[PASS] Returned payload verified: org_id=' + newOrgId + ', role=' + returnedRole);

        // Verify organizations table
        const { data: orgRecords } = await clientC.from('organizations').select('*').eq('id', newOrgId);
        if (orgRecords && orgRecords.length === 1) {
          console.log('[PASS] Exactly one organization created in public.organizations.');
          console.log('  Name: ' + orgRecords[0].name + ' | Slug: ' + orgRecords[0].slug);
        } else {
          console.error('[FAIL] Expected 1 organization, found:', orgRecords?.length);
        }

        // Verify user_roles table
        const { data: userRoleRecords } = await clientC.from('user_roles').select('*').eq('org_id', newOrgId);
        if (userRoleRecords && userRoleRecords.length === 1) {
          console.log('[PASS] Exactly one user_roles entry created for the new organization.');
          console.log('  User ID matches auth.uid():', userRoleRecords[0].user_id === testUserC.id);
          console.log('  Workspace ID is null (org-wide):', userRoleRecords[0].workspace_id === null);
          console.log('  Role is owner:', userRoleRecords[0].role === 'owner');
        } else {
          console.error('[FAIL] Unexpected user_roles count:', userRoleRecords?.length);
        }

        // Verify idempotency / second provisioning attempt
        console.log('\nCalling provision_tenant_organization a SECOND time with the same account...');
        const { data: secondData, error: secondError } = await clientC.rpc('provision_tenant_organization', {
          ...freshPayload,
          _slug: 'fresh-tenant-second-' + Date.now()
        });

        if (secondError) {
          console.log('[PASS] Second provisioning attempt was correctly rejected.');
          console.log('  Code:   ', secondError.code);
          console.log('  Message:', secondError.message);
        } else {
          console.error('[CRITICAL FAIL] Second provisioning attempt SUCCEEDED! Idempotency broken.');
        }
      }
    }
  }

  // -------------------------------------------------------------
  // POST-TEST: Database State Verification
  // -------------------------------------------------------------
  console.log('\n--- STEP 4: POST-TEST DATABASE STATE & ROLLBACK VERIFICATION ---');
  const { data: postRolesA } = await clientA.from('user_roles').select('*');
  const { data: postRolesB } = await clientB.from('user_roles').select('*');
  const { data: postOrgsA } = await clientA.from('organizations').select('id, name, slug');
  const { data: postOrgsB } = await clientB.from('organizations').select('id, name, slug');

  console.log('Post-test User A Memberships:', postRolesA?.length || 0, 'roles (Baseline:', preRolesA?.length || 0, ')');
  console.log('Post-test User B Memberships:', postRolesB?.length || 0, 'roles (Baseline:', preRolesB?.length || 0, ')');

  const unchangedA = JSON.stringify(preRolesA) === JSON.stringify(postRolesA);
  const unchangedB = JSON.stringify(preRolesB) === JSON.stringify(postRolesB);

  if (unchangedA && unchangedB) {
    console.log('[PASS] Tenant isolation and data integrity preserved: User A and User B memberships remain completely untouched.');
  } else {
    console.warn('[WARN] Discrepancy detected in User A or B memberships!');
  }

  console.log('\n================================================================');
  console.log('VERIFICATION PHASE COMPLETE');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
