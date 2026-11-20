-- ============================================================================
-- Migration 018: Email Sent Log (Idempotency)
-- ============================================================================
-- Purpose:
--   Provides a durable, server-side idempotency mechanism for transactional
--   emails. Prevents duplicate welcome and logout notification emails from
--   being sent to the same user.
--
-- Table: email_sent_log
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Create table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_sent_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The Supabase auth user this email was sent for.
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Email type identifier.
  --   'welcome'              — first-time account welcome email
  --   'logout_notification'  — explicit logout notification + feedback email
  email_type  text NOT NULL CHECK (email_type IN ('welcome', 'logout_notification')),

  -- The email address the message was delivered to.
  recipient   text NOT NULL,

  -- Resend message ID (for delivery tracking and debugging).
  resend_id   text,

  -- Optional: client-generated UUID for logout events (prevents double-send
  -- when the client fires the notification API more than once per logout).
  event_id    uuid,

  sent_at     timestamptz NOT NULL DEFAULT now(),

  -- Composite unique constraints enforce idempotency:
  --   One welcome per user.
  CONSTRAINT uq_welcome_per_user UNIQUE (user_id, email_type)
    DEFERRABLE INITIALLY IMMEDIATE
);

-- ---------------------------------------------------------------------------
-- Allow duplicate upsert for logout events keyed on event_id
-- ---------------------------------------------------------------------------
-- For logout notifications, we use event_id-level idempotency instead of
-- user_id-level (a user may legitimately log out many times).
-- Drop the UNIQUE constraint we just added for logout_notification,
-- and instead create a partial unique index on event_id:
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_logout_event_id
  ON public.email_sent_log (event_id)
  WHERE email_type = 'logout_notification' AND event_id IS NOT NULL;

-- For welcome emails, keep the (user_id, email_type) unique constraint.
-- For logout_notification the per-event uniqueness comes from uq_logout_event_id above.
-- So we soften the main constraint to only cover 'welcome':
ALTER TABLE public.email_sent_log
  DROP CONSTRAINT IF EXISTS uq_welcome_per_user;

CREATE UNIQUE INDEX IF NOT EXISTS uq_welcome_per_user
  ON public.email_sent_log (user_id)
  WHERE email_type = 'welcome';

-- ---------------------------------------------------------------------------
-- Indexes for query performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_email_sent_log_user_id
  ON public.email_sent_log (user_id);

CREATE INDEX IF NOT EXISTS idx_email_sent_log_email_type
  ON public.email_sent_log (email_type);

CREATE INDEX IF NOT EXISTS idx_email_sent_log_sent_at
  ON public.email_sent_log (sent_at DESC);

-- ---------------------------------------------------------------------------
-- Row-Level Security (RLS)
-- ---------------------------------------------------------------------------
-- Only the service role (server-side API) may read and write this table.
-- No direct client access is permitted.
-- ---------------------------------------------------------------------------
ALTER TABLE public.email_sent_log ENABLE ROW LEVEL SECURITY;

-- Allow the authenticated service role to bypass RLS (default Postgres behaviour).
-- Deny all access to anonymous and authenticated Supabase anon key users.
CREATE POLICY "deny_all_anon" ON public.email_sent_log
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false);

CREATE POLICY "deny_all_authenticated" ON public.email_sent_log
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false);

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------
COMMENT ON TABLE public.email_sent_log IS
  'Idempotency log for Originyx transactional emails. '
  'Prevents duplicate welcome and logout notification emails. '
  'Written exclusively by the server-side Vercel API using the service role key.';

COMMENT ON COLUMN public.email_sent_log.email_type IS
  'welcome | logout_notification';

COMMENT ON COLUMN public.email_sent_log.event_id IS
  'Client-generated UUID for logout events. Prevents double-send per logout action.';
