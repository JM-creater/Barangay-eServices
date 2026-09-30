import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { processingService } from '../../services/processingService';
import { DocumentRelease } from '../../types/Request';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { CheckCircle2, Receipt, RefreshCw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StaffReleaseList: React.FC = () => {
  const [releases, setReleases] = useState<DocumentRelease[]>([]);
  console.log("releases: ", releases)
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReleases = async (p = 0) => {
    setLoading(true);
    try {
      const res = await processingService.getAllReleases(p, 15);
      setReleases(res.content);
      setTotalPages(res.totalPages);
      setPage(res.pageNumber);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases(0);
  }, []);

  const columns = [
    {
      header: 'Doc Control #',
      accessor: (r: DocumentRelease) => (
        <div>
          <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{r.issuedDocumentNumber}</span>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rel Ref: {r.releaseReferenceNo}</div>
        </div>
      ),
    },
    {
      header: 'Service / Document',
      accessor: (r: DocumentRelease) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.serviceName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Req Ref: {r.referenceNumber}</div>
        </div>
      ),
    },
    {
      header: 'Recipient',
      accessor: 'recipientName' as keyof DocumentRelease,
    },
    {
      header: 'Payment & O.R.',
      accessor: (r: DocumentRelease) => (
        <div>
          <div style={{ fontWeight: 600 }}>{formatCurrency(r.paymentAmount)}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            O.R. No: {r.officialReceiptNumber || 'N/A'} ({r.paymentStatus})
          </div>
        </div>
      ),
    },
    {
      header: 'Officers',
      accessor: (r: DocumentRelease) => (
        <div>
          <div style={{ fontSize: '0.8rem' }}>Released by: <strong>{r.releasingOfficerName}</strong></div>
          {r.officialApproverName && (
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Signed by: {r.officialApproverName}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Release Timestamp',
      accessor: (r: DocumentRelease) => (
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {formatDateTime(r.releaseDate)}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (r: DocumentRelease) => (
        <Link to={`/track/${r.referenceNumber}`}>
          <Button variant="outline" size="sm">
            View Slip
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
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Document Release Records</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Official registry of issued clearances, certifications, and payment receipts
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchReleases(page)}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={releases}
            keyExtractor={(r) => r.id}
            isLoading={loading}
            emptyMessage="No released documents recorded yet."
          />

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => fetchReleases(page - 1)}
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
                onClick={() => fetchReleases(page + 1)}
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
