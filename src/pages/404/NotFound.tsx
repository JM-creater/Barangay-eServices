import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <AlertCircle size={64} color="#dc2626" style={{ margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.75rem' }}>404 - Page Not Found</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            <ArrowLeft size={18} /> Return to Home Portal
          </Button>
        </Link>
      </div>
    </Layout>
  );
};
