-- ===================================================================
-- Pailo Database — Remove SKU unique constraint (optional SKU)
-- Version: 1.1.1
-- Reason: SKU is optional per tenant; multiple products may omit it,
-- so (store_id, sku) must not be UNIQUE unless present.
-- ===================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.products'::regclass
      AND conname = 'idx_products_store_sku'
  ) THEN
    ALTER TABLE public.products DROP CONSTRAINT idx_products_store_sku;
  END IF;
END $$;

-- Recreate as non-unique index if still useful for lookups
CREATE INDEX IF NOT EXISTS idx_products_store_sku
  ON public.products(store_id, sku);
