import { NavLink, useLocation } from 'react-router-dom';
import { useUserRoles, UserRole } from '@/hooks/useUserRoles';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Settings, Database, Shield, FileText, HelpCircle, Users, Globe, LayoutDashboard, Languages } from 'lucide-react';

const adminItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Settings,
    roles: ['admin', 'super_admin'] as UserRole[],
  },
  {
    title: 'Blog Manager',
    url: '/admin/blog',
    icon: FileText,
    roles: ['admin', 'super_admin'] as UserRole[],
  },
  {
    title: 'Leads',
    url: '/admin/leads',
    icon: Users,
    roles: ['admin', 'super_admin'] as UserRole[],
  },
  {
    title: 'FAQs Manager',
    url: '/admin/faqs',
    icon: HelpCircle,
    roles: ['admin', 'super_admin'] as UserRole[],
  },
  {
    title: 'Users & Roles',
    url: '/admin/users-roles',
    icon: Users,
    roles: ['super_admin'] as UserRole[],
  },
  {
    title: 'Site Settings',
    url: '/admin/settings',
    icon: Globe,
    roles: ['admin', 'super_admin'] as UserRole[],
  },
  {
    title: 'Library Manager',
    url: '/admin/library',
    icon: Database,
    roles: ['admin', 'super_admin'] as UserRole[],
  },
  {
    title: 'Import Data',
    url: '/admin/import',
    icon: Shield,
    roles: ['super_admin'] as UserRole[],
  },
  {
    title: 'Bulk Translate',
    url: '/admin/translate',
    icon: Languages,
    roles: ['super_admin'] as UserRole[],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { hasAnyRole } = useUserRoles();
  
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(path);
  };
  
  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return active 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-muted/50';
  };

  const visibleItems = adminItems.filter(item => hasAnyRole(item.roles));

  return (
    <Sidebar className={state === 'collapsed' ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {state !== 'collapsed' && 'Admin Panel'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}