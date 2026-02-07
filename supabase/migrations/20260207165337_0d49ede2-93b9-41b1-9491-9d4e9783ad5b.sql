-- Drop the insecure view that exposes auth.users
DROP VIEW IF EXISTS public.admin_user_view;

-- The get_admin_users() security definer function already exists from previous migration
-- It checks admin role and only then returns data from auth.users