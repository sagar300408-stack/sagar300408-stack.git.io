-- 010: Fix Profile and Organization RLS and Schema

-- 1. Add company profile fields to organizations table
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS products_services TEXT,
  ADD COLUMN IF NOT EXISTS target_market TEXT,
  ADD COLUMN IF NOT EXISTS business_model TEXT,
  ADD COLUMN IF NOT EXISTS growth_stage TEXT,
  ADD COLUMN IF NOT EXISTS business_goals TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

-- 2. Allow authenticated users to insert a new organization (if they don't have one)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Allow users to link themselves as owners of the organization they just created
-- We allow this if the user is inserting a record for themselves (user_id = auth.uid())
-- and the role being assigned is 'owner'.
DROP POLICY IF EXISTS "Users can insert their own initial role" ON public.user_roles;
CREATE POLICY "Users can insert their own initial role" ON public.user_roles
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() 
    AND role = 'owner'::oce_role
  );
