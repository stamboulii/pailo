-- ===================================================================
-- Pailo Database Schema — Fully Idempotent Upgrade
-- Version: 1.0.5
-- Fixed order: CREATE TABLE before ALTER TABLE
-- ===================================================================

-- ===================================================================
-- Helper function: updated_at (must be first)
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 1. PROFILES
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  role text NOT NULL DEFAULT 'merchant' CHECK (role IN ('super_admin', 'merchant')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'merchant';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 2. STORES
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  phone text,
  email text,
  address text,
  city text,
  country text DEFAULT 'Tunisia',
  currency text NOT NULL DEFAULT 'TND',
  logo_url text,
  cover_url text,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  config_text jsonb DEFAULT '{}'::jsonb,
  published_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE stores ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'tagline'
  ) THEN
    ALTER TABLE stores ADD COLUMN tagline text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'description'
  ) THEN
    ALTER TABLE stores ADD COLUMN description text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'phone'
  ) THEN
    ALTER TABLE stores ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'email'
  ) THEN
    ALTER TABLE stores ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'address'
  ) THEN
    ALTER TABLE stores ADD COLUMN address text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'city'
  ) THEN
    ALTER TABLE stores ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'country'
  ) THEN
    ALTER TABLE stores ADD COLUMN country text DEFAULT 'Tunisia';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'currency'
  ) THEN
    ALTER TABLE stores ADD COLUMN currency text NOT NULL DEFAULT 'TND';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE stores ADD COLUMN logo_url text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE stores ADD COLUMN cover_url text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'config_text'
  ) THEN
    ALTER TABLE stores ADD COLUMN config_text jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stores_subdomain ON stores(subdomain) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);

DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 3. CATEGORIES
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 4. PRODUCTS
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text,
  description text,
  short_description text,
  price numeric(12,3) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(12,3) CHECK (compare_at_price >= 0),
  sku text,
  barcode text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  track_inventory boolean NOT NULL DEFAULT true,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  weight_kg numeric(8,3),
  dimensions_cm text,
  is_featured boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  meta_title text,
  meta_description text,
  sort_order integer NOT NULL DEFAULT 0,
  images text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'slug'
  ) THEN
    ALTER TABLE products ADD COLUMN slug text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'description'
  ) THEN
    ALTER TABLE products ADD COLUMN description text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'short_description'
  ) THEN
    ALTER TABLE products ADD COLUMN short_description text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'compare_at_price'
  ) THEN
    ALTER TABLE products ADD COLUMN compare_at_price numeric(12,3) CHECK (compare_at_price >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE products ADD COLUMN barcode text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'track_inventory'
  ) THEN
    ALTER TABLE products ADD COLUMN track_inventory boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer NOT NULL DEFAULT 5;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE products ADD COLUMN weight_kg numeric(8,3);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'dimensions_cm'
  ) THEN
    ALTER TABLE products ADD COLUMN dimensions_cm text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE products ADD COLUMN is_available boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE products ADD COLUMN meta_title text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE products ADD COLUMN meta_description text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE products ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images text[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'tags'
  ) THEN
    ALTER TABLE products ADD COLUMN tags text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(store_id, is_featured) WHERE is_featured = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_store_sku ON products(store_id, sku) WHERE sku IS NOT NULL;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 5. MEDIA
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  path text NOT NULL,
  url text NOT NULL,
  mime_type text,
  size_bytes integer,
  width integer,
  height integer,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_store_id ON media(store_id);
CREATE INDEX IF NOT EXISTS idx_media_product_id ON media(product_id);
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 6. ORDERS
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  customer_city text,
  customer_notes text,
  subtotal numeric(12,3) NOT NULL DEFAULT 0,
  tax numeric(12,3) NOT NULL DEFAULT 0,
  discount numeric(12,3) NOT NULL DEFAULT 0,
  shipping_cost numeric(12,3) NOT NULL DEFAULT 0,
  total numeric(12,3) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'TND',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'stripe', 'd17', 'flouci', 'other')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  source text DEFAULT 'website',
  notes text,
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_city'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_city text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_notes text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal numeric(12,3) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax numeric(12,3) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount numeric(12,3) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_cost'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_cost numeric(12,3) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE orders ADD COLUMN currency text NOT NULL DEFAULT 'TND';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text NOT NULL DEFAULT 'cod';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'source'
  ) THEN
    ALTER TABLE orders ADD COLUMN source text DEFAULT 'website';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN notes text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN confirmed_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipped_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipped_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN cancelled_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(store_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_store_number ON orders(store_id, order_number);
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 7. ORDER ITEMS
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  product_emoji text,
  unit_price numeric(12,3) NOT NULL CHECK (unit_price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal numeric(12,3) NOT NULL CHECK (subtotal >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ===================================================================
-- 8. SUBSCRIPTIONS
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired')),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  max_products integer,
  max_orders_per_month integer,
  custom_domain_enabled boolean NOT NULL DEFAULT false,
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  analytics_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_store_id ON subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 9. AUDIT LOGS
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_store_id ON audit_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
