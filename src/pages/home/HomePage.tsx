import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { serviceCatalogService } from '../../services/serviceCatalogService';
import { ServiceItem } from '../../types/Service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { HomePageServicesSkeleton } from '../../components/skeletons';
import { formatCurrency } from '../../utils/formatters';
import { BARANGAY_INFO } from '../../utils/constants';
import {
  ShieldCheck,
  Search,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Building,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchRef, setSearchRef] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    serviceCatalogService
      .getActiveServices()
      .then((data) => setServices(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      navigate(`/track/${encodeURIComponent(searchRef.trim().toUpperCase())}`);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F2A4A 0%, #1E4E8C 60%, #143862 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '3.5rem 2rem',
          marginBottom: '3rem',
          boxShadow: '0 12px 28px rgba(15, 42, 74, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(242, 182, 0, 0.15)',
              color: '#F2B600',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              border: '1px solid rgba(242, 182, 0, 0.35)',
            }}
          >
            <ShieldCheck size={18} /> Official e-Services Portal of Barangay Cansojong
          </div>

          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: 'clamp(1.85rem, 4vw + 0.5rem, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: '#ffffff',
            }}
          >
            Online Pre-Application & Appointment Scheduling
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#DDE3EA',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '700px',
              margin: '0 auto 2rem',
            }}
          >
            View document requirements, submit your application details, and book your guaranteed office
            appointment slot online. Fast, orderly, and convenient.
          </p>

          {/* Quick Tracking Search Box */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(15, 42, 74, 0.18)',
              maxWidth: '560px',
              margin: '0 auto 2rem',
            }}
          >
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 220px', minWidth: 0, paddingLeft: '0.75rem' }}>
                <Search size={20} color="#1E4E8C" />
                <input
                  type="text"
                  placeholder="Enter Reference Number (e.g., BC-2026-A1B2)"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  style={{
                    border: 'none',
                    boxShadow: 'none',
                    padding: '0.65rem 0.75rem',
                    fontSize: '0.95rem',
                    width: '100%',
                  }}
                />
              </div>
              <Button type="submit" variant="primary" style={{ flexShrink: 0 }}>
                Track Application
              </Button>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/services">
              <Button size="lg" style={{ backgroundColor: '#F2B600', color: '#0F2A4A', fontWeight: 700 }}>
                Browse Available Services <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" style={{ color: '#fff', borderColor: 'rgba(255, 255, 255, 0.45)' }}>
                Create Resident Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Stage Workflow Explanation */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', color: '#1F2933' }}>How Barangay e-Services Works</h2>
          <p style={{ color: '#616E7C', marginTop: '0.5rem' }}>
            A streamlined 3-stage process to eliminate long waiting lines at the Barangay Hall
          </p>
        </div>

        <div className="grid-3">
          <Card>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#f0f6fc',
                color: '#3B82C4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <FileText size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#1E4E8C' }}>
              Stage 1: Online Submission
            </h4>
            <p style={{ color: '#616E7C', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Select your required certificate, fill out your details, attach supporting documents, and select an
              available date & time slot. Slot reservation is handled automatically.
            </p>
          </Card>

          <Card>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef9e8',
                color: '#F2B600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Calendar size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#9e7500' }}>
              Stage 2: Staff Review
            </h4>
            <p style={{ color: '#616E7C', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Barangay personnel review your application. Once verified, your appointment is confirmed, and you receive
              instructions on physical originals to present and exact fees.
            </p>
          </Card>

          <Card>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#edf7f2',
                color: '#2E8B57',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#1d613c' }}>
              Stage 3: Verification & Release
            </h4>
            <p style={{ color: '#616E7C', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Visit Barangay Cansojong Hall during your confirmed slot. Staff verifies your original ID, records payment,
              authorized officials sign, and your official document is issued.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured Services */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', color: '#1F2933' }}>Available Barangay Services</h2>
            <p style={{ color: '#616E7C', marginTop: '0.25rem' }}>
              Clearances and certifications available for online request
            </p>
          </div>
          <Link to="/services">
            <Button variant="outline" size="sm">
              View All Services ({services.length})
            </Button>
          </Link>
        </div>

        {loading ? (
          <HomePageServicesSkeleton count={6} />
        ) : (
          <div className="grid-3">
            {services.slice(0, 6).map((service) => (
              <Card
                key={service.id}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#1E4E8C',
                      backgroundColor: '#eff5fc',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                      border: '1px solid #bcd5f0',
                    }}
                  >
                    {service.serviceCode}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1F2933' }}>{service.name}</h3>
                  <p
                    title={service.description}
                    style={{
                      color: '#616E7C',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {service.description}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid #DDE3EA',
                      paddingTop: '0.75rem',
                      marginBottom: '1.25rem',
                      marginTop: 'auto',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#1F2933', marginBottom: '0.35rem' }}>
                      <strong>Fee:</strong> {formatCurrency(service.fee)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#616E7C' }}>
                      <strong>Processing Time:</strong> {service.estimatedProcessingDays} business day(s)
                    </div>
                  </div>
                </div>

                <Link to={`/services/${service.id}/apply`} style={{ marginTop: 'auto' }}>
                  <Button variant="primary" style={{ width: '100%' }}>
                    Apply Online <ArrowRight size={16} />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Office & Contact Info */}
      <section>
        <Card style={{ backgroundColor: '#ffffff', border: '1px solid #DDE3EA' }}>
          <div className="grid-2">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Building size={22} color="#1E4E8C" />
                <h3 style={{ fontSize: '1.25rem', color: '#1F2933' }}>Office Appearance Guidelines</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#1F2933', lineHeight: 1.6, marginBottom: '1rem' }}>
                Residents with confirmed appointment slots should arrive 10 minutes before their scheduled time at the
                Barangay Hall. Please bring the original copies of all uploaded documents for physical inspection.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#616E7C' }}>
                <div>• Valid Government-issued Photo ID (original)</div>
                <div>• Proof of Residence / Utility Bill if requested</div>
                <div>• Exact fee amount in cash</div>
              </div>
            </div>

            <div
              className="appearance-info-panel"
              style={{ borderLeft: '1px solid #DDE3EA', paddingLeft: '1.5rem' }}
            >
              <h4 style={{ fontSize: '1.1rem', color: '#1F2933', marginBottom: '0.75rem' }}>
                Barangay Cansojong Hall
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#616E7C', marginBottom: '0.5rem' }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '4px', color: '#F2B600' }} />
                {BARANGAY_INFO.fullLocation}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#616E7C', marginBottom: '0.5rem' }}>
                <Clock size={16} style={{ display: 'inline', marginRight: '4px', color: '#F2B600' }} />
                {BARANGAY_INFO.officeHours}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#616E7C' }}>
                <strong>Hotline:</strong> {BARANGAY_INFO.contactPhone}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </Layout>
  );
};
