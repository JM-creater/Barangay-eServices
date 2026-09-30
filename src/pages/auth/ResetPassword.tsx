import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryToken = new URLSearchParams(location.search).get('token') || '';

  const [token, setToken] = useState(queryToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Please provide the password reset token.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token.trim(), newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setLoading(false);
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
            {error && (
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
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {success ? (
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
                <p style={{ color: '#616E7C', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your password has been changed. You can now sign in with your new credentials.
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
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Paste the reset token received"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                    Sent via email or provided on previous screen.
                  </small>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                  Set New Password
                </Button>

                <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
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
