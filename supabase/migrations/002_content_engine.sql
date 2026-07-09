-- ==========================================
-- 002: Content Engine (Schemas, Nodes, Revisions, Locking)
-- ==========================================

-- 1. Dynamic Content Types (Schemas)
CREATE TABLE IF NOT EXISTS public.cms_content_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,       -- e.g., 'Insights', 'Case Studies'
  slug TEXT NOT NULL,       -- e.g., 'insights', 'case-studies'
  description TEXT,
  schema JSONB NOT NULL DEFAULT '{}'::jsonb, -- Defines the expected fields/blocks
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(org_id, slug)
);

-- Content Status Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oce_status') THEN
        CREATE TYPE oce_status AS ENUM ('Draft', 'In Review', 'Approved', 'Scheduled', 'Published', 'Archived', 'Deleted');
    END IF;
END$$;

-- 2. Content Nodes
CREATE TABLE IF NOT EXISTS public.cms_nodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type_id UUID REFERENCES public.cms_content_types(id) ON DELETE CASCADE NOT NULL,
  
  -- Core Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- TipTap JSON representation
  
  -- Metadata
  cover_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status oce_status NOT NULL DEFAULT 'Draft',
  reading_time_minutes INTEGER DEFAULT 0,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- Time tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  publish_at TIMESTAMP WITH TIME ZONE, -- For scheduling via pg_cron
  
  -- Soft Delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  UNIQUE(org_id, type_id, slug)
);

-- 3. Content Revisions
CREATE TABLE IF NOT EXISTS public.cms_revisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  node_id UUID REFERENCES public.cms_nodes(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Content Locks
CREATE TABLE IF NOT EXISTS public.cms_locks (
  node_id UUID REFERENCES public.cms_nodes(id) ON DELETE CASCADE PRIMARY KEY,
  locked_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL -- Locks should auto-expire if editor drops
);

-- 5. Taxonomies (Categories & Tags)
CREATE TABLE IF NOT EXISTS public.cms_taxonomies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'category' or 'tag'
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(org_id, type, slug)
);

CREATE TABLE IF NOT EXISTS public.cms_node_taxonomies (
  node_id UUID REFERENCES public.cms_nodes(id) ON DELETE CASCADE NOT NULL,
  taxonomy_id UUID REFERENCES public.cms_taxonomies(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (node_id, taxonomy_id)
);

-- ==========================================
-- Security & RLS
-- ==========================================
ALTER TABLE public.cms_content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_taxonomies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_node_taxonomies ENABLE ROW LEVEL SECURITY;

-- Base Policies (Simplified for brevity, assuming standard RBAC)
-- Admins/Editors can manage all content in their org
CREATE POLICY "Admins and Editors manage content types" ON public.cms_content_types
  FOR ALL USING (public.has_role(auth.uid(), org_id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role]));
  
CREATE POLICY "Public can view content types" ON public.cms_content_types
  FOR SELECT USING (true);

-- Nodes
CREATE POLICY "Editors manage nodes" ON public.cms_nodes
  FOR ALL USING (public.has_role(auth.uid(), org_id, workspace_id, ARRAY['owner'::oce_role, 'admin'::oce_role, 'editor'::oce_role]));

CREATE POLICY "Public views published nodes" ON public.cms_nodes
  FOR SELECT USING (status = 'Published'::oce_status AND deleted_at IS NULL);
  
-- Locks
CREATE POLICY "Editors manage locks" ON public.cms_locks
  FOR ALL USING (true);
