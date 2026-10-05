import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { processingService } from '../../services/processingService';
import { DocumentVerification } from '../../types/Request';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { VerificationResultSkeleton } from '../../components/skeletons';
import { formatDateTime } from '../../utils/formatters';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  User,
  Building,
  ArrowLeft,
  Award,
} from 'lucide-react';

export const PublicDocumentVerification: React.FC = () => {
  const { controlNumber } = useParams<{ controlNumber?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryControl = searchParams.get('control') || controlNumber || '';

  const [inputVal, setInputVal] = useState(queryControl);
  const [result, setResult] = useState<DocumentVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performVerification = async (ctrl: string) => {
    if (!ctrl.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await processingService.verifyDocument(ctrl.trim());
      setResult(data);
    } catch {
      setResult({
        verified: false,
        status: 'LOOKUP_ERROR',
        message: 'Could not connect to the verification registry. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryControl) {
      setInputVal(queryControl);
      performVerification(queryControl);
    }
  }, [queryControl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ control: inputVal.trim() });
      performVerification(inputVal.trim());
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem 0' }}>
        {/* Breadcrumb / Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: '#1E4E8C', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ padding: '0.65rem', backgroundColor: '#eff5fc', borderRadius: '10px', color: '#1E4E8C' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', color: '#0F2A4A', margin: 0 }}>Official Document Verification</h1>
              <p style={{ color: '#616E7C', fontSize: '0.9rem', margin: 0 }}>
                Anti-Fraud Verification Portal • Barangay Cansojong, Talisay City, Cebu
              </p>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <Card style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: '#1F2933', marginBottom: '0.5rem' }}>
              Enter Document Control Number or Release Reference Number:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#616E7C' }} />
                <input
                  type="text"
                  placeholder="e.g. DOC-CLR-20260929-ABCDE or REL-2026-XXXXX"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '100%', height: '44px', fontSize: '1rem' }}
                />
              </div>
              <Button type="submit" variant="primary" isLoading={loading} style={{ flexShrink: 0 }}>
                <Search size={18} /> Verify Authenticity
              </Button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#616E7C', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
              This public registry enables government agencies, universities, banks, and private employers to confirm the legitimacy of issued barangay certificates.
            </p>
          </form>
        </Card>

        {/* Verification Result */}
        {loading && <VerificationResultSkeleton />}

        {!loading && hasSearched && result && (
          <div>
            {result.verified ? (
              <Card style={{ border: '2px solid #2E8B57', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid #DDE3EA' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(46, 139, 87, 0.12)', borderRadius: '50%', color: '#2E8B57' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <div style={{ display: 'inline-block', backgroundColor: 'rgba(46, 139, 87, 0.12)', color: '#2E8B57', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                      AUTHENTIC & VALID
                    </div>
                    <h2 style={{ fontSize: '1.35rem', color: '#0F2A4A', margin: 0 }}>Official Document Verified</h2>
                    <p style={{ fontSize: '0.875rem', color: '#2E8B57', margin: '2px 0 0 0', fontWeight: 600 }}>
                      {result.message}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#616E7C', textTransform: 'uppercase', fontWeight: 600 }}>Document Type</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E4E8C', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <Award size={16} /> {result.serviceName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Issued To (Resident)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <User size={16} /> {result.recipientName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Control Number</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <FileText size={16} /> {result.issuedDocumentNumber}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Official Receipt (O.R.)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                      {result.officialReceiptNumber || 'N/A (Exempt/Free)'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Date of Issuance</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <Calendar size={16} /> {result.releaseDate ? formatDateTime(result.releaseDate) : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Issuing LGU</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <Building size={16} /> {result.barangayName}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    Authorized Signatory: <strong>{result.officialApproverName}</strong>
                  </div>
                  <div>
                    Releasing Officer: <strong>{result.releasingOfficerName}</strong>
                  </div>
                </div>
              </Card>
            ) : (
              <Card style={{ border: '2px solid #D64545', backgroundColor: '#fef2f2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: '#D64545' }}>
                    <XCircle size={36} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', color: '#D64545', margin: 0, fontWeight: 700 }}>Certificate Verification Failed</h2>
                    <p style={{ fontSize: '0.9rem', color: '#1F2933', margin: '4px 0 0 0' }}>
                      {result.message}
                    </p>
                    <p style={{ fontSize: '0.825rem', color: '#616E7C', margin: '8px 0 0 0' }}>
                      Please double-check the control number printed on the physical document or scan the QR code again. If you believe this is an error, please verify in-person at Barangay Cansojong Hall.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
