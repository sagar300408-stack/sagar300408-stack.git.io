-- ==========================================
-- 011: Originyx Control Center Business Tables
-- ==========================================
-- Creates the core tables for the Control Center:
-- leads, contacts, opportunities, internal_tasks,
-- cc_products (product portfolio), cc_subscriptions

-- ─── LEADS ────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS lead_status AS ENUM (
  'New', 'Contacted', 'Qualified', 'Disqualified', 'Converted'
);

CREATE TYPE IF NOT EXISTS lead_source AS ENUM (
  'Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Inbound', 'Other'
);

CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id        UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  company       TEXT,
  email         TEXT,
  phone         TEXT,
  source        lead_source DEFAULT 'Other',
  status        lead_status DEFAULT 'New',
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes         TEXT,
  next_action   TEXT,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can manage leads" ON public.leads
  FOR ALL USING (public.is_org_member(org_id));

-- ─── CONTACTS ─────────────────────────────────────────────────
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

CREATE POLICY "Org members can manage contacts" ON public.contacts
  FOR ALL USING (public.is_org_member(org_id));

-- ─── OPPORTUNITIES ─────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS opp_stage AS ENUM (
  'Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'
);

CREATE TABLE IF NOT EXISTS public.opportunities (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  company         TEXT,
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  product         TEXT,
  value           NUMERIC(12,2),
  currency        TEXT DEFAULT 'INR',
  stage           opp_stage DEFAULT 'Discovery',
  probability     INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close  DATE,
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  next_action     TEXT,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can manage opportunities" ON public.opportunities
  FOR ALL USING (public.is_org_member(org_id));

-- ─── INTERNAL TASKS ────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS task_status AS ENUM (
  'To Do', 'In Progress', 'Blocked', 'Completed', 'Cancelled'
);

CREATE TYPE IF NOT EXISTS task_priority AS ENUM (
  'Low', 'Medium', 'High', 'Critical'
);

CREATE TABLE IF NOT EXISTS public.internal_tasks (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id        UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        task_status DEFAULT 'To Do',
  priority      task_priority DEFAULT 'Medium',
  due_date      DATE,
  assignee_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  area          TEXT,  -- e.g. Sales, Growth, Product, Finance, Operations
  related_entity_type TEXT,  -- e.g. lead, opportunity, contact
  related_entity_id   UUID,
  completed_at  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.internal_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can manage tasks" ON public.internal_tasks
  FOR ALL USING (public.is_org_member(org_id));

-- ─── PRODUCT PORTFOLIO ─────────────────────────────────────────
CREATE TYPE IF NOT EXISTS product_status AS ENUM (
  'Concept', 'Development', 'Beta', 'Live', 'Deprecated', 'Discontinued'
);

CREATE TABLE IF NOT EXISTS public.cc_products (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id        UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  tagline       TEXT,
  description   TEXT,
  status        product_status DEFAULT 'Concept',
  website       TEXT,
  logo_url      TEXT,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(org_id, slug)
);

ALTER TABLE public.cc_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can manage products" ON public.cc_products
  FOR ALL USING (public.is_org_member(org_id));

-- ─── SUBSCRIPTIONS ─────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS subscription_status AS ENUM (
  'Trial', 'Active', 'Past Due', 'Paused', 'Cancelled', 'Expired'
);

CREATE TABLE IF NOT EXISTS public.cc_subscriptions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  customer_org_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT NOT NULL,
  product_id      UUID REFERENCES public.cc_products(id) ON DELETE RESTRICT NOT NULL,
  plan_name       TEXT NOT NULL,
  status          subscription_status DEFAULT 'Trial',
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

CREATE POLICY "Org members can manage subscriptions" ON public.cc_subscriptions
  FOR ALL USING (public.is_org_member(org_id));

-- ─── PROJECTS ──────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS project_status AS ENUM (
  'Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'
);

CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id        UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  status        project_status DEFAULT 'Planning',
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority      task_priority DEFAULT 'Medium',
  start_date    DATE,
  due_date      DATE,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can manage projects" ON public.projects
  FOR ALL USING (public.is_org_member(org_id));
