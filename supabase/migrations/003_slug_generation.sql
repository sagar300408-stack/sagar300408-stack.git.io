-- ==========================================
-- 003: Backend Slug Generation
-- ==========================================

-- Ensure unaccent extension exists for replacing foreign characters
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Core Slugify Function
CREATE OR REPLACE FUNCTION public.slugify("value" TEXT)
RETURNS TEXT AS $$
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL STRICT IMMUTABLE;

-- Trigger Function for Node Slugs
CREATE OR REPLACE FUNCTION public.set_node_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- If slug is explicitly provided and we are not forcing regeneration, respect it
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    new_slug := NEW.slug;
  ELSE
    base_slug := public.slugify(NEW.title);
    new_slug := base_slug;
    
    -- Loop to ensure uniqueness within the same organization and content type
    WHILE EXISTS (
      SELECT 1 FROM public.cms_nodes 
      WHERE org_id = NEW.org_id 
        AND type_id = NEW.type_id 
        AND slug = new_slug 
        AND id != NEW.id
    ) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := new_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Trigger to cms_nodes
DROP TRIGGER IF EXISTS trigger_set_node_slug ON public.cms_nodes;
CREATE TRIGGER trigger_set_node_slug
  BEFORE INSERT OR UPDATE OF title, slug
  ON public.cms_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_node_slug();
