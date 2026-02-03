-- Update grant_role_by_email to handle non-existent users
CREATE OR REPLACE FUNCTION public.grant_role_by_email(_email text, _role app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  
  -- Check if user exists and get their ID
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = _email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;
  
  -- Check if user already has this role
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = _role) THEN
    RAISE EXCEPTION 'role_already_exists';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, _role);
END;
$function$;

-- Update revoke_role_by_email to prevent dangerous operations
CREATE OR REPLACE FUNCTION public.revoke_role_by_email(_email text, _role app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
  super_admin_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  
  -- Get the target user ID
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = _email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;
  
  -- Prevent self-demotion from super_admin
  IF target_user_id = auth.uid() AND _role = 'super_admin' THEN
    RAISE EXCEPTION 'cannot_demote_self';
  END IF;
  
  -- If removing super_admin role, ensure it's not the last one
  IF _role = 'super_admin' THEN
    SELECT COUNT(*) INTO super_admin_count
    FROM public.user_roles
    WHERE role = 'super_admin';
    
    IF super_admin_count <= 1 THEN
      RAISE EXCEPTION 'cannot_remove_last_super_admin';
    END IF;
  END IF;
  
  -- Check if user has this role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = _role) THEN
    RAISE EXCEPTION 'role_not_found';
  END IF;
  
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = _role;
END;
$function$;

-- Create function to list auth users for the combobox
CREATE OR REPLACE FUNCTION public.list_auth_users()
 RETURNS TABLE(id uuid, email text, display_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT u.id, u.email, p.display_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE public.has_role(auth.uid(), 'super_admin')
  ORDER BY u.email
$function$;