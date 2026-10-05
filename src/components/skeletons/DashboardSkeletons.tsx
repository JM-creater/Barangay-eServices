import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card } from '../common/Card';
import { StatCardSkeleton } from './StatCardSkeleton';
import { TableSkeleton } from './TableSkeleton';

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} aria-busy="true" aria-label="Loading admin dashboard">
      {/* Header and Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Skeleton variant="text" width={280} height="2rem" style={{ marginBottom: '0.4rem' }} />
          <Skeleton variant="text" width={380} height="0.95rem" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={130} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="rounded" width={125} height={32} />
          <Skeleton variant="rounded" width={115} height={32} />
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid-2">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE3EA' }}>
            <Skeleton variant="text" width={180} height="1.25rem" />
            <Skeleton variant="rounded" width={80} height={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <Skeleton variant="text" width="60%" height="0.9rem" style={{ marginBottom: '0.35rem' }} />
                  <Skeleton variant="rounded" width="100%" height={8} />
                </div>
                <Skeleton variant="text" width={70} height="1rem" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE3EA' }}>
            <Skeleton variant="text" width={190} height="1.25rem" />
            <Skeleton variant="rounded" width={80} height={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Skeleton variant="circular" width={12} height={12} />
                  <Skeleton variant="text" width={120} height="0.9rem" />
                </div>
                <Skeleton variant="rounded" width={50} height={22} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower Summary Card */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE3EA' }}>
          <Skeleton variant="text" width={220} height="1.25rem" />
          <Skeleton variant="rounded" width={100} height={28} />
        </div>
        <div className="grid-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} style={{ padding: '1rem', backgroundColor: '#F5F7FA', borderRadius: '8px', border: '1px solid #DDE3EA' }}>
              <Skeleton variant="text" width="50%" height="0.8rem" style={{ marginBottom: '0.5rem' }} />
              <Skeleton variant="text" width="35%" height="1.5rem" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const StaffDashboardSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} aria-busy="true" aria-label="Loading staff operations dashboard">
      {/* Header */}
      <div>
        <Skeleton variant="text" width={270} height="2rem" style={{ marginBottom: '0.4rem' }} />
        <Skeleton variant="text" width={420} height="0.95rem" />
      </div>

      {/* Workload Highlights */}
      <div className="grid-4">
        <StatCardSkeleton hasBorderAccent hasLink />
        <StatCardSkeleton hasBorderAccent hasLink />
        <StatCardSkeleton hasBorderAccent hasLink />
        <StatCardSkeleton hasBorderAccent hasLink />
      </div>

      {/* Main Queue Card with Table Skeleton */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #DDE3EA' }}>
          <div>
            <Skeleton variant="text" width={180} height="1.25rem" style={{ marginBottom: '0.3rem' }} />
            <Skeleton variant="text" width={240} height="0.85rem" />
          </div>
          <Skeleton variant="rounded" width={80} height={32} />
        </div>
        <TableSkeleton
          columns={[
            { header: 'Reference' },
            { header: 'Resident' },
            { header: 'Service' },
            { header: 'Submitted' },
            { header: 'Status' },
            { header: 'Actions' },
          ]}
          rowCount={5}
        />
      </Card>
    </div>
  );
};
