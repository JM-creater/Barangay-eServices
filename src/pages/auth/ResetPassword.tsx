import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PasswordInput } from '../../components/common/PasswordInput';
import { authService } from '../../services/authService';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

type PageStatus = 'validating' | 'valid' | 'invalid' | 'missing' | 'success';

export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawToken = new URLSearchParams(location.search).get('token')?.trim() || '';

  const [status, setStatus] = useState<PageStatus>(rawToken ? 'validating' : 'missing');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [token, setToken] = useState<string>(rawToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawToken) {
      setStatus('missing');
      return;
    }

    let isMounted = true;
    setStatus('validating');

    authService.validateResetToken(rawToken)
      .then((response) => {
        if (!isMounted) return;
        if (response.valid) {
          setStatus('valid');
          setToken(rawToken);
        } else {
          setStatus('invalid');
          setStatusMessage(response.message || 'This password reset link is invalid, has expired, or has already been used.');
          window.history.replaceState({}, '', '/reset-password');
        }
      })
      .catch((error: any) => {
        if (!isMounted) return;
        setStatus('invalid');
        const fallbackMsg = error.response?.data?.message || 'Unable to verify reset link. The link may be invalid or expired.';
        setStatusMessage(fallbackMsg);
        window.history.replaceState({}, '', '/reset-password');
      });

    return () => {
      isMounted = false;
    };
  }, [rawToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (newPassword.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(token, newPassword);
      setStatus('success');
      window.history.replaceState({}, '', '/reset-password');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#1E4E8C',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                marginBottom: '0.75rem',
                boxShadow: '0 4px 10px rgba(30, 78, 140, 0.3)',
              }}
            >
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: '1.65rem', color: '#0F2A4A' }}>Reset Password</h2>
            <p style={{ color: '#616E7C', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Create a new secure password for your account
            </p>
          </div>

          <Card>
            {/* STATE 1: Proactive Verification in Progress */}
            {status === 'validating' && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Loader2 size={38} className="animate-spin" style={{ color: '#1E4E8C', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#0F2A4A', marginBottom: '0.35rem' }}>
                  Verifying Security Link...
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
                  Please wait while we validate your password recovery token.
                </p>
              </div>
            )}

            {/* STATE 2: Password Reset Succeeded */}
            {status === 'success' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(46, 139, 87, 0.12)',
                    color: '#2E8B57',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <CheckCircle2 size={34} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#0F2A4A', marginBottom: '0.5rem' }}>
                  Password Reset Successful
                </h3>
                <p style={{ color: '#616E7C', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Your password has been changed successfully. You may now sign in using your new credentials.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/login')}
                  style={{ width: '100%' }}
                >
                  Sign In Now
                </Button>
              </div>
            )}

            {/* STATE 3: Missing Token in URL */}
            {status === 'missing' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#0F2A4A', marginBottom: '0.5rem' }}>
                  Secure Reset Link Required
                </h3>
                <p style={{ color: '#616E7C', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  For account protection, password resets must be accessed via the secure verification link sent to your registered Gmail address.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/forgot-password')}
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                >
                  Request Password Reset Link
                </Button>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.875rem',
                    color: '#64748B',
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            )}

            {/* STATE 4: Invalid, Expired, Truncated, or Used Token */}
            {status === 'invalid' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    color: '#EA580C',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <ShieldAlert size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#0F2A4A', marginBottom: '0.5rem' }}>
                  Invalid or Expired Reset Link
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {statusMessage || 'This password reset link is invalid, has expired, or has already been used. For your security, reset links are single-use only and expire after 2 hours.'}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/forgot-password')}
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                >
                  Request New Reset Link
                </Button>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.875rem',
                    color: '#64748B',
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            )}

            {/* STATE 5: Verified & Active Token -> Show Input Form */}
            {status === 'valid' && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {submitError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fee2e2',
                      borderRadius: '8px',
                      color: '#D64545',
                      fontSize: '0.875rem',
                    }}
                  >
                    <AlertCircle size={18} /> {submitError}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    color: '#166534',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={18} color="#166534" />
                  <span>Secure Reset Link Verified</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    New Password
                  </label>
                  <PasswordInput
                    required
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Confirm New Password
                  </label>
                  <PasswordInput
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Update Password
                </Button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.875rem',
                      color: '#64748b',
                    }}
                  >
                    <ArrowLeft size={16} /> Cancel and Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};
