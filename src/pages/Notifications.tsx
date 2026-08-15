import React, { useState, useMemo } from 'react';
import { Bell, Check, CheckCheck, ShoppingCart, User, Star, Settings, Trash2 } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { Notification } from '@/services/adminApi';
import { NotificationType } from '@/utils/constants';
import { cn } from '@/lib/utils';

const notificationIcons: Record<NotificationType, React.ElementType> = {
  order: ShoppingCart,
  user: User,
  review: Star,
  system: Settings,
};

const notificationColors: Record<NotificationType, string> = {
  order: 'bg-primary/10 text-primary',
  user: 'bg-info/10 text-info',
  review: 'bg-warning/10 text-warning',
  system: 'bg-muted text-muted-foreground',
};

const Notifications: React.FC = () => {
  const { state, markNotificationRead, markAllNotificationsRead, deleteNotification } = useAdminData();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifications = useMemo(() => {
    return state.notifications.filter((notification) => {
      if (filterType === 'all') return true;
      if (filterType === 'unread') return !notification.read;
      return notification.type === filterType;
    });
  }, [state.notifications, filterType]);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsRead();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Notifications</h1>
          <p className="page-description">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-36"
          >
            <option value="all">All</option>
            <option value="unread">Unread ({unreadCount})</option>
            <option value="order">Orders</option>
            <option value="user">Users</option>
            <option value="review">Reviews</option>
            <option value="system">System</option>
          </select>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary flex items-center gap-2">
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{state.notifications.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Unread</p>
          <p className="text-2xl font-bold text-primary">{unreadCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Orders</p>
          <p className="text-2xl font-bold text-info">
            {state.notifications.filter(n => n.type === 'order').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Users</p>
          <p className="text-2xl font-bold text-success">
            {state.notifications.filter(n => n.type === 'user').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">System</p>
          <p className="text-2xl font-bold text-warning">
            {state.notifications.filter(n => n.type === 'system').length}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card-elevated divide-y divide-border">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type as NotificationType] || Bell;
            const iconColor = notificationColors[notification.type as NotificationType] || 'bg-muted text-muted-foreground';

            return (
              <div
                key={notification.id}
                className={cn(
                  'p-4 flex items-start gap-4 transition-colors',
                  !notification.read && 'bg-primary/5'
                )}
              >
                {/* Icon */}
                <div className={cn('p-2.5 rounded-xl flex-shrink-0', iconColor)}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
