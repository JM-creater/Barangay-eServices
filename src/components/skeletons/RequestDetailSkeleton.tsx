import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

export const RequestDetailSkeleton: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} aria-busy="true" aria-label="Loading application details">
      {/* Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <Skeleton variant="text" width={160} height="0.875rem" />
          <Skeleton variant="text" width={260} height="1.75rem" style={{ marginTop: '0.4rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Skeleton variant="rounded" width={100} height={34} />
          <Skeleton variant="rounded" width={110} height={34} />
        </div>
      </div>

      {/* Main Overview Card */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid #DDE3EA',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <Skeleton variant="text" width={120} height="0.75rem" style={{ marginBottom: '0.4rem' }} />
            <Skeleton variant="text" width={220} height="1.4rem" style={{ marginBottom: '0.4rem' }} />
            <Skeleton variant="text" width={100} height="0.85rem" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <Skeleton variant="rounded" width={90} height={24} />
            <Skeleton variant="text" width={140} height="0.8rem" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx}>
              <Skeleton variant="text" width="40%" height="0.8rem" style={{ marginBottom: '0.35rem' }} />
              <Skeleton variant="text" width="75%" height="1rem" />
            </div>
          ))}
        </div>
      </Card>

      {/* Stepper Card */}
      <Card>
        <Skeleton variant="text" width={160} height="1.1rem" style={{ marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', overflowX: 'auto', padding: '1rem 0' }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '90px' }}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="text" width="70%" height="0.8rem" />
            </div>
          ))}
        </div>
      </Card>

      {/* Documents Card */}
      <Card>
        <Skeleton variant="text" width={200} height="1.1rem" style={{ marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem',
                border: '1px solid #DDE3EA',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Skeleton variant="rounded" width={32} height={32} />
                <div>
                  <Skeleton variant="text" width={140} height="0.9rem" style={{ marginBottom: '0.25rem' }} />
                  <Skeleton variant="text" width={80} height="0.75rem" />
                </div>
              </div>
              <Skeleton variant="rounded" width={80} height={28} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const ApplyServiceSkeleton: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} aria-busy="true" aria-label="Loading service application">
      {/* Header Banner */}
      <div style={{ marginBottom: '0.5rem' }}>
        <Skeleton variant="text" width={140} height="0.85rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton variant="text" width={320} height="1.85rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton variant="text" width="60%" height="0.95rem" />
      </div>

      {/* Stepper Skeleton */}
      <div className="apply-stepper-container">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="text" width={80} height="0.85rem" />
          </div>
        ))}
      </div>

      {/* Form Content Card */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <Skeleton variant="text" width={180} height="1.15rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton variant="text" width="85%" height="0.9rem" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton variant="text" width={120} height="0.85rem" />
            <Skeleton variant="rounded" width="100%" height={42} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton variant="text" width={150} height="0.85rem" />
            <Skeleton variant="rounded" width="100%" height={90} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Skeleton variant="rounded" width={90} height={38} />
            <Skeleton variant="rounded" width={140} height={38} />
          </div>
        </div>
      </Card>
    </div>
  );
};
