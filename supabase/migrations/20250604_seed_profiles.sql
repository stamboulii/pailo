-- ===================================================================
-- Seed: profiles for existing auth.users
-- ===================================================================
INSERT INTO public.profiles (id, full_name, role, is_active)
VALUES
  (
    'ba3a02d1-e1d8-469f-ae69-2c1ffe027d69',
    'Hazar',
    'merchant',
    true
  ),
  (
    '3064ba77-5783-4972-908e-09527c52c49c',
    'Stambouli',
    'super_admin',
    true
  ),
  (
    'b84b568a-9c27-4edf-a769-47ee9b8e7837',
    'Hazar Test',
    'merchant',
    true
  ),
  (
    '0439b08b-b8b8-4ea9-aee2-6365be4eba98',
    'Stambouli Mansour',
    'merchant',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
