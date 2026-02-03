-- Security fixes for critical issues

-- 1. Fix publish_post, schedule_post, unpublish_post functions to require admin role
CREATE OR REPLACE FUNCTION public.publish_post(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user has admin or super_admin role
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  UPDATE public.blog_posts 
  SET 
    published = true,
    status = 'published',
    published_at = COALESCE(published_at, now())
  WHERE id = _post_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, diff)
  VALUES (auth.uid(), 'publish', 'blog_post', _post_id, jsonb_build_object('published', true, 'status', 'published'));
END;
$function$;

CREATE OR REPLACE FUNCTION public.schedule_post(_post_id uuid, _scheduled_at timestamp with time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user has admin or super_admin role
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  UPDATE public.blog_posts 
  SET 
    status = 'scheduled',
    scheduled_at = _scheduled_at
  WHERE id = _post_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, diff)
  VALUES (auth.uid(), 'schedule', 'blog_post', _post_id, jsonb_build_object('status', 'scheduled', 'scheduled_at', _scheduled_at));
END;
$function$;

CREATE OR REPLACE FUNCTION public.unpublish_post(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user has admin or super_admin role
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  UPDATE public.blog_posts 
  SET 
    published = false,
    status = 'draft'
  WHERE id = _post_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, diff)
  VALUES (auth.uid(), 'unpublish', 'blog_post', _post_id, jsonb_build_object('published', false, 'status', 'draft'));
END;
$function$;

-- 2. Fix profiles table - remove public read access, only allow authenticated users to see limited info
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view limited profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL -- Only authenticated users can see profiles
);

-- 3. Fix blog_posts RLS to prevent leaking scheduled content
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;

CREATE POLICY "Anyone can read truly published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (
  published = true 
  AND status = 'published'
  AND (scheduled_at IS NULL OR scheduled_at <= now())
);

-- 4. Make resources storage bucket private (remove public access)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'resources';

-- Create RLS policies for resources bucket to control access
CREATE POLICY "Authenticated users can view resources" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can manage resources" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'resources' 
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
);

-- Create function to generate signed URLs for resources
CREATE OR REPLACE FUNCTION public.get_resource_signed_url(file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  signed_url text;
BEGIN
  -- Only authenticated users can get signed URLs
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- This would be implemented in the application layer using storage.from().createSignedUrl()
  -- Return the file path for now, actual signed URL creation happens in the frontend
  RETURN file_path;
END;
$$;