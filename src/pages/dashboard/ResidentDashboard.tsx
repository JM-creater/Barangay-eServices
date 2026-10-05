import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { requestService } from '../../services/requestService';
import { appointmentService } from '../../services/appointmentService';
import { DocumentRequest } from '../../types/Request';
import { Appointment } from '../../types/Appointment';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { StatCardSkeleton } from '../../components/skeletons';
import { formatDate, formatDateTime, formatTime } from '../../utils/formatters';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      requestService.getMyRequests(0, 5),
      appointmentService.getMyAppointments(),
    ])
      .then(([reqRes, appList]) => {
        setRequests(reqRes.content);
        setAppointments(appList);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingRequests = requests.filter(
    (r) => r.currentStatus === 'SUBMITTED' || r.currentStatus === 'UNDER_REVIEW'
  );
  const needsCorrection = requests.filter((r) => r.currentStatus === 'NEEDS_CORRECTION');
  const readyOrReleased = requests.filter(
    (r) => r.currentStatus === 'READY_FOR_RELEASE' || r.currentStatus === 'RELEASED'
  );

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Welcome Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F2A4A 0%, #1E4E8C 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 6px 18px rgba(15, 42, 74, 0.2)',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff' }}>Welcome, {user?.firstName}!</h1>
            <p style={{ color: '#DDE3EA', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Barangay Cansojong Resident e-Services Account
            </p>
          </div>
          <Link to="/services">
            <Button size="lg" style={{ backgroundColor: '#F2B600', color: '#0F2A4A', fontWeight: 700 }}>
              <Plus size={18} /> Apply for New Document
            </Button>
          </Link>
        </div>

        {/* Action Required Banner if Needs Correction */}
        {needsCorrection.length > 0 && (
          <div
            style={{
              backgroundColor: '#fef9e8',
              border: '2px solid #F2B600',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={24} color="#F2B600" />
              <div>
                <strong style={{ color: '#9e7500' }}>Action Required on Your Application:</strong>
                <p style={{ color: '#78350f', fontSize: '0.875rem' }}>
                  {needsCorrection.length} application(s) need document corrections or updates.
                </p>
              </div>
            </div>
            <Link to={`/requests/${needsCorrection[0].id}`}>
              <Button variant="primary" size="sm" style={{ backgroundColor: '#F2B600', color: '#0F2A4A', fontWeight: 700 }}>
                Review & Resubmit Now
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid-3">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#fef9e8',
                      color: '#F2B600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>Pending Review</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2933' }}>
                      {pendingRequests.length}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#f0f6fc',
                      color: '#3B82C4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>Scheduled Appointments</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2933' }}>
                      {appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING_CONFIRMATION').length}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#edf7f2',
                      color: '#2E8B57',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>Completed Documents</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2933' }}>
                      {readyOrReleased.length}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Recent Applications Section */}
        <Card
          title="Recent Applications"
          actions={
            <Link to="/my-requests">
              <Button variant="ghost" size="sm">
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          }
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-busy="true" aria-label="Loading applications">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    border: '1px solid #DDE3EA',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Skeleton variant="text" width={110} height="1rem" />
                      <Skeleton variant="rounded" width={75} height={20} />
                    </div>
                    <Skeleton variant="text" width="60%" height="0.85rem" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Skeleton variant="text" width={80} height="0.8rem" />
                    <Skeleton variant="rounded" width={80} height={32} />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              <p>You haven't submitted any applications yet.</p>
              <Link to="/services" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                <Button variant="primary" size="sm">
                  Apply for a Document
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    border: '1px solid #DDE3EA',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{r.referenceNumber}</span>
                      <Badge status={r.currentStatus} />
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1F2933', marginTop: '0.2rem' }}>
                      {r.service?.name} • Purpose: {r.purpose}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#616E7C' }}>
                      {formatDate(r.createdAt)}
                    </div>
                    <Link to={`/requests/${r.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye size={14} /> Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
