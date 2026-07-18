
-- Restrict pix_stats read to admins only (public display now fetched via edge function using service role)
DROP POLICY IF EXISTS "Anyone authenticated can view pix stats" ON public.pix_stats;
CREATE POLICY "Admins can view pix stats" ON public.pix_stats FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Restrict sponsorship_children read to admins only (public listing now via edge function)
DROP POLICY IF EXISTS "Anyone authenticated can view children" ON public.sponsorship_children;
CREATE POLICY "Admins can view children" ON public.sponsorship_children FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Drop broad SELECT policies on storage.objects (files still accessible via public bucket URLs; only directory listing is blocked)
DROP POLICY IF EXISTS "News images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatar files can be viewed by direct path" ON storage.objects;

-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated (they are used internally by triggers/RLS as postgres)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
