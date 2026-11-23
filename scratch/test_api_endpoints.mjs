// Test suite for /api/auth/welcome.js and /api/auth/logout-notify.js logic
import welcomeHandler from '../api/auth/welcome.js';
import logoutHandler from '../api/auth/logout-notify.js';

let pass = 0, fail = 0;
function assert(label, cond, extra = '') {
  if (cond) {
    console.log('  PASS:', label);
    pass++;
  } else {
    console.error('  FAIL:', label, extra);
    fail++;
  }
}

// Helper to mock req/res
function mockReqRes({ method = 'POST', body = {}, headers = {} }) {
  let statusCode = 200;
  let responseData = null;
  const resHeaders = {};

  const req = {
    method,
    body,
    headers,
  };

  const res = {
    setHeader(key, val) {
      resHeaders[key] = val;
    },
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    end() {
      return res;
    },
  };

  return { req, res, getStatus: () => statusCode, getData: () => responseData, getHeaders: () => resHeaders };
}

console.log('\n=== 1. Method & Header Tests ===');
{
  const { req, res, getStatus, getData } = mockReqRes({ method: 'GET' });
  await welcomeHandler(req, res);
  assert('welcome: GET returns 405', getStatus() === 405);
  assert('welcome: 405 has Method Not Allowed error', getData()?.error === 'Method Not Allowed');
}
{
  const { req, res, getStatus, getData } = mockReqRes({ method: 'GET' });
  await logoutHandler(req, res);
  assert('logout: GET returns 405', getStatus() === 405);
}
{
  const { req, res, getStatus, getHeaders } = mockReqRes({ method: 'OPTIONS' });
  await welcomeHandler(req, res);
  assert('welcome: OPTIONS returns 200', getStatus() === 200);
  assert('welcome: CORS allow origin is present', !!getHeaders()['Access-Control-Allow-Origin']);
}
{
  const { req, res, getStatus, getHeaders } = mockReqRes({ method: 'OPTIONS' });
  await logoutHandler(req, res);
  assert('logout: OPTIONS returns 200', getStatus() === 200);
  assert('logout: CORS allow origin is present', !!getHeaders()['Access-Control-Allow-Origin']);
}

// Setup dummy environment variables for local testing
process.env.RESEND_API_KEY = 're_test_mock_resend_key_12345';
process.env.SUPABASE_URL = 'https://rwsmafafptupucthrjwx.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_role_key_12345';

console.log('\n=== 2. Welcome Endpoint Input Validation & Security ===');
{
  // Missing env vars test
  const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { req, res, getStatus } = mockReqRes({ method: 'POST', body: { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' } });
  await welcomeHandler(req, res);
  assert('welcome: Missing SUPABASE_SERVICE_ROLE_KEY returns 500', getStatus() === 500);
  process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
}
{
  // Missing user_id
  const { req, res, getStatus, getData } = mockReqRes({ method: 'POST', body: { email: 'test@originyx.in' } });
  await welcomeHandler(req, res);
  assert('welcome: Missing user_id returns 400', getStatus() === 400);
  assert('welcome: 400 mentions user_id', getData()?.error?.includes('user_id'));
}
{
  // Malformed user_id (SQL injection / path traversal attempt)
  const malformedIds = [
    'not-a-uuid',
    '../../etc/passwd',
    "'; DROP TABLE users; --",
    '12345',
    'c0a80123-1234-1234-1234-1234567890123', // 37 chars
  ];
  for (const badId of malformedIds) {
    const { req, res, getStatus } = mockReqRes({ method: 'POST', body: { user_id: badId } });
    await welcomeHandler(req, res);
    assert(`welcome: Rejects malformed user_id "${badId}" with 400`, getStatus() === 400);
  }
}

console.log('\n=== 3. Logout Endpoint Input Validation & Security ===');
{
  // Missing user_id
  const { req, res, getStatus } = mockReqRes({ method: 'POST', body: { event_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' } });
  await logoutHandler(req, res);
  assert('logout: Missing user_id returns 400', getStatus() === 400);
}
{
  // Missing event_id
  const { req, res, getStatus } = mockReqRes({ method: 'POST', body: { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' } });
  await logoutHandler(req, res);
  assert('logout: Missing event_id returns 400', getStatus() === 400);
}
{
  // Malformed event_id
  const { req, res, getStatus } = mockReqRes({
    method: 'POST',
    body: {
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      event_id: 'invalid-event-id'
    }
  });
  await logoutHandler(req, res);
  assert('logout: Malformed event_id returns 400', getStatus() === 400);
}

console.log('\n=== 4. Migration 018 Syntax & Structure Verification ===');
import fs from 'fs';
const migrationSql = fs.readFileSync('./supabase/migrations/018_email_sent_log.sql', 'utf8');

assert('migration: creates email_sent_log table', migrationSql.includes('CREATE TABLE IF NOT EXISTS public.email_sent_log'));
assert('migration: has user_id referencing auth.users', migrationSql.includes('REFERENCES auth.users(id)'));
assert('migration: check constraint on email_type', migrationSql.includes("CHECK (email_type IN ('welcome', 'logout_notification'))"));
assert('migration: unique index uq_welcome_per_user', migrationSql.includes('CREATE UNIQUE INDEX IF NOT EXISTS uq_welcome_per_user'));
assert('migration: welcome index is partial (WHERE email_type = \'welcome\')', migrationSql.includes("WHERE email_type = 'welcome'"));
assert('migration: unique index uq_logout_event_id', migrationSql.includes('CREATE UNIQUE INDEX IF NOT EXISTS uq_logout_event_id'));
assert('migration: RLS enabled', migrationSql.includes('ALTER TABLE public.email_sent_log ENABLE ROW LEVEL SECURITY'));
assert('migration: deny_all_anon policy', migrationSql.includes('CREATE POLICY "deny_all_anon"'));
assert('migration: deny_all_authenticated policy', migrationSql.includes('CREATE POLICY "deny_all_authenticated"'));

console.log('\n=== 5. Verification Email Template Verification ===');
const verificationHtml = fs.readFileSync('./supabase/email-templates/verification.html', 'utf8');

assert('verification template: uses {{ .ConfirmationURL }}', verificationHtml.includes('{{ .ConfirmationURL }}'));
assert('verification template: subject in comments or meta', verificationHtml.includes('Verify Your Originyx Account') || verificationHtml.includes('Verify Your Account'));
assert('verification template: has Originyx logo', verificationHtml.includes('https://originyx.in/logo.png'));
assert('verification template: has expiry notice', verificationHtml.includes('24 hours'));
assert('verification template: has security notice', verificationHtml.includes('did not create an Originyx account'));
assert('verification template: DOCTYPE and responsive styles', verificationHtml.includes('<!DOCTYPE html>') && verificationHtml.includes('@media only screen'));

console.log('\n=== SUMMARY ===');
console.log('Total PASS:', pass, '/ Total FAIL:', fail);
if (fail > 0) process.exit(1);
