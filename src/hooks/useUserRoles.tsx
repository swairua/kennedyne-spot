import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'super_admin' | 'admin' | 'editor' | 'viewer';
export type UserRole = AppRole; // For backward compatibility

interface UserRoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useUserRoles() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRoles() {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          setError(error.message);
        } else {
          setRoles(data?.map(item => item.role as AppRole) || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchUserRoles();
    }
  }, [user, authLoading]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (roleList: AppRole[]) => roleList.some(role => roles.includes(role));
  const isAdmin = hasAnyRole(['super_admin', 'admin']);
  const isSuperAdmin = hasRole('super_admin');

  return {
    roles,
    loading: loading || authLoading,
    error,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    refetch: () => {
      if (!authLoading && user) {
        setLoading(true);
        setError(null);
        // Trigger useEffect to refetch
      }
    }
  };
}