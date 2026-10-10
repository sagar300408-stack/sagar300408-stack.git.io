-- ==========================================
-- 012: Control Center Schema Repairs
-- ==========================================
-- PURPOSE: Safe idempotent repair migration.
--   1. Adds 'employee_count' alias column to organizations (maps to company_size)
--      to maintain backward compatibility with any code that still queries it.
--      The canonical column is 'company_size' (added in migration 010).
--   2. Re-applies all 011 Control Center tables with IF NOT EXISTS guards
--      so this migration is safe to run whether 011 was applied or not.
--   3. All objects use IF NOT EXISTS / CREATE OR REPLACE — no data destruction.
-- ==========================================

-- ─── ORGANIZATIONS: add employee_count as alias ────────────────────────────
-- Migration 010 added company_size TEXT. Some frontend code queries employee_count.
-- Rather than rename company_size (which would break Profile.tsx that uses it),
-- we add employee_count as a separate nullable column. The application now uses
-- company_size everywhere (see code fixes in Customers.tsx).
-- This column is kept for forward-compatibility but the UI will use company_size.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS employee_count TEXT;

-- ─── ENUM TYPES (idempotent via DO blocks) ─────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE public.lead_status AS ENUM (
      'New', 'Contacted', 'Qualified', 'Disqualified', 'Converted'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
    CREATE TYPE public.lead_source AS ENUM (
      'Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Inbound', 'Other'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opp_stage') THEN
    CREATE TYPE public.opp_stage AS ENUM (
      'Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM (
      'To Do', 'In Progress', 'Blocked', 'Completed', 'Cancelled'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE public.task_priority AS ENUM (
      'Low', 'Medium', 'High', 'Critical'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE public.product_status AS ENUM (
      'Concept', 'Development', 'Beta', 'Live', 'Deprecated', 'Discontinued'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE public.subscription_status AS ENUM (
      'Trial', 'Active', 'Past Due', 'Paused', 'Cancelled', 'Expired'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM (
      'Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'
    );
  END IF;
END $$;

-- ─── is_org_member helper (required by RLS policies) ───────────────────────
-- Safe to re-run: CREATE OR REPLACE replaces any existing version.
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.org_id = _org_id
      AND user_roles.user_id = auth.uid()
  );
$$;

-- ─── LEADS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id        UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  company       TEXT,
  email         TEXT,
  phone         TEXT,
  source        public.lead_source DEFAULT 'Other',
  status        public.lead_status DEFAULT 'New',
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes         TEXT,
  next_action   TEXT,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Org members can manage leads'
  ) THEN
    CREATE POLICY "Org members can manage leads" ON public.leads
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ─── CONTACTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id        UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  title         TEXT,
  company       TEXT,
  linkedin      TEXT,
  notes         TEXT,
  tags          TEXT[],
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Org members can manage contacts'
  ) THEN
    CREATE POLICY "Org members can manage contacts" ON public.contacts
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ─── OPPORTUNITIES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.opportunities (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  company         TEXT,
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  product         TEXT,
  value           NUMERIC(12,2),
  currency        TEXT DEFAULT 'INR',
  stage           public.opp_stage DEFAULT 'Discovery',
  probability     INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close  DATE,
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  next_action     TEXT,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'opportunities' AND policyname = 'Org members can manage opportunities'
  ) THEN
    CREATE POLICY "Org members can manage opportunities" ON public.opportunities
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ─── INTERNAL TASKS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_tasks (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id              UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  status              public.task_status DEFAULT 'To Do',
  priority            public.task_priority DEFAULT 'Medium',
  due_date            DATE,
  assignee_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  area                TEXT,
  related_entity_type TEXT,
  related_entity_id   UUID,
  completed_at        TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.internal_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'internal_tasks' AND policyname = 'Org members can manage tasks'
  ) THEN
    CREATE POLICY "Org members can manage tasks" ON public.internal_tasks
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ─── PRODUCT PORTFOLIO ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cc_products (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id      UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  tagline     TEXT,
  description TEXT,
  status      public.product_status DEFAULT 'Concept',
  website     TEXT,
  logo_url    TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(org_id, slug)
);

ALTER TABLE public.cc_products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cc_products' AND policyname = 'Org members can manage products'
  ) THEN
    CREATE POLICY "Org members can manage products" ON public.cc_products
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ─── SUBSCRIPTIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cc_subscriptions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  customer_org_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT NOT NULL,
  product_id      UUID REFERENCES public.cc_products(id) ON DELETE RESTRICT NOT NULL,
  plan_name       TEXT NOT NULL,
  status          public.subscription_status DEFAULT 'Trial',
  value           NUMERIC(12,2),
  currency        TEXT DEFAULT 'INR',
  start_date      DATE DEFAULT CURRENT_DATE,
  renewal_date    DATE,
  trial_ends      DATE,
  notes           TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.cc_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cc_subscriptions' AND policyname = 'Org members can manage subscriptions'
  ) THEN
    CREATE POLICY "Org members can manage subscriptions" ON public.cc_subscriptions
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ─── PROJECTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id      UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  status      public.project_status DEFAULT 'Planning',
  owner_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority    public.task_priority DEFAULT 'Medium',
  start_date  DATE,
  due_date    DATE,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Org members can manage projects'
  ) THEN
    CREATE POLICY "Org members can manage projects" ON public.projects
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ─── INDEXES for performance ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_org_id         ON public.leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_status         ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_owner          ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id      ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_opps_org_id          ON public.opportunities(org_id);
CREATE INDEX IF NOT EXISTS idx_opps_stage           ON public.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id         ON public.internal_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee       ON public.internal_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status         ON public.internal_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cc_products_org_id   ON public.cc_products(org_id);
CREATE INDEX IF NOT EXISTS idx_cc_subs_org_id       ON public.cc_subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_cc_subs_status       ON public.cc_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_projects_org_id      ON public.projects(org_id);
