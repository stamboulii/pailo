-- ===================================================================
-- Pailo Database — Fix missing columns + RPC signature
-- Version: 1.0.9
-- ===================================================================

-- Restore emoji column on products if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'emoji'
  ) THEN
    ALTER TABLE public.products ADD COLUMN emoji text DEFAULT '📦';
  END IF;
END $$;

-- Fix sync_craft_to_products to receive jsonb directly
DROP FUNCTION IF EXISTS public.sync_craft_to_products(uuid, jsonb);

CREATE OR REPLACE FUNCTION public.sync_craft_to_products(
  p_store_id uuid,
  p_products jsonb
)
RETURNS void SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p record;
BEGIN
  -- Delete products no longer in canvas
  DELETE FROM public.products
  WHERE store_id = p_store_id
    AND id NOT IN (
      SELECT (elem->>'id')::uuid
      FROM jsonb_array_elements(p_products) AS elem
      WHERE elem->>'id' IS NOT NULL
    );

  -- Upsert remaining
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
      true
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      emoji = EXCLUDED.emoji,
      images = EXCLUDED.images,
      updated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.sync_craft_to_products(uuid, jsonb) TO authenticated;
