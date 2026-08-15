import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  className,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const buttonBase = 'p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const buttonDefault = 'hover:bg-muted text-muted-foreground hover:text-foreground';
  const buttonActive = 'bg-primary text-primary-foreground';

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={cn(buttonBase, buttonDefault)}
        aria-label="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(buttonBase, buttonDefault)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {showPageNumbers && (
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-muted-foreground">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    buttonBase,
                    'min-w-[36px]',
                    currentPage === page ? buttonActive : buttonDefault
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(buttonBase, buttonDefault)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={cn(buttonBase, buttonDefault)}
        aria-label="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
