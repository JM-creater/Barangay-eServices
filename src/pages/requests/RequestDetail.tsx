import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { requestService } from '../../services/requestService';
import { appointmentService } from '../../services/appointmentService';
import { DocumentRequest } from '../../types/Request';
import { AppointmentSlot } from '../../types/Appointment';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { RequestDetailSkeleton } from '../../components/skeletons';
import { formatCurrency, formatDateTime, formatDate, formatTime } from '../../utils/formatters';
import { BARANGAY_INFO } from '../../utils/constants';
import {
  ArrowLeft,
  Calendar,
  FileText,
  AlertCircle,
  Printer,
  XCircle,
  Upload,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PrintSlipModal } from '../../components/requests/PrintSlipModal';
import { getFileDownloadUrl } from '../../utils/fileUrl';
import { aiService, AiPredictionResponse } from '../../services/aiService';
import { AiPredictionBadge } from '../../components/ai/AiPredictionBadge';
import { triggerBarangayAi } from '../../components/ai/BarangayAiAssistant';
import { Sparkles } from 'lucide-react';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<AiPredictionResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Correction Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [resubmitFiles, setResubmitFiles] = useState<{ file: File; requirementId?: number }[]>([]);
  const [resubmitting, setResubmitting] = useState(false);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
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

  // Print Slip Modal State
  const [showPrintSlipModal, setShowPrintSlipModal] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setAiPrediction(null);
    try {
      const data = await requestService.getRequestById(parseInt(id, 10));
      setRequest(data);
      if (data) {
        setAiLoading(true);
        aiService
          .predictTurnaround({
            serviceId: data.service.id,
            serviceCode: data.service.serviceCode,
            purpose: data.purpose,
            submittedDocsCount: data.files?.length || 0,
            requiredDocsCount: data.service.requirements?.filter((r) => r.isMandatory).length || 1,
          })
          .then((pred) => setAiPrediction(pred))
          .catch(() => {})
          .finally(() => setAiLoading(false));
      }
    } catch {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (showRescheduleModal && rescheduleDate) {
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
  }, [showRescheduleModal, rescheduleDate]);

  const handleOpenReschedule = () => {
    setRescheduleError(null);
    setRescheduleReason('');
    setNewSlotId(null);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!request || !newSlotId) return;
    setRescheduling(true);
    setRescheduleError(null);
    try {
      const updated = await requestService.rescheduleRequest(request.id, newSlotId, rescheduleReason);
      setRequest(updated);
      setShowRescheduleModal(false);
    } catch (err: any) {
      setRescheduleError(
        err.response?.data?.message || 'Failed to reschedule appointment. The selected slot may be full.'
      );
    } finally {
      setRescheduling(false);
    }
  };

  const handleResubmit = async () => {
    if (!request) return;
    setResubmitting(true);
    try {
      await requestService.resubmitCorrections(
        request.id,
        { remarks: correctionRemarks },
        resubmitFiles
      );
      setShowCorrectionModal(false);
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resubmit corrections');
    } finally {
      setResubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!request) return;
    setCancelling(true);
    try {
      await requestService.cancelRequest(request.id, cancelReason);
      setShowCancelModal(false);
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel application');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    setShowPrintSlipModal(true);
  };

  if (loading) return <Layout showSidebar><RequestDetailSkeleton /></Layout>;
  if (!request) return <Layout showSidebar><div style={{ textAlign: 'center', padding: '3rem' }}>Application not found.</div></Layout>;

  return (
    <Layout showSidebar>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <Link to="/my-requests" style={{ color: '#1E4E8C', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16} /> Back to My Requests
            </Link>
            <h1 style={{ fontSize: '1.75rem', color: '#1F2933', marginTop: '0.25rem' }}>
              Application: {request.referenceNumber}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={16} /> Print Slip
            </Button>
            {request.currentStatus !== 'RELEASED' && request.currentStatus !== 'CANCELLED' && request.currentStatus !== 'REJECTED' && (
              <Button variant="danger" size="sm" onClick={() => setShowCancelModal(true)}>
                <XCircle size={16} /> Cancel Request
              </Button>
            )}
          </div>
        </div>

        {/* Needs Correction Banner */}
        {request.currentStatus === 'NEEDS_CORRECTION' && (
          <div
            style={{
              backgroundColor: '#fef9e8',
              border: '2px solid #F2B600',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ color: '#9e7500', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={20} color="#F2B600" /> Corrections Requested
              </h3>
              <p style={{ color: '#78350f', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {request.correctionNotes}
              </p>
            </div>
            <Button
              variant="primary"
              style={{ backgroundColor: '#F2B600', color: '#0F2A4A', fontWeight: 700 }}
              onClick={() => setShowCorrectionModal(true)}
            >
              Upload Corrected Files
            </Button>
          </div>
        )}

        {/* Application Overview Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #DDE3EA', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#616E7C', textTransform: 'uppercase' }}>
                  Document Requested
                </span>
                <h2 style={{ fontSize: '1.4rem', color: '#1E4E8C' }}>{request.service.name}</h2>
                <div style={{ fontSize: '0.85rem', color: '#1F2933' }}>
                  Fee: <strong>{formatCurrency(request.service.fee)}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <Badge status={request.currentStatus} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Submitted: {formatDateTime(request.createdAt)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Purpose</span>
                <div style={{ fontWeight: 600 }}>{request.purpose}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Applicant Name</span>
                <div style={{ fontWeight: 600 }}>{request.resident.fullName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Contact Number</span>
                <div style={{ fontWeight: 600 }}>{request.resident.contactNumber}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Resident Address</span>
                <div style={{ fontWeight: 600 }}>{request.resident.address}</div>
              </div>
            </div>
          </Card>

          {/* AI Turnaround & Readiness Assessment */}
          <AiPredictionBadge prediction={aiPrediction} loading={aiLoading} />

          {/* AI Citizen Assistant Prompt Callout */}
          <div className="ai-banner-callout">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#1E4E8C',
                  color: '#F2B600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0F2A4A' }}>
                  Need help preparing for this document?
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                  Ask our in-house trained Barangay AI about physical requirements, fee payment, or release schedules.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              style={{ backgroundColor: '#1E4E8C' }}
              onClick={() =>
                triggerBarangayAi(
                  `What do I need to bring for my ${request.service.name} application (Ref: ${request.referenceNumber})?`,
                  {
                    page: 'request_detail',
                    referenceNumber: request.referenceNumber,
                    serviceCode: request.service?.serviceCode,
                  }
                )
              }
            >
              Ask Barangay AI
            </Button>
          </div>

          {/* Appointment Information */}
          {request.appointment && (
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="#1E4E8C" /> Appointment Details
                </span>
              }
            >
              <div className="grid-2">
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>Appointment Status</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1F2933' }}>
                    {request.appointment.status}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#616E7C', marginTop: '0.75rem' }}>
                    Date and Time Slot
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E4E8C' }}>
                    {formatDate(request.appointment.appointmentDate)} • {formatTime(request.appointment.appointmentTime)}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#616E7C', marginTop: '0.75rem' }}>
                    Barangay Office Location
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#1F2933' }}>
                    {BARANGAY_INFO.fullLocation}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F5F7FA', padding: '1rem', borderRadius: '8px', border: '1px solid #DDE3EA', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#1F2933' }}>Office Appearance Instructions:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', lineHeight: 1.6, color: '#616E7C' }}>
                    <li>Present 1 original valid government-issued photo ID.</li>
                    <li>Bring physical copies of your uploaded requirements.</li>
                    <li>Pay fee of <strong>{formatCurrency(request.service.fee)}</strong> at the cashier.</li>
                    <li>Reference Number: <strong>{request.referenceNumber}</strong>.</li>
                  </ul>
                </div>
              </div>

              {request.appointment &&
                request.appointment.status !== 'ATTENDED' &&
                request.currentStatus !== 'RELEASED' &&
                request.currentStatus !== 'CANCELLED' &&
                request.currentStatus !== 'REJECTED' && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #DDE3EA',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: '#616E7C' }}>
                      Need to change your appointment date or time window?
                    </span>
                    <Button variant="outline" size="sm" onClick={handleOpenReschedule}>
                      <Calendar size={15} /> Reschedule Appointment
                    </Button>
                  </div>
                )}
            </Card>
          )}

          {/* Uploaded Files */}
          <Card title={`Uploaded Attachments (${request.files.length})`}>
            {request.files.length === 0 ? (
              <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>No attachments uploaded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {request.files.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      border: '1px solid #DDE3EA',
                      borderRadius: '8px',
                      backgroundColor: '#F5F7FA',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <FileText size={20} color="#1E4E8C" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2933' }}>{file.originalFileName}</div>
                        {file.requirementName && (
                          <div style={{ fontSize: '0.75rem', color: '#616E7C' }}>
                            Requirement: {file.requirementName}
                          </div>
                        )}
                      </div>
                    </div>
                    <a
                      href={getFileDownloadUrl(file.storedFileName, file.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        View / Download
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity Timeline */}
          <Card title="Application Activity Log">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {request.history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    borderLeft: '2px solid #1E4E8C',
                    paddingLeft: '1rem',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2933' }}>
                      {h.newStatus}
                    </span>
                    {h.changedByName && (
                      <span style={{ fontSize: '0.8rem', color: '#616E7C' }}>by {h.changedByName}</span>
                    )}
                  </div>
                  {h.remarks && <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>{h.remarks}</p>}
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {formatDateTime(h.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Resubmit Corrections Modal */}
        <Modal
          isOpen={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          title="Resubmit Requested Corrections"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#fffbeb', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.85rem', color: '#92400e' }}>
              <strong>Staff instructions:</strong> {request.correctionNotes}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Your Notes / Clarification
              </label>
              <textarea
                rows={3}
                placeholder="Explain the changes or corrections made..."
                value={correctionRemarks}
                onChange={(e) => setCorrectionRemarks(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Attach Updated Supporting Document(s)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files).map((file) => ({ file }));
                    setResubmitFiles(newFiles);
                  }
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowCorrectionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={resubmitting} onClick={handleResubmit}>
                Submit Corrections
              </Button>
            </div>
          </div>
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Application"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>
              Are you sure you want to cancel this application? Your reserved appointment slot will be released back to other residents.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Reason for cancellation
              </label>
              <input
                type="text"
                placeholder="e.g. No longer needed, duplicate request"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
                Go Back
              </Button>
              <Button variant="danger" isLoading={cancelling} onClick={handleCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reschedule Appointment Modal */}
        <Modal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          title="Reschedule Appointment"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rescheduleError && (
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
                <AlertCircle size={18} /> {rescheduleError}
              </div>
            )}

            {request.appointment && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: '#166534', fontWeight: 600 }}>Current Schedule: </span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  {formatDate(request.appointment.appointmentDate)} • {formatTime(request.appointment.appointmentTime)}
                </span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Select New Date
              </label>
              <input
                type="date"
                value={rescheduleDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Available Time Slots
              </label>
              {loadingSlots ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Checking available slots...</p>
              ) : availableSlots.length === 0 ? (
                <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                  No available slots on this date (office may be closed or slots are full).
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
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
                          backgroundColor: isSelected ? '#eff5fc' : hasCapacity ? '#ffffff' : '#f8fafc',
                          borderRadius: '8px',
                          padding: '0.6rem',
                          cursor: hasCapacity ? 'pointer' : 'not-allowed',
                          opacity: hasCapacity ? 1 : 0.45,
                          textAlign: 'center',
                          transition: 'all 0.15s ease-in-out',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#1E4E8C' : '#1F2933' }}>
                          {formatTime(s.startTime)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: hasCapacity ? '#2E8B57' : '#D64545', fontWeight: 600 }}>
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
                Reason for Rescheduling (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Conflict with work schedule, urgent personal matter"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowRescheduleModal(false)}>
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
        </Modal>

        {/* Official Transaction & Appointment Slip Modal */}
        <PrintSlipModal
          isOpen={showPrintSlipModal}
          onClose={() => setShowPrintSlipModal(false)}
          request={request}
        />
      </div>
    </Layout>
  );
};
