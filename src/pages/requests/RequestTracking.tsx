import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { requestService } from '../../services/requestService';
import { DocumentRequest } from '../../types/Request';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RequestTrackingSkeleton } from '../../components/skeletons';
import { formatCurrency, formatDateTime, formatDate, formatTime } from '../../utils/formatters';
import { BARANGAY_INFO, REQUEST_STATUS_CONFIG } from '../../utils/constants';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  Printer,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { PrintSlipModal } from '../../components/requests/PrintSlipModal';
import { getFileDownloadUrl } from '../../utils/fileUrl';
import { aiService, AiPredictionResponse } from '../../services/aiService';
import { AiPredictionBadge } from '../../components/ai/AiPredictionBadge';
import { triggerBarangayAi } from '../../components/ai/BarangayAiAssistant';
import { Sparkles } from 'lucide-react';

export const RequestTracking: React.FC = () => {
  const { referenceNumber } = useParams<{ referenceNumber?: string }>();
  const [searchInput, setSearchInput] = useState(referenceNumber || '');
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrintSlipModal, setShowPrintSlipModal] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<AiPredictionResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isJustSubmitted = new URLSearchParams(location.search).get('submitted') === 'true';

  const fetchRequest = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError(null);
    setAiPrediction(null);
    try {
      const data = await requestService.trackRequest(ref.trim());
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
      setError('No application found with reference number "' + ref + '". Please check and try again.');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (referenceNumber) {
      fetchRequest(referenceNumber);
    }
  }, [referenceNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${encodeURIComponent(searchInput.trim().toUpperCase())}`);
    }
  };

  // Status Stepper definition
  const steps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PROCESSING', label: 'In-Person & Processing' },
    { key: 'READY_FOR_RELEASE', label: 'Ready for Release' },
    { key: 'RELEASED', label: 'Released' },
  ];

  const getStepStatus = (stepKey: string, current: string) => {
    const order = ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'PROCESSING', 'READY_FOR_RELEASE', 'RELEASED'];
    const currIdx = order.indexOf(current);
    const stepIdx = order.indexOf(stepKey);

    if (current === 'NEEDS_CORRECTION') {
      if (stepKey === 'SUBMITTED') return 'complete';
      if (stepKey === 'UNDER_REVIEW') return 'warning';
      return 'pending';
    }
    if (current === 'REJECTED' || current === 'CANCELLED') {
      if (stepKey === 'SUBMITTED') return 'complete';
      return 'error';
    }

    if (currIdx >= stepIdx) return 'complete';
    return 'pending';
  };

  return (
    <Layout>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a' }}>Track Application Status</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Check the real-time progress of your barangay certificate or clearance
          </p>

          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              gap: '0.5rem',
              maxWidth: '500px',
              margin: '1.5rem auto 0',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="e.g. BC-2026-A1B2C3"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ fontWeight: 600, textTransform: 'uppercase', flex: '1 1 200px' }}
            />
            <Button type="submit" variant="primary" style={{ flexShrink: 0 }}>
              <Search size={18} /> Track
            </Button>
          </form>
        </div>

        {isJustSubmitted && (
          <div
            style={{
              backgroundColor: 'rgba(46, 139, 87, 0.08)',
              border: '1px solid rgba(46, 139, 87, 0.3)',
              borderRadius: '12px',
              padding: '1.25rem',
              color: '#1F2933',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <CheckCircle2 size={24} color="#2E8B57" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2E8B57' }}>Application Successfully Submitted!</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                Your appointment slot is reserved atomically. Please save your reference number:{' '}
                <strong>{referenceNumber}</strong>. An email confirmation has been dispatched to your registered email address. You may track this page anytime.
              </p>
            </div>
          </div>
        )}

        {loading && <RequestTrackingSkeleton />}

        {error && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 600 }}>{error}</p>
            </div>
          </Card>
        )}

        {request && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Main Status Header Card */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    REFERENCE NUMBER
                  </span>
                  <h2 style={{ fontSize: '1.6rem', color: '#1E4E8C', letterSpacing: '0.03em', fontWeight: 700 }}>
                    {request.referenceNumber}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#616E7C', marginTop: '0.2rem' }}>
                    Submitted on: {formatDateTime(request.createdAt)}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <div>
                    <Badge status={request.currentStatus} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>
                    {REQUEST_STATUS_CONFIG[request.currentStatus]?.desc}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPrintSlipModal(true)} style={{ marginTop: '0.25rem' }}>
                    <Printer size={15} /> Print Transaction Slip
                  </Button>
                </div>
              </div>

              {/* Progress Flow */}
              <div className="tracking-stepper-wrapper">
                <div className="tracking-stepper-inner">
                  {steps.map((st) => {
                    const status = getStepStatus(st.key, request.currentStatus);
                    const isDone = status === 'complete';
                    const isWarn = status === 'warning';
                    const isErr = status === 'error';

                    return (
                      <div
                        key={st.key}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          textAlign: 'center',
                          minWidth: '80px',
                          padding: '0 4px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isDone ? '#2E8B57' : isWarn ? '#F2B600' : isErr ? '#D64545' : '#DDE3EA',
                            color: isDone || isErr ? '#fff' : isWarn ? '#0F2A4A' : '#616E7C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            zIndex: 2,
                            flexShrink: 0,
                          }}
                        >
                          {isDone ? '✓' : isWarn ? '!' : isErr ? '✕' : ''}
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            lineHeight: 1.25,
                            color: isDone ? '#2E8B57' : isWarn ? '#b48400' : isErr ? '#D64545' : '#616E7C',
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
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
                    Have questions about this application?
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                    Our in-house trained Barangay AI can explain required physical originals, fees, or pickup procedures.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                style={{ backgroundColor: '#1E4E8C' }}
                onClick={() =>
                  triggerBarangayAi(
                    `What is the status and requirements for my application ${request.referenceNumber}?`,
                    { page: 'tracking', referenceNumber: request.referenceNumber }
                  )
                }
              >
                Ask Barangay AI
              </Button>
            </div>

            {/* NEEDS CORRECTION ALERT */}
            {request.currentStatus === 'NEEDS_CORRECTION' && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '2px solid #F2B600',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ color: '#875a00', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  <AlertCircle size={22} color="#F2B600" /> Corrections Requested by Staff
                </h3>
                <p style={{ color: '#1F2933', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {request.correctionNotes || 'Please update your application or upload clearer documents.'}
                </p>
                <Link to={`/requests/${request.id}`}>
                  <Button variant="accent">
                    Resubmit Corrections Now <ExternalLink size={16} />
                  </Button>
                </Link>
              </div>
            )}

            {/* REJECTION ALERT */}
            {request.currentStatus === 'REJECTED' && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '2px solid #D64545',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ color: '#D64545', fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Application Not Approved
                </h3>
                <p style={{ color: '#1F2933', fontSize: '0.925rem' }}>
                  Reason: <strong>{request.rejectionReason}</strong>
                </p>
                <p style={{ color: '#D64545', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  The reserved appointment slot has been returned to available capacity.
                </p>
              </div>
            )}

            {/* Appointment Slip Card */}
            {request.appointment && (
              <Card
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} color="#1E4E8C" /> Scheduled Office Appointment
                  </span>
                }
              >
                <div className="grid-2">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>Appointment Status</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1F2933' }}>
                      {request.appointment.status}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#616E7C', marginTop: '0.75rem' }}>Appointment Date & Time</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E4E8C' }}>
                      {formatDate(request.appointment.appointmentDate)} • {formatTime(request.appointment.appointmentTime)}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>Location</div>
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                      {BARANGAY_INFO.fullLocation}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                      What to bring during your visit:
                    </div>
                    <ul style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
                      <li>Original Valid Government ID for identity verification</li>
                      <li>Original supporting documents specified in the requirements</li>
                      <li>Exact fee amount in cash: <strong>{formatCurrency(request.service.fee)}</strong></li>
                      <li>This Reference Number: <strong>{request.referenceNumber}</strong></li>
                    </ul>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Need a physical copy of your appointment voucher?
                  </span>
                  <Button variant="primary" size="sm" onClick={() => setShowPrintSlipModal(true)}>
                    <Printer size={15} /> Print Appointment Slip
                  </Button>
                </div>
              </Card>
            )}

            {/* Request Summary */}
            <Card title="Application Details">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Requested Document</span>
                  <div style={{ fontWeight: 600 }}>{request.service.name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Applicant Name</span>
                  <div style={{ fontWeight: 600 }}>{request.resident.fullName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Purpose</span>
                  <div style={{ fontWeight: 600 }}>{request.purpose}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Applicable Fee</span>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(request.service.fee)}</div>
                </div>
              </div>

              {/* Uploaded Files */}
              {request.files && request.files.length > 0 && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Uploaded Supporting Files ({request.files.length}):
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {request.files.map((f) => (
                      <a
                        key={f.id}
                        href={getFileDownloadUrl(f.storedFileName, f.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          backgroundColor: '#f8fafc',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#1E4E8C',
                          border: '1px solid #DDE3EA',
                        }}
                      >
                        <FileText size={14} /> {f.originalFileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Application Timeline / Audit History */}
            {request.history && request.history.length > 0 && (
              <Card title="Activity & Status History">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {request.history.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        fontSize: '0.85rem',
                        borderLeft: '2px solid #DDE3EA',
                        paddingLeft: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{h.newStatus}</span>
                          {h.changedByName && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>by {h.changedByName}</span>
                          )}
                        </div>
                        {h.remarks && <p style={{ color: '#475569', marginTop: '0.15rem' }}>{h.remarks}</p>}
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {formatDateTime(h.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Official Transaction & Appointment Slip Modal */}
        {showPrintSlipModal && (
          <PrintSlipModal
            isOpen={showPrintSlipModal}
            onClose={() => setShowPrintSlipModal(false)}
            request={request}
          />
        )}
      </div>
    </Layout>
  );
};
