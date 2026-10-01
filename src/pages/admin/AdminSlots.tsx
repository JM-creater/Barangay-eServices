import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { appointmentService } from '../../services/appointmentService';
import { AppointmentSlot, Holiday } from '../../types/Appointment';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatTime } from '../../utils/formatters';
import { Plus, Calendar, Clock, RefreshCw, CalendarOff, Trash2, AlertCircle } from 'lucide-react';

export const AdminSlots: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slots' | 'holidays'>('slots');

  // Slots State
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Single Slot Modal
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [slotDate, setSlotDate] = useState(startDate);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [capacity, setCapacity] = useState(10);
  const [creatingSingle, setCreatingSingle] = useState(false);

  // Batch Generation Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchStart, setBatchStart] = useState(startDate);
  const [batchEnd, setBatchEnd] = useState(endDate);
  const [batchCapacity, setBatchCapacity] = useState(10);
  const [batchDuration, setBatchDuration] = useState(60);
  const [generatingBatch, setGeneratingBatch] = useState(false);

  // Holidays State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayDate, setHolidayDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [holidayName, setHolidayName] = useState('');
  const [holidayType, setHolidayType] = useState('REGULAR');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [holidayError, setHolidayError] = useState<string | null>(null);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const data = await appointmentService.getAvailableSlotsRange(startDate, endDate);
      setSlots(data);
    } catch {
      // Ignored
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchHolidays = async () => {
    setHolidaysLoading(true);
    try {
      const start = `${selectedYear}-01-01`;
      const end = `${selectedYear}-12-31`;
      const data = await appointmentService.getHolidays(start, end);
      setHolidays(data);
    } catch {
      // Ignored
    } finally {
      setHolidaysLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'slots') {
      fetchSlots();
    } else {
      fetchHolidays();
    }
  }, [startDate, endDate, activeTab, selectedYear]);

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSingle(true);
    try {
      await appointmentService.createSlot({
        slotDate,
        startTime: startTime + ':00',
        endTime: endTime + ':00',
        maxCapacity: capacity,
      });
      setShowSingleModal(false);
      fetchSlots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create slot');
    } finally {
      setCreatingSingle(false);
    }
  };

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingBatch(true);
    try {
      const defaultTimes = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00'];
      await appointmentService.batchCreateSlots({
        startDate: batchStart,
        endDate: batchEnd,
        startTimes: defaultTimes,
        durationMinutes: batchDuration,
        capacityPerSlot: batchCapacity,
      });
      setShowBatchModal(false);
      fetchSlots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate batch slots');
    } finally {
      setGeneratingBatch(false);
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setHolidayError(null);
    setSavingHoliday(true);
    try {
      await appointmentService.createHoliday({
        holidayDate,
        name: holidayName.trim(),
        type: holidayType,
        description: holidayDescription.trim() || undefined,
      });
      setShowHolidayModal(false);
      setHolidayName('');
      setHolidayDescription('');
      setHolidayType('REGULAR');
      fetchHolidays();
    } catch (err: any) {
      setHolidayError(err.response?.data?.message || 'Failed to create holiday');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from non-working holidays?`)) {
      return;
    }
    try {
      await appointmentService.deleteHoliday(id);
      fetchHolidays();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const slotColumns = [
    {
      header: 'Date',
      accessor: (s: AppointmentSlot) => (
        <span style={{ fontWeight: 600 }}>{formatDate(s.slotDate)}</span>
      ),
    },
    {
      header: 'Time Window',
      accessor: (s: AppointmentSlot) => `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`,
    },
    {
      header: 'Capacity & Booked',
      accessor: (s: AppointmentSlot) => (
        <div>
          <span>{s.bookedCount} / {s.maxCapacity} booked</span>
          <div style={{ fontSize: '0.75rem', color: s.remainingCapacity > 0 ? '#15803d' : '#dc2626' }}>
            {s.remainingCapacity} remaining
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (s: AppointmentSlot) => (
        <Badge variant={s.isAvailable ? 'success' : 'danger'}>
          {s.isAvailable ? 'Available' : 'Full / Inactive'}
        </Badge>
      ),
    },
  ];

  const holidayColumns = [
    {
      header: 'Holiday Date',
      accessor: (h: Holiday) => (
        <div style={{ fontWeight: 600, color: '#0f172a' }}>
          {formatDate(h.holidayDate)}
        </div>
      ),
    },
    {
      header: 'Holiday / Closure Name',
      accessor: (h: Holiday) => (
        <div>
          <div style={{ fontWeight: 600 }}>{h.name}</div>
          {h.description && (
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Holiday Type',
      accessor: (h: Holiday) => {
        const typeLabel =
          h.type === 'SPECIAL_NON_WORKING'
            ? 'Special Non-Working'
            : h.type === 'LOCAL_EVENT'
            ? 'Local / Barangay Closure'
            : 'Regular Holiday';
        const typeVariant =
          h.type === 'SPECIAL_NON_WORKING' ? 'warning' : h.type === 'LOCAL_EVENT' ? 'info' : 'primary';
        return <Badge variant={typeVariant}>{typeLabel}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: (h: Holiday) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteHoliday(h.id, h.name)}
          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
          title="Delete Holiday"
        >
          <Trash2 size={14} /> Remove
        </Button>
      ),
    },
  ];

  return (
    <Layout showSidebar>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>Office Calendar & Slot Management</h1>
            <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>
              Configure appointment slot capacities, working hours, and non-working holidays
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {activeTab === 'slots' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowBatchModal(true)}>
                  <Calendar size={16} /> Batch Generate Weekdays
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowSingleModal(true)}>
                  <Plus size={16} /> Add Custom Slot
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setShowHolidayModal(true)}>
                <Plus size={16} /> Add Non-Working Holiday
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-scroll-container">
          <button
            type="button"
            onClick={() => setActiveTab('slots')}
            style={{
              padding: '0.75rem 0.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: activeTab === 'slots' ? '3px solid #1E4E8C' : '3px solid transparent',
              color: activeTab === 'slots' ? '#1E4E8C' : '#616E7C',
              marginBottom: '-2px',
            }}
          >
            <Clock size={18} /> Appointment Slot Capacities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('holidays')}
            style={{
              padding: '0.75rem 0.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: activeTab === 'holidays' ? '3px solid #1E4E8C' : '3px solid transparent',
              color: activeTab === 'holidays' ? '#1E4E8C' : '#616E7C',
              marginBottom: '-2px',
            }}
          >
            <CalendarOff size={18} /> Holidays & Non-Working Days
          </button>
        </div>

        {/* Tab: Slots */}
        {activeTab === 'slots' && (
          <Card>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>From Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: 'auto' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>To Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: 'auto' }} />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <Button variant="outline" size="sm" onClick={fetchSlots}>
                  <RefreshCw size={14} /> Reload
                </Button>
              </div>
            </div>

            <Table
              columns={slotColumns}
              data={slots}
              keyExtractor={(s) => s.id}
              isLoading={slotsLoading}
              emptyMessage="No appointment slots found in this date range."
            />
          </Card>
        )}

        {/* Tab: Holidays */}
        {activeTab === 'holidays' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  Filter Year:
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                </select>
                <Button variant="outline" size="sm" onClick={fetchHolidays}>
                  <RefreshCw size={14} /> Reload
                </Button>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Residents cannot book appointment slots on registered non-working days.
              </p>
            </div>

            <Table
              columns={holidayColumns}
              data={holidays}
              keyExtractor={(h) => h.id}
              isLoading={holidaysLoading}
              emptyMessage="No holidays or non-working days defined for this year."
            />
          </Card>
        )}

        {/* Modal: Single Slot */}
        <Modal
          isOpen={showSingleModal}
          onClose={() => setShowSingleModal(false)}
          title="Create Single Appointment Slot"
        >
          <form onSubmit={handleCreateSingle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Slot Date *
              </label>
              <input type="date" required value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Start Time *
                </label>
                <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  End Time *
                </label>
                <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Max Capacity *
              </label>
              <input type="number" required min={1} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowSingleModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={creatingSingle}>Create Slot</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Batch Generate */}
        <Modal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          title="Batch Generate Weekday Appointment Slots"
        >
          <form onSubmit={handleGenerateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Generates slots for Mondays through Fridays (8:00 AM - 5:00 PM with 12:00 lunch break).
            </p>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Start Date *
                </label>
                <input type="date" required value={batchStart} onChange={(e) => setBatchStart(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  End Date *
                </label>
                <input type="date" required value={batchEnd} onChange={(e) => setBatchEnd(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Capacity per Slot *
              </label>
              <input type="number" min={1} required value={batchCapacity} onChange={(e) => setBatchCapacity(parseInt(e.target.value, 10) || 10)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowBatchModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={generatingBatch}>Generate Slots</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Holiday */}
        <Modal
          isOpen={showHolidayModal}
          onClose={() => setShowHolidayModal(false)}
          title="Add Non-Working Holiday / Closure"
        >
          <form onSubmit={handleCreateHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {holidayError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                }}
              >
                <AlertCircle size={18} /> {holidayError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Holiday Date *
              </label>
              <input
                type="date"
                required
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Holiday / Event Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rizal Day, Barangay Fiesta, All Saints Day"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Regular National Holiday - Office Closed"
                value={holidayDescription}
                onChange={(e) => setHolidayDescription(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Holiday / Closure Type *
              </label>
              <select
                value={holidayType}
                onChange={(e) => setHolidayType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="REGULAR">Regular Holiday (Official National Holiday)</option>
                <option value="SPECIAL_NON_WORKING">Special Non-Working Holiday</option>
                <option value="LOCAL_EVENT">Barangay / Local Office Closure</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowHolidayModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={savingHoliday}>Save Holiday</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
