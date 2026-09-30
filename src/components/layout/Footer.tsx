import React from 'react';
import { BARANGAY_INFO } from '../../utils/constants';
import { ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0F2A4A',
        color: '#DDE3EA',
        padding: '3rem 1.5rem 1.5rem',
        borderTop: '4px solid #F2B600',
        fontSize: '0.875rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1E4E8C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontFamily: "'Playfair Display', serif" }}>
                Barangay Cansojong
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#F2B600', fontWeight: 600 }}>Talisay City, Cebu</p>
            </div>
          </div>
          <p style={{ lineHeight: 1.6, color: '#DDE3EA', fontSize: '0.85rem' }}>
            Official electronic services portal for online pre-application, requirement verification,
            and scheduled appointments for clearances and community certifications.
          </p>
        </div>

        {/* Col 2: Contact Info */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Barangay Hall Office
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: '#F2B600', flexShrink: 0, marginTop: '2px' }} />
              <span>{BARANGAY_INFO.fullLocation}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={18} style={{ color: '#F2B600', flexShrink: 0 }} />
              <span>{BARANGAY_INFO.contactPhone}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} style={{ color: '#F2B600', flexShrink: 0 }} />
              <span>{BARANGAY_INFO.contactEmail}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: '#F2B600', flexShrink: 0 }} />
              <span>{BARANGAY_INFO.officeHours}</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Quick Links */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <li>
              <Link to="/services" style={{ color: '#DDE3EA', transition: 'color 0.2s' }}>
                • Services & Document Requirements
              </Link>
            </li>
            <li>
              <Link to="/track" style={{ color: '#DDE3EA', transition: 'color 0.2s' }}>
                • Track Application by Reference
              </Link>
            </li>
            <li>
              <Link to="/verify" style={{ color: '#DDE3EA', transition: 'color 0.2s' }}>
                • Verify Document Validity
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: '#DDE3EA', transition: 'color 0.2s' }}>
                • Resident Login
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ color: '#F2B600', fontWeight: 600 }}>
                • Register Resident Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Note */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Important Reminder
          </h4>
          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              color: '#DDE3EA',
            }}
          >
            Original supporting documents and identity verification are conducted in-person at the Barangay Hall during your confirmed appointment slot.
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#8A94A0',
        }}
      >
        © 2026 Barangay Cansojong, Talisay City, Cebu. All Rights Reserved. Barangay e-Services Monolith System.
      </div>
    </footer>
  );
};
