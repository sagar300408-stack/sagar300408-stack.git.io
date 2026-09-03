-- Fix CMS Activity Log INSERT policy
DROP POLICY IF EXISTS "Allow users to insert their own activity log" ON public.cms_activity_log;
CREATE POLICY "Allow users to insert their own activity log" ON public.cms_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix CMS Revisions Policies
DROP POLICY IF EXISTS "Editors can insert revisions" ON public.cms_revisions;
CREATE POLICY "Editors can insert revisions" ON public.cms_revisions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Editors can select revisions" ON public.cms_revisions;
CREATE POLICY "Editors can select revisions" ON public.cms_revisions
  FOR SELECT USING (true);
