import React from 'react';
import { Skeleton } from '../common/Skeleton';

interface SlotGridSkeletonProps {
  count?: number;
  minWidth?: string;
}

export const SlotGridSkeleton: React.FC<SlotGridSkeletonProps> = ({
  count = 6,
  minWidth = '140px',
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap: '0.65rem',
      }}
      aria-busy="true"
      aria-label="Checking available slots"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            border: '2px solid #DDE3EA',
            borderRadius: '8px',
            padding: '0.75rem',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            alignItems: 'center',
          }}
        >
          <Skeleton variant="text" width="70%" height="1.1rem" />
          <Skeleton variant="rounded" width="50%" height="0.8rem" />
        </div>
      ))}
    </div>
  );
};
