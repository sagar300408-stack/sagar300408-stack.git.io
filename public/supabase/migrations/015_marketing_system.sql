-- ============================================================
-- 015: Marketing Management System (Phase 2)
-- Idempotent & Safe — Follows Originyx Control Center Conventions
-- ============================================================
-- Creates the persistent data foundations for:
-- 1. marketing_objectives (Strategic goals and target metrics)
-- 2. marketing_audiences (Audience segmentation)
-- 3. marketing_icp_profiles (Ideal customer profiles)
-- 4. marketing_channels (Acquisition channel configuration and CRM mapping)
-- 5. marketing_experiments (Growth hypotheses and testing lifecycle)
-- 6. marketing_initiatives (Strategic programs with operations tasks)
-- Preserves strict multi-tenant isolation via org_id foreign keys and RLS.
-- ============================================================

-- ── 1. MARKETING OBJECTIVES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketing_objectives (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  target_metric   TEXT NOT NULL,
  current_value   NUMERIC(12,2) DEFAULT 0 NOT NULL,
  target_value    NUMERIC(12,2) NOT NULL,
  unit            TEXT DEFAULT 'count' NOT NULL,
  start_date      DATE DEFAULT CURRENT_DATE NOT NULL,
  target_date     DATE NOT NULL,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'behind', 'paused', 'archived')) NOT NULL,
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name      TEXT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketing_objectives_org_id ON public.marketing_objectives(org_id);
ALTER TABLE public.marketing_objectives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_objectives' AND policyname = 'Org members can view marketing objectives') THEN
    CREATE POLICY "Org members can view marketing objectives" ON public.marketing_objectives FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_objectives' AND policyname = 'Org members can manage marketing objectives') THEN
    CREATE POLICY "Org members can manage marketing objectives" ON public.marketing_objectives FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ── 2. MARKETING AUDIENCES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketing_audiences (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id            UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name              TEXT NOT NULL,
  industry          TEXT NOT NULL,
  company_size      TEXT NOT NULL,
  geographic_market TEXT NOT NULL,
  business_type     TEXT NOT NULL,
  target_roles      TEXT[] DEFAULT '{}'::text[] NOT NULL,
  pain_points       TEXT[] DEFAULT '{}'::text[] NOT NULL,
  buying_intent     TEXT DEFAULT 'medium' CHECK (buying_intent IN ('low', 'medium', 'high', 'urgent')) NOT NULL,
  description       TEXT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'evaluating', 'archived')) NOT NULL,
  created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketing_audiences_org_id ON public.marketing_audiences(org_id);
ALTER TABLE public.marketing_audiences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_audiences' AND policyname = 'Org members can view marketing audiences') THEN
    CREATE POLICY "Org members can view marketing audiences" ON public.marketing_audiences FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_audiences' AND policyname = 'Org members can manage marketing audiences') THEN
    CREATE POLICY "Org members can manage marketing audiences" ON public.marketing_audiences FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ── 3. MARKETING ICP PROFILES ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketing_icp_profiles (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id                UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name                  TEXT NOT NULL,
  industry              TEXT NOT NULL,
  company_size          TEXT NOT NULL,
  revenue_range         TEXT,
  geography             TEXT NOT NULL,
  technology_maturity   TEXT NOT NULL,
  business_challenges   TEXT[] DEFAULT '{}'::text[] NOT NULL,
  decision_maker_roles  TEXT[] DEFAULT '{}'::text[] NOT NULL,
  qualification_criteria TEXT[] DEFAULT '{}'::text[] NOT NULL,
  is_primary            BOOLEAN DEFAULT false NOT NULL,
  notes                 TEXT,
  created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketing_icp_profiles_org_id ON public.marketing_icp_profiles(org_id);
ALTER TABLE public.marketing_icp_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_icp_profiles' AND policyname = 'Org members can view marketing icp profiles') THEN
    CREATE POLICY "Org members can view marketing icp profiles" ON public.marketing_icp_profiles FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_icp_profiles' AND policyname = 'Org members can manage marketing icp profiles') THEN
    CREATE POLICY "Org members can manage marketing icp profiles" ON public.marketing_icp_profiles FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ── 4. MARKETING ACQUISITION CHANNELS ────────────────────────
CREATE TABLE IF NOT EXISTS public.marketing_channels (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id              UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('Inbound', 'Outbound', 'Referral', 'Organic', 'Paid', 'Event', 'Other')),
  crm_source_mapping  TEXT,
  description         TEXT,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'evaluating', 'paused')) NOT NULL,
  owner_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name          TEXT,
  monthly_budget      NUMERIC(12,2) DEFAULT 0 NOT NULL,
  target_cpl          NUMERIC(12,2),
  metadata            JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(org_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_marketing_channels_org_id ON public.marketing_channels(org_id);
ALTER TABLE public.marketing_channels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_channels' AND policyname = 'Org members can view marketing channels') THEN
    CREATE POLICY "Org members can view marketing channels" ON public.marketing_channels FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_channels' AND policyname = 'Org members can manage marketing channels') THEN
    CREATE POLICY "Org members can manage marketing channels" ON public.marketing_channels FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ── 5. MARKETING EXPERIMENTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketing_experiments (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id              UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name                TEXT NOT NULL,
  hypothesis          TEXT NOT NULL,
  objective_id        UUID REFERENCES public.marketing_objectives(id) ON DELETE SET NULL,
  target_audience     TEXT,
  channel_id          UUID REFERENCES public.marketing_channels(id) ON DELETE SET NULL,
  channel_name        TEXT,
  start_date          DATE,
  end_date            DATE,
  owner_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name          TEXT,
  success_metric      TEXT NOT NULL,
  target_value        TEXT NOT NULL,
  actual_result       TEXT,
  status              TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'running', 'paused', 'completed', 'analyzed', 'cancelled')) NOT NULL,
  expected_outcome    TEXT,
  actual_outcome      TEXT,
  result_verdict      TEXT CHECK (result_verdict IS NULL OR result_verdict IN ('success', 'failure', 'inconclusive')),
  observations        TEXT,
  lessons_learned     TEXT,
  recommendations     TEXT,
  conclusion          TEXT,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketing_experiments_org_id ON public.marketing_experiments(org_id);
ALTER TABLE public.marketing_experiments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_experiments' AND policyname = 'Org members can view marketing experiments') THEN
    CREATE POLICY "Org members can view marketing experiments" ON public.marketing_experiments FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_experiments' AND policyname = 'Org members can manage marketing experiments') THEN
    CREATE POLICY "Org members can manage marketing experiments" ON public.marketing_experiments FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

-- ── 6. MARKETING INITIATIVES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketing_initiatives (
  id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id                  UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name                    TEXT NOT NULL,
  description             TEXT,
  objective_id            UUID REFERENCES public.marketing_objectives(id) ON DELETE SET NULL,
  channel_id              UUID REFERENCES public.marketing_channels(id) ON DELETE SET NULL,
  channel_name            TEXT,
  owner_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name              TEXT,
  priority                TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) NOT NULL,
  start_date              DATE,
  target_completion_date  DATE,
  budget                  NUMERIC(12,2) DEFAULT 0 NOT NULL,
  spend                   NUMERIC(12,2) DEFAULT 0 NOT NULL,
  status                  TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled')) NOT NULL,
  related_experiment_id   UUID REFERENCES public.marketing_experiments(id) ON DELETE SET NULL,
  notes                   TEXT,
  created_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketing_initiatives_org_id ON public.marketing_initiatives(org_id);
ALTER TABLE public.marketing_initiatives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_initiatives' AND policyname = 'Org members can view marketing initiatives') THEN
    CREATE POLICY "Org members can view marketing initiatives" ON public.marketing_initiatives FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_initiatives' AND policyname = 'Org members can manage marketing initiatives') THEN
    CREATE POLICY "Org members can manage marketing initiatives" ON public.marketing_initiatives FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;
