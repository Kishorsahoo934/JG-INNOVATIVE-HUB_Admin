import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  isLoading = false,
  className,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('card-elevated overflow-hidden', className)}>
        <div className="p-8 text-center">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('card-elevated overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="table-header border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left px-3 sm:px-4 py-3 font-semibold text-sm',
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'table-row',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={`${keyExtractor(item)}-${column.key}`}
                      className={cn('px-3 sm:px-4 py-3 text-sm', column.className)}
                    >
                      {column.render
                        ? column.render(item, index)
                        : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
