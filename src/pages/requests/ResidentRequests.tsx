import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { requestService } from '../../services/requestService';
import { DocumentRequest } from '../../types/Request';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { Plus, Eye, Calendar, FileText, Zap, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import { triggerBarangayAi } from '../../components/ai/BarangayAiAssistant';

export const ResidentRequests: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async (p = 0) => {
    setLoading(true);
    try {
      const res = await requestService.getMyRequests(p, 10);
      setRequests(res.content);
      setTotalPages(res.totalPages);
      setPage(res.pageNumber);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(0);
  }, []);

  const columns = [
    {
      header: 'Reference No.',
      accessor: (r: DocumentRequest) => (
        <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{r.referenceNumber}</span>
      ),
    },
    {
      header: 'Service',
      accessor: (r: DocumentRequest) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.service?.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Purpose: {r.purpose}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (r: DocumentRequest) => <Badge status={r.currentStatus} />,
    },
    {
      header: 'AI Assessment',
      accessor: (r: DocumentRequest) => {
        if (r.currentStatus === 'NEEDS_CORRECTION') {
          return (
            <span className="ai-badge-correction" title="AI Flagged: Missing or defective documents">
              <AlertTriangle size={12} /> Needs Correction
            </span>
          );
        }
        if (r.currentStatus === 'SUBMITTED' || r.currentStatus === 'UNDER_REVIEW') {
          return (
            <span className="ai-badge-fasttrack" title="Estimated turnaround: ~24 hours">
              <Zap size={12} /> Fast-Track (~24h)
            </span>
          );
        }
        return (
          <span className="ai-badge-standard" title="Standard review procedure">
            <ShieldCheck size={12} /> Standard
          </span>
        );
      },
    },
    {
      header: 'Appointment',
      accessor: (r: DocumentRequest) =>
        r.appointment ? (
          <span style={{ fontSize: '0.85rem' }}>
            {formatDate(r.appointment.appointmentDate)} ({r.appointment.status})
          </span>
        ) : (
          '—'
        ),
    },
    {
      header: 'Date Submitted',
      accessor: (r: DocumentRequest) => (
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (r: DocumentRequest) => (
        <Link to={`/requests/${r.id}`}>
          <Button variant="outline" size="sm">
            <Eye size={14} /> View Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>My Submitted Requests</h1>
          <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>
            Track and manage your barangay clearances and certifications
          </p>
        </div>
        <Link to="/services">
          <Button variant="primary">
            <Plus size={16} /> New Application
          </Button>
        </Link>
      </div>

      {/* AI Assistance Callout */}
      <div className="ai-banner-callout" style={{ marginBottom: '1.5rem' }}>
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
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F2A4A' }}>
              Have questions about document requirements or pickup preparation?
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
              Our AI Assistant is available to help check payment amounts, physical requirements to bring, and schedule questions.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="primary"
          style={{ backgroundColor: '#1E4E8C' }}
          onClick={() =>
            triggerBarangayAi(
              "What documents do I need to bring when claiming my barangay clearance?",
              { page: 'my-requests' }
            )
          }
        >
          Ask Barangay AI
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={requests}
          keyExtractor={(r) => r.id}
          isLoading={loading}
          emptyMessage="You haven't submitted any applications yet."
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
    </Layout>
  );
};
