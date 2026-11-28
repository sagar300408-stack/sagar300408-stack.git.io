/**
 * ORIGINYX — Logout Notification Email API Endpoint
 * ===================================================
 * POST /api/auth/logout-notify
 *
 * Sends a branded logout notification + feedback CTA email after a user
 * explicitly signs out.
 *
 * Idempotency & Duplicate Prevention:
 *  - Client-generated `event_id` (UUID) tracked in `email_sent_log`.
 *  - 60-second time-window deduplication per `user_id` prevents duplicate
 *    emails if both client portal and main site initiate logout.
 *
 * Security:
 *  - Validates user identity via Supabase auth token (if provided in Authorization header)
 *    or via Supabase admin user lookup.
 *  - Recipient email is strictly obtained from the verified account record.
 *  - Never exposes credentials or sensitive session data to the browser.
 *  - Logout is NOT blocked if email delivery fails (returns 200 with reason).
 *
 * Request body (JSON):
 *  {
 *    user_id    : string   — Supabase user UUID
 *    name       : string   — Display name (optional)
 *    email      : string   — Account email for verification
 *    logout_time: string   — ISO 8601 timestamp
 *    event_id   : string   — Client-generated UUID for idempotency
 *  }
 *
 * Response:
 *  200 { sent: true }
 *  200 { sent: false, reason: 'duplicate' | 'duplicate_recent_logout' | 'delivery_failed' }
 *  400 { error: '...' }
 *  500 { error: '...' }
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { logoutEmail } from '../emails/templates.js';

function isTableMissingError(error) {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const code = (error.code || '').toUpperCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table')
  );
}

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
  if (!event_id || typeof event_id !== 'string') {
    return res.status(400).json({ error: 'event_id is required.' });
  }

  // UUID format checks
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user_id format.' });
  }
  if (!uuidRegex.test(event_id)) {
    return res.status(400).json({ error: 'Invalid event_id format.' });
  }

  try {
    // --- Supabase admin client ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // --- Verify User & Identity: Require Valid Authenticated Session ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header with Bearer token is required.' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Authentication token is empty.' });
    }

    const { data: tokenData, error: tokenErr } = await supabase.auth.getUser(token);
    if (tokenErr || !tokenData?.user) {
      console.warn('[logout-notify] Token verification failed:', tokenErr?.message);
      return res.status(401).json({ error: 'Invalid or expired authentication session.' });
    }

    if (tokenData.user.id !== user_id) {
      console.warn(`[logout-notify] Token user mismatch: ${tokenData.user.id} vs ${user_id}`);
      return res.status(403).json({ error: 'Token user mismatch.' });
    }

    const trustedUser = tokenData.user;
    const trustedEmail = trustedUser.email;

    if (!trustedEmail || !trustedEmail.includes('@')) {
      return res.status(400).json({ error: 'User account has no associated email.' });
    }

    // --- Idempotency Check 1: Has this event_id already been processed? ---
    const { data: existingEventLog, error: eventLogErr } = await supabase
      .from('email_sent_log')
      .select('id')
      .eq('event_id', event_id)
      .eq('email_type', 'logout_notification')
      .maybeSingle();

    if (eventLogErr && !isTableMissingError(eventLogErr)) {
      console.error('[logout-notify] Event log check failed:', eventLogErr.message);
      return res.status(500).json({ error: 'Database error during idempotency check.' });
    }

    if (existingEventLog) {
      console.info(`[logout-notify] Duplicate skipped for event ${event_id}`);
      return res.status(200).json({ sent: false, reason: 'duplicate' });
    }

    // --- Idempotency Check 2: 60-second window deduplication ---
    // Prevents double notifications if both client-portal and main site initiate logout within 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentLog, error: recentLogErr } = await supabase
      .from('email_sent_log')
      .select('id')
      .eq('user_id', user_id)
      .eq('email_type', 'logout_notification')
      .gte('sent_at', oneMinuteAgo)
      .maybeSingle();

    if (recentLogErr && !isTableMissingError(recentLogErr)) {
      console.error('[logout-notify] Recent log check failed:', recentLogErr.message);
      return res.status(500).json({ error: 'Database error during idempotency check.' });
    }

    if (recentLog) {
      console.info(`[logout-notify] Duplicate skipped: recent logout notification already sent within 60s for user ${user_id}`);
      return res.status(200).json({ sent: false, reason: 'duplicate_recent_logout' });
    }

    // --- Build email content ---
    const recipientName = name || trustedUser.user_metadata?.full_name || trustedUser.user_metadata?.name || '';
    const { subject, html, text } = logoutEmail({
      name:       recipientName,
      email:      trustedEmail,
      logoutTime: logout_time || new Date().toISOString(),
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
      console.error('[logout-notify] Resend error:', sendError);
      // Non-fatal for logout — return 200 so client-side logout flow is never blocked
      return res.status(200).json({ sent: false, reason: 'delivery_failed' });
    }

    // --- Record in idempotency log ---
    const { error: logInsertError } = await supabase
      .from('email_sent_log')
      .insert({
        user_id,
        email_type: 'logout_notification',
        recipient:  trustedEmail,
        resend_id:  sendData?.id || null,
        event_id,
      });

    if (logInsertError) {
      if (isTableMissingError(logInsertError)) {
        console.warn('[logout-notify] email_sent_log table not found in schema cache. Idempotency log skipped.');
      } else {
        console.warn('[logout-notify] Failed to write to email_sent_log:', logInsertError.message);
      }
    }

    console.info(`[logout-notify] Logout email sent to ${trustedEmail} (user: ${user_id}, event: ${event_id})`);
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error('[logout-notify] Unexpected error:', err);
    // Non-fatal — return 200 so client-side logout is never blocked
    return res.status(200).json({ sent: false, reason: 'server_error' });
  }
}
