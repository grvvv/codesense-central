import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/atomic/card';
import { Button } from '@/components/atomic/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DotsLoader } from '../atomic/loader';

// Generic table column definition
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Pagination configuration
export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  showInfo?: boolean;
  showPageNumbers?: boolean;
}

// Table props interface
export interface GenericTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  loading?: boolean;
  error?: string | null;
  pagination?: PaginationConfig;
  totalItems?: number; // For server-side pagination
  currentPage?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T, index: number) => void;
}

export function GenericTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  loading = false,
  error = null,
  pagination = { enabled: false, pageSize: 10, showInfo: true, showPageNumbers: true },
  totalItems,
  currentPage: controlledCurrentPage,
  onPageChange,
  emptyMessage = "No data available",
  className = "",
  tableClassName = "",
  headerClassName = "bg-secondary",
  rowClassName = "hover:bg-gray-50",
  onRowClick,
}: GenericTableProps<T>) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  
  // Use controlled or internal pagination
  const currentPage = controlledCurrentPage || internalCurrentPage;
  const isServerSidePagination = totalItems !== undefined && onPageChange !== undefined;
  
  // Calculate pagination values
  const total = isServerSidePagination ? totalItems : data.length;
  const totalPages = Math.ceil(total / pagination.pageSize);
  
  // Get current page data (for client-side pagination)
  const getCurrentPageData = () => {
    if (!pagination.enabled || isServerSidePagination) {
      return data;
    }
    const startIndex = (currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  };
  
  const currentData = getCurrentPageData();
  
  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (onPageChange) {
        onPageChange(page);
      } else {
        setInternalCurrentPage(page);
      }
    }
  };
  
  // Calculate display indices
  const getDisplayIndices = () => {
    if (isServerSidePagination) {
      const start = (currentPage - 1) * pagination.pageSize;
      return {
        start: start + 1,
        end: Math.min(start + pagination.pageSize, total),
      };
    } else {
      const start = pagination.enabled ? (currentPage - 1) * pagination.pageSize : 0;
      const end = pagination.enabled 
        ? Math.min(start + pagination.pageSize, total)
        : total;
      return { start: start + 1, end };
    }
  };
  
  const { start, end } = getDisplayIndices();
  
  // Render cell content
  const renderCell = (item: T, column: TableColumn<T>, index: number) => {
    if (column.render) {
      return column.render(item, index);
    }
    
    // Handle nested keys (e.g., 'user.name')
    const keys = column.key.toString().split('.');
    let value = item;
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value?.toString() || '';
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && (
            <h2 className="text-3xl font-bold">
              {title}
            </h2>
          )}
        </CardHeader>
        <CardContent>
          <DotsLoader />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && (
            <h2 className="text-3xl font-bold">
              {title}
            </h2>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-primary-950 dark:text-primary-300">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        {title && (
          <h2 className="text-3xl font-bold">
            {title}
          </h2>
        )}
      </CardHeader>
        
      <CardContent>
        <div className="shadow-md overflow-hidden">
          <table className={`w-full text-left border rounded-lg ${tableClassName}`}>
            <thead className={headerClassName}>
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className="px-4 py-3 border-b"
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => {
                  const actualIndex = pagination.enabled && !isServerSidePagination 
                    ? (currentPage - 1) * pagination.pageSize + index 
                    : index;
                    
                  const rowClass = typeof rowClassName === 'function' 
                    ? rowClassName(item, actualIndex) 
                    : rowClassName;
                    
                  return (
                    <tr 
                      key={item.id || item._id || index}
                      className={`${rowClass} ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onRowClick?.(item, actualIndex)}
                    >
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-4 py-3 border-b">
                          {renderCell(item, column, actualIndex)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.enabled && totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
            {pagination.showInfo && (
              <p className="text-sm text-gray-600 dark:text-[#e5e5e5]">
                Showing {start} to {end} of {total} entries
              </p>
            )}

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors
                text-[#2d2d2d] dark:text-[#e5e5e5] bg-white dark:bg-[#2d2d2d] border-[#e5e5e5] dark:border-[#444]
                hover:bg-[#f8f9fa] dark:hover:bg-[#3a3a3a]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {pagination.showPageNumbers && (
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-red-700 text-white border-[#bf0000]'
                          : 'bg-white text-[#2d2d2d] dark:bg-[#3b3b3b] dark:text-[#e5e5e5] border-[#e5e5e5] dark:border-[#444] hover:bg-[#f8f9fa] dark:hover:bg-[#494949]'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
              )}

              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1
                bg-[#bf0000] text-white border-[#bf0000] hover:bg-[#a00000]">
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent> 
        
    </Card>
  );
}