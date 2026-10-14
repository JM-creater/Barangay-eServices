import React from 'react';
import { EdgeImageQualityResult } from '../../utils/edgeImageQuality';
import { AiVisionVerificationResponse } from '../../services/aiService';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Camera,
  Crop,
  User,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface AiVisionFeedbackBadgeProps {
  loading?: boolean;
  verification?: {
    edge: EdgeImageQualityResult;
    vision: AiVisionVerificationResponse;
  };
  compact?: boolean;
  onAdjustCrop?: () => void;
  onRetakeCamera?: () => void;
  requirementName?: string;
}

export const AiVisionFeedbackBadge: React.FC<AiVisionFeedbackBadgeProps> = ({
  loading,
  verification,
  compact = false,
  onAdjustCrop,
  onRetakeCamera,
}) => {
  // 1. Loading State
  if (loading) {
    if (compact) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
          }}
        >
          <RefreshCw size={11} className="animate-spin" />
          <span>Verifying Document...</span>
        </span>
      );
    }

    return (
      <div
        style={{
          marginTop: '0.5rem',
          padding: 'clamp(0.65rem, 2vw, 0.85rem)',
          borderRadius: '10px',
          backgroundColor: '#f8fafc',
          border: '1.5px dashed #93c5fd',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: '#334155',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <RefreshCw size={14} color="#0284c7" className="animate-spin" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} color="#0284c7" />
            <span>AI Verifying Document & Clarity...</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
            Inspecting document validity, photo sharpness, motion blur, and glare details
          </div>
        </div>
      </div>
    );
  }

  if (!verification) {
    return null;
  }

  const { edge, vision } = verification;

  // Determine quality & validity states
  const isBlurry = edge.isBlurry || !vision.sharp || edge.qualityBadge === 'POOR';
  const isInvalid = !vision.validDocument || vision.detectedClass === 'invalid_non_id';
  const isAccepted = !isInvalid && !isBlurry;
  const isTwoByTwo = vision.twoByTwo || vision.detectedClass === 'two_by_two_photo';

  // Quality badge label (details only, no percentages)
  const getQualityLabel = () => {
    if (isBlurry) {
      return { text: 'Low Clarity (Motion Blur)', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' };
    }
    if (edge.hasGlare) {
      return { text: 'Glare Detected (Legible)', color: '#b45309', bg: '#fef3c7', border: '#fde68a' };
    }
    switch (edge.qualityBadge) {
      case 'EXCELLENT':
        return { text: 'Crisp & Sharp Quality', color: '#166534', bg: '#dcfce7', border: '#86efac' };
      case 'GOOD':
      default:
        return { text: 'Clear & Legible Quality', color: '#15803d', bg: '#dcfce7', border: '#86efac' };
    }
  };

  const qualityInfo = getQualityLabel();

  // ----------------------------------------------------
  // COMPACT VIEW (For Review & Summary Steps)
  // ----------------------------------------------------
  if (compact) {
    if (isAccepted) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            backgroundColor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #86efac',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
          title={`${vision.classDescription} - Status: Verified Clear & Accepted`}
        >
          <CheckCircle2 size={12} color="#16a34a" style={{ flexShrink: 0 }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {vision.classDescription}
          </span>
          <span style={{ opacity: 0.8, fontSize: '0.7rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
            • Verified Clear
          </span>
        </span>
      );
    }

    if (isBlurry) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
          title="Blurry photo detected - Clearer photo required to proceed"
        >
          <AlertCircle size={12} color="#dc2626" style={{ flexShrink: 0 }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            Blurry Photo
          </span>
          <span style={{ opacity: 0.8, fontSize: '0.7rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
            • Retake Needed
          </span>
        </span>
      );
    }

    // Invalid / Unrecognized document
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 600,
          backgroundColor: '#fff7ed',
          color: '#9a3412',
          border: '1px solid #fdba74',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
        title="Unrecognized document - Official Philippine Government ID required"
      >
        <AlertTriangle size={12} color="#ea580c" style={{ flexShrink: 0 }} />
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          Unrecognized Document
        </span>
        <span style={{ opacity: 0.8, fontSize: '0.7rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
          • Valid ID Needed
        </span>
      </span>
    );
  }

  // ----------------------------------------------------
  // FULL VIEW: CASE 1 - BLURRY PHOTO (BLOCKING)
  // ----------------------------------------------------
  if (isBlurry) {
    return (
      <div
        style={{
          marginTop: '0.6rem',
          padding: 'clamp(0.75rem, 2.5vw, 1rem)',
          borderRadius: '10px',
          backgroundColor: '#fef2f2',
          border: '1.5px solid #fca5a5',
          fontSize: '0.82rem',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px 0 rgba(239, 68, 68, 0.08)',
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                flexShrink: 0,
              }}
            >
              <AlertCircle size={15} />
            </span>
            <span style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.88rem' }}>
              Photo Too Blurry to Read
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#7f1d1d',
                backgroundColor: '#fee2e2',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #f87171',
                whiteSpace: 'nowrap',
              }}
            >
              Action Required
            </span>
          </div>

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: '#dc2626',
              padding: '2px 9px',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
            }}
          >
            Cannot Proceed
          </span>
        </div>

        {/* Detailed Issue & Explanation */}
        <p style={{ color: '#7f1d1d', fontSize: '0.82rem', lineHeight: '1.5', margin: '0 0 0.5rem 0' }}>
          The uploaded image is out of focus or motion-blurred. Barangay officers must be able to clearly read the text, ID number, and face on your document to verify and approve your application.
        </p>


        {/* Helpful Photography Tips */}
        <div
          style={{
            fontSize: '0.75rem',
            color: '#991b1b',
            backgroundColor: '#fff1f2',
            padding: '0.5rem 0.7rem',
            borderRadius: '6px',
            border: '1px solid #ffe4e6',
            lineHeight: 1.45,
          }}
        >
          <strong>💡 Tips for a crisp photo:</strong>
          <ul style={{ margin: '3px 0 0 1.1rem', padding: 0 }}>
            <li>Hold your phone steady with both hands or rest your arms on a table.</li>
            <li>Place your document on a flat, well-lit surface away from direct glare.</li>
            <li>Tap your mobile screen on the document text to lock focus before snapping.</li>
          </ul>
        </div>

        {/* Action Buttons inside the card */}
        {(onAdjustCrop || onRetakeCamera) && (
          <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onRetakeCamera && (
              <button
                type="button"
                onClick={onRetakeCamera}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
              >
                <Camera size={14} /> Retake Clear Photo
              </button>
            )}
            {onAdjustCrop && (
              <button
                type="button"
                onClick={onAdjustCrop}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#ffffff',
                  color: '#991b1b',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Crop size={14} /> Adjust Crop
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL VIEW: CASE 2 - INVALID / UNRECOGNIZED (BLOCKING)
  // ----------------------------------------------------
  if (isInvalid) {
    return (
      <div
        style={{
          marginTop: '0.6rem',
          padding: 'clamp(0.75rem, 2.5vw, 1rem)',
          borderRadius: '10px',
          backgroundColor: '#fff7ed',
          border: '1.5px solid #fdba74',
          fontSize: '0.82rem',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px 0 rgba(234, 88, 12, 0.08)',
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#ffedd5',
                color: '#ea580c',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={15} />
            </span>
            <span style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.88rem' }}>
              Unrecognized Document
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#7c2d12',
                backgroundColor: '#ffedd5',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #fb923c',
                whiteSpace: 'nowrap',
              }}
            >
              Official ID Required
            </span>
          </div>

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: '#ea580c',
              padding: '2px 9px',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
            }}
          >
            Cannot Proceed
          </span>
        </div>

        {/* Detailed Issue & Explanation */}
        <p style={{ color: '#7c2d12', fontSize: '0.82rem', lineHeight: '1.5', margin: '0 0 0.5rem 0' }}>
          The uploaded image does not match standard Philippine government IDs or official 2x2 photos. Receipts, non-official cards, selfies without ID, or pictures with excessive background cannot be accepted.
        </p>

        {/* Accepted Documents List Grid */}
        <div
          style={{
            padding: '0.55rem 0.75rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #fed7aa',
            fontSize: '0.76rem',
            marginBottom: '0.6rem',
          }}
        >
          <strong style={{ color: '#9a3412', display: 'block', marginBottom: '2px' }}>
            Accepted Official Philippine Documents:
          </strong>
          <span style={{ color: '#475569', lineHeight: 1.45 }}>
            PhilSys National ID, Driver&apos;s License, UMID, Postal ID, Voter&apos;s Certificate, Senior Citizen ID, PWD ID, Barangay Resident ID, or 2x2 ID Photo.
          </span>
        </div>

        {/* Camera Framing Guidance */}
        <div
          style={{
            fontSize: '0.75rem',
            color: '#9a3412',
            backgroundColor: '#fffbeb',
            padding: '0.5rem 0.7rem',
            borderRadius: '6px',
            border: '1px solid #fef3c7',
            lineHeight: 1.45,
          }}
        >
          <strong>💡 Close Framing Tip:</strong> If you photographed an official government ID, bring your camera closer so that the ID card fills the entire frame. Avoid capturing large table or background areas. You can also tap <strong>&apos;Adjust Crop&apos;</strong> to frame the card edges tightly.
        </div>

        {/* Action Buttons inside the card */}
        {(onAdjustCrop || onRetakeCamera) && (
          <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onAdjustCrop && (
              <button
                type="button"
                onClick={onAdjustCrop}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Crop size={14} /> Adjust Crop & Frame Edges
              </button>
            )}
            {onRetakeCamera && (
              <button
                type="button"
                onClick={onRetakeCamera}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#ffffff',
                  color: '#ea580c',
                  border: '1.5px solid #fdba74',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Camera size={14} /> Take Photo with Camera
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL VIEW: CASE 3 - VERIFIED & ACCEPTED (CLEAR + VALID ID)
  // ----------------------------------------------------
  return (
    <div
      style={{
        marginTop: '0.6rem',
        padding: 'clamp(0.75rem, 2.5vw, 1rem)',
        borderRadius: '10px',
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        fontSize: '0.82rem',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px 0 rgba(22, 163, 74, 0.08)',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              flexShrink: 0,
            }}
          >
            {isTwoByTwo ? <User size={15} /> : <ShieldCheck size={15} />}
          </span>
          <span style={{ fontWeight: 800, color: '#14532d', fontSize: '0.88rem', wordBreak: 'break-word' }}>
            Verified: {vision.classDescription}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#15803d',
              backgroundColor: '#dcfce7',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid #86efac',
              whiteSpace: 'nowrap',
            }}
          >
            {isTwoByTwo ? 'Official 2x2 ID Photo' : 'Official Philippine Government ID'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: qualityInfo.color,
              backgroundColor: qualityInfo.bg,
              border: `1px solid ${qualityInfo.border}`,
              padding: '2px 8px',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
            }}
          >
            {qualityInfo.text}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#166534',
              backgroundColor: '#bbf7d0',
              padding: '2px 8px',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
            }}
          >
            ✓ Accepted
          </span>
        </div>
      </div>


      {/* Guidance Message */}
      <p style={{ color: '#14532d', fontSize: '0.8rem', lineHeight: '1.45', margin: 0, wordBreak: 'break-word' }}>
        ✓ Document is clear and valid for official barangay certification and clearance processing.
      </p>

      {/* Minor Glare Notice if any */}
      {edge.hasGlare && (
        <div
          style={{
            marginTop: '0.45rem',
            padding: '0.4rem 0.6rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            fontSize: '0.74rem',
            color: '#92400e',
          }}
        >
          ℹ️ Minor flash glare detected on surface, but text details remain readable.
        </div>
      )}
    </div>
  );
};
