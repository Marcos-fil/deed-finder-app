
CREATE TABLE public.sponsorship_children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cause TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  payment_link TEXT NOT NULL,
  sponsored_by UUID,
  sponsored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsorship_children ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX sponsorship_children_sponsor_unique
  ON public.sponsorship_children (sponsored_by)
  WHERE sponsored_by IS NOT NULL;

CREATE POLICY "Anyone authenticated can view children"
  ON public.sponsorship_children FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert children"
  ON public.sponsorship_children FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete children"
  ON public.sponsorship_children FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins or sponsoring user can update"
  ON public.sponsorship_children FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (sponsored_by IS NULL)
    OR (sponsored_by = auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR (sponsored_by = auth.uid())
  );

CREATE TRIGGER update_sponsorship_children_updated_at
  BEFORE UPDATE ON public.sponsorship_children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sponsorship_children (name, cause, description, amount, payment_link) VALUES
  ('Lucas, 8 anos', 'Material escolar', 'Cadernos, lápis e mochila para o ano letivo.', 60, 'https://nubank.com.br/pagar/exemplo/lucas'),
  ('Mariana, 10 anos', 'Uniforme escolar', 'Uniforme completo (camisa, calça e tênis).', 120, 'https://nubank.com.br/pagar/exemplo/mariana'),
  ('Pedro, 7 anos', 'Cesta básica do mês', 'Alimentação para a família durante 30 dias.', 180, 'https://nubank.com.br/pagar/exemplo/pedro'),
  ('Sofia, 12 anos', 'Aulas de reforço', 'Mensalidade de reforço escolar em matemática e português.', 90, 'https://nubank.com.br/pagar/exemplo/sofia'),
  ('Gabriel, 9 anos', 'Kit de higiene', 'Produtos de higiene pessoal por 3 meses.', 75, 'https://nubank.com.br/pagar/exemplo/gabriel');
