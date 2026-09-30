import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types/Report';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { History, Search, RefreshCw } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async (p = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs(undefined, actionFilter || undefined, p, 15);
      setLogs(res.content);
      setTotalPages(res.totalPages);
      setPage(res.pageNumber);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, [actionFilter]);

  const columns = [
    {
      header: 'Action',
      accessor: (l: AuditLog) => (
        <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{l.action}</span>
      ),
    },
    {
      header: 'User',
      accessor: (l: AuditLog) => (
        <div>
          <div style={{ fontWeight: 600 }}>{l.userFullName || 'System'}</div>
          {l.username && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{l.username}</div>}
        </div>
      ),
    },
    {
      header: 'Entity / Target',
      accessor: (l: AuditLog) => `${l.entityName || '—'} #${l.entityId || '—'}`,
    },
    {
      header: 'Details',
      accessor: (l: AuditLog) => (
        <span style={{ fontSize: '0.85rem', color: '#334155' }}>{l.details || '—'}</span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (l: AuditLog) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {formatDateTime(l.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>System Audit Trail</h1>
            <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>
              Immutable record of security events, status updates, releases, and personnel activity
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(page)}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={logs}
            keyExtractor={(l) => l.id}
            isLoading={loading}
            emptyMessage="No audit logs recorded yet."
          />

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => fetchLogs(page - 1)}>
                Previous
              </Button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                Page {page + 1} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => fetchLogs(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
