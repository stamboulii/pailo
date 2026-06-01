-- ===================================================================
-- Pailo Database — Fix publish_store RPC ambiguous column
-- Version: 1.0.8
-- ===================================================================

-- Drop and recreate with qualified column reference
DROP FUNCTION IF EXISTS public.publish_store(uuid);

CREATE OR REPLACE FUNCTION public.publish_store(p_store_id uuid)
RETURNS TABLE (
  id uuid,
  subdomain text,
  name text,
  published_at timestamptz
) SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  UPDATE public.stores
  SET published_at = now()
  WHERE id = p_store_id
    AND user_id = auth.uid()
  RETURNING stores.id, subdomain, name, published_at;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.publish_store(uuid) TO authenticated;
