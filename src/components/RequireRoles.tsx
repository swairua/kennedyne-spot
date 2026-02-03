import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type AppRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

interface RequireRolesProps {
  children: ReactNode;
  roles: AppRole[];
  fallback?: ReactNode;
}

export function RequireRoles({ children, roles, fallback }: RequireRolesProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAnyRole, loading: rolesLoading } = useUserRoles();
  const location = useLocation();

  // Show loading while checking auth and roles
  if (authLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login with return path
  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Authenticated but doesn't have required role
  if (!hasAnyRole(roles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have permission to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}