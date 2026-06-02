-- ===================================================================
-- Pailo Database — Add pending_order_qty tracking
-- Version: 1.1.5
-- ===================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'pending_order_qty'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN pending_order_qty integer NOT NULL DEFAULT 0;
  END IF;
END $$;
