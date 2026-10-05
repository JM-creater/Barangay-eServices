import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';

export const ServiceCardSkeleton: React.FC = () => {
  return (
    <Card style={{ borderLeft: '5px solid #DDE3EA' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Skeleton variant="rounded" width={55} height={22} />
            <Skeleton variant="text" width="45%" height="1.4rem" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
            <Skeleton variant="text" width="95%" height="0.95rem" />
            <Skeleton variant="text" width="75%" height="0.95rem" />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              backgroundColor: '#F5F7FA',
              padding: '0.85rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              border: '1px solid #DDE3EA',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Skeleton variant="rounded" width={24} height={24} />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="50%" height="0.75rem" />
                <Skeleton variant="text" width="70%" height="1rem" style={{ marginTop: '3px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Skeleton variant="rounded" width={24} height={24} />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="50%" height="0.75rem" />
                <Skeleton variant="text" width="70%" height="1rem" style={{ marginTop: '3px' }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <Skeleton variant="text" width="30%" height="0.85rem" style={{ marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Skeleton variant="text" width="60%" height="0.85rem" />
              <Skeleton variant="text" width="75%" height="0.85rem" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '160px' }}>
          <Skeleton variant="rounded" width={110} height={36} />
          <Skeleton variant="rounded" width={140} height={42} />
        </div>
      </div>
    </Card>
  );
};

export const ServicesCatalogSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} aria-busy="true" aria-label="Loading services catalog">
      {Array.from({ length: count }).map((_, idx) => (
        <ServiceCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const HomePageServicesSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid-3" aria-busy="true" aria-label="Loading featured services">
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
            <Skeleton variant="rounded" width={60} height={22} />
            <Skeleton variant="text" width="75%" height="1.3rem" />
            <Skeleton variant="text" width="95%" height="0.9rem" />
            <Skeleton variant="text" width="85%" height="0.9rem" />
            <div
              style={{
                backgroundColor: '#F5F7FA',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #DDE3EA',
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Skeleton variant="text" width="40%" height="1rem" />
              <Skeleton variant="text" width="35%" height="1rem" />
            </div>
            <Skeleton variant="rounded" width="100%" height={38} style={{ marginTop: '0.5rem' }} />
          </div>
        </Card>
      ))}
    </div>
  );
};
