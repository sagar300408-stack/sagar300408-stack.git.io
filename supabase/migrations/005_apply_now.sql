-- ============================================================
-- STANDALONE FIX: Create get_system_status() and initialize_cms()
-- 
-- Paste this entire script into:
--   Supabase Dashboard → SQL Editor → Run
--
-- This is safe to run on a database that already has the 
-- tables from migrations 001–003.
-- ============================================================


-- ==========================================
-- STEP 1: Create system_settings table
-- (Needed by both functions below)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can read init flag"                      ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only owners can update system settings"       ON public.system_settings;
DROP POLICY IF EXISTS "Anonymous can read initialization flag"       ON public.system_settings;

-- anon + authenticated can SELECT (needed for pre-login bootstrap check)
CREATE POLICY "Public can read system settings"
  ON public.system_settings FOR SELECT
  USING (true);

-- Only owners can modify (via SECURITY DEFINER RPC, not directly)
CREATE POLICY "Only owners can modify system settings"
  ON public.system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'owner'::oce_role
    )
  );


-- ==========================================
-- STEP 2: Fix user_roles NULL unique index
-- ==========================================
-- PostgreSQL treats NULLs as non-equal in UNIQUE constraints.
-- This partial index ensures ON CONFLICT works for org-wide roles.
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_org_wide_unique_idx
  ON public.user_roles (user_id, org_id)
  WHERE workspace_id IS NULL;


-- ==========================================
-- STEP 3: SECURITY DEFINER helper functions
-- (Fix RLS recursion on user_roles)
-- ==========================================
DROP POLICY IF EXISTS "Users can view roles in their org"            ON public.user_roles;
DROP POLICY IF EXISTS "Owners and Admins can manage roles"           ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles"               ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in orgs they belong to"  ON public.user_roles;

CREATE OR REPLACE FUNCTION public.get_my_role(_org_id UUID)
RETURNS oce_role
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE _role oce_role;
BEGIN
  SELECT role INTO _role
  FROM public.user_roles
  WHERE user_id = auth.uid() AND org_id = _org_id
  LIMIT 1;
  RETURN _role;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND org_id = _org_id
  );
END;
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view roles in orgs they belong to"
  ON public.user_roles FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Owners and Admins can manage roles"
  ON public.user_roles FOR ALL USING (
    public.get_my_role(org_id) IN ('owner'::oce_role, 'admin'::oce_role)
  );


-- ==========================================
-- STEP 4: get_system_status()
-- Called by the frontend on every page load.
-- No parameters. Returns JSON.
-- Executable by anon + authenticated.
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  _initialized   BOOLEAN;
  _version       TEXT;
  _org           json;
  _workspace     json;
  _content_types json;
BEGIN
  -- Check the dedicated initialization flag
  SELECT (value->>'cms_initialized')::boolean
  INTO   _initialized
  FROM   public.system_settings
  WHERE  key = 'cms_initialized';

  _initialized := COALESCE(_initialized, false);

  -- If not initialized, return early with safe defaults
  IF NOT _initialized THEN
    RETURN json_build_object(
      'initialized',   false,
      'version',       null,
      'organization',  null,
      'workspace',     null,
      'content_types', '[]'::json
    );
  END IF;

  -- Fetch version string
  SELECT value->>'version'
  INTO   _version
  FROM   public.system_settings
  WHERE  key = 'cms_version';

  -- First organization
  SELECT row_to_json(o)
  INTO   _org
  FROM   public.organizations o
  LIMIT  1;

  -- First workspace
  SELECT row_to_json(w)
  INTO   _workspace
  FROM   public.workspaces w
  LIMIT  1;

  -- All content types
  SELECT json_agg(ct)
  INTO   _content_types
  FROM   public.cms_content_types ct;

  RETURN json_build_object(
    'initialized',   true,
    'version',       _version,
    'organization',  _org,
    'workspace',     _workspace,
    'content_types', COALESCE(_content_types, '[]'::json)
  );
END;
$$;

-- Grant execute to both roles so supabase.rpc('get_system_status') works
GRANT EXECUTE ON FUNCTION public.get_system_status() TO anon;
GRANT EXECUTE ON FUNCTION public.get_system_status() TO authenticated;


-- ==========================================
-- STEP 5: initialize_cms()
-- Called once by the Setup Wizard.
-- Concurrent-safe via advisory lock.
-- Fully idempotent (all UPSERTs).
-- ==========================================
CREATE OR REPLACE FUNCTION public.initialize_cms(
  _org_name       TEXT,
  _org_slug       TEXT,
  _workspace_name TEXT,
  _workspace_slug TEXT
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _calling_user        UUID;
  _org_id              UUID;
  _workspace_id        UUID;
  _insights_type_id    UUID;
  _already_initialized BOOLEAN;
BEGIN
  -- Serialize concurrent calls (two browsers clicking simultaneously)
  PERFORM pg_advisory_xact_lock(987654321);

  -- Re-check inside the lock
  SELECT (value->>'cms_initialized')::boolean
  INTO   _already_initialized
  FROM   public.system_settings
  WHERE  key = 'cms_initialized';

  IF COALESCE(_already_initialized, false) THEN
    RAISE EXCEPTION 'CMS_ALREADY_INITIALIZED: The CMS has already been set up.';
  END IF;

  -- Must be authenticated; never hardcode a user
  _calling_user := auth.uid();
  IF _calling_user IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: Sign in before initializing the CMS.';
  END IF;

  -- Organization
  INSERT INTO public.organizations (name, slug)
  VALUES (_org_name, _org_slug)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO _org_id;

  IF _org_id IS NULL THEN
    SELECT id INTO _org_id FROM public.organizations WHERE slug = _org_slug;
  END IF;

  -- Workspace
  INSERT INTO public.workspaces (org_id, name, slug)
  VALUES (_org_id, _workspace_name, _workspace_slug)
  ON CONFLICT (org_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO _workspace_id;

  IF _workspace_id IS NULL THEN
    SELECT id INTO _workspace_id
    FROM   public.workspaces
    WHERE  org_id = _org_id AND slug = _workspace_slug;
  END IF;

  -- Content Types: Insights, Case Studies, Documentation
  INSERT INTO public.cms_content_types (org_id, name, slug, description, schema) VALUES
    (_org_id, 'Insights', 'insights',
     'Blog posts, research, and company updates.',
     '{"fields":["title","excerpt","cover_image","content","category","tags","seo_title","seo_description","featured"]}'::jsonb),
    (_org_id, 'Case Studies', 'case-studies',
     'Customer success stories and project showcases.',
     '{"fields":["title","excerpt","cover_image","content","client","industry","results","tags"]}'::jsonb),
    (_org_id, 'Documentation', 'documentation',
     'Technical docs, guides, and API references.',
     '{"fields":["title","excerpt","content","version","category","tags"]}'::jsonb)
  ON CONFLICT (org_id, slug) DO UPDATE SET name = EXCLUDED.name;

  -- Grab the insights type id for the return value
  SELECT id INTO _insights_type_id
  FROM   public.cms_content_types
  WHERE  org_id = _org_id AND slug = 'insights';

  -- Default Categories
  INSERT INTO public.cms_taxonomies (org_id, type, name, slug) VALUES
    (_org_id, 'category', 'AI',               'ai'),
    (_org_id, 'category', 'Automation',       'automation'),
    (_org_id, 'category', 'Real Estate',      'real-estate'),
    (_org_id, 'category', 'Manufacturing',    'manufacturing'),
    (_org_id, 'category', 'Logistics',        'logistics'),
    (_org_id, 'category', 'Customer Service', 'customer-service'),
    (_org_id, 'category', 'Case Studies',     'case-studies'),
    (_org_id, 'category', 'Product Updates',  'product-updates'),
    (_org_id, 'category', 'Company News',     'company-news')
  ON CONFLICT (org_id, type, slug) DO NOTHING;

  -- Default Tags
  INSERT INTO public.cms_taxonomies (org_id, type, name, slug) VALUES
    (_org_id, 'tag', 'LLM',         'llm'),
    (_org_id, 'tag', 'RAG',         'rag'),
    (_org_id, 'tag', 'Agents',      'agents'),
    (_org_id, 'tag', 'Workflow',    'workflow'),
    (_org_id, 'tag', 'Integration', 'integration'),
    (_org_id, 'tag', 'OpenAI',      'openai'),
    (_org_id, 'tag', 'Supabase',    'supabase')
  ON CONFLICT (org_id, type, slug) DO NOTHING;

  -- CMS & AI Settings
  INSERT INTO public.cms_settings (org_id, environment, category, key, value) VALUES
    (_org_id, 'production', 'branding', 'site_name',             to_jsonb(_org_name)),
    (_org_id, 'production', 'branding', 'site_slug',             to_jsonb(_org_slug)),
    (_org_id, 'production', 'seo',      'default_title',         to_jsonb(_org_name || ' Insights')),
    (_org_id, 'production', 'seo',      'meta_description',      '"AI-powered insights and automation strategies."'::jsonb),
    (_org_id, 'production', 'ai',       'provider',              '"openai"'::jsonb),
    (_org_id, 'production', 'ai',       'model',                 '"gpt-4o"'::jsonb),
    (_org_id, 'production', 'ai',       'temperature',           '0.7'::jsonb),
    (_org_id, 'production', 'ai',       'embedding_model',       '"text-embedding-3-small"'::jsonb),
    (_org_id, 'production', 'ai',       'vector_search_enabled', 'true'::jsonb)
  ON CONFLICT (org_id, environment, category, key) DO NOTHING;

  -- Assign caller as Owner
  -- Uses the partial unique index (workspace_id IS NULL)
  INSERT INTO public.user_roles (user_id, org_id, workspace_id, role)
  VALUES (_calling_user, _org_id, NULL, 'owner'::oce_role)
  ON CONFLICT (user_id, org_id) WHERE workspace_id IS NULL
  DO UPDATE SET role = 'owner'::oce_role;

  -- Set initialization flag
  INSERT INTO public.system_settings (key, value)
  VALUES ('cms_initialized', '{"cms_initialized": true}'::jsonb)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  INSERT INTO public.system_settings (key, value)
  VALUES ('cms_version', '{"version": "1.0.0"}'::jsonb)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  -- Audit log
  INSERT INTO public.cms_activity_log
    (org_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    _org_id,
    _calling_user,
    'CMS_INITIALIZED',
    'system',
    _org_id,
    json_build_object(
      'version',        '1.0.0',
      'org_name',       _org_name,
      'workspace_name', _workspace_name,
      'initialized_at', now()
    )::jsonb
  );

  RETURN json_build_object(
    'success',          true,
    'org_id',           _org_id,
    'workspace_id',     _workspace_id,
    'insights_type_id', _insights_type_id
  );
END;
$$;

-- Grant execute to authenticated users only (setup requires sign-in)
GRANT EXECUTE ON FUNCTION public.initialize_cms(TEXT, TEXT, TEXT, TEXT) TO authenticated;


-- ==========================================
-- STEP 6: Quick verification
-- Should return: {"initialized": false, ...}
-- (or true if you already ran the wizard)
-- ==========================================
SELECT public.get_system_status();


-- ==========================================
-- STEP 7 (OPTIONAL — existing data only)
-- If you already have an organization from a
-- previous manual seed, uncomment this block to
-- mark it as initialized and skip the wizard.
-- ==========================================
/*
DO $$
DECLARE _org_id UUID;
BEGIN
  SELECT id INTO _org_id FROM public.organizations LIMIT 1;
  IF _org_id IS NOT NULL THEN
    INSERT INTO public.system_settings (key, value)
    VALUES ('cms_initialized', '{"cms_initialized": true}'::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

    INSERT INTO public.system_settings (key, value)
    VALUES ('cms_version', '{"version": "1.0.0"}'::jsonb)
    ON CONFLICT (key) DO NOTHING;

    RAISE NOTICE 'Existing installation flagged as initialized. Org: %', _org_id;
  ELSE
    RAISE NOTICE 'No organization found. Go through the Setup Wizard instead.';
  END IF;
END$$;
*/
