import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'info' | 'default';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
  default: 'bg-muted text-muted-foreground border-border',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// Helper function to get variant from status strings
export const getStatusVariant = (status: string): BadgeVariant => {
  const statusMap: Record<string, BadgeVariant> = {
    // Order status
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'destructive',
    // Payment status
    paid: 'success',
    unpaid: 'warning',
    failed: 'destructive',
    // User status
    active: 'success',
    blocked: 'destructive',
    // Review status
    approved: 'success',
    rejected: 'destructive',
    // Stock status
    in_stock: 'success',
    out_of_stock: 'destructive',
    // Generic
    success: 'success',
  };

  return statusMap[status.toLowerCase()] || 'default';
};

export default StatusBadge;
