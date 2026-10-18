-- ============================================================
-- 013: Customer Portal Entitlements & Catalog Access Policies
-- Idempotent & Safe — Does not drop or destroy existing data.
-- ============================================================

-- 1. Ensure public and authenticated users can view published products (Live or Beta)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cc_products' AND policyname = 'Public can view published products'
  ) THEN
    CREATE POLICY "Public can view published products" ON public.cc_products
      FOR SELECT USING (status IN ('Live'::public.product_status, 'Beta'::public.product_status));
  END IF;
END $$;

-- 2. Ensure customer organizations can view their own subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cc_subscriptions' AND policyname = 'Customers can view their own subscriptions'
  ) THEN
    CREATE POLICY "Customers can view their own subscriptions" ON public.cc_subscriptions
      FOR SELECT USING (public.is_org_member(customer_org_id));
  END IF;
END $$;

-- 3. Ensure customers can insert purchase intent / opportunities for their organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' AND policyname = 'Org members can create opportunities'
  ) THEN
    CREATE POLICY "Org members can create opportunities" ON public.opportunities
      FOR INSERT WITH CHECK (public.is_org_member(org_id));
  END IF;
END $$;

-- 4. Ensure customer organizations can always view products they currently hold a subscription for
-- (Preserves existing customer entitlements even if a product is unpublished or discontinued from new sales)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cc_products' AND policyname = 'Subscribers can view their assigned products'
  ) THEN
    CREATE POLICY "Subscribers can view their assigned products" ON public.cc_products
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.cc_subscriptions s
          WHERE s.product_id = cc_products.id
            AND public.is_org_member(s.customer_org_id)
        )
      );
  END IF;
END $$;
