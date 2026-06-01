-- ===================================================================
-- Pailo Database — Cleanup: remove duplicated contact columns
-- Version: 1.0.6
-- profiles should NOT duplicate auth.users contact fields
-- ===================================================================

-- Drop duplicate columns from profiles if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles DROP COLUMN email;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles DROP COLUMN phone;
  END IF;
END $$;

-- Verify final structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
