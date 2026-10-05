import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

export const VerificationResultSkeleton: React.FC = () => {
  return (
    <Card style={{ border: '2px solid #DDE3EA', backgroundColor: '#ffffff', overflow: 'hidden' }} aria-busy="true" aria-label="Querying verification records">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid #DDE3EA' }}>
        <Skeleton variant="circular" width={56} height={56} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="rounded" width={110} height={20} style={{ marginBottom: '6px' }} />
          <Skeleton variant="text" width={220} height="1.35rem" style={{ marginBottom: '4px' }} />
          <Skeleton variant="text" width={280} height="0.85rem" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx}>
            <Skeleton variant="text" width="55%" height="0.75rem" style={{ marginBottom: '0.4rem' }} />
            <Skeleton variant="text" width="85%" height="1.1rem" />
          </div>
        ))}
      </div>
    </Card>
  );
};
