import React from 'react';
import { AiPredictionResponse } from '../../services/aiService';
import { Sparkles, Clock, ShieldCheck, AlertTriangle, Zap, CheckCircle2, FileCheck } from 'lucide-react';

interface AiPredictionBadgeProps {
  prediction: AiPredictionResponse | null;
  loading?: boolean;
  compact?: boolean;
  customTitle?: string;
}

export const AiPredictionBadge: React.FC<AiPredictionBadgeProps> = ({
  prediction,
  loading,
  compact = false,
  customTitle = 'Smart Application Assessment',
}) => {
  // Helper for human-friendly category presentation
  const getCategoryDetails = (category: string, fastTrack: boolean) => {
    if (fastTrack || category === 'READY_FOR_APPROVAL') {
      return {
        label: 'Ready for Fast-Track',
        description: 'Complete documentation submitted. Eligible for priority review.',
        icon: <Zap size={16} color="#166534" />,
        badgeBg: '#DCFCE7',
        badgeColor: '#166534',
        badgeBorder: '#BBF7D0',
        cardBg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        cardBorder: '#86EFAC',
        textColor: '#14532D',
      };
    }
    if (category === 'NEEDS_CORRECTION_RISK') {
      return {
        label: 'Attention Needed: Incomplete Requirements',
        description: 'Some mandatory files or details are missing. Please complete before review.',
        icon: <AlertTriangle size={16} color="#B45309" />,
        badgeBg: '#FEF3C7',
        badgeColor: '#92400E',
        badgeBorder: '#FDE68A',
        cardBg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        cardBorder: '#FCD34D',
        textColor: '#78350F',
      };
    }
    return {
      label: 'Standard Verification Queue',
      description: 'Requirements received. Queued for standard administrative processing.',
      icon: <ShieldCheck size={16} color="#1E4E8C" />,
      badgeBg: '#DBEAFE',
      badgeColor: '#1E40AF',
      badgeBorder: '#BFDBFE',
      cardBg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      cardBorder: '#93C5FD',
      textColor: '#1E3A8A',
    };
  };

  // Helper for human-friendly reliability/confidence indicator
  const getReliabilityDisplay = (score: number) => {
    if (score >= 0.90) {
      return {
        text: 'High Assessment Accuracy',
        pill: 'Verified Match',
        bg: '#DCFCE7',
        color: '#166534',
        border: '#BBF7D0',
      };
    }
    if (score >= 0.75) {
      return {
        text: 'Standard Quality Check',
        pill: 'Standard Match',
        bg: '#DBEAFE',
        color: '#1E40AF',
        border: '#BFDBFE',
      };
    }
    return {
      text: 'Preliminary Review',
      pill: 'Needs Verification',
      bg: '#FEF3C7',
      color: '#92400E',
      border: '#FDE68A',
    };
  };

  // 1. Compact View (Used in tables, badges, and headers)
  if (compact) {
    if (loading) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: '#EFF6FF',
            color: '#1E4E8C',
            border: '1px solid #BFDBFE',
          }}
        >
          <Sparkles size={12} className="animate-spin" /> Assessing...
        </span>
      );
    }

    if (!prediction) return null;

    const theme = getCategoryDetails(prediction.assessmentCategory, prediction.fastTrackEligible);

    return (
      <span
        title={`Estimated turnaround: ~${prediction.predictedTurnaroundHours} hours`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: theme.badgeBg,
          color: theme.badgeColor,
          border: `1px solid ${theme.badgeBorder}`,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {theme.icon}
        <span>{theme.label.split(':')[0]}</span>
        <span style={{ opacity: 0.85, fontSize: '0.72rem' }}>• ~{prediction.predictedTurnaroundHours}h</span>
      </span>
    );
  }

  // 2. Loading State (Full Card)
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          border: '1.5px solid #BFDBFE',
          borderRadius: '14px',
          boxShadow: '0 2px 8px rgba(30, 78, 140, 0.05)',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1E4E8C',
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} className="animate-spin" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E4E8C' }}>
            Smart Application Assessment in Progress...
          </span>
          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Evaluating requirements checklist, submission timing, and turnaround patterns
          </span>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const theme = getCategoryDetails(prediction.assessmentCategory, prediction.fastTrackEligible);
  const reliability = getReliabilityDisplay(prediction.confidenceScore);

  return (
    <div
      style={{
        padding: '18px 20px',
        borderRadius: '16px',
        background: theme.cardBg,
        border: `1.5px solid ${theme.cardBorder}`,
        boxShadow: '0 4px 14px rgba(15, 42, 74, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: theme.badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            {theme.icon}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: theme.textColor, letterSpacing: '-0.01em' }}>
              {customTitle}
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} color="#F2B600" /> Powered by Barangay AI Model
            </span>
          </div>
        </div>

        {/* Quality / Reliability Badge (Replacing raw confidence number) */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.76rem',
            padding: '4px 10px',
            borderRadius: '999px',
            fontWeight: 700,
            backgroundColor: reliability.bg,
            color: reliability.color,
            border: `1px solid ${reliability.border}`,
          }}
        >
          <CheckCircle2 size={13} />
          {reliability.text}
        </span>
      </div>

      {/* Primary Highlights: Status & Turnaround */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Readiness Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Application Readiness
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.textColor, wordBreak: 'break-word' }}>
            {theme.label}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.3 }}>
            {theme.description}
          </span>
        </div>

        {/* Turnaround Time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Estimated Processing
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Clock size={16} color={theme.textColor} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.textColor }}>
              ~{prediction.predictedTurnaroundHours} hrs
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              ({prediction.predictedTurnaroundDays} {prediction.predictedTurnaroundDays === 1 ? 'business day' : 'business days'})
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {prediction.fastTrackEligible
              ? '⚡ Eligible for same-day afternoon release'
              : 'Standard verification workflow'}
          </span>
        </div>
      </div>

      {/* Helpful Recommendations */}
      {prediction.aiRecommendations && prediction.aiRecommendations.length > 0 && (
        <div
          style={{
            paddingTop: '8px',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textColor, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Helpful Guidance:
          </span>
          {prediction.aiRecommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
              <span style={{ color: theme.textColor, fontWeight: 800, marginTop: '1px' }}>•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
