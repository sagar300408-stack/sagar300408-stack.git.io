-- Fix CMS Activity Log INSERT policy
-- Allows authenticated users to log their own activity

CREATE POLICY "Allow users to insert their own activity log" ON public.cms_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
