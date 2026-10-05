import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UserPlus, AlertCircle, CheckCircle, ShieldCheck, X, LogIn } from 'lucide-react';
import { PasswordInput } from '../../components/common/PasswordInput';
import { GoogleAuthButton, GoogleIcon } from '../../components/auth/GoogleAuthButton';
import { authService } from '../../services/authService';

interface GoogleProfileState {
  idToken: string;
  email: string;
  firstName: string;
  lastName: string;
  pictureUrl?: string;
  suggestedUsername?: string;
}

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    contactNumber: '',
    address: '',
    barangay: 'Cansojong',
    city: 'Talisay City',
    province: 'Cebu',
  });

  const [googleProfile, setGoogleProfile] = useState<GoogleProfileState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, registerWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from login page after an unregistered Google login attempt
  useEffect(() => {
    const pendingToken = sessionStorage.getItem('google_pending_token');
    const params = new URLSearchParams(location.search);
    if (pendingToken && params.get('from_google') === 'true') {
      sessionStorage.removeItem('google_pending_token');
      handleGoogleCredential(pendingToken);
    }
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleCredential = async (idToken: string) => {
    setError(null);
    setIsExistingUser(false);
    setGoogleLoading(true);

    try {
      const result = await authService.verifyGoogleToken({ idToken });

      if (result.registered) {
        setIsExistingUser(true);
        setError('An account with this Google email is already registered. Please sign in instead.');
        return;
      }

      setGoogleProfile({
        idToken,
        email: result.email,
        firstName: result.firstName || '',
        lastName: result.lastName || '',
        pictureUrl: result.pictureUrl,
        suggestedUsername: result.suggestedUsername,
      });

      setFormData((prev) => ({
        ...prev,
        email: result.email,
        firstName: result.firstName || prev.firstName,
        lastName: result.lastName || prev.lastName,
        username: result.suggestedUsername || prev.username,
      }));
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to verify Google account credentials. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const cancelGoogleMode = () => {
    setGoogleProfile(null);
    setError(null);
    setIsExistingUser(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Google registration flow
    if (googleProfile) {
      if (!formData.username.trim()) {
        setError('Username is required');
        return;
      }
      if (!formData.contactNumber.trim()) {
        setError('Contact number is required');
        return;
      }
      if (!formData.address.trim()) {
        setError('Street address / Purok is required');
        return;
      }

      setLoading(true);
      try {
        await registerWithGoogle({
          idToken: googleProfile.idToken,
          username: formData.username.trim(),
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim(),
          lastName: formData.lastName.trim(),
          suffix: formData.suffix.trim(),
          contactNumber: formData.contactNumber.trim(),
          address: formData.address.trim(),
          barangay: formData.barangay,
          city: formData.city,
          province: formData.province,
        });

        navigate('/dashboard');
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Registration failed. Please check your information and try again.'
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Standard credential registration flow
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        suffix: formData.suffix,
        contactNumber: formData.contactNumber,
        address: formData.address,
        barangay: formData.barangay,
        city: formData.city,
        province: formData.province,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <div style={{ maxWidth: '640px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: '#0F2A4A' }}>Resident Registration</h2>
            <p style={{ color: '#616E7C', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Create an account to submit requests and book appointments at Barangay Cansojong
            </p>
          </div>

          <Card>
            {error && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '0.85rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#D64545',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
                {isExistingUser && (
                  <Link
                    to="/login"
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '0.25rem',
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#1E4E8C',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <LogIn size={14} /> Go to Sign In
                  </Link>
                )}
              </div>
            )}

            {/* Google Verified Banner */}
            {googleProfile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {googleProfile.pictureUrl ? (
                    <img
                      src={googleProfile.pictureUrl}
                      alt="Google Profile"
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #dcfce7',
                      }}
                    >
                      <GoogleIcon size={20} />
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.9rem', color: '#166534' }}>
                      <CheckCircle size={16} color="#16a34a" /> Google Account Verified
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                      {googleProfile.email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cancelGoogleMode}
                  title="Cancel Google Registration"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}

            {/* Google Sign-up Button (visible when not already in Google Mode) */}
            {!googleProfile && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <GoogleAuthButton
                    text="signup_with"
                    onCredential={handleGoogleCredential}
                    onError={(msg) => setError(msg)}
                    disabled={loading || googleLoading}
                    isLoading={googleLoading}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1.25rem 0',
                    color: '#9AA5B1',
                  }}
                >
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E4E7EB' }} />
                  <span
                    style={{
                      padding: '0 0.75rem',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                    }}
                  >
                    or register with credentials
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E4E7EB' }} />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E4E8C', borderBottom: '1px solid #DDE3EA', paddingBottom: '0.35rem' }}>
                Personal Information
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    First Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading || googleLoading}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    disabled={loading || googleLoading}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Last Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading || googleLoading}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Suffix (Jr, III)
                  </label>
                  <input
                    type="text"
                    name="suffix"
                    placeholder="e.g. Jr."
                    value={formData.suffix}
                    onChange={handleChange}
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Contact Number <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    required
                    placeholder="0917-000-0000"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    disabled={loading || googleLoading}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Email Address <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading || googleLoading || !!googleProfile}
                    style={
                      googleProfile
                        ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#475569' }
                        : {}
                    }
                  />
                  {googleProfile ? (
                    <small style={{ display: 'block', color: '#16a34a', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>
                      ✓ Verified and locked by Google OAuth
                    </small>
                  ) : (
                    <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      We'll send your registration confirmation and document updates here.
                    </small>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Street Address / Purok / Sitio <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="House No., Street, Purok, Barangay Cansojong"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading || googleLoading}
                />
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E4E8C', borderBottom: '1px solid #DDE3EA', paddingBottom: '0.35rem', marginTop: '0.5rem' }}>
                Account Credentials
              </div>

              {googleProfile ? (
                /* Google Mode: No password required */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Username <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      disabled={loading || googleLoading}
                    />
                    <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Unique username for your Barangay Cansojong portal profile.
                    </small>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      color: '#1e40af',
                      fontSize: '0.8rem',
                    }}
                  >
                    <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Password Managed by Google:</strong> Your credentials are protected by Google. You will sign in seamlessly with one click using your Google Account.
                    </span>
                  </div>
                </div>
              ) : (
                /* Standard Mode: Full credentials */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Username <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      disabled={loading || googleLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Password <span style={{ color: "red" }}>*</span> (min 6 chars)
                    </label>
                    <PasswordInput
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading || googleLoading}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Confirm Password <span style={{ color: "red" }}>*</span>
                    </label>
                    <PasswordInput
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={googleLoading}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                <UserPlus size={18} /> {googleProfile ? 'Complete Registration with Google' : 'Complete Registration'}
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #DDE3EA', fontSize: '0.875rem', color: '#616E7C' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#1E4E8C', fontWeight: 600 }}>
                Log in here
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
