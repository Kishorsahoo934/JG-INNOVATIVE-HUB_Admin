import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  valueClassName?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
  onClick?: () => void;
  /** Short line under the value (e.g. offline portion of a combined total). */
  footnote?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  valueClassName,
  trend,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  className,
  onClick,
  footnote,
}) => {
  return (
    <div 
      className={cn('stat-card animate-fade-in', onClick && 'cursor-pointer hover:shadow-lg transition-shadow', className)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold text-foreground mt-1', valueClassName)}>
            {value}
          </p>
          {footnote ? (
            <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{footnote}</p>
          ) : null}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={cn('p-3 rounded-xl', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
