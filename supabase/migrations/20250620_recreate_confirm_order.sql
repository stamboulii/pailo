-- Recreate confirm_order RPC directly in public schema
CREATE OR REPLACE FUNCTION public.confirm_order(p_order_id uuid)
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

GRANT EXECUTE ON FUNCTION public.confirm_order(uuid) TO authenticated;
