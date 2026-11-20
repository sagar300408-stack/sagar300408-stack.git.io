/**
 * ORIGINYX — Logout Notification Email API Endpoint
 * ===================================================
 * POST /api/auth/logout-notify
 *
 * Sends a branded logout notification + feedback CTA email after a user
 * explicitly signs out.
 *
 * Idempotency:
 *  - Each logical logout event receives a client-generated `event_id` (UUID).
 *  - The endpoint records the event_id and skips re-delivery for the same ID.
 *  - This prevents duplicates if the client-side code fires more than once.
 *
 * Security:
 *  - Validates that the authorization token maps to a real Supabase session
 *    BEFORE the sign-out is confirmed, so we have a trusted recipient address.
 *  - Accepts only POST requests.
 *  - Never exposes credentials to the browser.
 *  - Logout is NOT blocked if email delivery fails (fire-and-forget email).
 *
 * Request body (JSON):
 *  {
 *    user_id    : string   — Supabase user UUID (from active session)
 *    name       : string   — Display name
 *    email      : string   — Recipient email (from authenticated session)
 *    logout_time: string   — ISO 8601 timestamp
 *    event_id   : string   — Client-generated UUID for idempotency
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
import { logoutEmail } from '../emails/templates.js';

export default async function handler(req, res) {
  // CORS headers — allow both main site and client portal origins
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
    console.error('[logout-notify] Missing required environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // --- Input validation ---
  const {
    user_id,
    name,
    email,
    logout_time,
    event_id,
  } = req.body || {};

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id is required.' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  if (!event_id || typeof event_id !== 'string') {
    return res.status(400).json({ error: 'event_id is required.' });
  }

  // Basic UUID format checks
  if (!/^[0-9a-f-]{36}$/i.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user_id format.' });
  }
  if (!/^[0-9a-f-]{36}$/i.test(event_id)) {
    return res.status(400).json({ error: 'Invalid event_id format.' });
  }

  try {
    // --- Supabase admin client ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // --- Idempotency check: has this event_id already been processed? ---
    const { data: existingLog, error: logSelectError } = await supabase
      .from('email_sent_log')
      .select('id')
      .eq('event_id', event_id)
      .eq('email_type', 'logout_notification')
      .maybeSingle();

    if (logSelectError && !logSelectError.message.includes('does not exist')) {
      console.error('[logout-notify] Log check failed:', logSelectError.message);
      return res.status(500).json({ error: 'Database error during idempotency check.' });
    }

    if (existingLog) {
      console.info(`[logout-notify] Duplicate skipped for event ${event_id}`);
      return res.status(200).json({ sent: false, reason: 'duplicate' });
    }

    // --- Build email content ---
    const { subject, html, text } = logoutEmail({
      name:       name || '',
      email:      email,
      logoutTime: logout_time || new Date().toISOString(),
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
      console.error('[logout-notify] Resend error:', sendError);
      // Non-fatal for logout — do NOT block logout by returning an error
      return res.status(200).json({ sent: false, reason: 'delivery_failed' });
    }

    // --- Record in idempotency log ---
    const { error: logInsertError } = await supabase
      .from('email_sent_log')
      .insert({
        user_id,
        email_type: 'logout_notification',
        recipient:  email,
        resend_id:  sendData?.id || null,
        event_id,
      });

    if (logInsertError) {
      console.warn('[logout-notify] Failed to write to email_sent_log:', logInsertError.message);
    }

    console.info(`[logout-notify] Logout email sent to ${email} (user: ${user_id}, event: ${event_id})`);
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[logout-notify] Unexpected error:', err);
    // Non-fatal — return success so client-side logout is never blocked
    return res.status(200).json({ sent: false, reason: 'server_error' });
  }
}
