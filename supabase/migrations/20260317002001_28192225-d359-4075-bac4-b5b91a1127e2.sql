
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: admins can see all roles, users can see their own
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Donations tracking table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  pix_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  donor_name TEXT,
  donor_email TEXT
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Users can insert their own donations
CREATE POLICY "Users can insert donations"
ON public.donations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own donations
CREATE POLICY "Users can view own donations"
ON public.donations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations"
ON public.donations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update donations
CREATE POLICY "Admins can update donations"
ON public.donations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
