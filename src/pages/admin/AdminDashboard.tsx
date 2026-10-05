import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { reportService } from '../../services/reportService';
import { DashboardStats } from '../../types/Report';
import { Card } from '../../components/common/Card';
import { AdminDashboardSkeleton } from '../../components/skeletons';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  FileText,
  Calendar,
  Banknote,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingCollections, setExportingCollections] = useState(false);
  const [exportingRequests, setExportingRequests] = useState(false);

  useEffect(() => {
    reportService
      .getDashboardStats()
      .then(setStats)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleExportCollections = async () => {
    setExportingCollections(true);
    try {
      const blob = await reportService.exportCollectionsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_collections_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export collections CSV');
    } finally {
      setExportingCollections(false);
    }
  };

  const handleExportRequests = async () => {
    setExportingRequests(true);
    try {
      const blob = await reportService.exportRequestsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_requests_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export requests CSV');
    } finally {
      setExportingRequests(false);
    }
  };

  if (loading) return <Layout showSidebar><AdminDashboardSkeleton /></Layout>;

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: '#1F2933' }}>Barangay Administrative Portal</h1>
            <p style={{ color: '#616E7C', fontSize: '0.9rem' }}>
              System overview, revenue collections, user accounts, and workload metrics
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCollections}
              isLoading={exportingCollections}
              style={{ color: '#2E8B57', borderColor: '#2E8B57' }}
            >
              <Download size={14} /> Collections CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportRequests}
              isLoading={exportingRequests}
              style={{ color: '#1E4E8C', borderColor: '#1E4E8C' }}
            >
              <FileSpreadsheet size={14} /> Requests CSV
            </Button>
            <Link to="/admin/users">
              <Button variant="outline" size="sm">Manage Accounts</Button>
            </Link>
            <Link to="/admin/slots">
              <Button variant="primary" size="sm">Configure Slots</Button>
            </Link>
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid-4">
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#edf7f2',
                  color: '#2E8B57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Banknote size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#616E7C', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Fees Collected
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2E8B57' }}>
                  {formatCurrency(stats?.totalRevenueCollected || 0)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#eff5fc',
                  color: '#1E4E8C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#616E7C', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Applications
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2933' }}>
                  {stats?.totalRequests || 0}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#fef9e8',
                  color: '#d9a300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#616E7C', fontWeight: 600, textTransform: 'uppercase' }}>
                  Registered Residents
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2933' }}>
                  {stats?.totalRegisteredResidents || 0}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#f0f6fc',
                  color: '#3B82C4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#616E7C', fontWeight: 600, textTransform: 'uppercase' }}>
                  Released Documents
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2933' }}>
                  {stats?.completedReleasedCount || 0}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="grid-2">
          {/* Applications by Service */}
          <Card title="Applications by Service Type">
            {stats && Object.keys(stats.requestsByService).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.requestsByService).map(([svcName, count]) => (
                  <div
                    key={svcName}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0',
                      borderBottom: '1px solid #DDE3EA',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2933' }}>{svcName}</span>
                    <span
                      style={{
                        backgroundColor: '#eff5fc',
                        color: '#1E4E8C',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        border: '1px solid #bcd5f0',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No applications recorded yet.</p>
            )}
          </Card>


          {/* Quick Administration Actions */}
          <Card title="Management & Governance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/admin/users">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Users size={18} /> Manage Personnel & Resident Accounts
                </Button>
              </Link>
              <Link to="/admin/services">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Layers size={18} /> Configure Services, Fees & Requirements
                </Button>
              </Link>
              <Link to="/admin/slots">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Calendar size={18} /> Appointment Capacity & Slots Scheduler
                </Button>
              </Link>
              <Link to="/admin/audit-logs">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Activity size={18} /> Review System Security & Audit Trail
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
