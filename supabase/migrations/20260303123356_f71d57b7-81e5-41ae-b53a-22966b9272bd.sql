
-- Classes table
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  day_of_week text NOT NULL,
  time_slot text NOT NULL,
  max_capacity integer DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view classes"
ON public.classes FOR SELECT TO authenticated
USING (true);

-- Class enrollments table
CREATE TABLE public.class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id)
);

ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments"
ON public.class_enrollments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments"
ON public.class_enrollments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enrollments"
ON public.class_enrollments FOR DELETE TO authenticated
USING (auth.uid() = user_id);
