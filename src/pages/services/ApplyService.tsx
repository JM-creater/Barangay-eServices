import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { appointmentService } from '../../services/appointmentService';
import { requestService } from '../../services/requestService';
import { ServiceItem, Requirement } from '../../types/Service';
import { AppointmentSlot } from '../../types/Appointment';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { validateAttachedFile, formatFileSize } from '../../utils/fileValidation';
import {
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  X,
  FileCheck,
} from 'lucide-react';

interface AttachedFileItem {
  file: File;
  requirementId: number;
}

export const ApplyService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  // Form State
  const [purpose, setPurpose] = useState('');
  const [purposeTouched, setPurposeTouched] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<AttachedFileItem[]>([]);
  const [fileErrors, setFileErrors] = useState<Record<number, string>>({});

  // Appointment Slots State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
    if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Saturday -> Monday
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  // Submission & Validation Error State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attemptedStep2Submit, setAttemptedStep2Submit] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (id) {
      serviceCatalogService
        .getServiceById(parseInt(id, 10))
        .then((data) => setService(data))
        .catch(() => setError('Failed to load service details. Please try refreshing.'))
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
        .catch(() => { })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate]);

  // Purpose Validation Logic
  const getPurposeError = (): string | null => {
    const trimmed = purpose.trim();
    if (!trimmed) return 'Purpose of request is required.';
    if (trimmed.length < 5) return 'Purpose must be at least 5 characters long.';
    if (trimmed.length > 500) return 'Purpose cannot exceed 500 characters.';
    return null;
  };

  const isPurposeValid = getPurposeError() === null;

  // File Upload Handler with Security Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, reqId: number) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateAttachedFile(file);

      if (!validation.isValid) {
        setFileErrors((prev) => ({ ...prev, [reqId]: validation.error || 'Invalid file' }));
        return;
      }

      // Clear error for this requirement
      setFileErrors((prev) => {
        const next = { ...prev };
        delete next[reqId];
        return next;
      });

      setSelectedFiles((prev) => {
        const filtered = prev.filter((item) => item.requirementId !== reqId);
        return [...filtered, { file, requirementId: reqId }];
      });
    }
  };

  const handleRemoveFile = (reqId: number) => {
    setSelectedFiles((prev) => prev.filter((item) => item.requirementId !== reqId));
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[reqId];
      return next;
    });
  };

  // Step 2 Validation: Check all mandatory requirements are satisfied
  const getMissingMandatoryRequirements = (): Requirement[] => {
    if (!service) return [];
    return service.requirements.filter((req) => {
      if (!req.isMandatory) return false;
      return !selectedFiles.some((f) => f.requirementId === req.id);
    });
  };

  const handleProceedToStep2 = () => {
    setPurposeTouched(true);
    if (!isPurposeValid) return;
    setError(null);
    setStep(2);
  };

  const handleProceedToStep3 = () => {
    setAttemptedStep2Submit(true);
    const missing = getMissingMandatoryRequirements();
    if (missing.length > 0) {
      setError(`Please attach all required documents before proceeding. Missing: ${missing.map((m) => m.requirementName).join(', ')}.`);
      return;
    }
    if (Object.keys(fileErrors).length > 0) {
      setError('Please resolve all file upload errors before continuing.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleProceedToStep4 = () => {
    if (!selectedSlot) {
      setError('Please select an appointment time slot.');
      return;
    }
    setError(null);
    setStep(4);
  };

  // Step 4 Final Submission with Intelligent Error Handling
  const handleSubmit = async () => {
    if (!service) {
      setError('Service information is missing. Please reload the page.');
      return;
    }

    // Comprehensive client pre-flight check
    if (!isPurposeValid) {
      setError('Please provide a valid purpose of request (minimum 5 characters).');
      setStep(1);
      return;
    }

    const missing = getMissingMandatoryRequirements();
    if (missing.length > 0) {
      setError(`Cannot submit: Missing required document(s): ${missing.map((m) => m.requirementName).join(', ')}.`);
      setStep(2);
      return;
    }

    if (!selectedSlot) {
      setError('Please choose an appointment time slot.');
      setStep(3);
      return;
    }

    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await requestService.submitRequest(
        {
          serviceId: service.id,
          purpose: purpose.trim(),
          slotId: selectedSlot.id,
          submittedDataJson: JSON.stringify({
            applicantName: user?.fullName,
            contactNumber: user?.contactNumber,
            address: user?.address,
            additionalNotes: additionalNotes.trim(),
          }),
        },
        selectedFiles
      );

      navigate(`/track/${response.referenceNumber}?submitted=true`);
    } catch (err: any) {
      const errorData = err.response?.data;
      const generalMessage = errorData?.message || 'Failed to submit application. Please review details and try again.';
      setError(generalMessage);

      // Handle backend structured validation errors map
      if (errorData?.errors && typeof errorData.errors === 'object') {
        setFieldErrors(errorData.errors);

        // Smart Step Redirection based on which field failed
        const errorFields = Object.keys(errorData.errors);
        if (errorFields.includes('purpose')) {
          setStep(1);
        } else if (errorFields.includes('files') || errorFields.includes('requirementIds')) {
          setStep(2);
        } else if (errorFields.includes('slotId')) {
          setStep(3);
        }
      } else {
        // Check message keywords to route user intelligently rather than blindly jumping
        const lowerMsg = generalMessage.toLowerCase();
        if (lowerMsg.includes('slot') || lowerMsg.includes('booked') || lowerMsg.includes('capacity')) {
          setStep(3);
          // Refresh slots
          if (selectedDate) {
            appointmentService.getAvailableSlots(selectedDate).then(setSlots).catch(() => { });
          }
        } else if (lowerMsg.includes('document') || lowerMsg.includes('file') || lowerMsg.includes('requirement')) {
          setStep(2);
        } else if (lowerMsg.includes('purpose')) {
          setStep(1);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Loading application details..." />
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Service not found</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            The requested document service could not be located or is inactive.
          </p>
          <Link to="/services" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <Button variant="primary">Return to Services Catalog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const missingRequirements = getMissingMandatoryRequirements();
  const isWeekendSelected = (() => {
    const day = new Date(selectedDate + 'T00:00:00').getDay();
    return day === 0 || day === 6;
  })();

  return (
    <Layout>
      <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Header Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/services"
            style={{
              color: '#1E4E8C',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginBottom: '0.5rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Services Catalog
          </Link>
          <h1 style={{ fontSize: '1.85rem', color: '#1F2933', fontWeight: 800 }}>
            Application for {service.name}
          </h1>
          <p style={{ color: '#616E7C', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Barangay Fee: <strong>{formatCurrency(service.fee)}</strong> • Processing Time:{' '}
            <strong>{service.estimatedProcessingDays} business day(s)</strong>
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="apply-stepper-container" style={{ marginBottom: '1.5rem' }}>
          {[
            { num: 1, label: 'Applicant Details' },
            { num: 2, label: 'Document Uploads' },
            { num: 3, label: 'Appointment Slot' },
            { num: 4, label: 'Review & Submit' },
          ].map((item) => {
            const isActive = step === item.num;
            const isCompleted = step > item.num;
            return (
              <div
                key={item.num}
                className={`step-item ${isActive ? 'step-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  opacity: step >= item.num ? 1 : 0.45,
                  color: isActive ? '#1E4E8C' : isCompleted ? '#2E8B57' : '#616E7C',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#1E4E8C' : isCompleted ? '#2E8B57' : '#DDE3EA',
                    color: step >= item.num ? '#ffffff' : '#616E7C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? '✓' : item.num}
                </div>
                <span className="step-label" style={{ whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Submission Notice</div>
              <div>{error}</div>
              {Object.keys(fieldErrors).length > 0 && (
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
                  {Object.entries(fieldErrors).map(([field, msg]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
            >
              <X size={16} />
            </button>
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
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.65rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <div><strong>Name:</strong> {user?.fullName || 'N/A'}</div>
                  <div><strong>Contact:</strong> {user?.contactNumber || 'N/A'}</div>
                  <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
                  <div><strong>Address:</strong> {user?.address || 'N/A'}, {user?.barangay || 'Cansojong'}</div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2933' }}>
                    Purpose of Request <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: purpose.length > 500 ? '#dc2626' : '#64748b' }}>
                    {purpose.length}/500 chars (min. 5)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Local Employment, Bank Account Opening, Scholarship Application"
                  value={purpose}
                  onChange={(e) => {
                    setPurpose(e.target.value);
                    if (!purposeTouched) setPurposeTouched(true);
                  }}
                  onBlur={() => setPurposeTouched(true)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: `1.5px solid ${purposeTouched && !isPurposeValid ? '#dc2626' : '#cbd5e1'
                      }`,
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                {purposeTouched && !isPurposeValid && (
                  <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} /> {getPurposeError()}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1F2933' }}>
                  Additional Notes or Specific Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide any additional specifics or details regarding this request (e.g. company name, school name)"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button
                  variant="primary"
                  disabled={!isPurposeValid}
                  onClick={handleProceedToStep2}
                  style={{ width: 'auto' }}
                  className="mobile-full-width"
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
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.85rem',
                  color: '#475569',
                }}
              >
                <strong>Upload Guidelines:</strong> Clear photos or scanned copies in{' '}
                <strong>JPG, PNG, WEBP, or PDF</strong> format. Maximum file size is{' '}
                <strong>5 MB</strong> per document. Mandatory requirements are marked with{' '}
                <span style={{ color: '#dc2626', fontWeight: 700 }}>*</span>.
              </div>

              {attemptedStep2Submit && missingRequirements.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: '#b91c1c',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={18} />
                  <span>
                    Please attach all mandatory documents to continue. Missing (
                    {missingRequirements.length}):{' '}
                    <strong>{missingRequirements.map((r) => r.requirementName).join(', ')}</strong>
                  </span>
                </div>
              )}

              {service.requirements.map((req) => {
                const attached = selectedFiles.find((f) => f.requirementId === req.id);
                const fileError = fileErrors[req.id];
                const isMissingMandatory = attemptedStep2Submit && req.isMandatory && !attached;

                return (
                  <div
                    key={req.id}
                    style={{
                      border: `1.5px solid ${fileError || isMissingMandatory
                          ? '#f87171'
                          : attached
                            ? '#86efac'
                            : '#e2e8f0'
                        }`,
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: isMissingMandatory ? '#fff5f5' : attached ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2933' }}>
                        {req.requirementName}
                        {req.isMandatory && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
                      </span>
                      {attached ? (
                        <span
                          style={{
                            color: '#16a34a',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#dcfce7',
                            padding: '2px 8px',
                            borderRadius: '12px',
                          }}
                        >
                          <CheckCircle2 size={14} /> Ready
                        </span>
                      ) : req.isMandatory ? (
                        <span
                          style={{
                            color: '#dc2626',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: '#fee2e2',
                            padding: '2px 8px',
                            borderRadius: '12px',
                          }}
                        >
                          Mandatory
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Optional</span>
                      )}
                    </div>

                    {req.description && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.65rem' }}>
                        {req.description}
                      </p>
                    )}

                    {attached ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#ffffff',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <FileCheck size={16} color="#16a34a" />
                          <span style={{ fontWeight: 600, color: '#1f2937' }}>{attached.file.name}</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                            ({formatFileSize(attached.file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(req.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.5rem' }}>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                          onChange={(e) => handleFileChange(e, req.id)}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                    )}

                    {fileError && (
                      <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} /> {fileError}
                      </p>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setAttemptedStep2Submit(false);
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleProceedToStep3}
                >
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
                <strong>Scheduling Policy:</strong> Appointments are available on weekdays only.
                Slot reservation occurs atomically upon final submission.
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
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                  }}
                />
                {isWeekendSelected && (
                  <p style={{ color: '#d97706', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} /> The barangay hall is closed on weekends. Please select a weekday (Monday–Friday).
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Available Time Slots:
                </label>

                {loadingSlots ? (
                  <LoadingSpinner message="Checking available slots..." />
                ) : slots.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                    No appointment slots are available for {selectedDate}. Please select another weekday.
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
                            if (hasCapacity) {
                              setSelectedSlot(s);
                              setError(null);
                            }
                          }}
                          style={{
                            border: `2px solid ${isSelected ? '#1E4E8C' : hasCapacity ? '#DDE3EA' : '#f1f5f9'
                              }`,
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
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: hasCapacity ? '#2E8B57' : '#D64545',
                              marginTop: '0.25rem',
                              fontWeight: 600,
                            }}
                          >
                            {hasCapacity ? `${s.remainingCapacity} slots remaining` : 'Fully Booked'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedSlot}
                  onClick={handleProceedToStep4}
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
                <h4 style={{ fontSize: '1rem', color: '#1E4E8C', marginBottom: '0.75rem', fontWeight: 700 }}>
                  Application Summary
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#1F2933' }}>
                  <div><strong>Document Service:</strong> {service.name}</div>
                  <div><strong>Applicant Name:</strong> {user?.fullName} ({user?.contactNumber || 'No contact provided'})</div>
                  <div><strong>Registered Address:</strong> {user?.address || 'N/A'}, {user?.barangay || 'Cansojong'}</div>
                  <div><strong>Purpose:</strong> {purpose}</div>
                  {additionalNotes && <div><strong>Notes:</strong> {additionalNotes}</div>}
                  <div><strong>Document Processing Fee:</strong> {formatCurrency(service.fee)}</div>
                  <div><strong>Attached Supporting Files:</strong> {selectedFiles.length} file(s) verified</div>
                </div>
              </div>

              {selectedSlot && (
                <div style={{ backgroundColor: '#eff5fc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bcd5f0' }}>
                  <h4 style={{ fontSize: '1rem', color: '#1E4E8C', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                    <Calendar size={18} /> Reserved Barangay Office Appointment
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: '#1F2933' }}>
                    <strong>Date & Time:</strong> {selectedSlot.slotDate} ({formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)})
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#616E7C', marginTop: '0.35rem' }}>
                    Please bring original copies of your supporting requirements and payment for the fee upon visit.
                  </p>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <Button variant="outline" onClick={() => setStep(3)} disabled={submitting}>
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
