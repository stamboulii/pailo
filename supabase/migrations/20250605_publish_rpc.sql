-- ===================================================================
-- Pailo Database — Publish RPC
-- Version: 1.0.7
-- ===================================================================

-- ===================================================================
-- RPC: publish_store
-- Safely publishes a store (merchant only)
-- ===================================================================
CREATE OR REPLACE FUNCTION publish_store(p_store_id uuid)
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
  RETURNING id, subdomain, name, published_at;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION publish_store(uuid) TO authenticated;
