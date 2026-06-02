-- ===================================================================
-- Pailo Database — Simple stock decrement RPC
-- Version: 1.1.9
-- ===================================================================

CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id uuid,
  p_qty integer,
  p_store_id uuid
)
RETURNS integer SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_stock integer;
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - p_qty)
  WHERE id = p_product_id
    AND store_id = p_store_id
  RETURNING stock INTO new_stock;

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer, uuid) TO authenticated;
