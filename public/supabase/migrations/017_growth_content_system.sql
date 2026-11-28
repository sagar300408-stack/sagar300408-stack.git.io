-- ============================================================
-- 017: Growth Module Phase 3 — Content System
-- Idempotent, Safe & Hardened — Follows Originyx Control Center Conventions
-- ============================================================
-- Remediated and verified foundations for Growth Content:
-- 1. growth_content_items (Core content management, lifecycle, drafts, scheduling, multi-channel, campaigns)
-- 2. growth_content_ideas (Ideation backlog, category/tags, objectives/audiences link, draft conversion)
-- 3. growth_content_reviews (Collaborative review workflow, feedback, owner/admin authorization)
-- 4. growth_content_revisions (Immutable version snapshots, point-in-time restore points, audit trails)
--
-- Security & Integrity Guarantees:
-- - Tenant relationship integrity: database-level validation triggers & composite foreign keys
--   preventing cross-tenant referencing across channels, objectives, audiences, campaigns, CMS nodes, ideas
-- - Database-level approval authorization: only owners/admins can approve, reject, or request changes
-- - Content lifecycle integrity: database triggers strictly enforce state progression
--   (draft -> in_review -> changes_requested / approved -> scheduled -> published)
-- - Organization ownership: UPDATE triggers strictly block organization reassignment (org_id modification)
-- - Review & revision integrity: composite foreign keys bind reviews and revisions to parent content org_id;
--   review and revision records are protected against unauthorized modification and deletion
-- - Idempotent deployment: safe to deploy on fresh or existing databases
-- ============================================================

-- ── 0. AUTHORIZATION HELPER FUNCTION ─────────────────────────
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.org_id = _org_id
      AND user_roles.user_id = auth.uid()
      AND user_roles.role IN ('owner'::public.oce_role, 'admin'::public.oce_role)
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_org_admin_or_owner(UUID) TO authenticated;


-- ── 1. GROWTH CONTENT ITEMS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_content_items (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id              UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL,
  content_type        TEXT DEFAULT 'blog' NOT NULL,
  status              TEXT DEFAULT 'draft' NOT NULL,
  summary             TEXT,
  content             JSONB DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb NOT NULL,
  body_text           TEXT,
  cover_image         TEXT,
  media_urls          TEXT[] DEFAULT '{}'::text[] NOT NULL,
  category            TEXT,
  tags                TEXT[] DEFAULT '{}'::text[] NOT NULL,
  channel_id          UUID REFERENCES public.marketing_channels(id) ON DELETE SET NULL,
  objective_id        UUID REFERENCES public.marketing_objectives(id) ON DELETE SET NULL,
  audience_id         UUID REFERENCES public.marketing_audiences(id) ON DELETE SET NULL,
  campaign_id         UUID REFERENCES public.marketing_initiatives(id) ON DELETE SET NULL,
  idea_id             UUID, -- Foreign key linked below after ideas table creation
  cms_node_id         UUID REFERENCES public.cms_nodes(id) ON DELETE SET NULL,
  author_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name         TEXT,
  reviewer_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name       TEXT,
  scheduled_for       TIMESTAMP WITH TIME ZONE,
  published_at        TIMESTAMP WITH TIME ZONE,
  submitted_at        TIMESTAMP WITH TIME ZONE,
  approved_at         TIMESTAMP WITH TIME ZONE,
  rejected_at         TIMESTAMP WITH TIME ZONE,
  rejection_reason    TEXT,
  version             INTEGER DEFAULT 1 NOT NULL,
  metadata            JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent column additions for existing installations
ALTER TABLE public.growth_content_items
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.marketing_initiatives(id) ON DELETE SET NULL;

-- Check constraints with reconciliation (including landing_page format)
DO $$ BEGIN
  ALTER TABLE public.growth_content_items DROP CONSTRAINT IF EXISTS chk_growth_content_items_content_type;
  ALTER TABLE public.growth_content_items
    ADD CONSTRAINT chk_growth_content_items_content_type
    CHECK (content_type IN ('blog', 'article', 'social', 'newsletter', 'case_study', 'whitepaper', 'landing_page', 'other'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.growth_content_items DROP CONSTRAINT IF EXISTS chk_growth_content_items_status;
  ALTER TABLE public.growth_content_items
    ADD CONSTRAINT chk_growth_content_items_status
    CHECK (status IN ('draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'rejected', 'archived'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Tenant composite unique constraints
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_growth_content_items_org_slug' AND table_name = 'growth_content_items'
  ) THEN
    ALTER TABLE public.growth_content_items ADD CONSTRAINT uq_growth_content_items_org_slug UNIQUE(org_id, slug);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_growth_content_items_id_org' AND table_name = 'growth_content_items'
  ) THEN
    ALTER TABLE public.growth_content_items ADD CONSTRAINT uq_growth_content_items_id_org UNIQUE(id, org_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_growth_content_items_org_id ON public.growth_content_items(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_status ON public.growth_content_items(org_id, status);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_type ON public.growth_content_items(org_id, content_type);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_scheduled ON public.growth_content_items(org_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_author ON public.growth_content_items(org_id, author_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_cms_node ON public.growth_content_items(cms_node_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_campaign ON public.growth_content_items(org_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_channel ON public.growth_content_items(org_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_objective ON public.growth_content_items(org_id, objective_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_audience ON public.growth_content_items(org_id, audience_id);


-- ── 2. GROWTH CONTENT IDEAS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_content_ideas (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id              UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  notes               TEXT,
  category            TEXT,
  tags                TEXT[] DEFAULT '{}'::text[] NOT NULL,
  target_channels     TEXT[] DEFAULT '{}'::text[] NOT NULL,
  status              TEXT DEFAULT 'new' NOT NULL,
  priority            TEXT DEFAULT 'medium' NOT NULL,
  objective_id        UUID REFERENCES public.marketing_objectives(id) ON DELETE SET NULL,
  audience_id         UUID REFERENCES public.marketing_audiences(id) ON DELETE SET NULL,
  converted_content_id UUID REFERENCES public.growth_content_items(id) ON DELETE SET NULL,
  author_name         TEXT,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
  ALTER TABLE public.growth_content_ideas DROP CONSTRAINT IF EXISTS chk_growth_content_ideas_status;
  ALTER TABLE public.growth_content_ideas
    ADD CONSTRAINT chk_growth_content_ideas_status
    CHECK (status IN ('new', 'under_review', 'approved', 'converted', 'rejected', 'archived'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.growth_content_ideas DROP CONSTRAINT IF EXISTS chk_growth_content_ideas_priority;
  ALTER TABLE public.growth_content_ideas
    ADD CONSTRAINT chk_growth_content_ideas_priority
    CHECK (priority IN ('low', 'medium', 'high'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_growth_content_ideas_id_org' AND table_name = 'growth_content_ideas'
  ) THEN
    ALTER TABLE public.growth_content_ideas ADD CONSTRAINT uq_growth_content_ideas_id_org UNIQUE(id, org_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_org_id ON public.growth_content_ideas(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_status ON public.growth_content_ideas(org_id, status);
CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_priority ON public.growth_content_ideas(org_id, priority);
CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_objective ON public.growth_content_ideas(org_id, objective_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_audience ON public.growth_content_ideas(org_id, audience_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_converted ON public.growth_content_ideas(converted_content_id);

-- Cross-link idea_id constraint on growth_content_items
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_growth_content_items_idea'
      AND table_name = 'growth_content_items'
  ) THEN
    ALTER TABLE public.growth_content_items
      ADD CONSTRAINT fk_growth_content_items_idea
      FOREIGN KEY (idea_id) REFERENCES public.growth_content_ideas(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ── 3. GROWTH CONTENT REVIEWS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_content_reviews (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  content_id      UUID NOT NULL,
  reviewer_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name   TEXT NOT NULL,
  action          TEXT NOT NULL,
  feedback        TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
  ALTER TABLE public.growth_content_reviews DROP CONSTRAINT IF EXISTS chk_growth_content_reviews_action;
  ALTER TABLE public.growth_content_reviews
    ADD CONSTRAINT chk_growth_content_reviews_action
    CHECK (action IN ('submitted', 'approved', 'rejected', 'changes_requested', 'commented'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Composite foreign key enforcing content item and review belong to identical tenant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_growth_content_reviews_content_org' AND table_name = 'growth_content_reviews'
  ) THEN
    ALTER TABLE public.growth_content_reviews
      ADD CONSTRAINT fk_growth_content_reviews_content_org
      FOREIGN KEY (content_id, org_id) REFERENCES public.growth_content_items(id, org_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_growth_content_reviews_org_id ON public.growth_content_reviews(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_reviews_content_id ON public.growth_content_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_reviews_created ON public.growth_content_reviews(created_at DESC);


-- ── 4. GROWTH CONTENT REVISIONS ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_content_revisions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  content_id      UUID NOT NULL,
  version         INTEGER NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT,
  content         JSONB NOT NULL,
  change_summary  TEXT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_growth_content_revisions_version' AND table_name = 'growth_content_revisions'
  ) THEN
    ALTER TABLE public.growth_content_revisions
      ADD CONSTRAINT uq_growth_content_revisions_version UNIQUE(content_id, version);
  END IF;
END $$;

-- Composite foreign key enforcing content item and revision belong to identical tenant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_growth_content_revisions_content_org' AND table_name = 'growth_content_revisions'
  ) THEN
    ALTER TABLE public.growth_content_revisions
      ADD CONSTRAINT fk_growth_content_revisions_content_org
      FOREIGN KEY (content_id, org_id) REFERENCES public.growth_content_items(id, org_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_growth_content_revisions_org_id ON public.growth_content_revisions(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_revisions_content_id ON public.growth_content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_revisions_created_by ON public.growth_content_revisions(created_by);


-- ── 5. DATABASE INTEGRITY & LIFECYCLE TRIGGERS ──────────────

-- 5A: Content Items Integrity & Lifecycle Guard
CREATE OR REPLACE FUNCTION public.validate_growth_content_items_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Prevent organization reassignment (Requirement 4)
  IF TG_OP = 'UPDATE' AND NEW.org_id <> OLD.org_id THEN
    RAISE EXCEPTION 'Organization reassignment is not permitted (org_id cannot be changed)';
  END IF;

  -- 2. Tenant relationship integrity validation (Requirement 1)
  IF NEW.channel_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.marketing_channels
      WHERE id = NEW.channel_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: marketing channel % does not belong to organization %', NEW.channel_id, NEW.org_id;
    END IF;
  END IF;

  IF NEW.objective_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.marketing_objectives
      WHERE id = NEW.objective_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: marketing objective % does not belong to organization %', NEW.objective_id, NEW.org_id;
    END IF;
  END IF;

  IF NEW.audience_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.marketing_audiences
      WHERE id = NEW.audience_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: marketing audience % does not belong to organization %', NEW.audience_id, NEW.org_id;
    END IF;
  END IF;

  IF NEW.campaign_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.marketing_initiatives
      WHERE id = NEW.campaign_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: marketing initiative % does not belong to organization %', NEW.campaign_id, NEW.org_id;
    END IF;
  END IF;

  IF NEW.cms_node_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.cms_nodes
      WHERE id = NEW.cms_node_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: cms node % does not belong to organization %', NEW.cms_node_id, NEW.org_id;
    END IF;
  END IF;

  IF NEW.idea_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.growth_content_ideas
      WHERE id = NEW.idea_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: content idea % does not belong to organization %', NEW.idea_id, NEW.org_id;
    END IF;
  END IF;

  -- 3. Direct insertion status gate
  IF TG_OP = 'INSERT' AND NEW.status NOT IN ('draft', 'in_review') THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_org_admin_or_owner(NEW.org_id) THEN
      RAISE EXCEPTION 'Permission denied: non-admin users cannot create content directly in % status (must start as draft or in_review)', NEW.status;
    END IF;
  END IF;

  -- 4. Content lifecycle state transition validation (Requirement 3)
  IF TG_OP = 'UPDATE' AND NEW.status <> OLD.status THEN
    IF NOT (
      (OLD.status = 'draft' AND NEW.status IN ('in_review', 'archived')) OR
      (OLD.status = 'in_review' AND NEW.status IN ('approved', 'changes_requested', 'rejected', 'draft')) OR
      (OLD.status = 'changes_requested' AND NEW.status IN ('in_review', 'draft', 'archived')) OR
      (OLD.status = 'approved' AND NEW.status IN ('scheduled', 'published', 'changes_requested', 'archived')) OR
      (OLD.status = 'scheduled' AND NEW.status IN ('published', 'approved', 'archived')) OR
      (OLD.status = 'published' AND NEW.status IN ('archived')) OR
      (OLD.status = 'rejected' AND NEW.status IN ('draft', 'archived')) OR
      (OLD.status = 'archived' AND NEW.status IN ('draft'))
    ) THEN
      RAISE EXCEPTION 'Invalid content lifecycle transition from % to %', OLD.status, NEW.status;
    END IF;

    -- 5. Reviewer permission check at database level (Requirement 2)
    IF NEW.status IN ('approved', 'rejected', 'changes_requested') THEN
      IF auth.uid() IS NOT NULL AND NOT public.is_org_admin_or_owner(NEW.org_id) THEN
        RAISE EXCEPTION 'Permission denied: only organization owners and admins can approve, reject, or request changes on content items';
      END IF;
    END IF;

    -- Auto-record timestamps on progression
    IF NEW.status = 'in_review' AND OLD.status <> 'in_review' THEN
      NEW.submitted_at = coalesce(NEW.submitted_at, timezone('utc'::text, now()));
    ELSIF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
      NEW.approved_at = coalesce(NEW.approved_at, timezone('utc'::text, now()));
    ELSIF NEW.status = 'published' AND OLD.status <> 'published' THEN
      NEW.published_at = coalesce(NEW.published_at, timezone('utc'::text, now()));
    ELSIF NEW.status = 'rejected' AND OLD.status <> 'rejected' THEN
      NEW.rejected_at = coalesce(NEW.rejected_at, timezone('utc'::text, now()));
    END IF;
  END IF;

  -- 6. Updated timestamp maintenance
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = timezone('utc'::text, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_growth_content_items_guard ON public.growth_content_items;
CREATE TRIGGER trg_growth_content_items_guard
  BEFORE INSERT OR UPDATE ON public.growth_content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_growth_content_items_integrity();


-- 5B: Content Ideas Integrity Guard
CREATE OR REPLACE FUNCTION public.validate_growth_content_ideas_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Prevent organization reassignment (Requirement 4)
  IF TG_OP = 'UPDATE' AND NEW.org_id <> OLD.org_id THEN
    RAISE EXCEPTION 'Organization reassignment is not permitted (org_id cannot be changed)';
  END IF;

  -- 2. Tenant relationship integrity validation (Requirement 1)
  IF NEW.objective_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.marketing_objectives
      WHERE id = NEW.objective_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: marketing objective % does not belong to organization %', NEW.objective_id, NEW.org_id;
    END IF;
  END IF;

  IF NEW.audience_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.marketing_audiences
      WHERE id = NEW.audience_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: marketing audience % does not belong to organization %', NEW.audience_id, NEW.org_id;
    END IF;
  END IF;

  IF NEW.converted_content_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.growth_content_items
      WHERE id = NEW.converted_content_id AND org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'Cross-tenant reference rejected: converted content item % does not belong to organization %', NEW.converted_content_id, NEW.org_id;
    END IF;
  END IF;

  -- 3. Updated timestamp maintenance
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = timezone('utc'::text, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_growth_content_ideas_guard ON public.growth_content_ideas;
CREATE TRIGGER trg_growth_content_ideas_guard
  BEFORE INSERT OR UPDATE ON public.growth_content_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_growth_content_ideas_integrity();


-- 5C: Content Reviews Integrity Guard
CREATE OR REPLACE FUNCTION public.validate_growth_content_reviews_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Prevent modification of existing review records (Requirement 5)
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Modification of review history is not permitted';
  END IF;

  -- 2. Review deletion gate (Requirement 5)
  IF TG_OP = 'DELETE' THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_org_admin_or_owner(OLD.org_id) THEN
      RAISE EXCEPTION 'Permission denied: only organization owners and admins can delete review records';
    END IF;
    RETURN OLD;
  END IF;

  -- 3. Enforce reviewer permissions for approval, rejection, or changes_requested (Requirement 2 & 5)
  IF TG_OP = 'INSERT' THEN
    IF NEW.action IN ('approved', 'rejected', 'changes_requested') THEN
      IF auth.uid() IS NOT NULL AND NOT public.is_org_admin_or_owner(NEW.org_id) THEN
        RAISE EXCEPTION 'Permission denied: only organization owners and admins can submit approval, rejection, or changes_requested reviews';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_growth_content_reviews_guard ON public.growth_content_reviews;
CREATE TRIGGER trg_growth_content_reviews_guard
  BEFORE INSERT OR UPDATE OR DELETE ON public.growth_content_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_growth_content_reviews_integrity();


-- 5D: Content Revisions Integrity Guard
CREATE OR REPLACE FUNCTION public.validate_growth_content_revisions_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Prevent modification of revision snapshot records (Requirement 5)
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Modification of content revision snapshots is not permitted';
  END IF;

  -- 2. Revision deletion gate (Requirement 5)
  IF TG_OP = 'DELETE' THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_org_admin_or_owner(OLD.org_id) THEN
      RAISE EXCEPTION 'Permission denied: only organization owners and admins can delete revision snapshots';
    END IF;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_growth_content_revisions_guard ON public.growth_content_revisions;
CREATE TRIGGER trg_growth_content_revisions_guard
  BEFORE UPDATE OR DELETE ON public.growth_content_revisions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_growth_content_revisions_integrity();


-- ── 6. ROW LEVEL SECURITY POLICIES ──────────────────────────

-- Growth Content Items RLS
ALTER TABLE public.growth_content_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Org members can view growth content items" ON public.growth_content_items;
  CREATE POLICY "Org members can view growth content items"
    ON public.growth_content_items FOR SELECT
    USING (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can insert growth content items" ON public.growth_content_items;
  CREATE POLICY "Org members can insert growth content items"
    ON public.growth_content_items FOR INSERT
    WITH CHECK (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can update growth content items" ON public.growth_content_items;
  CREATE POLICY "Org members can update growth content items"
    ON public.growth_content_items FOR UPDATE
    USING (public.is_org_member(org_id))
    WITH CHECK (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can delete growth content items" ON public.growth_content_items;
  CREATE POLICY "Org members can delete growth content items"
    ON public.growth_content_items FOR DELETE
    USING (public.is_org_member(org_id));

  -- Backward-compatibility policy cleanup
  DROP POLICY IF EXISTS "Org members can manage growth content items" ON public.growth_content_items;
END $$;


-- Growth Content Ideas RLS
ALTER TABLE public.growth_content_ideas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Org members can view growth content ideas" ON public.growth_content_ideas;
  CREATE POLICY "Org members can view growth content ideas"
    ON public.growth_content_ideas FOR SELECT
    USING (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can insert growth content ideas" ON public.growth_content_ideas;
  CREATE POLICY "Org members can insert growth content ideas"
    ON public.growth_content_ideas FOR INSERT
    WITH CHECK (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can update growth content ideas" ON public.growth_content_ideas;
  CREATE POLICY "Org members can update growth content ideas"
    ON public.growth_content_ideas FOR UPDATE
    USING (public.is_org_member(org_id))
    WITH CHECK (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can delete growth content ideas" ON public.growth_content_ideas;
  CREATE POLICY "Org members can delete growth content ideas"
    ON public.growth_content_ideas FOR DELETE
    USING (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can manage growth content ideas" ON public.growth_content_ideas;
END $$;


-- Growth Content Reviews RLS
-- Notice: No UPDATE policy is provisioned, ensuring review history immutability via API
ALTER TABLE public.growth_content_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Org members can view growth content reviews" ON public.growth_content_reviews;
  CREATE POLICY "Org members can view growth content reviews"
    ON public.growth_content_reviews FOR SELECT
    USING (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can insert growth content reviews" ON public.growth_content_reviews;
  CREATE POLICY "Org members can insert growth content reviews"
    ON public.growth_content_reviews FOR INSERT
    WITH CHECK (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Admins can delete growth content reviews" ON public.growth_content_reviews;
  CREATE POLICY "Admins can delete growth content reviews"
    ON public.growth_content_reviews FOR DELETE
    USING (public.is_org_admin_or_owner(org_id));

  DROP POLICY IF EXISTS "Org members can manage growth content reviews" ON public.growth_content_reviews;
END $$;


-- Growth Content Revisions RLS
-- Notice: No UPDATE policy is provisioned, ensuring revision snapshot immutability via API
ALTER TABLE public.growth_content_revisions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Org members can view growth content revisions" ON public.growth_content_revisions;
  CREATE POLICY "Org members can view growth content revisions"
    ON public.growth_content_revisions FOR SELECT
    USING (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Org members can insert growth content revisions" ON public.growth_content_revisions;
  CREATE POLICY "Org members can insert growth content revisions"
    ON public.growth_content_revisions FOR INSERT
    WITH CHECK (public.is_org_member(org_id));

  DROP POLICY IF EXISTS "Admins can delete growth content revisions" ON public.growth_content_revisions;
  CREATE POLICY "Admins can delete growth content revisions"
    ON public.growth_content_revisions FOR DELETE
    USING (public.is_org_admin_or_owner(org_id));

  DROP POLICY IF EXISTS "Org members can manage growth content revisions" ON public.growth_content_revisions;
END $$;
