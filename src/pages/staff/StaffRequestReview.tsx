import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { requestService } from '../../services/requestService';
import { processingService } from '../../services/processingService';
import { DocumentRequest } from '../../types/Request';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StaffRequestReviewSkeleton, DocumentPreviewSkeleton } from '../../components/skeletons';
import { formatCurrency, formatDateTime, formatDate, formatTime } from '../../utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Calendar,
  FileText,
  User,
  ShieldCheck,
  Receipt,
  PenTool,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { DocumentPreview } from '../../types/Request';
import { getFileDownloadUrl } from '../../utils/fileUrl';

export const StaffRequestReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isApprover, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Stage 2: Staff Review Modal
  const [reviewModalType, setReviewModalType] = useState<'ACCEPT' | 'REJECT' | 'REQUEST_CORRECTION' | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');

  // Stage 3: Office In-Person Verification Modal
  const [showInPersonModal, setShowInPersonModal] = useState(false);
  const [requirementsSatisfied, setRequirementsSatisfied] = useState(true);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Stage 3: Official Approve & Sign Modal
  const [showApproveSignModal, setShowApproveSignModal] = useState(false);
  const [approverNotes, setApproverNotes] = useState('');

  // Stage 3: Release Document Modal
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [officialReceiptNumber, setOfficialReceiptNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [documentNumber, setDocumentNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [releaseRemarks, setReleaseRemarks] = useState('');

  // Document Preview / Print State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<DocumentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchRequest = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await requestService.getStaffRequestById(parseInt(id, 10));
      setRequest(data);
      if (data) {
        setPaymentAmount(data.service.fee || 0);
        setRecipientName(data.resident.fullName || '');
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleReviewAction = async () => {
    if (!request || !reviewModalType) return;
    setActionLoading(true);
    try {
      await requestService.reviewRequest(request.id, {
        action: reviewModalType,
        remarks: reviewRemarks,
        rejectionReason: reviewModalType === 'REJECT' ? rejectionReason : undefined,
        correctionNotes: reviewModalType === 'REQUEST_CORRECTION' ? correctionNotes : undefined,
      });
      setReviewModalType(null);
      setReviewRemarks('');
      setRejectionReason('');
      setCorrectionNotes('');
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyInPerson = async () => {
    if (!request) return;
    setActionLoading(true);
    try {
      await processingService.verifyInPerson(request.id, requirementsSatisfied, verificationNotes);
      setShowInPersonModal(false);
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record in-person verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOfficialApprove = async () => {
    if (!request) return;
    setActionLoading(true);
    try {
      await processingService.approveAndSign(request.id, undefined, approverNotes);
      setShowApproveSignModal(false);
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record official approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseDocument = async () => {
    if (!request) return;
    setActionLoading(true);
    try {
      await processingService.releaseDocument(request.id, {
        officialReceiptNumber,
        paymentAmount,
        paymentStatus: paymentAmount > 0 ? 'PAID' : 'EXEMPTED',
        issuedDocumentNumber: documentNumber,
        recipientName,
        remarks: releaseRemarks,
      });
      setShowReleaseModal(false);
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to release document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDocumentPreview = async () => {
    if (!request) return;
    try {
      setPreviewLoading(true);
      setShowPreviewModal(true);
      const data = await processingService.getDocumentPreview(request.id);
      setPreviewData(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load document preview');
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrintCertificate = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch (err) {
        console.warn('Direct iframe print failed, falling back to print window:', err);
      }
    }
    handleOpenPrintWindow();
  };

  const handleOpenPrintWindow = async () => {
    let html = previewData?.renderedHtml;
    if (!html && request) {
      try {
        const preview = await processingService.getDocumentPreview(request.id);
        html = preview.renderedHtml;
      } catch (e) {
        console.error('Failed to fetch preview HTML', e);
      }
    }
    if (!html) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  if (loading) return <Layout showSidebar><StaffRequestReviewSkeleton /></Layout>;
  if (!request) return <Layout showSidebar><div style={{ textAlign: 'center', padding: '3rem' }}>Application not found.</div></Layout>;

  return (
    <Layout showSidebar>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Breadcrumb & Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/staff/requests" style={{ color: '#1E4E8C', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Application Queue
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>
                Review: {request.referenceNumber}
              </h1>
              <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>
                Requested Service: <strong>{request.service.name}</strong> • Submitted by: <strong>{request.resident.fullName}</strong>
              </p>
            </div>
            <Badge status={request.currentStatus} />
          </div>
        </div>

        {/* WORKFLOW ACTION BAR */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '2px solid #1E4E8C',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(30, 78, 140, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#0F2A4A', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <ShieldCheck size={20} color="#1E4E8C" /> Workflow Actions
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#616E7C', marginTop: '0.15rem' }}>
                Current State: <strong>{request.currentStatus}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Stage 2 Review Actions (when SUBMITTED or UNDER_REVIEW or NEEDS_CORRECTION) */}
              {(request.currentStatus === 'SUBMITTED' || request.currentStatus === 'UNDER_REVIEW') && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setReviewModalType('ACCEPT');
                      setReviewRemarks('Documents verified online. Appointment confirmed.');
                    }}
                  >
                    <CheckCircle2 size={16} /> Accept (Confirm Slot)
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    style={{ borderColor: '#F2B600', color: '#b48400', fontWeight: 600 }}
                    onClick={() => {
                      setReviewModalType('REQUEST_CORRECTION');
                      setCorrectionNotes('');
                    }}
                  >
                    <AlertTriangle size={16} /> Request Corrections
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setReviewModalType('REJECT');
                      setRejectionReason('');
                    }}
                  >
                    <XCircle size={16} /> Reject (Release Slot)
                  </Button>
                </>
              )}

              {/* Stage 3 Office In-Person Verification (when ACCEPTED) */}
              {request.currentStatus === 'ACCEPTED' && (
                <Button
                  variant="primary"
                  size="sm"
                  style={{ backgroundColor: '#1E4E8C' }}
                  onClick={() => setShowInPersonModal(true)}
                >
                  <User size={16} /> Verify In-Person & Originals
                </Button>
              )}

              {/* Stage 3 Official Approval & Sign (when PROCESSING) */}
              {request.currentStatus === 'PROCESSING' && (isApprover || isAdmin) && (
                <Button
                  variant="primary"
                  size="sm"
                  style={{ backgroundColor: '#0F2A4A' }}
                  onClick={() => setShowApproveSignModal(true)}
                >
                  <PenTool size={16} /> Official Approve & Sign
                </Button>
              )}

              {/* Stage 3 Document Release (when READY_FOR_RELEASE) */}
              {request.currentStatus === 'READY_FOR_RELEASE' && (
                <Button
                  variant="primary"
                  size="sm"
                  style={{ backgroundColor: '#2E8B57' }}
                  onClick={() => setShowReleaseModal(true)}
                >
                  <Receipt size={16} /> Release Document & Issue O.R.
                </Button>
              )}

              {request.currentStatus === 'RELEASED' && (
                <div style={{ color: '#2E8B57', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={18} /> Document Already Issued & Released
                </div>
              )}

              {/* Preview & Print Certificate */}
              {(request.currentStatus === 'PROCESSING' || request.currentStatus === 'READY_FOR_RELEASE' || request.currentStatus === 'RELEASED') && (
                <Button
                  variant="outline"
                  size="sm"
                  style={{ borderColor: '#1E4E8C', color: '#1E4E8C' }}
                  onClick={handleOpenDocumentPreview}
                >
                  <Printer size={16} /> Preview / Print Certificate
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grids */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Resident Profile & Purpose */}
          <div className="grid-2">
            <Card title="Applicant Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <div><strong>Full Name:</strong> {request.resident.fullName}</div>
                <div><strong>Email:</strong> {request.resident.email}</div>
                <div><strong>Contact Number:</strong> {request.resident.contactNumber}</div>
                <div><strong>Address:</strong> {request.resident.address}</div>
                <div><strong>Barangay / City:</strong> {request.resident.barangay}, {request.resident.city}</div>
              </div>
            </Card>

            <Card title="Application Particulars">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <div><strong>Service:</strong> {request.service.name}</div>
                <div><strong>Purpose:</strong> {request.purpose}</div>
                <div><strong>Fee:</strong> {formatCurrency(request.service.fee)}</div>
                <div><strong>Submitted At:</strong> {formatDateTime(request.createdAt)}</div>
                {request.assignedStaff && (
                  <div><strong>Assigned Reviewer:</strong> {request.assignedStaff.fullName}</div>
                )}
              </div>
            </Card>
          </div>

          {/* Appointment Slot Info */}
          {request.appointment && (
            <Card title="Scheduled Appointment Slot">
              <div className="grid-3" style={{ fontSize: '0.9rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#616E7C' }}>Date</div>
                  <div style={{ fontWeight: 700, color: '#1E4E8C' }}>
                    {formatDate(request.appointment.appointmentDate)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#616E7C' }}>Time Window</div>
                  <div style={{ fontWeight: 700, color: '#1E4E8C' }}>
                    {formatTime(request.appointment.appointmentTime)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#616E7C' }}>Appointment Status</div>
                  <div style={{ fontWeight: 700, color: '#1F2933' }}>
                    {request.appointment.status}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Uploaded Supporting Files */}
          <Card title={`Uploaded Requirements (${request.files.length})`}>
            {request.files.length === 0 ? (
              <p style={{ color: '#616E7C', fontSize: '0.875rem' }}>No attachments uploaded by resident.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
                {request.files.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      border: '1px solid #DDE3EA',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={20} color="#1E4E8C" />
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.originalFileName}
                      </div>
                    </div>
                    {file.requirementName && (
                      <div style={{ fontSize: '0.8rem', color: '#616E7C', marginBottom: '0.75rem' }}>
                        Requirement: <strong>{file.requirementName}</strong>
                      </div>
                    )}
                    <a
                      href={getFileDownloadUrl(file.storedFileName, file.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm" style={{ width: '100%' }}>
                        Inspect Document
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity / Audit History */}
          <Card title="Activity & Status History">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {request.history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    borderLeft: '2px solid #1E4E8C',
                    paddingLeft: '1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>{h.newStatus}</span>
                    {h.changedByName && (
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>by {h.changedByName}</span>
                    )}
                  </div>
                  {h.remarks && <p style={{ color: '#334155', marginTop: '0.2rem' }}>{h.remarks}</p>}
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {formatDateTime(h.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Modal: Stage 2 Review (Accept / Request Correction / Reject) */}
        <Modal
          isOpen={!!reviewModalType}
          onClose={() => setReviewModalType(null)}
          title={
            reviewModalType === 'ACCEPT'
              ? 'Accept Application & Confirm Appointment'
              : reviewModalType === 'REQUEST_CORRECTION'
              ? 'Request Document Corrections'
              : 'Reject Application'
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviewModalType === 'ACCEPT' && (
              <p style={{ fontSize: '0.875rem', color: '#15803d' }}>
                Accepting this application will confirm the resident's appointment slot and automatically notify them
                to appear at the Barangay Hall with original IDs and requirements.
              </p>
            )}

            {reviewModalType === 'REQUEST_CORRECTION' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Specific Corrections Required *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify which uploaded document is blurry, expired, or missing..."
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                />
              </div>
            )}

            {reviewModalType === 'REJECT' && (
              <div>
                <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem' }}>
                  Rejecting will release the reserved appointment capacity back to the slot pool and notify the resident.
                </p>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Reason for disqualification or rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Review Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="Internal notes..."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setReviewModalType(null)}>
                Cancel
              </Button>
              <Button
                variant={reviewModalType === 'REJECT' ? 'danger' : 'primary'}
                isLoading={actionLoading}
                onClick={handleReviewAction}
              >
                Submit Decision
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Stage 3 In-Person Verification */}
        <Modal
          isOpen={showInPersonModal}
          onClose={() => setShowInPersonModal(false)}
          title="In-Person Office Appearance Verification"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              Resident is present at Barangay Hall. Verify original physical IDs and supporting documents.
            </p>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={requirementsSatisfied}
                  onChange={(e) => setRequirementsSatisfied(e.target.checked)}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Original identity and all requirements verified and satisfied
                </span>
              </label>
            </div>

            {!requirementsSatisfied && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Missing / Incomplete Requirements Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Record missing original documents for follow-up..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowInPersonModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={actionLoading} onClick={handleVerifyInPerson}>
                Confirm Verification
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Stage 3 Official Approve & Sign */}
        <Modal
          isOpen={showApproveSignModal}
          onClose={() => setShowApproveSignModal(false)}
          title="Official Approval & Signature"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              As an authorized approver (e.g. Barangay Captain / Secretary), approve and authorize issuance of{' '}
              <strong>{request.service.name}</strong> for <strong>{request.resident.fullName}</strong>.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Approval Notes / Signatory Endorsement
              </label>
              <textarea
                rows={3}
                placeholder="Official notes or remarks..."
                value={approverNotes}
                onChange={(e) => setApproverNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowApproveSignModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={actionLoading} onClick={handleOfficialApprove}>
                Authorize & Sign Document
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Stage 3 Release Document */}
        <Modal
          isOpen={showReleaseModal}
          onClose={() => setShowReleaseModal(false)}
          title="Release Official Document & Issue Receipt"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Payment Amount (PHP)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Official Receipt (O.R.) Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. OR-2026-98765"
                  value={officialReceiptNumber}
                  onChange={(e) => setOfficialReceiptNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Document Control Number (Leave blank to auto-generate)
              </label>
              <input
                type="text"
                placeholder="e.g. DOC-BC-CLEARANCE-2026-0001"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Releasing Remarks
              </label>
              <input
                type="text"
                placeholder="Any releasing remarks or notes..."
                value={releaseRemarks}
                onChange={(e) => setReleaseRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setShowReleaseModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={actionLoading} onClick={handleReleaseDocument}>
                Issue & Complete Release
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Official Document Preview / Print */}
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={`Official Certificate Preview - ${request.referenceNumber}`}
        >
          {previewLoading ? (
            <DocumentPreviewSkeleton />
          ) : previewData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F2A4A' }}>{previewData.serviceName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>
                    Control No: <strong>{previewData.issuedDocumentNumber}</strong> | Signatory: <strong>{previewData.officialApproverName}</strong>
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={handlePrintCertificate}>
                  <Printer size={16} /> Print / Save as PDF
                </Button>
              </div>

              {/* Rendered HTML Document Frame */}
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <iframe
                  ref={iframeRef}
                  title="Document Preview"
                  srcDoc={previewData.renderedHtml}
                  style={{
                    width: '100%',
                    height: 'min(500px, 48vh)',
                    border: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button variant="ghost" onClick={() => setShowPreviewModal(false)}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleOpenPrintWindow}>
                  <Printer size={16} /> Open Print Window
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </Layout>
  );
};
