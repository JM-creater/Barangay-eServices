import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/Appointment';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';
import { Calendar, CheckCircle2, XCircle, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StaffAppointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAppointmentsByDate(selectedDate);
      setAppointments(data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAppointments();
  }, [selectedDate]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await appointmentService.updateAppointmentStatus(id, status);
      fetchDailyAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Time',
      accessor: (a: Appointment) => (
        <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{formatTime(a.appointmentTime)}</span>
      ),
    },
    {
      header: 'Resident Name',
      accessor: (a: Appointment) => (
        <div>
          <div style={{ fontWeight: 600 }}>{a.residentName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.contactNumber}</div>
        </div>
      ),
    },
    {
      header: 'Reference # / Service',
      accessor: (a: Appointment) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1E4E8C' }}>{a.referenceNumber}</div>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>{a.serviceName}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (a: Appointment) => {
        const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
          CONFIRMED: 'success',
          PENDING_CONFIRMATION: 'warning',
          ATTENDED: 'primary',
          CANCELLED: 'danger',
          NO_SHOW: 'danger',
        };
        return <Badge variant={variants[a.status] || 'neutral'}>{a.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: (a: Appointment) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {a.status !== 'ATTENDED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleUpdateStatus(a.id, 'ATTENDED')}
            >
              <CheckCircle2 size={13} /> Check In (Attended)
            </Button>
          )}

          {a.status !== 'NO_SHOW' && a.status !== 'ATTENDED' && (
            <Button
              variant="outline"
              size="sm"
              style={{ borderColor: '#D64545', color: '#D64545' }}
              onClick={() => handleUpdateStatus(a.id, 'NO_SHOW')}
            >
              <XCircle size={13} /> No-Show
            </Button>
          )}

          <Link to={`/staff/requests/${a.requestId}`}>
            <Button variant="ghost" size="sm">
              <Eye size={13} /> Review Request
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>Appointment Schedule</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Manage office appearance schedule, attendance check-in, and no-shows
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter by Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto' }}
            />
            <Button variant="outline" size="sm" onClick={fetchDailyAppointments}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        </div>

        <Card>
          <div style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1rem', color: '#0F2A4A' }}>
            Appointments for {formatDate(selectedDate)} ({appointments.length} total)
          </div>

          <Table
            columns={columns}
            data={appointments}
            keyExtractor={(a) => a.id}
            isLoading={loading}
            emptyMessage={`No appointments scheduled for ${formatDate(selectedDate)}.`}
          />
        </Card>
      </div>
    </Layout>
  );
};
