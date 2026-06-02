-- ===================================================================
-- Pailo Database — Confirm order RPC + safe stock deduction
-- Version: 1.1.10
-- ===================================================================

-- Drop previous attempt if present
DROP FUNCTION IF EXISTS public.confirm_order(uuid);

CREATE OR REPLACE FUNCTION public.confirm_order(p_order_id uuid)
RETURNS void SECURITY DEFINER SET search_path = public AS $$
DECLARE
  order_rec record;
  item record;
BEGIN
  SELECT id, store_id, status, items_json
    INTO order_rec
    FROM public.orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF order_rec IS NULL THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF order_rec.status <> 'pending' THEN
    RAISE EXCEPTION 'Order is not pending';
  END IF;

  UPDATE public.orders
     SET status = 'confirmed',
         confirmed_at = now(),
         updated_at = now()
   WHERE id = p_order_id;

  FOR item IN
    SELECT (elem->>'id')::uuid AS product_id,
           COALESCE((elem->>'quantity')::integer, 0) AS qty
      FROM jsonb_array_elements(order_rec.items_json) AS elem
  LOOP
    IF item.product_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.products
       SET stock = GREATEST(0, stock - item.qty)
     WHERE id = item.product_id
       AND store_id = order_rec.store_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.confirm_order(uuid) TO authenticated;
