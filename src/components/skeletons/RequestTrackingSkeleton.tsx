import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

export const RequestTrackingSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }} aria-busy="true" aria-label="Searching application record">
      <Card>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid #DDE3EA',
            paddingBottom: '1.25rem',
          }}
        >
          <div>
            <Skeleton variant="text" width={110} height="0.8rem" style={{ marginBottom: '0.4rem' }} />
            <Skeleton variant="text" width={220} height="1.5rem" style={{ marginBottom: '0.35rem' }} />
            <Skeleton variant="text" width={160} height="0.95rem" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <Skeleton variant="rounded" width={95} height={26} />
            <Skeleton variant="text" width={140} height="0.8rem" />
          </div>
        </div>

        {/* Stepper Skeleton */}
        <div style={{ padding: '2rem 0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="60%" height="0.85rem" />
                <Skeleton variant="text" width="40%" height="0.75rem" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            borderTop: '1px solid #DDE3EA',
            paddingTop: '1.25rem',
            marginTop: '0.5rem',
          }}
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx}>
              <Skeleton variant="text" width="50%" height="0.8rem" style={{ marginBottom: '0.4rem' }} />
              <Skeleton variant="text" width="80%" height="1.1rem" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
