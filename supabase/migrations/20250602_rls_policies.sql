-- ===================================================================
-- Pailo Database — RLS Policies (Phase 2)
-- Version: 1.0.0
-- ===================================================================

-- ===================================================================
-- PROFILES — RLS
-- ===================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read their own profile
CREATE POLICY "users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- Service role bypasses everything (useful for seeds/automation)
-- Note: Service role is NOT 'authenticated' — no policy needed.

-- ===================================================================
-- STORES — RLS
-- ===================================================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Owner can do everything on their store
CREATE POLICY "merchants manage own store"
  ON stores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public reads: only published, active stores
CREATE POLICY "public reads published stores"
  ON stores FOR SELECT
  TO public
  USING (published_at IS NOT NULL AND is_active = true);

-- Super admins can do everything
CREATE POLICY "admins full access stores"
  ON stores FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- ===================================================================
-- CATEGORIES — RLS
-- ===================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Merchant manages categories for their stores
CREATE POLICY "merchants manage own categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Public reads categories for published stores
CREATE POLICY "public reads active store categories"
  ON categories FOR SELECT
  TO public
  USING (
    store_id IN (
      SELECT id FROM stores WHERE published_at IS NOT NULL AND is_active = true
    )
  );

-- ===================================================================
-- PRODUCTS — RLS
-- ===================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Merchant manages own products
CREATE POLICY "merchants manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Public reads products for published stores
CREATE POLICY "public reads published store products"
  ON products FOR SELECT
  TO public
  USING (
    store_id IN (
      SELECT id FROM stores WHERE published_at IS NOT NULL AND is_active = true
    )
  );

-- ===================================================================
-- MEDIA — RLS
-- ===================================================================
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Merchant manages own media
CREATE POLICY "merchants manage own media"
  ON media FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Public reads media for published stores
CREATE POLICY "public reads published store media"
  ON media FOR SELECT
  TO public
  USING (
    store_id IN (
      SELECT id FROM stores WHERE published_at IS NOT NULL AND is_active = true
    )
  );

-- ===================================================================
-- ORDERS — RLS
-- ===================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Merchant manages their own orders
CREATE POLICY "merchants manage own orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Public can CREATE orders (cart checkout)
CREATE POLICY "public create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE published_at IS NOT NULL AND is_active = true
    )
  );

-- Customers can view their own orders (via store_id lookup would need denormalization)
-- For now, public reads restricted — use future customer_id column
-- Super admins can do everything
CREATE POLICY "admins full access orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- ===================================================================
-- ORDER ITEMS — RLS (inherits from orders)
-- ===================================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Can read items if can read the order
CREATE POLICY "read order items via order"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
      )
    )
  );

-- Can insert items (cascades from order insert)
CREATE POLICY "public insert order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE store_id IN (
        SELECT id FROM stores WHERE published_at IS NOT NULL AND is_active = true
      )
    )
  );

-- Super admins can do everything
CREATE POLICY "admins full access order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- ===================================================================
-- SUBSCRIPTIONS — RLS
-- ===================================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Merchant views own subscription
CREATE POLICY "merchants view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Only system/service can update (future: Stripe webhooks)
CREATE POLICY "service updates subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Super admins can see all
CREATE POLICY "admins view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- ===================================================================
-- AUDIT LOGS — RLS
-- ===================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can read audit logs
CREATE POLICY "only admins read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

-- Service role can insert
CREATE POLICY "service inserts audit logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ===================================================================
-- Helper function: updated_at
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- Future RPCs (stored procedures / secure access to sensitive ops)
-- ===================================================================

-- get_user_store: return store owned by current user
CREATE OR REPLACE FUNCTION get_user_store(p_user_id uuid)
RETURNS TABLE (
  id uuid, subdomain text, name text, published_at timestamptz, config_json jsonb
) SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.subdomain, s.name, s.published_at, s.config_json
  FROM stores s
  WHERE s.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- sync_craft_to_products: sync canvas products into products table
CREATE OR REPLACE FUNCTION sync_craft_to_products(
  p_store_id uuid,
  p_products jsonb
)
RETURNS void SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p record;
BEGIN
  -- Delete products no longer in canvas
  DELETE FROM products
  WHERE store_id = p_store_id
    AND id NOT IN (
      SELECT (elem->>'id')::uuid
      FROM jsonb_array_elements(p_products) AS elem
      WHERE elem->>'id' IS NOT NULL
    );

  -- Upsert remaining
  FOR p IN
    SELECT elem
    FROM jsonb_array_elements(p_products) AS elem
  LOOP
    INSERT INTO products (id, store_id, name, price, emoji, images, is_available)
    VALUES (
      COALESCE((p.elem->>'id')::uuid, gen_random_uuid()),
      p_store_id,
      p.elem->>'name',
      COALESCE((p.elem->>'price')::numeric, 0),
      p.elem->>'emoji',
      ARRAY[COALESCE(p.elem->>'imageUrl', '')],
      true
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      emoji = EXCLUDED.emoji,
      images = EXCLUDED.images,
      updated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;
