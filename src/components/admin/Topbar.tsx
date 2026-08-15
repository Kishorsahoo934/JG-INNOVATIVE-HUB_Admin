import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, User, Settings, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdminData } from '@/context/AdminDataContext';
import { cn } from '@/lib/utils';
import { ADMIN_LOGO } from '@/constants/media';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ 
  onToggleSidebar, 
  isSidebarCollapsed,
  isMobileSidebarOpen,
  onCloseMobileSidebar 
}) => {
  const { admin, logout } = useAdminAuth();
  const { state } = useAdminData();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = state.notifications.filter((n) => !n.read).length;
  const recentNotifications = state.notifications.slice(0, 5);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 min-h-[4rem] bg-card border-b border-border z-30 transition-all duration-300',
        'left-0 w-full max-w-[100vw] md:left-16',
        !isSidebarCollapsed && 'md:left-64'
      )}
    >
      <div className="h-full px-3 sm:px-4 flex items-center justify-between gap-2 min-w-0">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
            aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-black/10 flex items-center justify-center overflow-hidden shrink-0">
              <img src={ADMIN_LOGO} alt="" className="max-h-full max-w-full object-contain" width={455} height={538} />
            </div>
            <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
              Innovative Hub Admin Panel
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-elevated animate-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadNotifications} unread</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                      No notifications
                    </div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer',
                          !notification.read && 'bg-primary/5'
                        )}
                      >
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-muted/50 transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {admin?.name || 'Admin'}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform hidden sm:block',
                  isProfileOpen && 'rotate-180'
                )}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-elevated animate-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{admin?.name}</p>
                  <p className="text-xs text-muted-foreground">{admin?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
