import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

interface CardSkeletonProps {
  lines?: number;
  hasHeader?: boolean;
  style?: React.CSSProperties;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  lines = 4,
  hasHeader = true,
  style,
}) => {
  return (
    <Card style={style}>
      {hasHeader && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #DDE3EA',
          }}
        >
          <Skeleton variant="text" width="35%" height="1.3rem" />
          <Skeleton variant="rounded" width={80} height={28} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {Array.from({ length: lines }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="text"
            width={idx === lines - 1 ? '50%' : idx % 2 === 0 ? '90%' : '75%'}
            height="1rem"
          />
        ))}
      </div>
    </Card>
  );
};
