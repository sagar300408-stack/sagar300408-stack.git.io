-- ============================================================
-- 017: Growth Module Phase 3 — Content System
-- Idempotent & Safe — Follows Originyx Control Center Conventions
-- ============================================================
-- Creates the persistent data foundations for Growth Content:
-- 1. growth_content_items (Core content management, lifecycle, drafts, scheduling, multi-channel)
-- 2. growth_content_ideas (Ideation backlog, category/tags, objectives/audiences link, draft conversion)
-- 3. growth_content_reviews (Collaborative review workflow, feedback, decisions)
-- 4. growth_content_revisions (Version history, restore points, audit trails)
--
-- Integration Points:
-- - Operations CMS (public.cms_nodes) for website thought leadership publishing
-- - Media Library (public.oce_media bucket) for media attachments and cover imagery
-- - Marketing Strategy (marketing_objectives, marketing_audiences, marketing_channels)
-- - Multi-tenant isolation via org_id foreign keys and RLS (public.is_org_member)
-- ============================================================

-- ── 1. GROWTH CONTENT ITEMS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_content_items (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id              UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL,
  content_type        TEXT DEFAULT 'blog' CHECK (content_type IN ('blog', 'article', 'social', 'newsletter', 'case_study', 'whitepaper', 'other')) NOT NULL,
  status              TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'rejected', 'archived')) NOT NULL,
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
  idea_id             UUID, -- Foreign key added below after ideas table
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
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(org_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_growth_content_items_org_id ON public.growth_content_items(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_status ON public.growth_content_items(org_id, status);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_type ON public.growth_content_items(org_id, content_type);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_scheduled ON public.growth_content_items(org_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_author ON public.growth_content_items(org_id, author_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_items_cms_node ON public.growth_content_items(cms_node_id);

ALTER TABLE public.growth_content_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_items' AND policyname = 'Org members can view growth content items') THEN
    CREATE POLICY "Org members can view growth content items" ON public.growth_content_items FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_items' AND policyname = 'Org members can manage growth content items') THEN
    CREATE POLICY "Org members can manage growth content items" ON public.growth_content_items FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;


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
  status              TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'approved', 'converted', 'rejected', 'archived')) NOT NULL,
  priority            TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
  objective_id        UUID REFERENCES public.marketing_objectives(id) ON DELETE SET NULL,
  audience_id         UUID REFERENCES public.marketing_audiences(id) ON DELETE SET NULL,
  converted_content_id UUID REFERENCES public.growth_content_items(id) ON DELETE SET NULL,
  author_name         TEXT,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_org_id ON public.growth_content_ideas(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_status ON public.growth_content_ideas(org_id, status);
CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_priority ON public.growth_content_ideas(org_id, priority);

ALTER TABLE public.growth_content_ideas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_ideas' AND policyname = 'Org members can view growth content ideas') THEN
    CREATE POLICY "Org members can view growth content ideas" ON public.growth_content_ideas FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_ideas' AND policyname = 'Org members can manage growth content ideas') THEN
    CREATE POLICY "Org members can manage growth content ideas" ON public.growth_content_ideas FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;

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
  content_id      UUID REFERENCES public.growth_content_items(id) ON DELETE CASCADE NOT NULL,
  reviewer_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name   TEXT NOT NULL,
  action          TEXT CHECK (action IN ('submitted', 'approved', 'rejected', 'changes_requested', 'commented')) NOT NULL,
  feedback        TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_growth_content_reviews_org_id ON public.growth_content_reviews(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_reviews_content_id ON public.growth_content_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_reviews_created ON public.growth_content_reviews(created_at DESC);

ALTER TABLE public.growth_content_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_reviews' AND policyname = 'Org members can view growth content reviews') THEN
    CREATE POLICY "Org members can view growth content reviews" ON public.growth_content_reviews FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_reviews' AND policyname = 'Org members can manage growth content reviews') THEN
    CREATE POLICY "Org members can manage growth content reviews" ON public.growth_content_reviews FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;


-- ── 4. GROWTH CONTENT REVISIONS ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_content_revisions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id          UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  content_id      UUID REFERENCES public.growth_content_items(id) ON DELETE CASCADE NOT NULL,
  version         INTEGER NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT,
  content         JSONB NOT NULL,
  change_summary  TEXT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(content_id, version)
);

CREATE INDEX IF NOT EXISTS idx_growth_content_revisions_org_id ON public.growth_content_revisions(org_id);
CREATE INDEX IF NOT EXISTS idx_growth_content_revisions_content_id ON public.growth_content_revisions(content_id);

ALTER TABLE public.growth_content_revisions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_revisions' AND policyname = 'Org members can view growth content revisions') THEN
    CREATE POLICY "Org members can view growth content revisions" ON public.growth_content_revisions FOR SELECT USING (public.is_org_member(org_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_content_revisions' AND policyname = 'Org members can manage growth content revisions') THEN
    CREATE POLICY "Org members can manage growth content revisions" ON public.growth_content_revisions FOR ALL USING (public.is_org_member(org_id));
  END IF;
END $$;
