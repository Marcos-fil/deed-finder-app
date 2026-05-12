-- Create table for editable PIX area statistics
CREATE TABLE public.pix_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_goal NUMERIC NOT NULL DEFAULT 15000,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  donor_count INTEGER NOT NULL DEFAULT 0,
  month_label TEXT NOT NULL DEFAULT 'Fevereiro 2026',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.pix_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone authenticated can view pix stats"
  ON public.pix_stats
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert pix stats"
  ON public.pix_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update pix stats"
  ON public.pix_stats
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete pix stats"
  ON public.pix_stats
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_pix_stats_updated_at
  BEFORE UPDATE ON public.pix_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.pix_stats (month_goal, current_amount, donor_count, month_label)
VALUES (15000, 8450, 142, 'Fevereiro 2026');
