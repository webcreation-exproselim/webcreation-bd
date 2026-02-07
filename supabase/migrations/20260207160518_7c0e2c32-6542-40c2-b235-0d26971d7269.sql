
-- Create projects table for timer system
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  paused_at TIMESTAMP WITH TIME ZONE,
  remaining_duration_ms BIGINT,
  reminder_sent_1day BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_3day BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_same_day BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage all projects"
ON public.projects
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert projects"
ON public.projects
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();
