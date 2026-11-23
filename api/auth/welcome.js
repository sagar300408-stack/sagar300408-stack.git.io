/**
 * ORIGINYX — Welcome Email API Endpoint
 * =======================================
 * POST /api/auth/welcome
 *
 * Sends a branded welcome email after a new account is created.
 * Idempotent: uses a Supabase-backed `email_sent_log` table to prevent
 * duplicate emails per (user_id, email_type) pair.
 *
 * Security:
 *  - Validates user existence against Supabase Auth admin API (service role).
 *  - Enforces that recipient email comes from the trusted account record.
 *  - Enforces account creation age (< 15 mins) to prevent spamming existing accounts.
 *  - Works even when Supabase email verification is pending (no active session yet).
 *  - Rejects arbitrary unauthenticated email relay attempts.
 *  - Never exposes SMTP credentials or API keys.
 *  - Dynamic content is escaped before insertion into HTML templates.
 *
 * Request body (JSON):
 *  {
 *    user_id           : string   — Supabase user UUID
 *    name              : string   — Display name (optional)
 *    email             : string   — Account email for verification against DB record
 *    provider          : string   — 'email' | 'google' | 'microsoft'
 *    needs_verification: boolean  — true for email+password signups pending verify
 *  }
 *
 * Response:
 *  200 { sent: true }
 *  200 { sent: false, reason: 'duplicate' | 'existing_account' }
 *  400 { error: '...' }
 *  403 { error: '...' }
 *  404 { error: '...' }
 *  500 { error: '...' }
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { welcomeEmail } from '../emails/templates.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // --- Environment validation ---
  const resendApiKey       = process.env.RESEND_API_KEY;
  const supabaseUrl        = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('[welcome] Missing required environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // --- Input validation ---
  const { user_id, name, email, provider = 'email', needs_verification = false } = req.body || {};

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id is required.' });
  }

  // Strict UUID format validation
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user_id UUID format.' });
  }

  try {
    // --- Supabase admin client (service role, server-side only) ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // --- Security Check 1: Verify user exists in Supabase auth.users ---
    const { data: userData, error: userLookupError } = await supabase.auth.admin.getUserById(user_id);
    if (userLookupError || !userData?.user) {
      console.warn(`[welcome] Lookup failed for user_id ${user_id}:`, userLookupError?.message);
      return res.status(404).json({ error: 'User account not found.' });
    }

    const trustedUser = userData.user;
    const trustedEmail = trustedUser.email;

    if (!trustedEmail || !trustedEmail.includes('@')) {
      return res.status(400).json({ error: 'User account has no associated email address.' });
    }

    // --- Security Check 2: If client provided an email, it must match the account record ---
    if (email && email.toLowerCase().trim() !== trustedEmail.toLowerCase().trim()) {
      console.warn(`[welcome] Email mismatch attempt for user ${user_id}: requested ${email}, registered ${trustedEmail}`);
      return res.status(403).json({ error: 'Recipient address does not match registered account.' });
    }

    // --- Security Check 3: Check account creation age ---
    // If the account was created more than 15 minutes ago, this is a normal recurring login, NOT a new signup.
    const createdAtTime = new Date(trustedUser.created_at).getTime();
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    if (Date.now() - createdAtTime > FIFTEEN_MINUTES_MS) {
      console.info(`[welcome] Skipping welcome email for existing user ${user_id} (created at ${trustedUser.created_at})`);
      return res.status(200).json({ sent: false, reason: 'existing_account' });
    }

    // --- Idempotency Check: Check email_sent_log table ---
    const { data: existingLog, error: logSelectError } = await supabase
      .from('email_sent_log')
      .select('id')
      .eq('user_id', user_id)
      .eq('email_type', 'welcome')
      .maybeSingle();

    if (logSelectError && !logSelectError.message.includes('does not exist')) {
      console.error('[welcome] Log check failed:', logSelectError.message);
      return res.status(500).json({ error: 'Database error during idempotency check.' });
    }

    if (existingLog) {
      console.info(`[welcome] Duplicate skipped for user ${user_id}`);
      return res.status(200).json({ sent: false, reason: 'duplicate' });
    }

    // Determine verification status from trusted user record if available
    const isVerificationPending = needs_verification || !trustedUser.email_confirmed_at;
    const recipientName = name || trustedUser.user_metadata?.full_name || trustedUser.user_metadata?.name || '';

    // --- Build email content ---
    const { subject, html, text } = welcomeEmail({
      name:  recipientName,
      email: trustedEmail,
      provider,
      needsVerification: Boolean(isVerificationPending),
    });

    // --- Send via Resend ---
    const resend = new Resend(resendApiKey);
    const { data: sendData, error: sendError } = await resend.emails.send({
      from:    'Originyx <noreply@originyx.in>',
      to:      [trustedEmail],
      subject,
      html,
      text,
      replyTo: 'info@originyx.in',
    });

    if (sendError) {
      console.error('[welcome] Resend error:', sendError);
      return res.status(400).json({ error: sendError.message || 'Email delivery failed.' });
    }

    // --- Record in idempotency log ---
    const { error: logInsertError } = await supabase
      .from('email_sent_log')
      .insert({
        user_id,
        email_type: 'welcome',
        recipient:  trustedEmail,
        resend_id:  sendData?.id || null,
      });

    if (logInsertError) {
      // Non-fatal: email was delivered; just log the failure
      console.warn('[welcome] Failed to write to email_sent_log:', logInsertError.message);
    }

    console.info(`[welcome] Welcome email sent to ${trustedEmail} (user: ${user_id})`);
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[welcome] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
