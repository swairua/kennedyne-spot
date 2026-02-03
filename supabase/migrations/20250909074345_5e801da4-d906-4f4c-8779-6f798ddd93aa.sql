-- Create resources storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Create policies for resource uploads
CREATE POLICY "Admins can upload resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update resource files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete resource files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view public resources" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resources');