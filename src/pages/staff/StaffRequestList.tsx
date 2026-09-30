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
import { Search, Eye, Filter, RefreshCw } from 'lucide-react';

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
      accessor: (r: DocumentRequest) => (
        <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{r.referenceNumber}</span>
      ),
    },
    {
      header: 'Resident / Applicant',
      accessor: (r: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.resident.fullName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.resident.contactNumber}</div>
        </div>
      ),
    },
    {
      header: 'Service',
      accessor: (r: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.service.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Purpose: {r.purpose}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (r: DocumentRequest) => <Badge status={r.currentStatus} />,
    },
    {
      header: 'Appointment Slot',
      accessor: (r: DocumentRequest) =>
        r.appointment ? (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {formatDate(r.appointment.appointmentDate)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {formatTime(r.appointment.appointmentTime)} ({r.appointment.status})
            </div>
          </div>
        ) : (
          '—'
        ),
    },
    {
      header: 'Submitted',
      accessor: (r: DocumentRequest) => (
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
    {
      header: 'Action',
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
