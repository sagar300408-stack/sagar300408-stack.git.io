-- ==========================================
-- 003: Enterprise Features (Settings, Plugins, Media, Logs, Webhooks)
-- ==========================================

-- 1. Global Settings
CREATE TABLE IF NOT EXISTS public.cms_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production', -- 'development', 'staging', 'production'
  category TEXT NOT NULL, -- e.g., 'seo', 'branding', 'integrations'
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(org_id, environment, category, key)
);

-- 2. Plugin Registry & Feature Flags
CREATE TABLE IF NOT EXISTS public.cms_plugins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  identifier TEXT NOT NULL, -- e.g., 'ai-assistant', 'resend-newsletter'
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  UNIQUE(org_id, identifier)
);

-- 3. Media Library Folders
CREATE TABLE IF NOT EXISTS public.cms_media_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.cms_media_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Media Library Files
CREATE TABLE IF NOT EXISTS public.cms_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.cms_media_folders(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage bucket
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Activity Log (Audit Trail)
CREATE TABLE IF NOT EXISTS public.cms_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'node.published', 'user.role_changed'
  entity_type TEXT NOT NULL, -- e.g., 'cms_nodes', 'user_roles'
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Outbound Webhooks
CREATE TABLE IF NOT EXISTS public.cms_webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- e.g., ['node.published', 'media.uploaded']
  is_active BOOLEAN DEFAULT true,
  secret_key TEXT, -- For payload signing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Security & RLS
-- ==========================================
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_webhooks ENABLE ROW LEVEL SECURITY;

-- General policy for Admins/Owners
CREATE POLICY "Owners and Admins manage enterprise features" ON public.cms_settings
  FOR ALL USING (public.has_role(auth.uid(), org_id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role]));
  
CREATE POLICY "Owners and Admins manage plugins" ON public.cms_plugins
  FOR ALL USING (public.has_role(auth.uid(), org_id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role]));

CREATE POLICY "Editors manage media folders" ON public.cms_media_folders
  FOR ALL USING (public.has_role(auth.uid(), org_id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role, 'editor'::oce_role]));

CREATE POLICY "Editors manage media" ON public.cms_media
  FOR ALL USING (public.has_role(auth.uid(), org_id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role, 'editor'::oce_role]));

CREATE POLICY "Activity log is read-only for admins" ON public.cms_activity_log
  FOR SELECT USING (public.has_role(auth.uid(), org_id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role]));

CREATE POLICY "Owners and Admins manage webhooks" ON public.cms_webhooks
  FOR ALL USING (public.has_role(auth.uid(), org_id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role]));
