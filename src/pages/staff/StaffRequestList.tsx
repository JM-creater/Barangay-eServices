import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { requestService } from '../../services/requestService';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { DocumentRequest } from '../../types/Request';
import { ServiceItem } from '../../types/Service';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatDateTime, formatDate, formatTime } from '../../utils/formatters';
import { Search, Eye, Filter, RefreshCw, Zap, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

export const StaffRequestList: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || '';
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [serviceFilter, setServiceFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async (p = 0) => {
    setLoading(true);
    try {
      const res = await requestService.getAllRequests(
        statusFilter || undefined,
        serviceFilter,
        search.trim() || undefined,
        p,
        15
      );
      setRequests(res.content);
      setTotalPages(res.totalPages);
      setPage(res.pageNumber);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    serviceCatalogService.getActiveServices().then(setServices).catch(() => {});
  }, []);

  useEffect(() => {
    fetchRequests(0);
  }, [statusFilter, serviceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests(0);
  };

  const columns = [
    {
      header: 'Reference No.',
      width: '140px',
      accessor: (r: DocumentRequest) => (
        <span style={{ fontWeight: 700, color: '#1E4E8C', whiteSpace: 'nowrap' }}>{r.referenceNumber}</span>
      ),
    },
    {
      header: 'Resident / Applicant',
      width: '170px',
      accessor: (r: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.resident.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.resident.contactNumber}</div>
        </div>
      ),
    },
    {
      header: 'Service',
      width: '180px',
      accessor: (r: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.service.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Purpose: {r.purpose}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      width: '160px',
      accessor: (r: DocumentRequest) => <Badge status={r.currentStatus} />,
    },
    {
      header: 'AI Assessment',
      width: '160px',
      accessor: (r: DocumentRequest) => {
        const isNeedsCorrection = r.currentStatus === 'NEEDS_CORRECTION';
        const hasFiles = r.files && r.files.length > 0;
        const isPending = r.currentStatus === 'SUBMITTED' || r.currentStatus === 'UNDER_REVIEW';

        if (isNeedsCorrection) {
          return (
            <span className="ai-badge-correction" title="AI Flagged: Defective or missing mandatory requirements">
              <AlertTriangle size={12} /> Needs Correction
            </span>
          );
        }

        if (isPending && hasFiles) {
          return (
            <span className="ai-badge-fasttrack" title="AI Fast-Track Candidate: Documents uploaded, verified in-memory">
              <Zap size={12} /> Fast-Track (~24h)
            </span>
          );
        }

        if (r.currentStatus === 'READY_FOR_RELEASE' || r.currentStatus === 'RELEASED') {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#DCFCE7',
                color: '#166534',
                border: '1px solid #BBF7D0',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircle2 size={12} /> Verified
            </span>
          );
        }

        return (
          <span className="ai-badge-standard" title="AI Assessment: Standard processing queue">
            <ShieldCheck size={12} /> Standard (~48h)
          </span>
        );
      },
    },
    {
      header: 'Appointment Slot',
      width: '180px',
      accessor: (r: DocumentRequest) =>
        r.appointment ? (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {formatDate(r.appointment.appointmentDate)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              {formatTime(r.appointment.appointmentTime)} ({r.appointment.status})
            </div>
          </div>
        ) : (
          '—'
        ),
    },
    {
      header: 'Submitted',
      width: '160px',
      accessor: (r: DocumentRequest) => (
        <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
    {
      header: 'Action',
      width: '100px',
      accessor: (r: DocumentRequest) => (
        <Link to={`/staff/requests/${r.id}`}>
          <Button variant="primary" size="sm">
            <Eye size={14} /> Review
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Application Queue</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Review, verify requirements, confirm appointments, and process document releases
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchRequests(page)}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>

        {/* AI In-Memory Triage Banner */}
        <div className="ai-banner-callout">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#1E4E8C',
                color: '#F2B600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F2A4A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>In-Memory AI Triage & Assessment Active</span>
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                  ONNX &lt;1ms
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
                Applications are continuously analyzed for document completeness, turnaround priority, and correction risks.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('SUBMITTED')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: statusFilter === 'SUBMITTED' ? '#166534' : '#DCFCE7',
                color: statusFilter === 'SUBMITTED' ? '#FFFFFF' : '#166534',
                border: '1px solid #BBF7D0',
                cursor: 'pointer',
              }}
            >
              <Zap size={12} /> Fast-Track Candidates
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('NEEDS_CORRECTION')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: statusFilter === 'NEEDS_CORRECTION' ? '#92400E' : '#FEF3C7',
                color: statusFilter === 'NEEDS_CORRECTION' ? '#FFFFFF' : '#92400E',
                border: '1px solid #FDE68A',
                cursor: 'pointer',
              }}
            >
              <AlertTriangle size={12} /> Needs Correction
            </button>
            {statusFilter && (
              <button
                type="button"
                onClick={() => setStatusFilter('')}
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <Card>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search reference # or resident name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="primary">
                <Search size={16} />
              </Button>
            </form>

            <div style={{ minWidth: '180px' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="NEEDS_CORRECTION">Needs Correction</option>
                <option value="ACCEPTED">Accepted (Confirmed)</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY_FOR_RELEASE">Ready for Release</option>
                <option value="RELEASED">Released</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div style={{ minWidth: '200px' }}>
              <select
                value={serviceFilter || ''}
                onChange={(e) => setServiceFilter(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Requests Table */}
        <Card>
          <Table
            columns={columns}
            data={requests}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyMessage="No applications match the selected filters."
            minWidth="1100px"
          />

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => fetchRequests(page - 1)}
              >
                Previous
              </Button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => fetchRequests(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
