import React, { useRef } from 'react';
import { DocumentRequest } from '../../types/Request';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { generateAppointmentSlipHtml } from '../../utils/appointmentSlipGenerator';
import { Printer, ExternalLink } from 'lucide-react';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DocumentRequest | null;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!request) return null;

  const slipHtml = generateAppointmentSlipHtml(request);

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch (err) {
        console.warn('Iframe direct print failed, falling back to print window:', err);
      }
    }
    handleOpenWindow();
  };

  const handleOpenWindow = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(slipHtml);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Transaction Slip — ${request.referenceNumber}`}
      maxWidth="860px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Top Summary Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F2A4A' }}>
              {request.service?.name || 'Document Application'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Applicant: <strong>{request.resident?.fullName}</strong> &nbsp;•&nbsp; Status:{' '}
              <strong style={{ color: '#1E4E8C' }}>{request.currentStatus}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={handleOpenWindow}>
              <ExternalLink size={15} /> Open in New Tab
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer size={15} /> Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Iframe Preview Box */}
        <div
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#525659',
            padding: '12px',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Official Slip Preview"
            srcDoc={slipHtml}
            style={{
              width: '100%',
              height: '560px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              display: 'block',
            }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            💡 <em>Tip: This official slip includes your appearance checklist, barcode, and triage validation sections.</em>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              <Printer size={16} /> Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
