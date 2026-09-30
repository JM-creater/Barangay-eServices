import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { appointmentService } from '../../services/appointmentService';
import { requestService } from '../../services/requestService';
import { ServiceItem } from '../../types/Service';
import { AppointmentSlot } from '../../types/Appointment';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatTime } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const ApplyService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  // Form State
  const [purpose, setPurpose] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; requirementId?: number }[]>([]);

  // Appointment Slots State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Tomorrow by default or next weekday
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
    if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Saturday -> Monday
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (id) {
      serviceCatalogService
        .getServiceById(parseInt(id, 10))
        .then((data) => setService(data))
        .catch(() => setError('Failed to load service details'))
        .finally(() => setLoading(false));
    }
  }, [id, isAuthenticated, navigate]);

  // Load slots when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      appointmentService
        .getAvailableSlots(selectedDate)
        .then((data) => {
          setSlots(data);
          setSelectedSlot(null);
        })
        .catch(() => {})
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, reqId?: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFiles((prev) => {
        const filtered = prev.filter((item) => item.requirementId !== reqId);
        return [...filtered, { file, requirementId: reqId }];
      });
    }
  };

  const handleSubmit = async () => {
    if (!service || !selectedSlot) return;
    setError(null);
    setSubmitting(true);

    try {
      const response = await requestService.submitRequest(
        {
          serviceId: service.id,
          purpose,
          slotId: selectedSlot.id,
          submittedDataJson: JSON.stringify({
            applicantName: user?.fullName,
            contactNumber: user?.contactNumber,
            address: user?.address,
            additionalNotes,
          }),
        },
        selectedFiles
      );

      navigate(`/track/${response.referenceNumber}?submitted=true`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to submit application. The selected slot may have just become full. Please choose another slot.'
      );
      setStep(3); // Go back to slot selection
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner message="Loading application form..." /></Layout>;
  if (!service) return <Layout><div style={{ textAlign: 'center', padding: '3rem' }}>Service not found.</div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/services" style={{ color: '#1E4E8C', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Services Catalog
          </Link>
          <h1 style={{ fontSize: '1.85rem', color: '#1F2933' }}>Application for {service.name}</h1>
          <p style={{ color: '#616E7C', fontSize: '0.9rem' }}>
            Fee: <strong>{formatCurrency(service.fee)}</strong> • Processing Time: <strong>{service.estimatedProcessingDays} day(s)</strong>
          </p>
        </div>

        {/* Stepper Progress */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            backgroundColor: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid #DDE3EA',
          }}
        >
          {[
            { num: 1, label: 'Applicant Details' },
            { num: 2, label: 'Document Uploads' },
            { num: 3, label: 'Appointment Slot' },
            { num: 4, label: 'Review & Submit' },
          ].map((item) => (
            <div
              key={item.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: step >= item.num ? 1 : 0.45,
                color: step === item.num ? '#1E4E8C' : step > item.num ? '#2E8B57' : '#616E7C',
                fontWeight: step === item.num ? 700 : 500,
                fontSize: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: step === item.num ? '#1E4E8C' : step > item.num ? '#2E8B57' : '#DDE3EA',
                  color: step >= item.num ? '#ffffff' : '#616E7C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {step > item.num ? '✓' : item.num}
              </div>
              <span className="step-label">{item.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* STEP 1: Applicant Details & Purpose */}
        {step === 1 && (
          <Card title="Applicant Information & Purpose">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                  Registered Resident Profile:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem', fontSize: '0.875rem' }}>
                  <div><strong>Name:</strong> {user?.fullName}</div>
                  <div><strong>Contact:</strong> {user?.contactNumber}</div>
                  <div><strong>Email:</strong> {user?.email}</div>
                  <div><strong>Address:</strong> {user?.address}, {user?.barangay}</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Purpose of Request *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Local Employment, Bank Account Opening, Scholarship Application"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Additional Notes or Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide any additional specifics or details regarding this request"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button
                  variant="primary"
                  disabled={!purpose.trim()}
                  onClick={() => setStep(2)}
                >
                  Proceed to Document Uploads <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 2: Supporting Document Uploads */}
        {step === 2 && (
          <Card title="Upload Supporting Requirements">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Please attach clear photos or scanned copies (JPG, PNG, or PDF) for the requirements listed below.
              </p>

              {service.requirements.map((req) => {
                const attached = selectedFiles.find((f) => f.requirementId === req.id);
                return (
                  <div
                    key={req.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {req.requirementName}
                        {req.isMandatory && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
                      </span>
                      {attached ? (
                        <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Attached ({attached.file.name})
                        </span>
                      ) : req.isMandatory ? (
                        <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}>Required</span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Optional</span>
                      )}
                    </div>
                    {req.description && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {req.description}
                      </p>
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e.target.value ? e : e, req.id)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button variant="primary" onClick={() => setStep(3)}>
                  Choose Appointment Slot <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: Appointment Scheduling */}
        {step === 3 && (
          <Card title="Choose Appointment Slot">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  fontSize: '0.85rem',
                  color: '#1e40af',
                }}
              >
                <strong>Scheduling Policy:</strong> Slot reservation happens atomically upon submission.
                Please select your preferred visit date and time slot.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Select Date (Weekdays only):
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ maxWidth: '280px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Available Time Slots:
                </label>

                {loadingSlots ? (
                  <LoadingSpinner message="Checking available slots..." />
                ) : slots.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                    No available appointment slots found for this date. Please choose another date.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {slots.map((s) => {
                      const isSelected = selectedSlot?.id === s.id;
                      const hasCapacity = s.remainingCapacity > 0;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (hasCapacity) setSelectedSlot(s);
                          }}
                          style={{
                            border: `2px solid ${isSelected ? '#1E4E8C' : hasCapacity ? '#DDE3EA' : '#f1f5f9'}`,
                            backgroundColor: isSelected ? '#eff5fc' : hasCapacity ? '#ffffff' : '#f8fafc',
                            borderRadius: '8px',
                            padding: '0.85rem',
                            cursor: hasCapacity ? 'pointer' : 'not-allowed',
                            opacity: hasCapacity ? 1 : 0.5,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#1E4E8C' : '#1F2933' }}>
                            {formatTime(s.startTime)} – {formatTime(s.endTime)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: hasCapacity ? '#2E8B57' : '#D64545', marginTop: '0.25rem', fontWeight: 600 }}>
                            {hasCapacity ? `${s.remainingCapacity} slots remaining` : 'Fully Booked'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedSlot}
                  onClick={() => setStep(4)}
                >
                  Review Application <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 4: Review and Submit */}
        {step === 4 && (
          <Card title="Review & Confirm Application">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#F5F7FA', padding: '1.25rem', borderRadius: '10px', border: '1px solid #DDE3EA' }}>
                <h4 style={{ fontSize: '1rem', color: '#1E4E8C', marginBottom: '0.75rem' }}>Application Summary</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#1F2933' }}>
                  <div><strong>Service:</strong> {service.name}</div>
                  <div><strong>Applicant:</strong> {user?.fullName} ({user?.contactNumber})</div>
                  <div><strong>Address:</strong> {user?.address}</div>
                  <div><strong>Purpose:</strong> {purpose}</div>
                  {additionalNotes && <div><strong>Notes:</strong> {additionalNotes}</div>}
                  <div><strong>Barangay Fee:</strong> {formatCurrency(service.fee)}</div>
                  <div><strong>Attachments:</strong> {selectedFiles.length} file(s) attached</div>
                </div>
              </div>

              {selectedSlot && (
                <div style={{ backgroundColor: '#eff5fc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bcd5f0' }}>
                  <h4 style={{ fontSize: '1rem', color: '#1E4E8C', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={18} /> Reserved Office Appointment
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: '#1F2933' }}>
                    <strong>Date:</strong> {selectedSlot.slotDate} ({formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)})
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#616E7C', marginTop: '0.35rem' }}>
                    Upon staff review approval, your appointment will be officially confirmed.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  variant="primary"
                  isLoading={submitting}
                  onClick={handleSubmit}
                >
                  <CheckCircle2 size={18} /> Confirm & Submit Application
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};
