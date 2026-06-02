-- ===================================================================
-- Pailo Database — Keep DB stock/sku/description during canvas sync
-- Version: 1.1.6
-- ===================================================================

DROP FUNCTION IF EXISTS public.sync_craft_to_products(uuid, jsonb);

CREATE OR REPLACE FUNCTION public.sync_craft_to_products(
  p_store_id uuid,
  p_products jsonb
)
RETURNS void SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p record;
BEGIN
  DELETE FROM public.products
  WHERE store_id = p_store_id
    AND id NOT IN (
      SELECT (elem->>'id')::uuid
      FROM jsonb_array_elements(p_products) AS elem
      WHERE elem->>'id' IS NOT NULL
    );

  FOR p IN
    SELECT elem
    FROM jsonb_array_elements(p_products) AS elem
  LOOP
    INSERT INTO public.products (id, store_id, name, price, emoji, images, is_available)
    VALUES (
      COALESCE((p.elem->>'id')::uuid, gen_random_uuid()),
      p_store_id,
      p.elem->>'name',
      COALESCE((p.elem->>'price')::numeric, 0),
      COALESCE(p.elem->>'emoji', '📦'),
      ARRAY[COALESCE(p.elem->>'imageUrl', '')]::text[],
      COALESCE((p.elem->>'available')::boolean, true),
      0,
      NULL,
      p.elem->>'desc'
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      emoji = EXCLUDED.emoji,
      images = EXCLUDED.images,
      is_available = EXCLUDED.is_available,
      updated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.sync_craft_to_products(uuid, jsonb) TO authenticated;
