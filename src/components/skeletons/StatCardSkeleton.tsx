import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

interface StatCardSkeletonProps {
  hasBorderAccent?: boolean;
  hasLink?: boolean;
  style?: React.CSSProperties;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({
  hasBorderAccent = false,
  hasLink = false,
  style,
}) => {
  return (
    <Card
      style={{
        ...(hasBorderAccent ? { borderLeft: '4px solid #DDE3EA' } : {}),
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <Skeleton variant="rounded" width={44} height={44} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <Skeleton variant="text" width="55%" height="0.75rem" />
          <Skeleton variant="text" width="40%" height="1.65rem" />
        </div>
      </div>
      {hasLink && (
        <div style={{ marginTop: '0.65rem' }}>
          <Skeleton variant="text" width="35%" height="0.8rem" />
        </div>
      )}
    </Card>
  );
};
