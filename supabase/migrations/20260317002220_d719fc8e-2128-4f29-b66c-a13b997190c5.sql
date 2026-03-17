
-- Allow admins to insert classes
CREATE POLICY "Admins can insert classes"
ON public.classes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete classes
CREATE POLICY "Admins can delete classes"
ON public.classes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update classes
CREATE POLICY "Admins can update classes"
ON public.classes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all enrollments
CREATE POLICY "Admins can view all enrollments"
ON public.class_enrollments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
