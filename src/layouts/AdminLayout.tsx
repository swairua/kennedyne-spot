import { Outlet, useLocation, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { ArrowLeft, Home } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();
  const isOnDashboard = location.pathname === '/admin';

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    if (path === '/admin') return [{ label: 'Dashboard', href: '/admin' }];
    if (path === '/admin/library') return [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Library Manager', href: '/admin/library' }
    ];
    if (path === '/admin/import') return [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Import Data', href: '/admin/import' }
    ];
    return [{ label: 'Dashboard', href: '/admin' }];
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/admin">Admin</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbItems.length > 1 && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{breadcrumbItems[breadcrumbItems.length - 1].label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
              {!isOnDashboard && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              )}
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Exit Admin
                </Link>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}