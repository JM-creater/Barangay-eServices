import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { PasswordInput } from '../../components/common/PasswordInput';

export const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ usernameOrEmail, password });
      // Redirect based on role or home
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.roles?.includes('ROLE_ADMIN')) {
          navigate('/admin/dashboard');
        } else if (u.roles?.includes('ROLE_STAFF') || u.roles?.includes('ROLE_APPROVER')) {
          navigate('/staff/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials and try again.'
      );
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
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '1.65rem', color: '#0F2A4A' }}>Sign In to e-Services</h2>
            <p style={{ color: '#616E7C', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Barangay Cansojong, Talisay City, Cebu
            </p>
          </div>

          <Card>
            {isExpired && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  color: '#b45309',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={18} /> Your session has expired. Please log in again.
              </div>
            )}

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#D64545',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: '#1F2933' }}>
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. resident or user@email.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2933' }}>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#1E4E8C', fontWeight: 600 }}>
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                <LogIn size={18} /> Sign In
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #DDE3EA', fontSize: '0.875rem', color: '#616E7C' }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: '#1E4E8C', fontWeight: 600 }}>
                Register here
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
