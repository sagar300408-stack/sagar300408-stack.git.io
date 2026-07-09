-- ==========================================
-- 001: Core Architecture & Multi-Tenancy
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Top level multi-tenancy)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Workspaces (Sub-divisions within an organization)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(org_id, slug)
);

-- 3. RBAC Roles
-- Define an enum for strict roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oce_role') THEN
        CREATE TYPE oce_role AS ENUM ('owner', 'admin', 'editor', 'reviewer', 'viewer');
    END IF;
END$$;

-- 4. User Roles Mapping
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE, -- NULL means org-wide
  role oce_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, org_id, workspace_id)
);

-- ==========================================
-- Security & RLS
-- ==========================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id UUID, 
  _org_id UUID, 
  _workspace_id UUID, 
  _roles oce_role[]
) RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id 
      AND ur.org_id = _org_id
      AND (ur.workspace_id = _workspace_id OR ur.workspace_id IS NULL)
      AND ur.role = ANY(_roles)
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations Policies
CREATE POLICY "Users can view orgs they belong to" ON public.organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.org_id = id AND user_roles.user_id = auth.uid())
  );

CREATE POLICY "Owners and Admins can update orgs" ON public.organizations
  FOR UPDATE USING (
    public.has_role(auth.uid(), id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role])
  );

-- Workspaces Policies
CREATE POLICY "Users can view workspaces they belong to" ON public.workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.org_id = org_id 
      AND (user_roles.workspace_id = id OR user_roles.workspace_id IS NULL)
      AND user_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and Admins can manage workspaces" ON public.workspaces
  FOR ALL USING (
    public.has_role(auth.uid(), org_id, id, ARRAY['owner'::oce_role, 'admin'::oce_role])
  );

-- User Roles Policies
CREATE POLICY "Users can view roles in their org" ON public.user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.org_id = org_id AND ur.user_id = auth.uid())
  );
  
CREATE POLICY "Owners and Admins can manage roles" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), org_id, workspace_id, ARRAY['owner'::oce_role, 'admin'::oce_role])
  );
