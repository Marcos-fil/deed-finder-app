
CREATE TABLE public.volunteer_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  action_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  pix_key TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view actions"
ON public.volunteer_actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert actions"
ON public.volunteer_actions FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update actions"
ON public.volunteer_actions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete actions"
ON public.volunteer_actions FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_volunteer_actions_updated_at
BEFORE UPDATE ON public.volunteer_actions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.volunteer_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID NOT NULL REFERENCES public.volunteer_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (action_id, user_id)
);

ALTER TABLE public.volunteer_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
ON public.volunteer_registrations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
ON public.volunteer_registrations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own registration"
ON public.volunteer_registrations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own registration"
ON public.volunteer_registrations FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete registrations"
ON public.volunteer_registrations FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update registrations"
ON public.volunteer_registrations FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_volunteer_registrations_updated_at
BEFORE UPDATE ON public.volunteer_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
