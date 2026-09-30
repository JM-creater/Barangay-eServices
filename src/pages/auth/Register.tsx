import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UserPlus, AlertCircle } from 'lucide-react';
import { PasswordInput } from '../../components/common/PasswordInput';

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

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#D64545',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} /> {error}
              </div>
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
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Middle Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
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
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
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
                  />
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
                />
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E4E8C', borderBottom: '1px solid #DDE3EA', paddingBottom: '0.35rem', marginTop: '0.5rem' }}>
                Account Credentials
              </div>

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
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '1rem' }}>
                <UserPlus size={18} /> Complete Registration
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
