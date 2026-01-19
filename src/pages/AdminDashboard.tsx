import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings,
  Users,
  BookOpen,
  HelpCircle,
  PenTool,
  Database,
  Shield,
  GitBranch
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const { isSuperAdmin, roles } = useUserRoles();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const adminSections = [
    {
      title: 'Library Manager',
      description: 'Manage trading resources and educational content',
      icon: Database,
      href: '/admin/library',
      available: true
    },
    {
      title: 'FAQs Manager',
      description: 'Manage frequently asked questions',
      icon: HelpCircle,
      href: '/admin/faqs',
      available: true
    },
    {
      title: 'Blog Manager',
      description: 'Create and manage blog posts',
      icon: PenTool,
      href: '/admin/blog',
      available: true
    },
    {
      title: 'Site Settings',
      description: 'Configure global site settings',
      icon: Settings,
      href: '/admin/settings',
      available: true
    }
  ];

  const superAdminSections = [
    {
      title: 'Users & Roles',
      description: 'Manage user permissions and roles',
      icon: Users,
      href: '/admin/users-roles',
      available: true
    }
  ];

  // Fetch stats on component mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        setTotalUsers(count || 0);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
        setTotalUsers(0);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Calculate active modules
  const activeModules = adminSections.filter(s => s.available).length + 
    (isSuperAdmin ? superAdminSections.filter(s => s.available).length : 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your trading education platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card key={section.href} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {section.available ? (
                <Button asChild className="w-full">
                  <Link to={section.href}>
                    Open {section.title}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full">
                  Coming Soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {isSuperAdmin && superAdminSections.map((section) => (
          <Card key={section.href} className="relative border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {section.title}
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Super Admin
                </span>
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {section.available ? (
                <Button asChild className="w-full">
                  <Link to={section.href}>
                    Open {section.title}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full">
                  Coming Soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            {statsLoading ? (
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-primary">{activeModules}</div>
            )}
            <div className="text-sm text-muted-foreground">Active Modules</div>
          </div>
          <div className="text-center">
            {statsLoading ? (
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-primary">{totalUsers ?? '—'}</div>
            )}
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role.replace('_', ' ')}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Your Roles</div>
          </div>
        </div>
      </div>
    </div>
  );
}
