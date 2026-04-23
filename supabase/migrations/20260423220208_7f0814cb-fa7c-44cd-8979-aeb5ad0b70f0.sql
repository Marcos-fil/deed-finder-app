CREATE TABLE public.subscription_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  subscriber_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  monthly_amount NUMERIC(10,2),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_day INTEGER NOT NULL,
  is_minor BOOLEAN NOT NULL DEFAULT false,
  guardian_name TEXT,
  guardian_document TEXT,
  guardian_authorized BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all subscription registrations"
ON public.subscription_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscription registrations"
ON public.subscription_registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscription registrations"
ON public.subscription_registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create subscription registrations"
ON public.subscription_registrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own subscription registrations"
ON public.subscription_registrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_subscription_registrations_updated_at
BEFORE UPDATE ON public.subscription_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();