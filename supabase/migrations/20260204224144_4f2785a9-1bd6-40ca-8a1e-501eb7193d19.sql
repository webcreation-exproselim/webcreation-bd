-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- Create a view to safely expose user info for admin (without sensitive data)
-- This joins profiles with auth.users to get email
CREATE OR REPLACE VIEW public.admin_user_view
WITH (security_invoker=on) AS
SELECT 
  p.id as profile_id,
  p.user_id,
  p.full_name,
  p.phone,
  p.avatar_url,
  p.created_at,
  au.email
FROM public.profiles p
LEFT JOIN auth.users au ON p.user_id = au.id;

-- Only admins can view this
CREATE POLICY "Admins can view all users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage user_roles
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert new profiles
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));