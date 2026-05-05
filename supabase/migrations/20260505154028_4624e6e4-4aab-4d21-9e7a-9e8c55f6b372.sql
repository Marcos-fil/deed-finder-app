
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);

CREATE POLICY "News images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

CREATE POLICY "Admins can upload news images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));
