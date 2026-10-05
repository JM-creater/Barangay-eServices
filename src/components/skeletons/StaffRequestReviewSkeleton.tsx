import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

export const StaffRequestReviewSkeleton: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} aria-busy="true" aria-label="Loading application review">
      {/* Breadcrumb & Title */}
      <div>
        <Skeleton variant="text" width={180} height="0.875rem" style={{ marginBottom: '0.5rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Skeleton variant="text" width={240} height="1.75rem" style={{ marginBottom: '0.35rem' }} />
            <Skeleton variant="text" width={320} height="0.9rem" />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Skeleton variant="rounded" width={90} height={34} />
            <Skeleton variant="rounded" width={120} height={34} />
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <Card>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={140} height={36} />
          <Skeleton variant="rounded" width={130} height={36} />
          <Skeleton variant="rounded" width={110} height={36} />
          <Skeleton variant="rounded" width={160} height={36} />
        </div>
      </Card>

      {/* 2-Column Review Content */}
      <div className="grid-2">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE3EA' }}>
            <Skeleton variant="text" width={160} height="1.15rem" />
            <Skeleton variant="rounded" width={75} height={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx}>
                <Skeleton variant="text" width="45%" height="0.75rem" style={{ marginBottom: '0.35rem' }} />
                <Skeleton variant="text" width="80%" height="0.95rem" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE3EA' }}>
            <Skeleton variant="text" width={180} height="1.15rem" />
            <Skeleton variant="rounded" width={85} height={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} style={{ padding: '0.85rem', backgroundColor: '#F5F7FA', borderRadius: '8px', border: '1px solid #DDE3EA' }}>
                <Skeleton variant="text" width="60%" height="0.9rem" style={{ marginBottom: '0.35rem' }} />
                <Skeleton variant="text" width="90%" height="0.8rem" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export const DocumentPreviewSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-busy="true" aria-label="Rendering document template">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <div>
          <Skeleton variant="text" width={180} height="1rem" style={{ marginBottom: '0.35rem' }} />
          <Skeleton variant="text" width={260} height="0.8rem" />
        </div>
        <Skeleton variant="rounded" width={130} height={34} />
      </div>

      <div
        style={{
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          minHeight: '380px',
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <Skeleton variant="circular" width={64} height={64} />
        <Skeleton variant="text" width={280} height="1.25rem" />
        <Skeleton variant="text" width={220} height="0.95rem" />
        <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', margin: '1rem 0' }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton variant="text" width="100%" height="0.9rem" />
          <Skeleton variant="text" width="95%" height="0.9rem" />
          <Skeleton variant="text" width="90%" height="0.9rem" />
          <Skeleton variant="text" width="70%" height="0.9rem" />
        </div>
      </div>
    </div>
  );
};
