# Pailo — Database Schema Reference

> Version 1.0 · Supabase (PostgreSQL) · Updated: 2026-06-01

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase PostgreSQL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  auth.users  ──────►  profiles                                 │
│                            │                                    │
│                            ▼                                    │
│                        stores (tenant)                          │
│                            │                                    │
│              ┌─────────────┼─────────────┐                      │
│              ▼             ▼             ▼                      │
│         categories    products      media                       │
│              │             │                                    │
│              ▼             ▼                                    │
│           orders ◄──── order_items     subscriptions           │
│                            │                                    │
│                            ▼                                    │
│                        audit_logs                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Multi-tenant SaaS:
- Every merchant = 1 user (auth.users)
- Each user can own 1 store (scope V1)
- RLS isolates every tenant automatically
- Public read = only published + active stores
```

---

## 2. General Rules

| Rule | Value |
|---|---|
| Primary keys | `uuid` (gen_random_uuid) |
| Timestamps | `timestamptz DEFAULT now()` |
| Soft deletes | `is_active boolean` (default `true`) |
| Audit | `created_at`, `updated_at` + `audit_logs` table |
| Tenant isolation | `store_id` foreign key on every business table |
| RLS | Enabled on ALL tables |
| Default currency | `TND` (Tunisian Dinar) |
| Default country | `Tunisia` |

### 2.1 Helper Functions

```sql
update_updated_at_column()
```
Trigger function auto-updating `updated_at` on every row change. Used by all tables via `BEFORE UPDATE` triggers.

---

## 3. Tables

### 3.1 `auth.users` (Supabase built-in)

Supabase Auth managed users. Not modified by us, but referenced everywhere.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, managed by Supabase |
| `email` | `text` | Login identifier |
| `encrypted_password` | `text` | Managed by Supabase |
| `email_confirmed_at` | `timestamptz` | |
| `last_sign_in_at` | `timestamptz` | |
| `role` | `text` | Supabase internal role (`authenticated`, `service_role`, etc.) |

**RLS**: None needed (auth schema is protected by Supabase).

---

### 3.2 `profiles`

Extends `auth.users` with application-specific fields.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | — | PK, FK→`auth.users(id)` ON DELETE CASCADE | User identifier |
| `full_name` | `text` | `NULL` | | Display name |
| `avatar_url` | `text` | `NULL` | | Profile picture URL |
| `role` | `text` | `'merchant'` | CHECK: `super_admin` or `merchant` | Access level |
| `is_active` | `boolean` | `true` | NOT NULL | Ban/disable user |
| `created_at` | `timestamptz` | `now()` | NOT NULL | Registration date |
| `updated_at` | `timestamptz` | `now()` | NOT NULL | Last profile update |

**Note**: `email` and `phone` are stored in `auth.users` (managed by Supabase Auth). `profiles` only stores app-specific fields to avoid duplication.

**Indexes**: PK on `id`

**RLS Policies**:
- `users can view own profile` — SELECT own profile
- `users can update own profile` — UPDATE own profile
- `admins can view all profiles` — Super admins see everyone

**Relations**:
- `1:1` with `auth.users` (each user has exactly one profile)

**Usage**:
- Login via Supabase Auth
- Profile creation: trigger on `auth.users` INSERT → create `profiles` row
- Role check on protected routes

---

### 3.3 `stores`

The tenant/store entity. Each store belongs to one merchant user.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Store identifier |
| `user_id` | `uuid` | — | FK→`auth.users(id)` ON DELETE CASCADE | Owner merchant |
| `subdomain` | `text` | — | UNIQUE, NOT NULL | Public URL: `pailo.io/[subdomain]` |
| `name` | `text` | — | NOT NULL | Store display name |
| `tagline` | `text` | `NULL` | | Short description / slogan |
| `description` | `text` | `NULL` | | Full store description |
| `phone` | `text` | `NULL` | | Store contact phone |
| `email` | `text` | `NULL` | | Store contact email |
| `address` | `text` | `NULL` | | Store physical address |
| `city` | `text` | `NULL` | | City |
| `country` | `text` | `'Tunisia'` | | Country |
| `currency` | `text` | `'TND'` | NOT NULL | Store currency |
| `logo_url` | `text` | `NULL` | | Logo image URL |
| `cover_url` | `text` | `NULL` | | Cover/banner image URL |
| `config_json` | `jsonb` | `'{}'::jsonb` | NOT NULL | Craft.js canvas JSON (editor state) |
| `config_text` | `jsonb` | `'{}'::jsonb` | | Structured store config (colors, font, etc.) |
| `published_at` | `timestamptz` | `NULL` | | Store go-live timestamp. NULL = draft |
| `is_active` | `boolean` | `true` | NOT NULL | Soft delete / disable |
| `created_at` | `timestamptz` | `now()` | NOT NULL | |
| `updated_at` | `timestamptz` | `now()` | NOT NULL | |

**Indexes**:
- `idx_stores_subdomain` — WHERE `is_active = true` (public lookups)
- `idx_stores_user_id` — Merchant's stores

**RLS Policies**:
- `merchants manage own store` — CRUD on own store
- `public reads published stores` — Public reads published + active only
- `admins full access stores` — Super admins

**Relations**:
- `1:N` with `products` (a store has many products)
- `1:N` with `categories`
- `1:N` with `media`
- `1:N` with `orders`
- `1:1` with `subscriptions`
- `1:N` with `audit_logs`

**Usage**:
- `/dashboard/onboarding` → INSERT new store
- `/editor` → UPDATE `config_json` (Craft.js canvas)
- `/[subdomain]` → SELECT published store + products
- Publish = set `published_at = now()`

---

### 3.4 `categories`

Product categories for organizing store inventory.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Category identifier |
| `store_id` | `uuid` | — | FK→`stores(id)` ON DELETE CASCADE | Owner store |
| `name` | `text` | — | NOT NULL | Category name |
| `description` | `text` | `NULL` | | Category description |
| `sort_order` | `integer` | `0` | NOT NULL | Display order |
| `is_active` | `boolean` | `true` | NOT NULL | Hide category |
| `created_at` | `timestamptz` | `now()` | NOT NULL | |
| `updated_at` | `timestamptz` | `now()` | NOT NULL | |

**Indexes**: `idx_categories_store_id`

**RLS**: Merchant manages own, public reads published store categories.

**Usage**: Product filtering, category-based navigation in storefront.

---

### 3.5 `products`

Individual products within a store. This is the **canonical data source** — replaces Craft.js canvas-only storage.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Product identifier |
| `store_id` | `uuid` | — | FK→`stores(id)` ON DELETE CASCADE | Owner store |
| `category_id` | `uuid` | `NULL` | FK→`categories(id)` ON DELETE SET NULL | Product category |
| `name` | `text` | — | NOT NULL | Product name |
| `slug` | `text` | `NULL` | | URL-friendly identifier |
| `description` | `text` | `NULL` | | Full description |
| `short_description` | `text` | `NULL` | | Brief description for cards |
| `price` | `numeric(12,3)` | — | NOT NULL, ≥0 | Selling price |
| `compare_at_price` | `numeric(12,3)` | `NULL` | ≥0 | Original price (sales) |
| `sku` | `text` | `NULL` | UNIQUE per store | Stock Keeping Unit |
| `barcode` | `text` | `NULL` | | EAN/UPC barcode |
| `stock` | `integer` | `0` | NOT NULL, ≥0 | Available quantity |
| `track_inventory` | `boolean` | `true` | NOT NULL | Enable stock tracking |
| `low_stock_threshold` | `integer` | `5` | NOT NULL | Alert when stock ≤ this |
| `weight_kg` | `numeric(8,3)` | `NULL` | | For shipping calculation |
| `dimensions_cm` | `text` | `NULL` | | Package dimensions |
| `is_featured` | `boolean` | `false` | NOT NULL | Show in featured section |
| `is_available` | `boolean` | `true` | NOT NULL | Show/hide product |
| `meta_title` | `text` | `NULL` | | SEO title |
| `meta_description` | `text` | `NULL` | | SEO description |
| `sort_order` | `integer` | `0` | NOT NULL | Display ordering |
| `images` | `text[]` | `'{}'::text[]` | NOT NULL | Image URLs array |
| `tags` | `text[]` | `'{}'::text[]` | | Search/filter tags |
| `created_at` | `timestamptz` | `now()` | NOT NULL | |
| `updated_at` | `timestamptz` | `now()` | NOT NULL | |

**Indexes**:
- `idx_products_store_id`
- `idx_products_category_id`
- `idx_products_featured` — WHERE `is_featured = true`
- `idx_products_store_sku` — UNIQUE per store

**RLS**: Merchant owns products. Public reads published store products.

**Relations**:
- `N:1` with `stores`
- `N:1` with `categories`
- `1:N` with `media`
- `1:N` with `order_items`

**Sync from Craft.js**:
- `sync_craft_to_products(p_store_id, p_products jsonb)` RPC syncs canvas products into this table
- Used by Builder Publish action

---

### 3.6 `media`

Media files (images/videos) linked to stores or products.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Media identifier |
| `store_id` | `uuid` | — | FK→`stores(id)` ON DELETE CASCADE | Owner store |
| `product_id` | `uuid` | `NULL` | FK→`products(id)` ON DELETE CASCADE | Linked product (nullable) |
| `path` | `text` | — | NOT NULL | Supabase Storage path |
| `url` | `text` | — | NOT NULL | Public CDN URL |
| `mime_type` | `text` | `NULL` | | `image/jpeg`, `video/mp4`, etc. |
| `size_bytes` | `integer` | `NULL` | | File size |
| `width` | `integer` | `NULL` | | Image width (px) |
| `height` | `integer` | `NULL` | | Image height (px) |
| `alt_text` | `text` | `NULL` | | Accessibility alt text |
| `sort_order` | `integer` | `0` | NOT NULL | Gallery ordering |
| `created_at` | `timestamptz` | `now()` | NOT NULL | |

**Indexes**: `idx_media_store_id`, `idx_media_product_id`

**RLS**: Merchant manages own media. Public reads published store media.

**Storage**: Supabase Storage bucket `store-media`
- Upload path: `media/{timestamp}-{random}.{ext}`
- RLS on bucket: upload = authenticated, read = public

---

### 3.7 `orders`

Customer orders placed on a store.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Order identifier |
| `store_id` | `uuid` | — | FK→`stores(id)` ON DELETE CASCADE | Store receiving order |
| `order_number` | `text` | — | NOT NULL, UNIQUE per store | Human-readable: `#PAILO-001` |
| `customer_name` | `text` | — | NOT NULL | Customer full name |
| `customer_email` | `text` | `NULL` | | Customer email |
| `customer_phone` | `text` | — | NOT NULL | Customer phone |
| `customer_address` | `text` | — | NOT NULL | Delivery address |
| `customer_city` | `text` | `NULL` | | Delivery city |
| `customer_notes` | `text` | `NULL` | | Customer instructions |
| `subtotal` | `numeric(12,3)` | `0` | NOT NULL, ≥0 | Items sum before tax |
| `tax` | `numeric(12,3)` | `0` | NOT NULL, ≥0 | Tax amount |
| `discount` | `numeric(12,3)` | `0` | NOT NULL, ≥0 | Discount applied |
| `shipping_cost` | `numeric(12,3)` | `0` | NOT NULL, ≥0 | Delivery fee |
| `total` | `numeric(12,3)` | — | NOT NULL, ≥0 | Final amount |
| `currency` | `text` | `'TND'` | NOT NULL | Order currency |
| `status` | `text` | `'pending'` | CHECK: `pending|confirmed|processing|shipped|delivered|cancelled|refunded` | Order lifecycle |
| `payment_method` | `text` | `'cod'` | CHECK: `cod|stripe|d17|flouci|other` | Payment type |
| `payment_status` | `text` | `'pending'` | CHECK: `pending|paid|failed|refunded` | Payment status |
| `source` | `text` | `'website'` | | `website`, `whatsapp`, `admin` |
| `notes` | `text` | `NULL` | | Merchant notes |
| `confirmed_at` | `timestamptz` | `NULL` | | |
| `shipped_at` | `timestamptz` | `NULL` | | |
| `delivered_at` | `timestamptz` | `NULL` | | |
| `cancelled_at` | `timestamptz` | `NULL` | | |

**Indexes**:
- `idx_orders_store_id`
- `idx_orders_status` — Composite: store + status
- `idx_orders_created_at` — DESC for recent orders
- `idx_orders_store_number` — UNIQUE composite

**RLS**:
- Merchant manages own orders
- Public can INSERT (checkout)
- Super admins full access

**Order Status Flow**:
```
pending → confirmed → processing → shipped → delivered
                      ↘
                      cancelled
                      refunded (from confirmed/shipped)
```

---

### 3.8 `order_items`

Line items for each order. Snapshot of product at time of purchase.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Line item identifier |
| `order_id` | `uuid` | — | FK→`orders(id)` ON DELETE CASCADE | Parent order |
| `product_id` | `uuid` | `NULL` | FK→`products(id)` ON DELETE SET NULL | Product reference |
| `product_name` | `text` | — | NOT NULL | Snapshot: product name at purchase |
| `product_sku` | `text` | `NULL` | | Snapshot: SKU |
| `product_emoji` | `text` | `NULL` | | Snapshot: emoji/icon |
| `unit_price` | `numeric(12,3)` | — | NOT NULL, ≥0 | Price per unit at purchase |
| `quantity` | `integer` | — | NOT NULL, >0 | Units ordered |
| `subtotal` | `numeric(12,3)` | — | NOT NULL, ≥0 | `unit_price × quantity` |

**Indexes**: `idx_order_items_order_id`, `idx_order_items_product_id`

**RLS**: Inherits from parent order.

**Why denormalized?** Product prices/names can change. Order items freeze the state at purchase time for legal/historical accuracy.

---

### 3.9 `subscriptions`

Merchant subscription/plan management.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Subscription identifier |
| `store_id` | `uuid` | — | FK→`stores(id)` ON DELETE CASCADE UNIQUE | Linked store |
| `plan` | `text` | `'free'` | CHECK: `free|starter|pro|enterprise` | Plan tier |
| `status` | `text` | `'active'` | CHECK: `active|trialing|past_due|cancelled|expired` | Subscription status |
| `stripe_subscription_id` | `text` | `NULL` | UNIQUE | Stripe subscription ref |
| `stripe_customer_id` | `text` | `NULL` | | Stripe customer ref |
| `current_period_start` | `timestamptz` | `NULL` | | Billing period start |
| `current_period_end` | `timestamptz` | `NULL` | | Billing period end |
| `trial_ends_at` | `timestamptz` | `NULL` | | Trial expiration |
| `cancelled_at` | `timestamptz` | `NULL` | | Cancellation date |
| `max_products` | `integer` | `NULL` | | Plan limit: products |
| `max_orders_per_month` | `integer` | `NULL` | | Plan limit: orders |
| `custom_domain_enabled` | `boolean` | `false` | NOT NULL | Feature flag |
| `whatsapp_enabled` | `boolean` | `false` | NOT NULL | Feature flag |
| `analytics_enabled` | `boolean` | `false` | NOT NULL | Feature flag |
| `created_at` | `timestamptz` | `now()` | NOT NULL | |
| `updated_at` | `timestamptz` | `now()` | NOT NULL | |

**Plan Matrix**:

| Plan | max_products | max_orders/month | custom_domain | whatsapp | analytics |
|---|---|---|---|---|---|
| `free` | 10 | 50 | false | false | false |
| `starter` | 100 | 500 | false | true | true |
| `pro` | 1000 | 5000 | true | true | true |
| `enterprise` | ∞ | ∞ | true | true | true |

**RLS**: Merchant sees own. Super admins see all.

---

### 3.10 `audit_logs`

Immutable action log for admin tracking, billing events, and compliance.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | PK | Log entry identifier |
| `actor_id` | `uuid` | `NULL` | FK→`auth.users(id)` ON DELETE SET NULL | Who performed the action |
| `store_id` | `uuid` | `NULL` | FK→`stores(id)` ON DELETE CASCADE | Affected store |
| `action` | `text` | — | NOT NULL | `store.published`, `order.confirmed`, `user.role_changed`, etc. |
| `entity_type` | `text` | `NULL` | | `store`, `order`, `product`, `user` |
| `entity_id` | `uuid` | `NULL` | | ID of the affected entity |
| `changes` | `jsonb` | `NULL` | | `{before: {...}, after: {...}}` |
| `ip_address` | `text` | `NULL` | | Client IP |
| `user_agent` | `text` | `NULL` | | Browser/client info |
| `created_at` | `timestamptz` | `now()` | NOT NULL | When action occurred |

**Indexes**: `idx_audit_logs_store_id`, `idx_audit_logs_created_at` DESC

**RLS**: Super admins only (read). Service role inserts.

---

## 4. Entity-Relationship Diagram

```
auth.users (1) ──── (1) profiles
       │
       │ user_id
       ▼
    stores (1)
       │
       ├──────────────────────────────────────┐
       │                                      │
       │ store_id                             │ store_id
       ▼                                      ▼
  categories (N)                        products (N)
       │                                      │
       │ category_id                          │ store_id
       ▼                                      │
  products (N) ◄────────────────────────────┘
       │
       │ product_id
       ▼
     media (N)

    stores (1)
       │
       │ store_id
       ▼
    orders (N)
       │
       │ order_id
       ▼
 order_items (N)
       │
       │ product_id
       ▼
   products (N)  [read-only reference]

    stores (1) ◄──────── subscriptions (1)  [1:1]

    stores (1) ◄──────── audit_logs (N)     [1:N]
    auth.users (1) ◄───── audit_logs (N)    [1:N]
```

---

## 5. Row Level Security (RLS) Summary

| Table | Public | Merchant | Super Admin |
|---|---|---|---|
| `profiles` | — | Own only | All |
| `stores` | Read published | CRUD own | All |
| `categories` | Read published | CRUD own store | All |
| `products` | Read published | CRUD own store | All |
| `media` | Read published | CRUD own store | All |
| `orders` | INSERT (checkout) | CRUD own store orders | All |
| `order_items` | INSERT (via order) | via order | All |
| `subscriptions` | — | Read own | All |
| `audit_logs` | — | — | Read all |

**Enforced rules**:
- Public visitors can ONLY `SELECT` published + active stores
- Public visitors can ONLY `INSERT` orders for published + active stores
- Merchants can ONLY access data where `store.user_id = auth.uid()`
- Super admins bypass all via `profiles.role = 'super_admin'`

---

## 6. RPCs (Stored Procedures)

### 6.1 `get_user_store(p_user_id uuid)`
Returns the store owned by the current user.

```sql
SELECT * FROM get_user_store(auth.uid()::uuid);
```
**Use case**: Dashboard store lookup, avoiding `SELECT stores WHERE user_id = ...`

### 6.2 `sync_craft_to_products(p_store_id uuid, p_products jsonb)`
Synchronizes Craft.js canvas products into the `products` table.

- Deletes products no longer in canvas
- Upserts remaining products
- Called by Builder Publish action

```sql
SELECT sync_craft_to_products('store-uuid', '[{"name":"Candle","price":25}]'::jsonb);
```

### 6.3 `publish_store(p_store_id uuid)`
Safely publishes a store (merchant only).

```sql
SELECT publish_store('store-uuid-here');
```
**Use case**: Editor Publish action. Uses `SECURITY DEFINER` to avoid RLS recursion.

---

## 7. Migration History

| Version | File | Description |
|---|---|---|
| `20250601` | `20250601_initial_schema.sql` | Base schema: helpers, profiles, stores, categories, products, media, orders, order_items, subscriptions, audit_logs |
| `20250602` | `20250602_rls_policies.sql` | RLS policies on all tables |
| `20250603` | `20250603_cleanup_profiles.sql` | Drop duplicate `email` and `phone` from profiles |
| `20250603` | `20250603_seed_profiles.sql` | Seed profiles for existing auth.users |
| `20250605` | `20250605_publish_rpc.sql` | `publish_store` RPC + fix recursive admin policies |

---

## 8. Environment Variables Required

```env
# Supabase (already in .env)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Storage bucket
BUCKET_STORE_MEDIA=store-media

# Payments (future)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp (future)
WA_WEBHOOK_VERIFY_TOKEN=...
WHATSAPP_API_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=https://pailo.io
```

---

## 9. Migration Checklist for Future Changes

When adding new features, follow this order:

1. **Add columns** via `DO $$ ... ALTER TABLE ADD COLUMN IF NOT EXISTS` blocks
2. **Create new tables** with `CREATE TABLE IF NOT EXISTS`
3. **Add triggers** for `updated_at` on new tables
4. **Add RLS policies** in a new migration file (new version number!)
5. **Update RPCs** if data access pattern changes
6. **Update this document** with new columns/tables

**Never**:
- DROP columns without a migration that preserves data
- Change column types without data migration
- Add RLS policies that break existing public read access
- Use `service_role` in client-side code

---

## 10. Common Queries Reference

```sql
-- Get published store by subdomain (public)
SELECT id, name, config_json FROM stores
WHERE subdomain = 'sara-candles' AND published_at IS NOT NULL AND is_active = true;

-- Get merchant's store with product count
SELECT s.*, COUNT(p.id) as product_count
FROM stores s
LEFT JOIN products p ON p.store_id = s.id
WHERE s.user_id = auth.uid() AND s.is_active = true
GROUP BY s.id;

-- Recent orders for merchant
SELECT o.*, COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.store_id = 'store-uuid'
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 20;

-- Low stock alert
SELECT p.name, p.stock, p.low_stock_threshold
FROM products p
WHERE p.store_id = 'store-uuid'
  AND p.track_inventory = true
  AND p.stock <= p.low_stock_threshold;

-- Revenue by day
SELECT DATE(created_at) as day, SUM(total) as revenue
FROM orders
WHERE store_id = 'store-uuid'
  AND status != 'cancelled'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

---

## 11. Data Flow Diagrams

### 11.1 Store Creation
```
User signsup (magic link)
    ↓
auth.users created
    ↓
profiles created (role = 'merchant')
    ↓
/dashboard/onboarding → INSERT stores
    ↓
Builder opens → config_json = empty canvas
```

### 11.2 Publish Flow
```
User finishes building
    ↓
Clicks "Publish"
    ↓
1. serialize() canvas JSON
2. INSERT INTO products (sync_craft_to_products)
3. UPDATE stores SET published_at = NOW(), config_json = canvas
    ↓
Public can now access /[subdomain]
```

### 11.3 Checkout Flow
```
Visitor on /[subdomain]
    ↓
Clicks "Add to cart"
    ↓
CartDrawer opens (localStorage + context)
    ↓
Fills checkout form
    ↓
POST /api/orders
    ↓
INSERT INTO orders + order_items
    ↓
Merchant sees in /dashboard/orders
```

### 11.4 Admin Flow (future)
```
Super admin logs in
    ↓
/admin page → SELECT all stores with stats
    ↓
Can: view all stores, change plans, ban users, see audit logs
    ↓
RLS: auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
```

---

## 12. Troubleshooting

### "Column does not exist" on migration
→ Column was added after initial table creation. The migration handles this with `IF NOT EXISTS` checks. If still failing, check migration order.

### "RLS blocks public access"
→ Store must have `published_at IS NOT NULL` AND `is_active = true`. Check both conditions.

### "Products not showing in store"
→ Products must have `is_available = true` and their parent store must be published. Also check `store_id` linkage.

### "Cannot insert order" (public checkout)
→ RLS only allows INSERT if store is published + active. Check `published_at IS NOT NULL`.

### "UUID cast error in RPC"
→ Cast `auth.uid()` to `uuid` explicitly: `auth.uid()::uuid`

---

*Last updated: 2026-06-01 · Maintained by Pailo engineering team*
