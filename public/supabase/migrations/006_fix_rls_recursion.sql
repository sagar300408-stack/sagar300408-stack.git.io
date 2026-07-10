-- ============================================================
-- 006_fix_rls_recursion.sql
-- Fix recursive RLS on organizations, workspaces, and user_roles
-- ============================================================

-- 1. Redefine is_org_member as SECURITY DEFINER
-- Taking user_id explicitly avoids ambiguity and is cleaner for policies
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND org_id = _org_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_org_member(UUID, UUID) TO authenticated;

-- 2. Ensure has_role is SECURITY DEFINER (from 001)
-- Re-applying just in case to ensure it's securely defined.
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id UUID, 
  _org_id UUID, 
  _workspace_id UUID, 
  _roles oce_role[]
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
STABLE 
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, UUID, UUID, oce_role[]) TO authenticated;

-- 3. Fix user_roles get_my_role helper
CREATE OR REPLACE FUNCTION public.get_my_role(_user_id UUID, _org_id UUID)
RETURNS oce_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE _role oce_role;
BEGIN
  SELECT role INTO _role FROM public.user_roles
  WHERE user_id = _user_id AND org_id = _org_id LIMIT 1;
  RETURN _role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role(UUID, UUID) TO authenticated;


-- ==========================================
-- Rewrite Organizations Policies
-- ==========================================
DROP POLICY IF EXISTS "Users can view orgs they belong to" ON public.organizations;
CREATE POLICY "Users can view orgs they belong to" 
  ON public.organizations 
  FOR SELECT 
  USING (public.is_org_member(auth.uid(), id));

DROP POLICY IF EXISTS "Owners and Admins can update orgs" ON public.organizations;
CREATE POLICY "Owners and Admins can update orgs" 
  ON public.organizations 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), id, NULL, ARRAY['owner'::oce_role, 'admin'::oce_role]));


-- ==========================================
-- Rewrite Workspaces Policies
-- ==========================================
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.workspaces;
CREATE POLICY "Users can view workspaces they belong to" 
  ON public.workspaces 
  FOR SELECT 
  USING (public.is_org_member(auth.uid(), org_id)); -- Anyone in the org can see the workspace

DROP POLICY IF EXISTS "Owners and Admins can manage workspaces" ON public.workspaces;
CREATE POLICY "Owners and Admins can manage workspaces" 
  ON public.workspaces 
  FOR ALL 
  USING (public.has_role(auth.uid(), org_id, id, ARRAY['owner'::oce_role, 'admin'::oce_role]));


-- ==========================================
-- Rewrite User Roles Policies
-- ==========================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view roles in orgs they belong to" ON public.user_roles;
CREATE POLICY "Users can view roles in orgs they belong to"
  ON public.user_roles FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

DROP POLICY IF EXISTS "Owners and Admins can manage roles" ON public.user_roles;
CREATE POLICY "Owners and Admins can manage roles"
  ON public.user_roles FOR ALL USING (
    public.get_my_role(auth.uid(), org_id) IN ('owner'::oce_role, 'admin'::oce_role)
  );

