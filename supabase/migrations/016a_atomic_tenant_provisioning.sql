-- ============================================================
-- 016A: Atomic Tenant Provisioning RPC
-- Idempotent & Safe — Follows Originyx Control Center Conventions
-- ============================================================
-- Creates the secure PostgreSQL RPC public.provision_tenant_organization
-- to atomically create an organization and assign its authenticated creator
-- the initial 'owner' role in public.user_roles.
--
-- Security Properties:
-- 1. SECURITY DEFINER with empty search_path (SET search_path = '')
-- 2. Fully qualified object references (public, auth, pg_catalog)
-- 3. Caller identity derived strictly from auth.uid() (never caller-supplied)
-- 4. Rejects unauthenticated calls
-- 5. Validates non-empty organization name and slug
-- 6. Advisory transaction-level lock (pg_advisory_xact_lock) derived from user UUID
-- 7. Membership guard: rejects provisioning if user already belongs to an organization
-- 8. Atomic execution: rolls back both inserts on any error
-- 9. Explicit execution grants: revoked from PUBLIC and anon; granted to authenticated & service_role
-- ============================================================

CREATE OR REPLACE FUNCTION public.provision_tenant_organization(
  _org_name text,
  _slug text,
  _industry text DEFAULT NULL,
  _company_size text DEFAULT NULL,
  _website text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _email text DEFAULT NULL,
  _description text DEFAULT NULL,
  _products_services text DEFAULT NULL,
  _target_market text DEFAULT NULL,
  _business_model text DEFAULT NULL,
  _growth_stage text DEFAULT NULL,
  _business_goals text DEFAULT NULL,
  _address_line1 text DEFAULT NULL,
  _address_line2 text DEFAULT NULL,
  _city text DEFAULT NULL,
  _state text DEFAULT NULL,
  _postal_code text DEFAULT NULL,
  _country text DEFAULT NULL
)
RETURNS pg_catalog.jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id     pg_catalog.uuid;
  v_org_id      pg_catalog.uuid;
  v_clean_name  pg_catalog.text;
  v_clean_slug  pg_catalog.text;
BEGIN
  -- 1. Derive authenticated user exclusively from auth.uid()
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to provision an organization.'
      USING ERRCODE = '28000'; -- invalid_authorization_specification
  END IF;

  -- 2. Validate required organization name and slug
  v_clean_name := NULLIF(pg_catalog.btrim(_org_name), '');
  IF v_clean_name IS NULL THEN
    RAISE EXCEPTION 'Organization name is required.'
      USING ERRCODE = '22023'; -- invalid_parameter_value
  END IF;

  v_clean_slug := NULLIF(pg_catalog.btrim(_slug), '');
  IF v_clean_slug IS NULL THEN
    RAISE EXCEPTION 'Organization slug is required.'
      USING ERRCODE = '22023'; -- invalid_parameter_value
  END IF;

  -- 3. Acquire transaction-level advisory lock on the authenticated user's UUID
  -- to serialize concurrent provisioning requests from the same user
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(v_user_id::pg_catalog.text)::bigint
  );

  -- 4. Check whether the user already has a membership in public.user_roles
  IF EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User already belongs to an organization.'
      USING ERRCODE = '23505'; -- unique_violation
  END IF;

  -- 5. Atomically insert organization
  INSERT INTO public.organizations (
    name,
    slug,
    industry,
    company_size,
    website,
    phone,
    email,
    description,
    products_services,
    target_market,
    business_model,
    growth_stage,
    business_goals,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country
  ) VALUES (
    v_clean_name,
    v_clean_slug,
    NULLIF(pg_catalog.btrim(_industry), ''),
    NULLIF(pg_catalog.btrim(_company_size), ''),
    NULLIF(pg_catalog.btrim(_website), ''),
    NULLIF(pg_catalog.btrim(_phone), ''),
    NULLIF(pg_catalog.btrim(_email), ''),
    NULLIF(pg_catalog.btrim(_description), ''),
    NULLIF(pg_catalog.btrim(_products_services), ''),
    NULLIF(pg_catalog.btrim(_target_market), ''),
    NULLIF(pg_catalog.btrim(_business_model), ''),
    NULLIF(pg_catalog.btrim(_growth_stage), ''),
    NULLIF(pg_catalog.btrim(_business_goals), ''),
    NULLIF(pg_catalog.btrim(_address_line1), ''),
    NULLIF(pg_catalog.btrim(_address_line2), ''),
    NULLIF(pg_catalog.btrim(_city), ''),
    NULLIF(pg_catalog.btrim(_state), ''),
    NULLIF(pg_catalog.btrim(_postal_code), ''),
    NULLIF(pg_catalog.btrim(_country), '')
  )
  RETURNING id INTO v_org_id;

  -- 6. Atomically insert initial owner role for the calling user
  INSERT INTO public.user_roles (
    user_id,
    org_id,
    workspace_id,
    role
  ) VALUES (
    v_user_id,
    v_org_id,
    NULL,
    'owner'::public.oce_role
  );

  -- 7. Return org_id and role as JSONB
  RETURN pg_catalog.jsonb_build_object(
    'org_id', v_org_id,
    'role', 'owner'
  );
END;
$$;

-- Revoke all permissions from PUBLIC and anon
REVOKE ALL ON FUNCTION public.provision_tenant_organization(
  text, text, text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text, text
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.provision_tenant_organization(
  text, text, text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text, text
) FROM anon;

-- Grant execute permissions strictly to authenticated users and service_role
GRANT EXECUTE ON FUNCTION public.provision_tenant_organization(
  text, text, text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text, text
) TO authenticated, service_role;

COMMENT ON FUNCTION public.provision_tenant_organization(
  text, text, text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text, text
)
IS $comment$
Atomically provisions a new organization and assigns the initial owner role
to the authenticated creator. SECURITY DEFINER with an empty search_path.
$comment$;
