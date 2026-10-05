import React from 'react';
import { Skeleton } from '../common/Skeleton';

interface TableSkeletonColumn {
  header?: string;
  width?: string;
  className?: string;
}

interface TableSkeletonProps {
  columns?: TableSkeletonColumn[] | number;
  rowCount?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns = 5,
  rowCount = 5,
  showHeader = true,
}) => {
  const columnList: TableSkeletonColumn[] = typeof columns === 'number'
    ? Array.from({ length: columns }).map((_, i) => ({
        header: `Column ${i + 1}`,
      }))
    : columns;

  return (
    <div className="table-container" aria-busy="true" aria-label="Loading table data">
      <table className="custom-table">
        {showHeader && (
          <thead>
            <tr>
              {columnList.map((col, idx) => (
                <th key={idx} style={{ width: col.width }} className={col.className}>
                  {col.header ? (
                    col.header
                  ) : (
                    <Skeleton variant="text" width="60%" height="0.85rem" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIdx) => (
            <tr key={`table-skeleton-row-${rowIdx}`}>
              {columnList.map((col, colIdx) => {
                // Vary width realistically across columns
                const widthPercent =
                  colIdx === 0
                    ? '65%'
                    : colIdx === columnList.length - 1
                    ? '45%'
                    : colIdx % 2 === 0
                    ? '85%'
                    : '60%';

                return (
                  <td key={`table-skeleton-cell-${rowIdx}-${colIdx}`} className={col.className}>
                    <Skeleton
                      variant="text"
                      height="1.2rem"
                      width={widthPercent}
                      style={{ margin: '0.2rem 0' }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
