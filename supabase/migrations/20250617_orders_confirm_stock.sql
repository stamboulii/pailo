-- ===================================================================
-- Pailo Database — Fix orders trigger + add stock deduction
-- Version: 1.1.8
-- ===================================================================

-- Ensure orders.updated_at exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Recreate trigger safely
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC: confirm_order — marks order confirmed and decrements stock
CREATE OR REPLACE FUNCTION confirm_order(p_order_id uuid)
RETURNS void SECURITY DEFINER SET search_path = public AS $$
DECLARE
  order_rec record;
  item record;
BEGIN
  SELECT * INTO order_rec FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF order_rec.status <> 'pending' THEN
    RAISE EXCEPTION 'Order is not pending';
  END IF;

  UPDATE public.orders
  SET status = 'confirmed', confirmed_at = now(), updated_at = now()
  WHERE id = p_order_id;

  FOR item IN
    SELECT jsonb_array_elements(order_rec.items_json) AS elem
  LOOP
    UPDATE public.products
    SET stock = GREATEST(0, stock - COALESCE((item.elem->>'quantity')::integer, 0))
    WHERE id = (item.elem->>'id')::uuid
      AND store_id = order_rec.store_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION confirm_order(uuid) TO authenticated;
