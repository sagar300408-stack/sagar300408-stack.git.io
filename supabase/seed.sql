-- ==========================================
-- Database Seed Script
-- Static reference / platform data only.
--
-- ⚠️  This file must NOT create:
--       - Organizations
--       - Workspaces
--       - Content Types
--       - User Roles
--       - Owners
--
-- All of the above are created by the CMS Setup Wizard
-- via the initialize_cms() RPC during the first-run experience.
--
-- This file is safe to re-run on an already-initialized database
-- because every statement uses ON CONFLICT DO NOTHING.
-- ==========================================

-- (No static seed data required at this time.)
-- Future entries: reusable block templates, plugin manifests,
-- default webhook configurations.

SELECT 'Seed script executed. No static data to insert.' AS status;
