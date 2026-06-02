# Pailo — Progress Report & Next Steps

**Date:** 2026-06-02  
**Current Phase:** Phase 1 (MVP) — Store + Products + Orders + Admin  
**Tech Stack:** Next.js 16, Supabase, Craft.js, TypeScript, TailCSS

---

## ✅ Done (What we did so far)

### 1. Database Schema & Supabase Setup
- [x] Created 9 complete tables: `profiles`, `stores`, `categories`, `products`, `media`, `orders`, `order_items`, `subscriptions`, `audit_logs`
- [x] RLS policies on all tables (merchant, public, super_admin roles)
- [x] Helper function `has_role()` to avoid RLS recursion
- [x] RPCs: `publish_store`, `sync_craft_to_products`, `confirm_order`, `decrement_stock`, `get_user_store`
- [x] Removed duplicate fields (`email`, `phone` from `profiles` → kept in `auth.users` and `stores`)
- [x] All migrations pushed to remote Supabase

### 2. Builder → Database Sync
- [x] Publish button in builder now:
  - Extracts products from Craft.js canvas
  - Calls `sync_craft_to_products` RPC
  - Sets `published_at` on store
- [x] Products sync with all fields: `name`, `price`, `emoji`, `stock`, `available`, `sku`, `description`, `images`
- [x] DB stock/SKU preserved during canvas sync (not overwritten)

### 3. Public Store (`/[subdomain]`)
- [x] Server component fetches store from DB
- [x] Fetches products from `products` table
- [x] Injects DB products into Craft.js canvas before render
- [x] "Add to cart" button works in public mode (disabled if stock = 0 or unavailable)
- [x] Cart is a Bootstrap-style modal (not drawer)
- [x] Fixed cart button with dynamic badge (top-right)
- [x] Cart respects stock limits (can't add more than available)
- [x] Checkout form (name, phone, address) → creates order in DB (COD)

### 4. Dashboard Products (`/dashboard/products`)
- [x] Server component fetches products from DB
- [x] ProductsClient CRUD:
  - Add new product
  - Edit existing product
  - Delete product
  - Stock management (default = 10)
  - Image URL field
  - SKU field
  - Available toggle
- [x] Stock defaults to 10 for new products
- [x] Fixed SKU unique constraint conflict (made non-unique)

### 5. Dashboard Orders (`/dashboard/orders`)
- [x] Orders table with status filters (all, pending, confirmed, shipped, delivered)
- [x] Order detail modal (items, customer info, total)
- [x] Status progression: pending → confirmed → shipped → delivered
- [x] **Confirm order triggers stock deduction** via `decrement_stock` RPC
- [x] Stock reduced by quantity purchased per item
- [x] `confirmed_at` timestamp set on confirmation

### 6. Admin Panel (`/admin`)
- [x] Middleware auto-redirects `super_admin` users to `/admin`
- [x] Layout with sidebar navigation
- [x] `/admin` dashboard:
  - KPI cards: Stores count, Orders count, Users count
  - Quick actions links
- [x] `/admin/stores`:
  - List all stores with name, subdomain, status, owner, date
  - Enable/Disable toggle button per store
- [x] `/admin/users`:
  - List all users with name, email, role, status
  - Make Admin / Demote button per user
- [x] `/admin/audit-logs`:
  - Table showing action, entity, store, actor, date

### 7. Bug Fixes & Polish
- [x] Fixed `ProductsVariants.tsx` corruption (duplicate blocks)
- [x] Fixed `NaN` errors in cart quantity
- [x] Fixed missing `updated_at` column on `orders` table
- [x] Fixed RLS recursion with `has_role()` helper
- [x] Fixed migration version conflicts (renamed duplicates)
- [x] Fixed emoji typo in migration (`emji` → `emoji`)
- [x] Fixed cart stock display to show real DB stock
- [x] Removed duplicate CartDrawer/CartFAB components
- [x] Cleaned Next.js cache issues

---

## 🔴 Priority 1 — Next Steps (Blocking sales)

### Étape 3 — Paiements (Payments)
- [ ] Cash on delivery (COD) — ✅ Already working
- [ ] Stripe integration for cards
- [ ] D17 / Flouci for Tunisia
- [ ] Payment status tracking (pending → paid / failed)
- [ ] Webhook handling for payment confirmation

### Étape 4 — WhatsApp complet
- [ ] Receive orders via WhatsApp
- [ ] Confirm/refuse order via WhatsApp message
- [ ] Daily briefing at 9am (order summary)
- [ ] Low stock alerts via WhatsApp
- [ ] AI responses via Claude Haiku

---

## 🟡 Priority 2 — Improve UX (2-3 weeks)

### Étape 5 — AI tab in builder
- [ ] Analyze selected block
- [ ] Suggest better headline
- [ ] Generate text based on business description
- [ ] Translate to Arabic

### Étape 6 — Enhanced product management
- [ ] Image upload from `/dashboard/products` (not just builder)
- [ ] Stock management with alerts
- [ ] Categories
- [ ] Featured products

---

## 🟢 Priority 3 — Scale (1+ month)

### Étape 7 — SEO & Performance
- [ ] Dynamic meta tags per store
- [ ] Sitemap.xml
- [ ] Open Graph images
- [ ] Lighthouse score > 90

### Étape 8 — Analytics
- [ ] Visitors per day/week
- [ ] Conversion rate (visitors → orders)
- [ ] Most viewed products
- [ ] Charts in dashboard

### Étape 9 — Custom domains
- [ ] `sara-candles.com` instead of `pailo.io/sara-candles`
- [ ] Vercel domains API integration
- [ ] Auto SSL

### Étape 10 — Production deployment
- [ ] Vercel for Next.js
- [ ] Railway or Render for NestJS
- [ ] Production environment variables
- [ ] GitHub Actions CI/CD

---

## 🚧 Current Blockers

1. **`/dashboard/products` returns 500** — Need to debug server-side error (likely `supabase.auth.getUser()` or missing column)
2. **Admin API routes missing** — `/api/admin/stores/[id]/toggle` and `/api/admin/users/[id]/role` need to be created
3. **Stock deduction not verified in production** — SQL works in Studio, need to verify RPC is deployed

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `apps/web/src/app/[subdomain]/page.tsx` | Public store page (server) |
| `apps/web/src/app/[subdomain]/StoreClientShell.tsx` | Cart context + modal |
| `apps/web/src/components/store/CartContext.tsx` | Cart state management |
| `apps/web/src/components/store/CartModal.tsx` | Cart modal UI |
| `apps/web/src/app/dashboard/products/page.tsx` | Products page (server) |
| `apps/web/src/app/dashboard/products/ProductsClient.tsx` | Products CRUD (client) |
| `apps/web/src/app/dashboard/orders/page.tsx` | Orders management |
| `apps/web/src/components/builder/BuilderTopbar.tsx` | Builder publish logic |
| `apps/web/src/components/onboarding/variants/products/ProductsVariants.tsx` | Product blocks (Grid/List/Masonry) |
| `supabase/migrations/` | All DB migrations |
| `DATABASE_SCHEMA.md` | Full schema reference |

---

## 🗄️ Database Migrations Applied

| Version | Migration | Description |
|---------|-----------|-------------|
| 20250601 | `20250601_initial_schema.sql` | Base schema (9 tables) |
| 20250602 | `20250602_rls_policies.sql` | RLS policies |
| 20250603 | `20250603_cleanup_profiles.sql` | Remove duplicate email/phone from profiles |
| 20250604 | `20250604_seed_profiles.sql` | Seed profiles for existing users |
| 20250605 | `20250605_publish_rpc.sql` | `publish_store` RPC |
| 20250607 | `20250607_fix_products_sync.sql` | Fix products sync |
| 20250608 | `20250608_fix_emoji_typo.sql` | Fix emoji column typo |
| 20250609 | `20250609_remove_sku_unique.sql` | Remove SKU unique constraint |
| 20250610 | `20250610_sync_full_product.sql` | Sync full product fields |
| 20250611 | `20250611_final_fix_emoji.sql` | Final emoji fix |
| 20250612 | `20250612_add_orders_customer_phone.sql` | Add customer_phone to orders |
| 20250613 | `20250613_add_pending_order_qty.sql` | Add pending_order_qty to products |
| 20250614 | `20250614_preserve_db_stock.sql` | Preserve DB stock during sync |
| 20250615 | `20250615_fix_orders_updated_at.sql` | Fix orders updated_at trigger |
| 20250616 | `20250616_orders_updated_at.sql` | Orders updated_at fix v2 |
| 20250617 | `20250617_orders_confirm_stock.sql` | Confirm order + stock deduction |
| 20250618 | `20250618_decrement_stock.sql` | Simple decrement_stock RPC |
| 20250619 | `20250619_confirm_order_and_stock_deduction.sql` | Confirm order RPC |
| 20250620 | `20250620_recreate_confirm_order.sql` | Recreate confirm_order |

---

## 🎯 Immediate Next Action

**Fix `/dashboard/products` 500 error:**
1. Check server logs for exact error
2. Verify `supabase.auth.getUser()` works on server
3. Verify `products` table has all required columns
4. Test with simplified error handling

**Then:** Create admin API routes for store toggle and user role change.
