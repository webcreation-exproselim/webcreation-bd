
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  facebook_url text NOT NULL,
  thumbnail_url text,
  caption text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stories"
  ON public.stories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage all stories"
  ON public.stories FOR ALL
  TO public
  USING (public.has_role(auth.uid(), 'admin'::app_role));
