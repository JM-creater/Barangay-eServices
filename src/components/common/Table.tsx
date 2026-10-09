import React from 'react';
import { TableSkeleton } from '../skeletons/TableSkeleton';

interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
  skeletonRowCount?: number;
  minWidth?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  isLoading = false,
  skeletonRowCount = 5,
  minWidth,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <TableSkeleton
        columns={columns.map((c) => ({
          header: c.header,
          width: c.width,
          className: c.className,
        }))}
        rowCount={skeletonRowCount}
        minWidth={minWidth}
      />
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((col, idx) => {
                  let cellContent: React.ReactNode = null;
                  if (typeof col.accessor === 'function') {
                    cellContent = col.accessor(item);
                  } else if (col.accessor) {
                    cellContent = (item[col.accessor] as unknown) as React.ReactNode;
                  }
                  return (
                    <td key={idx} className={col.className}>
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
