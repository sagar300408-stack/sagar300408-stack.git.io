-- 009: Add RLS policy to allow authenticated users to create a new organization
-- This is necessary because new users need to create their company profile 
-- when filling out their Account page for the first time.

-- Allow any authenticated user to insert an organization
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
