import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentSlot } from '../../types/Appointment';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { SlotGridSkeleton } from '../../components/skeletons';
import { formatDate, formatTime } from '../../utils/formatters';
import { BARANGAY_INFO } from '../../utils/constants';
import { Calendar, Clock, RefreshCw, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

export const ResidentAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule Modal
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [newSlotId, setNewSlotId] = useState<number | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch slots for reschedule date
  useEffect(() => {
    if (selectedAppt && rescheduleDate) {
      setLoadingSlots(true);
      appointmentService
        .getAvailableSlots(rescheduleDate)
        .then((data) => {
          setAvailableSlots(data);
          setNewSlotId(null);
        })
        .catch(() => {})
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedAppt, rescheduleDate]);

  const handleOpenReschedule = (appt: Appointment) => {
    setSelectedAppt(appt);
    setRescheduleError(null);
    setRescheduleReason('');
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppt || !newSlotId) return;
    setRescheduling(true);
    setRescheduleError(null);
    try {
      await appointmentService.rescheduleAppointment(
        selectedAppt.id,
        newSlotId,
        rescheduleReason
      );
      setSelectedAppt(null);
      fetchAppointments();
    } catch (err: any) {
      setRescheduleError(
        err.response?.data?.message || 'Failed to reschedule appointment. The chosen slot may be full.'
      );
    } finally {
      setRescheduling(false);
    }
  };

  const columns = [
    {
      header: 'Reference No.',
      accessor: (a: Appointment) => (
        <span style={{ fontWeight: 700, color: '#1E4E8C' }}>{a.referenceNumber}</span>
      ),
    },
    {
      header: 'Service',
      accessor: 'serviceName' as keyof Appointment,
    },
    {
      header: 'Date & Time',
      accessor: (a: Appointment) => (
        <div>
          <div style={{ fontWeight: 600 }}>{formatDate(a.appointmentDate)}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatTime(a.appointmentTime)}</div>
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
      accessor: (a: Appointment) => {
        const canReschedule = a.status === 'CONFIRMED' || a.status === 'PENDING_CONFIRMATION' || a.status === 'NO_SHOW';
        return (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {a.requestId && (
              <Link to={`/requests/${a.requestId}`}>
                <Button variant="outline" size="sm">
                  <FileText size={14} /> View Slip
                </Button>
              </Link>
            )}
            {canReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenReschedule(a)}
              >
                <RefreshCw size={14} /> Reschedule
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>My Appointment Schedule</h1>
          <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>
            Confirmed appointments and physical appearance slots at Barangay Cansojong Hall
          </p>
        </div>

        <Card>
          <Table
            columns={columns}
            data={appointments}
            keyExtractor={(a) => a.id}
            isLoading={loading}
            emptyMessage="No scheduled appointments found."
          />
        </Card>

        {/* Reschedule Modal */}
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title="Reschedule Appointment"
          maxWidth="600px"
        >
          {selectedAppt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#eff5fc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #DDE3EA', fontSize: '0.85rem', color: '#0F2A4A' }}>
                <strong>Current Booking:</strong> {selectedAppt.referenceNumber} ({selectedAppt.serviceName}) on{' '}
                {formatDate(selectedAppt.appointmentDate)} at {formatTime(selectedAppt.appointmentTime)}.
                <br />
                <em>Note: Your new slot will be secured atomically before the previous slot is released.</em>
              </div>

              {rescheduleError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px', color: '#D64545', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  {rescheduleError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Select New Date (Weekdays):
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  style={{ maxWidth: '280px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Select Available Time Slot:
                </label>

                {loadingSlots ? (
                  <SlotGridSkeleton count={6} minWidth="140px" />
                ) : availableSlots.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    No slots available on this date.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                    {availableSlots.map((s) => {
                      const isSelected = newSlotId === s.id;
                      const hasCapacity = s.remainingCapacity > 0;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (hasCapacity) setNewSlotId(s.id);
                          }}
                          style={{
                            border: `2px solid ${isSelected ? '#1E4E8C' : hasCapacity ? '#DDE3EA' : '#f1f5f9'}`,
                            backgroundColor: isSelected ? 'rgba(30, 78, 140, 0.08)' : hasCapacity ? '#ffffff' : '#f8fafc',
                            borderRadius: '8px',
                            padding: '0.65rem',
                            cursor: hasCapacity ? 'pointer' : 'not-allowed',
                            opacity: hasCapacity ? 1 : 0.45,
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#1E4E8C' : '#1F2933' }}>
                            {formatTime(s.startTime)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: hasCapacity ? '#2E8B57' : '#D64545' }}>
                            {hasCapacity ? `${s.remainingCapacity} left` : 'Full'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  placeholder="e.g. Conflict with work schedule, medical appointment"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <Button variant="ghost" onClick={() => setSelectedAppt(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  isLoading={rescheduling}
                  disabled={!newSlotId}
                  onClick={handleConfirmReschedule}
                >
                  Confirm Reschedule
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};
