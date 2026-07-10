-- ==========================================
-- 005: Bootstrap RPC Functions
-- Idempotent — safe to re-run at any time.
-- ==========================================

-- ── Prerequisites ────────────────────────────────────────────
-- Ensure system_settings table exists
CREATE TABLE IF NOT EXISTS public.system_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read system settings"          ON public.system_settings;
DROP POLICY IF EXISTS "Only owners can modify system settings"   ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only owners can update system settings"   ON public.system_settings;
DROP POLICY IF EXISTS "Anonymous can read initialization flag"   ON public.system_settings;

CREATE POLICY "Public can read system settings"
  ON public.system_settings FOR SELECT USING (true);

CREATE POLICY "Only owners can modify system settings"
  ON public.system_settings FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'owner'::oce_role
    )
  );

-- Partial unique index to fix ON CONFLICT for org-wide roles (workspace_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_org_wide_unique_idx
  ON public.user_roles (user_id, org_id)
  WHERE workspace_id IS NULL;

-- ── Fix user_roles RLS recursion ─────────────────────────────
DROP POLICY IF EXISTS "Users can view roles in their org"           ON public.user_roles;
DROP POLICY IF EXISTS "Owners and Admins can manage roles"          ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles"              ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in orgs they belong to" ON public.user_roles;

CREATE OR REPLACE FUNCTION public.get_my_role(_org_id UUID)
RETURNS oce_role LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE _role oce_role;
BEGIN
  SELECT role INTO _role FROM public.user_roles
  WHERE user_id = auth.uid() AND org_id = _org_id LIMIT 1;
  RETURN _role;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
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
-- FUNCTION 1: get_system_status()
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _initialized   BOOLEAN;
  _version       TEXT;
  _org           json;
  _workspace     json;
  _content_types json;
BEGIN
  SELECT (value->>'cms_initialized')::boolean
  INTO   _initialized
  FROM   public.system_settings
  WHERE  key = 'cms_initialized';

  _initialized := COALESCE(_initialized, false);

  IF NOT _initialized THEN
    RETURN json_build_object(
      'initialized',   false,
      'version',       null,
      'organization',  null,
      'workspace',     null,
      'content_types', '[]'::json
    );
  END IF;

  SELECT value->>'version' INTO _version
  FROM   public.system_settings WHERE key = 'cms_version';

  SELECT row_to_json(o) INTO _org
  FROM   public.organizations o LIMIT 1;

  SELECT row_to_json(w) INTO _workspace
  FROM   public.workspaces w LIMIT 1;

  SELECT json_agg(ct) INTO _content_types
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

GRANT EXECUTE ON FUNCTION public.get_system_status() TO anon;
GRANT EXECUTE ON FUNCTION public.get_system_status() TO authenticated;


-- ==========================================
-- FUNCTION 2: initialize_cms(...)
-- ==========================================
CREATE OR REPLACE FUNCTION public.initialize_cms(
  _org_name       TEXT,
  _org_slug       TEXT,
  _workspace_name TEXT,
  _workspace_slug TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _calling_user        UUID;
  _org_id              UUID;
  _workspace_id        UUID;
  _insights_type_id    UUID;
  _already_initialized BOOLEAN;
BEGIN
  PERFORM pg_advisory_xact_lock(987654321);

  SELECT (value->>'cms_initialized')::boolean INTO _already_initialized
  FROM   public.system_settings WHERE key = 'cms_initialized';

  IF COALESCE(_already_initialized, false) THEN
    RAISE EXCEPTION 'CMS_ALREADY_INITIALIZED';
  END IF;

  _calling_user := auth.uid();
  IF _calling_user IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  INSERT INTO public.organizations (name, slug) VALUES (_org_name, _org_slug)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO _org_id;
  IF _org_id IS NULL THEN
    SELECT id INTO _org_id FROM public.organizations WHERE slug = _org_slug;
  END IF;

  INSERT INTO public.workspaces (org_id, name, slug) VALUES (_org_id, _workspace_name, _workspace_slug)
  ON CONFLICT (org_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO _workspace_id;
  IF _workspace_id IS NULL THEN
    SELECT id INTO _workspace_id FROM public.workspaces WHERE org_id = _org_id AND slug = _workspace_slug;
  END IF;

  INSERT INTO public.cms_content_types (org_id, name, slug, description, schema) VALUES
    (_org_id, 'Insights',      'insights',      'Blog posts, research, and company updates.',
     '{"fields":["title","excerpt","cover_image","content","category","tags","seo_title","seo_description","featured"]}'::jsonb),
    (_org_id, 'Case Studies',  'case-studies',  'Customer success stories.',
     '{"fields":["title","excerpt","cover_image","content","client","industry","results","tags"]}'::jsonb),
    (_org_id, 'Documentation', 'documentation', 'Technical docs and guides.',
     '{"fields":["title","excerpt","content","version","category","tags"]}'::jsonb)
  ON CONFLICT (org_id, slug) DO UPDATE SET name = EXCLUDED.name;

  SELECT id INTO _insights_type_id FROM public.cms_content_types WHERE org_id = _org_id AND slug = 'insights';

  INSERT INTO public.cms_taxonomies (org_id, type, name, slug) VALUES
    (_org_id,'category','AI','ai'), (_org_id,'category','Automation','automation'),
    (_org_id,'category','Real Estate','real-estate'), (_org_id,'category','Manufacturing','manufacturing'),
    (_org_id,'category','Logistics','logistics'), (_org_id,'category','Customer Service','customer-service'),
    (_org_id,'category','Case Studies','case-studies'), (_org_id,'category','Product Updates','product-updates'),
    (_org_id,'category','Company News','company-news')
  ON CONFLICT (org_id, type, slug) DO NOTHING;

  INSERT INTO public.cms_taxonomies (org_id, type, name, slug) VALUES
    (_org_id,'tag','LLM','llm'), (_org_id,'tag','RAG','rag'), (_org_id,'tag','Agents','agents'),
    (_org_id,'tag','Workflow','workflow'), (_org_id,'tag','Integration','integration'),
    (_org_id,'tag','OpenAI','openai'), (_org_id,'tag','Supabase','supabase')
  ON CONFLICT (org_id, type, slug) DO NOTHING;

  INSERT INTO public.cms_settings (org_id, environment, category, key, value) VALUES
    (_org_id,'production','branding','site_name',     to_jsonb(_org_name)),
    (_org_id,'production','branding','site_slug',     to_jsonb(_org_slug)),
    (_org_id,'production','seo','default_title',      to_jsonb(_org_name || ' Insights')),
    (_org_id,'production','seo','meta_description',   '"AI-powered insights and automation strategies."'::jsonb),
    (_org_id,'production','ai','provider',            '"openai"'::jsonb),
    (_org_id,'production','ai','model',               '"gpt-4o"'::jsonb),
    (_org_id,'production','ai','temperature',         '0.7'::jsonb),
    (_org_id,'production','ai','embedding_model',     '"text-embedding-3-small"'::jsonb),
    (_org_id,'production','ai','vector_search_enabled','true'::jsonb)
  ON CONFLICT (org_id, environment, category, key) DO NOTHING;

  INSERT INTO public.user_roles (user_id, org_id, workspace_id, role)
  VALUES (_calling_user, _org_id, NULL, 'owner'::oce_role)
  ON CONFLICT (user_id, org_id) WHERE workspace_id IS NULL
  DO UPDATE SET role = 'owner'::oce_role;

  INSERT INTO public.system_settings (key, value)
  VALUES ('cms_initialized', '{"cms_initialized": true}'::jsonb)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  INSERT INTO public.system_settings (key, value)
  VALUES ('cms_version', '{"version": "1.0.0"}'::jsonb)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  INSERT INTO public.cms_activity_log (org_id, user_id, action, entity_type, entity_id, details)
  VALUES (_org_id, _calling_user, 'CMS_INITIALIZED', 'system', _org_id,
    json_build_object('version','1.0.0','org_name',_org_name,'initialized_at',now())::jsonb);

  RETURN json_build_object(
    'success', true, 'org_id', _org_id,
    'workspace_id', _workspace_id, 'insights_type_id', _insights_type_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_cms(TEXT, TEXT, TEXT, TEXT) TO authenticated;
