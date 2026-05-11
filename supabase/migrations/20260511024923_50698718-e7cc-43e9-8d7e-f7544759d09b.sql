
CREATE TABLE public.sponsorship_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.sponsorship_children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, user_id)
);

ALTER TABLE public.sponsorship_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sponsorships"
ON public.sponsorship_sponsors FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sponsorships"
ON public.sponsorship_sponsors FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can insert own sponsorship"
ON public.sponsorship_sponsors FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete sponsorships"
ON public.sponsorship_sponsors FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own sponsorship"
ON public.sponsorship_sponsors FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
