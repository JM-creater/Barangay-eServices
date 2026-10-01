import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { reportService } from '../../services/reportService';
import { DashboardStats, FinancialReport, ServiceRevenueBreakdown } from '../../types/Report';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import {
  FileText,
  Calendar,
  CheckCircle2,
  UserCheck,
  Clock,
  Download,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Coins,
  Receipt,
  FileHeart,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Financial Reconciliation State
  const [financialStartDate, setFinancialStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [financialEndDate, setFinancialEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [exportingCollections, setExportingCollections] = useState(false);
  const [exportingRequests, setExportingRequests] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    reportService
      .getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  const fetchFinancialData = async () => {
    setFinancialLoading(true);
    try {
      const data = await reportService.getFinancialReport(financialStartDate, financialEndDate);
      setFinancialReport(data);
    } catch {
      // Ignored
    } finally {
      setFinancialLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [financialStartDate, financialEndDate]);

  const handleExportCollections = async () => {
    setExportingCollections(true);
    try {
      const blob = await reportService.exportCollectionsCsv(financialStartDate, financialEndDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collections_ledger_${financialStartDate}_to_${financialEndDate}.csv`;
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
      const blob = await reportService.exportRequestsCsv(financialStartDate, financialEndDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_requests_${financialStartDate}_to_${financialEndDate}.csv`;
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

  const breakdownColumns = [
    {
      header: 'Service / Document Name',
      accessor: (b: ServiceRevenueBreakdown) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{b.serviceName}</span>
      ),
    },
    {
      header: 'Completed Transactions',
      accessor: (b: ServiceRevenueBreakdown) => (
        <span style={{ fontWeight: 600, color: '#1E4E8C' }}>{b.transactionCount}</span>
      ),
    },
    {
      header: 'Total Collections (PHP)',
      accessor: (b: ServiceRevenueBreakdown) => (
        <span style={{ fontWeight: 700, color: '#2E8B57' }}>{formatCurrency(b.totalAmount)}</span>
      ),
    },
  ];

  if (loading) return <Layout showSidebar><LoadingSpinner message="Loading operations dashboard..." /></Layout>;

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#1F2933' }}>Staff Operations Dashboard</h1>
          <p style={{ color: '#616E7C', fontSize: '0.9rem' }}>
            Workload management, appointment verification, and issuance for Barangay Cansojong
          </p>
        </div>

        {/* Workload Highlights */}
        <div className="grid-4">
          <Card style={{ borderLeft: '4px solid #F2B600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fef9e8',
                  color: '#F2B600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#616E7C', fontWeight: 600, textTransform: 'uppercase' }}>
                  Pending Review
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2933' }}>
                  {stats?.pendingReviewCount || 0}
                </div>
              </div>
            </div>
            <Link to="/staff/requests?status=SUBMITTED" style={{ fontSize: '0.8rem', color: '#9e7500', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
              View Queue →
            </Link>
          </Card>

          <Card style={{ borderLeft: '4px solid #3B82C4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f0f6fc',
                  color: '#3B82C4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#616E7C', fontWeight: 600, textTransform: 'uppercase' }}>
                  Appointments Today
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2933' }}>
                  {stats?.appointmentsToday || 0}
                </div>
              </div>
            </div>
            <Link to="/staff/appointments" style={{ fontSize: '0.8rem', color: '#1e5c94', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
              Open Schedule →
            </Link>
          </Card>

          <Card style={{ borderLeft: '4px solid #2E8B57' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#edf7f2',
                  color: '#2E8B57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#616E7C', fontWeight: 600, textTransform: 'uppercase' }}>
                  Ready for Release
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2933' }}>
                  {stats?.readyForReleaseCount || 0}
                </div>
              </div>
            </div>
            <Link to="/staff/requests?status=READY_FOR_RELEASE" style={{ fontSize: '0.8rem', color: '#1d613c', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
              Process Releases →
            </Link>
          </Card>

          <Card style={{ borderLeft: '4px solid #1E4E8C' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#eff5fc',
                  color: '#1E4E8C',
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
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2933' }}>
                  {stats?.completedReleasedCount || 0}
                </div>
              </div>
            </div>
            <Link to="/staff/releases" style={{ fontSize: '0.8rem', color: '#1E4E8C', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
              Release Log →
            </Link>
          </Card>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid-2">
          {/* Workload Status breakdown */}
          <Card title="Application Workflow Status Breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>Submitted / Under Review</span>
                <span style={{ fontWeight: 700, color: '#3B82C4' }}>{stats?.pendingReviewCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>Needs Correction</span>
                <span style={{ fontWeight: 700, color: '#F2B600' }}>{stats?.needsCorrectionCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>Accepted (Confirmed Appointment)</span>
                <span style={{ fontWeight: 700, color: '#2E8B57' }}>{stats?.acceptedCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>In-Person Verified & Processing</span>
                <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{stats?.processingCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>Ready for Official Release</span>
                <span style={{ fontWeight: 700, color: '#2E8B57' }}>{stats?.readyForReleaseCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>Rejected Applications</span>
                <span style={{ fontWeight: 700, color: '#D64545' }}>{stats?.rejectedCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F2A4A' }}>Total Requests</span>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1E4E8C' }}>{stats?.totalRequests}</span>
              </div>
            </div>
          </Card>

          {/* Quick Operations Actions */}
          <Card title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <Link to="/staff/requests">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <FileText size={18} /> View All Applications Queue
                </Button>
              </Link>
              <Link to="/staff/appointments">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Calendar size={18} /> Check Today's Resident Appointments
                </Button>
              </Link>
              <Link to="/staff/releases">
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <CheckCircle2 size={18} /> View Released Documents & OR Logs
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Financial Reconciliation & CSV Data Exports Section */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #DDE3EA', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={22} color="#1E4E8C" />
                <h2 style={{ fontSize: '1.35rem', color: '#1F2933', fontWeight: 700, margin: 0 }}>
                  Financial Reconciliation & CSV Data Exports
                </h2>
              </div>
              <p style={{ color: '#616E7C', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Track fee collections, indigent fee waivers, and export official audit reports
              </p>
            </div>

            {/* Date Filters & CSV Download Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', color: '#1F2933' }}>From Date:</label>
                <input
                  type="date"
                  value={financialStartDate}
                  onChange={(e) => setFinancialStartDate(e.target.value)}
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '100%' }}
                />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', color: '#1F2933' }}>To Date:</label>
                <input
                  type="date"
                  value={financialEndDate}
                  onChange={(e) => setFinancialEndDate(e.target.value)}
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '100%' }}
                />
              </div>
              <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant="outline" size="sm" onClick={fetchFinancialData} title="Reload financial metrics">
                  <RefreshCw size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCollections}
                  isLoading={exportingCollections}
                  style={{ borderColor: '#2E8B57', color: '#2E8B57' }}
                >
                  <Download size={14} /> Collections (CSV)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportRequests}
                  isLoading={exportingRequests}
                  style={{ borderColor: '#1E4E8C', color: '#1E4E8C' }}
                >
                  <FileSpreadsheet size={14} /> Requests (CSV)
                </Button>
              </div>
            </div>
          </div>

          {/* Financial Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#eff5fc',
                border: '1px solid #bcd5f0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#1E4E8C',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#1E4E8C', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Collected
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2A4A' }}>
                  {formatCurrency(financialReport?.totalRevenue || 0)}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#edf7f2',
                border: '1px solid #a8dfc1',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#2E8B57',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Receipt size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#2E8B57', fontWeight: 700, textTransform: 'uppercase' }}>
                  Official Receipts Issued
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d613c' }}>
                  {financialReport?.totalReceiptsIssued || 0}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fef9e8',
                border: '1px solid #fae49d',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#F2B600',
                  color: '#0F2A4A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileHeart size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#9e7500', fontWeight: 700, textTransform: 'uppercase' }}>
                  Services Generating Revenue
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9e7500' }}>
                  {financialReport?.serviceBreakdown?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown by Service Table */}
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              Revenue & Transactions Breakdown by Service
            </h3>
            <Table
              columns={breakdownColumns}
              data={financialReport?.serviceBreakdown || []}
              keyExtractor={(b) => b.serviceName}
              isLoading={financialLoading}
              emptyMessage="No revenue or service requests recorded within the selected period."
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
};
