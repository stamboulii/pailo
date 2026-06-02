-- ===================================================================
-- Pailo Database — Add missing customer_phone to orders
-- Version: 1.1.4
-- ===================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE public.orders
      ADD COLUMN customer_phone text;
  END IF;
END $$;
