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
-- 1. Create table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_sent_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The Supabase auth user this email was sent for.
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Email type identifier:
  --   'welcome'              — first-time account welcome email (sent once per user)
  --   'logout_notification'  — explicit logout notification + feedback email
  email_type  text NOT NULL CHECK (email_type IN ('welcome', 'logout_notification')),

  -- The email address the message was delivered to.
  recipient   text NOT NULL,

  -- Resend message ID (for delivery tracking and auditing).
  resend_id   text,

  -- Client-generated UUID for logout events (prevents double-send
  -- when client-side logic fires more than once per logout).
  event_id    uuid,

  sent_at     timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. Partial unique indexes for distinct idempotency rules
-- ---------------------------------------------------------------------------

-- Rule A: Exactly ONE welcome email per user across the lifetime of the account
CREATE UNIQUE INDEX IF NOT EXISTS uq_welcome_per_user
  ON public.email_sent_log (user_id)
  WHERE email_type = 'welcome';

-- Rule B: Exactly ONE email per logout event_id
CREATE UNIQUE INDEX IF NOT EXISTS uq_logout_event_id
  ON public.email_sent_log (event_id)
  WHERE email_type = 'logout_notification' AND event_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Query performance indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_email_sent_log_user_id
  ON public.email_sent_log (user_id);

CREATE INDEX IF NOT EXISTS idx_email_sent_log_email_type
  ON public.email_sent_log (email_type);

CREATE INDEX IF NOT EXISTS idx_email_sent_log_sent_at
  ON public.email_sent_log (sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_sent_log_user_type_sent
  ON public.email_sent_log (user_id, email_type, sent_at DESC);

-- ---------------------------------------------------------------------------
-- 4. Row-Level Security (RLS)
-- ---------------------------------------------------------------------------
-- Deny all client-side direct access (anon and authenticated users).
-- Only the service role (bypassing RLS) may read and write this table.
-- ---------------------------------------------------------------------------
ALTER TABLE public.email_sent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_anon" ON public.email_sent_log;
CREATE POLICY "deny_all_anon" ON public.email_sent_log
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "deny_all_authenticated" ON public.email_sent_log;
CREATE POLICY "deny_all_authenticated" ON public.email_sent_log
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false);

-- ---------------------------------------------------------------------------
-- 5. Documentation comments
-- ---------------------------------------------------------------------------
COMMENT ON TABLE public.email_sent_log IS
  'Idempotency log for Originyx transactional emails. '
  'Prevents duplicate welcome and logout notification emails. '
  'Written exclusively by server-side APIs using the Supabase service role key.';

COMMENT ON COLUMN public.email_sent_log.email_type IS
  'Type of email dispatched: welcome | logout_notification';

COMMENT ON COLUMN public.email_sent_log.event_id IS
  'Client-generated UUID for logout actions. Prevents double-send per intentional logout.';
