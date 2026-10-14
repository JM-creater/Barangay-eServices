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
import { ApplyServiceSkeleton, SlotGridSkeleton } from '../../components/skeletons';
import { formatCurrency, formatTime, formatDate } from '../../utils/formatters';
import { validateAttachedFile, formatFileSize } from '../../utils/fileValidation';
import {
  Calendar,
  Clock,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  X,
  FileCheck,
  RefreshCw,
  Sparkles,
  Crop,
  Edit,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import {
  aiService,
  AiPredictionResponse,
  AiVisionVerificationResponse,
} from '../../services/aiService';
import { evaluateImageQuality, EdgeImageQualityResult } from '../../utils/edgeImageQuality';
import { AiPredictionBadge } from '../../components/ai/AiPredictionBadge';
import { AiVisionFeedbackBadge } from '../../components/ai/AiVisionFeedbackBadge';
import { CameraCaptureModal } from '../../components/common/CameraCaptureModal';
import { ImageCropModal, AspectRatioMode } from '../../components/common/ImageCropModal';

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

  // AI Document Vision & Edge Quality State
  const [aiVisionVerifications, setAiVisionVerifications] = useState<
    Record<number, { edge: EdgeImageQualityResult; vision: AiVisionVerificationResponse }>
  >({});
  const [aiAnalyzingFiles, setAiAnalyzingFiles] = useState<Record<number, boolean>>({});

  // Camera Capture Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [activeCameraReqId, setActiveCameraReqId] = useState<number | null>(null);
  const [activeCameraReqName, setActiveCameraReqName] = useState<string>('');
  const [activeCameraGuideMode, setActiveCameraGuideMode] = useState<'card' | 'portrait_square' | 'general'>('card');

  // Interactive Image Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetFile, setCropTargetFile] = useState<File | null>(null);
  const [cropTargetReqId, setCropTargetReqId] = useState<number | null>(null);
  const [cropInitialMode, setCropInitialMode] = useState<AspectRatioMode>('card');
  const [cropModalTitle, setCropModalTitle] = useState<string>('Crop Document');

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

  // AI Prediction State
  const [aiPrediction, setAiPrediction] = useState<AiPredictionResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (service && purpose.trim().length >= 3) {
      setAiLoading(true);
      aiService
        .predictTurnaround({
          serviceId: service.id,
          serviceCode: service.serviceCode,
          purpose: purpose.trim(),
          submittedDocsCount: selectedFiles.length,
          requiredDocsCount: service.requirements?.filter((r) => r.isMandatory).length || 1,
        })
        .then((res) => setAiPrediction(res))
        .catch(() => {})
        .finally(() => setAiLoading(false));
    }
  }, [service, purpose, selectedFiles.length]);

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

  // Core Requirement File Processor (Used by both File Input & Camera Capture)
  const attachRequirementFile = async (file: File, reqId: number) => {
    setError(null);
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

    // Execute AI Edge Quality & Neural Document Vision Inspection for image uploads
    if (file.type.startsWith('image/')) {
      setAiAnalyzingFiles((prev) => ({ ...prev, [reqId]: true }));
      try {
        // Tier 1: Client Edge Canvas Quality Analysis (< 5ms)
        const edgeRes = await evaluateImageQuality(file);

        // Tier 2: Server In-Memory ONNX Document Vision (< 15ms)
        const visionRes = await aiService.verifyDocumentVision(file);

        setAiVisionVerifications((prev) => ({
          ...prev,
          [reqId]: { edge: edgeRes, vision: visionRes },
        }));
      } catch {
        // Non-blocking fallback: allow citizen to continue even if vision service is unreachable
      } finally {
        setAiAnalyzingFiles((prev) => ({ ...prev, [reqId]: false }));
      }
    }
  };

  // File Upload Handler with Security Validation, Optional Crop & AI Vision Inspection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, reqId: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const req = service?.requirements.find((r) => r.id === reqId);
      const reqName = req?.requirementName || 'Document';
      const nameLower = reqName.toLowerCase();
      const isSquareReq =
        nameLower.includes('2x2') ||
        nameLower.includes('square') ||
        nameLower.includes('portrait') ||
        nameLower.includes('photo');

      if (file.type.startsWith('image/')) {
        setCropTargetFile(file);
        setCropTargetReqId(reqId);
        setCropInitialMode(isSquareReq ? 'square' : 'card');
        setCropModalTitle(`Crop & Frame: ${reqName}`);
        setCropModalOpen(true);
      } else {
        await attachRequirementFile(file, reqId);
      }
    }
    // Reset file input value so re-selecting the same file fires change event
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (cropTargetReqId !== null) {
      await attachRequirementFile(croppedFile, cropTargetReqId);
      setCropModalOpen(false);
      setCropTargetFile(null);
      setCropTargetReqId(null);
    }
  };

  const handleOpenRequirementCamera = (req: Requirement) => {
    setActiveCameraReqId(req.id);
    setActiveCameraReqName(req.requirementName);
    const nameLower = req.requirementName.toLowerCase();
    if (nameLower.includes('2x2') || nameLower.includes('portrait') || nameLower.includes('photo')) {
      setActiveCameraGuideMode('portrait_square');
    } else {
      setActiveCameraGuideMode('card');
    }
    setCameraModalOpen(true);
  };

  const handleCameraCapture = (file: File) => {
    if (activeCameraReqId !== null) {
      attachRequirementFile(file, activeCameraReqId);
    }
  };

  const handleRemoveFile = (reqId: number) => {
    setSelectedFiles((prev) => prev.filter((item) => item.requirementId !== reqId));
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[reqId];
      return next;
    });
    setAiVisionVerifications((prev) => {
      const next = { ...prev };
      delete next[reqId];
      return next;
    });
    setAiAnalyzingFiles((prev) => {
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

    // Check if any file is still being scanned by AI
    const isScanning = selectedFiles.some((sf) => aiAnalyzingFiles[sf.requirementId]);
    if (isScanning) {
      setError('Please wait a moment while the system finishes verifying your uploaded documents...');
      return;
    }

    // Validate AI Vision & Edge Quality (Strictly block invalid or blurry photos)
    for (const sf of selectedFiles) {
      const verification = aiVisionVerifications[sf.requirementId];
      const reqItem = service?.requirements.find((r) => r.id === sf.requirementId);
      const reqName = reqItem?.requirementName || 'Uploaded document';

      if (verification) {
        const { edge, vision } = verification;
        const isBlurry = edge.isBlurry || !vision.sharp || edge.qualityBadge === 'POOR';
        const isInvalid = !vision.validDocument || vision.detectedClass === 'invalid_non_id';

        if (isBlurry) {
          setError(
            `Cannot proceed: The photo attached for "${reqName}" is too blurry or unfocused to read. Please re-take or upload a clearer, well-lit photo.`
          );
          return;
        }

        if (isInvalid) {
          setError(
            `Cannot proceed: The document attached for "${reqName}" was not recognized as a valid Philippine government ID or official 2x2 photo. Please replace it with an official document.`
          );
          return;
        }

        // Check if requirement specifically requires a square 2x2 photo
        const reqNameLower = reqName.toLowerCase();
        const isSquareReq = (
          reqNameLower.includes('2x2') ||
          reqNameLower.includes('square') ||
          reqNameLower.includes('portrait') ||
          reqNameLower.includes('picture')
        );

        if (isSquareReq && !vision.twoByTwo && vision.aspectRatio > 1.35) {
          setError(
            `Cannot proceed: "${reqName}" requires a square 2x2 photo (1:1 format). Please tap 'Adjust Crop' to crop it into a 2x2 photo.`
          );
          return;
        }
      }
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
        <ApplyServiceSkeleton />
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
              <AiPredictionBadge prediction={aiPrediction} loading={aiLoading} />

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
                const reqVerification = aiVisionVerifications[req.id];
                const isBlurry = Boolean(
                  reqVerification &&
                  (reqVerification.edge.isBlurry || !reqVerification.vision.sharp || reqVerification.edge.qualityBadge === 'POOR')
                );
                const isInvalid = Boolean(
                  reqVerification &&
                  (!reqVerification.vision.validDocument || reqVerification.vision.detectedClass === 'invalid_non_id')
                );
                const hasQualityIssue = isBlurry || isInvalid;
                const hasError = fileError || isMissingMandatory || hasQualityIssue;

                return (
                  <div
                    key={req.id}
                    style={{
                      border: `1.5px solid ${
                        hasError
                          ? '#f87171'
                          : attached
                            ? '#86efac'
                            : '#e2e8f0'
                      }`,
                      borderRadius: '10px',
                      padding: 'clamp(0.85rem, 2.5vw, 1.15rem)',
                      backgroundColor: hasError ? '#fff5f5' : attached ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.15s ease',
                      boxShadow: hasError ? '0 1px 3px rgba(239, 68, 68, 0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2933' }}>
                        {req.requirementName}
                        {req.isMandatory && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
                      </span>
                      {attached ? (
                        hasQualityIssue ? (
                          <span
                            style={{
                              color: '#dc2626',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#fee2e2',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #fca5a5',
                            }}
                          >
                            <AlertCircle size={13} /> Action Required
                          </span>
                        ) : (
                          <span
                            style={{
                              color: '#16a34a',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #86efac',
                            }}
                          >
                            <CheckCircle2 size={13} /> Verified & Ready
                          </span>
                        )
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
                      <>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            marginTop: '0.5rem',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                              minWidth: 0,
                              flex: '1 1 200px',
                            }}
                          >
                            <FileCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                            <span
                              style={{
                                fontWeight: 600,
                                color: '#1f2937',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={attached.file.name}
                            >
                              {attached.file.name}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem', flexShrink: 0 }}>
                              ({formatFileSize(attached.file.size)})
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                            {attached.file.type.startsWith('image/') && (
                              <button
                                type="button"
                                onClick={() => {
                                  const reqItem = service?.requirements.find((r) => r.id === req.id);
                                  const nameLower = (reqItem?.requirementName || '').toLowerCase();
                                  const isSquareReq =
                                    nameLower.includes('2x2') ||
                                    nameLower.includes('square') ||
                                    nameLower.includes('portrait') ||
                                    nameLower.includes('photo');
                                  setCropTargetFile(attached.file);
                                  setCropTargetReqId(req.id);
                                  setCropInitialMode(isSquareReq ? 'square' : 'card');
                                  setCropModalTitle(`Adjust Crop: ${reqItem?.requirementName || 'Document'}`);
                                  setCropModalOpen(true);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  background: 'none',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  padding: '2px 8px',
                                  color: '#1e4e8c',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  backgroundColor: '#f8fafc',
                                }}
                                title="Re-frame or crop this image"
                              >
                                <Crop size={12} color="#1e4e8c" /> Adjust Crop
                              </button>
                            )}
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
                        </div>

                        {/* AI Vision & Edge Quality Assessment Feedback */}
                        <AiVisionFeedbackBadge
                          loading={aiAnalyzingFiles[req.id]}
                          verification={aiVisionVerifications[req.id]}
                          requirementName={req.requirementName}
                          onAdjustCrop={attached.file.type.startsWith('image/') ? () => {
                            const reqItem = service?.requirements.find((r) => r.id === req.id);
                            const nameLower = (reqItem?.requirementName || '').toLowerCase();
                            const isSquareReq =
                              nameLower.includes('2x2') ||
                              nameLower.includes('square') ||
                              nameLower.includes('portrait') ||
                              nameLower.includes('photo');
                            setCropTargetFile(attached.file);
                            setCropTargetReqId(req.id);
                            setCropInitialMode(isSquareReq ? 'square' : 'card');
                            setCropModalTitle(`Adjust Crop: ${reqItem?.requirementName || 'Document'}`);
                            setCropModalOpen(true);
                          } : undefined}
                          onRetakeCamera={() => handleOpenRequirementCamera(req)}
                        />
                      </>
                    ) : (
                      <div
                        style={{
                          marginTop: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.45rem 0.85rem',
                            backgroundColor: '#f8fafc',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Upload size={14} color="#64748b" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                            onChange={(e) => handleFileChange(e, req.id)}
                            style={{ display: 'none' }}
                          />
                        </label>

                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>or</span>

                        <button
                          type="button"
                          onClick={() => handleOpenRequirementCamera(req)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.45rem 0.85rem',
                            backgroundColor: '#eff6ff',
                            border: '1.5px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#1d4ed8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Camera size={14} color="#2563eb" />
                          <span>Take Photo with Camera</span>
                        </button>
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

              {/* Document issues advisory banner before proceeding */}
              {selectedFiles.some((sf) => {
                const v = aiVisionVerifications[sf.requirementId];
                return Boolean(
                  v &&
                  (v.edge.isBlurry || !v.vision.sharp || v.edge.qualityBadge === 'POOR' || !v.vision.validDocument || v.vision.detectedClass === 'invalid_non_id')
                );
              }) && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, color: '#dc2626' }} />
                  <div>
                    <strong>Document Action Required:</strong> One or more attached documents have issues (blurry photo or unrecognized document). Please replace or re-crop them before you can proceed to appointment scheduling.
                  </div>
                </div>
              )}

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
                  <SlotGridSkeleton count={6} minWidth="180px" />
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
          <Card
            title="Review & Confirm Application"
            subtitle="Please review your applicant details, attached documents, and appointment schedule before submitting."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Notice Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  color: '#166534',
                  fontSize: '0.875rem',
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
                <div>
                  <span style={{ fontWeight: 700 }}>Almost there!</span> All steps have been completed. Please verify the summary below before final submission.
                </div>
              </div>

              {/* SECTION 1: Applicant & Service Information */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="#1E4E8C" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      Applicant Details
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1E4E8C',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title="Edit Applicant Details"
                  >
                    <Edit size={13} /> Edit
                  </button>
                </div>

                <div style={{ padding: '1.15rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                        Document Service
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E4E8C', wordBreak: 'break-word' }}>
                        {service.name}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                        Applicant Full Name
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', wordBreak: 'break-word' }}>
                        {user?.fullName || 'Not provided'}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                        Contact Number
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', wordBreak: 'break-word' }}>
                        {user?.contactNumber || 'Not provided'}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                        Email Address
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', wordBreak: 'break-word' }}>
                        {user?.email || 'Not provided'}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                        Registered Residence
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 500, color: '#1e293b', wordBreak: 'break-word' }}>
                        {user?.address || 'N/A'}, {user?.barangay || 'Cansojong'}, Talisay City
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                        Purpose of Application
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}>
                        {purpose}
                      </div>
                    </div>

                    {additionalNotes && (
                      <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #f1f5f9', gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                          Additional Remarks
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#475569', wordBreak: 'break-word' }}>
                          {additionalNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Attached Supporting Documents */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <FileCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Verified Supporting Documents ({selectedFiles.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1E4E8C',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                    title="Manage Attached Documents"
                  >
                    <Edit size={13} /> Change Files
                  </button>
                </div>

                <div style={{ padding: '1rem' }}>
                  {selectedFiles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                      No supporting documents attached.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {selectedFiles.map((sf) => {
                        const req = service.requirements.find((r) => r.id === sf.requirementId);
                        const verification = aiVisionVerifications[sf.requirementId];
                        return (
                          <div
                            key={sf.requirementId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '0.65rem',
                              padding: '0.75rem 1rem',
                              backgroundColor: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              boxSizing: 'border-box',
                              width: '100%',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.65rem',
                                minWidth: 0,
                                flex: '1 1 200px',
                              }}
                            >
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  backgroundColor: '#eff6ff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <FileText size={18} color="#1E4E8C" />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div
                                  style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={req?.requirementName || 'Document Requirement'}
                                >
                                  {req?.requirementName || 'Document Requirement'}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.78rem',
                                    color: '#64748b',
                                    minWidth: 0,
                                    marginTop: '1px',
                                  }}
                                >
                                  <span
                                    style={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: '160px',
                                    }}
                                    title={sf.file.name}
                                  >
                                    {sf.file.name}
                                  </span>
                                  <span>•</span>
                                  <span style={{ flexShrink: 0 }}>{formatFileSize(sf.file.size)}</span>
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                flexShrink: 0,
                                maxWidth: '100%',
                                minWidth: 0,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {verification ? (
                                <AiVisionFeedbackBadge verification={verification} compact />
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.74rem',
                                    color: '#166534',
                                    fontWeight: 600,
                                    backgroundColor: '#dcfce7',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    border: '1px solid #86efac',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <CheckCircle2 size={12} color="#16a34a" /> Attached
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: Reserved Office Appointment */}
              {selectedSlot && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #bfdbfe',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(30, 78, 140, 0.06)',
                  }}
                >
                  <div
                    style={{
                      padding: '0.85rem 1.15rem',
                      backgroundColor: '#eff6ff',
                      borderBottom: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={18} color="#1E4E8C" />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E4E8C' }}>
                        Reserved Office Appointment
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#1E4E8C',
                        backgroundColor: '#ffffff',
                        border: '1px solid #93c5fd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Reschedule Appointment Slot"
                    >
                      <Edit size={13} /> Reschedule
                    </button>
                  </div>

                  <div style={{ padding: '1.15rem' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                        gap: '0.85rem',
                      }}
                    >
                      <div style={{ backgroundColor: '#f0f7ff', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                          Appointment Date
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E4E8C' }}>
                          {formatDate(selectedSlot.slotDate)}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f0f7ff', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                          Time Window
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E4E8C' }}>
                          {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f0f7ff', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.2rem' }}>
                          Office Location
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                          Barangay Hall, Cansojong
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '0.9rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#64748b',
                      }}
                    >
                      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#3b82f6' }} />
                      <span>
                        Please arrive 10-15 minutes prior to your reserved schedule. Bring printed or original copies of your supporting requirements and payment for the fee.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: Processing Fee & Turnaround Estimation */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Fee Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundColor: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Banknote size={24} color="#16a34a" />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Document Processing Fee
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', lineHeight: 1.2, marginTop: '0.15rem' }}>
                      {formatCurrency(service.fee)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Payable on-site upon appointment
                    </div>
                  </div>
                </div>

                {/* AI Turnaround Estimation Card */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <AiPredictionBadge prediction={aiPrediction} loading={aiLoading} />
                </div>
              </div>

              {/* SECTION 5: Citizen Declaration */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1.15rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#1E4E8C' }} />
                <div>
                  <strong style={{ color: '#0f172a' }}>Citizen Declaration:</strong> By submitting this application, I certify that all personal information and uploaded documents provided are authentic, true, and correct. I understand that falsification is subject to administrative and legal sanctions under applicable laws.
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingTop: '0.5rem',
                }}
              >
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  disabled={submitting}
                  style={{ minWidth: '130px', flex: '1 1 auto', maxWidth: '200px' }}
                >
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  variant="primary"
                  isLoading={submitting}
                  onClick={handleSubmit}
                  style={{ minWidth: '220px', flex: '2 1 auto' }}
                >
                  <CheckCircle2 size={18} /> Confirm & Submit Application
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Live Camera Document Capture Modal */}
        <CameraCaptureModal
          isOpen={cameraModalOpen}
          onClose={() => setCameraModalOpen(false)}
          onCapture={handleCameraCapture}
          title={`Take Photo: ${activeCameraReqName}`}
          guideMode={activeCameraGuideMode}
        />

        {/* Interactive Image Crop Modal for Uploaded Files */}
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setCropTargetFile(null);
            setCropTargetReqId(null);
          }}
          imageFile={cropTargetFile}
          onCropComplete={handleCropComplete}
          initialMode={cropInitialMode}
          title={cropModalTitle}
          allowKeepOriginal={true}
        />
      </div>
    </Layout>
  );
};
