import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import Loader from '@/components/admin/Loader';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleToggleSidebar = () => {
    // On mobile, toggle the mobile sidebar
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      // On desktop, collapse/expand the sidebar
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background w-full max-w-[100vw] overflow-x-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />
      <Topbar 
        onToggleSidebar={handleToggleSidebar} 
        isSidebarCollapsed={isSidebarCollapsed}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={handleCloseMobileSidebar}
      />
      
      <main
        className={cn(
          'pt-16 min-h-screen w-full min-w-0 transition-all duration-300',
          // No left padding on mobile (drawer overlay)
          'pl-0',
          // Left padding on desktop based on sidebar state
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        )}
      >
        <div className="p-3 sm:p-4 md:p-6 max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
