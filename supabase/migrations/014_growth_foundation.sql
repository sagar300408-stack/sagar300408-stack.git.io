-- ============================================================
-- 014: Growth Module Foundation
-- Idempotent & Safe — Follows existing Originyx schema conventions
-- ============================================================
-- Creates the foundational settings and configuration schema for
-- the Growth module (Marketing, Content, Social, Campaigns, Analytics).
-- Preserves strict multi-tenant isolation via org_id foreign key
-- and Row-Level Security (RLS) policies.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.growth_module_settings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  enabled_modules TEXT[] DEFAULT ARRAY['marketing', 'content', 'social', 'campaigns', 'analytics']::text[] NOT NULL,
  metadata        JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for tenant lookups
CREATE INDEX IF NOT EXISTS idx_growth_module_settings_org_id 
  ON public.growth_module_settings(org_id);

-- Enable RLS
ALTER TABLE public.growth_module_settings ENABLE ROW LEVEL SECURITY;

-- Ensure entity_id in cms_activity_log is nullable for general module-level events
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'cms_activity_log' 
      AND column_name = 'entity_id' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.cms_activity_log ALTER COLUMN entity_id DROP NOT NULL;
  END IF;
END $$;

-- RLS Policies: Tenant isolation via is_org_member helper
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'growth_module_settings' AND policyname = 'Org members can view growth module settings'
  ) THEN
    CREATE POLICY "Org members can view growth module settings" 
      ON public.growth_module_settings
      FOR SELECT USING (public.is_org_member(org_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'growth_module_settings' AND policyname = 'Org members can manage growth module settings'
  ) THEN
    CREATE POLICY "Org members can manage growth module settings" 
      ON public.growth_module_settings
      FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;
