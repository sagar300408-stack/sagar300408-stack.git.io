-- ==========================================
-- Database Seed Script for CMS
-- ==========================================
-- Run this script on your live Supabase project to seed the base schema 
-- required for the Admin Editor to function.

DO $$
DECLARE
  v_org_id UUID;
  v_type_id UUID;
BEGIN
  -- 1. Create or get Default Organization
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE slug = 'originyx') THEN
    INSERT INTO public.organizations (name, slug)
    VALUES ('Originyx', 'originyx')
    RETURNING id INTO v_org_id;
  ELSE
    SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'originyx';
  END IF;

  -- 2. Create or get Default Workspace
  IF NOT EXISTS (SELECT 1 FROM public.workspaces WHERE org_id = v_org_id AND slug = 'default') THEN
    INSERT INTO public.workspaces (org_id, name, slug)
    VALUES (v_org_id, 'Default Workspace', 'default');
  END IF;

  -- 3. Create or get Insights Content Type
  IF NOT EXISTS (SELECT 1 FROM public.cms_content_types WHERE org_id = v_org_id AND slug = 'insights') THEN
    INSERT INTO public.cms_content_types (org_id, name, slug, description, schema)
    VALUES (
      v_org_id, 
      'Insights', 
      'insights', 
      'Blog posts, research, and company updates.',
      '{"fields": ["title", "excerpt", "cover_image", "content", "category", "tags", "seo_title", "seo_description", "featured"]}'::jsonb
    )
    RETURNING id INTO v_type_id;
  ELSE
    SELECT id INTO v_type_id FROM public.cms_content_types WHERE org_id = v_org_id AND slug = 'insights';
  END IF;

  RAISE NOTICE 'Seed completed successfully! Org ID: %, Insights Type ID: %', v_org_id, v_type_id;
END$$;
