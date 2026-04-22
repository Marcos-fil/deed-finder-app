CREATE TABLE public.class_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL,
  class_id UUID NOT NULL,
  student_user_id UUID NOT NULL,
  confirmed_by UUID NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  class_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (enrollment_id, class_date)
);

ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage attendance"
ON public.class_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own attendance"
ON public.class_attendance
FOR SELECT
TO authenticated
USING (auth.uid() = student_user_id);

CREATE TABLE public.parent_child_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL,
  child_user_id UUID NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'responsável',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (parent_user_id, child_user_id)
);

ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage parent child links"
ON public.parent_child_links
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view their child links"
ON public.parent_child_links
FOR SELECT
TO authenticated
USING (auth.uid() = parent_user_id);

CREATE POLICY "Children can view their parent links"
ON public.parent_child_links
FOR SELECT
TO authenticated
USING (auth.uid() = child_user_id);

CREATE INDEX idx_class_attendance_student ON public.class_attendance(student_user_id);
CREATE INDEX idx_class_attendance_class ON public.class_attendance(class_id);
CREATE INDEX idx_parent_child_parent ON public.parent_child_links(parent_user_id);
CREATE INDEX idx_parent_child_child ON public.parent_child_links(child_user_id);