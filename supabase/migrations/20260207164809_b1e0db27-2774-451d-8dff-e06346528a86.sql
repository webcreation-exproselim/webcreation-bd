-- Drop and recreate admin_user_view with security_definer to access auth.users
DROP VIEW IF EXISTS public.admin_user_view;

CREATE VIEW public.admin_user_view
WITH (security_barrier=true) AS
SELECT 
  p.id AS profile_id,
  p.user_id,
  p.full_name,
  p.phone,
  p.avatar_url,
  p.created_at,
  au.email
FROM profiles p
LEFT JOIN auth.users au ON (p.user_id = au.id);

-- Grant select to authenticated users (RLS on profiles will still apply)
GRANT SELECT ON public.admin_user_view TO authenticated;

-- Create a security definer function to safely query the view
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  profile_id uuid,
  user_id uuid,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz,
  email varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id AS profile_id,
    p.user_id,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.created_at,
    au.email
  FROM profiles p
  LEFT JOIN auth.users au ON (p.user_id = au.id)
  ORDER BY p.created_at DESC;
END;
$$;